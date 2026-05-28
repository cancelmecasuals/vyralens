import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';

  // ScrapeCreators Instagram Reels keyword search via Google
  const res = await fetch(
    `https://api.scrapecreators.com/v1/instagram/reels/search?query=${encodeURIComponent(keyword)}`,
    {
      headers: { 'x-api-key': scKey || '' },
      signal: AbortSignal.timeout(15000),
    }
  );

  const data = await res.json();
  const reels = data?.reels || data?.data || data?.results || data?.items || [];

  // Now enrich with Bright Data to get real like counts
  let enriched: any[] = [];
  if (Array.isArray(reels) && reels.length > 0 && bdToken) {
    const urls = reels
      .map((r: any) => r.url || r.postUrl || r.link)
      .filter(Boolean)
      .slice(0, 20)
      .map((url: string) => ({ url }));

    if (urls.length > 0) {
      const bdRes = await fetch(
        `https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lk5ns7kz21pck8jpis&format=json`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${bdToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(urls),
          signal: AbortSignal.timeout(55000),
        }
      );
      if (bdRes.ok) {
        const bdPosts = await bdRes.json();
        enriched = Array.isArray(bdPosts) ? bdPosts
          .sort((a: any, b: any) => (b.likes || b.num_likes || 0) - (a.likes || a.num_likes || 0))
          .map((p: any) => ({
            likes: p.likes || p.num_likes,
            views: p.video_view_count || p.views,
            username: p.user_posted,
            url: p.url,
            caption: p.description?.slice(0, 80),
          })) : [];
      }
    }
  }

  return NextResponse.json({
    status: res.status,
    rawKeys: Object.keys(data || {}),
    reelsFound: Array.isArray(reels) ? reels.length : 0,
    sampleReel: reels[0] || null,
    enrichedCount: enriched.length,
    maxLikes: enriched[0]?.likes || 0,
    top5Enriched: enriched.slice(0, 5),
  });
}
