import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const handle = req.nextUrl.searchParams.get('handle') || 'gabybernstein';

  const res = await fetch(
    `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${handle}&limit=12`,
    { headers: { 'x-api-key': scKey || '' }, signal: AbortSignal.timeout(12000) }
  );

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }

  return NextResponse.json({
    status: res.status,
    topLevelKeys: typeof data === 'object' ? Object.keys(data || {}) : [],
    isArray: Array.isArray(data),
    count: Array.isArray(data) ? data.length : (data?.posts?.length || data?.data?.length || 0),
    sample: Array.isArray(data) ? data[0] : (data?.posts?.[0] || data?.data?.[0] || data),
    rawSlice: JSON.stringify(data).slice(0, 600),
  });
}
