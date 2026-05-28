import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  const results: any = {};

  // Test 1: web_info endpoint
  try {
    const url1 = `https://www.instagram.com/api/v1/tags/web_info/?tag_name=${tag}`;
    const res1 = await fetch(url1, {
      headers: {
        'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
        'X-CSRFToken': csrfToken || '',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
      },
      signal: AbortSignal.timeout(10000),
    });
    const data1 = await res1.json();
    const topPosts = data1?.data?.hashtag?.edge_hashtag_to_top_posts?.edges || [];
    results['web_info'] = {
      status: res1.status,
      topPostsCount: topPosts.length,
      firstPostLikes: topPosts[0]?.node?.edge_liked_by?.count || 0,
      sample: topPosts[0]?.node ? { likes: topPosts[0].node.edge_liked_by?.count, shortcode: topPosts[0].node.shortcode } : null,
    };
  } catch (e: any) { results['web_info'] = { error: e.message }; }

  // Test 2: sections endpoint
  try {
    const url2 = `https://www.instagram.com/api/v1/tags/${tag}/sections/?tab=top&page=0&surface=grid`;
    const res2 = await fetch(url2, {
      headers: {
        'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
        'X-CSRFToken': csrfToken || '',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
      },
      signal: AbortSignal.timeout(10000),
    });
    const data2 = await res2.json();
    const sections = data2?.sections || [];
    let totalMedias = 0;
    let maxLikes = 0;
    for (const s of sections) {
      for (const m of (s?.layout_content?.medias || [])) {
        totalMedias++;
        const likes = m?.media?.like_count || 0;
        if (likes > maxLikes) maxLikes = likes;
      }
    }
    results['sections'] = { status: res2.status, sections: sections.length, totalMedias, maxLikes };
  } catch (e: any) { results['sections'] = { error: e.message }; }

  return NextResponse.json({ hasSession: !!sessionId, results });
}
