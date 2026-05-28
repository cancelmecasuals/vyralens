import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rapidKey = process.env.RAPIDAPI_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  try {
    const url = `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/hashtag_section?tag=${encodeURIComponent(tag)}&section=top`;
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': rapidKey || '',
        'x-rapidapi-host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com',
      },
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text; }

    const sections = data?.data?.top?.sections || data?.data?.sections || data?.sections || data?.top?.sections || [];
    const items: any[] = [];
    for (const s of sections) {
      for (const m of (s?.layout_content?.medias || [])) {
        if (m?.media?.id) items.push(m.media);
      }
    }

    return NextResponse.json({
      status: res.status,
      topLevelKeys: Object.keys(data || {}),
      dataKeys: Object.keys(data?.data || {}),
      sectionsFound: sections.length,
      itemsExtracted: items.length,
      firstItem: items[0] ? {
        id: items[0].id,
        like_count: items[0].like_count,
        comment_count: items[0].comment_count,
        media_type: items[0].media_type,
        caption: items[0].caption?.text?.slice(0, 80),
      } : null,
      rawSample: JSON.stringify(data).slice(0, 800),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
