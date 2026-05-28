import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const RELATED: Record<string, string[]> = {
  manifesting: ['manifesting','manifestation','manifest','lawofattraction','lawofassumption','abundance','affirmations','manifestyourdreams','manifestationcoach','manifestinglife','manifestingmiracles','manifestingyourdreams','lawofattractionworks','abundancemindset','manifestationquotes'],
};

export async function GET(req: NextRequest) {
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  const headers: Record<string, string> = {
    'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
    'X-CSRFToken': csrfToken || '',
    'X-IG-App-ID': '936619743392459',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
  };

  const relatedTags = RELATED[tag] || [tag];
  const shortcodes: string[] = [];
  const seen = new Set<string>();

  // Hit ALL related hashtags in parallel
  const tagResults = await Promise.all(
    relatedTags.map(async (t) => {
      try {
        const res = await fetch(
          `https://www.instagram.com/api/v1/tags/web_info/?tag_name=${t}`,
          { headers: { ...headers, 'Referer': `https://www.instagram.com/explore/tags/${t}/` }, signal: AbortSignal.timeout(8000) }
        );
        if (!res.ok) return { tag: t, count: 0 };
        const data = await res.json();
        const sections = [...(data?.data?.top?.sections || []), ...(data?.data?.recent?.sections || [])];
        let count = 0;
        for (const s of sections) {
          for (const m of (s?.layout_content?.medias || [])) {
            const media = m?.media || m;
            const code = media?.code;
            if (code && !seen.has(code)) {
              seen.add(code);
              shortcodes.push(code);
              count++;
            }
          }
        }
        return { tag: t, count };
      } catch { return { tag: t, count: 0 }; }
    })
  );

  // Enrich top 100 with Bright Data
  const bdUrls = shortcodes.slice(0, 100).map(code => ({ url: `https://www.instagram.com/p/${code}/` }));
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
    tagsSearched: relatedTags.length,
    tagResults,
    totalShortcodes: shortcodes.length,
    bdPostsReturned: Array.isArray(posts) ? posts.length : 0,
    postsWithLikes: sorted.length,
    maxLikes: sorted[0]?.likes || sorted[0]?.num_likes || 0,
    top10: sorted.slice(0, 10).map((p: any) => ({
      likes: p.likes || p.num_likes,
      username: p.user_posted,
      url: p.url,
      caption: p.description?.slice(0, 60),
    })),
  });
}
