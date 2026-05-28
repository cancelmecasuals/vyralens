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


  const PC: Record<string,string> = { TikTok:'#FF2D55', Instagram:'#E1306C', YouTube:'#FF0000', Reddit:'#FF4500' };
  const PI: Record<string,string> = { TikTok:'🎵', Instagram:'📸', YouTube:'▶', Reddit:'↑' };
  const viralLabel = (s: number) => s >= 90 ? 'MEGA VIRAL' : s >= 80 ? 'VIRAL' : s >= 65 ? 'TRENDING' : 'NOTABLE';
  const viralColor = (s: number) => s >= 80 ? '#F5A623' : s >= 65 ? '#FFB73Daa' : 'rgba(255,255,255,0.2)';

  return (
    <div style={{ minHeight: '100vh', background: '#050505', fontFamily: "'Satoshi','DM Sans',sans-serif", color: '#fff', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&f[]=cabinet-grotesk@800,700,500&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(245,166,35,0.1)}50%{box-shadow:0 0 40px rgba(245,166,35,0.25)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(245,166,35,0.15);border-radius:4px}
        input,textarea{outline:none}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)}

        .vcard{
          background:#0C0C0C;
          border:1px solid rgba(255,255,255,0.06);
          border-radius:16px;
          cursor:pointer;
          transition:all 0.2s;
          animation:fadeIn 0.5s ease both;
          overflow:hidden;
          position:relative;
        }
        .vcard:hover{border-color:rgba(255,255,255,0.14);background:#0F0F0F;transform:translateY(-1px)}
        .vcard.selected{border-color:rgba(245,166,35,0.4);background:rgba(245,166,35,0.03)}
        .vcard:hover .card-arrow{opacity:1;transform:translateX(0)}
        .card-arrow{opacity:0;transform:translateX(-4px);transition:all 0.2s}

        .top-btn{background:transparent;border:none;color:rgba(255,255,255,0.35);cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;font-size:13px;font-weight:500;padding:8px 14px;border-radius:8px;transition:all 0.15s;white-space:nowrap}
        .top-btn:hover{color:rgba(255,255,255,0.8);background:rgba(255,255,255,0.05)}
        .top-btn.active{color:#F5A623;background:rgba(245,166,35,0.08)}

        .pfilt{background:transparent;border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.35);cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;font-size:12px;font-weight:600;padding:7px 14px;border-radius:8px;transition:all 0.15s;display:flex;align-items:center;gap:6px;white-space:nowrap}
        .pfilt:hover{border-color:rgba(255,255,255,0.2);color:rgba(255,255,255,0.7)}
        .pfilt.on{color:#F5A623;border-color:rgba(245,166,35,0.4);background:rgba(245,166,35,0.06)}

        .dfilt{background:transparent;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;font-size:11px;font-weight:700;padding:6px 12px;border-radius:7px;transition:all 0.15s;letter-spacing:0.04em;text-transform:uppercase}
        .dfilt:hover{color:rgba(255,255,255,0.7)}
        .dfilt.on{color:#F5A623;background:rgba(245,166,35,0.08)}

        .sbtn{background:#F5A623;color:#050505;border:none;padding:0 24px;height:48px;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:'Cabinet Grotesk','Satoshi',sans-serif;transition:all 0.2s;white-space:nowrap;letter-spacing:0.02em}
        .sbtn:hover{background:#FFB73D;transform:translateY(-1px);box-shadow:0 8px 24px rgba(245,166,35,0.25)}
        .sbtn:disabled{opacity:0.5;cursor:not-allowed;transform:none;box-shadow:none}

        .sinput{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:0 18px;height:48px;color:#fff;font-size:15px;font-family:'Satoshi','DM Sans',sans-serif;transition:all 0.2s;width:100%}
        .sinput:focus{border-color:rgba(245,166,35,0.3);background:rgba(255,255,255,0.06)}

        .tab{background:transparent;border:none;border-bottom:2px solid transparent;color:rgba(255,255,255,0.3);cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;font-size:12px;font-weight:700;padding:12px 16px;transition:all 0.15s;letter-spacing:0.06em;text-transform:uppercase;flex:1}
        .tab.on{border-bottom-color:#F5A623;color:#F5A623}
        .tab:hover{color:rgba(255,255,255,0.7)}

        .abtn{width:100%;background:#F5A623;color:#050505;border:none;padding:13px;border-radius:9px;font-size:13px;font-weight:800;cursor:pointer;font-family:'Cabinet Grotesk','Satoshi',sans-serif;transition:all 0.2s;letter-spacing:0.02em}
        .abtn:hover{background:#FFB73D}
        .abtn:disabled{opacity:0.5;cursor:not-allowed}

        .obtn{width:100%;background:transparent;border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.4);padding:11px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;transition:all 0.2s}
        .obtn:hover{border-color:rgba(245,166,35,0.3);color:#F5A623}

        .load-more{width:100%;padding:14px;background:transparent;border:1px solid rgba(255,255,255,0.07);border-radius:10px;color:rgba(255,255,255,0.3);font-size:13px;font-weight:600;cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;transition:all 0.2s;margin-top:12px}
        .load-more:hover{border-color:rgba(245,166,35,0.25);color:rgba(255,255,255,0.6)}

        .noise{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
      `}}/>

      <div className="noise" />

      {/* TOP NAV */}
      <header style={{ position:'fixed', top:0, left:0, right:0, height:58, background:'rgba(5,5,5,0.92)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', padding:'0 24px', gap:16, zIndex:100 }}>
        
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginRight:8, flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:14, fontWeight:800, color:'#050505' }}>V</span>
          </div>
          <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:16, fontWeight:800, letterSpacing:'-0.01em' }}>VYRA<span style={{ color:'#F5A623' }}>.</span></span>
        </div>

        {/* Nav items */}
        <nav style={{ display:'flex', gap:2 }}>
          {[['search','Discover'],['trending','Trending'],['saved','Saved'],['patterns','Patterns']].map(([id,label]) => (
            <button key={id} className={`top-btn ${activeNav===id?'active':''}`} onClick={() => setActiveNav(id)}>{label}</button>
          ))}
        </nav>

        {/* Search - center */}
        <div style={{ flex:1, display:'flex', gap:8, maxWidth:540, margin:'0 auto' }}>
          <input className="sinput" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSearch()} placeholder="Search any keyword, niche, or topic..." />
          <button className="sbtn" onClick={handleSearch} disabled={searching}>{searching ? '···' : 'Search'}</button>
        </div>

        {/* Right actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto', flexShrink:0 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#F5A623', animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)', fontFamily:'monospace', letterSpacing:'0.06em' }}>LIVE</span>
          {subscription && (
            <button className="top-btn" onClick={async () => {
              const res = await fetch('/api/stripe/portal', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({customerId:subscription.stripe_customer_id}) });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}>Billing</button>
          )}
          <button className="top-btn" onClick={() => { import('@/lib/supabase').then(m => m.supabase.auth.signOut()); router.push('/'); }}>Sign out</button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div style={{ paddingTop:58, display:'flex', height:'100vh', overflow:'hidden' }}>

        {/* RESULTS FEED */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 24px', minWidth:0 }}>

          {activeNav === 'search' && (
            <>
              {/* Filter bar */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {PLATFORMS.map(p => (
                    <button key={p.id} className={`pfilt ${activePlatform===p.id?'on':''}`}
                      style={{ borderColor: activePlatform===p.id ? (PC[p.label] || 'rgba(245,166,35,0.4)') : undefined, color: activePlatform===p.id ? (PC[p.label] || '#F5A623') : undefined }}
                      onClick={() => {
                        setActivePlatform(p.id);
                        if (keyword.trim()) {
                          setResults([]); setNextPageToken(null); setRedditAfter(null); setSelectedPost(null); setCurrentPage(0); setHasMore(false); setSearching(true);
                          fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({keyword,platform:p.id,page:0,dateFilter})})
                            .then(r=>r.json()).then(d=>{setResults(d.results||[]);setNextPageToken(d.nextPageToken||null);setRedditAfter(d.redditAfter||null);setHasMore(d.hasMore!==false);setSearching(false);}).catch(()=>setSearching(false));
                        }
                      }}>
                      <span>{p.icon}</span> {p.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginLeft:'auto', display:'flex', gap:2, background:'rgba(255,255,255,0.03)', borderRadius:9, padding:'2px', border:'1px solid rgba(255,255,255,0.06)' }}>
                  {[{id:'all',l:'All Time'},{id:'year',l:'Year'},{id:'month',l:'Month'},{id:'week',l:'Week'}].map(f => (
                    <button key={f.id} className={`dfilt ${dateFilter===f.id?'on':''}`}
                      onClick={() => {
                        setDateFilter(f.id);
                        if (keyword.trim() && results.length > 0) {
                          setResults([]); setCurrentPage(0); setSearching(true);
                          fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({keyword,platform:activePlatform,page:0,dateFilter:f.id})})
                            .then(r=>r.json()).then(d=>{setResults(d.results||[]);setHasMore(d.hasMore!==false);setSearching(false);}).catch(()=>setSearching(false));
                        }
                      }}>{f.l}</button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              {results.length > 0 && !searching && (
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginBottom:14, fontFamily:'monospace', letterSpacing:'0.04em' }}>
                  {results.length} results for "{keyword}"
                </div>
              )}

              {/* Loading */}
              {searching && (
                <div style={{ display:'flex', alignItems:'center', gap:14, padding:'60px 0', justifyContent:'center' }}>
                  <div style={{ width:18, height:18, border:'2px solid rgba(245,166,35,0.15)', borderTop:'2px solid #F5A623', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:14 }}>Scanning for "{keyword}"...</span>
                </div>
              )}

              {/* Empty state */}
              {!searching && results.length === 0 && (
                <div style={{ textAlign:'center', padding:'100px 0' }}>
                  {keyword ? (
                    <>
                      <div style={{ fontSize:36, marginBottom:16, opacity:0.15 }}>◎</div>
                      <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:17, fontWeight:800, color:'rgba(255,255,255,0.2)', letterSpacing:'-0.01em', marginBottom:8 }}>No results found</div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.12)' }}>Try a different keyword</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:28, fontWeight:800, color:'rgba(255,255,255,0.06)', letterSpacing:'-0.02em', marginBottom:12 }}>What's going viral?</div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.1)', lineHeight:2 }}>fitness · real estate · manifesting · skincare · mindset · side hustle</div>
                    </>
                  )}
                </div>
              )}

              {/* CARDS */}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {results.map((post, i) => {
                  const score = post.score || 0;
                  const isViral = score >= 80;
                  const isTrend = score >= 65 && score < 80;
                  const pColor = PC[post.platform] || '#888';
                  const isSelected = selectedPost?.id === post.id;

                  return (
                    <div key={post.id} className={`vcard ${isSelected?'selected':''}`}
                      style={{ animationDelay:`${Math.min(i*30, 300)}ms` }}
                      onClick={() => { setSelectedPost(post); setAnalysis(''); setGeneratedScript(''); setActiveTab('analysis'); setTranscribeStatus(''); }}>
                      
                      {/* Viral glow top border */}
                      <div style={{ height:2, background: isViral ? `linear-gradient(90deg, ${pColor}, #F5A623, transparent)` : `linear-gradient(90deg, ${pColor}60, transparent)` }} />

                      <div style={{ padding:'16px 18px', display:'flex', gap:16, alignItems:'center' }}>
                        
                        {/* LEFT: Score */}
                        <div style={{ width:64, flexShrink:0, textAlign:'center' }}>
                          <div style={{ fontFamily:"'Cabinet Grotesk',monospace", fontSize:32, fontWeight:800, color: isViral ? '#F5A623' : isTrend ? '#F5A62388' : 'rgba(255,255,255,0.15)', lineHeight:1, letterSpacing:'-0.03em', marginBottom:4 }}>
                            {score}
                          </div>
                          <div style={{ fontSize:8, fontWeight:800, letterSpacing:'0.1em', color: isViral ? '#F5A623aa' : 'rgba(255,255,255,0.15)', textTransform:'uppercase' as const }}>
                            {viralLabel(score)}
                          </div>
                          {/* Score bar */}
                          <div style={{ marginTop:6, height:2, background:'rgba(255,255,255,0.05)', borderRadius:1, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${score}%`, background: isViral ? '#F5A623' : isTrend ? '#F5A62344' : 'rgba(255,255,255,0.1)', borderRadius:1 }} />
                          </div>
                        </div>

                        {/* DIVIDER */}
                        <div style={{ width:1, height:56, background:'rgba(255,255,255,0.06)', flexShrink:0 }} />

                        {/* CENTER: Content */}
                        <div style={{ flex:1, minWidth:0 }}>
                          {/* Account row */}
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                            <div style={{ width:22, height:22, borderRadius:'50%', background:`${pColor}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0, overflow:'hidden' }}>
                              {post.thumbnail
                                ? <img src={post.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
                                : <span>{PI[post.platform]||'📱'}</span>}
                            </div>
                            <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)' }}>{post.accountName || 'Unknown'}</span>
                            {post.accountFollowers && <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>{post.accountFollowers}</span>}
                            <div style={{ marginLeft:'auto', display:'flex', gap:6, alignItems:'center' }}>
                              <span style={{ background:`${pColor}15`, color:pColor, fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:4, letterSpacing:'0.06em' }}>{post.platform?.toUpperCase()}</span>
                              {isViral && <span style={{ background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.2)', color:'#F5A623', fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:4, letterSpacing:'0.06em' }}>🔥 VIRAL</span>}
                            </div>
                          </div>
                          {/* Hook */}
                          <div style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.82)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>
                            {post.hook || post.description || 'No caption'}
                          </div>
                        </div>

                        {/* RIGHT: Stats */}
                        <div style={{ flexShrink:0, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end', minWidth:80 }}>
                          {[
                            { label:'likes', val:post.likes, color:'#ff4d6d' },
                            { label:'views', val:post.views, color:'rgba(255,255,255,0.25)' },
                            { label:'comments', val:post.comments, color:'rgba(255,255,255,0.25)' },
                          ].map(({label, val, color}, idx) => (
                            <div key={idx} style={{ textAlign:'right' }}>
                              <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.7)', fontFamily:'monospace', lineHeight:1 }}>{val}</div>
                              <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.04em', textTransform:'uppercase' as const, fontWeight:700 }}>{label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Arrow */}
                        <div className="card-arrow" style={{ color:'rgba(255,255,255,0.2)', fontSize:16, flexShrink:0 }}>→</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {results.length > 0 && (
                <button className="load-more" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load more →'}
                </button>
              )}
            </>
          )}

          {activeNav !== 'search' && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12 }}>
              <div style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:20, fontWeight:800, color:'rgba(255,255,255,0.08)', letterSpacing:'-0.02em' }}>Coming soon</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.08)' }}>Stay on Discover for now</div>
            </div>
          )}
        </div>

        {/* ANALYSIS PANEL - slides in */}
        {selectedPost && (
          <div style={{ width:400, flexShrink:0, borderLeft:'1px solid rgba(255,255,255,0.06)', background:'#080808', overflowY:'auto', animation:'slideIn 0.25s ease' }}>
            
            {/* Post header */}
            <div style={{ padding:'20px', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:0, background:'rgba(8,8,8,0.95)', backdropFilter:'blur(20px)', zIndex:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:36, height:36, borderRadius:9, background:`${PC[selectedPost.platform]||'#333'}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, border:`1px solid ${PC[selectedPost.platform]||'#333'}20` }}>
                  {PI[selectedPost.platform]||'📱'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>{selectedPost.accountName}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>{selectedPost.platform} · {selectedPost.postedTime}</div>
                </div>
                <button onClick={() => setSelectedPost(null)} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.25)', cursor:'pointer', fontSize:18, padding:'4px', lineHeight:1 }}>×</button>
              </div>

              {/* Viral score prominent */}
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'14px 16px', border:'1px solid rgba(255,255,255,0.06)', marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em', textTransform:'uppercase' as const }}>Viral Score</span>
                  <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:24, fontWeight:800, color: (selectedPost.score||0) >= 80 ? '#F5A623' : 'rgba(255,255,255,0.3)', letterSpacing:'-0.02em' }}>{selectedPost.score}/100</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${selectedPost.score||0}%`, background:'linear-gradient(90deg, #F5A623, #FFB73D)', borderRadius:2, transition:'width 0.8s ease' }} />
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {[['❤', selectedPost.likes,'Likes'],['👁', selectedPost.views,'Views'],['💬', selectedPost.comments,'Comments']].map(([icon,val,label],i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'10px 12px', border:'1px solid rgba(255,255,255,0.05)', textAlign:'center' }}>
                    <div style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.7)', fontFamily:'monospace', marginBottom:2 }}>{val}</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', letterSpacing:'0.06em', textTransform:'uppercase' as const, fontWeight:700 }}>{label}</div>
                  </div>
                ))}
              </div>

              {selectedPost.viewOriginalUrl && (
                <a href={selectedPost.viewOriginalUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:10, padding:'9px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, color:'rgba(255,255,255,0.35)', textDecoration:'none', fontSize:12, fontWeight:600, transition:'all 0.15s' }}
                  onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(245,166,35,0.25)';e.currentTarget.style.color='#F5A623'}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.color='rgba(255,255,255,0.35)'}}>
                  View Original ↗
                </a>
              )}
            </div>

            {/* Hook preview */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', textTransform:'uppercase' as const, marginBottom:8 }}>Content</div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.65 }}>{selectedPost.hook || selectedPost.description}</p>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {[['analysis','AI Analysis'],['script','Write Script'],['saved','Saved']].map(([id,label]) => (
                <button key={id} className={`tab ${activeTab===id?'on':''}`} onClick={() => setActiveTab(id as any)}>{label}</button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding:'20px' }}>
              
              {activeTab === 'analysis' && (
                <div>
                  {!analysis && (
                    <button className="abtn" onClick={async () => {
                      setAnalysis('loading');
                      const res = await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({post:selectedPost,type:'analysis'})});
                      const data = await res.json();
                      setAnalysis(data.result||'Analysis failed');
                    }}>🧠 Analyze Why This Went Viral</button>
                  )}
                  {analysis === 'loading' && (
                    <div style={{ display:'flex', gap:10, alignItems:'center', color:'rgba(255,255,255,0.3)', fontSize:13, padding:'20px 0' }}>
                      <div style={{ width:14, height:14, border:'2px solid rgba(245,166,35,0.15)', borderTop:'2px solid #F5A623', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                      Analyzing the viral formula...
                    </div>
                  )}
                  {analysis && analysis !== 'loading' && (
                    <div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:16 }}>{analysis}</div>
                      <button className="abtn" onClick={async () => {
                        setAnalysis('loading');
                        const res = await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({post:selectedPost,type:'analysis'})});
                        const data = await res.json();
                        setAnalysis(data.result||'');
                      }}>↺ Regenerate</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'script' && (
                <div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em', textTransform:'uppercase' as const, display:'block', marginBottom:6 }}>Your Style (optional)</label>
                    <textarea value={userStyle} onChange={e=>setUserStyle(e.target.value)} rows={2}
                      placeholder="Describe your content style..."
                      style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 12px', color:'#fff', fontSize:13, fontFamily:"'Satoshi','DM Sans',sans-serif", resize:'none' as const }} />
                  </div>
                  <button className="abtn" style={{ marginBottom:14 }} disabled={!!generatingScript}
                    onClick={async () => {
                      setGeneratingScript(true); setGeneratedScript('');
                      const res = await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({post:selectedPost,type:'script',userStyle,format:selectedFormat})});
                      const data = await res.json();
                      setGeneratedScript(data.result||''); setGeneratingScript(false);
                    }}>
                    {generatingScript ? '···' : '✍️ Generate My Version'}
                  </button>
                  {generatedScript && (
                    <div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:12, background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'14px', border:'1px solid rgba(255,255,255,0.07)' }}>{generatedScript}</div>
                      <button className="obtn" onClick={() => navigator.clipboard.writeText(generatedScript)}>Copy to clipboard</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {savedPosts.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.15)', fontSize:13 }}>
                      <div style={{ fontSize:28, marginBottom:10, opacity:0.5 }}>◇</div>
                      No saved posts yet
                    </div>
                  ) : savedPosts.map((p, i) => (
                    <div key={i} onClick={() => setSelectedPost(p)} style={{ padding:'12px', background:'rgba(255,255,255,0.03)', borderRadius:9, cursor:'pointer', border:'1px solid rgba(255,255,255,0.06)', transition:'all 0.15s' }}
                      onMouseOver={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(245,166,35,0.2)'}}
                      onMouseOut={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.06)'}}>
                      <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.hook?.slice(0,55)}...</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>{p.platform} · {p.likes} likes</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save */}
            <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <button className="obtn" onClick={() => { if (!savedPosts.find(p=>p.id===selectedPost.id)) setSavedPosts([...savedPosts,selectedPost]); }}>
                {savedPosts.find(p=>p.id===selectedPost.id) ? '◈ Saved' : '◇ Save Post'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
