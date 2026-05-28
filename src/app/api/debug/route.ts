import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();

  const headers: Record<string, string> = {
    'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
    'X-CSRFToken': csrfToken || '',
    'X-IG-App-ID': '936619743392459',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.instagram.com/',
  };

  const username = req.nextUrl.searchParams.get('username') || 'gabybernstein';
  const results: any = {};

  // Test profile fetch
  try {
    const res1 = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, { headers, signal: AbortSignal.timeout(10000) });
    const data1 = await res1.json();
    results.profile = {
      status: res1.status,
      userId: data1?.data?.user?.id,
      username: data1?.data?.user?.username,
      followers: data1?.data?.user?.edge_followed_by?.count,
      keys: Object.keys(data1?.data?.user || {}).slice(0, 10),
    };

    const userId = data1?.data?.user?.id;
    if (userId) {
      // Test feed fetch
      const res2 = await fetch(`https://www.instagram.com/api/v1/feed/user/${userId}/?count=12`, { headers, signal: AbortSignal.timeout(10000) });
      const data2 = await res2.json();
      const items = data2?.items || [];
      results.feed = {
        status: res2.status,
        itemCount: items.length,
        topLikes: items.reduce((max: number, i: any) => Math.max(max, i.like_count || 0), 0),
        top3: items.slice(0, 3).map((i: any) => ({ likes: i.like_count, type: i.media_type, code: i.code })),
        keys: Object.keys(data2 || {}).slice(0, 8),
      };
    }
  } catch (e: any) {
    results.error = e.message;
  }

  return NextResponse.json(results);
}
