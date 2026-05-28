import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const platform = req.nextUrl.searchParams.get('platform') || 'tiktok';

  if (!scKey) return NextResponse.json({ error: 'No ScrapeCreators key', hasKey: false });

  const urls: Record<string, string> = {
    tiktok: `https://api.scrapecreators.com/v1/tiktok/search/top?query=${encodeURIComponent(keyword)}&sort_by=most-liked&publish_time=all-time`,
    x: `https://api.scrapecreators.com/v1/twitter/search?query=${encodeURIComponent(keyword)}&type=Top`,
    reddit: `https://api.scrapecreators.com/v1/reddit/subreddit/search?subreddit=all&query=${encodeURIComponent(keyword)}&sort=top&time=all`,
  };

  const url = urls[platform];
  if (!url) return NextResponse.json({ error: 'Unknown platform' });

  try {
    const res = await fetch(url, {
      headers: { 'x-api-key': scKey },
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }

    return NextResponse.json({
      platform, status: res.status,
      hasKey: true,
      keyLength: scKey.length,
      topLevelKeys: typeof data === 'object' ? Object.keys(data || {}) : [],
      itemCount: data?.items?.length || data?.tweets?.length || data?.posts?.length || data?.data?.length || 0,
      sample: typeof data === 'object' ? JSON.stringify(data).slice(0, 600) : data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, platform });
  }
}
