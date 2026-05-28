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
  'How I went from zero to expert with [keyword]',
  'The biggest [keyword] mistake you\'re making right now',
  'Do this ONE thing for [keyword] and watch what happens',
  '[keyword] is changing — here\'s what you need to know',
  'I tested every [keyword] strategy so you don\'t have to',
  'The [keyword] secret top creators are hiding from you',
  'Why most people fail at [keyword] (and how to not)',
];

function mockFor(keyword: string, platform: string, page: number, count = 20) {
  const name = platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : platform === 'x' ? 'X / Twitter' : 'YouTube';
  const emoji = platform === 'tiktok' ? '🎵' : platform === 'instagram' ? '📸' : platform === 'x' ? '✖️' : '▶️';
  const platformMultiplier = platform === 'instagram' ? 1.4 : platform === 'tiktok' ? 1.6 : platform === 'x' ? 0.6 : 1.0;
  return MOCK_HOOKS.slice(0, count).map((hookTemplate, i) => {
    const hook = hookTemplate.replace(/\[keyword\]/g, keyword);
    const baseViews = Math.floor((8000000 * platformMultiplier) / (page * 0.7 + 1) / (i * 0.15 + 1) + Math.random() * 500000);
    const score = Math.min(99, Math.max(50, Math.floor(95 - (page * 2) - (i * 0.5) + Math.random() * 6)));
    return {
      id: `${platform}-mock-p${page}-${i}`, platform: name, hook,
      accountName: `@${keyword.toLowerCase().replace(/\s/g, '_')}_creator${i + 1}`,
      accountFollowers: `${Math.floor(Math.random() * 800 + 50)}K followers`,
      thumbnail: '', thumbnailEmoji: emoji,
      views: formatNum(baseViews),
      likes: formatNum(Math.floor(baseViews * (platform === 'instagram' ? 0.1 : platform === 'tiktok' ? 0.12 : 0.04))),
      comments: formatNum(Math.floor(baseViews * 0.008)),
      shares: formatNum(Math.floor(baseViews * 0.02)),
      score, rawScore: baseViews,
      postedTime: `${Math.floor(Math.random() * 21 + 1)} days ago`,
      type: ['Reveal Hook', 'Unpopular Opinion', 'Before & After', 'List Hook', 'Value Hook'][i % 5],
      mediaType: platform === 'x' ? 'text' : 'video',
    };
  });
}

