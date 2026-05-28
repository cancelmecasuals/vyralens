'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const TICKER = [
  { platform: 'TikTok', likes: '42.3M views', hook: 'I did 100 push-ups every day for a year...' },
  { platform: 'Instagram', likes: '1.4M likes', hook: 'This one habit changed everything...' },
  { platform: 'YouTube', likes: '8.9M views', hook: 'I bought my first property with $0 down...' },
  { platform: 'TikTok', likes: '31.2M views', hook: 'Dermatologist reacts to your routine...' },
  { platform: 'Instagram', likes: '2.1M likes', hook: 'Nobody talks about this side of success...' },
  { platform: 'YouTube', likes: '12.4M views', hook: 'How I made $10K in 30 days...' },
  { platform: 'TikTok', likes: '67.8M views', hook: 'Stop waiting for the right moment...' },
  { platform: 'Instagram', likes: '890K likes', hook: 'The money secret they never teach you...' },
];

const PC: Record<string, string> = { TikTok: '#FF2D55', Instagram: '#C13584', YouTube: '#FF0000' };

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '24px 0', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 600, color: open ? '#F5A623' : 'rgba(255,255,255,0.85)', transition: 'color 0.2s' }}>
        <span>{q}</span>
        <span style={{ color: '#F5A623', fontSize: 22, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>+</span>
      </div>
      {open && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginTop: 14 }}>{a}</p>}
    </div>
  );
}

