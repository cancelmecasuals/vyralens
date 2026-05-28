'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { supabase: sb } = await import('@/lib/supabase');
    const { error } = await sb.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070707', display: 'flex', fontFamily: "'Satoshi', 'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&f[]=cabinet-grotesk@800,700,500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .inp{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px 18px;color:#fff;font-size:15px;font-family:'Satoshi','DM Sans',sans-serif;outline:none;transition:border-color 0.2s}
        .inp:focus{border-color:rgba(245,166,35,0.5);background:rgba(255,255,255,0.07)}
        .inp::placeholder{color:rgba(255,255,255,0.22)}
        .btn{width:100%;background:#F5A623;color:#080808;border:none;padding:15px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Cabinet Grotesk','DM Sans',sans-serif;transition:all 0.2s;letter-spacing:0.02em}
        .btn:hover{background:#FFB73D;transform:translateY(-1px);box-shadow:0 8px 30px rgba(245,166,35,0.3)}
        .btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none}
        .noise{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
      `}}/>
      <div className="noise" />

      {/* Left panel */}
      <div style={{ flex: 1, background: 'rgba(245,166,35,0.04)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', right: '-10%', width: 400, height: 400, background: 'rgba(245,166,35,0.07)', borderRadius: '50%', filter: 'blur(100px)', animation: 'float 7s ease-in-out infinite' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 48 }}>VYRA<span style={{ color: '#F5A623' }}>.</span></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 28 }}>
            ✦ 30-Day Money-Back Guarantee
          </div>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, color: '#fff' }}>
            One viral post<br />pays for months.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, lineHeight: 1.7, maxWidth: 380, marginBottom: 40 }}>
            Find viral content. Understand why it works. Create your version. Repeat.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontWeight: 700 }}>What you get</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Millions of viral posts indexed daily','AI breakdown of hooks & structure','30-second script generation','TikTok, Instagram, YouTube, Reddit','Cancel anytime, no questions'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                  <span style={{ color: '#F5A623', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>Create your account</h1>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15 }}>Free to start. Upgrade anytime.</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Email</label>
            <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Password</label>
            <input className="inp" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          {error && (
            <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#ff7070' }}>{error}</div>
          )}
          <button className="btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>
          Already have an account?{' '}
          <span style={{ color: '#F5A623', cursor: 'pointer', fontWeight: 700 }} onClick={() => router.push('/login')}>Sign in</span>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          30-day money-back guarantee · Cancel anytime · No setup fees
        </p>
      </div>
    </div>
  );
}
