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
  const tag = keyword.replace(/\s+/g, '').toLowerCase();

  try {
    // First try database (fast, high quality, sorted by likes)
    const { supabaseAdmin } = await import('@/lib/supabase');
    const sb = supabaseAdmin();
    const offset = page * 25;
    const { data: dbPosts } = await sb
      .from('instagram_posts')
      .select('*')
      .eq('keyword', tag)
      .order('like_count', { ascending: false })
      .range(offset, offset + 24);

    if (dbPosts && dbPosts.length > 0) {
      return dbPosts.map((post: any, i: number) => {
        const views = post.view_count || 0;
        const rawScore = views > 0 ? views : (post.like_count || 0) * 15;
        const vyraScore = Math.min(99, Math.max(50, Math.round(Math.log10(Math.max(rawScore + 1, 1)) * 11)));
        return {
          id: `ig-${post.id}`, platform: 'Instagram',
          hook: post.hook || 'Instagram Post',
          description: post.caption || '',
          accountName: `@${post.username}`,
          accountFollowers: post.full_name || '',
          thumbnail: post.thumbnail || '', thumbnailEmoji: '📸',
          views: views > 0 ? formatNum(views) : formatNum((post.like_count || 0) * 15),
          likes: formatNum(post.like_count || 0),
          comments: formatNum(post.comment_count || 0),
          shares: '—', score: vyraScore, rawScore,
          postedTime: post.taken_at ? new Date(post.taken_at).toLocaleDateString() : 'Recent',
          type: post.media_type === 'video' ? 'Instagram Reel' : 'Instagram Post',
          videoUrl: null,
          postUrl: post.post_url, viewOriginalUrl: post.post_url,
          mediaType: post.media_type || 'image',
          caption: post.caption || '',
        };
      });
    }

    // Database empty — fetch live from Instagram and trigger background crawl
    const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
    const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
    const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
    if (!sessionId) return [];

    const headers: Record<string, string> = {
      'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
      'X-CSRFToken': csrfToken || '',
      'X-IG-App-ID': '936619743392459',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `https://www.instagram.com/explore/tags/${tag}/`,
    };

    const res = await fetch(`https://www.instagram.com/api/v1/tags/web_info/?tag_name=${encodeURIComponent(tag)}`, {
      headers, signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const sections = [...(data?.data?.top?.sections || []), ...(data?.data?.recent?.sections || [])];
    const medias: any[] = [];
    const seen = new Set<string>();
    for (const s of sections) {
      for (const m of (s?.layout_content?.medias || [])) {
        const media = m?.media || m;
        if (media?.id && !seen.has(media.id) && (media.like_count || 0) >= 100) {
          seen.add(media.id);
          medias.push(media);
        }
      }
    }
    if (!medias.length) return [];
    medias.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    return medias.map((media: any, i: number) => {
      const likes = media.like_count || 0;
      const views = media.view_count || media.play_count || 0;
      const rawScore = views > 0 ? views : likes * 15;
      const vyraScore = Math.min(99, Math.max(50, Math.round(Math.log10(Math.max(rawScore + 1, 1)) * 11)));
      const caption = media.caption?.text || '';
      const isVideo = media.media_type === 2;
      const shortCode = media.code || '';
      const postUrl = shortCode ? (isVideo ? `https://www.instagram.com/reel/${shortCode}/` : `https://www.instagram.com/p/${shortCode}/`) : null;
      const thumbCandidates = media.image_versions2?.candidates || [];
      return {
        id: `ig-${media.id || i}`, platform: 'Instagram',
        hook: caption.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
        description: caption.slice(0, 400),
        accountName: `@${media.user?.username || 'creator'}`,
        accountFollowers: media.user?.full_name || '',
        thumbnail: thumbCandidates[0]?.url || '', thumbnailEmoji: '📸',
        views: views > 0 ? formatNum(views) : formatNum(likes * 15),
        likes: formatNum(likes), comments: formatNum(media.comment_count || 0),
        shares: '—', score: vyraScore, rawScore,
        postedTime: media.taken_at ? new Date(media.taken_at * 1000).toLocaleDateString() : 'Recent',
        type: isVideo ? 'Instagram Reel' : 'Instagram Post',
        videoUrl: media.video_url || null, postUrl, viewOriginalUrl: postUrl,
        mediaType: isVideo ? 'video' : 'image', caption,
      };
    });
  } catch (err) {
    console.error('Instagram search error:', err);
    return [];
  }
}

async function searchTikTok(keyword: string, page = 0) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  if (!scKey) return generateMockTikTok(keyword, page);

  try {
    const cursor = page * 20;
    const url = `https://api.scrapecreators.com/v1/tiktok/search/top?query=${encodeURIComponent(keyword)}&sort_by=most-liked&publish_time=all-time&cursor=${cursor}`;
    const res = await fetch(url, {
      headers: { 'x-api-key': scKey },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { console.error('TikTok SC error:', res.status); return generateMockTikTok(keyword, page); }
    const data = await res.json();
    const items = data?.items || data?.data?.items || data?.videos || [];
    if (!items.length) return generateMockTikTok(keyword, page);

    return items.map((item: any, i: number) => {
      const stats = item.statistics || item.stats || {};
      const views = stats.play_count || item.play_count || item.views || 0;
      const likes = stats.digg_count || item.digg_count || item.likes || 0;
      const comments = stats.comment_count || item.comment_count || 0;
      const shares = stats.share_count || item.share_count || 0;
      const engagement = views > 0 ? ((likes + comments) / views * 100) : 0;
      const vyraScore = Math.min(99, Math.max(50, Math.round(Math.log10(Math.max(views + 1, 1)) * 13 + engagement * 3)));
      const desc = item.desc || item.description || item.text || '';
      const author = item.author?.uniqueId || item.author?.unique_id || item.authorMeta?.name || 'creator';
      const videoId = item.id || item.aweme_id || '';
      const postUrl = videoId ? `https://www.tiktok.com/@${author}/video/${videoId}` : null;
      const cover = item.video?.cover || item.covers?.default || item.cover || item.thumbnail || '';
      return {
        id: `tt-${videoId || i}`, platform: 'TikTok',
        hook: desc.split('\n')[0]?.slice(0, 120) || 'TikTok Video',
        description: desc.slice(0, 400),
        accountName: `@${author}`,
        accountFollowers: item.authorMeta?.fans ? formatNum(item.authorMeta.fans) + ' followers' : '',
        thumbnail: cover, thumbnailEmoji: '🎵',
        views: formatNum(views), likes: formatNum(likes),
        comments: formatNum(comments), shares: formatNum(shares),
        score: vyraScore, rawScore: views,
        postedTime: item.createTime ? new Date(item.createTime * 1000).toLocaleDateString() : 'Recent',
        type: 'TikTok Video',
        videoUrl: item.video?.playAddr || item.videoUrl || null,
        postUrl, viewOriginalUrl: postUrl,
        mediaType: 'video',
      };
    }).sort((a: any, b: any) => b.rawScore - a.rawScore);
  } catch (err) {
    console.error('TikTok error:', err);
    return generateMockTikTok(keyword, page);
  }
}

function generateMockTikTok(keyword: string, page = 0) {
  return MOCK_HOOKS.map((h, i) => {
    const hook = h.replace(/\[keyword\]/g, keyword);
    const views = Math.floor(5000000 / (page * 0.7 + 1) / (i * 0.15 + 1) + Math.random() * 300000);
    return {
      id: `tt-mock-p${page}-${i}`, platform: 'TikTok', hook,
      description: hook, accountName: `@${keyword.toLowerCase().replace(/\s/g, '_')}${i}`,
      accountFollowers: `${Math.floor(Math.random() * 500 + 10)}K followers`,
      thumbnail: '', thumbnailEmoji: '🎵',
      views: formatNum(views), likes: formatNum(Math.floor(views * 0.12)),
      comments: formatNum(Math.floor(views * 0.008)), shares: formatNum(Math.floor(views * 0.03)),
      score: Math.min(99, Math.max(50, Math.floor(92 - page * 2 - i * 0.4))),
      rawScore: views, postedTime: `${Math.floor(Math.random() * 21 + 1)} days ago`,
      type: 'TikTok Video', mediaType: 'video', postUrl: null, viewOriginalUrl: null, videoUrl: null,
    };
  });
}

async function searchX(keyword: string, page = 0) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  if (!scKey) return generateMockX(keyword, page);

  // Top X accounts per niche
  const NICHE_ACCOUNTS: Record<string, string[]> = {
    manifesting: ['lawofattraction', 'gabybernstein', 'tonyrobbins', 'oprah', 'lewishowes'],
    realestate: ['ryanserhant', 'grantcardone', 'biggerpockets', 'therealestaterobot', 'flippingmastery'],
    fitness: ['davidgoggins', 'therock', 'chrisheria', 'athleanx', 'simeonpanda'],
    mindset: ['garyvee', 'tonyrobbins', 'lewishowes', 'edmylett', 'melrobbins'],
    sidehustle: ['alexhormozi', 'garyvee', 'patrickbet_david', 'grahamstephan', 'andrei_jikh'],
    finance: ['grahamstephan', 'andrei_jikh', 'humphreytalks', 'yourrichbff', 'minoritymindset'],
    motivation: ['davidgoggins', 'tonyrobbins', 'garyvee', 'lewishowes', 'edmylett'],
    skincare: ['hyramylan', 'doctorshereene', 'paulaschoice', 'glowrecipe', 'theordinary'],
    spirituality: ['deepakchopra', 'gabybernstein', 'oprah', 'yung_pueblo', 'eckharttolle'],
    wealth: ['alexhormozi', 'grantcardone', 'patrickbet_david', 'robertkiyosaki', 'grahamstephan'],
  };

  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const accounts = NICHE_ACCOUNTS[tag] || NICHE_ACCOUNTS[keyword.split(' ')[0].toLowerCase()] || [];

  if (!accounts.length) return generateMockX(keyword, page);

  try {
    // Pull top tweets from 2 accounts in parallel
    const accountBatch = accounts.slice(page * 2, page * 2 + 2);
    const results = await Promise.all(accountBatch.map(async (handle) => {
      try {
        const res = await fetch(`https://api.scrapecreators.com/v1/twitter/tweets?handle=${handle}`, {
          headers: { 'x-api-key': scKey },
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) return [];
        const data = await res.json();
        const tweets = data?.tweets || data?.data || [];
        return tweets.filter((t: any) => {
          const text = t.full_text || t.text || t.legacy?.full_text || '';
          return text.toLowerCase().includes(keyword.toLowerCase().split(' ')[0]);
        }).slice(0, 10);
      } catch { return []; }
    }));

    const allTweets = results.flat();
    if (!allTweets.length) return generateMockX(keyword, page);

    return allTweets.map((tweet: any, i: number) => {
      const legacy = tweet.legacy || tweet;
      const likes = legacy.favorite_count || tweet.likes || 0;
      const retweets = legacy.retweet_count || tweet.retweets || 0;
      const replies = legacy.reply_count || tweet.replies || 0;
      const views = parseInt(tweet.view_count || tweet.views || '0') || likes * 20;
      const vyraScore = Math.min(99, Math.max(50, Math.round(Math.log10(Math.max(views + 1, 1)) * 10)));
      const text = legacy.full_text || tweet.text || tweet.full_text || '';
      const username = tweet.user?.screen_name || tweet.username || 'user';
      const tweetId = legacy.id_str || tweet.id_str || tweet.id || tweet.rest_id || '';
      const postUrl = tweetId ? `https://twitter.com/${username}/status/${tweetId}` : null;
      return {
        id: `x-${tweetId || i}`, platform: 'X / Twitter',
        hook: text.slice(0, 120),
        description: text.slice(0, 400),
        accountName: `@${username}`,
        accountFollowers: tweet.user?.followers_count ? formatNum(tweet.user.followers_count) + ' followers' : '',
        thumbnail: '', thumbnailEmoji: '✖️',
        views: formatNum(views), likes: formatNum(likes),
        comments: formatNum(replies), shares: formatNum(retweets),
        score: vyraScore, rawScore: views || likes * 20,
        postedTime: legacy.created_at ? new Date(legacy.created_at).toLocaleDateString() : 'Recent',
        type: 'X Post', mediaType: 'text', postUrl, viewOriginalUrl: postUrl, videoUrl: null,
      };
    }).filter((t: any) => t.rawScore > 0)
      .sort((a: any, b: any) => b.rawScore - a.rawScore);
  } catch (err) {
    console.error('X error:', err);
    return generateMockX(keyword, page);
  }
}

function generateMockX(keyword: string, page = 0) {
  const hooks = [
    `Thread: Everything I know about ${keyword} after 5 years`,
    `Unpopular opinion: ${keyword} is the most misunderstood topic online`,
    `I spent $50K on ${keyword}. Here's what I learned:`,
    `The ${keyword} playbook nobody is sharing openly:`,
    `Hot take: most ${keyword} advice is completely backwards.`,
    `After 10 years in ${keyword}, this is what actually moves the needle:`,
    `${keyword} in 2026 hits different. Here's what changed:`,
    `I went from 0 to $100K with ${keyword}. The full breakdown:`,
    `Stop following ${keyword} gurus. Start doing this instead:`,
    `The ${keyword} truth they don't want you to know:`,
  ];
  return hooks.map((hook, i) => {
    const impressions = Math.floor(2000000 / (page * 0.6 + 1) / (i * 0.2 + 1) + Math.random() * 200000);
    return {
      id: `x-mock-p${page}-${i}`, platform: 'X / Twitter', hook,
      description: hook, accountName: `@${keyword.toLowerCase().split(' ')[0]}_expert${i}`,
      accountFollowers: `${Math.floor(Math.random() * 200 + 10)}K followers`,
      thumbnail: '', thumbnailEmoji: '✖️',
      views: formatNum(impressions), likes: formatNum(Math.floor(impressions * 0.04)),
      comments: formatNum(Math.floor(impressions * 0.005)), shares: formatNum(Math.floor(impressions * 0.025)),
      score: Math.min(99, Math.max(50, Math.floor(88 - i * 1 + Math.random() * 8))),
      rawScore: impressions, postedTime: `${Math.floor(Math.random() * 14 + 1)} days ago`,
      type: 'X Thread', mediaType: 'text', postUrl: null, viewOriginalUrl: null, videoUrl: null,
    };
  });
}

async function searchReddit(keyword: string, page = 0) {
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  if (!scKey) return [];

  try {
    const url = `https://api.scrapecreators.com/v1/reddit/subreddit/search?subreddit=all&query=${encodeURIComponent(keyword)}&sort=top&time=all`;
    const res = await fetch(url, {
      headers: { 'x-api-key': scKey },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { console.error('Reddit SC error:', res.status); return []; }
    const data = await res.json();
    const posts = data?.posts || data?.data || data?.results || [];
    if (!posts.length) return [];

    return posts.map((post: any, i: number) => {
      const score = post.votes || post.score || post.ups || 0;
      const comments = post.num_comments || post.comments || 0;
      const vyraScore = Math.min(99, Math.max(50, Math.round(Math.log10(Math.max(score + 1, 1)) * 15)));
      const postUrl = post.permalink ? `https://reddit.com${post.permalink}` : post.url || null;
      return {
        id: `reddit-${post.post_id || post.id || i}`, platform: 'Reddit',
        hook: (post.title || post.name || '').slice(0, 120),
        description: post.selftext?.slice(0, 400) || post.title || '',
        accountName: `u/${post.author || 'user'}`,
        accountFollowers: `r/${post.subreddit?.name || post.subreddit || 'all'}`,
        thumbnail: '', thumbnailEmoji: '🔴',
        views: formatNum(score * 8), likes: formatNum(score),
        comments: formatNum(comments), shares: '—',
        score: vyraScore, rawScore: score,
        postedTime: post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recent',
        type: 'Reddit Post', mediaType: 'text', postUrl, viewOriginalUrl: postUrl, videoUrl: null,
      };
    }).sort((a: any, b: any) => b.rawScore - a.rawScore);
  } catch (err) {
    console.error('Reddit error:', err);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { keyword, platform, pageToken, page = 0 } = await req.json();
    if (!keyword?.trim()) return NextResponse.json({ results: [], hasMore: false });

    let results: any[] = [];
    let nextPageToken: string | null = null;

    if (platform === 'all') {
      const [ytData, igItems, ttItems, xItems] = await Promise.all([
        searchYouTube(keyword, pageToken),
        searchInstagram(keyword, page),
        searchTikTok(keyword, page),
        searchX(keyword, page),
      ]);
      nextPageToken = ytData.nextPageToken;
      const ytResults = ytData.results;
      const igResults = igItems.length > 0 ? igItems : mockFor(keyword, 'instagram', page, 10);
      const ttResults = ttItems.length > 0 ? ttItems : mockFor(keyword, 'tiktok', page, 10);
      results = [...ytResults, ...igResults, ...ttResults, ...xItems]
        .sort((a, b) => b.rawScore - a.rawScore);

    } else if (platform === 'youtube') {
      const yt = await searchYouTube(keyword, pageToken);
      nextPageToken = yt.nextPageToken;
      results = yt.results.length > 0 ? yt.results : mockFor(keyword, 'youtube', page);
      results.sort((a, b) => b.rawScore - a.rawScore);

    } else if (platform === 'instagram') {
      const ig = await searchInstagram(keyword, page);
      results = ig.length > 0 ? ig : mockFor(keyword, 'instagram', page);
      results.sort((a, b) => b.rawScore - a.rawScore);

    } else if (platform === 'tiktok') {
      results = await searchTikTok(keyword, page);
      results.sort((a, b) => b.rawScore - a.rawScore);

    } else if (platform === 'x') {
      results = await searchX(keyword, page);
      results.sort((a, b) => b.rawScore - a.rawScore);

    } else if (platform === 'reddit') {
      results = await searchReddit(keyword, page);
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
