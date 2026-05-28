import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';

  const headers: Record<string, string> = {
    'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
    'X-CSRFToken': csrfToken || '',
    'X-IG-App-ID': '936619743392459',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.instagram.com/',
    'Accept': '*/*',
  };

  // Extract media from media_grid AND find users
  const res = await fetch(
    `https://www.instagram.com/api/v1/fbsearch/web/top_serp/?query=${encodeURIComponent(keyword)}&context=blended&include_reel=true`,
    { headers, signal: AbortSignal.timeout(10000) }
  );
  const data = await res.json();

  // Extract posts from media_grid
  const sections = data?.media_grid?.sections || [];
  const mediaPosts: any[] = [];
  for (const s of sections) {
    for (const m of (s?.layout_content?.medias || [])) {
      const media = m?.media || m;
      if (media?.id) mediaPosts.push(media);
    }
  }

  // Extract users from top_results or other keys
  const topResults = data?.top_results || data?.users || data?.accounts || [];
  const users = Array.isArray(topResults) ? topResults : [];

  // Also check for users inside media_grid sections
  const allKeys = Object.keys(data || {});

  return NextResponse.json({
    status: res.status,
    allKeys,
    mediaPostsFound: mediaPosts.length,
    usersInTopResults: users.length,
    // Show all data keys deeply
    allDataKeys: JSON.stringify(Object.fromEntries(
      Object.entries(data || {}).map(([k, v]: any) => [k, typeof v === 'object' ? Object.keys(v || {}).slice(0, 5) : v])
    )).slice(0, 500),
    // Sample media post to see if it has like_count
    sampleMedia: mediaPosts[0] ? {
      id: mediaPosts[0].id,
      like_count: mediaPosts[0].like_count,
      code: mediaPosts[0].code,
      media_type: mediaPosts[0].media_type,
      username: mediaPosts[0].user?.username,
      caption: mediaPosts[0].caption?.text?.slice(0, 60),
    } : null,
    // Raw to find users
    rawSlice: JSON.stringify(data).slice(0, 1000),
  });
}
