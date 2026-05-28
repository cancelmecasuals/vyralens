import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rapidKey = process.env.RAPIDAPI_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  // Test hashtag_posts endpoint which might return more posts
  const endpoints = [
    `hashtag_section?tag=${tag}&section=top`,
    `hashtag_section?tag=${tag}&section=recent`,
    `hashtag_posts?tag=${tag}`,
    `hashtag_posts?hashtag=${tag}`,
    `hashtag_posts?name=${tag}`,
  ];

  const results: any = {};
  for (const ep of endpoints) {
    try {
      const url = `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/${ep}`;
      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': rapidKey || '',
          'x-rapidapi-host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com',
        },
        signal: AbortSignal.timeout(10000),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      
      // Count total medias across all sections
      const sections = data?.data?.sections || data?.sections || data?.data || [];
      let totalMedias = 0;
      let maxLikes = 0;
      
      if (Array.isArray(sections)) {
        for (const s of sections) {
          const medias = s?.layout_content?.medias || [];
          totalMedias += medias.length;
          for (const m of medias) {
            const likes = m?.media?.like_count || m?.like_count || 0;
            if (likes > maxLikes) maxLikes = likes;
          }
        }
      }
      
      results[ep.split('?')[0]] = { 
        status: res.status, 
        totalSections: Array.isArray(sections) ? sections.length : 0,
        totalMedias,
        maxLikes,
        topKeys: Object.keys(data?.data || data || {}).slice(0, 8),
      };
    } catch (e: any) {
      results[ep.split('?')[0]] = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
