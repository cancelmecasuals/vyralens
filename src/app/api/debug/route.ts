import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  if (!apifyKey) return NextResponse.json({ error: 'No Apify key' });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const hashtag = keyword.replace(/\s+/g, '').toLowerCase();

  try {
    const url = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apifyKey}&timeout=90&memory=512&maxItems=5`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hashtags: [hashtag],
        resultsType: 'posts',
        resultsLimit: 5,
      }),
      signal: AbortSignal.timeout(95000),
    });

    const status = res.status;
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    return NextResponse.json({
      status,
      itemCount: Array.isArray(data) ? data.length : 0,
      fields: Array.isArray(data) && data[0] ? Object.keys(data[0]) : [],
      sample: Array.isArray(data) ? data.slice(0, 2).map((item: any) => ({
        type: item.type,
        likesCount: item.likesCount,
        videoViewCount: item.videoViewCount,
        commentsCount: item.commentsCount,
        ownerUsername: item.ownerUsername,
        caption: item.caption?.slice(0, 100),
        hasVideoUrl: !!item.videoUrl,
        hasDisplayUrl: !!item.displayUrl,
        timestamp: item.timestamp,
      })) : data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
