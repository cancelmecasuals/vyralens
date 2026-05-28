import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keyword = req.nextUrl.searchParams.get('keyword') || 'realestate';
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  if (!sessionId) return NextResponse.json({ error: 'No session' });

  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const headers: Record<string, string> = {
    'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
    'X-CSRFToken': csrfToken || '',
    'X-IG-App-ID': '936619743392459',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
  };

  const allMedias: any[] = [];
  const seen = new Set<string>();

  for (let page = 0; page <= 8; page++) {
    try {
      let sections: any[] = [];
      if (page === 0) {
        const res = await fetch(`https://www.instagram.com/api/v1/tags/web_info/?tag_name=${tag}`, { headers, signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        sections = [...(data?.data?.top?.sections || []), ...(data?.data?.recent?.sections || [])];
      } else {
        const res = await fetch(`https://www.instagram.com/api/v1/tags/${tag}/sections/?tab=top&page=${page}&surface=grid`, { headers, signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        sections = data?.sections || [];
        if (!sections.length) break;
      }
      for (const s of sections) {
        for (const m of (s?.layout_content?.medias || [])) {
          const media = m?.media || m;
          if (media?.id && !seen.has(media.id) && (media.like_count || 0) >= 200) {
            seen.add(media.id);
            allMedias.push(media);
          }
        }
      }
      await new Promise(r => setTimeout(r, 300));
    } catch { break; }
  }

  // Sort by likes
  allMedias.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));

  // Store top 200 in Supabase
  const { supabaseAdmin } = await import('@/lib/supabase');
  const sb = supabaseAdmin();
  let saved = 0;

  for (const media of allMedias.slice(0, 200)) {
    const isVideo = media.media_type === 2;
    const shortCode = media.code || '';
    const postUrl = shortCode ? (isVideo ? `https://www.instagram.com/reel/${shortCode}/` : `https://www.instagram.com/p/${shortCode}/`) : null;
    const rawScore = (media.view_count || media.play_count || 0) > 0 ? (media.view_count || media.play_count) : (media.like_count || 0) * 15;
    const { error } = await sb.from('instagram_posts').upsert({
      id: media.id, keyword: tag, platform: 'Instagram',
      hook: media.caption?.text?.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
      caption: media.caption?.text || '',
      username: media.user?.username || '', full_name: media.user?.full_name || '',
      like_count: media.like_count || 0, comment_count: media.comment_count || 0,
      view_count: media.view_count || media.play_count || 0,
      raw_score: rawScore, media_type: isVideo ? 'video' : 'image',
      shortcode: shortCode, post_url: postUrl,
      thumbnail: media.image_versions2?.candidates?.[0]?.url || '',
      taken_at: media.taken_at ? new Date(media.taken_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (!error) saved++;
  }

  return NextResponse.json({ keyword, totalFetched: allMedias.length, saved, topLikes: allMedias[0]?.like_count });
}
