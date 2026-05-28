import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Top accounts per niche — these consistently produce viral content
const NICHE_ACCOUNTS: Record<string, string[]> = {
  manifesting: ['lawofattractionio', 'manifestation_babe', 'gabybernstein', 'manifestingwithlaura', 'thesecretofficialpage', 'lawofattraction_universe', 'abrahamhickspublications', 'tonyrobbins', 'manifestation.queen', 'highvibemanifestation'],
  realestate: ['grantcardone', 'biggerrealestate', 'realestatedevelopmentguide', 'realestatetips', 'realestateinvesting', 'flippingmastery', 'wholesalinginc', 'brooklinefinancial', 'ryan.serhant', 'freddestin'],
  fitness: ['davidgoggins', 'therock', 'chrisheria', 'brendancurranjr', 'mattdoesfitness', 'simeonpanda', 'calisthenicsmovement', 'athleanx', 'nickysworld', 'andrewtate'],
  mindset: ['garyvee', 'tonyrobbins', 'lewishowes', 'edmylett', 'impacttheory', 'marieforleo', 'brendonburchard', 'melrobbins', 'jayshettymindset', 'the_mindset_mentor'],
  sidehustle: ['grahamstephan', 'andrei_jikh', 'minoritymindset', 'nateobrien', 'brianhygienics', 'humprey_yang', 'danielmartinfeld', 'tombilyeu', 'patrickbet_david', 'alexhormozi'],
  finance: ['grahamstephan', 'andrei_jikh', 'minoritymindset', 'humphreytalks', 'nateobrien', 'danielmartinfeld', 'humprey_yang', 'chloefinancials', 'sellingsunset', 'yourrichbff'],
  motivation: ['garyvee', 'lewishowes', 'edmylett', 'tonyrobbins', 'davidgoggins', 'melrobbins', 'the_mindset_mentor', 'brendonburchard', 'impacttheory', 'goalcast'],
  skincare: ['hyramylan', 'skincarebyhyram', 'doctorshereene', 'paulaschoice', 'cerave', 'drbaileyskincare', 'skincarebyalana', 'beautylabofficial', 'glowrecipe', 'the_ordinary'],
  spirituality: ['deepakchopra', 'gabybernstein', 'eckharttolleonline', 'iyanlavanzant', 'oprah', 'yung_pueblo', 'maryamhasnaa', 'abundancequeen', 'thirdeyethoughts', 'highvibemanifestation'],
  wealth: ['grantcardone', 'alexhormozi', 'garyvee', 'patrickbet_david', 'tonyrobbins', 'robertkiyosaki', 'chamath', 'elonmusk', 'nateobrien', 'grahamstephan'],
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
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
    'Referer': 'https://www.instagram.com/',
  };

  const allMedias: any[] = [];
  const seen = new Set<string>();

  // Strategy 1: Hashtag pages (multiple pages)
  for (let page = 0; page <= 5; page++) {
    try {
      let sections: any[] = [];
      if (page === 0) {
        const res = await fetch(`https://www.instagram.com/api/v1/tags/web_info/?tag_name=${tag}`, { headers, signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        sections = [...(data?.data?.top?.sections || []), ...(data?.data?.recent?.sections || [])];
      } else {
        const res = await fetch(`https://www.instagram.com/api/v1/tags/${tag}/sections/?tab=top&page=${page}&surface=grid`, { headers, signal: AbortSignal.timeout(10000) });
        if (!res.ok) break;
        const data = await res.json();
        sections = data?.sections || [];
        if (!sections.length) break;
      }
      for (const s of sections) {
        for (const m of (s?.layout_content?.medias || [])) {
          const media = m?.media || m;
          if (media?.id && !seen.has(media.id)) {
            seen.add(media.id);
            allMedias.push(media);
          }
        }
      }
      await new Promise(r => setTimeout(r, 400));
    } catch { break; }
  }

  // Strategy 2: Pull top posts from known viral accounts in this niche
  const accounts = NICHE_ACCOUNTS[tag] || NICHE_ACCOUNTS[keyword] || [];
  for (const username of accounts.slice(0, 8)) {
    try {
      // Get user ID
      const profileRes = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, { headers, signal: AbortSignal.timeout(8000) });
      if (!profileRes.ok) continue;
      const profileData = await profileRes.json();
      const userId = profileData?.data?.user?.id;
      if (!userId) continue;

      // Get their top posts
      const feedRes = await fetch(`https://www.instagram.com/api/v1/feed/user/${userId}/?count=12`, { headers, signal: AbortSignal.timeout(8000) });
      if (!feedRes.ok) continue;
      const feedData = await feedRes.json();
      const posts = feedData?.items || [];

      for (const post of posts) {
        if (!seen.has(post.id) && (post.like_count || 0) >= 1000) {
          seen.add(post.id);
          allMedias.push(post);
        }
      }
      await new Promise(r => setTimeout(r, 500));
    } catch { continue; }
  }

  // Sort by likes and store top results
  allMedias.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));

  const { supabaseAdmin } = await import('@/lib/supabase');
  const sb = supabaseAdmin();
  let saved = 0;

  for (const media of allMedias.slice(0, 300)) {
    if ((media.like_count || 0) < 100) continue;
    const isVideo = media.media_type === 2;
    const shortCode = media.code || media.shortcode || '';
    const postUrl = shortCode ? (isVideo ? `https://www.instagram.com/reel/${shortCode}/` : `https://www.instagram.com/p/${shortCode}/`) : null;
    const rawScore = (media.view_count || media.play_count || 0) > 0 ? (media.view_count || media.play_count) : (media.like_count || 0) * 15;
    await sb.from('instagram_posts').upsert({
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
    saved++;
  }

  return NextResponse.json({
    keyword, totalFetched: allMedias.length, saved,
    topLikes: allMedias[0]?.like_count || 0,
    top5: allMedias.slice(0, 5).map((m: any) => ({ likes: m.like_count, username: m.user?.username })),
  });
}
