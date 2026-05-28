import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const formatNum = (n: number) => {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(0)}K`;
  return n.toString();
};

async function searchYouTube(keyword: string, pageToken?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
  if (!apiKey) return { results: [], nextPageToken: null };
  try {
    const tokenParam = pageToken ? `&pageToken=${pageToken}` : '';
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&maxResults=25&relevanceLanguage=en${tokenParam}&key=${apiKey}`
    );
    const searchData = await searchRes.json();
    if (!searchData.items?.length) return { results: [], nextPageToken: null };

    const ids = searchData.items.filter((i: any) => i.id?.videoId).map((i: any) => i.id.videoId).join(',');
    if (!ids) return { results: [], nextPageToken: null };

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`
    );
    const statsData = await statsRes.json();
    const statsMap: Record<string, any> = {};
    statsData.items?.forEach((item: any) => { statsMap[item.id] = item.statistics; });

    const results = searchData.items
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => {
        const stats = statsMap[item.id.videoId] || {};
        const views = parseInt(stats.viewCount || '0');
        const likes = parseInt(stats.likeCount || '0');
        const comments = parseInt(stats.commentCount || '0');
        const engagementRate = views > 0 ? ((likes + comments) / views * 100).toFixed(1) : '0';
        const vyraScore = Math.min(99, Math.max(60, Math.round(Math.log10(views + 1) * 14 + parseFloat(engagementRate) * 4)));
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
          score: vyraScore, postedTime: new Date(item.snippet.publishedAt).toLocaleDateString(),
          type: 'YouTube Video', videoId: item.id.videoId,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          mediaType: 'video', rawViews: views,
        };
      }).sort((a: any, b: any) => b.rawViews - a.rawViews);

    return { results, nextPageToken: searchData.nextPageToken || null };
  } catch (err) { console.error('YouTube error:', err); return { results: [], nextPageToken: null }; }
}

async function searchReddit(keyword: string, after?: string) {
  // Try multiple approaches to get Reddit data
  const attempts = [
    `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=top&t=year&limit=25${after ? `&after=${after}` : ''}&raw_json=1`,
    `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=relevance&t=all&limit=25${after ? `&after=${after}` : ''}&raw_json=1`,
    `https://old.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=top&t=all&limit=25&raw_json=1`,
  ];

  for (const url of attempts) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) continue;
      const text = await res.text();
      if (!text || text.startsWith('<!')) continue;

      let data: any;
      try { data = JSON.parse(text); } catch { continue; }

      const children = data?.data?.children;
      if (!children?.length) continue;

      const posts = children
        .filter((p: any) => p.data?.score > 1 && p.data?.title)
        .map((post: any) => {
          const p = post.data;
          const vyraScore = Math.min(99, Math.max(60, Math.round(Math.log10(p.score + 1) * 16)));
          return {
            id: p.id, platform: 'Reddit',
            hook: p.title,
            description: p.selftext?.slice(0, 400) || '',
            accountName: `u/${p.author}`,
            accountFollowers: `r/${p.subreddit}`,
            thumbnail: '', thumbnailEmoji: '🔴',
            views: formatNum(p.score * 8), likes: formatNum(p.score),
            comments: formatNum(p.num_comments), shares: formatNum(Math.round(p.score * 0.08)),
            score: vyraScore, postedTime: new Date(p.created_utc * 1000).toLocaleDateString(),
            type: 'Reddit Post', postUrl: `https://reddit.com${p.permalink}`,
            selfText: p.selftext, mediaType: 'text', rawScore: p.score,
          };
        }).sort((a: any, b: any) => b.rawScore - a.rawScore);

      if (posts.length > 0) {
        return { results: posts, after: data?.data?.after || null };
      }
    } catch { continue; }
  }
  return { results: [], after: null };
}

function generateMockResults(keyword: string, platform: string) {
  const name = platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : platform === 'x' ? 'X / Twitter' : platform;
  const emoji = platform === 'tiktok' ? '🎵' : platform === 'instagram' ? '📸' : '✖️';
  const hooks = [
    `Nobody talks about this ${keyword} secret`,
    `Hot take: everything you know about ${keyword} is wrong`,
    `I tried ${keyword} for 30 days — here's what happened`,
    `The ${keyword} strategy nobody is teaching`,
    `POV: You finally understand ${keyword}`,
    `5 ${keyword} mistakes everyone makes`,
    `This ${keyword} hack changed everything for me`,
    `Stop doing this with ${keyword} immediately`,
    `Why your ${keyword} isn't working (and the real fix)`,
    `The truth about ${keyword} they don't want you to know`,
  ];
  return hooks.map((hook, i) => ({
    id: `${platform}-${i}`, platform: name, hook,
    accountName: `@creator_${i+1}`, accountFollowers: `${Math.floor(Math.random()*400+50)}K followers`,
    thumbnail: '', thumbnailEmoji: emoji,
    views: formatNum(Math.floor(Math.random() * 4000000 + 500000)),
    likes: formatNum(Math.floor(Math.random() * 300000 + 50000)),
    comments: formatNum(Math.floor(Math.random() * 10000 + 1000)),
    shares: formatNum(Math.floor(Math.random() * 50000 + 5000)),
    score: Math.floor(Math.random() * 20 + 78),
    postedTime: `${Math.floor(Math.random() * 14 + 1)} days ago`,
    type: ['Reveal Hook', 'Unpopular Opinion', 'Before & After', 'List Hook'][i % 4],
    mediaType: 'video',
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { keyword, platform, pageToken, redditAfter } = await req.json();
    if (!keyword?.trim()) return NextResponse.json({ results: [], nextPageToken: null, redditAfter: null });

    let results: any[] = [];
    let nextPageToken = null;
    let nextRedditAfter = null;

    if (platform === 'all') {
      const [yt, reddit] = await Promise.all([
        searchYouTube(keyword, pageToken),
        searchReddit(keyword, redditAfter),
      ]);
      nextPageToken = yt.nextPageToken;
      nextRedditAfter = reddit.after;
      const max = Math.max(yt.results.length, reddit.results.length);
      for (let i = 0; i < max; i++) {
        if (yt.results[i]) results.push(yt.results[i]);
        if (reddit.results[i]) results.push(reddit.results[i]);
      }
      if (results.length === 0) {
        results = [...generateMockResults(keyword, 'tiktok').slice(0, 5), ...generateMockResults(keyword, 'instagram').slice(0, 5)];
      }
    } else if (platform === 'youtube') {
      const yt = await searchYouTube(keyword, pageToken);
      results = yt.results;
      nextPageToken = yt.nextPageToken;
      if (!results.length) results = generateMockResults(keyword, 'youtube');
    } else if (platform === 'reddit') {
      const reddit = await searchReddit(keyword, redditAfter);
      results = reddit.results;
      nextRedditAfter = reddit.after;
      if (!results.length) results = generateMockResults(keyword, 'reddit');
    } else {
      results = generateMockResults(keyword, platform);
    }

    const response = NextResponse.json({ results, total: results.length, nextPageToken, redditAfter: nextRedditAfter });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err: any) {
    console.error('Search error:', err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
