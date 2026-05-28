import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  const snapshotId = req.nextUrl.searchParams.get('snapshot') || 'sd_mppdhhrezc96q3es6';

  if (!bdToken) return NextResponse.json({ error: 'No BD key' });

  try {
    const res = await fetch(
      `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`,
      { headers: { 'Authorization': `Bearer ${bdToken}` }, signal: AbortSignal.timeout(15000) }
    );
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text.slice(0, 1000); }

    return NextResponse.json({
      status: res.status,
      isArray: Array.isArray(data),
      count: Array.isArray(data) ? data.length : 0,
      firstItemKeys: Array.isArray(data) && data[0] ? Object.keys(data[0]) : [],
      firstItem: Array.isArray(data) && data[0] ? data[0] : data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
