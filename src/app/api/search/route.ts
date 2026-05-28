import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const formatNum = (n: number) => {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(0)}K`;
  return n.toString();
};

async function searchYouTube(keyword: string, maxResults = 24) {
  const apiKey = process.env.YOUTUBE_API_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
  if (!apiKey) return [];
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&maxResults=${maxResults}&relevanceLanguage=en&key=${apiKey}`
    );
    const searchData = await searchRes.json();
    if (!searchData.items?.length) return [];

    const ids = searchData.items
      .filter((i: any) => i.id?.videoId)
      .map((i: any) => i.id.videoId).join(',');
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
        const vyraScore = Math.min(99, Math.max(60, Math.round(
          Math.log10(views + 1) * 14 + parseFloat(engagementRate) * 4 + Math.random() * 3
        )));
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
          mediaType: 'video', rawViews: views,
        };
      })
      .sort((a: any, b: any) => b.rawViews - a.rawViews);
  } catch (err) {
    console.error('YouTube error:', err);
    return [];
  }
}

async function searchReddit(keyword: string) {
  try {
    // Try multiple time ranges to get more results
    const timeRanges = ['month', 'year', 'all'];
    let allPosts: any[] = [];

    for (const t of timeRanges) {
      try {
        const res = await fetch(
          `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=top&t=${t}&limit=25&raw_json=1`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; VyraLens/1.0)',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(8000),
          }
        );

        if (!res.ok) continue;
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { continue; }

        const children = data?.data?.children || [];
        children.forEach((post: any) => {
          const p = post.data;
          if (p && p.score > 5 && !allPosts.find(x => x.id === p.id)) {
            allPosts.push(p);
          }
        });

        if (allPosts.length >= 20) break;
      } catch { continue; }
    }

    if (!allPosts.length) return [];

    return allPosts
      .sort((a, b) => b.score - a.score)
      .map((p: any) => {
        const vyraScore = Math.min(99, Math.max(60, Math.round(
          Math.log10(p.score + 1) * 16 + Math.random() * 4
        )));
        return {
          id: p.id, platform: 'Reddit',
          hook: p.title,
          description: p.selftext?.slice(0, 400) || '',
          accountName: `u/${p.author}`,
          accountFollowers: `r/${p.subreddit}`,
          thumbnail: '', thumbnailEmoji: '🔴',
          views: formatNum(p.score * 8), likes: formatNum(p.score),
          comments: formatNum(p.num_comments), shares: formatNum(Math.round(p.score * 0.08)),
          score: vyraScore,
          postedTime: new Date(p.created_utc * 1000).toLocaleDateString(),
          type: 'Reddit Post',
          postUrl: `https://reddit.com${p.permalink}`,
          selfText: p.selftext,
          mediaType: 'text', rawScore: p.score,
        };
      });
  } catch (err) {
    console.error('Reddit error:', err);
    return [];
  }
}

function mockPlatform(keyword: string, platform: string) {
  const name = platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : 'X / Twitter';
  const emoji = platform === 'tiktok' ? '🎵' : platform === 'instagram' ? '📸' : '✖️';
  const hooks = [
    `Nobody talks about this ${keyword} secret`,
    `Hot take: everything you know about ${keyword} is wrong`,
    `I tried ${keyword} for 30 days. Here's what happened`,
    `The ${keyword} strategy nobody is teaching`,
    `POV: You finally understand ${keyword}`,
    `5 ${keyword} mistakes everyone makes`,
    `This ${keyword} hack changed everything for me`,
    `Stop doing this with ${keyword} immediately`,
  ];
  return hooks.map((hook, i) => ({
    id: `${platform}-${i}`, platform: name,
    hook, accountName: `@creator_${i+1}`, accountFollowers: `${Math.floor(Math.random()*400+50)}K followers`,
    thumbnail: '', thumbnailEmoji: emoji,
    views: formatNum(Math.floor(Math.random() * 4000000 + 500000)),
    likes: formatNum(Math.floor(Math.random() * 300000 + 50000)),
    comments: formatNum(Math.floor(Math.random() * 10000 + 1000)),
    shares: formatNum(Math.floor(Math.random() * 50000 + 5000)),
    score: Math.floor(Math.random() * 20 + 78),
    postedTime: `${Math.floor(Math.random() * 14 + 1)} days ago`,
    type: ['Reveal Hook', 'Unpopular Opinion', 'Before & After', 'List Hook'][i % 4],
    mediaType: 'video',
    note: `Live ${name} data coming soon`,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { keyword, platform } = await req.json();
    if (!keyword?.trim()) return NextResponse.json({ results: [] });

    let results: any[] = [];

    if (platform === 'all') {
      const [yt, reddit] = await Promise.all([
        searchYouTube(keyword, 24),
        searchReddit(keyword),
      ]);
      // Interleave so both platforms show up
      const max = Math.max(yt.length, reddit.length);
      for (let i = 0; i < max; i++) {
        if (yt[i]) results.push(yt[i]);
        if (reddit[i]) results.push(reddit[i]);
      }
      // If either failed, fill with mock for missing platforms
      if (yt.length === 0 && reddit.length === 0) {
        results = [...mockPlatform(keyword, 'tiktok'), ...mockPlatform(keyword, 'instagram')];
      }
    } else if (platform === 'youtube') {
      results = await searchYouTube(keyword, 24);
      if (!results.length) results = mockPlatform(keyword, 'youtube');
    } else if (platform === 'reddit') {
      results = await searchReddit(keyword);
      if (!results.length) results = mockPlatform(keyword, 'reddit');
    } else {
      results = mockPlatform(keyword, platform);
    }

    const response = NextResponse.json({ results, total: results.length });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err: any) {
    console.error('Search route error:', err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
