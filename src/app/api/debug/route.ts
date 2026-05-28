import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';

  try {
    const url = `https://api.apify.com/v2/acts/leadsbrary~instagram-hashtag-stats/run-sync-get-dataset-items?token=${apifyKey}&timeout=60&memory=512`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hashtags: [keyword],
        resultsType: 'top',
        resultsLimit: 50,
      }),
      signal: AbortSignal.timeout(65000),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }

    const items = Array.isArray(data) ? data : [];
    const maxLikes = items.reduce((max: number, item: any) => Math.max(max, item.likesCount || 0), 0);

    return NextResponse.json({
      status: res.status,
      itemCount: items.length,
      maxLikes,
      top5: items
        .sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0))
        .slice(0, 5)
        .map((i: any) => ({ likes: i.likesCount, url: i.url, caption: i.caption?.slice(0, 80) })),
      sample: items[0] ? Object.keys(items[0]) : data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