async function runApifyActor(actorId: string, input: any, timeoutSecs = 90): Promise<any[]> {
  const apifyKey = process.env.APIFY_API_KEY?.trim();
  if (!apifyKey) return [];
  try {
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apifyKey}&timeout=${timeoutSecs}&memory=512&maxItems=25`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout((timeoutSecs + 10) * 1000),
    });
    if (!res.ok) { console.error(`Apify ${actorId} error:`, res.status, await res.text().catch(() => '')); return []; }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) { console.error(`Apify ${actorId} error:`, err); return []; }
}

async function searchYouTube(keyword: string, pageToken?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
  if (!apiKey) return { results: [], nextPageToken: null };
  try {
    const tokenParam = pageToken ? `&pageToken=${pageToken}` : '';
    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&maxResults=50&relevanceLanguage=en${tokenParam}&key=${apiKey}`);
    const searchData = await searchRes.json();
    if (!searchData.items?.length) return { results: [], nextPageToken: null };
    const ids = searchData.items.filter((i: any) => i.id?.videoId).map((i: any) => i.id.videoId).join(',');
    if (!ids) return { results: [], nextPageToken: null };
    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`);
    const statsData = await statsRes.json();
    const statsMap: Record<string, any> = {};
    statsData.items?.forEach((item: any) => { statsMap[item.id] = item.statistics; });
    const results = searchData.items.filter((item: any) => item.id?.videoId).map((item: any) => {
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

async function searchInstagram(keyword: string, page = 0) {
  const rapidKey = process.env.RAPIDAPI_KEY?.replace(/[^\x00-\x7F]/g, '').trim();
  if (!rapidKey) return [];

  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  async function fetchSection(section: string, pageNum: number) {
    try {
      const pageParam = pageNum > 0 ? `&page=${pageNum}` : '';
      const url = `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/hashtag_section?tag=${encodeURIComponent(tag)}&section=${section}${pageParam}`;
      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': rapidKey!,
          'x-rapidapi-host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com',
        },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      const sections = data?.data?.sections || [];
      const items: any[] = [];
      for (const s of sections) {
        for (const m of (s?.layout_content?.medias || [])) {
          const media = m?.media || m;
          if (media?.id) items.push(media);
        }
      }
      return items;
    } catch { return []; }
  }

  // Fetch top posts — also fetch recent to get more content pool
  const [topItems, recentItems] = await Promise.all([
    fetchSection('top', page),
    page === 0 ? fetchSection('recent', 0) : Promise.resolve([]),
  ]);

  // Merge all items, deduplicate by id
  const seen = new Set<string>();
  const allItems: any[] = [];
  for (const item of [...topItems, ...recentItems]) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      allItems.push(item);
    }
  }

  if (!allItems.length) return [];

  return allItems
    .filter((media: any) => (media.like_count || 0) >= 100) // Only posts with 100+ likes
    .map((media: any, i: number) => {
      const likes = media.like_count || 0;
      const comments = media.comment_count || 0;
      const views = media.view_count || media.play_count || media.video_view_count || 0;
      const rawScore = views > 0 ? views : likes * 15;
      const vyraScore = Math.min(99, Math.max(50, Math.round(
        Math.log10(Math.max(rawScore + 1, 1)) * 11
      )));
      const caption = media.caption?.text || '';
      const isVideo = media.media_type === 2;
      const username = media.user?.username || 'creator';
      const shortCode = media.code || media.shortcode || '';
      const thumbCandidates = media.image_versions2?.candidates || [];
      const thumbnail = thumbCandidates[0]?.url || media.thumbnail_url || '';
      return {
        id: `ig-${media.id || i}`,
        platform: 'Instagram',
        hook: caption.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
        description: caption.slice(0, 400),
        accountName: `@${username}`,
        accountFollowers: media.user?.full_name || '',
        thumbnail, thumbnailEmoji: '📸',
        views: views > 0 ? formatNum(views) : formatNum(likes * 15),
        likes: formatNum(likes),
        comments: formatNum(comments),
        shares: '—',
        score: vyraScore,
        rawScore,
        postedTime: media.taken_at ? new Date(media.taken_at * 1000).toLocaleDateString() : 'Recent',
        type: isVideo ? 'Instagram Reel' : 'Instagram Post',
        videoUrl: media.video_url || null,
        postUrl: shortCode ? `https://www.instagram.com/p/${shortCode}/` : null,
        viewOriginalUrl: shortCode ? `https://www.instagram.com/p/${shortCode}/` : null,
        mediaType: isVideo ? 'video' : 'image',
        caption,
      };
    })
    .sort((a: any, b: any) => b.rawScore - a.rawScore);
}

async function searchTikTok(keyword: string) {
  const hashtag = keyword.replace(/\s+/g, '').toLowerCase();
  const actors = [
    {
      id: 'clockworks~tiktok-scraper',
      input: { hashtags: [hashtag], resultsPerPage: 25, maxResults: 25, shouldDownloadVideos: false, shouldDownloadCovers: false },
    },
    {
      id: 'clockworks~tiktok-scraper',
      input: { searchQueries: [keyword], maxResults: 25, shouldDownloadVideos: false },
    },
  ];

  for (const actor of actors) {
    const items = await runApifyActor(actor.id, actor.input, 80);
    if (items.length > 0) {
      return items.map((item: any, i: number) => {
        const views = item.playCount || item.stats?.playCount || item.videoMeta?.playCount || 0;
        const likes = item.diggCount || item.stats?.diggCount || 0;
        const comments = item.commentCount || item.stats?.commentCount || 0;
        const shares = item.shareCount || item.stats?.shareCount || 0;
        const engagement = views > 0 ? ((likes + comments) / views * 100) : 0;
        const vyraScore = Math.min(99, Math.max(50, Math.round(Math.log10(Math.max(views, 1)) * 13 + engagement * 3)));
        const text = item.text || item.desc || item.description || '';
        return {
          id: `tt-${item.id || i}`, platform: 'TikTok',
          hook: text.split('\n')[0]?.slice(0, 120) || 'TikTok Video',
          description: text.slice(0, 400),
          accountName: `@${item.authorMeta?.name || item.author?.uniqueId || item.authorMeta?.nickname || 'creator'}`,
          accountFollowers: item.authorMeta?.fans ? formatNum(item.authorMeta.fans) + ' followers' : '',
          thumbnail: item.covers?.default || item.coverUrl || item.videoMeta?.coverUrl || '', thumbnailEmoji: '🎵',
          views: formatNum(views), likes: formatNum(likes),
          comments: formatNum(comments), shares: formatNum(shares),
          score: vyraScore, rawScore: views,
          postedTime: item.createTime ? new Date(item.createTime * 1000).toLocaleDateString() : 'Recent',
          type: 'TikTok Video',
          videoUrl: item.videoUrl || item.video?.playAddr || null,
          postUrl: item.webVideoUrl || (item.id ? `https://tiktok.com/@${item.authorMeta?.name}/video/${item.id}` : null),
          viewOriginalUrl: item.webVideoUrl || (item.id ? `https://tiktok.com/@${item.authorMeta?.name}/video/${item.id}` : null),
          mediaType: 'video',
        };
      }).sort((a: any, b: any) => b.rawScore - a.rawScore);
    }
  }
  return [];
}

