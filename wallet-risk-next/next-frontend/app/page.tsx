'use client';
import React, { useState } from 'react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [dark, setDark] = useState(true);

  const checkRisk = async () => {
    if (!address.startsWith('0x') || address.length !== 42) {
      setInputError(true);
      setTimeout(() => setInputError(false), 600);
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/checkrisk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); setResult(null); }
      else setResult(data);
    } catch (err) {
      console.error(err);
      alert('Prediction failed');
    }
    setLoading(false);
  };

  const getTier = (level: string) => {
    const l = level?.toLowerCase() ?? '';
    if (l.includes('low')) return 'low';
    if (l.includes('high')) return 'high';
    return 'med';
  };

  const tier = result ? getTier(result.level) : null;

  const t = {
    low: {
      accent: '#22c55e',
      glow: 'rgba(34,197,94,0.18)',
      glowStrong: 'rgba(34,197,94,0.35)',
      pill: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
      label: 'Low Risk',
      icon: '✓',
      grad: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, transparent 60%)',
    },
    med: {
      accent: '#f59e0b',
      glow: 'rgba(245,158,11,0.18)',
      glowStrong: 'rgba(245,158,11,0.35)',
      pill: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
      label: 'Medium Risk',
      icon: '⚠',
      grad: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, transparent 60%)',
    },
    high: {
      accent: '#ef4444',
      glow: 'rgba(239,68,68,0.18)',
      glowStrong: 'rgba(239,68,68,0.35)',
      pill: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
      label: 'High Risk',
      icon: '✕',
      grad: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, transparent 60%)',
    },
  } as const;

  const d = dark ? {
    bg: '#080810',
    card: '#0f0f1a',
    cardBorder: '#1e1e2e',
    inputBg: '#080810',
    inputBorder: '#1e1e2e',
    text: '#f0f0ff',
    textMuted: '#4a4a6a',
    textDim: '#2a2a3a',
    btnBg: '#f0f0ff',
    btnColor: '#080810',
    reasonBg: '#08080f',
    reasonBorder: '#151525',
    reasonText: '#6060a0',
    toggleBg: '#0f0f1a',
    toggleBorder: '#1e1e2e',
    toggleIcon: '☀',
    footerColor: '#1e1e2e',
    orbA: 'rgba(80,60,200,0.3)',
    orbB: 'rgba(20,100,180,0.25)',
    barTrack: 'rgba(255,255,255,0.07)',
  } : {
    bg: '#f4f4f8',
    card: '#ffffff',
    cardBorder: '#e2e2ec',
    inputBg: '#f8f8fc',
    inputBorder: '#e2e2ec',
    text: '#0f0f1a',
    textMuted: '#9090b0',
    textDim: '#c0c0d8',
    btnBg: '#0f0f1a',
    btnColor: '#f4f4f8',
    reasonBg: '#f8f8fc',
    reasonBorder: '#e2e2ec',
    reasonText: '#7070a0',
    toggleBg: '#ffffff',
    toggleBorder: '#e2e2ec',
    toggleIcon: '☾',
    footerColor: '#d0d0e0',
    orbA: 'rgba(180,160,255,0.25)',
    orbB: 'rgba(100,150,255,0.2)',
    barTrack: 'rgba(0,0,0,0.07)',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .root {
          font-family: 'Syne', sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          transition: background 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.4;
          pointer-events: none;
          transition: background 0.4s;
        }

        .toggle-btn {
          position: fixed;
          top: 1.25rem;
          right: 1.25rem;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid;
          font-size: 17px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 100;
        }
        .toggle-btn:hover { transform: scale(1.1) rotate(20deg); }

        .badge {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .heading {
          font-size: clamp(2.4rem, 6vw, 4.2rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          text-align: center;
          margin-bottom: 0.6rem;
          transition: color 0.3s;
        }

        .subheading {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          text-align: center;
          margin-bottom: 3rem;
          letter-spacing: 0.06em;
          transition: color 0.3s;
        }

        .card {
          width: 100%;
          max-width: 500px;
          border-radius: 24px;
          padding: 2rem;
          border: 1px solid;
          transition: background 0.3s, border-color 0.3s;
          position: relative;
        }

        .input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 14px;
          padding: 4px 4px 4px 16px;
          border: 1px solid;
          transition: border-color 0.25s, background 0.3s;
        }
        .input-wrap:focus-within { border-color: #5050a0 !important; }
        .input-wrap.shake { animation: shake 0.4s ease; border-color: #ef4444 !important; }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        .eth-tag {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .addr-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          padding: 11px 0;
          min-width: 0;
        }
        .addr-input::placeholder { opacity: 0.3; }

        .analyse-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 22px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: opacity 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .analyse-btn:hover { opacity: 0.85; }
        .analyse-btn:active { transform: scale(0.97); }
        .analyse-btn:disabled { opacity: 0.35; cursor: default; transform: none; }

        .dots span { animation: blink 1.2s infinite; }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,80%,100% { opacity: 0.15; } 40% { opacity: 1; } }

        .result-panel {
          margin-top: 1.75rem;
          border-top: 1px solid;
          padding-top: 1.75rem;
          animation: riseIn 0.45s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .result-hero {
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          border: 1px solid;
          position: relative;
          overflow: hidden;
        }

        .result-hero-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .result-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
          border: 1px solid;
          flex-shrink: 0;
        }

        .score-block { text-align: right; }

        .score-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 4px;
          opacity: 0.7;
        }

        .score-value {
          font-size: 3.2rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 1;
        }

        .score-slash {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 400;
          opacity: 0.4;
          margin-left: 2px;
        }

        .level-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid;
          margin-bottom: 1.1rem;
        }

        .level-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.7); }
        }

        .bar-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bar-track {
          flex: 1;
          height: 5px;
          border-radius: 99px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 1s cubic-bezier(0.4,0,0.2,1);
        }
        .bar-pct {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          min-width: 32px;
          text-align: right;
        }

        .reason-card {
          border-radius: 12px;
          padding: 1rem 1.25rem;
          border: 1px solid;
        }
        .reason-header {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .reason-body {
          font-family: 'DM Mono', monospace;
          font-size: 12.5px;
          line-height: 1.7;
        }

        .footer-note {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          text-align: center;
          margin-top: 2.5rem;
          letter-spacing: 0.06em;
        }
      `}</style>

      <main className="root" style={{ background: d.bg }}>
        {/* ambient orbs */}
        <div className="bg-orb" style={{ width: 420, height: 420, top: -120, left: -120, background: d.orbA }} />
        <div className="bg-orb" style={{ width: 320, height: 320, bottom: -80, right: -80, background: d.orbB }} />

        {/* theme toggle */}
        <button
          className="toggle-btn"
          onClick={() => setDark(!dark)}
          style={{ background: d.toggleBg, borderColor: d.toggleBorder, color: d.text }}
          title="Toggle theme"
        >
          {d.toggleIcon}
        </button>

        {/* header */}
        <div className="badge" style={{ color: d.textMuted }}>
          <span style={{ display: 'block', width: 28, height: 1, background: d.textDim }} />
          on-chain intelligence
          <span style={{ display: 'block', width: 28, height: 1, background: d.textDim }} />
        </div>

        <h1 className="heading" style={{ color: d.text }}>
          Wallet<br />Risk Checker
        </h1>
        <p className="subheading" style={{ color: d.textMuted }}>
          Analyse any Ethereum address in seconds.
        </p>

        {/* card */}
        <div className="card" style={{ background: d.card, borderColor: d.cardBorder }}>

          {/* input */}
          <div
            className={`input-wrap${inputError ? ' shake' : ''}`}
            style={{ background: d.inputBg, borderColor: inputError ? '#ef4444' : d.inputBorder }}
          >
            <span className="eth-tag" style={{ color: d.textMuted }}>ETH</span>
            <input
              className="addr-input"
              placeholder="0x..."
              value={address}
              maxLength={42}
              style={{ color: d.text }}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkRisk()}
            />
            <button
              className="analyse-btn"
              onClick={checkRisk}
              disabled={loading}
              style={{ background: d.btnBg, color: d.btnColor }}
            >
              {loading
                ? <span className="dots"><span>·</span><span>·</span><span>·</span></span>
                : 'Analyse'}
            </button>
          </div>

          {/* result */}
          {result && tier && (() => {
            const tc = t[tier];
            return (
              <div className="result-panel" style={{ borderColor: d.cardBorder }}>

                {/* hero */}
                <div
                  className="result-hero"
                  style={{
                    background: tc.grad,
                    borderColor: tc.pill.border,
                    boxShadow: `0 0 48px ${tc.glow}`,
                  }}
                >
                  <div className="result-hero-top">
                    <div
                      className="result-icon"
                      style={{ background: tc.glow, borderColor: tc.pill.border, color: tc.accent }}
                    >
                      {tc.icon}
                    </div>
                    <div className="score-block">
                      <div className="score-label" style={{ color: tc.accent }}>Risk Score</div>
                      <div className="score-value" style={{ color: tc.accent }}>
                        {result.score ?? '—'}
                        <span className="score-slash">/100</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="level-tag"
                    style={{ background: tc.pill.bg, color: tc.accent, borderColor: tc.pill.border }}
                  >
                    <span className="level-dot" style={{ background: tc.accent }} />
                    {tc.label}
                  </div>

                  <div className="bar-row">
                    <div className="bar-track" style={{ background: d.barTrack }}>
                      <div
                        className="bar-fill"
                        style={{
                          width: `${result.score ?? 0}%`,
                          background: `linear-gradient(90deg, ${tc.accent}88, ${tc.accent})`,
                          boxShadow: `0 0 8px ${tc.glowStrong}`,
                        }}
                      />
                    </div>
                    <span className="bar-pct" style={{ color: tc.accent }}>{result.score ?? 0}%</span>
                  </div>
                </div>

                {/* reason */}
                <div
                  className="reason-card"
                  style={{ background: d.reasonBg, borderColor: d.reasonBorder }}
                >
                  <div className="reason-header" style={{ color: d.textMuted }}>Analysis</div>
                  <p className="reason-body" style={{ color: d.reasonText }}>
                    {result.reason ?? 'No analysis available.'}
                  </p>
                </div>

              </div>
            );
          })()}
        </div>

        <p className="footer-note" style={{ color: d.footerColor }}>
          for informational purposes only · not financial advice
        </p>
      </main>
    </>
  );
}