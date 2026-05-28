import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  const username = req.nextUrl.searchParams.get('username') || 'gabybernstein';

  const headers: Record<string, string> = {
    'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
    'X-CSRFToken': csrfToken || '',
    'X-IG-App-ID': '936619743392459',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.instagram.com/',
    'Accept': '*/*',
  };

  const endpoints = [
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    `https://www.instagram.com/${username}/?__a=1&__d=dis`,
    `https://www.instagram.com/api/v1/users/lookup/?username=${username}`,
  ];

  const results: any = {};
  for (const url of endpoints) {
    const key = url.split('/').slice(4).join('/').split('?')[0];
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
      const text = await res.text();
      results[key] = { status: res.status, length: text.length, preview: text.slice(0, 200) };
    } catch (e: any) {
      results[key] = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
