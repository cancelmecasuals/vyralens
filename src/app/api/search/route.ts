import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const formatNum = (n: number) => {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(0)}K`;
  return n.toString();
};

async function searchYouTube(keyword: string) {
  const apiKey = process.env.YOUTUBE_API_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
  if (!apiKey) return [];
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&maxResults=12&relevanceLanguage=en&key=${apiKey}`
    );
    const searchData = await searchRes.json();
    if (!searchData.items?.length) {
      console.error('YouTube no items:', JSON.stringify(searchData));
      return [];
    }

    const ids = searchData.items.map((i: any) => i.id.videoId).filter(Boolean).join(',');
    if (!ids) return [];

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`
    );
    const statsData = await statsRes.json();
    const statsMap: Record<string, any> = {};
    statsData.items?.forEach((item: any) => { statsMap[item.id] = item.statistics; });

    return searchData.items
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => {
        const stats = statsMap[item.id.videoId] || {};
        const views = parseInt(stats.viewCount || '0');
        const likes = parseInt(stats.likeCount || '0');
        const comments = parseInt(stats.commentCount || '0');
        const engagementRate = views > 0 ? ((likes + comments) / views * 100).toFixed(1) : '0';
        const vyraScore = Math.min(99, Math.max(65, Math.round(Math.log10(views + 1) * 15 + parseFloat(engagementRate) * 5)));
        return {
          id: item.id.videoId, platform: 'YouTube',
          hook: item.snippet.title,
          description: item.snippet.description?.slice(0, 300) || '',
          accountName: `@${item.snippet.channelTitle}`,
          accountFollowers: '',
          thumbnail: item.snippet.thumbnails?.medium?.url || '',
          thumbnailEmoji: '▶️',
          views: formatNum(views), likes: formatNum(likes),
          comments: formatNum(comments), shares: formatNum(Math.round(likes * 0.3)),
          score: vyraScore,
          postedTime: new Date(item.snippet.publishedAt).toLocaleDateString(),
          type: 'YouTube Video',
          videoId: item.id.videoId,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          mediaType: 'video', rawViews: views, engagementRate,
        };
      })
      .sort((a: any, b: any) => b.rawViews - a.rawViews);
  } catch (err) { console.error('YouTube error:', err); return []; }
}

async function searchReddit(keyword: string) {
  try {
    const res = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=top&t=month&limit=10&include_over_18=false`,
      {
        headers: {
          'User-Agent': 'VyraLens:v1.0 (by /u/vyralens)',
          'Accept': 'application/json',
        },
      }
    );
    if (!res.ok) {
      console.error('Reddit HTTP error:', res.status);
      return [];
    }
    const data = await res.json();
    if (!data.data?.children?.length) {
      console.error('Reddit no children:', JSON.stringify(data).slice(0, 200));
      return [];
    }
    return data.data.children
      .filter((p: any) => p.data.score > 10)
      .map((post: any) => {
        const p = post.data;
        const vyraScore = Math.min(99, Math.max(65, Math.round(Math.log10(p.score + 1) * 18)));
        return {
          id: p.id, platform: 'Reddit',
          hook: p.title,
          description: p.selftext?.slice(0, 400) || '',
          accountName: `u/${p.author}`,
          accountFollowers: `r/${p.subreddit}`,
          thumbnail: '', thumbnailEmoji: '🔴',
          views: formatNum(p.score * 10), likes: formatNum(p.score),
          comments: formatNum(p.num_comments), shares: formatNum(Math.round(p.score * 0.1)),
          score: vyraScore,
          postedTime: new Date(p.created_utc * 1000).toLocaleDateString(),
          type: 'Reddit Post',
          postUrl: `https://reddit.com${p.permalink}`,
          selfText: p.selftext,
          mediaType: 'text', rawScore: p.score,
        };
      }).sort((a: any, b: any) => b.rawScore - a.rawScore);
  } catch (err) { console.error('Reddit error:', err); return []; }
}

function mockPlatform(keyword: string, platform: string) {
  const name = platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : 'X / Twitter';
  const emoji = platform === 'tiktok' ? '🎵' : platform === 'instagram' ? '📸' : '✖️';
  return [{
    id: `${platform}-1`, platform: name,
    hook: `Nobody talks about this ${keyword} secret`,
    accountName: '@creator_pro', accountFollowers: '124K followers',
    thumbnail: '', thumbnailEmoji: emoji,
    views: '2.4M', likes: '189K', comments: '4.2K', shares: '28K',
    score: 96, postedTime: '4 days ago', type: 'Reveal Hook', mediaType: 'video',
    note: `Live ${name} data — coming soon`,
  }];
}

export async function POST(req: NextRequest) {
  try {
    const { keyword, platform } = await req.json();
    if (!keyword?.trim()) return NextResponse.json({ results: [] });

    let results: any[] = [];
    if (platform === 'all') {
      const [yt, reddit] = await Promise.all([searchYouTube(keyword), searchReddit(keyword)]);
      const max = Math.max(yt.length, reddit.length);
      for (let i = 0; i < max; i++) {
        if (yt[i]) results.push(yt[i]);
        if (reddit[i]) results.push(reddit[i]);
      }
    } else if (platform === 'youtube') {
      results = await searchYouTube(keyword);
    } else if (platform === 'reddit') {
      results = await searchReddit(keyword);
    } else {
      results = mockPlatform(keyword, platform);
    }

    const response = NextResponse.json({ results, total: results.length });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
