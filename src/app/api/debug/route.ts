import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  if (!apifyKey) return NextResponse.json({ error: 'No Apify key' });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const hashtag = keyword.replace(/\s+/g, '').toLowerCase();

  const tests = [
    {
      name: 'instagram-scraper-posts',
      actor: 'apify~instagram-scraper',
      input: { hashtags: [hashtag], resultsType: 'posts', resultsLimit: 3 },
    },
    {
      name: 'instagram-scraper-reels',
      actor: 'apify~instagram-scraper',
      input: { hashtags: [hashtag], resultsType: 'reels', resultsLimit: 3 },
    },
    {
      name: 'instagram-hashtag-scraper',
      actor: 'apify~instagram-hashtag-scraper',
      input: { hashtags: [hashtag], resultsLimit: 3 },
    },
  ];

  const results: any = {};

  for (const test of tests) {
    try {
      const url = `https://api.apify.com/v2/acts/${test.actor}/run-sync-get-dataset-items?token=${apifyKey}&timeout=60&memory=512&maxItems=3`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.input),
        signal: AbortSignal.timeout(65000),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      results[test.name] = {
        status: res.status,
        itemCount: Array.isArray(data) ? data.length : 0,
        raw: Array.isArray(data) ? data[0] : data,
      };
    } catch (err: any) {
      results[test.name] = { error: err.message };
    }
  }

  return NextResponse.json(results);
}
