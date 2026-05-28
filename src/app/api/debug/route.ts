import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const actor = req.nextUrl.searchParams.get('actor') || 'patient_discovery~instagram-search-users';

  const inputs: Record<string, any> = {
    'patient_discovery~instagram-search-users': {
      query: keyword,
      maxResults: 20,
    },
    'apify~instagram-search-scraper': {
      queries: [keyword],
      resultsType: 'users',
      resultsLimit: 20,
    },
  };

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${apifyKey}&timeout=60&memory=512&maxItems=20`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs[actor] || inputs['patient_discovery~instagram-search-users']),
        signal: AbortSignal.timeout(65000),
      }
    );

    const data = await res.json();
    const items = Array.isArray(data) ? data : [];

    return NextResponse.json({
      actor, status: res.status,
      count: items.length,
      sampleKeys: items[0] ? Object.keys(items[0]).slice(0, 15) : [],
      top5: items.slice(0, 5).map((u: any) => ({
        username: u.username || u.handle,
        followers: u.follower_count || u.followersCount || u.followers,
        fullName: u.full_name || u.fullName || u.name,
        bio: (u.biography || u.bio || '').slice(0, 60),
        verified: u.is_verified || u.verified,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, actor });
  }
}