export default function Landing() {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [typed, setTyped] = useState('');
  const words = ['fitness', 'real estate', 'manifesting', 'skincare', 'side hustle', 'mindset'];
  const wi = useRef(0); const ci = useRef(0); const del = useRef(false);

  useEffect(() => { const t = setInterval(() => setTick(p => p - 1), 25); return () => clearInterval(t); }, []);

  useEffect(() => {
    const run = () => {
      const w = words[wi.current];
      if (!del.current) {
        if (ci.current <= w.length) { setTyped(w.slice(0, ci.current)); ci.current++; }
        else setTimeout(() => { del.current = true; }, 2000);
      } else {
        if (ci.current > 0) { ci.current--; setTyped(w.slice(0, ci.current)); }
        else { del.current = false; wi.current = (wi.current + 1) % words.length; }
      }
    };
    const t = setTimeout(run, del.current ? 45 : 110);
    return () => clearTimeout(t);
  }, [typed]);

  const totalW = TICKER.length * 340;

  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: '#fff', fontFamily: "'Satoshi', 'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&f[]=clash-display@700,600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        .btn-g{background:#F5A623;color:#080808;border:none;padding:15px 34px;border-radius:7px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;transition:all 0.2s;letter-spacing:0.01em}
        .btn-g:hover{background:#FFB73D;transform:translateY(-1px);box-shadow:0 8px 30px rgba(245,166,35,0.3)}
        .btn-o{background:transparent;color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.15);padding:14px 30px;border-radius:7px;font-size:15px;cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;transition:all 0.2s}
        .btn-o:hover{border-color:rgba(255,255,255,0.4);color:#fff}
        .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;transition:all 0.25s}
        .card:hover{background:rgba(255,255,255,0.05);border-color:rgba(245,166,35,0.25);transform:translateY(-2px)}
        .plan{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:36px 28px;position:relative;cursor:pointer;transition:all 0.25s}
        .plan:hover{transform:translateY(-4px)}
        .plan.hot{background:rgba(245,166,35,0.06);border-color:rgba(245,166,35,0.35);box-shadow:0 0 60px rgba(245,166,35,0.08)}
        .tag{display:inline-flex;align-items:center;gap:6px;background:rgba(245,166,35,0.1);border:1px solid rgba(245,166,35,0.2);color:#F5A623;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase}
        .nav-a{color:rgba(255,255,255,0.45);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s}
        .nav-a:hover{color:#fff}
        .cursor{display:inline-block;width:2px;height:1em;background:#F5A623;vertical-align:middle;margin-left:1px;animation:blink 1s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .ticker-item{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 20px;min-width:310px;margin-right:14px;flex-shrink:0}
        .feat-cell{background:#0D0D0D;padding:36px 30px;transition:background 0.2s}
        .feat-cell:hover{background:#111}
        .noise{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        @media(max-width:768px){.grid3{grid-template-columns:1fr!important}.grid4{grid-template-columns:1fr 1fr!important}.hide-m{display:none!important}}
      `}} />

      <div className="noise" />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>VYRA<span style={{ color: '#F5A623' }}>.</span></div>
          <div className="hide-m" style={{ display: 'flex', gap: 28 }}>
            <a href="#features" className="nav-a">Features</a>
            <a href="#pricing" className="nav-a">Pricing</a>
            <a href="#faq" className="nav-a">FAQ</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-o" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => router.push('/login')}>Sign In</button>
          <button className="btn-g" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => router.push('/signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '160px 40px 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 100, left: -200, width: 700, height: 700, background: 'rgba(245,166,35,0.05)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="tag" style={{ marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A623', display: 'inline-block', animation: 'blink 2s infinite' }} />
            Live Intelligence Feed
          </div>
          <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(52px, 8vw, 92px)', fontWeight: 700, lineHeight: 0.97, letterSpacing: '-0.035em', marginBottom: 28, maxWidth: 860 }}>
            Find what's going<br />
            <span style={{ color: '#F5A623' }}>viral</span> before<br />
            everyone else does.
          </h1>
          <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.45)', maxWidth: 500, lineHeight: 1.65, marginBottom: 44 }}>
            Search any keyword. See the most viral posts across TikTok, Instagram, and YouTube — then let AI break down exactly why they worked.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 64, flexWrap: 'wrap' }}>
            <button className="btn-g" style={{ fontSize: 16, padding: '16px 38px' }} onClick={() => router.push('/signup')}>Start for Free →</button>
            <button className="btn-o" style={{ fontSize: 16, padding: '15px 30px' }} onClick={() => router.push('/login')}>Sign In</button>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 20 }}>30-day money-back guarantee</span>
          </div>

          {/* Demo card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '22px 24px', maxWidth: 660, boxShadow: '0 0 40px rgba(245,166,35,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ background: 'rgba(245,166,35,0.12)', borderRadius: 8, padding: '8px 10px', fontSize: 16 }}>🔍</div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '10px 16px', fontSize: 15, display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: 6 }}>Searching:</span>
                <span>{typed}</span><span className="cursor" />
              </div>
              <div style={{ background: '#F5A623', color: '#080808', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>Analyze →</div>
            </div>
            {[
              { views: '42.3M', likes: '8.1M', platform: 'TikTok', hook: "I did 100 push-ups every day for a year. Here's what happened..." },
              { views: '18.7M', likes: '3.2M', platform: 'Instagram', hook: "The fitness secret trainers don't want you to know" },
              { views: '9.4M', likes: '1.1M', platform: 'YouTube', hook: "Why everything you know about working out is wrong" },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 2 ? 8 : 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${PC[item.platform]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {item.platform === 'TikTok' ? '🎵' : item.platform === 'Instagram' ? '📸' : '▶️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.hook}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>👁 {item.views} · ❤️ {item.likes}</div>
                </div>
                <div style={{ background: `${PC[item.platform]}20`, color: PC[item.platform], fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, flexShrink: 0 }}>{item.platform}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)', padding: '18px 0', overflow: 'hidden', marginBottom: 100 }}>
        <div style={{ display: 'flex', transform: `translateX(${tick % totalW}px)`, width: totalW * 2 }}>
          {[...TICKER, ...TICKER].map((item, i) => (
            <div key={i} className="ticker-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ background: `${PC[item.platform]}20`, color: PC[item.platform], fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>{item.platform}</span>
                <span style={{ color: '#F5A623', fontSize: 12, fontWeight: 700 }}>{item.likes}</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item.hook}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 100px' }}>
        <div className="grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[['2.4B+','Posts Analyzed'],['180+','Niches Covered'],['94%','Accuracy Rate'],['30s','Avg Script Time']].map(([v,l],i) => (
            <div key={i} className="card" style={{ padding: '28px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 42, fontWeight: 700, color: '#F5A623', letterSpacing: '-0.02em', marginBottom: 6 }}>{v}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 120px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="tag" style={{ marginBottom: 20 }}>Features</div>
          <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.08, marginBottom: 16 }}>
            Everything you need to create<br />content that <span style={{ color: '#F5A623' }}>wins</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 17, maxWidth: 460, margin: '0 auto' }}>Stop guessing. Start knowing exactly what your audience wants.</p>
        </div>
        <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 20, overflow: 'hidden' }}>
          {[
            ['🔎','Viral Discovery Engine','Search any keyword and surface the most viral posts across TikTok, Instagram, YouTube, and Reddit. Sorted by real engagement.'],
            ['🧠','AI Breakdown','Click any viral post and get a deep analysis of the hook, structure, pacing, emotional triggers, and why it performed.'],
            ['✍️','Script Generator','Generate your own version of any viral post — in your voice, your niche, your style — in under 30 seconds.'],
            ['📈','Trend Velocity','See which content is exploding right now vs what peaked months ago. Catch trends before they go mainstream.'],
            ['🎯','Niche Intelligence','Deep keyword and hashtag expansion. We map the entire content graph of your niche automatically.'],
            ['🔄','Always Growing','Our engine indexes millions of posts every day. Your library of viral content grows automatically in the background.'],
          ].map(([icon, title, desc], i) => (
            <div key={i} className="feat-cell">
              <div style={{ fontSize: 30, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 10, color: '#fff' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 120px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="tag" style={{ marginBottom: 20 }}>Testimonials</div>
          <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em' }}>
            Creators are already <span style={{ color: '#F5A623' }}>winning</span>
          </h2>
        </div>
        <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {[
            ['Sarah K.','Fitness Creator · 280K followers',"I found a post with 8M views in my niche that I had no idea existed. Used the AI breakdown to make my version. It hit 2.1M views in 4 days."],
            ['Marcus T.','Real Estate Agent · Content Creator',"My competitors have no idea how I keep going viral. I'm just using VYRA to find what's working and doing my version. It's not even close."],
            ['Priya M.','Skincare Brand · 95K followers',"The script generator alone is worth 10x the price. I went from 3 hours writing scripts to 3 minutes. And they actually perform better."],
          ].map(([name, role, quote], i) => (
            <div key={i} className="card" style={{ padding: '28px' }}>
              <div style={{ color: '#F5A623', fontSize: 14, marginBottom: 14, letterSpacing: 3 }}>★★★★★</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 18, fontStyle: 'italic' }}>"{quote}"</p>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 120px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="tag" style={{ marginBottom: 20 }}>Pricing</div>
          <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.08, marginBottom: 14 }}>
            Simple, transparent <span style={{ color: '#F5A623' }}>pricing</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>30-day money-back guarantee on all plans. No questions asked.</p>
        </div>
        <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {[
            { name: 'Creator', price: '$39', desc: 'For solo creators getting serious', features: ['All platforms', '500 searches/month', 'AI viral breakdown', 'Script generator', '30-day guarantee'], hot: false },
            { name: 'Pro', price: '$99', desc: 'For creators who want to dominate', features: ['Unlimited searches', 'All platforms', 'Advanced AI analysis', 'Voice-matched scripts', 'Priority support', '30-day guarantee'], hot: true },
            { name: 'Agency', price: '$199', desc: 'For teams managing multiple brands', features: ['Everything in Pro', '10 team seats', 'White-label reports', 'API access', 'Dedicated support', '30-day guarantee'], hot: false },
          ].map((plan, i) => (
            <div key={i} className={`plan ${plan.hot ? 'hot' : ''}`} onClick={() => router.push('/signup')}>
              {plan.hot && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#F5A623', color: '#080808', fontSize: 10, fontWeight: 800, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.08em' }}>MOST POPULAR</div>}
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 52, fontWeight: 700, color: plan.hot ? '#F5A623' : '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{plan.price}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>/mo</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 26, lineHeight: 1.5 }}>{plan.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 30 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                    <span style={{ color: '#F5A623' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ width: '100%', padding: '13px', borderRadius: 9, fontSize: 14, fontWeight: 700, background: plan.hot ? '#F5A623' : 'rgba(255,255,255,0.06)', border: plan.hot ? 'none' : '1px solid rgba(255,255,255,0.1)', color: plan.hot ? '#080808' : 'rgba(255,255,255,0.65)', textAlign: 'center' }}>
                Get {plan.name} →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ maxWidth: 740, margin: '0 auto', padding: '0 40px 120px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="tag" style={{ marginBottom: 20 }}>FAQ</div>
          <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em' }}>Questions? <span style={{ color: '#F5A623' }}>Answered.</span></h2>
        </div>
        {[
          ['How is this different from searching TikTok or Instagram directly?','VYRA searches millions of posts across all platforms simultaneously and ranks by actual engagement — not what the algorithm shows you. You see what\'s truly viral, not what\'s being promoted.'],
          ['Do I need to be a content creator?','No. VYRA is used by solo creators, marketing agencies, real estate agents, brand managers, and anyone who needs content that performs.'],
          ['How accurate is the AI analysis?','Our AI is trained on millions of viral posts and identifies the exact patterns — hook structure, emotional triggers, pacing, and CTAs — that make content explode.'],
          ['What platforms do you cover?','TikTok, Instagram (Reels, Posts, Carousels), YouTube, and Reddit. More platforms coming.'],
          ['Can I cancel anytime?','Yes. Cancel anytime with one click. And if you\'re not happy in the first 30 days, we\'ll refund you — no questions asked.'],
        ].map(([q, a], i) => <FAQ key={i} q={q as string} a={a as string} />)}
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 140px' }}>
        <div style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.18)', borderRadius: 24, padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'rgba(245,166,35,0.07)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.08, marginBottom: 18 }}>
              Stop creating content<br />that <span style={{ color: '#F5A623' }}>nobody sees.</span>
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', marginBottom: 40, maxWidth: 440, margin: '0 auto 40px' }}>
              Join creators who already know what goes viral before they hit record.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn-g" style={{ fontSize: 17, padding: '18px 44px' }} onClick={() => router.push('/signup')}>Get Started Free →</button>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>✓ 30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '36px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>VYRA<span style={{ color: '#F5A623' }}>.</span></div>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Privacy','Terms','Support'].map(l => <a key={l} href="#" className="nav-a">{l}</a>)}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>© 2026 VYRA. All rights reserved.</div>
      </footer>
    </div>
  );
}
