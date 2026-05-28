import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';

  const res = await fetch(
    `https://api.apify.com/v2/acts/parseforge~instagram-hashtag-analytics-scraper/run-sync-get-dataset-items?token=${apifyKey}&timeout=90&memory=512`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashtag: keyword, maxPosts: 50 }),
      signal: AbortSignal.timeout(95000),
    }
  );

  const data = await res.json();
  const items = Array.isArray(data) ? data : [];
  const firstItem = items[0] || {};
  const topPosts = firstItem.topPosts || [];

  return NextResponse.json({
    totalItems: items.length,
    topPostsCount: topPosts.length,
    hashtagName: firstItem.hashtagName,
    totalPosts: firstItem.totalPosts,
    avgLikes: firstItem.avgLikes,
    maxLikes: firstItem.maxLikes,
    allPosts: topPosts.map((p: any) => ({
      likes: p.likeCount,
      views: p.viewCount,
      username: p.username,
      url: p.postUrl,
      caption: p.caption?.slice(0, 100),
      hashtags: p.hashtags?.slice(0, 5),
      timestamp: p.timestamp,
    })),
  });
}
