'use client';
import { useState, Suspense } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function SignupForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { supabase: sb } = await import('@/lib/supabase');
    const { error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => router.push('/dashboard'), 2000); }
  };

  const C = { bg: '#060612', surface: '#0d0d1f', border: '#1e1e3a', violet: '#6C63FF', text: '#EDEAE4', textSub: '#7A7690', success: '#5BB88A' };

  if (success) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8 }}>You're in!</h2>
        <p style={{ color: C.textSub }}>Redirecting to your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        input:focus { outline: none; border-color: #6C63FF !important; }
        .signup-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(108,99,255,0.4); }
      `}}/>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #1A1A2E, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>V</div>
              <span style={{ fontWeight: 700, fontSize: 20, color: C.text }}>Vyra<span style={{ color: C.violet }}>Lens</span></span>
            </div>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: '-0.5px' }}>Start your free trial</h1>
          <p style={{ color: C.textSub, fontSize: 15 }}>30-day money-back guarantee</p>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '36px 32px' }}>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <div style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#E05C5C' }}>{error}</div>}
            {[
              { label: 'Full Name', type: 'text', val: name, set: setName, ph: 'Your name' },
              { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@example.com' },
              { label: 'Password', type: 'password', val: password, set: setPassword, ph: '8+ characters' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 12, color: C.textSub, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>{f.label}</label>
                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} required placeholder={f.ph}
                  style={{ width: '100%', padding: '12px 14px', background: '#060612', border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 15, fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="signup-btn"
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6C63FF, #9d97ff)', border: 'none', borderRadius: 9, color: 'white', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}>
              {loading ? 'Creating account...' : 'Create Free Account →'}
            </button>
          </form>
          <div style={{ marginTop: 20, padding: '14px', background: 'rgba(108,99,255,0.08)', borderRadius: 8, fontSize: 13, color: C.textSub, textAlign: 'center' }}>
            ✓ 30-day money-back guarantee &nbsp;·&nbsp; ✓ Cancel anytime &nbsp;·&nbsp; ✓ Cancel anytime
          </div>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: C.textSub }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: C.violet, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense fallback={null}><SignupForm /></Suspense>;
}
