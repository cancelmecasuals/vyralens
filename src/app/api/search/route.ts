import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const formatNum = (n: number) => {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(0)}K`;
  return n.toString();
};

const MOCK_HOOKS = [
  'Nobody talks about this [keyword] secret',
  'Hot take: everything you know about [keyword] is wrong',
  'I tried [keyword] for 30 days — here\'s what happened',
  'The [keyword] strategy nobody is teaching',
  'POV: You finally understand [keyword]',
  '5 [keyword] mistakes everyone makes',
  'This [keyword] hack changed everything for me',
  'Stop doing this with [keyword] immediately',
  'Why your [keyword] isn\'t working (the real fix)',
  'The truth about [keyword] they don\'t want you to know',
  'I made $10K with [keyword] — here\'s exactly how',
  'What nobody tells you about [keyword]',
  'The [keyword] method that actually works in 2026',
  'How I went from zero to 100K with [keyword]',
  'The biggest [keyword] lie you\'ve been told',
  'Do this ONE thing for [keyword] and watch what happens',
  '[keyword] is changing — here\'s what you need to know',
  'I tested every [keyword] strategy so you don\'t have to',
  'The [keyword] secret that top creators hide',
  'Why most people fail at [keyword] (and how to not)',
];

function generateMockPage(keyword: string, platform: string, page: number) {
  const name = platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : platform === 'x' ? 'X / Twitter' : platform === 'youtube' ? 'YouTube' : platform === 'reddit' ? 'Reddit' : 'TikTok';
  const emoji = platform === 'tiktok' ? '🎵' : platform === 'instagram' ? '📸' : platform === 'x' ? '✖️' : platform === 'youtube' ? '▶️' : '🔴';

  return MOCK_HOOKS.map((hookTemplate, i) => {
    const hook = hookTemplate.replace(/\[keyword\]/g, keyword);
    const baseViews = Math.max(50000, Math.floor(4000000 / (page * 0.8 + 1)) + Math.floor(Math.random() * 500000));
    const score = Math.min(99, Math.max(50, Math.floor(90 - (page * 3) - (i * 0.5) + Math.random() * 8)));
    return {
      id: `${platform}-mock-p${page}-${i}`,
      platform: name, hook,
      accountName: `@creator_${page * 20 + i}`,
      accountFollowers: `${Math.floor(Math.random() * 400 + 10)}K followers`,
      thumbnail: '', thumbnailEmoji: emoji,
      views: formatNum(baseViews),
      likes: formatNum(Math.floor(baseViews * 0.08)),
      comments: formatNum(Math.floor(baseViews * 0.01)),
      shares: formatNum(Math.floor(baseViews * 0.02)),
      score, rawScore: baseViews,
      postedTime: `${Math.floor(Math.random() * 30 + 1)} days ago`,
      type: ['Reveal Hook', 'Unpopular Opinion', 'Before & After', 'List Hook', 'Value Hook'][i % 5],
      mediaType: 'video',
    };
  });
}

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
        const engagement = views > 0 ? ((likes + comments) / views * 100) : 0;
        const vyraScore = Math.min(99, Math.max(50, Math.round(Math.log10(Math.max(views, 1)) * 12 + engagement * 3)));
        return {
          id: item.id.videoId, platform: 'YouTube',
          hook: item.snippet.title,
          description: item.snippet.description?.slice(0, 300) || '',
          accountName: `@${item.snippet.channelTitle}`, accountFollowers: '',
          thumbnail: item.snippet.thumbnails?.medium?.url || '', thumbnailEmoji: '▶️',
          views: formatNum(views), likes: formatNum(likes),
          comments: formatNum(comments), shares: formatNum(Math.round(likes * 0.3)),
          score: vyraScore, rawScore: views,
          postedTime: new Date(item.snippet.publishedAt).toLocaleDateString(),
          type: 'YouTube Video', videoId: item.id.videoId,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          mediaType: 'video',
        };
      });
    return { results, nextPageToken: searchData.nextPageToken || null };
  } catch (err) { console.error('YouTube error:', err); return { results: [], nextPageToken: null }; }
}

export async function POST(req: NextRequest) {
  try {
    const { keyword, platform, pageToken, page = 0 } = await req.json();
    if (!keyword?.trim()) return NextResponse.json({ results: [], hasMore: false });

    let results: any[] = [];
    let nextPageToken: string | null = null;
    let hasMore = true;

    if (platform === 'all') {
      const yt = await searchYouTube(keyword, pageToken);
      nextPageToken = yt.nextPageToken;
      const mockTT = generateMockPage(keyword, 'tiktok', page);
      const mockIG = generateMockPage(keyword, 'instagram', page);
      const mockX = generateMockPage(keyword, 'x', page).slice(0, 5);
      results = [...yt.results, ...mockTT, ...mockIG, ...mockX];
      hasMore = true;
    } else if (platform === 'youtube') {
      const yt = await searchYouTube(keyword, pageToken);
      nextPageToken = yt.nextPageToken;
      results = yt.results;
      if (results.length < 5) results = [...results, ...generateMockPage(keyword, 'youtube', page)];
      hasMore = true;
    } else {
      // TikTok, Instagram, X — endless mock
      results = generateMockPage(keyword, platform, page);
      hasMore = true;
    }

    // Sort everything by virality score
    results = results.sort((a, b) => (b.rawScore || b.score * 10000) - (a.rawScore || a.score * 10000));

    const response = NextResponse.json({ results, hasMore, nextPageToken });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err: any) {
    console.error('Search error:', err);
    return NextResponse.json({ error: err.message, results: [], hasMore: false }, { status: 500 });
  }
}
