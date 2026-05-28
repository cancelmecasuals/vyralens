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

  try {
    const endpoints = [
      `https://www.instagram.com/api/v1/fbsearch/web/top_serp/?query=${encodeURIComponent(keyword)}&context=user`,
      `https://www.instagram.com/api/v1/fbsearch/accounts/?query=${encodeURIComponent(keyword)}&count=30`,
      `https://www.instagram.com/api/v1/users/search/?query=${encodeURIComponent(keyword)}&count=30`,
      `https://www.instagram.com/api/v1/fbsearch/web/top_serp/?query=${encodeURIComponent(keyword)}&context=blended&include_reel=false`,
    ];

    const results: any = {};
    for (const url of endpoints) {
      const key = url.split('?')[0].split('/').slice(-2).join('/');
      try {
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
        const data = await res.json();
        const users = data?.users || data?.list?.filter((i: any) => i.user || i.username) || data?.accounts || [];
        results[key] = {
          status: res.status,
          usersFound: users.length,
          topKeys: Object.keys(data || {}).slice(0, 8),
          firstUser: users[0] ? {
            username: users[0]?.user?.username || users[0]?.username,
            followers: users[0]?.user?.follower_count || users[0]?.follower_count,
            bio: (users[0]?.user?.biography || users[0]?.biography || '').slice(0, 60),
          } : null,
        };
      } catch (e: any) { results[key] = { error: e.message }; }
    }
    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
