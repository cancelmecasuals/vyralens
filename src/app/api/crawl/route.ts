import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Massive account lists per niche
const NICHE_ACCOUNTS: Record<string, string[]> = {
  manifesting: [
    'gabybernstein','yung_pueblo','the.holistic.psychologist','tonyrobbins','lewishowes',
    'deepakchopra','manifestation_babe','highvibemanifestation','lawofattraction_universe',
    'manifestingwithlaura','iyanlavanzant','the_mindset_mentor','brendonburchard','marieforleo',
    'melrobbins','oprah','eckharttolleonline','jay_shetty','robinsharmaleader','tombilyeu',
    'edmylett','lollydaskal','brendon_burchard','nevillegoddard_official','abrahamhicksquotes',
    'thesecretofficialpage','rhondabyrne','accessconsciousness','nicholasgibbs','spiritualawakeningteam',
  ],
  realestate: [
    'ryan.serhant','grantcardone','biggerpockets','flippingmastery','wholesalinginc',
    'therealestaterobot','realestatetips','investfourmore','brooklinefinancial','donna_exp_realestate',
    'lisabrookemusic','realestatebykevin','coachcarson1','thediaryofaceo','grahamstephan',
    'andrei_jikh','nobuthebuilder','meet_kevin','realestatewithkevin','propertyaquisitions',
    'flippedhouse','reiclub','realestateinvestor','homesnap','zillow',
  ],
  fitness: [
    'davidgoggins','chrisheria','calisthenicsmovement','simeonpanda','mattdoesfitness',
    'athleanx','stevecookfitness','brendancurranjr','mikeohearnofficial','nicktumminello',
    'therock','chrisevans','markwahlberg','nickiminaj','arnoldschwarzenegger',
    'leomessi','christianity','gymshark','nikefootball','crossfit',
    'blogilates','caseyho','kayla_itsines','alexia_clark','natacha.oceane',
    'hannahbronfman','fitnessbydenny','abbypollock','jenselter','brittanydawnfitness',
  ],
  mindset: [
    'garyvee','tonyrobbins','lewishowes','edmylett','melrobbins',
    'the_mindset_mentor','brendonburchard','marieforleo','impacttheory','jay_shetty',
    'robinsharmaleader','tombilyeu','lollydaskal','thediaryofaceo','simonsinek',
    'brenebrowntheauthor','gregmckeown_author','adamgrant','danielpink','sethmgodin',
    'jamesaltuchershow','timferriss','ryanholiday','markmanson_net','jordanbpeterson',
  ],
  sidehustle: [
    'alexhormozi','garyvee','patrickbet_david','grahamstephan','andrei_jikh',
    'minoritymindset','nateobrien','danielmartinfeld','humprey_yang','tombilyeu',
    'shondarhimes','mrbeastyt','mkbhd','austinmahone','dantalksbusiness',
    'harisonmaddock','jasonpartnership','andrewkirby__','tobiasbecker','chriswillx',
    'codie_sanchez','justinwelsh','nickmathieson','gregisenberg','foundersbrand',
  ],
  finance: [
    'grahamstephan','andrei_jikh','minoritymindset','humphreytalks','yourrichbff',
    'nateobrien','chloefinancials','humprey_yang','brianhygienics','danielmartinfeld',
    'alexhormozi','patrickbet_david','garyvee','tonyrobbins','robertkiyosaki',
    'warren.buffett.official','elonmusk','daviddeutsch__','realraydalio','benkhorlin',
    'thepersonalfinanceclub','iamjerichofinance','caleb.hammer','sellingsunset','phroogal',
  ],
  motivation: [
    'garyvee','lewishowes','edmylett','davidgoggins','tonyrobbins',
    'melrobbins','brendonburchard','the_mindset_mentor','goalcast','impacttheory',
    'jay_shetty','robinsharmaleader','tombilyeu','thediaryofaceo','simonsinek',
    'erinmayhenry','shondarhimes','lisanichols_official','iyanlavanzant','lisabilyeu',
    'motivationmafia','unlockyourgrandeur','dailymotivation','motivationmentalist','innermotivation',
  ],
  skincare: [
    'hyramylan','doctorshereene','skincarebyalana','glowrecipe','paulaschoice',
    'beautylabofficial','drbaileyskincare','theordinary_official','farahhair','skincarewithjo',
    'drjenniferharper','skin_pharmacist','drshereene','drmaryamhomayoun','askderm',
    'eminenceorganics','tatcha','drbarbarasturm','drdenisegross','firstaidbeauty',
    'cerave','neutrogena','larocheposay','skinmedica','skinceuticals',
  ],
  spirituality: [
    'deepakchopra','gabybernstein','iyanlavanzant','yung_pueblo','thirdeyethoughts',
    'highvibemanifestation','the.holistic.psychologist','maryamhasnaa','abundancequeen','eckharttolleonline',
    'oprah','jay_shetty','sacredserpentess','thirdeyeopening','spiritjunkie',
    'mooji_official','adyashantiteachings','rupertspira','pemachodron','tichnatnhanh',
    'matthaig','brenebrowntheauthor','brenebrown','elizabethgilbert_author','glennondomyle',
  ],
  wealth: [
    'alexhormozi','grantcardone','garyvee','patrickbet_david','tonyrobbins',
    'grahamstephan','andrei_jikh','minoritymindset','nateobrien','robertkiyosaki',
    'elonmusk','jeffbezos','billgates','warren.buffett.official','ryanholiday',
    'codie_sanchez','chriswillx','andrewkirby__','tobiasbecker','jasonpartnership',
    'wealthbuilderway','wealthmindsetdaily','millionairementor','wealthygorilla','selfmadesuccess',
  ],
};

