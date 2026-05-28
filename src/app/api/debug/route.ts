import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const actor = req.nextUrl.searchParams.get('actor') || 'breathtaking_anthem~instagram-hashtag-posts-scraper';

  const inputMap: Record<string, any> = {
    'breathtaking_anthem~instagram-hashtag-posts-scraper': {
      hashtag: keyword,
      resultsLimit: 100,
      sortBy: 'top',
    },
    'scrapeengine~instagram-hashtag-scraper': {
      startUrls: [`https://www.instagram.com/explore/tags/${keyword}/`],
      maxItems: 50,
    },
    'apify~instagram-hashtag-scraper': {
      hashtags: [keyword],
      resultsLimit: 100,
    },
    'zuzka~instagram-hashtag-scraper': {
      hashtags: [keyword],
      maxResults: 100,
      sortBy: 'top',
    },
    'lhotse~instagram-hashtag-scraper': {
      hashtags: [keyword],
      limit: 100,
      type: 'top',
    },
  };

  const input = inputMap[actor] || inputMap['breathtaking_anthem~instagram-hashtag-posts-scraper'];

  try {
    const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${apifyKey}&timeout=90&memory=512&maxItems=50`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(95000),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text.slice(0, 300); }

    const items = Array.isArray(data) ? data : (data?.items || data?.posts || []);
    const withLikes = items.filter((i: any) => (i.likesCount || i.likes || i.diggCount || i.like_count || 0) > 0);
    const sorted = withLikes.sort((a: any, b: any) => {
      const aL = a.likesCount || a.likes || a.like_count || 0;
      const bL = b.likesCount || b.likes || b.like_count || 0;
      return bL - aL;
    });

    return NextResponse.json({
      actor, status: res.status,
      totalItems: items.length,
      itemsWithLikes: withLikes.length,
      maxLikes: sorted[0] ? (sorted[0].likesCount || sorted[0].likes || sorted[0].like_count || 0) : 0,
      sampleKeys: items[0] ? Object.keys(items[0]).slice(0, 20) : [],
      top5: sorted.slice(0, 5).map((i: any) => ({
        likes: i.likesCount || i.likes || i.like_count,
        views: i.videoViewCount || i.playCount || i.videoPlayCount || i.views,
        url: i.url || i.postUrl || i.shortCode,
        caption: (i.caption || i.text || i.description || '').slice(0, 80),
        hashtags: (i.hashtags || []).slice(0, 5),
      })),
      rawSample: typeof data === 'object' ? JSON.stringify(data).slice(0, 400) : data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, actor });
  }
}
