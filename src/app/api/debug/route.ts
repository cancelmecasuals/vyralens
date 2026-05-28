import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';

  try {
    const res = await fetch(
      `https://api.scrapecreators.com/v1/instagram/reels/search?query=${encodeURIComponent(keyword)}`,
      {
        headers: { 'x-api-key': scKey || '' },
        signal: AbortSignal.timeout(12000),
      }
    );

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }

    return NextResponse.json({
      status: res.status,
      topLevelKeys: typeof data === 'object' ? Object.keys(data || {}) : [],
      raw: typeof data === 'string' ? data : JSON.stringify(data).slice(0, 800),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
