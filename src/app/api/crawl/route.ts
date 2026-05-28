import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for Pro Vercel plans

const RELATED_TAGS: Record<string, string[]> = {
  manifesting: ['manifesting', 'manifestation', 'manifest', 'lawofattraction', 'lawofassumption', 'abundance', 'affirmations', 'manifestyourdreams'],
  realestate: ['realestate', 'realestateagent', 'realtor', 'realestateinvesting', 'realestatelife', 'househunting', 'realestatetips'],
  fitness: ['fitness', 'workout', 'gym', 'fitnessmotivation', 'bodybuilding', 'fitnessjourney', 'exercise', 'fitfam'],
  mindset: ['mindset', 'growthmindset', 'mindsetcoach', 'successmindset', 'mindsetshift', 'positivemindset'],
  sidehustle: ['sidehustle', 'makemoneyonline', 'passiveincome', 'entrepreneurship', 'onlinebusiness', 'workfromhome'],
  finance: ['finance', 'investing', 'personalfinance', 'financialfreedom', 'money', 'wealthbuilding'],
  motivation: ['motivation', 'motivationalquotes', 'inspired', 'success', 'hustle', 'goals', 'discipline'],
  skincare: ['skincare', 'skincareRoutine', 'glowingskin', 'skincaretips', 'beauty', 'selfcare', 'clearskin'],
  spirituality: ['spirituality', 'spiritual', 'spiritualawakening', 'meditation', 'mindfulness', 'highvibe'],
  wealth: ['wealth', 'wealthmindset', 'millionaire', 'financialfreedom', 'abundance', 'moneymindset'],
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const step = req.nextUrl.searchParams.get('step') || '1';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  const sb_key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!bdToken || !sessionId) return NextResponse.json({ error: 'Missing keys' });

  const relatedTags = RELATED_TAGS[tag] || [tag];
  const igHeaders = {
    'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
    'X-CSRFToken': csrfToken || '',
    'X-IG-App-ID': '936619743392459',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  };

  // STEP 1: Collect shortcodes from Instagram
  if (step === '1') {
    const shortcodes: string[] = [];
    const seen = new Set<string>();

    for (const relTag of relatedTags.slice(0, 5)) {
      try {
        const res = await fetch(
          `https://www.instagram.com/api/v1/tags/web_info/?tag_name=${relTag}`,
          { headers: { ...igHeaders, 'Referer': `https://www.instagram.com/explore/tags/${relTag}/` }, signal: AbortSignal.timeout(10000) }
        );
        if (!res.ok) continue;
        const data = await res.json();
        const sections = [...(data?.data?.top?.sections || []), ...(data?.data?.recent?.sections || [])];
        for (const s of sections) {
          for (const m of (s?.layout_content?.medias || [])) {
            const media = m?.media || m;
            const code = media?.code || media?.shortcode;
            if (code && !seen.has(code)) { seen.add(code); shortcodes.push(code); }
          }
        }
        await new Promise(r => setTimeout(r, 400));
      } catch { continue; }
    }

    return NextResponse.json({
      keyword, step: 1, shortcodesFound: shortcodes.length, shortcodes,
      nextStep: `Run step 2: /api/crawl?secret=${secret}&keyword=${keyword}&step=2&codes=${shortcodes.join(',')}`,
    });
  }

  // STEP 2: Enrich shortcodes with Bright Data and save
  if (step === '2') {
    const codesParam = req.nextUrl.searchParams.get('codes') || '';
    const shortcodes = codesParam.split(',').filter(Boolean);
    if (!shortcodes.length) return NextResponse.json({ error: 'No codes provided' });

    const bdUrls = shortcodes.slice(0, 100).map(code => ({ url: `https://www.instagram.com/p/${code}/` }));

    const bdRes = await fetch(
      `https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lk5ns7kz21pck8jpis&format=json`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${bdToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bdUrls),
        signal: AbortSignal.timeout(55000),
      }
    );

    if (!bdRes.ok) {
      const err = await bdRes.text();
      return NextResponse.json({ error: `BD error: ${bdRes.status}`, detail: err.slice(0, 300) });
    }

    const posts = await bdRes.json();
    if (!Array.isArray(posts) || !posts.length) return NextResponse.json({ error: 'No posts from BD' });

    const sorted = posts
      .filter((p: any) => (p.likes || p.num_likes || 0) > 0)
      .sort((a: any, b: any) => (b.likes || b.num_likes || 0) - (a.likes || a.num_likes || 0));

    const { supabaseAdmin } = await import('@/lib/supabase');
    const sb = supabaseAdmin();
    let saved = 0;

    for (const post of sorted) {
      const likes = post.likes || post.num_likes || 0;
      const comments = post.num_comments || post.comments || 0;
      const views = post.video_view_count || post.video_play_count || post.views || 0;
      const rawScore = views > 0 ? views : likes * 15;
      const isVideo = post.content_type === 'video' || !!post.video_url;
      const caption = post.description || post.caption || '';
      const postUrl = post.url || null;
      const shortcode = post.shortcode || postUrl?.split('/p/')?.[1]?.split('/')?.[0] || postUrl?.split('/reel/')?.[1]?.split('/')?.[0] || '';

      await sb.from('instagram_posts').upsert({
        id: post.post_id || shortcode || `bd-${saved}`,
        keyword: tag, platform: 'Instagram',
        hook: caption.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
        caption, username: post.user_posted || '',
        full_name: post.user_posted || '',
        like_count: likes, comment_count: comments, view_count: views,
        raw_score: rawScore, media_type: isVideo ? 'video' : 'image',
        shortcode, post_url: postUrl,
        thumbnail: post.thumbnail || post.display_url || '',
        taken_at: post.date_posted ? new Date(post.date_posted).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      saved++;
    }

    return NextResponse.json({
      keyword, step: 2, codesProcessed: shortcodes.length,
      bdPostsReturned: posts.length, saved,
      topLikes: sorted[0]?.likes || sorted[0]?.num_likes || 0,
      top5: sorted.slice(0, 5).map((p: any) => ({ likes: p.likes || p.num_likes, username: p.user_posted, url: p.url })),
    });
  }

  return NextResponse.json({ error: 'Invalid step' });
}
