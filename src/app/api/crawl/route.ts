import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();

  if (!bdToken) return NextResponse.json({ error: 'No Bright Data key' });

  try {
    const triggerRes = await fetch(
      `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_lk5ns7kz21pck8jpis&format=json&uncompressed_webhook=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bdToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          { url: `https://www.instagram.com/explore/tags/${tag}/` },
          { url: `https://www.instagram.com/explore/tags/${tag}` },
        ]),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!triggerRes.ok) {
      const err = await triggerRes.text();
      return NextResponse.json({ error: `Bright Data error: ${triggerRes.status}`, detail: err });
    }

    const triggerData = await triggerRes.json();
    const snapshotId = triggerData?.snapshot_id;
    if (!snapshotId) return NextResponse.json({ error: 'No snapshot_id', raw: triggerData });

    // Poll for completion
    for (let i = 0; i < 60; i++) {
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
        if (!Array.isArray(posts) || !posts.length) return NextResponse.json({ error: 'No posts', snapshotId });

        const { supabaseAdmin } = await import('@/lib/supabase');
        const sb = supabaseAdmin();
        let saved = 0;

        const sorted = posts
          .filter((p: any) => (p.likes || p.num_likes || 0) >= 100)
          .sort((a: any, b: any) => (b.likes || b.num_likes || 0) - (a.likes || a.num_likes || 0));

        for (const post of sorted.slice(0, 300)) {
          const likes = post.likes || post.num_likes || 0;
          const comments = post.num_comments || post.comments || 0;
          const views = post.video_view_count || post.video_play_count || post.views || 0;
          const rawScore = views > 0 ? views : likes * 15;
          const isVideo = post.content_type === 'video' || !!post.video_url;
          const caption = post.description || post.caption || '';
          const postUrl = post.url || null;
          const shortcode = postUrl?.split('/p/')?.[1]?.split('/')?.[0] || postUrl?.split('/reel/')?.[1]?.split('/')?.[0] || '';

          await sb.from('instagram_posts').upsert({
            id: post.post_id || post.id || shortcode || `bd-${i}-${saved}`,
            keyword: tag, platform: 'Instagram',
            hook: caption.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
            caption, username: post.user_posted || post.username || '',
            full_name: post.user_posted || '',
            like_count: likes, comment_count: comments, view_count: views,
            raw_score: rawScore, media_type: isVideo ? 'video' : 'image',
            shortcode, post_url: postUrl,
            thumbnail: post.display_url || post.thumbnail || post.photos?.[0] || '',
            taken_at: post.date_posted ? new Date(post.date_posted).toISOString() : null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
          saved++;
        }

        return NextResponse.json({
          keyword, snapshotId, totalFetched: posts.length, saved,
          topLikes: sorted[0]?.likes || sorted[0]?.num_likes || 0,
          top5: sorted.slice(0, 5).map((p: any) => ({ likes: p.likes || p.num_likes, username: p.user_posted || p.username, url: p.url })),
        });
      }
      if (statusData.status === 'failed') return NextResponse.json({ error: 'Job failed', status: statusData });
    }
    return NextResponse.json({ error: 'Timed out', snapshotId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
