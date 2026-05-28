import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const platform = req.nextUrl.searchParams.get('platform') || 'tiktok';
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const ytKey = process.env.YOUTUBE_API_KEY?.trim();

  if (platform === 'tiktok') {
    const res = await fetch(
      `https://api.scrapecreators.com/v1/tiktok/search/top?query=${encodeURIComponent(keyword)}&sort_by=most-liked&publish_time=all-time`,
      { headers: { 'x-api-key': scKey || '' }, signal: AbortSignal.timeout(15000) }
    );
    const data = await res.json();
    const items = data?.items || [];
    const sorted = items.sort((a: any, b: any) => (b.statistics?.digg_count || 0) - (a.statistics?.digg_count || 0));
    return NextResponse.json({
      platform: 'TikTok',
      keyword,
      totalResults: items.length,
      sortedByLikes: true,
      publishTime: 'all-time',
      top5: sorted.slice(0, 5).map((i: any) => ({
        likes: i.statistics?.digg_count,
        views: i.statistics?.play_count,
        date: i.create_time,
        caption: i.desc?.slice(0, 60),
        url: `https://www.tiktok.com/@${i.author?.uniqueId}/video/${i.id}`,
      })),
    });
  }

  if (platform === 'youtube') {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&maxResults=10&key=${ytKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    const data = await res.json();
    const videoIds = data.items?.map((i: any) => i.id?.videoId).filter(Boolean).join(',');
    
    // Get real stats
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${ytKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    const statsData = await statsRes.json();
    const videos = statsData.items || [];
    const sorted = videos.sort((a: any, b: any) => (parseInt(b.statistics?.viewCount) || 0) - (parseInt(a.statistics?.viewCount) || 0));
    
    return NextResponse.json({
      platform: 'YouTube',
      keyword,
      totalResults: videos.length,
      top5: sorted.slice(0, 5).map((v: any) => ({
        views: parseInt(v.statistics?.viewCount),
        likes: parseInt(v.statistics?.likeCount),
        title: v.snippet?.title?.slice(0, 60),
        date: v.snippet?.publishedAt,
        url: `https://youtube.com/watch?v=${v.id}`,
      })),
    });
  }

  if (platform === 'instagram') {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const sb = supabaseAdmin();
    const { data } = await sb.from('instagram_posts').select('*').eq('keyword', keyword).order('like_count', { ascending: false }).limit(5);
    return NextResponse.json({
      platform: 'Instagram',
      keyword,
      totalInDB: data?.length || 0,
      top5: (data || []).map((p: any) => ({
        likes: p.like_count,
        views: p.view_count,
        username: p.username,
        date: p.taken_at,
        url: p.post_url,
        caption: p.caption?.slice(0, 60),
      })),
    });
  }

  return NextResponse.json({ error: 'Invalid platform' });
}
