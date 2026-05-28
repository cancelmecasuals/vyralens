import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  const username = req.nextUrl.searchParams.get('username') || 'gabybernstein';

  // Test multiple Apify actors for username-based post fetching
  const actors = [
    { id: 'apify~instagram-scraper', input: { usernames: [username], resultsType: 'posts', resultsLimit: 5 } },
    { id: 'apify~instagram-profile-scraper', input: { usernames: [username] } },
    { id: 'apify~instagram-post-scraper', input: { directUrls: [`https://www.instagram.com/${username}/`], resultsLimit: 5 } },
  ];

  const results: any = {};
  for (const actor of actors) {
    try {
      const url = `https://api.apify.com/v2/acts/${actor.id}/run-sync-get-dataset-items?token=${apifyKey}&timeout=55&memory=512&maxItems=5`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actor.input),
        signal: AbortSignal.timeout(60000),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = text.slice(0, 300); }
      results[actor.id] = {
        status: res.status,
        count: Array.isArray(data) ? data.length : 0,
        sample: Array.isArray(data) ? (data[0] ? { keys: Object.keys(data[0]).slice(0, 8), likesCount: data[0].likesCount, type: data[0].type, error: data[0].error } : 'empty array') : data,
      };
    } catch (e: any) {
      results[actor.id] = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