function generateXPosts(keyword: string, page: number) {
  const xHooks = [
    `Thread: Everything I know about ${keyword} after 5 years (you need to read this)`,
    `Unpopular opinion: ${keyword} is the most misunderstood topic online right now`,
    `I spent $50K on ${keyword}. Here's what I learned:`,
    `The ${keyword} playbook nobody is sharing openly:`,
    `Hot take: most ${keyword} advice is completely backwards. Here's why:`,
    `After 10 years in ${keyword}, this is what actually moves the needle:`,
    `${keyword} in 2026 hits different. Here's what changed:`,
    `I went from 0 to $100K with ${keyword}. The full breakdown:`,
    `Stop following ${keyword} gurus. Start doing this instead:`,
    `The ${keyword} truth they don't want you to know:`,
  ];
  return xHooks.map((hook, i) => {
    const baseViews = Math.floor(2000000 / (page * 0.6 + 1) / (i * 0.2 + 1) + Math.random() * 200000);
    const score = Math.min(99, Math.max(50, Math.floor(88 - (i * 1) + Math.random() * 8)));
    return {
      id: `x-p${page}-${i}`, platform: 'X / Twitter', hook,
      description: hook,
      accountName: `@${keyword.toLowerCase().split(' ')[0]}_expert${i}`,
      accountFollowers: `${Math.floor(Math.random() * 200 + 10)}K followers`,
      thumbnail: '', thumbnailEmoji: '✖️',
      views: formatNum(baseViews),
      likes: formatNum(Math.floor(baseViews * 0.04)),
      comments: formatNum(Math.floor(baseViews * 0.005)),
      shares: formatNum(Math.floor(baseViews * 0.025)),
      score, rawScore: baseViews,
      postedTime: `${Math.floor(Math.random() * 14 + 1)} days ago`,
      type: 'X Thread', mediaType: 'text',
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const { keyword, platform, pageToken, page = 0 } = await req.json();
    if (!keyword?.trim()) return NextResponse.json({ results: [], hasMore: false });

    let results: any[] = [];
    let nextPageToken: string | null = null;

    if (platform === 'all') {
      // Fetch ALL platforms simultaneously — then merge and sort purely by virality
      const [ytData, igItems, ttItems] = await Promise.all([
        searchYouTube(keyword, pageToken),
        page === 0 ? searchInstagram(keyword) : Promise.resolve([]),
        page === 0 ? searchTikTok(keyword) : Promise.resolve([]),
      ]);

      nextPageToken = ytData.nextPageToken;

      const ytResults = ytData.results;
      // Use real data where available, mock where not
      const igResults = igItems.length > 0 ? igItems : mockFor(keyword, 'instagram', page, 15);
      const ttResults = ttItems.length > 0 ? ttItems : mockFor(keyword, 'tiktok', page, 15);
      const xResults = generateXPosts(keyword, page);

      // Merge ALL platforms and sort PURELY by rawScore — most viral first regardless of platform
      results = [...ytResults, ...igResults, ...ttResults, ...xResults]
        .sort((a, b) => b.rawScore - a.rawScore);

    } else if (platform === 'youtube') {
      const yt = await searchYouTube(keyword, pageToken);
      nextPageToken = yt.nextPageToken;
      results = yt.results.length > 0 ? yt.results : mockFor(keyword, 'youtube', page);
      results.sort((a, b) => b.rawScore - a.rawScore);

    } else if (platform === 'instagram') {
      const ig = await searchInstagram(keyword);
      results = ig.length > 0 ? ig : mockFor(keyword, 'instagram', page);
      results.sort((a, b) => b.rawScore - a.rawScore);

    } else if (platform === 'tiktok') {
      const tt = await searchTikTok(keyword);
      results = tt.length > 0 ? tt : mockFor(keyword, 'tiktok', page);
      results.sort((a, b) => b.rawScore - a.rawScore);

    } else if (platform === 'x') {
      results = generateXPosts(keyword, page);
      results.sort((a, b) => b.rawScore - a.rawScore);
    }

    const response = NextResponse.json({ results, hasMore: true, nextPageToken });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err: any) {
    console.error('Search error:', err);
    return NextResponse.json({ error: err.message, results: [], hasMore: false }, { status: 500 });
  }
}
