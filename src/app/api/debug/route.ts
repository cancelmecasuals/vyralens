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
    const res = await fetch(
      `https://www.instagram.com/api/v1/fbsearch/web/top_serp/?query=${encodeURIComponent(keyword)}&context=blended&include_reel=true`,
      { headers, signal: AbortSignal.timeout(10000) }
    );

    const data = await res.json();
    
    // Extract accounts from results
    const users = data?.users || data?.list || data?.accounts || [];
    const hashtags = data?.hashtags || [];
    const places = data?.places || [];

    return NextResponse.json({
      status: res.status,
      topLevelKeys: Object.keys(data || {}),
      usersFound: users.length,
      hashtagsFound: hashtags.length,
      users: users.slice(0, 10).map((u: any) => ({
        username: u.user?.username || u.username,
        fullName: u.user?.full_name || u.full_name,
        followers: u.user?.follower_count || u.follower_count,
        isVerified: u.user?.is_verified || u.is_verified,
        bio: u.user?.biography?.slice(0, 80) || u.biography?.slice(0, 80),
        profilePic: u.user?.profile_pic_url || u.profile_pic_url,
      })),
      rawSample: JSON.stringify(data).slice(0, 500),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
