'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const TICKER = [
  { platform: 'TikTok', likes: '42.3M views', hook: "I did 100 push-ups every day for a year..." },
  { platform: 'Instagram', likes: '1.4M likes', hook: "This one habit changed everything for me..." },
  { platform: 'YouTube', likes: '8.9M views', hook: "I bought my first property with $0 down..." },
  { platform: 'TikTok', likes: '31.2M views', hook: "Dermatologist reacts to your skincare routine..." },
  { platform: 'Instagram', likes: '2.1M likes', hook: "Nobody talks about this side of success..." },
  { platform: 'YouTube', likes: '12.4M views', hook: "How I made $10K in my first 30 days..." },
  { platform: 'TikTok', likes: '67.8M views', hook: "Stop waiting for the right moment. Do this..." },
  { platform: 'Instagram', likes: '890K likes', hook: "The money secret they never teach you in school..." },
];
const PC: Record<string,string> = { TikTok:'#FF2D55', Instagram:'#C13584', YouTube:'#FF0000' };

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0; const step = target / (duration / 16);
        const timer = setInterval(() => { start += step; if (start >= target) { setCount(target); clearInterval(timer); } else setCount(Math.floor(start)); }, 16);
        obs.disconnect();
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return { count, ref };
}

function StatCard({ value, suffix, label }: { value: number, suffix: string, label: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '32px 24px', textAlign: 'center', transition: 'all 0.3s' }}>
      <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 44, fontWeight: 800, color: '#F5A623', letterSpacing: '-0.02em', marginBottom: 8 }}>{count.toLocaleString()}{suffix}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(32px)', transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s` }}>
      {children}
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '24px 0', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 600, color: open ? '#F5A623' : 'rgba(255,255,255,0.85)', transition: 'color 0.2s', fontFamily: "'Cabinet Grotesk', sans-serif" }}>
        <span>{q}</span>
        <span style={{ color: '#F5A623', fontSize: 22, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.25s', display: 'inline-block', flexShrink: 0, marginLeft: 16 }}>+</span>
      </div>
      <div style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginTop: 14 }}>{a}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [typed, setTyped] = useState('');
  const [heroVis, setHeroVis] = useState(false);
  const words = ['fitness', 'real estate', 'manifesting', 'skincare', 'side hustle', 'mindset'];
  const wi = useRef(0); const ci = useRef(0); const del = useRef(false);

  useEffect(() => { setTimeout(() => setHeroVis(true), 100); }, []);
  useEffect(() => { const t = setInterval(() => setTick(p => p - 1), 22); return () => clearInterval(t); }, []);
  useEffect(() => {
    const run = () => {
      const w = words[wi.current];
      if (!del.current) {
        if (ci.current <= w.length) { setTyped(w.slice(0, ci.current)); ci.current++; }
        else setTimeout(() => { del.current = true; }, 2200);
      } else {
        if (ci.current > 0) { ci.current--; setTyped(w.slice(0, ci.current)); }
        else { del.current = false; wi.current = (wi.current + 1) % words.length; }
      }
    };
    const t = setTimeout(run, del.current ? 42 : 108);
    return () => clearTimeout(t);
  }, [typed]);

  const totalW = TICKER.length * 340;

  return (
    <div style={{ background: '#070707', minHeight: '100vh', color: '#fff', fontFamily: "'Satoshi', 'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&f[]=cabinet-grotesk@800,700,500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}

        .btn-g{background:#F5A623;color:#080808;border:none;padding:15px 34px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;transition:all 0.25s;letter-spacing:0.01em;position:relative;overflow:hidden}
        .btn-g::after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%);transform:translateX(-100%);transition:transform 0.5s}
        .btn-g:hover{background:#FFB73D;transform:translateY(-2px);box-shadow:0 12px 40px rgba(245,166,35,0.35)}
        .btn-g:hover::after{transform:translateX(100%)}

        .btn-o{background:transparent;color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.15);padding:14px 30px;border-radius:8px;font-size:15px;cursor:pointer;font-family:'Satoshi','DM Sans',sans-serif;transition:all 0.25s}
        .btn-o:hover{border-color:rgba(255,255,255,0.4);color:#fff;background:rgba(255,255,255,0.04)}

        .gcard{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;transition:all 0.3s}
        .gcard:hover{background:rgba(255,255,255,0.05);border-color:rgba(245,166,35,0.3);transform:translateY(-3px);box-shadow:0 20px 60px rgba(0,0,0,0.3)}

        .plan{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px 32px;position:relative;cursor:pointer;transition:all 0.3s}
        .plan:hover{transform:translateY(-6px);box-shadow:0 30px 80px rgba(0,0,0,0.4)}
        .plan.hot{background:rgba(245,166,35,0.06);border-color:rgba(245,166,35,0.35);box-shadow:0 0 80px rgba(245,166,35,0.08)}
        .plan.hot:hover{box-shadow:0 30px 80px rgba(245,166,35,0.15)}

        .tag{display:inline-flex;align-items:center;gap:8px;background:rgba(245,166,35,0.1);border:1px solid rgba(245,166,35,0.2);color:#F5A623;padding:6px 16px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase}

        .nav-a{color:rgba(255,255,255,0.45);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s}
        .nav-a:hover{color:#fff}

        .cursor{display:inline-block;width:3px;height:1.1em;background:#F5A623;vertical-align:middle;margin-left:2px;animation:blink 1s infinite;border-radius:2px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

        .ticker-item{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 22px;min-width:320px;margin-right:16px;flex-shrink:0;transition:border-color 0.3s}
        .ticker-item:hover{border-color:rgba(245,166,35,0.25)}

        .feat-cell{background:#0D0D0D;padding:40px 32px;transition:all 0.3s;position:relative;overflow:hidden}
        .feat-cell::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(245,166,35,0.3),transparent);opacity:0;transition:opacity 0.3s}
        .feat-cell:hover{background:#111}
        .feat-cell:hover::before{opacity:1}

        .noise{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

        .mesh{position:absolute;width:100%;height:100%;top:0;left:0;pointer-events:none;background:radial-gradient(ellipse 80% 60% at 20% 40%,rgba(245,166,35,0.07) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 70%,rgba(245,166,35,0.04) 0%,transparent 60%)}

        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
        @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(245,166,35,0.2)}50%{box-shadow:0 0 60px rgba(245,166,35,0.5)}}

        .float-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:float 6s ease-in-out infinite}

        @media(max-width:768px){.grid3{grid-template-columns:1fr!important}.grid4{grid-template-columns:1fr 1fr!important}.hide-m{display:none!important}.hero-btns{flex-direction:column;align-items:flex-start!important}}
      `}} />

      <div className="noise" />

      {/* Animated background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="float-orb" style={{ width: 600, height: 600, background: 'rgba(245,166,35,0.06)', top: '-10%', left: '-10%', animationDelay: '0s' }} />
        <div className="float-orb" style={{ width: 400, height: 400, background: 'rgba(245,166,35,0.04)', top: '40%', right: '-5%', animationDelay: '-3s' }} />
        <div className="float-orb" style={{ width: 300, height: 300, background: 'rgba(245,100,35,0.03)', bottom: '10%', left: '20%', animationDelay: '-1.5s' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,7,7,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>
            VYRA<span style={{ color: '#F5A623' }}>.</span>
          </div>
          <div className="hide-m" style={{ display: 'flex', gap: 32 }}>
            {['Features','Pricing','FAQ'].map(l => <a key={l} href={`#${l.toLowerCase()}`} className="nav-a">{l}</a>)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-o" style={{ padding: '9px 22px', fontSize: 14 }} onClick={() => router.push('/login')}>Sign In</button>
          <button className="btn-g" style={{ padding: '9px 22px', fontSize: 14 }} onClick={() => router.push('/signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '168px 48px 80px', position: 'relative', zIndex: 1 }}>
        <div className="mesh" />

        {/* Live badge */}
        <div style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease 0.1s', marginBottom: 32 }}>
          <span className="tag">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F5A623', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
            Live Intelligence Feed
          </span>
        </div>

        <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(54px, 8.5vw, 96px)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.04em', marginBottom: 32, maxWidth: 900, opacity: heroVis ? 1 : 0, transform: heroVis ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease 0.2s' }}>
          Find what's going<br />
          <span style={{ color: '#F5A623', position: 'relative' }}>
            viral
            <span style={{ position: 'absolute', bottom: 2, left: 0, right: 0, height: 4, background: 'rgba(245,166,35,0.3)', borderRadius: 2 }} />
          </span>{' '}before<br />
          everyone else.
        </h1>

        <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.45)', maxWidth: 500, lineHeight: 1.7, marginBottom: 48, opacity: heroVis ? 1 : 0, transform: heroVis ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.35s' }}>
          Search any keyword. See the most viral posts across TikTok, Instagram, and YouTube — then let AI break down exactly why they worked and write your version.
        </p>

        <div className="hero-btns" style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 72, flexWrap: 'wrap', opacity: heroVis ? 1 : 0, transition: 'all 0.8s ease 0.45s' }}>
          <button className="btn-g" style={{ fontSize: 16, padding: '17px 40px' }} onClick={() => router.push('/signup')}>Start for Free →</button>
          <button className="btn-o" style={{ fontSize: 16, padding: '16px 32px' }} onClick={() => router.push('/login')}>Sign In</button>
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 13, borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 20 }}>30-day money-back guarantee</span>
        </div>

        {/* Live search demo */}
        <div style={{ opacity: heroVis ? 1 : 0, transform: heroVis ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)', transition: 'all 1s ease 0.55s' }}>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: '24px 26px', maxWidth: 680, boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,166,35,0.08)' }}>
            {/* Search bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(245,166,35,0.12)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🔍</div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 18px', fontSize: 15, display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.28)', marginRight: 8 }}>Searching:</span>
                <span style={{ fontWeight: 600 }}>{typed}</span>
                <span className="cursor" />
              </div>
              <div style={{ background: '#F5A623', color: '#080808', padding: '11px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}>Analyze →</div>
            </div>
            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { v:'42.3M', l:'8.1M', p:'TikTok', h:"I did 100 push-ups every day for a year. Here's what happened to my body..." },
                { v:'18.7M', l:'3.2M', p:'Instagram', h:"The fitness secret trainers don't want you to know about" },
                { v:'9.4M', l:'1.1M', p:'YouTube', h:"Why everything you know about working out is completely wrong" },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${PC[item.p]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {item.p === 'TikTok' ? '🎵' : item.p === 'Instagram' ? '📸' : '▶️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{item.h}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', display: 'flex', gap: 10 }}>
                      <span>👁 {item.v} views</span><span>❤️ {item.l} likes</span>
                    </div>
                  </div>
                  <div style={{ background: `${PC[item.p]}20`, color: PC[item.p], fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, flexShrink: 0, letterSpacing: '0.05em' }}>{item.p}</div>
                </div>
              ))}
            </div>
            {/* AI breakdown teaser */}
            <div style={{ marginTop: 14, padding: '14px 18px', background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: '#F5A623', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>🧠 AI BREAKDOWN</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Hook uses <strong style={{ color: 'rgba(255,255,255,0.8)' }}>personal transformation</strong> + <strong style={{ color: 'rgba(255,255,255,0.8)' }}>time specificity</strong>. Pattern: "I did X for Y days" triggers curiosity gap and social proof simultaneously...</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)', padding: '20px 0', overflow: 'hidden', marginBottom: 120, position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg, #070707, transparent)', zIndex: 2 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(270deg, #070707, transparent)', zIndex: 2 }} />
        <div style={{ display: 'flex', transform: `translateX(${tick % totalW}px)`, width: totalW * 2 }}>
          {[...TICKER,...TICKER].map((item, i) => (
            <div key={i} className="ticker-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ background: `${PC[item.platform]}18`, color: PC[item.platform], fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>{item.platform}</span>
                <span style={{ color: '#F5A623', fontSize: 12, fontWeight: 700 }}>{item.likes}</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>{item.hook}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 130px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div className="grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard value={2400} suffix="B+" label="Posts Analyzed" />
            <StatCard value={180} suffix="+" label="Niches Covered" />
            <StatCard value={94} suffix="%" label="Accuracy Rate" />
            <StatCard value={30} suffix="s" label="Avg Script Time" />
          </div>
        </FadeIn>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 130px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div className="tag" style={{ marginBottom: 22 }}>Features</div>
            <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(38px, 5vw, 62px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 18 }}>
              Everything you need to create<br />content that <span style={{ color: '#F5A623' }}>actually wins</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 17, maxWidth: 460, margin: '0 auto', lineHeight: 1.65 }}>Stop guessing. Start knowing exactly what your audience wants to watch.</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 22, overflow: 'hidden' }}>
            {[
              ['🔎','Viral Discovery Engine','Search any keyword and surface the most viral posts across TikTok, Instagram, YouTube, and Reddit — sorted by real engagement, not the algorithm.'],
              ['🧠','AI Breakdown','Click any viral post and get a deep breakdown of the hook, structure, emotional triggers, pacing, and exactly why it performed the way it did.'],
              ['✍️','Script Generator','Generate your version of any viral post — in your voice, your niche, your style — in under 30 seconds. Ready to record.'],
              ['📈','Trend Velocity','See what\'s exploding right now vs what peaked months ago. Catch trends before they hit the mainstream — not after.'],
              ['🎯','Niche Intelligence','Deep keyword and hashtag expansion. We map the entire viral content graph of your niche so nothing slips through.'],
              ['🔄','Always Growing','Our engine indexes millions of posts every single day. Your library of viral content grows automatically in the background.'],
            ].map(([icon, title, desc], i) => (
              <div key={i} className="feat-cell">
                <div style={{ fontSize: 32, marginBottom: 18, filter: 'drop-shadow(0 0 12px rgba(245,166,35,0.2))' }}>{icon}</div>
                <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 12, color: '#fff' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.37)', lineHeight: 1.72 }}>{desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Social proof */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 130px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="tag" style={{ marginBottom: 22 }}>Results</div>
            <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Creators are already <span style={{ color: '#F5A623' }}>winning</span>
            </h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              ['Sarah K.','Fitness Creator · 280K followers',"I found a post with 8M views in my niche I had no idea existed. Used the AI breakdown to make my own version. It hit 2.1M views in 4 days."],
              ['Marcus T.','Real Estate Agent · Content Creator',"My competitors have no idea how I keep going viral. I'm just using VYRA to find what's working and doing my version. It's genuinely not close."],
              ['Priya M.','Skincare Brand · 95K followers',"The script generator alone is worth 10x the price. I went from spending 3 hours on scripts to 3 minutes. And they actually perform better."],
            ].map(([name, role, quote], i) => (
              <div key={i} className="gcard" style={{ padding: '30px' }}>
                <div style={{ color: '#F5A623', fontSize: 15, marginBottom: 16, letterSpacing: 4 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{quote}"</p>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{role}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 130px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div className="tag" style={{ marginBottom: 22 }}>Pricing</div>
            <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(38px, 5vw, 62px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 16 }}>
              Simple, transparent <span style={{ color: '#F5A623' }}>pricing</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 16 }}>30-day money-back guarantee on all plans. No questions asked.</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { name:'Creator', price:'$39', desc:'For solo creators getting serious', features:['All platforms','500 searches/month','AI viral breakdown','Script generator','30-day guarantee'], hot:false },
              { name:'Pro', price:'$99', desc:'For creators who want to dominate', features:['Unlimited searches','All platforms','Advanced AI analysis','Voice-matched scripts','Priority support','30-day guarantee'], hot:true },
              { name:'Agency', price:'$199', desc:'For teams managing multiple brands', features:['Everything in Pro','10 team seats','White-label reports','API access','Dedicated support','30-day guarantee'], hot:false },
            ].map((plan, i) => (
              <div key={i} className={`plan ${plan.hot ? 'hot' : ''}`} onClick={() => router.push('/signup')}>
                {plan.hot && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#F5A623', color: '#080808', fontSize: 10, fontWeight: 800, padding: '5px 18px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.1em', fontFamily: "'Cabinet Grotesk', sans-serif" }}>MOST POPULAR</div>}
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: 14, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 56, fontWeight: 800, color: plan.hot ? '#F5A623' : '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 15 }}>/mo</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 30, lineHeight: 1.55 }}>{plan.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 34 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
                      <span style={{ color: '#F5A623', fontSize: 14, fontWeight: 700 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <div style={{ width: '100%', padding: '15px', borderRadius: 11, fontSize: 14, fontWeight: 700, background: plan.hot ? '#F5A623' : 'rgba(255,255,255,0.06)', border: plan.hot ? 'none' : '1px solid rgba(255,255,255,0.1)', color: plan.hot ? '#080808' : 'rgba(255,255,255,0.65)', textAlign: 'center' as const, fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: '0.02em', transition: 'all 0.2s' }}>
                  Get {plan.name} →
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ maxWidth: 760, margin: '0 auto', padding: '0 48px 130px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="tag" style={{ marginBottom: 22 }}>FAQ</div>
            <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Questions? <span style={{ color: '#F5A623' }}>Answered.</span></h2>
          </div>
          {[
            ['How is this different from searching TikTok or Instagram directly?','VYRA searches millions of posts across all platforms simultaneously and ranks by actual engagement — not what the algorithm decides to show you. You see what\'s truly viral, not what\'s being promoted.'],
            ['Do I need to be a content creator?','No. VYRA is used by solo creators, marketing agencies, real estate agents, brand managers, and anyone who creates content professionally.'],
            ['How accurate is the AI analysis?','Our AI is trained on millions of viral posts and identifies the exact patterns — hook structure, emotional triggers, pacing, and CTAs — that make content explode.'],
            ['What platforms do you cover?','TikTok, Instagram (Reels, Posts, Carousels), YouTube, and Reddit. More platforms being added.'],
            ['Can I cancel anytime?','Yes. Cancel anytime with one click. And if you\'re not happy in the first 30 days, we\'ll refund you — no questions asked.'],
          ].map(([q, a], i) => <FAQ key={i} q={q as string} a={a as string} />)}
        </FadeIn>
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 160px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 28, padding: '100px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'rgba(245,166,35,0.06)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', animation: 'pulse-glow 4s ease-in-out infinite' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.0, marginBottom: 22 }}>
                Stop creating content<br />that <span style={{ color: '#F5A623' }}>nobody sees.</span>
              </h2>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.42)', marginBottom: 48, maxWidth: 460, margin: '0 auto 48px', lineHeight: 1.65 }}>
                Join creators who already know what goes viral before they even hit record.
              </p>
              <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn-g" style={{ fontSize: 17, padding: '20px 48px' }} onClick={() => router.push('/signup')}>Get Started Free →</button>
                <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 14 }}>✓ 30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>VYRA<span style={{ color: '#F5A623' }}>.</span></div>
        <div style={{ display: 'flex', gap: 32 }}>{['Privacy','Terms','Support'].map(l => <a key={l} href="#" className="nav-a">{l}</a>)}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>© 2026 VYRA. All rights reserved.</div>
      </footer>
    </div>
  );
}
