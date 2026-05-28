import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const NICHE_ACCOUNTS: Record<string, string[]> = {
  manifesting: ['gabybernstein','manifestation_babe','lawofattractionio','highvibemanifestation','the.holistic.psychologist','yung_pueblo','abundancequeen','iamalphaleo','lawofattraction_universe','manifestingwithlaura','tonyrobbins','lewishowes','oprah','deepakchopra','eckharttolleonline'],
};

export async function GET(req: NextRequest) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const accounts = NICHE_ACCOUNTS[tag] || [];

  // Get top posts from each account via ScrapeCreators
  const allUrls: string[] = [];
  const seen = new Set<string>();

  const accountResults = await Promise.all(
    accounts.slice(0, 10).map(async (handle) => {
      try {
        const res = await fetch(
          `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${handle}&limit=12`,
          { headers: { 'x-api-key': scKey || '' }, signal: AbortSignal.timeout(10000) }
        );
        if (!res.ok) return { handle, count: 0, status: res.status };
        const data = await res.json();
        const posts = data?.posts || data?.data || data?.items || [];
        let count = 0;
        for (const p of posts) {
          const url = p.url || p.postUrl || p.link;
          if (url && !seen.has(url)) { seen.add(url); allUrls.push(url); count++; }
        }
        return { handle, count, status: res.status, sampleKeys: posts[0] ? Object.keys(posts[0]).slice(0, 8) : [] };
      } catch (e: any) { return { handle, error: e.message }; }
    })
  );

  if (!allUrls.length) return NextResponse.json({ error: 'No URLs from accounts', accountResults });

  // Enrich with Bright Data
  const bdUrls = allUrls.slice(0, 50).map(url => ({ url }));
  const bdRes = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lk5ns7kz21pck8jpis&format=json`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${bdToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(bdUrls),
      signal: AbortSignal.timeout(55000),
    }
  );

  const posts = bdRes.ok ? await bdRes.json() : [];
  const sorted = Array.isArray(posts)
    ? posts.filter((p: any) => (p.likes || p.num_likes || 0) > 0)
        .sort((a: any, b: any) => (b.likes || b.num_likes || 0) - (a.likes || a.num_likes || 0))
    : [];

  return NextResponse.json({
    accountsSearched: accounts.slice(0, 10).length,
    accountResults,
    totalUrls: allUrls.length,
    bdReturned: Array.isArray(posts) ? posts.length : 0,
    maxLikes: sorted[0]?.likes || sorted[0]?.num_likes || 0,
    top5: sorted.slice(0, 5).map((p: any) => ({
      likes: p.likes || p.num_likes,
      username: p.user_posted,
      url: p.url,
      caption: p.description?.slice(0, 60),
    })),
  });
}
