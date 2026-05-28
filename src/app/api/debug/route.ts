import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  const url = `https://www.instagram.com/api/v1/tags/web_info/?tag_name=${tag}`;
  const res = await fetch(url, {
    headers: {
      'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
      'X-CSRFToken': csrfToken || '',
      'X-IG-App-ID': '936619743392459',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
    },
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json();
  const hashtagData = data?.data;
  const topSections = hashtagData?.top?.sections || [];
  
  // Extract all medias from sections
  const medias: any[] = [];
  for (const section of topSections) {
    const sectionMedias = section?.layout_content?.medias || [];
    for (const m of sectionMedias) {
      const media = m?.media || m;
      if (media?.id) medias.push(media);
    }
  }

  const maxLikes = medias.reduce((max, m) => Math.max(max, m.like_count || 0), 0);

  return NextResponse.json({
    status: res.status,
    totalSections: topSections.length,
    totalMedias: medias.length,
    maxLikes,
    topSectionKeys: topSections[0] ? Object.keys(topSections[0]) : [],
    firstSectionMediaCount: topSections[0]?.layout_content?.medias?.length || 0,
    sampleMedia: medias.slice(0, 3).map((m: any) => ({
      id: m.id,
      like_count: m.like_count,
      comment_count: m.comment_count,
      media_type: m.media_type,
      has_video: !!m.video_url,
      username: m.user?.username,
      shortcode: m.code,
      caption: m.caption?.text?.slice(0, 60),
    })),
  });
}
