import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';

  // Step 1: Get URLs from Apify hashtag stats (no login needed)
  const apifyRes = await fetch(
    `https://api.apify.com/v2/acts/leadsbrary~instagram-hashtag-stats/run-sync-get-dataset-items?token=${apifyKey}&timeout=60&memory=512`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashtags: [keyword], resultsType: 'top', resultsLimit: 50 }),
      signal: AbortSignal.timeout(65000),
    }
  );
  const apifyData = await apifyRes.json();
  const items = Array.isArray(apifyData) ? apifyData : [];
  const topPosts = items[0]?.topPosts || [];
  const urls = topPosts.map((p: any) => p.url).filter(Boolean);

  if (!urls.length) return NextResponse.json({ error: 'No URLs from Apify', apifyData });

  // Step 2: Enrich with Bright Data to get likes
  const bdUrls = urls.map((url: string) => ({ url }));
  const bdRes = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lk5ns7kz21pck8jpis&format=json`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${bdToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(bdUrls),
      signal: AbortSignal.timeout(55000),
    }
  );
  const posts = await bdRes.json();
  const sorted = Array.isArray(posts)
    ? posts.sort((a: any, b: any) => (b.likes || b.num_likes || 0) - (a.likes || a.num_likes || 0))
    : [];

  return NextResponse.json({
    urlsFromApify: urls.length,
    bdPostsReturned: sorted.length,
    maxLikes: sorted[0]?.likes || sorted[0]?.num_likes || 0,
    top5: sorted.slice(0, 5).map((p: any) => ({
      likes: p.likes || p.num_likes,
      username: p.user_posted,
      url: p.url,
      date: p.date_posted,
    })),
  });
}
