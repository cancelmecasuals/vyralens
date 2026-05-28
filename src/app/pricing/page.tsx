'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const C = {
  bg: '#060612', surface: '#0d0d1f', border: '#1e1e3a',
  violet: '#6C63FF', violetLight: '#9d97ff', violetDim: 'rgba(108,99,255,0.15)',
  text: '#EDEAE4', textSub: '#7A7690', gold: '#C9A87C', success: '#5BB88A',
};

const PLANS = [
  {
    id: 'creator', name: 'Creator', price: 39,
    desc: 'For solo creators getting serious',
    features: ['TikTok, Instagram, YouTube, X', '50 searches/month', 'VyraScore on all results', 'AI hook analysis', 'Script generator', 'Save up to 50 posts', 'Viral Pattern Library'],
    highlight: false, cta: 'Start Creator',
  },
  {
    id: 'pro', name: 'Pro', price: 99,
    desc: 'For creators who want to dominate',
    features: ['All 4 platforms — unlimited searches', 'Trending Now live feed', 'Competitor tracker', 'Content calendar', 'Performance predictor', 'Voice learning — match your style', 'Priority support'],
    highlight: true, cta: 'Go Pro',
  },
  {
    id: 'agency', name: 'Agency', price: 199,
    desc: 'For teams and agencies',
    features: ['Everything in Pro', '5 team seats', 'White-label scripts', 'API access', 'Weekly email digest', 'Dedicated account manager'],
    highlight: false, cta: 'Scale Your Agency',
  },
];

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    });
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!user) { router.push('/signup'); return; }
    setLoading(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Something went wrong. Please try again.');
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setLoading(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", padding: '80px 24px' }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .plan-btn:hover { opacity: 0.9; transform: translateY(-1px); }
      `}}/>

      {/* Nav */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '0 32px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,18,0.95)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, #1A1A2E, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>V</div>
          <span style={{ fontWeight: 700, fontSize: 17, color: C.text }}>Vyra<span style={{ color: C.violet }}>Lens</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 10 }}>
          {user
            ? <Link href="/dashboard"><button style={{ padding: '7px 18px', background: `linear-gradient(135deg, ${C.violet}, ${C.violetLight})`, border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Dashboard</button></Link>
            : <>
                <Link href="/login"><button style={{ padding: '7px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSub, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Log In</button></Link>
                <Link href="/signup"><button style={{ padding: '7px 18px', background: `linear-gradient(135deg, ${C.violet}, ${C.violetLight})`, border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Sign Up</button></Link>
              </>
          }
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 12, color: C.violet, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Pricing</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, letterSpacing: '-1px', color: C.text, marginBottom: 12 }}>
            Start free. Scale when you grow.
          </h1>
          <p style={{ color: C.textSub, fontSize: 17 }}>30-day money-back guarantee on all plans. Cancel anytime.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.highlight ? 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(108,99,255,0.04))' : C.surface,
              border: `1px solid ${plan.highlight ? C.violet : C.border}`,
              borderRadius: 20, padding: '36px 28px', position: 'relative',
            }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${C.violet}, ${C.violetLight})`, color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '0.08em' }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontSize: 13, color: C.textSub, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: C.text, letterSpacing: '-2px' }}>${plan.price}</span>
                <span style={{ color: C.textSub, fontSize: 14 }}>/mo</span>
              </div>
              <div style={{ fontSize: 13, color: C.textSub, marginBottom: 28 }}>{plan.desc}</div>
              <button className="plan-btn" onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                style={{
                  width: '100%', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: loading === plan.id ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", marginBottom: 28, transition: 'all 0.2s',
                  background: plan.highlight ? `linear-gradient(135deg, ${C.violet}, ${C.violetLight})` : 'transparent',
                  border: plan.highlight ? 'none' : `1px solid ${C.border}`,
                  color: plan.highlight ? 'white' : C.textSub,
                  opacity: loading === plan.id ? 0.7 : 1,
                }}>
                {loading === plan.id ? 'Loading...' : plan.cta}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: C.textSub }}>
                    <span style={{ color: C.success, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, color: C.textSub, fontSize: 13 }}>
          All plans include a 30-day money-back guarantee. No questions asked.
        </div>
      </div>
    </div>
  );
}
