import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Dataset IDs from Bright Data account
const BD_POSTS_ID = 'gd_lk5ns7kz21pck8jpis';
const BD_REELS_ID = 'gd_lyclm20il4r5helnj';

async function bdScrape(bdToken: string, datasetId: string, input: any[]) {
  // Try synchronous first
  const res = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${datasetId}&format=json`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${bdToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(60000),
    }
  );
  const text = await res.text();
  if (!res.ok) return { error: `${res.status}: ${text.slice(0, 300)}`, data: [] };
  try {
    const data = JSON.parse(text);
    return { data: Array.isArray(data) ? data : [data] };
  } catch {
    return { error: 'Parse error', raw: text.slice(0, 300), data: [] };
  }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  if (!bdToken) return NextResponse.json({ error: 'No Bright Data key' });

  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  // Use session cookie to get shortcodes of top posts first
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();

  let shortcodes: string[] = [];

  if (sessionId) {
    try {
      // Page 0: web_info (top + recent sections)
      const res = await fetch(`https://www.instagram.com/api/v1/tags/web_info/?tag_name=${tag}`, {
        headers: {
          'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
          'X-CSRFToken': csrfToken || '',
          'X-IG-App-ID': '936619743392459',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
        },
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        const sections = [...(data?.data?.top?.sections || []), ...(data?.data?.recent?.sections || [])];
        for (const s of sections) {
          for (const m of (s?.layout_content?.medias || [])) {
            const media = m?.media || m;
            const code = media?.code || media?.shortcode;
            if (code && !shortcodes.includes(code)) shortcodes.push(code);
          }
        }
      }

      // Pages 1-8: sections endpoint for more posts
      const headers = {
        'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
        'X-CSRFToken': csrfToken || '',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
      };
      for (let page = 1; page <= 8; page++) {
        try {
          const pageRes = await fetch(
            `https://www.instagram.com/api/v1/tags/${tag}/sections/?tab=top&page=${page}&surface=grid`,
            { headers, signal: AbortSignal.timeout(8000) }
          );
          if (!pageRes.ok) break;
          const pageData = await pageRes.json();
          const pageSections = pageData?.sections || [];
          if (!pageSections.length) break;
          for (const s of pageSections) {
            for (const m of (s?.layout_content?.medias || [])) {
              const media = m?.media || m;
              const code = media?.code || media?.shortcode;
              if (code && !shortcodes.includes(code)) shortcodes.push(code);
            }
          }
          await new Promise(r => setTimeout(r, 300));
        } catch { break; }
      }
    } catch { }
  }

  const results: any = { keyword, shortcodesFound: shortcodes.length };
  const allPosts: any[] = [];

  if (shortcodes.length > 0) {
    // Use Bright Data to enrich these posts with full data including likes
    const postUrls = shortcodes.slice(0, 50).map(code => ({
      url: `https://www.instagram.com/p/${code}/`
    }));

    const reelUrls = shortcodes.slice(0, 50).map(code => ({
      url: `https://www.instagram.com/reel/${code}/`
    }));

    // Try posts endpoint
    const postsResult = await bdScrape(bdToken, BD_POSTS_ID, postUrls);
    results.postsResult = { count: postsResult.data.length, error: postsResult.error };
    allPosts.push(...postsResult.data.filter((p: any) => p.likes || p.num_likes));

    // Try reels endpoint  
    const reelsResult = await bdScrape(bdToken, BD_REELS_ID, reelUrls);
    results.reelsResult = { count: reelsResult.data.length, error: reelsResult.error };
    allPosts.push(...reelsResult.data.filter((p: any) => p.likes || p.num_likes));
  }

  if (!allPosts.length) {
    return NextResponse.json({ ...results, error: 'No posts enriched', totalFetched: 0 });
  }

  // Sort by likes and store
  allPosts.sort((a, b) => {
    const aL = a.likes || a.num_likes || 0;
    const bL = b.likes || b.num_likes || 0;
    return bL - aL;
  });

  const { supabaseAdmin } = await import('@/lib/supabase');
  const sb = supabaseAdmin();
  let saved = 0;

  for (const post of allPosts.slice(0, 200)) {
    const likes = post.likes || post.num_likes || 0;
    const comments = post.num_comments || post.comments || 0;
    const views = post.video_view_count || post.video_play_count || post.views || 0;
    const rawScore = views > 0 ? views : likes * 15;
    const isVideo = post.content_type === 'video' || !!post.video_url;
    const caption = post.description || post.caption || '';
    const postUrl = post.url || null;
    const shortcode = postUrl?.split('/p/')?.[1]?.split('/')?.[0] || postUrl?.split('/reel/')?.[1]?.split('/')?.[0] || post.post_id || '';

    if (!likes) continue;

    await sb.from('instagram_posts').upsert({
      id: post.post_id || shortcode || `bd-${saved}`,
      keyword: tag, platform: 'Instagram',
      hook: caption.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
      caption, username: post.user_posted || post.username || '',
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
    ...results,
    totalEnriched: allPosts.length,
    saved,
    topLikes: allPosts[0]?.likes || allPosts[0]?.num_likes || 0,
    sampleFields: allPosts[0] ? Object.keys(allPosts[0]).slice(0, 15) : [],
    top5: allPosts.slice(0, 5).map((p: any) => ({
      likes: p.likes || p.num_likes,
      username: p.user_posted,
      url: p.url,
    })),
  });
}
