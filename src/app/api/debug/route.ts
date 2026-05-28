import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const actor = req.nextUrl.searchParams.get('actor') || 'instaprism~instagram-hashtag-scraper';

  const inputs: Record<string, any> = {
    'instaprism~instagram-hashtag-scraper': {
      hashtags: [keyword],
      resultsLimit: 100,
      sortBy: 'top',
    },
    'apify~instagram-hashtag-analytics-scraper': {
      hashtags: [keyword],
      maxResults: 100,
      sortOrder: 'top',
    },
    'parseforge~instagram-hashtag-analytics-scraper': {
      hashtag: keyword,
      maxPosts: 100,
    },
  };

  const input = inputs[actor] || inputs['instaprism~instagram-hashtag-scraper'];

  try {
    const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${apifyKey}&timeout=90&memory=512&maxItems=100`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(95000),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }

    const items = Array.isArray(data) ? data : [];
    const sorted = items
      .filter((i: any) => (i.likesCount || i.likes || i.like_count || 0) > 0)
      .sort((a: any, b: any) => {
        const aL = a.likesCount || a.likes || a.like_count || 0;
        const bL = b.likesCount || b.likes || b.like_count || 0;
        return bL - aL;
      });

    const maxLikes = sorted[0] ? (sorted[0].likesCount || sorted[0].likes || sorted[0].like_count || 0) : 0;

    return NextResponse.json({
      actor, status: res.status,
      totalItems: items.length,
      itemsWithLikes: sorted.length,
      maxLikes,
      sampleKeys: items[0] ? Object.keys(items[0]).slice(0, 15) : [],
      top5: sorted.slice(0, 5).map((i: any) => ({
        likes: i.likesCount || i.likes || i.like_count,
        url: i.url || i.postUrl || i.shortCode,
        caption: (i.caption || i.text || '').slice(0, 60),
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, actor });
  }
}
