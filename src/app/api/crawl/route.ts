import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();

  if (!apifyKey || !bdToken) return NextResponse.json({ error: 'Missing API keys' });

  // Step 1: Get top post URLs from Apify (no login, stealth browser)
  const apifyRes = await fetch(
    `https://api.apify.com/v2/acts/leadsbrary~instagram-hashtag-stats/run-sync-get-dataset-items?token=${apifyKey}&timeout=90&memory=512`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashtags: [tag], resultsType: 'top', resultsLimit: 50 }),
      signal: AbortSignal.timeout(95000),
    }
  );

  if (!apifyRes.ok) return NextResponse.json({ error: `Apify error: ${apifyRes.status}` });

  const apifyData = await apifyRes.json();
  const items = Array.isArray(apifyData) ? apifyData : [];
  const topPosts = items[0]?.topPosts || [];
  const urls = topPosts.map((p: any) => p.url).filter(Boolean);

  if (!urls.length) return NextResponse.json({ error: 'No URLs from Apify', keyword });

  // Step 2: Enrich with Bright Data to get full data including likes
  const bdUrls = urls.map((url: string) => ({ url }));
  const bdRes = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lk5ns7kz21pck8jpis&format=json`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${bdToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(bdUrls),
      signal: AbortSignal.timeout(55000),
    }
  );

  if (!bdRes.ok) return NextResponse.json({ error: `BD error: ${bdRes.status}`, urlsFound: urls.length });

  const posts = await bdRes.json();
  if (!Array.isArray(posts) || !posts.length) return NextResponse.json({ error: 'No BD posts', urlsFound: urls.length });

  const sorted = posts
    .filter((p: any) => (p.likes || p.num_likes || 0) > 0)
    .sort((a: any, b: any) => (b.likes || b.num_likes || 0) - (a.likes || a.num_likes || 0));

  // Step 3: Store in Supabase
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
      id: post.post_id || shortcode || `bd-${saved}`,
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
    keyword, urlsFromApify: urls.length,
    bdPostsReturned: posts.length, saved,
    topLikes: sorted[0]?.likes || sorted[0]?.num_likes || 0,
    top5: sorted.slice(0, 5).map((p: any) => ({
      likes: p.likes || p.num_likes,
      username: p.user_posted,
      url: p.url,
    })),
  });
}
