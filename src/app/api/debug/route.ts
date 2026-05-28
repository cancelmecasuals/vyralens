import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  const username = req.nextUrl.searchParams.get('username') || 'gabybernstein';

  try {
    const url = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apifyKey}&timeout=60&memory=512&maxItems=5`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [username],
        resultsType: 'posts',
        resultsLimit: 5,
      }),
      signal: AbortSignal.timeout(65000),
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }
    return NextResponse.json({
      status: res.status,
      itemCount: Array.isArray(data) ? data.length : 0,
      firstItem: Array.isArray(data) && data[0] ? {
        likesCount: data[0].likesCount,
        type: data[0].type,
        ownerUsername: data[0].ownerUsername,
        shortCode: data[0].shortCode,
        hasCaption: !!data[0].caption,
      } : data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
