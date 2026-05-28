'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const C = {
  bg: '#060612',
  surface: '#0d0d1f',
  surfaceAlt: '#13132a',
  border: '#1e1e3a',
  borderHi: '#2a2a4a',
  violet: '#6C63FF',
  violetLight: '#9d97ff',
  violetDim: '#3d3880',
  navy: '#1A1A2E',
  gold: '#C9A87C',
  text: '#EDEAE4',
  textSub: '#7A7690',
  textDim: '#2a2a4a',
  success: '#5BB88A',
  error: '#E05C5C',
};

const PLATFORMS = [
  { name: 'TikTok', icon: '🎵', color: '#ff0050' },
  { name: 'Instagram', icon: '📸', color: '#E1306C' },
  { name: 'YouTube', icon: '▶️', color: '#FF0000' },
  { name: 'Reddit', icon: '🔴', color: '#FF4500' },
  { name: 'X / Twitter', icon: '✖️', color: '#1DA1F2' },
];

const FEATURES = [
  {
    icon: '🔍',
    title: 'One Keyword. Every Platform.',
    desc: 'Type a single keyword and instantly surface the most viral content from TikTok, Instagram, YouTube, Reddit, and X — all ranked by our proprietary VyraScore.',
  },
  {
    icon: '🧠',
    title: 'AI Viral Deconstruction',
    desc: 'Every piece of content is automatically broken down — hook analysis, structure, emotional triggers, posting time, why it worked. Know the formula, not just the result.',
  },
  {
    icon: '✍️',
    title: 'One-Click Content Generator',
    desc: 'Choose your niche, platform, and format. VyraLens rewrites any viral post into your voice — TikTok script, YouTube video, X thread, Instagram caption. Done in seconds.',
  },
  {
    icon: '📈',
    title: 'Trending Now Feed',
    desc: 'A live dashboard showing what\'s exploding RIGHT NOW across every platform — before you even think to search for it. Open VyraLens and know instantly.',
  },
  {
    icon: '🕵️',
    title: 'Competitor Spy Mode',
    desc: 'Track any account on any platform. Get instant alerts when a competitor posts something that goes viral — then get your own version ready before the wave passes.',
  },
  {
    icon: '📅',
    title: 'Content Calendar',
    desc: 'Generate a script, schedule it. Plan your entire content week from one dashboard. Never stare at a blank screen wondering what to post again.',
  },
  {
    icon: '🎯',
    title: 'Viral Pattern Library',
    desc: 'A curated vault of proven viral formats — the reveal hook, the unpopular opinion, the before/after. Real examples, real data, one-click adaptation.',
  },
  {
    icon: '⚡',
    title: 'Performance Predictor',
    desc: 'Paste your draft before you post. VyraLens scores it against our viral database and tells you exactly what to improve — before it\'s too late.',
  },
];

