import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const NICHE_ACCOUNTS: Record<string, string[]> = {
  manifesting: ['manifestation_babe', 'gabybernstein', 'lawofattractionio', 'highvibemanifestation', 'manifestingwithlaura', 'the.holistic.psychologist', 'abundancequeen', 'yung_pueblo', 'thirdeyethoughts', 'iamalphaleo'],
  realestate: ['ryan.serhant', 'grantcardone', 'biggerpockets', 'flippingmastery', 'therealestaterobot', 'wholesalinginc', 'realestatetips', 'investfourmore', 'coachcarson1', 'lisabroude'],
  fitness: ['davidgoggins', 'chrisheria', 'calisthenicsmovement', 'brendancurranjr', 'simeonpanda', 'mattdoesfitness', 'athleanx', 'nicktumminello', 'mikeohearnofficial', 'stevecookfitness'],
  mindset: ['garyvee', 'tonyrobbins', 'lewishowes', 'edmylett', 'melrobbins', 'the_mindset_mentor', 'brendonburchard', 'marieforleo', 'impacttheory', 'jayshettymindset'],
  sidehustle: ['alexhormozi', 'garyvee', 'patrickbet_david', 'grahamstephan', 'andrei_jikh', 'minoritymindset', 'nateobrien', 'danielmartinfeld', 'humprey_yang', 'tombilyeu'],
  finance: ['grahamstephan', 'andrei_jikh', 'minoritymindset', 'humphreytalks', 'yourrichbff', 'nateobrien', 'chloefinancials', 'danielmartinfeld', 'humprey_yang', 'brianhygienics'],
  motivation: ['garyvee', 'lewishowes', 'edmylett', 'davidgoggins', 'tonyrobbins', 'melrobbins', 'brendonburchard', 'the_mindset_mentor', 'goalcast', 'impacttheory'],
  skincare: ['hyramylan', 'doctorshereene', 'skincarebyalana', 'glowrecipe', 'paulaschoice', 'beautylabofficial', 'drbaileyskincare', 'skincarewithjo', 'farahhair', 'theordinary_official'],
  spirituality: ['deepakchopra', 'gabybernstein', 'iyanlavanzant', 'yung_pueblo', 'maryamhasnaa', 'thirdeyethoughts', 'highvibemanifestation', 'the.holistic.psychologist', 'abundancequeen', 'sacredserpentess'],
  wealth: ['alexhormozi', 'grantcardone', 'garyvee', 'patrickbet_david', 'tonyrobbins', 'robertkiyosaki', 'grahamstephan', 'andrei_jikh', 'minoritymindset', 'nateobrien'],
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  if (!apifyKey) return NextResponse.json({ error: 'No Apify key' });

  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const accounts = NICHE_ACCOUNTS[tag] || NICHE_ACCOUNTS[keyword] || [];

  const allMedias: any[] = [];
  const seen = new Set<string>();

  // Use Apify with residential proxies to fetch top posts from viral accounts
  if (accounts.length > 0) {
    try {
      const url = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apifyKey}&timeout=120&memory=1024&maxItems=200`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: accounts,
          resultsType: 'posts',
          resultsLimit: 20,
          addParentData: false,
        }),
        signal: AbortSignal.timeout(125000),
      });

      if (res.ok) {
        const items = await res.json();
        for (const item of (Array.isArray(items) ? items : [])) {
          if (!seen.has(item.id) && (item.likesCount || 0) >= 500) {
            seen.add(item.id);
            // Convert Apify format to our format
            allMedias.push({
              id: item.id,
              like_count: item.likesCount || 0,
              comment_count: item.commentsCount || 0,
              view_count: item.videoPlayCount || item.videoViewCount || 0,
              caption: { text: item.caption || '' },
              user: { username: item.ownerUsername, full_name: item.ownerFullName },
              code: item.shortCode,
              media_type: item.type === 'Video' ? 2 : 1,
              image_versions2: { candidates: [{ url: item.displayUrl }] },
              taken_at: item.timestamp ? Math.floor(new Date(item.timestamp).getTime() / 1000) : null,
              video_url: item.videoUrl || null,
            });
          }
        }
      }
    } catch (e) { console.error('Apify account crawl error:', e); }
  }

  // Also get hashtag posts via session cookie
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  if (sessionId) {
    const headers: Record<string, string> = {
      'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
      'X-CSRFToken': csrfToken || '',
      'X-IG-App-ID': '936619743392459',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
    };
    try {
      const res = await fetch(`https://www.instagram.com/api/v1/tags/web_info/?tag_name=${tag}`, { headers, signal: AbortSignal.timeout(12000) });
      if (res.ok) {
        const data = await res.json();
        const sections = [...(data?.data?.top?.sections || []), ...(data?.data?.recent?.sections || [])];
        for (const s of sections) {
          for (const m of (s?.layout_content?.medias || [])) {
            const media = m?.media || m;
            if (media?.id && !seen.has(media.id) && (media.like_count || 0) >= 200) {
              seen.add(media.id);
              allMedias.push(media);
            }
          }
        }
      }
    } catch { }
  }

  // Sort by likes
  allMedias.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));

  // Store in Supabase
  const { supabaseAdmin } = await import('@/lib/supabase');
  const sb = supabaseAdmin();
  let saved = 0;

  for (const media of allMedias.slice(0, 300)) {
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
      view_count: media.view_count || 0, raw_score: rawScore,
      media_type: isVideo ? 'video' : 'image',
      shortcode: shortCode, post_url: postUrl,
      thumbnail: media.image_versions2?.candidates?.[0]?.url || '',
      taken_at: media.taken_at ? new Date(media.taken_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    saved++;
  }

  return NextResponse.json({
    keyword, accountsCrawled: accounts.length,
    totalFetched: allMedias.length, saved,
    topLikes: allMedias[0]?.like_count || 0,
    top5: allMedias.slice(0, 5).map((m: any) => ({ likes: m.like_count, username: m.user?.username })),
  });
}
