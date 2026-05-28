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

  // Show ALL keys of first media object so we know exact field names
  const firstMedia = medias[0];
  const sorted = medias.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));

  return NextResponse.json({
    status: res.status,
    totalMedias: medias.length,
    firstMediaAllKeys: firstMedia ? Object.keys(firstMedia) : [],
    firstMediaRaw: firstMedia ? {
      id: firstMedia.id,
      code: firstMedia.code,
      pk: firstMedia.pk,
      shortcode: firstMedia.shortcode,
      media_type: firstMedia.media_type,
      like_count: firstMedia.like_count,
      username: firstMedia.user?.username,
      taken_at: firstMedia.taken_at,
    } : null,
    top3ByLikes: sorted.slice(0, 3).map((m: any) => ({
      likes: m.like_count,
      username: m.user?.username,
      code: m.code,
      pk: m.pk,
      id: m.id,
      media_type: m.media_type,
    })),
  });
}