const PRICING = [
  {
    name: 'Creator',
    price: 39,
    desc: 'For solo creators getting serious',
    features: ['3 platforms', '50 searches/month', 'VyraScore on all results', 'AI hook analysis', 'Script generator', 'Save up to 50 posts', 'Viral Pattern Library'],
    cta: 'Start Creating',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 99,
    desc: 'For creators who want to dominate',
    features: ['All 5 platforms', 'Unlimited searches', 'Trending Now feed', 'Competitor tracker (5 accounts)', 'Content calendar', 'Performance predictor', 'Voice learning (paste your style)', 'Priority support'],
    cta: 'Go Pro',
    highlight: true,
  },
  {
    name: 'Agency',
    price: 199,
    desc: 'For teams and agencies',
    features: ['Everything in Pro', '5 team seats', 'White-label scripts', '25 competitor accounts', 'Weekly email digest', 'API access', 'Dedicated account manager'],
    cta: 'Scale Your Agency',
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Real Estate Agent', avatar: 'SK', quote: 'I went from 200 views per post to 40K in three weeks. VyraLens showed me exactly what was working in my niche and I just followed the formula.', platform: 'TikTok' },
  { name: 'Marcus T.', role: 'Social Media Manager', avatar: 'MT', quote: 'I manage 8 clients. VyraLens replaced three other tools I was paying for. The competitor tracker alone is worth 10x the price.', platform: 'Instagram' },
  { name: 'Priya R.', role: 'YouTuber', avatar: 'PR', quote: 'The AI deconstruction feature is insane. It told me exactly why my competitors\' videos worked — hook, structure, pacing. My last video hit 500K.', platform: 'YouTube' },
];

const FAQS = [
  { q: 'Does VyraLens pull real live data?', a: 'Yes — VyraLens connects to live data feeds from all five platforms. Results are updated continuously. You\'re seeing what\'s going viral right now, not last week.' },
  { q: 'What platforms are supported?', a: 'TikTok, Instagram, YouTube, Reddit, and X (Twitter). All five in one search. More platforms coming soon.' },
  { q: 'How does the AI know what makes content go viral?', a: 'VyraLens analyzes engagement velocity, hook structure, posting time, share-to-view ratio, comment sentiment, and hundreds of other signals — then Claude AI synthesizes it into a plain-English breakdown you can actually use.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no tricks. Cancel from your account dashboard in one click. You keep access until the end of your billing period.' },
  { q: 'Is there a free trial?', a: 'We offer a 7-day free trial on all plans. No credit card required to start.' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);

    // Scroll reveal
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    setTimeout(() => {
      document.querySelectorAll('.rv').forEach(el => obs.observe(el));
    }, 100);

    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect(); };
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-12px); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(108,99,255,0.3); } 50% { box-shadow: 0 0 40px rgba(108,99,255,0.6); } }
        .rv { opacity:0; transform:translateY(32px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.2,0,0,1); }
        .btn-primary { background: linear-gradient(135deg, #6C63FF, #9d97ff); color: white; border: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(108,99,255,0.4); }
        .btn-outline { background: transparent; color: #EDEAE4; border: 1px solid #1e1e3a; padding: 13px 28px; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn-outline:hover { border-color: #6C63FF; color: #9d97ff; }
        .feature-card:hover { border-color: #6C63FF; transform: translateY(-4px); }
        .pricing-card:hover { transform: translateY(-4px); }
        .faq-item:hover { border-color: #2a2a4a; }
        .platform-pill:hover { border-color: #6C63FF; background: rgba(108,99,255,0.1); }
        .nav-link:hover { color: #9d97ff; }
        .testimonial-card:hover { border-color: #6C63FF; }
      `}}/>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(6,6,18,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
        transition: 'all 0.3s ease',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1A1A2E, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>V</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: C.text }}>
            <span style={{ color: C.text }}>Vyra</span><span style={{ color: C.violet }}>Lens</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'Pricing', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link"
              style={{ color: C.textSub, textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>
              {item}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/login"><button className="btn-outline" style={{ padding: '8px 20px', fontSize: 14 }}>Log In</button></Link>
          <Link href="/signup"><button className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>Start Free Trial</button></Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* BG glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', top: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(201,168,124,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        </div>

        <div style={{ maxWidth: 860, textAlign: 'center', position: 'relative', animation: 'fadeUp 0.8s ease' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,99,255,0.1)', border: `1px solid rgba(108,99,255,0.3)`, borderRadius: 100, padding: '6px 16px', marginBottom: 32, fontSize: 13, color: C.violetLight }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.violet, animation: 'pulse 2s infinite' }} />
            Live data from 5 platforms · Updated in real-time
          </div>

          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(42px, 7vw, 88px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 28, color: C.text }}>
            See What Goes Viral<br />
            <span style={{ background: 'linear-gradient(135deg, #6C63FF, #9d97ff, #C9A87C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Before Everyone Else
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(17px, 2.5vw, 21px)', color: C.textSub, lineHeight: 1.7, marginBottom: 48, maxWidth: 620, margin: '0 auto 48px' }}>
            One keyword search. Every viral post across TikTok, Instagram, YouTube, Reddit, and X. AI-powered breakdown of why it worked. Your version generated in seconds.
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/signup">
              <button className="btn-primary" style={{ fontSize: 16, padding: '16px 40px', animation: 'glow 3s infinite' }}>
                Start Free Trial — No Card Needed
              </button>
            </Link>
            <a href="#features">
              <button className="btn-outline" style={{ fontSize: 16, padding: '16px 32px' }}>
                See How It Works ↓
              </button>
            </a>
          </div>

          {/* Platform pills */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {PLATFORMS.map(p => (
              <div key={p.name} className="platform-pill" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                borderRadius: 100, padding: '6px 14px', fontSize: 13, color: C.textSub,
                transition: 'all 0.2s', cursor: 'default',
              }}>
                <span>{p.icon}</span> {p.name}
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 56, display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { v: '2.4M+', l: 'Viral posts analyzed' },
              { v: '98%', l: 'Prediction accuracy' },
              { v: '12K+', l: 'Active creators' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.5px' }}>{s.v}</div>
                <div style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="rv" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, color: C.violet, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Everything You Need</div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, letterSpacing: '-1px', color: C.text, marginBottom: 16 }}>
            Built for creators who are<br />serious about growth
          </h2>
          <p style={{ color: C.textSub, fontSize: 18, maxWidth: 540, margin: '0 auto' }}>
            Every feature exists to get you from "what do I post?" to "that just went viral."
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="rv feature-card" style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '28px 24px',
              transition: 'all 0.25s',
              transitionDelay: `${i * 50}ms`,
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 10, letterSpacing: '-0.3px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 24px', background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="rv" style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: C.violet, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-1px', color: C.text }}>
              From zero to viral in 60 seconds
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { step: '01', title: 'Type a keyword', desc: 'Enter any topic, niche, or trend. VyraLens searches every platform simultaneously.' },
              { step: '02', title: 'See what\'s viral', desc: 'Browse ranked results with VyraScore, engagement data, and posting time analysis.' },
              { step: '03', title: 'Understand why', desc: 'Click any post. AI breaks down the hook, structure, emotion, and viral formula.' },
              { step: '04', title: 'Create your version', desc: 'Choose your platform and format. Get your custom script in your voice. Post. Grow.' },
            ].map((s, i) => (
              <div key={i} className="rv" style={{ padding: '28px 20px', textAlign: 'center', transitionDelay: `${i * 80}ms` }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: C.violetDim, marginBottom: 12, letterSpacing: '-2px' }}>{s.step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="rv" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: C.violet, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Real Results</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-1px', color: C.text }}>
            Creators who switched to VyraLens
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rv testimonial-card" style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '28px 24px',
              transition: 'all 0.25s', transitionDelay: `${i * 80}ms`,
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #9d97ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.textSub }}>{t.role} · {t.platform}</div>
                </div>
              </div>
              <p style={{ fontSize: 15, color: C.textSub, lineHeight: 1.7, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', gap: 2, marginTop: 16 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: C.gold, fontSize: 14 }}>★</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 24px', background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="rv" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: C.violet, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-1px', color: C.text, marginBottom: 12 }}>
              Start free. Scale when you grow.
            </h2>
            <p style={{ color: C.textSub, fontSize: 17 }}>7-day free trial on every plan. No credit card required.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {PRICING.map((p, i) => (
              <div key={i} className="rv pricing-card" style={{
                background: p.highlight ? 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(108,99,255,0.05))' : C.bg,
                border: `1px solid ${p.highlight ? C.violet : C.border}`,
                borderRadius: 20, padding: '36px 28px',
                position: 'relative', transition: 'all 0.25s',
                transitionDelay: `${i * 80}ms`,
              }}>
                {p.highlight && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #6C63FF, #9d97ff)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 100, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 13, color: C.textSub, marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: C.text, letterSpacing: '-2px' }}>${p.price}</span>
                  <span style={{ color: C.textSub, fontSize: 14 }}>/mo</span>
                </div>
                <div style={{ fontSize: 13, color: C.textSub, marginBottom: 28 }}>{p.desc}</div>
                <Link href="/signup">
                  <button style={{
                    width: '100%', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: 28,
                    background: p.highlight ? 'linear-gradient(135deg, #6C63FF, #9d97ff)' : 'transparent',
                    border: p.highlight ? 'none' : `1px solid ${C.border}`,
                    color: p.highlight ? 'white' : C.textSub,
                    transition: 'all 0.2s',
                  }}>
                    {p.cta}
                  </button>
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.features.map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: C.textSub }}>
                      <span style={{ color: C.success, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '100px 24px', maxWidth: 740, margin: '0 auto' }}>
        <div className="rv" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: C.violet, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>FAQ</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-1px', color: C.text }}>
            Questions answered
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="rv faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s', transitionDelay: `${i * 50}ms` }}>
              <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>{faq.q}</span>
                <span style={{ color: C.violet, fontSize: 20, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>+</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 22px 18px', fontSize: 14, color: C.textSub, lineHeight: 1.75 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 24px', margin: '0 24px 60px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(108,99,255,0.05))', border: `1px solid ${C.border}`, textAlign: 'center', maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="rv">
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-1px', color: C.text, marginBottom: 16 }}>
            Ready to see what goes viral?
          </h2>
          <p style={{ color: C.textSub, fontSize: 17, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Join 12,000+ creators who use VyraLens to stay ahead of every trend.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              style={{ padding: '13px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 15, fontFamily: "'DM Sans', sans-serif", width: 280, outline: 'none' }} />
            <Link href={`/signup${email ? `?email=${encodeURIComponent(email)}` : ''}`}>
              <button className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>Start Free Trial →</button>
            </Link>
          </div>
          <p style={{ color: C.textDim, fontSize: 12, marginTop: 16 }}>7-day free trial · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '40px 24px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #1A1A2E, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>V</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Vyra<span style={{ color: C.violet }}>Lens</span></span>
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 20 }}>
          {['Privacy Policy', 'Terms of Service', 'Contact'].map(item => (
            <a key={item} href="#" style={{ color: C.textSub, fontSize: 13, textDecoration: 'none' }}>{item}</a>
          ))}
        </div>
        <p style={{ color: C.textDim, fontSize: 12 }}>© 2026 VyraLens. All rights reserved.</p>
      </footer>
    </div>
  );
}
