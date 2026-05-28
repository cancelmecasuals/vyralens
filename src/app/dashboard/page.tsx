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


  const PLATFORM_ICONS: Record<string, string> = {
    'TikTok': '🎵', 'Instagram': '📸', 'YouTube': '▶️', 'Reddit': '🔴',
  };
  const PLATFORM_COLORS: Record<string, string> = {
    'TikTok': '#FF2D55', 'Instagram': '#E1306C', 'YouTube': '#FF0000', 'Reddit': '#FF4500',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', fontFamily: "'Satoshi', 'DM Sans', sans-serif", color: '#fff' }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&f[]=cabinet-grotesk@800,700,500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(245,166,35,0.4); }
        input, textarea { outline: none; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        textarea::placeholder { color: rgba(255,255,255,0.25); }

        .nav-btn { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; border: none; cursor: pointer; background: transparent; font-family: 'Satoshi','DM Sans',sans-serif; font-size: 13px; font-weight: 500; transition: all 0.15s; text-align: left; width: 100%; white-space: nowrap; overflow: hidden; color: rgba(255,255,255,0.4); }
        .nav-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .nav-btn.active { background: rgba(245,166,35,0.1); color: #F5A623; }

        .result-card { background: #0F0F0F; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; cursor: pointer; transition: all 0.2s; animation: fadeUp 0.4s ease both; }
        .result-card:hover { border-color: rgba(245,166,35,0.3); background: #131313; transform: translateY(-1px); }
        .result-card.active { border-color: rgba(245,166,35,0.5); background: rgba(245,166,35,0.04); }

        .platform-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.08); background: transparent; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s; font-family: 'Satoshi','DM Sans',sans-serif; color: rgba(255,255,255,0.4); }
        .platform-pill:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
        .platform-pill.active { border-color: #F5A623; background: rgba(245,166,35,0.08); color: #F5A623; }

        .search-input { width: 100%; background: #0F0F0F; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px 20px; color: #fff; font-size: 16px; font-family: 'Satoshi','DM Sans',sans-serif; transition: border-color 0.2s; }
        .search-input:focus { border-color: rgba(245,166,35,0.4); }

        .search-btn { background: #F5A623; color: #080808; border: none; padding: 16px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Cabinet Grotesk','Satoshi',sans-serif; transition: all 0.2s; white-space: nowrap; letter-spacing: 0.01em; }
        .search-btn:hover { background: #FFB73D; transform: translateY(-1px); }
        .search-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .tab-btn { flex: 1; padding: 10px; background: transparent; border: none; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.35); font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Satoshi','DM Sans',sans-serif; transition: all 0.15s; letter-spacing: 0.04em; text-transform: uppercase; }
        .tab-btn.active { border-bottom-color: #F5A623; color: #F5A623; }

        .outlier-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; font-family: 'Cabinet Grotesk','Satoshi',sans-serif; }

        .stat-pill { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,0.4); }

        .load-more { width: 100%; padding: 14px; background: transparent; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: rgba(255,255,255,0.4); font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Satoshi','DM Sans',sans-serif; transition: all 0.2s; }
        .load-more:hover { border-color: rgba(245,166,35,0.3); color: #F5A623; }

        .copy-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Satoshi','DM Sans',sans-serif; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(245,166,35,0.1); border-color: rgba(245,166,35,0.3); color: #F5A623; }

        .gen-btn { background: #F5A623; color: #080808; border: none; padding: 12px 20px; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Cabinet Grotesk','Satoshi',sans-serif; transition: all 0.2s; width: 100%; }
        .gen-btn:hover { background: #FFB73D; }
        .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .date-pill { padding: 5px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.07); background: transparent; color: rgba(255,255,255,0.35); font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'Satoshi',sans-serif; transition: all 0.15s; letter-spacing: 0.04em; }
        .date-pill.active { border-color: rgba(245,166,35,0.4); color: #F5A623; background: rgba(245,166,35,0.06); }
      `}}/>

      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? 220 : 60, background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', flexShrink: 0, position: 'fixed', top: 0, bottom: 0, zIndex: 50, overflow: 'hidden' }}>
        
        {/* Logo */}
        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: '20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', height: 64 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 15, fontWeight: 800, color: '#080808' }}>V</span>
          </div>
          {sidebarOpen && <span style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 17, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>VYRA<span style={{ color: '#F5A623' }}>.</span></span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { id: 'search', icon: '⌕', label: 'Discover' },
            { id: 'trending', icon: '↑', label: 'Trending' },
            { id: 'saved', icon: '◈', label: 'Saved' },
            { id: 'competitors', icon: '◎', label: 'Spy Mode' },
            { id: 'patterns', icon: '⊞', label: 'Patterns' },
            { id: 'calendar', icon: '◻', label: 'Calendar' },
            { id: 'predictor', icon: '◈', label: 'Predictor' },
          ].map(item => (
            <button key={item.id} className={`nav-btn ${activeNav === item.id ? 'active' : ''}`} onClick={() => setActiveNav(item.id)}>
              <span style={{ fontSize: 16, flexShrink: 0, fontFamily: 'monospace', width: 20, textAlign: 'center' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {sidebarOpen && <div style={{ padding: '6px 12px', fontSize: 11, color: 'rgba(255,255,255,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{user?.email}</div>}
          {subscription && (
            <button className="nav-btn" onClick={async () => {
              const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId: subscription.stripe_customer_id }) });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}>
              <span style={{ fontSize: 14, flexShrink: 0, width: 20, textAlign: 'center' }}>⬡</span>
              {sidebarOpen && <span style={{ fontSize: 13 }}>Billing</span>}
            </button>
          )}
          <button className="nav-btn" onClick={() => { import('@/lib/supabase').then(m => m.supabase.auth.signOut()); router.push('/'); }}>
            <span style={{ fontSize: 14, flexShrink: 0, width: 20, textAlign: 'center' }}>→</span>
            {sidebarOpen && <span style={{ fontSize: 13 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, marginLeft: sidebarOpen ? 220 : 60, minHeight: '100vh', transition: 'margin-left 0.25s ease', overflow: 'auto', background: '#080808' }}>

        {activeNav === 'search' && (
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            
            {/* Top bar */}
            <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
              <div>
                <h1 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 2 }}>Discover</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Find viral content across every platform</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5A623', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>LIVE</span>
              </div>
            </div>

            <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: selectedPost ? '1fr 420px' : '1fr', gap: 24, alignItems: 'start' }}>
              
              {/* Left — search + results */}
              <div>
                {/* Search */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <input className="search-input" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search any keyword, niche, or topic..." />
                    <button className="search-btn" onClick={handleSearch} disabled={searching}>
                      {searching ? '···' : 'Search'}
                    </button>
                  </div>

                  {/* Filters row */}
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {PLATFORMS.map(p => (
                        <button key={p.id} className={`platform-pill ${activePlatform === p.id ? 'active' : ''}`}
                          onClick={() => {
                            setActivePlatform(p.id);
                            if (keyword.trim()) {
                              setResults([]); setNextPageToken(null); setRedditAfter(null); setSelectedPost(null); setCurrentPage(0); setHasMore(false); setSearching(true);
                              fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword, platform: p.id, page: 0, dateFilter }) })
                                .then(r => r.json()).then(data => { setResults(data.results || []); setNextPageToken(data.nextPageToken || null); setRedditAfter(data.redditAfter || null); setHasMore(data.hasMore !== false); setSearching(false); }).catch(() => setSearching(false));
                            }
                          }}>
                          {p.icon} {p.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                      {[{id:'all',l:'All Time'},{id:'year',l:'Year'},{id:'month',l:'Month'},{id:'week',l:'Week'}].map(f => (
                        <button key={f.id} className={`date-pill ${dateFilter === f.id ? 'active' : ''}`}
                          onClick={() => {
                            setDateFilter(f.id);
                            if (keyword.trim() && results.length > 0) {
                              setResults([]); setCurrentPage(0); setSearching(true);
                              fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword, platform: activePlatform, page: 0, dateFilter: f.id }) })
                                .then(r => r.json()).then(data => { setResults(data.results || []); setHasMore(data.hasMore !== false); setSearching(false); }).catch(() => setSearching(false));
                            }
                          }}>{f.l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Loading */}
                {searching && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '40px 0', justifyContent: 'center' }}>
                    <div style={{ width: 20, height: 20, border: '2px solid rgba(245,166,35,0.2)', borderTop: '2px solid #F5A623', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Scanning platforms for "{keyword}"...</span>
                  </div>
                )}

                {/* Empty */}
                {!searching && results.length === 0 && keyword && (
                  <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>◎</div>
                    <div style={{ fontSize: 15, fontFamily: "'Cabinet Grotesk',sans-serif", fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.3)' }}>No results yet</div>
                    <div style={{ fontSize: 13 }}>Try a different keyword or platform</div>
                  </div>
                )}

                {!searching && results.length === 0 && !keyword && (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 20 }}>⌕</div>
                    <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.2)', marginBottom: 8, letterSpacing: '-0.01em' }}>Search anything</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.15)', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>fitness · real estate · manifesting · skincare · side hustle</div>
                  </div>
                )}

                {/* Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.map((post, i) => {
                    const viralScore = post.score || 0;
                    const isHot = viralScore >= 85;
                    const isMid = viralScore >= 70 && viralScore < 85;
                    const platformColor = PLATFORM_COLORS[post.platform] || '#888';
                    
                    return (
                    <div key={post.id}
                      className={`result-card ${selectedPost?.id === post.id ? 'active' : ''}`}
                      style={{ animationDelay: `${i * 35}ms`, padding: 0, overflow: 'hidden' }}
                      onClick={() => { setSelectedPost(post); setAnalysis(''); setGeneratedScript(''); setActiveTab('analysis'); setTranscribeStatus(''); }}>
                      
                      {/* Platform color bar */}
                      <div style={{ height: 2, background: `linear-gradient(90deg, ${platformColor}, transparent)` }} />
                      
                      <div style={{ padding: '18px 20px' }}>
                        {/* Row 1: Account + Platform + Time */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                          {/* Avatar */}
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${platformColor}20`, border: `1px solid ${platformColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                            {post.thumbnail
                              ? <img src={post.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              : <span>{PLATFORM_ICONS[post.platform] || '📱'}</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {post.accountName || 'Unknown'}
                            </div>
                            {post.accountFollowers && (
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{post.accountFollowers}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <span style={{ background: `${platformColor}18`, color: platformColor, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 5, letterSpacing: '0.06em' }}>{post.platform?.toUpperCase()}</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{post.postedTime}</span>
                          </div>
                        </div>

                        {/* Row 2: Hook text */}
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, marginBottom: 16, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                          {post.hook || post.description || 'No caption'}
                        </div>

                        {/* Row 3: Stats + Outlier Score */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          {/* Engagement stats */}
                          <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                            {[
                              { icon: '♥', val: post.likes, color: '#ff4d6d' },
                              { icon: '◉', val: post.views, color: 'rgba(255,255,255,0.3)' },
                              { icon: '◎', val: post.comments, color: 'rgba(255,255,255,0.3)' },
                            ].map(({ icon, val, color }, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontSize: 11, color }}>{icon}</span>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>
                              </div>
                            ))}
                          </div>

                          {/* Viral Score */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            {/* Score bar */}
                            <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${viralScore}%`, background: isHot ? 'linear-gradient(90deg, #F5A623, #FFB73D)' : isMid ? '#F5A623aa' : 'rgba(255,255,255,0.2)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                            </div>
                            {/* Score label */}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Cabinet Grotesk',monospace", color: isHot ? '#F5A623' : isMid ? '#FFB73D99' : 'rgba(255,255,255,0.25)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                                {viralScore}
                              </div>
                              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontWeight: 700 }}>SCORE</div>
                            </div>
                            {isHot && (
                              <div style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800, color: '#F5A623', letterSpacing: '0.06em', whiteSpace: 'nowrap' as const }}>
                                🔥 VIRAL
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Load more */}
                {results.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <button className="load-more" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore ? 'Loading...' : 'Load more results'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right — Analysis panel */}
              {selectedPost && (
                <div style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 100 }}>
                  {/* Post preview */}
                  <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${PLATFORM_COLORS[selectedPost.platform] || '#333'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {PLATFORM_ICONS[selectedPost.platform] || '📱'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{selectedPost.accountName}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{selectedPost.platform} · {selectedPost.postedTime}</div>
                      </div>
                      {selectedPost.viewOriginalUrl && (
                        <a href={selectedPost.viewOriginalUrl} target="_blank" rel="noopener noreferrer"
                          style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6, transition: 'all 0.15s' }}
                          onMouseOver={e => (e.currentTarget.style.color = '#F5A623')}
                          onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                          View ↗
                        </a>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 14 }}>{selectedPost.hook}</p>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {[['❤', selectedPost.likes], ['👁', selectedPost.views], ['💬', selectedPost.comments]].map(([icon, val], i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{val}</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{icon}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {[['analysis','Analysis'],['script','Script'],['saved','Saved']].map(([id, label]) => (
                      <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id as any)}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div style={{ padding: '20px', maxHeight: 500, overflowY: 'auto' }}>
                    {activeTab === 'analysis' && (
                      <div>
                        {!analysis && (
                          <button className="gen-btn" style={{ marginBottom: 16 }} onClick={async () => {
                            setAnalysis('loading');
                            const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post: selectedPost, type: 'analysis' }) });
                            const data = await res.json();
                            setAnalysis(data.result || 'Analysis failed');
                          }}>
                            {analysis === 'loading' ? '···' : '🧠 Analyze This Post'}
                          </button>
                        )}
                        {analysis === 'loading' && (
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                            <div style={{ width: 14, height: 14, border: '2px solid rgba(245,166,35,0.2)', borderTop: '2px solid #F5A623', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            Analyzing...
                          </div>
                        )}
                        {analysis && analysis !== 'loading' && (
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{analysis}</div>
                        )}
                      </div>
                    )}

                    {activeTab === 'script' && (
                      <div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 6 }}>Your Style</label>
                          <textarea value={userStyle} onChange={e => setUserStyle(e.target.value)} rows={2}
                            placeholder="Describe your style or paste examples..."
                            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, fontFamily: "'Satoshi','DM Sans',sans-serif", resize: 'none' }} />
                        </div>
                        <button className="gen-btn" style={{ marginBottom: 14 }} disabled={generatingScript}
                          onClick={async () => {
                            setGeneratingScript(true); setGeneratedScript('');
                            const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post: selectedPost, type: 'script', userStyle, format: selectedFormat }) });
                            const data = await res.json();
                            setGeneratedScript(data.result || ''); setGeneratingScript(false);
                          }}>
                          {generatingScript ? '···' : '✍️ Generate Script'}
                        </button>
                        {generatedScript && (
                          <div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{generatedScript}</div>
                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(generatedScript)}>Copy Script</button>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'saved' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {savedPosts.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No saved posts yet</div>
                        ) : saved.map((post, i) => (
                          <div key={i} onClick={() => setSelectedPost(post)} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>{post.hook?.slice(0, 60)}...</div>
                            <div>{post.platform} · {post.likes} likes</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={() => { if (!savedPosts.find(p => p.id === selectedPost.id)) setSavedPosts([...savedPosts, selectedPost]); }}
                      style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Satoshi',sans-serif", transition: 'all 0.15s' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)'; e.currentTarget.style.color = '#F5A623'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                      {savedPosts.find(p => p.id === selectedPost.id) ? '◈ Saved' : '◇ Save Post'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeNav !== 'search' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 40, opacity: 0.2 }}>◎</div>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.15)', letterSpacing: '-0.01em' }}>Coming soon</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.1)' }}>Focus on Search for now</div>
          </div>
        )}

      </main>
    </div>
  );
}
