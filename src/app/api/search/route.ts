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
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&maxResults=50&relevanceLanguage=en${tokenParam}&key=${apiKey}`
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
        const engagementRate = views > 0 ? ((likes + comments) / views * 100) : 0;
        // VyraScore based on views + engagement
        const vyraScore = Math.min(99, Math.max(50, Math.round(
          Math.log10(Math.max(views, 1)) * 12 + engagementRate * 3
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
          score: vyraScore, rawScore: views + (engagementRate * 100000),
          postedTime: new Date(item.snippet.publishedAt).toLocaleDateString(),
          type: 'YouTube Video', videoId: item.id.videoId,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          mediaType: 'video',
        };
      });

    return { results, nextPageToken: searchData.nextPageToken || null };
  } catch (err) { console.error('YouTube error:', err); return { results: [], nextPageToken: null }; }
}

async function searchReddit(keyword: string, after?: string) {
  const urls = [
    `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=top&t=year&limit=50${after ? `&after=${after}` : ''}&raw_json=1`,
    `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=top&t=all&limit=50&raw_json=1`,
    `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=relevance&t=all&limit=50&raw_json=1`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) { console.log('Reddit non-ok:', res.status, url); continue; }
      const text = await res.text();
      if (!text || text.trim().startsWith('<')) { console.log('Reddit HTML response'); continue; }

      let data: any;
      try { data = JSON.parse(text); } catch (e) { console.log('Reddit parse error'); continue; }

      const children = data?.data?.children;
      if (!children?.length) { console.log('Reddit no children'); continue; }

      const posts = children
        .filter((p: any) => p.data?.title && p.data?.score >= 1)
        .map((post: any) => {
          const p = post.data;
          const score = p.score || 0;
          const vyraScore = Math.min(99, Math.max(50, Math.round(Math.log10(Math.max(score, 1)) * 15)));
          return {
            id: `reddit-${p.id}`, platform: 'Reddit',
            hook: p.title,
            description: p.selftext?.slice(0, 400) || '',
            accountName: `u/${p.author}`,
            accountFollowers: `r/${p.subreddit}`,
            thumbnail: '', thumbnailEmoji: '🔴',
            views: formatNum(score * 8), likes: formatNum(score),
            comments: formatNum(p.num_comments || 0),
            shares: formatNum(Math.round(score * 0.08)),
            score: vyraScore, rawScore: score,
            postedTime: new Date(p.created_utc * 1000).toLocaleDateString(),
            type: 'Reddit Post',
            postUrl: `https://reddit.com${p.permalink}`,
            viewOriginalUrl: `https://reddit.com${p.permalink}`,
            selfText: p.selftext || '',
            mediaType: 'text',
          };
        });

      if (posts.length > 0) {
        console.log(`Reddit success: ${posts.length} posts`);
        return { results: posts, after: data?.data?.after || null };
      }
    } catch (e) { console.log('Reddit fetch error:', e); continue; }
  }
  console.log('Reddit: all attempts failed');
  return { results: [], after: null };
}

function mockResults(keyword: string, platform: string) {
  const name = platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : platform === 'x' ? 'X / Twitter' : platform;
  const emoji = platform === 'tiktok' ? '🎵' : platform === 'instagram' ? '📸' : '✖️';
  return [
    `Nobody talks about this ${keyword} secret`,
    `Hot take: everything you know about ${keyword} is wrong`,
    `I tried ${keyword} for 30 days — here's what happened`,
    `The ${keyword} strategy nobody is teaching`,
    `POV: You finally understand ${keyword}`,
    `5 ${keyword} mistakes everyone makes`,
    `This ${keyword} hack changed everything`,
    `Stop doing this with ${keyword} immediately`,
    `Why your ${keyword} isn't working (the real fix)`,
    `The truth about ${keyword} they don't want you to know`,
  ].map((hook, i) => ({
    id: `${platform}-mock-${i}`, platform: name, hook,
    accountName: `@creator_${i+1}`,
    accountFollowers: `${Math.floor(Math.random()*400+50)}K followers`,
    thumbnail: '', thumbnailEmoji: emoji,
    views: formatNum(Math.floor(Math.random() * 4000000 + 200000)),
    likes: formatNum(Math.floor(Math.random() * 300000 + 10000)),
    comments: formatNum(Math.floor(Math.random() * 10000 + 500)),
    shares: formatNum(Math.floor(Math.random() * 50000 + 1000)),
    score: Math.floor(Math.random() * 25 + 72),
    rawScore: Math.floor(Math.random() * 4000000 + 200000),
    postedTime: `${Math.floor(Math.random() * 14 + 1)} days ago`,
    type: ['Reveal Hook', 'Unpopular Opinion', 'Before & After', 'List Hook'][i % 4],
    mediaType: 'video',
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { keyword, platform, pageToken, redditAfter } = await req.json();
    if (!keyword?.trim()) return NextResponse.json({ results: [] });

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

      // Merge and sort ALL results by rawScore (most viral first)
      results = [...yt.results, ...reddit.results].sort((a, b) => b.rawScore - a.rawScore);

      if (results.length === 0) {
        results = [...mockResults(keyword, 'tiktok'), ...mockResults(keyword, 'instagram')]
          .sort((a, b) => b.rawScore - a.rawScore);
      }
    } else if (platform === 'youtube') {
      const yt = await searchYouTube(keyword, pageToken);
      nextPageToken = yt.nextPageToken;
      results = yt.results.sort((a: any, b: any) => b.rawScore - a.rawScore);
      if (!results.length) results = mockResults(keyword, 'youtube');
    } else if (platform === 'reddit') {
      const reddit = await searchReddit(keyword, redditAfter);
      nextRedditAfter = reddit.after;
      results = reddit.results.sort((a: any, b: any) => b.rawScore - a.rawScore);
      if (!results.length) results = mockResults(keyword, 'reddit');
    } else {
      results = mockResults(keyword, platform).sort((a, b) => b.rawScore - a.rawScore);
    }

    const response = NextResponse.json({ results, total: results.length, nextPageToken, redditAfter: nextRedditAfter });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err: any) {
    console.error('Search error:', err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
