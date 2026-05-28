import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  if (!apifyKey) return NextResponse.json({ error: 'No Apify key' });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'realestate';
  const actor = req.nextUrl.searchParams.get('actor') || 'apify~instagram-hashtag-scraper';

  const inputMap: Record<string, any> = {
    'apify~instagram-hashtag-scraper': { hashtags: [keyword], resultsLimit: 5 },
    'apify~instagram-scraper': { hashtags: [keyword], resultsType: 'posts', resultsLimit: 5 },
    'apify~instagram-reel-scraper': { hashtags: [keyword], resultsLimit: 5 },
    'shu8hvrXbJbY3Eb9W~instagram-reel-scraper': { hashtags: [keyword], resultsLimit: 5 },
  };

  const input = inputMap[actor] || { hashtags: [keyword], resultsLimit: 5 };

  try {
    const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${apifyKey}&timeout=60&memory=512&maxItems=5`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(65000),
    });

    const status = res.status;
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    return NextResponse.json({ actor, status, input, itemCount: Array.isArray(data) ? data.length : 0, sample: Array.isArray(data) ? data[0] : data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, actor });
  }
}
