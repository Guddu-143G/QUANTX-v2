/**
 * QUANTX - Institutional Loader Animation Component
 * Spec: loader_animation_spec.md sections 1-5
 *
 * Phase 01 - Cryptographic Ingestion & Session Validation  (0-35%)
 * Phase 02 - In-Memory Portfolio Pipeline Bootstrapping    (36-70%)
 * Phase 03 - Model Verification & Multi-Agent Hydration   (71-100%)
 *
 * CSS keyframes required in index.css:
 *   quantx-spin-cw        outer ring clockwise        10s linear infinite
 *   quantx-spin-ccw       inner ring counter-clockwise  4s linear infinite
 *   quantx-beacon-pulse   core emerald beacon           2s ease-in-out infinite
 */

import React, { useState, useEffect, useRef } from 'react';

interface LoaderProps {
  onComplete: () => void;
}

/* Boot sequence log entries - spec section 2 log stream table (16 threshold-keyed entries) */
const BOOT_SEQUENCE = [
  { threshold: 0,   text: '[SYS] Connecting to secure quantitative gateway (ap-south-1)...' },
  { threshold: 8,   text: '[AUTH] Authenticating session token via encrypted HttpOnly credentials...' },
  { threshold: 16,  text: '[AUTH] Validating active sessions against write-once database index...' },
  { threshold: 24,  text: '[SEC] Priming scrypt key generator (N=16384, r=8, p=1)...' },
  { threshold: 32,  text: '[SEC] Session validated. TLS 1.3 Handshake completed successfully.' },
  { threshold: 40,  text: '[DATA] Streaming data contracts: holdings.csv | prices.csv detected.' },
  { threshold: 48,  text: '[DATA] Data quality check: observation window > 60 overlapping dates.' },
  { threshold: 56,  text: '[COMP] No stale feeds or price gaps found. Portfolio integrity score: 98.4%.' },
  { threshold: 64,  text: '[COMP] Initializing Ledoit-Wolf covariance shrinkage engine...' },
  { threshold: 72,  text: '[COMP] Compiling 95% 1-Day Value-at-Risk (VaR) and Expected Shortfall limits...' },
  { threshold: 80,  text: '[MODEL] Decomposing portfolios across 24+ macroeconomic stress scenarios...' },
  { threshold: 86,  text: '[MODEL] Checking bounds: enforcing single-name cap limit (cap <= 12.00%).' },
  { threshold: 92,  text: '[MODEL] Validating convex rebalancer sum constraint (weights sum = 1.000000).' },
  { threshold: 96,  text: '[AI] Structuring AI Copilot RAG chunk context and index vectors...' },
  { threshold: 98,  text: '[AI] Multi-agent graph initialized. Copilot Orchestrator spawned.' },
  { threshold: 100, text: '[SYS] All systems nominal. Launching QUANTX Terminal...' },
] as const;

function getPhaseInfo(pct: number): { label: string; range: string } {
  if (pct <= 35) return { label: 'PHASE 01: Cryptographic Ingestion & Session Validation', range: '0% - 35%' };
  if (pct <= 70) return { label: 'PHASE 02: In-Memory Portfolio Pipeline Bootstrapping', range: '36% - 70%' };
  return { label: 'PHASE 03: Model Verification & Multi-Agent Hydration', range: '71% - 100%' };
}

