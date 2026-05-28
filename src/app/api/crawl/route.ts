import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const NICHE_ACCOUNTS: Record<string, string[]> = {
  manifesting: ['manifestation_babe', 'gabybernstein', 'lawofattractionio', 'highvibemanifestation', 'the.holistic.psychologist', 'abundancequeen', 'yung_pueblo', 'iamalphaleo', 'lawofattraction_universe', 'manifestingwithlaura'],
  realestate: ['ryan.serhant', 'grantcardone', 'biggerpockets', 'flippingmastery', 'therealestaterobot', 'wholesalinginc', 'realestatetips', 'investfourmore', 'coachcarson1', 'brooklinefinancial'],
  fitness: ['davidgoggins', 'chrisheria', 'calisthenicsmovement', 'brendancurranjr', 'simeonpanda', 'mattdoesfitness', 'athleanx', 'mikeohearnofficial', 'stevecookfitness', 'nicktumminello'],
  mindset: ['garyvee', 'tonyrobbins', 'lewishowes', 'edmylett', 'melrobbins', 'the_mindset_mentor', 'brendonburchard', 'marieforleo', 'impacttheory', 'jayshettymindset'],
  sidehustle: ['alexhormozi', 'garyvee', 'patrickbet_david', 'grahamstephan', 'andrei_jikh', 'minoritymindset', 'nateobrien', 'danielmartinfeld', 'humprey_yang', 'tombilyeu'],
  finance: ['grahamstephan', 'andrei_jikh', 'minoritymindset', 'humphreytalks', 'yourrichbff', 'nateobrien', 'chloefinancials', 'danielmartinfeld', 'humprey_yang', 'brianhygienics'],
  motivation: ['garyvee', 'lewishowes', 'edmylett', 'davidgoggins', 'tonyrobbins', 'melrobbins', 'brendonburchard', 'the_mindset_mentor', 'goalcast', 'impacttheory'],
  skincare: ['hyramylan', 'doctorshereene', 'skincarebyalana', 'glowrecipe', 'paulaschoice', 'beautylabofficial', 'drbaileyskincare', 'theordinary_official', 'farahhair', 'skincarewithjo'],
  spirituality: ['deepakchopra', 'gabybernstein', 'iyanlavanzant', 'yung_pueblo', 'maryamhasnaa', 'thirdeyethoughts', 'highvibemanifestation', 'the.holistic.psychologist', 'abundancequeen', 'iamalphaleo'],
  wealth: ['alexhormozi', 'grantcardone', 'garyvee', 'patrickbet_david', 'tonyrobbins', 'robertkiyosaki', 'grahamstephan', 'andrei_jikh', 'minoritymindset', 'nateobrien'],
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  if (!bdToken) return NextResponse.json({ error: 'No Bright Data key' });

  const accounts = NICHE_ACCOUNTS[tag] || NICHE_ACCOUNTS[keyword.split(' ')[0].toLowerCase()] || NICHE_ACCOUNTS['mindset'];

  const input = accounts.map(username => ({
    url: `https://www.instagram.com/${username}/`,
    num_of_posts: 20,
    post_type: 'Reel',
  }));

  try {
    const triggerRes = await fetch(
      `https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lk5ns7kz21pck8jpis&notify=false&include_errors=true&type=discover_new&discover_by=url`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bdToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
        signal: AbortSignal.timeout(30000),
      }
    );

    const triggerText = await triggerRes.text();
    let triggerData: any;
    try { triggerData = JSON.parse(triggerText); } catch { triggerData = triggerText; }

    if (!triggerRes.ok) {
      return NextResponse.json({ error: `BD error: ${triggerRes.status}`, detail: triggerText.slice(0, 500) });
    }

    const snapshotId = triggerData?.snapshot_id;
    if (!snapshotId) return NextResponse.json({ error: 'No snapshot_id', raw: triggerData });

    // Poll for completion (up to 8 minutes)
    for (let i = 0; i < 96; i++) {
      await new Promise(r => setTimeout(r, 5000));

      const statusRes = await fetch(
        `https://api.brightdata.com/datasets/v3/progress/${snapshotId}`,
        { headers: { 'Authorization': `Bearer ${bdToken}` }, signal: AbortSignal.timeout(10000) }
      );
      const statusData = await statusRes.json();

      if (statusData.status === 'ready') {
        const dataRes = await fetch(
          `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`,
          { headers: { 'Authorization': `Bearer ${bdToken}` }, signal: AbortSignal.timeout(30000) }
        );
        const posts = await dataRes.json();

        if (!Array.isArray(posts) || !posts.length) {
          return NextResponse.json({ error: 'No posts returned', snapshotId, sampleRaw: posts });
        }

        // Show field names so we can map correctly
        const sampleKeys = posts[0] ? Object.keys(posts[0]) : [];

        const { supabaseAdmin } = await import('@/lib/supabase');
        const sb = supabaseAdmin();
        let saved = 0;

        const sorted = posts
          .filter((p: any) => {
            const likes = p.likes || p.num_likes || p.like_count || p.edge_liked_by?.count || 0;
            return likes >= 500;
          })
          .sort((a: any, b: any) => {
            const aL = a.likes || a.num_likes || a.like_count || 0;
            const bL = b.likes || b.num_likes || b.like_count || 0;
            return bL - aL;
          });

        for (const post of sorted.slice(0, 500)) {
          const likes = post.likes || post.num_likes || post.like_count || 0;
          const comments = post.num_comments || post.comments || post.comment_count || 0;
          const views = post.video_view_count || post.video_play_count || post.views || post.play_count || 0;
          const rawScore = views > 0 ? views : likes * 15;
          const isVideo = post.content_type === 'video' || post.media_type === 'video' || post.post_type === 'Reel' || !!post.video_url;
          const caption = post.description || post.caption || post.text || '';
          const postUrl = post.url || post.post_url || null;
          const shortcode = postUrl?.split('/p/')?.[1]?.split('/')?.[0] || postUrl?.split('/reel/')?.[1]?.split('/')?.[0] || post.shortcode || '';
          const username = post.user_posted || post.username || post.owner?.username || '';

          await sb.from('instagram_posts').upsert({
            id: post.post_id || post.id || shortcode || `bd-${saved}`,
            keyword: tag, platform: 'Instagram',
            hook: caption.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
            caption, username, full_name: post.profile_name || username,
            like_count: likes, comment_count: comments, view_count: views,
            raw_score: rawScore, media_type: isVideo ? 'video' : 'image',
            shortcode, post_url: postUrl,
            thumbnail: post.display_url || post.thumbnail || post.image_url || post.thumbnail_url || '',
            taken_at: post.date_posted ? new Date(post.date_posted).toISOString() : null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
          saved++;
        }

        return NextResponse.json({
          keyword, snapshotId,
          totalFetched: posts.length,
          highEngagementPosts: sorted.length,
          saved, sampleKeys,
          topLikes: sorted[0] ? (sorted[0].likes || sorted[0].num_likes || sorted[0].like_count || 0) : 0,
          top5: sorted.slice(0, 5).map((p: any) => ({
            likes: p.likes || p.num_likes || p.like_count,
            username: p.user_posted || p.username,
            url: p.url,
          })),
        });
      }

      if (statusData.status === 'failed') return NextResponse.json({ error: 'Job failed', statusData });
    }

    return NextResponse.json({ error: 'Timed out after 8 minutes', snapshotId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
