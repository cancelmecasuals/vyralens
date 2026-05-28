import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  if (!bdToken) return NextResponse.json({ error: 'No BD key' });

  // Check the older shortcodes specifically
  const oldCodes = ['DRtK9ubErl0', 'DRzv9K-jSOC', 'DUbegHbkow2', 'DTtyQaUEvZ9', 'DWKi1Y8gjLf', 'DWzLUZCDkgs', 'DWtHahCjBeG'];
  const bdUrls = oldCodes.map(code => ({ url: `https://www.instagram.com/p/${code}/` }));

  const res = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lk5ns7kz21pck8jpis&format=json`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${bdToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(bdUrls),
      signal: AbortSignal.timeout(55000),
    }
  );

  const posts = await res.json();
  return NextResponse.json({
    count: Array.isArray(posts) ? posts.length : 0,
    posts: Array.isArray(posts) ? posts.map((p: any) => ({
      shortcode: p.shortcode,
      likes: p.likes || p.num_likes,
      username: p.user_posted,
      date: p.date_posted,
      url: p.url,
    })) : posts,
  });
}