export const LoaderAnimation: React.FC<LoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFading, setIsFading] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  /* Progress simulation loop: fast 1.6s boot sequence */
  useEffect(() => {
    const duration = 1600;
    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment * (Math.random() * 1.5 + 0.25);
        if (next >= 100) { clearInterval(timer); return 100; }
        return next;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, []);

  /* Boot log matching on integer progress change */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const floor = Math.floor(progress);
    setLogs(
      BOOT_SEQUENCE.filter((s) => floor >= s.threshold).map((s) => {
        const now = new Date();
        const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        return '[' + ts + '] ' + s.text;
      })
    );
  }, [Math.floor(progress)]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Auto-scroll console */
  useEffect(() => {
    if (logContainerRef.current)
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  }, [logs]);

  /* Completion: 1s hold -> 700ms CSS fade -> onComplete() - spec section 5 */
  useEffect(() => {
    if (progress < 100) return;
    const delay = setTimeout(() => {
      setIsFading(true);
      setTimeout(onComplete, 700);
    }, 1000);
    return () => clearTimeout(delay);
  }, [progress, onComplete]);

  const pct = Math.min(100, Math.floor(progress));
  const { label: phaseLabel, range: phaseRange } = getPhaseInfo(pct);

  const gridBg: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right,rgba(255,255,255,0.1) 1px,transparent 1px),' +
      'linear-gradient(to bottom,rgba(255,255,255,0.1) 1px,transparent 1px)',
    backgroundSize: '24px 24px',
    opacity: 0.03,
  };

  return (
    <div
      className={
        'fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#040608] font-mono text-slate-100 select-none transition-opacity duration-700 ease-out ' +
        (isFading ? 'opacity-0 pointer-events-none' : 'opacity-100')
      }
    >
      {/* Matrix grid overlay - 0.03 opacity (spec section 3) */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={gridBg} />
      {/* Radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at center,rgba(61,220,151,0.055) 0%,transparent 65%)' }}
      />

      <div className="relative w-full max-w-xl px-6 flex flex-col items-center">

        {/* SVG Concentric Vector Rings - spec section 3.2 */}
        <div className="relative w-44 h-44 mb-10 flex items-center justify-center">

          {/* Static compass grid */}
          <svg aria-hidden className="absolute w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" strokeDasharray="1 3" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.25" />
            <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.04)" strokeWidth="0.15" />
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="0.15" />
          </svg>

          {/* Outer: Emerald #3DDC97, clockwise 10s */}
          <svg
            aria-hidden
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            style={{ animation: 'quantx-spin-cw 10s linear infinite', transformOrigin: 'center' }}
          >
            <circle cx="50" cy="50" r="38" fill="none" stroke="#3DDC97" strokeOpacity="0.8" strokeWidth="1.25" strokeDasharray="12 8 4 8" />
          </svg>

          {/* Inner: Blue #6EA8FE, counter-clockwise 4s */}
          <svg
            aria-hidden
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            style={{ animation: 'quantx-spin-ccw 4s linear infinite', transformOrigin: 'center' }}
          >
            <circle cx="50" cy="50" r="28" fill="none" stroke="#6EA8FE" strokeOpacity="0.8" strokeWidth="1.75" strokeDasharray="80" strokeDashoffset="40" strokeLinecap="round" />
          </svg>

          {/* Core beacon - pulsing emerald dot */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              width: 20, height: 20, borderRadius: '50%',
              background: '#3DDC97',
              boxShadow: '0 0 18px rgba(61,220,151,0.6),0 0 36px rgba(61,220,151,0.2)',
              animation: 'quantx-beacon-pulse 2s ease-in-out infinite',
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#040608' }} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-white" style={{ letterSpacing: '0.25em' }}>QUANTX</h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase" style={{ letterSpacing: '0.18em' }}>
            Institutional Portfolio Intelligence Platform
          </p>
        </div>

        {/* Phase label */}
        <div className="mb-4 text-[10px] text-center" style={{ color: 'rgba(61,220,151,0.7)', letterSpacing: '0.05em' }}>
          {phaseLabel}&nbsp;&middot;&nbsp;{phaseRange}
        </div>

        {/* Progress bar */}
        <div className="w-full mb-7">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold" style={{ color: '#3DDC97', letterSpacing: '0.1em' }}>BOOTING SYSTEM CORE</span>
            <span className="font-bold tabular-nums" style={{ color: '#6EA8FE' }}>{pct}%</span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden p-[1px]"
            style={{ height: 6, background: 'rgba(15,23,32,0.8)', border: '1px solid rgba(255,255,255,0.03)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-100 ease-out"
              style={{
                width: Math.min(100, progress) + '%',
                background: 'linear-gradient(to right,#3DDC97,#6EA8FE)',
                boxShadow: '0 0 10px rgba(110,168,254,0.45)',
              }}
            />
          </div>
        </div>

        {/* Diagnostic console log panel - spec section 2 */}
        <div
          className="w-full rounded-lg flex flex-col"
          style={{
            height: 144, padding: 16,
            background: 'rgba(8,12,16,0.95)',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
          }}
        >
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto space-y-1.5 text-[11px] pr-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e2d3d transparent' } as React.CSSProperties}
          >
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed flex items-start gap-2">
                <span className="shrink-0 select-none" style={{ color: '#475569' }}>{'>'}</span>
                <span style={{
                  color: idx === logs.length - 1 ? '#3DDC97' : 'rgba(148,163,184,0.9)',
                  fontWeight: idx === logs.length - 1 ? 500 : 400,
                }}>{log}</span>
              </div>
            ))}
          </div>
          <div
            className="flex justify-between items-center text-[9px] pt-2 mt-2"
            style={{ color: '#475569', borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span>REGION: AP-SOUTH-1</span>
            <span>SECURE ENCLAVE ACTIVE</span>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="mt-5 rounded px-3 py-1 text-[11px]"
          style={{ color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#3DDC97';
            e.currentTarget.style.borderColor = 'rgba(61,220,151,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          [ SKIP / ENTER WORKSTATION ]
        </button>
      </div>
    </div>
  );
};

export default LoaderAnimation;
