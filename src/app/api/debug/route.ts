import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rapidKey = process.env.RAPIDAPI_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  const url = `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/hashtag_section?tag=${encodeURIComponent(tag)}&section=top`;
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-key': rapidKey || '',
      'x-rapidapi-host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com',
    },
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json();
  const sections = data?.data?.sections || [];

  // Deep inspect all sections
  const sectionInfo = sections.map((s: any, i: number) => ({
    index: i,
    layout_type: s.layout_type,
    feed_type: s.feed_type,
    mediasIsNull: s.layout_content?.medias === null,
    mediasLength: s.layout_content?.medias?.length || 0,
    firstMediaKeys: s.layout_content?.medias?.[0] ? Object.keys(s.layout_content.medias[0]) : [],
    firstMediaId: s.layout_content?.medias?.[0]?.media?.id || s.layout_content?.medias?.[0]?.id || null,
    firstMediaLikes: s.layout_content?.medias?.[0]?.media?.like_count || null,
  }));

  // Try to extract any media
  const allMedias: any[] = [];
  for (const s of sections) {
    const medias = s?.layout_content?.medias || [];
    for (const m of medias) {
      const media = m?.media || m;
      if (media && typeof media === 'object' && (media.id || media.like_count)) {
        allMedias.push({
          id: media.id,
          like_count: media.like_count,
          comment_count: media.comment_count,
          media_type: media.media_type,
          caption: media.caption?.text?.slice(0, 60),
          has_video_url: !!media.video_url,
          username: media.user?.username,
        });
      }
    }
  }

  return NextResponse.json({
    status: res.status,
    totalSections: sections.length,
    sectionInfo,
    totalMediasExtracted: allMedias.length,
    medias: allMedias.slice(0, 3),
    rawDataKeys: Object.keys(data?.data || {}),
  });
}
