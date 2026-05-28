import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  const headers: Record<string, string> = {
    'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
    'X-CSRFToken': csrfToken || '',
    'X-IG-App-ID': '936619743392459',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
    'Accept': '*/*',
  };

  const url = `https://www.instagram.com/api/v1/tags/web_info/?tag_name=${tag}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  const data = await res.json();

  const topSections = data?.data?.top?.sections || [];
  const medias: any[] = [];
  for (const section of topSections) {
    for (const m of (section?.layout_content?.medias || [])) {
      const media = m?.media || m;
      if (media?.id) medias.push(media);
    }
  }

  const sorted = medias.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));

  return NextResponse.json({
    status: res.status,
    totalSections: topSections.length,
    totalMedias: medias.length,
    maxLikes: sorted[0]?.like_count || 0,
    top5: sorted.slice(0, 5).map((m: any) => ({
      likes: m.like_count,
      username: m.user?.username,
      shortcode: m.code,
      type: m.media_type === 2 ? 'video' : 'image',
      url: m.code ? `https://instagram.com/p/${m.code}/` : null,
    })),
  });
}
