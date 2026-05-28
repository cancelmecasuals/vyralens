import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  
  // Check credits remaining
  const ttRes = await fetch(
    `https://api.scrapecreators.com/v1/tiktok/search/top?query=fitness&sort_by=most-liked&publish_time=all-time`,
    { headers: { 'x-api-key': scKey || '' }, signal: AbortSignal.timeout(10000) }
  );
  const ttData = await ttRes.json();
  
  const rdRes = await fetch(
    `https://api.scrapecreators.com/v1/reddit/subreddit/search?subreddit=all&query=fitness&sort=top&time=all`,
    { headers: { 'x-api-key': scKey || '' }, signal: AbortSignal.timeout(10000) }
  );
  const rdData = await rdRes.json();

  return NextResponse.json({
    tiktok: { status: ttRes.status, credits: ttData?.credits_remaining, items: ttData?.items?.length || 0, error: ttData?.message || ttData?.error },
    reddit: { status: rdRes.status, credits: rdData?.credits_remaining, posts: rdData?.posts?.length || 0, error: rdData?.message || rdData?.error },
  });
}
