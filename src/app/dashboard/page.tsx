'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

const C = {
  bg: '#080808', surface: '#101010', surfaceAlt: '#141414',
  border: 'rgba(255,255,255,0.08)', borderHi: 'rgba(255,255,255,0.14)',
  violet: '#F5A623', violetLight: '#FFB73D', violetDim: 'rgba(245,166,35,0.12)',
  navy: '#0D0D0D', gold: '#F5A623',
  text: '#FFFFFF', textSub: 'rgba(255,255,255,0.45)', textDim: 'rgba(255,255,255,0.15)',
  success: '#5BB88A', error: '#E05C5C', blue: '#6B9FE4',
};

const PLATFORMS = [
  { id: 'all', label: 'All Platforms', icon: '🌐' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: '#ff0050' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000' },
  { id: 'reddit', label: 'Reddit', icon: '🔴', color: '#FF4500' },
];

const NAV_ITEMS = [
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'trending', label: 'Trending Now', icon: '🔥' },
  { id: 'saved', label: 'Saved', icon: '🔖' },
  { id: 'competitors', label: 'Spy Mode', icon: '🕵️' },
  { id: 'patterns', label: 'Pattern Library', icon: '📚' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'predictor', label: 'Predictor', icon: '⚡' },
];

const CONTENT_FORMATS = [
  'TikTok Script', 'Instagram Caption', 'YouTube Script (Short)', 'YouTube Script (Long)',
  'X Thread', 'X Single Post', 'Instagram Reel Script', 'Reddit Post', 'LinkedIn Post',
];

const VIRAL_PATTERNS = [
  { name: 'The Reveal Hook', desc: 'Start with an unexpected reveal that contradicts expectations', example: '"Nobody tells you this about [topic]..."', avgScore: 94, platforms: ['TikTok', 'Instagram'] },
  { name: 'Unpopular Opinion', desc: 'Take a controversial stance that sparks debate and comments', example: '"Hot take: [contrarian view] and here\'s why..."', avgScore: 91, platforms: ['X', 'Reddit'] },
  { name: 'Before & After', desc: 'Show dramatic transformation — creates emotional investment', example: '"6 months ago I had [problem]. Now [result]."', avgScore: 88, platforms: ['Instagram', 'TikTok'] },
  { name: 'Storytime Format', desc: 'Personal narrative with conflict, tension, and resolution', example: '"The day I [dramatic event] changed everything..."', avgScore: 87, platforms: ['TikTok', 'YouTube'] },
  { name: 'List Hook', desc: 'Promise specific numbered value — highly clickable', example: '"5 things [authority figures] don\'t want you to know..."', avgScore: 85, platforms: ['YouTube', 'Instagram'] },
  { name: 'Question Hook', desc: 'Open loop that can only be closed by watching', example: '"What happens when you [unexpected action]?"', avgScore: 83, platforms: ['All Platforms'] },
];

