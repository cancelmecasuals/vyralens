import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();

  if (!scKey || !bdToken) return NextResponse.json({ error: 'Missing API keys' });

  const allUrls: string[] = [];
  const seen = new Set<string>();

  // Source 1: ScrapeCreators Google-based keyword search (finds most viral relevant content)
  try {
    const scRes = await fetch(
      `https://api.scrapecreators.com/v2/instagram/reels/search?query=${encodeURIComponent(keyword)}`,
      { headers: { 'x-api-key': scKey }, signal: AbortSignal.timeout(12000) }
    );
    if (scRes.ok) {
      const scData = await scRes.json();
      const reels = scData?.reels || [];
      for (const r of reels) {
        if (r.url && !seen.has(r.url)) { seen.add(r.url); allUrls.push(r.url); }
      }
    }
  } catch { }

  // Source 2: Session cookie hashtag search (additional posts)
  if (sessionId) {
    const igHeaders: Record<string, string> = {
      'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
      'X-CSRFToken': csrfToken || '',
      'X-IG-App-ID': '936619743392459',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
    };
    try {
      const res = await fetch(`https://www.instagram.com/api/v1/tags/web_info/?tag_name=${tag}`, {
        headers: igHeaders, signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        const data = await res.json();
        const sections = [...(data?.data?.top?.sections || []), ...(data?.data?.recent?.sections || [])];
        for (const s of sections) {
          for (const m of (s?.layout_content?.medias || [])) {
            const media = m?.media || m;
            const code = media?.code;
            if (code) {
              const isVideo = media?.media_type === 2;
              const url = isVideo ? `https://www.instagram.com/reel/${code}/` : `https://www.instagram.com/p/${code}/`;
              if (!seen.has(url)) { seen.add(url); allUrls.push(url); }
            }
          }
        }
      }
    } catch { }
  }

  if (!allUrls.length) return NextResponse.json({ error: 'No URLs found', keyword });

  // Enrich ALL URLs with Bright Data
  const bdUrls = allUrls.slice(0, 50).map(url => ({ url }));
  const bdRes = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lk5ns7kz21pck8jpis&format=json`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${bdToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(bdUrls),
      signal: AbortSignal.timeout(55000),
    }
  );

  if (!bdRes.ok) return NextResponse.json({ error: `BD error: ${bdRes.status}`, urlsFound: allUrls.length });
  const posts = await bdRes.json();
  if (!Array.isArray(posts) || !posts.length) return NextResponse.json({ error: 'No BD posts', urlsFound: allUrls.length });

  const sorted = posts
    .filter((p: any) => (p.likes || p.num_likes || 0) > 0)
    .sort((a: any, b: any) => (b.likes || b.num_likes || 0) - (a.likes || a.num_likes || 0));

  const { supabaseAdmin } = await import('@/lib/supabase');
  const sb = supabaseAdmin();
  let saved = 0;

  for (const post of sorted) {
    const likes = post.likes || post.num_likes || 0;
    const comments = post.num_comments || post.comments || 0;
    const views = post.video_view_count || post.video_play_count || post.views || 0;
    const rawScore = views > 0 ? views : likes * 15;
    const isVideo = post.content_type === 'video' || !!post.video_url;
    const caption = post.description || post.caption || '';
    const postUrl = post.url || null;
    const shortcode = post.shortcode || postUrl?.split('/reel/')?.[1]?.split('/')?.[0] || postUrl?.split('/p/')?.[1]?.split('/')?.[0] || '';

    await sb.from('instagram_posts').upsert({
      id: shortcode || `bd-${saved}`,
      keyword: tag, platform: 'Instagram',
      hook: caption.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
      caption, username: post.user_posted || '',
      full_name: post.user_posted || '',
      like_count: likes, comment_count: comments, view_count: views,
      raw_score: rawScore, media_type: isVideo ? 'video' : 'image',
      shortcode, post_url: postUrl,
      thumbnail: post.thumbnail || post.display_url || '',
      taken_at: post.date_posted ? new Date(post.date_posted).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    saved++;
  }

  return NextResponse.json({
    keyword, urlsFound: allUrls.length,
    bdPostsReturned: posts.length, saved,
    topLikes: sorted[0]?.likes || sorted[0]?.num_likes || 0,
    top5: sorted.slice(0, 5).map((p: any) => ({
      likes: p.likes || p.num_likes,
      username: p.user_posted,
      url: p.url,
      caption: p.description?.slice(0, 60),
    })),
  });
}
