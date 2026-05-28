import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const handle = req.nextUrl.searchParams.get('handle') || 'davidgoggins';

  // Test the paid endpoint - will return 402 if not paid, or real data if it works
  const res = await fetch(
    `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${handle}&limit=12`,
    { headers: { 'x-api-key': scKey || '' }, signal: AbortSignal.timeout(12000) }
  );

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text.slice(0, 300); }

  return NextResponse.json({
    status: res.status,
    message: res.status === 402 ? 'PAID ENDPOINT - needs $47 plan' : 
             res.status === 200 ? 'WORKS - free tier has access' : `Status: ${res.status}`,
    hasNextPage: data?.next_cursor || data?.pagination?.next_cursor || null,
    postCount: Array.isArray(data?.posts) ? data.posts.length : 0,
    topLikes: Array.isArray(data?.posts) ? Math.max(...data.posts.map((p: any) => p.like_count || 0)) : 0,
    sample: data?.posts?.[0] ? {
      likes: data.posts[0].like_count,
      views: data.posts[0].play_count,
      url: data.posts[0].url,
      caption: data.posts[0].caption?.slice(0, 60),
    } : data,
  });
}
