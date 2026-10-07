'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loginUser } from '@/lib/auth';
import { useTheme } from '@/hooks/useTheme';
import {
  Eye,
  EyeSlash,
  Lock,
  EnvelopeSimple,
  ShieldCheck,
  Moon,
  Sun,
  SignIn,
  Circle,
} from '@phosphor-icons/react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('argielico3@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      router.push('/home');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('Invalid credentials. Check your email and password.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Your email is not confirmed yet.');
      } else if (msg.includes('rate limit') || msg.includes('Too many requests')) {
        setError('Account temporarily locked due to failed attempts. Try again later.');
      } else {
        setError(msg || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Subtle background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(ellipse, rgba(56, 189, 248, 0.08) 0%, rgba(234, 179, 8, 0.04) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── TOP NAV BAR ────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
          zIndex: 10,
          background: 'var(--color-card-bg)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              border: '1.5px solid var(--color-border)',
              background: '#ffffff',
            }}
          >
            <Image
              src="/logo.jpg"
              alt="CTTMO Seal"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--color-text)', textTransform: 'uppercase' }}>
              CTTMO · TPMD
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1.1 }}>
              PerfMon
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Online system badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 99,
              background: 'var(--color-card-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <Circle size={8} weight="fill" color="var(--color-success)" />
            <span>Server Online</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-outline btn-sm"
            style={{ padding: '5px 9px' }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={14} color="#facc15" weight="bold" />
            ) : (
              <Moon size={14} color="#0284c7" weight="bold" />
            )}
          </button>
        </div>
      </header>

      {/* ── CENTER HERO & LOGIN FORM (Compact non-scrollable) ─ */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 20px',
          position: 'relative',
          zIndex: 10,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '390px',
            textAlign: 'center',
          }}
        >
          {/* Official Emblem Seal - Clean minimal border, zero shadows */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '2px solid #ca8a04',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 10,
              background: '#ffffff',
              flexShrink: 0,
            }}
          >
            <Image
              src="/logo.jpg"
              alt="City Transport and Traffic Management Office"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>

          {/* Agency Tagline */}
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#d97706',
              marginBottom: 2,
            }}
          >
            City Transport and Traffic Management Office
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              marginBottom: 6,
            }}
          >
            Transport Planning and Management Division
          </div>

          {/* Wordmark (High contrast, zero text shadow) */}
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginBottom: 4,
              userSelect: 'none',
            }}
          >
            <span style={{ color: '#d97706' }}>
              Perf
            </span>
            <span style={{ color: '#0284c7' }}>
              Mon
            </span>
          </h1>

          <p
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              maxWidth: '350px',
              lineHeight: 1.35,
              marginBottom: 16,
            }}
          >
            Unified Performance Monitoring System
          </p>

          {/* ── AUTH CARD (Flat, zero shadows) ── */}
          <div
            className="card"
            style={{
              width: '100%',
              padding: '18px 22px',
              background: 'var(--color-card-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'none',
              textAlign: 'left',
            }}
          >
            {error && (
              <div
                className="alert alert-error"
                style={{
                  padding: '7px 10px',
                  fontSize: '0.74rem',
                  marginBottom: 12,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: 4 }} htmlFor="email">
                  Official Account Email
                </label>
                <div style={{ position: 'relative' }}>
                  <EnvelopeSimple
                    size={15}
                    color="var(--color-text-muted)"
                    style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: 34, fontSize: '0.82rem', height: 36 }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@cttmo.gov.ph"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: 4 }} htmlFor="password">
                  Security Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={15}
                    color="var(--color-text-muted)"
                    style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: 34, paddingRight: 34, fontSize: '0.82rem', height: 36 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Flat Solid Gold Button - No Gradient, No Shadows */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  border: '1px solid #d97706',
                  background: '#eab308',
                  color: '#070d17',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: 'none',
                  marginTop: 2,
                  transition: 'background-color 0.15s ease',
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <SignIn size={16} weight="bold" />
                    <span>Enter System</span>
                  </>
                )}
              </button>
            </form>

            <div
              style={{
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                fontSize: '0.68rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <ShieldCheck size={13} color="#eab308" weight="bold" />
              <span>Authorized personnel only · TPMD CTTMO</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── FOOTER (Matches Image 2 & 3) ─────────────────────── */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
          flexWrap: 'wrap',
          gap: 8,
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 15,
              height: 15,
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Image src="/logo.jpg" alt="CTTMO" fill style={{ objectFit: 'cover' }} />
          </div>
          <span>© 2026 City Transport and Traffic Management Office · Davao City Government</span>
        </div>
        <span>PerfMon IPCR v2.0 (Pathfinder Edition)</span>
      </footer>
    </div>
  );
}
