import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const apifyKey = process.env.APIFY_API_KEY?.trim();

  if (!apifyKey) return NextResponse.json({ error: 'Missing Apify key' });

  // Use parseforge actor — returns posts with 18M+ likes, no login needed
  const apifyRes = await fetch(
    `https://api.apify.com/v2/acts/parseforge~instagram-hashtag-analytics-scraper/run-sync-get-dataset-items?token=${apifyKey}&timeout=90&memory=512`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashtag: tag, maxPosts: 100 }),
      signal: AbortSignal.timeout(95000),
    }
  );

  if (!apifyRes.ok) return NextResponse.json({ error: `Apify error: ${apifyRes.status}` });

  const apifyData = await apifyRes.json();
  const items = Array.isArray(apifyData) ? apifyData : [];
  const firstItem = items[0] || {};
  const topPosts = firstItem.topPosts || [];

  if (!topPosts.length) return NextResponse.json({ error: 'No posts returned', keyword });

  const sorted = topPosts
    .filter((p: any) => (p.likeCount || 0) > 0)
    .sort((a: any, b: any) => (b.likeCount || 0) - (a.likeCount || 0));

  // Store in Supabase
  const { supabaseAdmin } = await import('@/lib/supabase');
  const sb = supabaseAdmin();
  let saved = 0;

  for (const post of sorted) {
    const likes = post.likeCount || 0;
    const comments = post.commentCount || 0;
    const views = post.viewCount || 0;
    const rawScore = views > 0 ? views : likes * 15;
    const isVideo = post.mediaType === 'video' || post.mediaType === 'reel';
    const caption = post.caption || '';
    const postUrl = post.postUrl || null;
    const shortcode = post.shortcode || postUrl?.split('/p/')?.[1]?.split('/')?.[0] || postUrl?.split('/reel/')?.[1]?.split('/')?.[0] || '';

    await sb.from('instagram_posts').upsert({
      id: shortcode || `pf-${saved}`,
      keyword: tag, platform: 'Instagram',
      hook: caption.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
      caption, username: post.username || '',
      full_name: post.username || '',
      like_count: likes, comment_count: comments, view_count: views,
      raw_score: rawScore, media_type: isVideo ? 'video' : 'image',
      shortcode, post_url: postUrl,
      thumbnail: post.thumbnailUrl || '',
      taken_at: post.timestamp ? new Date(post.timestamp).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    saved++;
  }

  return NextResponse.json({
    keyword, topPostsFound: topPosts.length, saved,
    topLikes: sorted[0]?.likeCount || 0,
    top5: sorted.slice(0, 5).map((p: any) => ({
      likes: p.likeCount,
      views: p.viewCount,
      username: p.username,
      url: p.postUrl,
    })),
  });
}
