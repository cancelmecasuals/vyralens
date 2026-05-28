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
    'Accept-Language': 'en-US,en;q=0.9',
    'X-IG-WWW-Claim': '0',
    'Origin': 'https://www.instagram.com',
  };

  const results: any = {};

  // Test 1: GraphQL hashtag top posts with doc_id
  const endpoints = [
    {
      name: 'graphql_top_posts',
      url: `https://www.instagram.com/graphql/query/?doc_id=17843421142428472&variables=${encodeURIComponent(JSON.stringify({ tag_name: keyword, first: 50, after: null }))}`,
    },
    {
      name: 'graphql_hashtag',
      url: `https://www.instagram.com/graphql/query/?doc_id=17843571935108570&variables=${encodeURIComponent(JSON.stringify({ tag_name: keyword, first: 50 }))}`,
    },
    {
      name: 'api_top_posts',
      url: `https://www.instagram.com/api/v1/tags/${keyword}/sections/?tab=top&page=0&surface=grid&count=100`,
    },
    {
      name: 'explore_top',
      url: `https://www.instagram.com/api/v1/discover/top_live/`,
    },
    {
      name: 'tag_ranked',
      url: `https://www.instagram.com/api/v1/tags/${keyword}/ranked_sections/?tab=top`,
    },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { headers, signal: AbortSignal.timeout(8000) });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = null; }
      
      let maxLikes = 0;
      let postCount = 0;
      
      // Try to find likes in the response
      if (text.includes('like_count') || text.includes('"likes"')) {
        const likeMatches = text.match(/"like_count":\s*(\d+)/g) || text.match(/"likes":\s*(\d+)/g) || [];
        const likes = likeMatches.map((m: string) => parseInt(m.replace(/\D+(\d+)/, '$1'))).filter(n => n > 0);
        maxLikes = Math.max(0, ...likes);
        postCount = likes.length;
      }

      results[ep.name] = { 
        status: res.status, 
        maxLikes,
        postCount,
        preview: text.slice(0, 200),
      };
    } catch (e: any) {
      results[ep.name] = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
