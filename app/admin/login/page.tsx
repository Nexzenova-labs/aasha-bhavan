'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/admin';
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F3F1EC', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '48px 40px',
        width: '100%', maxWidth: 400, boxShadow: '0 4px 32px rgba(42,40,37,.10)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'linear-gradient(135deg,#7A430A,#E8860A)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: '#fff', margin: '0 auto 14px',
          }}>
            <i className="ti ti-home-heart"></i>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2A2825' }}>Aasha Bhavan</div>
          <div style={{ fontSize: 13, color: '#9C9890', marginTop: 4 }}>Admin Portal</div>
        </div>

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="admin@aashabhavan.org"
            style={{
              width: '100%', padding: '10px 14px', border: '1.5px solid #E5E0D6',
              borderRadius: 8, fontSize: 14, color: '#2A2825', background: '#FAFAF8',
              marginBottom: 16, outline: 'none', boxSizing: 'border-box',
            }}
          />

          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5C5852', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: '100%', padding: '10px 14px', border: '1.5px solid #E5E0D6',
              borderRadius: 8, fontSize: 14, color: '#2A2825', background: '#FAFAF8',
              marginBottom: 24, outline: 'none', boxSizing: 'border-box',
            }}
          />

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 16 }}></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: loading ? '#C8A97A' : 'linear-gradient(135deg,#7A430A,#E8860A)',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }}></i>
                Signing in…
              </>
            ) : (
              <>
                <i className="ti ti-lock-open"></i>
                Sign in
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#9C9890' }}>
          <a href="/" style={{ color: '#E8860A', textDecoration: 'none' }}>
            ← Back to website
          </a>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #E8860A !important; box-shadow: 0 0 0 3px rgba(232,134,10,.12); }
      `}</style>
    </div>
  );
}
