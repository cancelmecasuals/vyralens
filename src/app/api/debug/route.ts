import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const handle = req.nextUrl.searchParams.get('handle') || 'the.holistic.psychologist';

  const res = await fetch(
    `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${handle}&limit=5`,
    { headers: { 'x-api-key': scKey || '' }, signal: AbortSignal.timeout(12000) }
  );

  const data = await res.json();
  
  // Show ALL keys of first post and look for URL/shortcode fields
  const posts = data?.posts || data?.data || data?.items || (Array.isArray(data) ? data : []);
  const firstPost = posts[0] || {};
  
  return NextResponse.json({
    status: res.status,
    topLevelKeys: Object.keys(data || {}),
    postCount: posts.length,
    firstPostAllKeys: Object.keys(firstPost),
    // Look for any key that might have URL or shortcode
    urlRelatedFields: Object.entries(firstPost)
      .filter(([k, v]) => k.toLowerCase().includes('url') || k.toLowerCase().includes('code') || k.toLowerCase().includes('link') || k.toLowerCase().includes('short') || k.toLowerCase().includes('permalink'))
      .reduce((acc: any, [k, v]) => { acc[k] = v; return acc; }, {}),
    firstPostSample: JSON.stringify(firstPost).slice(0, 500),
  });
}