// Mock data generator for demo results
function generateMockResults(keyword: string, platform: string) {
  const templates = [
    { hook: `Nobody talks about this ${keyword} secret`, type: 'Reveal Hook', views: '2.4M', likes: '189K', comments: '4.2K', shares: '28K', score: 96 },
    { hook: `Hot take: everything you know about ${keyword} is wrong`, type: 'Unpopular Opinion', views: '1.8M', likes: '142K', comments: '8.7K', shares: '19K', score: 91 },
    { hook: `I tried ${keyword} for 30 days. Here's what happened`, type: 'Before & After', views: '3.1M', likes: '241K', comments: '6.1K', shares: '44K', score: 94 },
    { hook: `The ${keyword} strategy nobody is teaching`, type: 'Value Hook', views: '987K', likes: '78K', comments: '2.3K', shares: '12K', score: 87 },
    { hook: `POV: You finally understand ${keyword}`, type: 'POV Format', views: '1.2M', likes: '95K', comments: '3.8K', shares: '15K', score: 89 },
    { hook: `5 ${keyword} mistakes everyone makes`, type: 'List Hook', views: '4.2M', likes: '312K', comments: '9.4K', shares: '67K', score: 97 },
  ];

  const platforms = platform === 'all'
    ? ['TikTok', 'Instagram', 'YouTube', 'Reddit', 'X']
    : [PLATFORMS.find(p => p.id === platform)?.label || 'TikTok'];

  return templates.map((t, i) => ({
    id: `${keyword}-${i}`,
    ...t,
    platform: platforms[i % platforms.length],
    postedTime: `${Math.floor(Math.random() * 6) + 1} days ago`,
    accountName: `@${['creator_pro', 'viralking', 'trending_now', 'contentqueen', 'growth_hacker', 'viral_vault'][i]}`,
    accountFollowers: `${[124, 89, 445, 210, 67, 312][i]}K followers`,
    thumbnail: ['🏠', '💰', '🚀', '💡', '🔥', '⚡'][i],
  }));
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [checkingSub, setCheckingSub] = useState(true);
  const [activeNav, setActiveNav] = useState('search');
  const [keyword, setKeyword] = useState('');
  const [activePlatform, setActivePlatform] = useState('all');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [redditAfter, setRedditAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [analysis, setAnalysis] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [transcribeStatus, setTranscribeStatus] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('TikTok Script');
  const [niche, setNiche] = useState('');
  const [userStyle, setUserStyle] = useState('');
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [competitorHandle, setCompetitorHandle] = useState('');
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [predictorText, setPredictorText] = useState('');
  const [prediction, setPrediction] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [calendarItems, setCalendarItems] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    import('@/lib/supabase').then(m => m.supabase.auth.getUser()).then(({ data: { user } }) => {
      if (!user) router.push('/login');
      else {
        setUser(user);
        fetch(`/api/stripe/subscription?userId=${user.id}`)
          .then(r => r.json())
          .then(data => { setSubscription(data.subscription); setCheckingSub(false); })
          .catch(() => setCheckingSub(false));
      }
    });

    // Generate trending data on mount
    setTrendingData(generateMockResults('trending', 'all').map((r, i) => ({
      ...r,
      keyword: ['Real Estate', 'AI Tools', 'Side Hustle', 'Fitness', 'Finance', 'Travel'][i],
      growth: `+${[234, 189, 456, 123, 678, 345][i]}%`,
    })));
  }, []);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setSearching(true);
    setResults([]);
    setSelectedPost(null);
    setAnalysis('');
    setGeneratedScript('');
    setNextPageToken(null);
    setRedditAfter(null);
    setHasMore(false);
    setCurrentPage(0);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, platform: activePlatform, page: 0, dateFilter }),
      });
      const data = await res.json();
      setResults(data.results || []);
      setNextPageToken(data.nextPageToken || null);
      setRedditAfter(data.redditAfter || null);
      setHasMore(data.hasMore !== false);
    } catch {
      setHasMore(true);
    }
    setSearching(false);
  };

  const loadMore = async () => {
    if (loadingMore || !keyword.trim()) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, platform: activePlatform, pageToken: nextPageToken, redditAfter, page: nextPage, dateFilter }),
      });
      const data = await res.json();
      setResults(prev => {
        const combined = [...prev, ...(data.results || [])];
        const seen = new Set<string>();
        return combined
          .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; })
          .sort((a, b) => (b.rawScore || b.score * 10000) - (a.rawScore || a.score * 10000));
      });
      setNextPageToken(data.nextPageToken || null);
      setRedditAfter(data.redditAfter || null);
      setHasMore(data.hasMore !== false);
      setCurrentPage(nextPage);
    } catch { }
    setLoadingMore(false);
  };

  const analyzePost = async (post: any) => {
    setSelectedPost(post);
    setAnalysis('');
    setGeneratedScript('');
    setActiveTab('analysis');
    setTranscribeStatus('');
    setAnalyzing(true);

    // Step 1 — transcribe video content
    let transcriptSection = '';
    if (post.mediaType === 'video' && (post.videoId || post.videoUrl)) {
      setTranscribeStatus('🎙️ Transcribing audio...');
      try {
        const tRes = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: post.videoUrl,
            videoId: post.videoId,
            platform: post.platform,
            caption: post.description || post.hook,
          }),
        });
        const tData = await tRes.json();
        if (tData.transcript) {
          const source = tData.source === 'audio' ? '✅ Transcribed audio —' : '📝 Analyzing caption —';
          transcriptSection = `\nCONTENT:\n"${tData.transcript}"\n`;
          setTranscribeStatus(`${source} analyzing...`);
        } else {
          setTranscribeStatus('🧠 Analyzing from metadata...');
        }
      } catch {
        setTranscribeStatus('🧠 Analyzing from metadata...');
      }
    } else if (post.mediaType === 'text') {
      setTranscribeStatus('📖 Reading full post text...');
      if (post.selfText) transcriptSection = `\nFULL POST TEXT:\n"${post.selfText}"\n`;
      if (post.description) transcriptSection += `\nDESCRIPTION: ${post.description}`;
    }

    setTranscribeStatus('🧠 Running viral analysis...');

    const prompt = `You are a world-class viral content strategist. Analyze this real viral ${post.platform} post.

POST DETAILS:
Title/Hook: "${post.hook}"
Platform: ${post.platform}
Account: ${post.accountName} ${post.accountFollowers}
Views: ${post.views} | Likes: ${post.likes} | Comments: ${post.comments} | Shares: ${post.shares}
Posted: ${post.postedTime}
VYRA Score: ${post.score}/100
${transcriptSection}

Provide a detailed viral analysis:

🪝 HOOK ANALYSIS
Why does this hook stop the scroll? What specific psychological trigger does it use?

📐 CONTENT STRUCTURE
Break down the exact structure — opening, middle, close.

🧠 VIRAL TRIGGERS
List the specific emotional and psychological triggers. Why do people share this?

⏰ TIMING & DISTRIBUTION
Why this works on ${post.platform}. Best posting times. Algorithm insights.

🎯 THE FORMULA
The replicable viral formula in 2-3 sentences any creator can use immediately.`;

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setTranscribeStatus('');
      if (data.error) {
        setAnalysis(`⚠️ Error: ${data.error}`);
      } else {
        setAnalysis(data.result || 'No analysis returned.');
      }
    } catch (err: any) {
      setTranscribeStatus('');
      setAnalysis(`⚠️ Connection error: ${err.message}`);
    }
    setAnalyzing(false);
  };

  const generateContent = async () => {
    if (!selectedPost) return;
    setGenerating(true);
    setGeneratedScript('');

    const prompt = `You are an expert content creator and viral growth strategist.

VIRAL REFERENCE POST:
Hook: "${selectedPost.hook}"
Platform: ${selectedPost.platform}
Performance: ${selectedPost.views} views, VYRA Score ${selectedPost.score}/100
Hook Type: ${selectedPost.type}

USER'S DETAILS:
Target Platform: ${selectedFormat}
Niche: ${niche || 'general content creation'}
${userStyle ? `Their posting style (learn from this): ${userStyle}` : ''}

Create a complete, ready-to-post ${selectedFormat} that:
1. Uses the same proven viral formula as the reference post
2. Is completely adapted for the "${niche || 'content creation'}" niche
3. Sounds natural and authentic${userStyle ? ', matching their style' : ''}
4. Is optimized specifically for ${selectedFormat}
5. Includes hook, body, and CTA

Format it cleanly with clear sections. Make it immediately usable with zero editing needed.`;

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setGeneratedScript(data.result || '');

      // Add to calendar
      setCalendarItems(prev => [...prev, {
        id: Date.now(),
        title: `${selectedFormat}: ${niche || keyword}`,
        script: data.result,
        platform: selectedFormat.split(' ')[0],
        date: new Date(Date.now() + 86400000 * (prev.length + 1)).toLocaleDateString(),
        status: 'draft',
      }]);
    } catch {
      setGeneratedScript('Content generation unavailable. Please try again.');
    }
    setGenerating(false);
  };

  const predictPerformance = async () => {
    if (!predictorText.trim()) return;
    setPredicting(true);
    setPrediction('');

    const prompt = `You are a viral content performance analyst with deep expertise in social media algorithms.

Analyze this draft content and predict its viral potential:

"${predictorText}"

Provide:

📊 VYRASCORE PREDICTION: X/100
Give a specific score and explain the exact calculation.

🪝 HOOK STRENGTH: [Weak/Moderate/Strong/Exceptional]
Analyze the opening hook specifically.

⚠️ WEAKNESSES
List the 2-3 specific things holding this back from going viral.

✅ IMPROVEMENTS
Give 3 specific, actionable rewrites that would significantly boost performance. Show before/after.

🏆 OPTIMIZED VERSION
Rewrite the entire piece with all improvements applied. Make it genuinely viral.`;

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setPrediction(data.result || '');
    } catch {
      setPrediction('Prediction unavailable. Please try again.');
    }
    setPredicting(false);
  };

  const savePost = (post: any) => {
    if (!savedPosts.find(p => p.id === post.id)) {
      setSavedPosts(prev => [...prev, post]);
    }
  };

  const addCompetitor = () => {
    if (competitorHandle.trim() && !competitors.includes(competitorHandle)) {
      setCompetitors(prev => [...prev, competitorHandle.trim()]);
      setCompetitorHandle('');
    }
  };

  if (!user || checkingSub) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style dangerouslySetInnerHTML={{__html:`@keyframes spin { to { transform: rotate(360deg); } }`}}/>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTop: `3px solid ${C.violet}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: C.textSub, fontSize: 14, fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>Loading VYRA...</p>
      </div>
    </div>
  );

  // Paywall
  if (!subscription) {
    const plans = [
      { id: 'creator', name: 'Creator', price: 39, desc: 'For solo creators building their audience', features: ['All platforms', '500 searches/month', 'AI viral breakdown', 'Script generator', '30-day guarantee'], highlight: false },
      { id: 'pro', name: 'Pro', price: 99, desc: 'For serious creators scaling fast', features: ['Unlimited searches', 'All platforms', 'Advanced AI analysis', 'Voice-matched scripts', 'Priority support', '30-day guarantee'], highlight: true },
      { id: 'agency', name: 'Agency', price: 199, desc: 'For teams managing multiple brands', features: ['Everything in Pro', '10 team seats', 'White-label reports', 'API access', 'Dedicated support', '30-day guarantee'], highlight: false },
    ];

    const handlePlanClick = async (planId: string) => {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, userId: user.id, userEmail: user.email }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
        else alert(`Error: ${data.error || 'Unknown error'}`);
      } catch (e: any) { alert(`Error: ${e.message}`); }
    };

    return (
      <div style={{ minHeight: '100vh', background: '#080808', fontFamily: "'Satoshi', 'Satoshi', 'DM Sans', sans-serif", overflowY: 'auto' }}>
        <style dangerouslySetInnerHTML={{__html:`
          @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&f[]=cabinet-grotesk@800,700,500&display=swap');
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.3); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(245,166,35,0.5); }
        * { scrollbar-width: thin; scrollbar-color: rgba(245,166,35,0.3) #080808; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .pw-plan { transition: all 0.25s; cursor: pointer; }
          .pw-plan:hover { transform: translateY(-4px); }
          .pw-plan.hl { background: rgba(245,166,35,0.06) !important; border-color: rgba(245,166,35,0.4) !important; box-shadow: 0 0 60px rgba(245,166,35,0.1); }
          .noise { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.02; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); }
        `}}/>
        <div className="noise" />
        <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'rgba(245,166,35,0.05)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64, animation: 'fadeUp 0.5s ease' }}>
            <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 32, color: '#fff' }}>
              VYRA<span style={{ color: '#F5A623' }}>.</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', color: '#F5A623', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 28 }}>
              ✦ 30-Day Money-Back Guarantee
            </div>
            <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', marginBottom: 18, lineHeight: 1.05 }}>
              The viral content engine<br />that <span style={{ color: '#F5A623' }}>pays for itself.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
              One viral post discovered and replicated pays for months of subscription.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 48, animation: 'fadeUp 0.5s ease 0.1s both' }}>
            {plans.map((plan) => (
              <div key={plan.id} className={`pw-plan ${plan.highlight ? 'hl' : ''}`}
                onClick={() => handlePlanClick(plan.id)}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '36px 28px', position: 'relative' }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#F5A623', color: '#080808', fontSize: 11, fontWeight: 800, padding: '4px 18px', borderRadius: 20, whiteSpace: 'nowrap' as const, letterSpacing: '0.08em' }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 12 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 52, fontWeight: 700, color: plan.highlight ? '#F5A623' : '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>${plan.price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>/mo</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28, lineHeight: 1.5 }}>{plan.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                      <span style={{ color: '#F5A623' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <div style={{ width: '100%', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: plan.highlight ? '#F5A623' : 'rgba(255,255,255,0.06)', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)', color: plan.highlight ? '#080808' : 'rgba(255,255,255,0.7)', textAlign: 'center' as const }}>
                  Get {plan.name} →
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease 0.2s both' }}>
            {['🔒 Secure payment via Stripe', '↩️ 30-day money-back guarantee', '✕ Cancel anytime'].map((item, i) => (
              <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&f[]=cabinet-grotesk@800,700,500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        input:focus, textarea:focus { outline: none; }
        .nav-item:hover { background: rgba(245,166,35,0.08) !important; color: #FFB73D !important; }
        .result-card:hover { border-color: #F5A623 !important; transform: translateY(-2px); }
        .save-btn:hover { background: rgba(108,99,255,0.2) !important; }
        .platform-tab:hover { border-color: #F5A623 !important; }
        .copy-btn:hover { background: rgba(108,99,255,0.2) !important; }
      `}}/>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: sidebarOpen ? 240 : 72, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', flexShrink: 0, position: 'fixed', top: 0, bottom: 0, zIndex: 50, overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #0D0D0D, #F5A623)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>V</div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 18, color: C.text, whiteSpace: 'nowrap' }}>VYRA<span style={{ color: '#F5A623' }}>.</span></span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} className="nav-item" onClick={() => setActiveNav(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: activeNav === item.id ? 'rgba(245,166,35,0.12)' : 'transparent', color: activeNav === item.id ? C.violet : C.textSub, fontSize: 14, fontWeight: activeNav === item.id ? 600 : 400, fontFamily: "'Satoshi', 'DM Sans', sans-serif", transition: 'all 0.15s', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: `1px solid ${C.border}` }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', marginBottom: 4, fontSize: 12, color: C.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          )}
          {subscription && (
            <button onClick={async () => {
              const res = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: subscription.stripe_customer_id }),
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }} className="nav-item"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'transparent', color: C.textSub, fontSize: 14, fontFamily: "'Satoshi', 'DM Sans', sans-serif", width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', marginBottom: 4 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💳</span>
              {sidebarOpen && 'Manage Billing'}
            </button>
          )}
          <button onClick={() => { import('@/lib/supabase').then(m => m.supabase.auth.signOut()); router.push('/'); }} className="nav-item"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'transparent', color: C.textSub, fontSize: 14, fontFamily: "'Satoshi', 'DM Sans', sans-serif", width: '100%', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🚪</span>
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, marginLeft: sidebarOpen ? 240 : 72, minHeight: '100vh', transition: 'margin-left 0.3s ease', overflow: 'auto' }}>

        {/* ── SEARCH TAB ── */}
        {activeNav === 'search' && (
          <div style={{ padding: '32px 32px' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', fontFamily: "'Cabinet Grotesk', 'Satoshi', sans-serif", marginBottom: 6 }}>Find Viral Content</h1>
              <p style={{ color: C.textSub, fontSize: 15 }}>Search any keyword across every platform simultaneously</p>
            </div>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input value={keyword} onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Enter any keyword, niche, or topic..."
                style={{ flex: 1, padding: '14px 18px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 16, fontFamily: "'Satoshi', 'DM Sans', sans-serif", transition: 'border-color 0.2s' }} />
              <button onClick={handleSearch} disabled={searching}
                style={{ padding: '14px 28px', background: '#F5A623', border: 'none', borderRadius: 12, color: '#080808', fontSize: 15, fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif", opacity: searching ? 0.8 : 1, whiteSpace: 'nowrap' }}>
                {searching ? '⟳ Searching...' : '🔍 Search'}
              </button>
            </div>

            {/* Platform filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => (
                <button key={p.id} className="platform-tab" onClick={() => {
                    setActivePlatform(p.id);
                    if (keyword.trim()) {
                      setResults([]);
                      setNextPageToken(null);
                      setRedditAfter(null);
                      setSelectedPost(null);
                      setCurrentPage(0);
                      setHasMore(false);
                      setSearching(true);
                      fetch('/api/search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ keyword, platform: p.id, page: 0, dateFilter }),
                      }).then(r => r.json()).then(data => {
                        setResults(data.results || []);
                        setNextPageToken(data.nextPageToken || null);
                        setRedditAfter(data.redditAfter || null);
                        setHasMore(data.hasMore !== false);
                        setSearching(false);
                      }).catch(() => setSearching(false));
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: `1px solid ${activePlatform === p.id ? C.violet : C.border}`, background: activePlatform === p.id ? C.violetDim : 'transparent', color: activePlatform === p.id ? C.violet : C.textSub, fontSize: 13, fontWeight: activePlatform === p.id ? 600 : 400, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif", transition: 'all 0.15s' }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Date filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.textSub, marginRight: 4 }}>Time period:</span>
              {[
                { id: 'all', label: '🏆 All Time' },
                { id: 'year', label: '📅 This Year' },
                { id: 'month', label: '🗓 This Month' },
                { id: 'week', label: '⚡ This Week' },
              ].map(f => (
                <button key={f.id} onClick={() => {
                  setDateFilter(f.id);
                  if (keyword.trim() && results.length > 0) {
                    setResults([]);
                    setCurrentPage(0);
                    setSearching(true);
                    fetch('/api/search', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ keyword, platform: activePlatform, page: 0, dateFilter: f.id }),
                    }).then(r => r.json()).then(data => {
                      setResults(data.results || []);
                      setHasMore(data.hasMore !== false);
                      setSearching(false);
                    }).catch(() => setSearching(false));
                  }
                }}
                  style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${dateFilter === f.id ? C.violet : C.border}`, background: dateFilter === f.id ? C.violetDim : 'transparent', color: dateFilter === f.id ? C.violet : C.textSub, fontSize: 12, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif", transition: 'all 0.15s' }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Results + Analysis panel */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedPost ? '1fr 1fr' : '1fr', gap: 20 }}>
              {/* Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {searching && (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTop: `3px solid ${C.violet}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: C.textSub }}>Scanning all platforms for "{keyword}"...</p>
                  </div>
                )}
                {results.map((post, i) => (
                  <div key={post.id} className="result-card" onClick={() => {
                    setSelectedPost(post);
                    setAnalysis('');
                    setGeneratedScript('');
                    setActiveTab('analysis');
                    setTranscribeStatus('');
                  }}
                    style={{ background: C.surface, border: `1px solid ${selectedPost?.id === post.id ? C.violet : C.border}`, borderRadius: 14, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s', animation: `fadeUp 0.4s ease ${i * 60}ms both` }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      {/* Thumbnail */}
                      <div style={{ width: 56, height: 56, borderRadius: 10, background: C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, overflow: 'hidden' }}>
                        {post.thumbnail
                          ? <img src={post.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : post.thumbnailEmoji || '📱'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: C.violetDim, color: C.violet, fontWeight: 600 }}>{post.platform}</span>
                          <span style={{ fontSize: 11, color: C.textSub }}>{post.postedTime}</span>
                          <span style={{ fontSize: 11, color: C.textSub }}>·</span>
                          <span style={{ fontSize: 11, color: C.textSub }}>{post.type}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 10, lineHeight: 1.5 }}>"{post.hook}"</p>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          {[
                            { label: '👁', val: post.views },
                            { label: '❤️', val: post.likes },
                            { label: '💬', val: post.comments },
                            { label: '↗️', val: post.shares },
                          ].map(m => (
                            <div key={m.label} style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: C.textSub }}>
                              <span>{m.label}</span> <span style={{ color: C.text, fontWeight: 500 }}>{m.val}</span>
                            </div>
                          ))}
                          {/* VYRA Score */}
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `conic-gradient(#F5A623 ${post.score}%, rgba(255,255,255,0.08) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.violet }}>{post.score}</div>
                            </div>
                            <span style={{ fontSize: 10, color: C.textSub }}>VYRA Score</span>
                          </div>
                        </div>
                      </div>
                      <button className="save-btn" onClick={e => { e.stopPropagation(); savePost(post); }}
                        style={{ padding: '6px 10px', background: savedPosts.find(p => p.id === post.id) ? C.violetDim : 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: savedPosts.find(p => p.id === post.id) ? C.violet : C.textSub, cursor: 'pointer', fontSize: 14, flexShrink: 0, transition: 'all 0.15s' }}>
                        🔖
                      </button>
                      {(post.postUrl || post.viewOriginalUrl || post.videoUrl) && (
                        <a href={post.postUrl || post.viewOriginalUrl || post.videoUrl} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ padding: '6px 10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSub, cursor: 'pointer', fontSize: 11, flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                          ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {/* Load More — always available */}
                {results.length > 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <button onClick={loadMore} disabled={loadingMore}
                      style={{ padding: '13px 40px', background: loadingMore ? 'transparent' : `linear-gradient(135deg, rgba(245,166,35,0.12), rgba(245,166,35,0.05))`, border: `1px solid ${loadingMore ? C.border : C.violet}`, borderRadius: 10, color: loadingMore ? C.textSub : C.violet, fontSize: 14, fontWeight: 500, cursor: loadingMore ? 'not-allowed' : 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif", transition: 'all 0.2s' }}>
                      {loadingMore ? '⟳ Loading more...' : '↓ Load More Viral Content'}
                    </button>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>{results.length} posts loaded</div>
                  </div>
                )}
              </div>

              {/* Analysis Panel */}
              {selectedPost && (
                <div style={{ position: 'sticky', top: 20, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                    {/* Post header */}
                    <div style={{ padding: '20px', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: C.violet, fontWeight: 600, marginBottom: 4 }}>{selectedPost.platform} · {selectedPost.type}</div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: C.text, lineHeight: 1.5 }}>"{selectedPost.hook}"</p>
                        </div>
                        <button onClick={() => { setSelectedPost(null); setAnalysis(''); setGeneratedScript(''); setTranscribeStatus(''); }}
                          style={{ background: 'transparent', border: 'none', color: C.textSub, cursor: 'pointer', fontSize: 18, flexShrink: 0, padding: '0 0 0 10px' }}>×</button>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ fontSize: 11, color: C.textSub }}>{selectedPost.accountName}</div>
                        <div style={{ fontSize: 11, color: C.textSub }}>·</div>
                        <div style={{ fontSize: 11, color: C.textSub }}>{selectedPost.accountFollowers}</div>
                        {(selectedPost.postUrl || selectedPost.viewOriginalUrl || selectedPost.videoUrl) && (
                          <a href={selectedPost.postUrl || selectedPost.viewOriginalUrl || selectedPost.videoUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: C.violet, textDecoration: 'none', marginLeft: 'auto' }}>
                            View Original ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
                      {['analysis', 'generate'].map((tab) => {
                        const label = tab === 'analysis' ? '🧠 AI Analysis' : '✍️ Generate Content';
                        const active = activeTab === tab;
                        return (
                          <button key={tab} onClick={() => setActiveTab(tab)}
                            style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderBottom: `2px solid ${active ? C.violet : 'transparent'}`, color: active ? C.violet : C.textSub, fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif", transition: 'all 0.15s' }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ padding: '20px' }}>
                      {/* Analysis Tab */}
                      {activeTab === 'analysis' && (
                        <>
                          {analyzing && (
                            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${C.border}`, borderTop: `2px solid ${C.violet}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                              <p style={{ color: C.violet, fontSize: 13, fontWeight: 500 }}>{transcribeStatus || 'Analyzing...'}</p>
                            </div>
                          )}
                      {!analyzing && !analysis && !transcribeStatus && (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                          <p style={{ color: C.textSub, fontSize: 13, marginBottom: 16 }}>
                            Ready to analyze this post
                          </p>
                          <button onClick={() => analyzePost(selectedPost)}
                            style={{ padding: '12px 28px', background: `linear-gradient(135deg, ${C.violet}, ${C.violet})`, border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>
                            🧠 Start Analysis
                          </button>
                        </div>
                      )}
                          {analysis && (
                            <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{analysis}</div>
                          )}
                        </>
                      )}

                      {/* Generate Content Tab */}
                      {activeTab === 'generate' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {!generatedScript && (
                          <>
                            <div>
                              <label style={{ fontSize: 11, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Your Niche</label>
                              <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. real estate, fitness, finance..."
                                style={{ width: '100%', padding: '10px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "'Satoshi', 'DM Sans', sans-serif" }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Output Format</label>
                              <select value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "'Satoshi', 'DM Sans', sans-serif", cursor: 'pointer' }}>
                                {CONTENT_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Your Style (paste 1-3 of your best posts)</label>
                              <textarea value={userStyle} onChange={e => setUserStyle(e.target.value)} rows={3} placeholder="Paste examples of your content so VYRA can match your voice..."
                                style={{ width: '100%', padding: '10px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "'Satoshi', 'DM Sans', sans-serif", resize: 'vertical' }} />
                            </div>
                            <button onClick={generateContent} disabled={generating}
                              style={{ width: '100%', padding: '12px', background: '#F5A623', border: 'none', borderRadius: 9, color: 'white', fontSize: 14, fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif", opacity: generating ? 0.8 : 1 }}>
                              {generating ? '⟳ Generating...' : `✨ Generate ${selectedFormat}`}
                            </button>
                          </>
                        )}
                        {generating && (
                          <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${C.border}`, borderTop: `2px solid ${C.violet}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                            <p style={{ color: C.textSub, fontSize: 13 }}>Writing your {selectedFormat}...</p>
                          </div>
                        )}
                        {generatedScript && (
                          <div style={{ animation: 'fadeUp 0.3s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Your {selectedFormat}</span>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="copy-btn" onClick={() => { navigator.clipboard.writeText(generatedScript); }}
                                  style={{ padding: '5px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSub, fontSize: 12, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif", transition: 'all 0.15s' }}>Copy</button>
                                <button onClick={() => setGeneratedScript('')}
                                  style={{ padding: '5px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSub, fontSize: 12, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>New</button>
                              </div>
                            </div>
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px', fontSize: 13, color: C.textSub, lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto' }}>
                              {generatedScript}
                            </div>
                          </div>
                        )}
                      </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TRENDING TAB ── */}
        {activeNav === 'trending' && (
          <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', fontFamily: "'Cabinet Grotesk', 'Satoshi', sans-serif", marginBottom: 6 }}>Trending Now 🔥</h1>
              <p style={{ color: C.textSub, fontSize: 15 }}>What's exploding across every platform right now</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {trendingData.map((item, i) => (
                <div key={i} onClick={() => { setKeyword(item.keyword); setActiveNav('search'); handleSearch(); }}
                  className="result-card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px', cursor: 'pointer', transition: 'all 0.2s', animation: `fadeUp 0.4s ease ${i * 60}ms both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 13, color: C.textSub, marginBottom: 4 }}>#{i + 1} Trending</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{item.keyword}</div>
                    </div>
                    <div style={{ background: 'rgba(91,184,138,0.15)', border: '1px solid rgba(91,184,138,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 600, color: C.success }}>{item.growth}</div>
                  </div>
                  <div style={{ fontSize: 13, color: C.textSub, marginBottom: 12 }}>"{item.hook}"</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[item.platform, `${item.views} views`, `VYRA Score ${item.score}`].map((tag, ti) => (
                      <span key={ti} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: C.surfaceAlt, color: C.textSub }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SAVED TAB ── */}
        {activeNav === 'saved' && (
          <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', fontFamily: "'Cabinet Grotesk', 'Satoshi', sans-serif", marginBottom: 6 }}>Saved Content 🔖</h1>
              <p style={{ color: C.textSub, fontSize: 15 }}>{savedPosts.length} saved post{savedPosts.length !== 1 ? 's' : ''}</p>
            </div>
            {savedPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 8 }}>No saved posts yet</h3>
                <p style={{ color: C.textSub }}>Search for viral content and click the bookmark icon to save posts here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {savedPosts.map((post, i) => (
                  <div key={i} onClick={() => { setActiveNav('search'); analyzePost(post); }}
                    className="result-card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ fontSize: 28 }}>{post.thumbnail}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: C.violet, fontWeight: 600, marginBottom: 4 }}>{post.platform} · {post.type}</div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{post.hook}</p>
                        <div style={{ fontSize: 12, color: C.textSub, marginTop: 4 }}>{post.views} views · VYRA Score {post.score}</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setSavedPosts(prev => prev.filter(p => p.id !== post.id)); }}
                        style={{ background: 'transparent', border: 'none', color: C.textSub, cursor: 'pointer', fontSize: 16 }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMPETITORS TAB ── */}
        {activeNav === 'competitors' && (
          <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', fontFamily: "'Cabinet Grotesk', 'Satoshi', sans-serif", marginBottom: 6 }}>Spy Mode 🕵️</h1>
              <p style={{ color: C.textSub, fontSize: 15 }}>Track competitor accounts and get alerted when they go viral</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              <input value={competitorHandle} onChange={e => setCompetitorHandle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCompetitor()}
                placeholder="@username or account handle..."
                style={{ flex: 1, padding: '12px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 15, fontFamily: "'Satoshi', 'DM Sans', sans-serif" }} />
              <button onClick={addCompetitor}
                style={{ padding: '12px 24px', background: '#F5A623', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>
                + Track Account
              </button>
            </div>
            {competitors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🕵️</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 8 }}>No competitors tracked yet</h3>
                <p style={{ color: C.textSub }}>Add competitor accounts above to start monitoring their viral content.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {competitors.map((handle, i) => (
                  <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #0D0D0D, #F5A623)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                        {handle[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{handle}</div>
                        <div style={{ fontSize: 12, color: C.success, marginTop: 2 }}>● Monitoring active</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => { setKeyword(handle); setActiveNav('search'); handleSearch(); }}
                        style={{ padding: '7px 16px', background: C.violetDim, border: `1px solid ${C.border}`, borderRadius: 8, color: C.violet, fontSize: 13, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>
                        View Posts
                      </button>
                      <button onClick={() => setCompetitors(prev => prev.filter(c => c !== handle))}
                        style={{ padding: '7px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PATTERN LIBRARY ── */}
        {activeNav === 'patterns' && (
          <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', fontFamily: "'Cabinet Grotesk', 'Satoshi', sans-serif", marginBottom: 6 }}>Viral Pattern Library 📚</h1>
              <p style={{ color: C.textSub, fontSize: 15 }}>Proven content formats with real performance data</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {VIRAL_PATTERNS.map((pattern, i) => (
                <div key={i} className="result-card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px', transition: 'all 0.2s', cursor: 'pointer', animation: `fadeUp 0.4s ease ${i * 60}ms both` }}
                  onClick={() => { setActiveNav('search'); setKeyword(pattern.name); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.3px' }}>{pattern.name}</h3>
                    <div style={{ background: C.violetDim, border: `1px solid ${C.border}`, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: C.violet }}>{pattern.avgScore}</div>
                  </div>
                  <p style={{ fontSize: 13, color: C.textSub, marginBottom: 14, lineHeight: 1.65 }}>{pattern.desc}</p>
                  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.text, fontStyle: 'italic', marginBottom: 14 }}>
                    {pattern.example}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {pattern.platforms.map(p => (
                      <span key={p} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: C.surfaceAlt, color: C.textSub }}>{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {activeNav === 'calendar' && (
          <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', fontFamily: "'Cabinet Grotesk', 'Satoshi', sans-serif", marginBottom: 6 }}>Content Calendar 📅</h1>
              <p style={{ color: C.textSub, fontSize: 15 }}>Generated content queued and ready to post</p>
            </div>
            {calendarItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 8 }}>Your calendar is empty</h3>
                <p style={{ color: C.textSub, marginBottom: 24 }}>Generate content in the Search tab and it'll appear here automatically.</p>
                <button onClick={() => setActiveNav('search')}
                  style={{ padding: '12px 24px', background: '#F5A623', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>
                  Start Searching →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {calendarItems.map((item, i) => (
                  <div key={item.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: C.violet, fontWeight: 600, marginBottom: 4 }}>{item.platform} · {item.date}</div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{item.title}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(91,184,138,0.15)', color: C.success, border: '1px solid rgba(91,184,138,0.3)' }}>Draft</span>
                        <button onClick={() => setCalendarItems(prev => prev.filter(it => it.id !== item.id))}
                          style={{ background: 'transparent', border: 'none', color: C.textSub, cursor: 'pointer', fontSize: 16 }}>×</button>
                      </div>
                    </div>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: C.textSub, lineHeight: 1.7, maxHeight: 120, overflow: 'hidden', position: 'relative' }}>
                      {item.script?.slice(0, 200)}...
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button onClick={() => navigator.clipboard.writeText(item.script)}
                        style={{ padding: '7px 16px', background: C.violetDim, border: `1px solid ${C.border}`, borderRadius: 8, color: C.violet, fontSize: 13, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>
                        Copy Script
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PREDICTOR TAB ── */}
        {activeNav === 'predictor' && (
          <div style={{ padding: '32px', maxWidth: 800 }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.5px', fontFamily: "'Cabinet Grotesk', 'Satoshi', sans-serif", marginBottom: 6 }}>Performance Predictor ⚡</h1>
              <p style={{ color: C.textSub, fontSize: 15 }}>Paste your draft — get your VYRA Score before you post</p>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px' }}>
              <label style={{ fontSize: 12, color: C.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Your Draft Content</label>
              <textarea value={predictorText} onChange={e => setPredictorText(e.target.value)} rows={8}
                placeholder="Paste your caption, script, hook, or post draft here..."
                style={{ width: '100%', padding: '14px 16px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: "'Satoshi', 'DM Sans', sans-serif", resize: 'vertical', lineHeight: 1.7 }} />
              <button onClick={predictPerformance} disabled={predicting || !predictorText.trim()}
                style={{ marginTop: 16, width: '100%', padding: '13px', background: '#F5A623', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: predicting || !predictorText.trim() ? 'not-allowed' : 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif", opacity: predicting || !predictorText.trim() ? 0.7 : 1 }}>
                {predicting ? '⟳ Analyzing...' : '⚡ Predict Performance'}
              </button>
            </div>
            {predicting && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTop: `3px solid ${C.violet}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: C.textSub }}>Scoring your content against our viral database...</p>
              </div>
            )}
            {prediction && (
              <div style={{ marginTop: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px', animation: 'fadeUp 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>Prediction Report</h3>
                  <button onClick={() => navigator.clipboard.writeText(prediction)}
                    style={{ padding: '6px 14px', background: C.violetDim, border: `1px solid ${C.border}`, borderRadius: 7, color: C.violet, fontSize: 12, cursor: 'pointer', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>Copy</button>
                </div>
                <div style={{ fontSize: 14, color: C.textSub, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{prediction}</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
