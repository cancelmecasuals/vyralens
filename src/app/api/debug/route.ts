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
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.instagram.com/',
  };

  const endpoints = [
    `https://www.instagram.com/api/v1/fbsearch/web/top_serp/?query=${encodeURIComponent(keyword)}&context=blended`,
    `https://www.instagram.com/api/v1/fbsearch/web/top_serp/?query=${encodeURIComponent(keyword)}&context=media`,
    `https://www.instagram.com/api/v1/fbsearch/topsearch/?context=blended&query=${encodeURIComponent(keyword)}&rank_token=0.1&count=30`,
    `https://www.instagram.com/api/v1/fbsearch/web/search_serp/?query=${encodeURIComponent(keyword)}`,
  ];

  const results: any = {};
  for (const url of endpoints) {
    const key = url.split('?')[0].split('/').slice(-2).join('/');
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = null; }
      
      let maxLikes = 0;
      let postCount = 0;
      if (text.includes('like_count')) {
        const matches = text.match(/"like_count":(\d+)/g) || [];
        const likes = matches.map(m => parseInt(m.replace('"like_count":', ''))).filter(n => n > 100);
        maxLikes = Math.max(0, ...likes);
        postCount = likes.length;
      }

      results[key] = { 
        status: res.status,
        maxLikes,
        postCount,
        topKeys: data ? Object.keys(data).slice(0, 8) : [],
        preview: text.slice(0, 300),
      };
    } catch (e: any) {
      results[key] = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
