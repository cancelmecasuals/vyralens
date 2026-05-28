import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rapidKey = process.env.RAPIDAPI_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  const endpoints = [
    `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/hashtag_section?tag=${tag}&section=top`,
    `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/hashtag_posts?tag=${tag}`,
    `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/hashtag?tag=${tag}`,
    `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/explore?tag=${tag}`,
  ];

  const results: any = {};
  for (const url of endpoints) {
    const endpoint = url.split('.com/')[1].split('?')[0];
    try {
      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': rapidKey || '',
          'x-rapidapi-host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com',
        },
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      results[endpoint] = { status: res.status, sample: text.slice(0, 200) };
    } catch (e: any) {
      results[endpoint] = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
