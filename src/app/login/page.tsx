'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { supabase: sb } = await import('@/lib/supabase');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.push('/dashboard');
  };

  const C = { bg: '#060612', surface: '#0d0d1f', border: '#1e1e3a', violet: '#6C63FF', text: '#EDEAE4', textSub: '#7A7690' };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        input:focus { outline: none; border-color: #6C63FF !important; }
        .login-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(108,99,255,0.4); }
      `}}/>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #1A1A2E, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>V</div>
              <span style={{ fontWeight: 700, fontSize: 20, color: C.text }}>Vyra<span style={{ color: C.violet }}>Lens</span></span>
            </div>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: '-0.5px' }}>Welcome back</h1>
          <p style={{ color: C.textSub, fontSize: 15 }}>Sign in to your VyraLens account</p>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '36px 32px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <div style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#E05C5C' }}>{error}</div>}
            <div>
              <label style={{ fontSize: 12, color: C.textSub, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 14px', background: '#060612', border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 15, fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: C.textSub, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                style={{ width: '100%', padding: '12px 14px', background: '#060612', border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 15, fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }} />
            </div>
            <button type="submit" disabled={loading} className="login-btn"
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6C63FF, #9d97ff)', border: 'none', borderRadius: 9, color: 'white', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: C.textSub }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: C.violet, textDecoration: 'none', fontWeight: 500 }}>Start free trial</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
