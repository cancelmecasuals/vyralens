import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  if (!bdToken) return NextResponse.json({ error: 'No BD key' });

  // List all available dataset IDs on this account
  const res = await fetch('https://api.brightdata.com/datasets/list', {
    headers: { 'Authorization': `Bearer ${bdToken}` },
    signal: AbortSignal.timeout(10000),
  });

  const data = await res.json();
  
  // Filter to Instagram-related ones
  const igDatasets = Array.isArray(data) 
    ? data.filter((d: any) => d.name?.toLowerCase().includes('instagram'))
    : data;

  return NextResponse.json({ status: res.status, igDatasets, total: Array.isArray(data) ? data.length : 0 });
}