// Massive related hashtag lists
const RELATED_TAGS: Record<string, string[]> = {
  manifesting: ['manifesting','manifestation','manifest','lawofattraction','lawofassumption','abundance','affirmations','manifestyourdreams','manifestationcoach','manifestinglife','manifestingmiracles','manifestingyourdreams','lawofattractionworks','abundancemindset','manifestationquotes','lawofattractiontips','manifestationtips','abundanceaffirmations','positivemindset','attractionlaw','thesecret','vibration','highvibe','universallaw','quantumlaw'],
  realestate: ['realestate','realestateagent','realtor','realestateinvesting','realestatelife','househunting','realestatetips','propertyinvestment','realestatemarket','homeforsale','realestateinvestor','rentalproperties','commercialrealestate','realestatephotography','newlisting','justlisted','dreamhome','houseflipping','wholesalerealestate','realestatememes'],
  fitness: ['fitness','workout','gym','fitnessmotivation','bodybuilding','fitnessjourney','exercise','fitfam','weightloss','gymlife','fitnessinspiration','personaltrainer','healthylifestyle','musclebuilding','cardio','strengthtraining','crossfit','yoga','pilates','fitnesstransformation','gains','workoutmotivation','fitlife','noexcuses','beastmode'],
  mindset: ['mindset','growthmindset','mindsetcoach','successmindset','mindsetshift','positivemindset','entrepreneurmindset','wealthmindset','successcoach','lifecoach','personaldevelopment','selfimprovement','mindsetmatters','levelup','mindsetiseverything','disciplinemindset','hardwork','grindset','successhabits','winnersmindset'],
  sidehustle: ['sidehustle','makemoneyonline','passiveincome','entrepreneurship','onlinebusiness','workfromhome','digitalmarketing','dropshipping','affiliate','freelancing','contentcreator','solopreneur','hustle','grind','businessowner','startup','ecommerce','socialmediamarketing','emailmarketing','digitalproducts'],
  finance: ['finance','investing','personalfinance','financialfreedom','money','wealthbuilding','stockmarket','crypto','budgeting','savingmoney','debtfree','financialindependence','retirementplanning','dividendinvesting','indexfunds','realestateinvesting','frugal','moneymanagement','financialliteracy','buildingwealth'],
  motivation: ['motivation','motivationalquotes','inspired','success','hustle','goals','discipline','grind','hardwork','nevergiveup','mindset','inspiration','positivity','successmindset','motivationmonday','workhardplayhard','dreambig','believeinyourself','makeithappen','focusonyourgoals'],
  skincare: ['skincare','skincareRoutine','glowingskin','skincaretips','beauty','selfcare','clearskin','skincarecommunity','antiaging','moisturizer','sunscreen','retinol','vitaminc','hyaluronicacid','niacinamide','glowup','skincarejunkie','koreanbeauty','naturalbeauty','glowingskincare'],
  spirituality: ['spirituality','spiritual','spiritualawakening','consciousness','meditation','mindfulness','highvibe','energy','chakras','crystals','universe','divine','thirdeye','awakening','soulpurpose','innerwisdom','lightworker','starseed','sacredgeometry','vibration'],
  wealth: ['wealth','wealthmindset','millionaire','financialfreedom','richlife','abundance','moneymindset','invest','buildingwealth','wealthcreation','financialgoals','moneymoves','cashflow','assets','networth','passive income','luxurylife','successstory','entrepreneur','wealthylifestyle'],
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRAWL_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keyword = req.nextUrl.searchParams.get('keyword') || 'manifesting';
  const tag = keyword.replace(/\s+/g, '').toLowerCase();
  const scKey = process.env.SCRAPECREATORS_API_KEY?.trim();
  const bdToken = process.env.BRIGHT_DATA_API_KEY?.trim();
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN?.trim();
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();

  if (!scKey || !bdToken) return NextResponse.json({ error: 'Missing API keys' });

  const allUrls: string[] = [];
  const seen = new Set<string>();
  const sources: Record<string, number> = {};

  const addUrl = (url: string) => {
    if (url && !seen.has(url)) { seen.add(url); allUrls.push(url); return true; }
    return false;
  };

  const accounts = NICHE_ACCOUNTS[tag] || NICHE_ACCOUNTS[keyword.split(' ')[0].toLowerCase()] || [];
  const relatedTags = RELATED_TAGS[tag] || RELATED_TAGS[keyword.split(' ')[0].toLowerCase()] || [tag];

  // SOURCE 1: Viral niche accounts (top posts = highest likes ever)
  const accountResults = await Promise.all(
    accounts.slice(0, 20).map(async (handle) => {
      try {
        const res = await fetch(
          `https://api.scrapecreators.com/v2/instagram/user/posts?handle=${handle}&limit=20`,
          { headers: { 'x-api-key': scKey }, signal: AbortSignal.timeout(10000) }
        );
        if (!res.ok) return 0;
        const data = await res.json();
        const posts = Array.isArray(data?.posts) ? data.posts :
                      Array.isArray(data?.data) ? data.data :
                      Array.isArray(data) ? data : [];
        let count = 0;
        for (const p of posts) {
          const url = p.url || p.postUrl || p.permalink;
          if (url && addUrl(url)) count++;
        }
        return count;
      } catch { return 0; }
    })
  );
  sources.accounts = accountResults.reduce((a, b) => a + b, 0);

  // SOURCE 2: ScrapeCreators Google search (most relevant viral reels)
  try {
    const scRes = await fetch(
      `https://api.scrapecreators.com/v2/instagram/reels/search?query=${encodeURIComponent(keyword)}`,
      { headers: { 'x-api-key': scKey }, signal: AbortSignal.timeout(12000) }
    );
    if (scRes.ok) {
      const scData = await scRes.json();
      let count = 0;
      for (const r of (scData?.reels || [])) {
        if (r.url && addUrl(r.url)) count++;
      }
      sources.googleSearch = count;
    }
  } catch { }

  // SOURCE 3: Session cookie - ALL related hashtags in parallel
  if (sessionId) {
    const igHeaders: Record<string, string> = {
      'Cookie': `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId};`,
      'X-CSRFToken': csrfToken || '',
      'X-IG-App-ID': '936619743392459',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    };
    const hashtagResults = await Promise.all(
      relatedTags.slice(0, 20).map(async (t) => {
        try {
          const res = await fetch(
            `https://www.instagram.com/api/v1/tags/web_info/?tag_name=${t}`,
            { headers: { ...igHeaders, 'Referer': `https://www.instagram.com/explore/tags/${t}/` }, signal: AbortSignal.timeout(8000) }
          );
          if (!res.ok) return 0;
          const data = await res.json();
          const sections = [...(data?.data?.top?.sections || []), ...(data?.data?.recent?.sections || [])];
          let count = 0;
          for (const s of sections) {
            for (const m of (s?.layout_content?.medias || [])) {
              const media = m?.media || m;
              const code = media?.code;
              if (code) {
                const isVideo = media?.media_type === 2;
                const url = `https://www.instagram.com/${isVideo ? 'reel' : 'p'}/${code}/`;
                if (addUrl(url)) count++;
              }
            }
          }
          return count;
        } catch { return 0; }
      })
    );
    sources.hashtags = hashtagResults.reduce((a, b) => a + b, 0);
  }

  if (!allUrls.length) return NextResponse.json({ error: 'No URLs found', keyword });

  // ENRICH: Bright Data gets real like counts for all URLs
  // Process in batches of 100 (BD limit per request)
  const allPosts: any[] = [];
  const batches = [];
  for (let i = 0; i < Math.min(allUrls.length, 300); i += 100) {
    batches.push(allUrls.slice(i, i + 100));
  }

  for (const batch of batches) {
    try {
      const bdRes = await fetch(
        `https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lk5ns7kz21pck8jpis&format=json`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${bdToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(batch.map(url => ({ url }))),
          signal: AbortSignal.timeout(55000),
        }
      );
      if (bdRes.ok) {
        const posts = await bdRes.json();
        if (Array.isArray(posts)) allPosts.push(...posts);
      }
    } catch { continue; }
  }

  // Filter quality posts and sort by likes
  const sorted = allPosts
    .filter((p: any) => (p.likes || p.num_likes || 0) >= 500)
    .sort((a: any, b: any) => (b.likes || b.num_likes || 0) - (a.likes || a.num_likes || 0));

  // Store in Supabase
  const { supabaseAdmin } = await import('@/lib/supabase');
  const sb = supabaseAdmin();
  let saved = 0;

  for (const post of sorted) {
    const likes = post.likes || post.num_likes || 0;
    const comments = post.num_comments || post.comments || 0;
    const views = post.video_view_count || post.video_play_count || post.views || 0;
    const rawScore = views > 0 ? views : likes * 15;
    const isVideo = post.content_type === 'video' || !!post.video_url;
    const caption = post.description || post.caption || '';
    const postUrl = post.url || null;
    const shortcode = post.shortcode || postUrl?.split('/reel/')?.[1]?.split('/')?.[0] || postUrl?.split('/p/')?.[1]?.split('/')?.[0] || '';

    await sb.from('instagram_posts').upsert({
      id: shortcode || `bd-${saved}`,
      keyword: tag, platform: 'Instagram',
      hook: caption.split('\n')[0]?.slice(0, 120) || 'Instagram Post',
      caption, username: post.user_posted || '',
      full_name: post.user_posted || '',
      like_count: likes, comment_count: comments, view_count: views,
      raw_score: rawScore, media_type: isVideo ? 'video' : 'image',
      shortcode, post_url: postUrl,
      thumbnail: post.thumbnail || post.display_url || '',
      taken_at: post.date_posted ? new Date(post.date_posted).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    saved++;
  }

  return NextResponse.json({
    keyword,
    sources,
    totalUrlsFound: allUrls.length,
    bdProcessed: allPosts.length,
    qualityPosts: sorted.length,
    saved,
    topLikes: sorted[0]?.likes || sorted[0]?.num_likes || 0,
    top5: sorted.slice(0, 5).map((p: any) => ({
      likes: p.likes || p.num_likes,
      username: p.user_posted,
      url: p.url,
      caption: p.description?.slice(0, 60),
    })),
  });
}
