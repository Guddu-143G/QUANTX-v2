import { useEffect, useState, useRef } from "react";
import { LoaderAnimation } from "../components/ui/LoaderAnimation";
import {
  Activity, ArrowRight, Atom, Boxes, Database, FlaskConical, Gauge, LineChart, Lock,
  Scale, ShieldAlert, Sparkles, Terminal, Zap, X, Play
} from "lucide-react";
import { Logo } from "../components/layout/AppShell";
import { Badge, Button, useReveal } from "../components/ui";
import { AllocationRadial, Sparkline, C } from "../components/charts";
import { ALLOCATION, PERF } from "../data/portfolio";
import { ALPHA_ROWS } from "../data/quant";
import { INDICES, sparkOf } from "../data/market";
import { Link } from "../lib/router";
import { cn } from "../utils/cn";

/* ═══════════════════════ PRELOADER ═══════════════════════
   Replaced by <LoaderAnimation> (loader_animation_spec.md).
   Import: ../components/ui/LoaderAnimation
   Integration: auto-shown on mount per spec §5.
   ═══════════════════════════════════════════════════════ */

/* ═══════════════════════ TELEMETRY LOG TYPE ═══════════════════════ */

type TelemetryLog = {
  timestamp: string;
  source: 'DATA' | 'COMPUTE' | 'MODEL' | 'COMPLIANCE';
  message: string;
  level: 'INFO' | 'SUCCESS' | 'WARN';
};

/* v2 Spec: Code Trace + Math formula per hover section — Section 5.1 */
const HOVER_CODE_TRACE: Record<string, { formula: string; code: string; label: string }> = {
  default: {
    label: 'Executive Dashboard — Performance Ratios',
    formula: 'Sharpe = (Rₐ - Rƒ) / σₐ  |  Sortino = (Rₐ - Rƒ) / σ⁻  |  Calmar = CAGR / |MaxDD|',
    code: `ann_return = ((1 + returns).prod() ** (252/len(returns))) - 1
ann_vol = returns.std() * np.sqrt(252)
sharpe = (ann_return - rf) / ann_vol
sortino = (ann_return - rf) / (returns[returns<0].std() * np.sqrt(252))`,
  },
  market: {
    label: 'Market Intelligence — VPIN & Lee-Ready Classification',
    formula: 'VPIN = |Vᵇ - Vˢ| / V  |  Lee-Ready: BUY if P > mid, SELL if P < mid',
    code: `bucket_vol = 50_000  # shares per bucket
vpin = abs(buy_vol - sell_vol) / bucket_vol
# Rolling 50-bucket VPIN
vpin_series = vpin.rolling(50).mean()`,
  },
  alpha: {
    label: 'Alpha Engine — Information Coefficient & IC-IR',
    formula: 'IC_t = corr(f_t, r_{t+h})  |  IC-IR = μ(IC) / σ(IC)  |  h ∈ {21d, 63d}',
    code: `ic_21 = factor_df.rolling(21).corr(fwd_returns_21)
ic_63 = factor_df.rolling(63).corr(fwd_returns_63)
ic_ir = ic_21.mean() / ic_21.std()
# Ensemble blend with GBM weights
signal = w_mom * mom + w_ml * ml_score + w_qual * quality`,
  },
  opt: {
    label: 'Convex Optimizer — Ledoit-Wolf + OSQP QP',
    formula: 'Σ_shrunk = δF + (1-δ)S  |  min wᵀΣw  s.t. ∑w=1, 0≤w≤w_max',
    code: `w = cp.Variable(n)
risk = cp.quad_form(w, Sigma_shrunk)
constraints = [cp.sum(w) == 1.0, w >= 0, w <= max_position_weight]
prob = cp.Problem(cp.Minimize(risk), constraints)
prob.solve(solver=cp.OSQP)`,
  },
  risk: {
    label: 'Tail-Risk Engine — CVaR & Monte Carlo',
    formula: 'CVaR₀.₉₅ = ᴔ[-r | -r ≥ VaR₀.₉₅]  |  L-VaR = VaR + λ·σ·√T',
    code: `sim_returns = np.random.multivariate_normal(mean_ret, cov_matrix, size=12480)
portfolio_sim = np.dot(sim_returns, weights)
var_95 = -np.percentile(portfolio_sim, 5.0)
cvar_95 = -portfolio_sim[portfolio_sim <= -var_95].mean()`,
  },
  bt: {
    label: 'Event-Driven Backtesting — Almgren-Chriss TC',
    formula: 'TC = η·v² + γ·v  |  Slippage = σ√(T/ADV)·β·sign(x)',
    code: `# Almgren-Chriss permanent + temporary impact
permanent = eta * (v / adv) ** gamma
temporary = sigma * np.sqrt(T / adv) * beta * np.sign(x)
total_cost_bps = (permanent + temporary) * 1e4`,
  },
  ai: {
    label: 'AI Copilot — RAG Cosine Similarity & Multi-Head Attention',
    formula: 'sim(q,k) = (q·k) / (|q|·|k|)  |  Attention(Q,K,V) = softmax(QKᵀ/√d)V',
    code: `SELECT context_snippet, similarity
FROM quantx_rag_embeddings
WHERE tenant_id = :tenant_id
ORDER BY embedding <=> :query_vector LIMIT 5;`,
  },
  arch: {
    label: 'Architecture — Layered Service-Oriented Estate',
    formula: 'Latency: 18ms ingest | 34ms inference | 1.8s QP solve | <100μs PTP drift',
    code: `# Ray distributed task graph
@ray.remote
def factor_worker(data_shard): ...
futures = [factor_worker.remote(s) for s in shards]
results = ray.get(futures)`,
  },
};

const SECTIONS = [
  { n: "02", k: "market", icon: LineChart, title: "Market Intelligence", lead: "Consolidated tape, breadth and rotation.",
    body: "Direct NSE and BSE feeds plus global L1 are normalised into a single point-in-time store. Sector rotation, breadth and microstructure are computed continuously so research never waits on a nightly batch.",
    stats: [["Instruments covered", "4,218"], ["Tick latency", "18ms"], ["Feed uptime", "99.98%"]] },
  { n: "03", k: "alpha", icon: FlaskConical, title: "Alpha Engine", lead: "Nine factor families. One composite.",
    body: "Momentum, value, quality, volatility, liquidity, sentiment, macro, technical and alternative data are estimated cross-sectionally, decay-monitored, and blended with a gradient-boosted ensemble under explicit crowding controls.",
    stats: [["Engineered features", "142"], ["Composite Sharpe", "1.82"], ["Rolling IC", "0.058"]] },
  { n: "04", k: "opt", icon: Scale, title: "Portfolio Optimization", lead: "Constrained, cost-aware, explainable.",
    body: "A quadratic solver over a Ledoit-Wolf shrunk covariance handles single-name caps, sector caps, beta targeting, turnover penalties and cash floors — then shows exactly which constraint bound the solution.",
    stats: [["Solve time", "1.8s"], ["Active constraints", "6"], ["Turnover cap", "20%"]] },
  { n: "05", k: "risk", icon: ShieldAlert, title: "Institutional Risk", lead: "VaR, CVaR, factor and scenario risk.",
    body: "A multivariate GARCH-DCC engine decomposes variance across market, sector, factor, idiosyncratic and currency sources, with continuous limit surveillance and automatic escalation on breach.",
    stats: [["Historical window", "500d"], ["Monte Carlo paths", "12,480"], ["Scenarios", "24"]] },
  { n: "06", k: "bt", icon: Atom, title: "Event-Driven Backtesting", lead: "Point-in-time. No survivorship bias.",
    body: "Simulations replay the tape event by event with realistic transaction costs, market-impact slippage, corporate actions and delisted names — producing tearsheets a risk committee will accept.",
    stats: [["Rebalance dates", "1,842"], ["All-in cost", "18bps"], ["Runtime", "8.4s"]] },
  { n: "07", k: "ai", icon: Sparkles, title: "AI Quant Copilot", lead: "Grounded research, not chat.",
    body: "Every answer is retrieved from live portfolio state, the risk engine and the factor library — returned as structured research notes with drivers, metrics, tables, data lineage and one-click actions.",
    stats: [["Context window", "128K"], ["Median latency", "620ms"], ["Tool integrations", "8"]] },
];

export default function Landing() {
  const ref = useReveal<HTMLDivElement>();
  const [scrolled, setScrolled] = useState(false);
  /* Auto-start preloader on first visit per session */
  const [showPreloader, setShowPreloader] = useState(() => {
    try {
      return !sessionStorage.getItem("quantx_preloader_seen");
    } catch {
      return false;
    }
  });
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [activeHoverSection, setActiveHoverSection] = useState<string>("default");

  const handlePreloaderComplete = () => {
    try {
      sessionStorage.setItem("quantx_preloader_seen", "true");
    } catch {}
    setShowPreloader(false);
  };

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div ref={ref} className="min-h-screen overflow-x-hidden bg-[#040608]">
      {/* ── LOADER ANIMATION (loader_animation_spec.md §5 integration) ── */}
      {showPreloader && (
        <LoaderAnimation onComplete={handlePreloaderComplete} />
      )}

      {/* ── LIVE TELEMETRY HUD DRAWER ── */}
      <LandingTelemetryHUD 
        isOpen={telemetryOpen} 
        onClose={() => setTelemetryOpen(false)} 
        activeSection={activeHoverSection}
        onTriggerPreloader={() => setShowPreloader(true)}
      />

      {/* ── NAV ── */}
      <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled && "border-b border-line-subtle bg-[#040608]/90 backdrop-blur-xl")}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {[["Platform", "market"], ["Alpha", "alpha"], ["Risk", "risk"], ["Architecture", "arch"], ["Performance", "perf"]].map(([l, id]) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  const el = document.getElementById(id);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="cursor-pointer text-[12px] text-txt-secondary transition-colors hover:text-txt-primary"
              >
                {l}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTelemetryOpen(!telemetryOpen)}
              className={cn(
                "flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[11px] font-medium transition-all",
                telemetryOpen 
                  ? "border-acc bg-acc/10 text-acc shadow-[0_0_12px_rgba(61,220,151,0.2)]" 
                  : "border-line-strong bg-surface/80 text-txt-secondary hover:border-acc/40 hover:text-txt-primary"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-acc anim-pulse-dot" />
              <span>Telemetry HUD</span>
            </button>
            <Link to="/signin" className="hidden sm:block">
              <Button size="sm" variant="ghost">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" variant="primary">Enter QUANTX</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── 01 HERO ── */}
      <section className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 radial-veil" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grid-texture" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-acc/25 to-transparent" aria-hidden />

        <div className="relative mx-auto max-w-[1400px] px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="reveal flex flex-wrap items-center gap-2">
                <Badge tone="pos" dot>LIVE RESEARCH ENGINE</Badge>
                <Badge tone="acc">v20 NIGHTWATCH ENGINE</Badge>
                <Badge tone="neu">v4.2 · ap-south-1</Badge>
                <button 
                  onClick={() => setShowPreloader(true)}
                  className="mono flex items-center gap-1 rounded-[4px] border border-line-strong bg-surface/40 px-2 py-0.5 text-[10px] text-txt-muted transition-colors hover:border-acc/40 hover:text-acc"
                >
                  <Play size={9} /> Replay Synthesizer
                </button>
              </div>

              <h1 className="reveal mt-6 text-[38px] font-semibold leading-[1.02] tracking-[-0.035em] text-txt-primary sm:text-[52px] lg:text-[60px]" style={{ transitionDelay: "60ms" }}>
                QUANTITATIVE<br />
                INTELLIGENCE FOR<br />
                <span className="bg-gradient-to-r from-acc via-acc to-acc2 bg-clip-text text-transparent">MODERN CAPITAL.</span>
              </h1>

              <div className="reveal mt-7 grid max-w-[440px] grid-cols-2 gap-x-6 gap-y-2.5" style={{ transitionDelay: "120ms" }}>
                {["Research alpha.", "Optimize portfolios.", "Control risk.", "Simulate execution."].map((s) => (
                  <p key={s} className="flex items-center gap-2 text-[13px] text-txt-secondary">
                    <span className="h-px w-3 bg-acc/60" />{s}
                  </p>
                ))}
              </div>

              <p className="reveal mt-6 max-w-[52ch] text-[13.5px] leading-relaxed text-txt-muted" style={{ transitionDelay: "160ms" }}>
                An institutional research workstation for hedge funds, quantitative asset managers and proprietary desks — combining factor research, portfolio construction, risk surveillance and grounded AI in one terminal.
              </p>

              <div className="reveal mt-8 flex flex-wrap items-center gap-2.5" style={{ transitionDelay: "200ms" }}>
                <Link to="/signup"><Button size="lg" variant="primary" icon={ArrowRight}>ENTER QUANTX</Button></Link>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("market")?.scrollIntoView({ behavior: "smooth" })}>EXPLORE PLATFORM</Button>
              </div>

              <div className="reveal mt-9 grid max-w-[520px] grid-cols-3 gap-4 border-t border-line-subtle pt-5" style={{ transitionDelay: "240ms" }}>
                {[["₹10.42 Cr", "AUM simulated"], ["1.82", "Composite Sharpe"], ["142", "Live features"]].map(([v, k]) => (
                  <div key={k}>
                    <div className="tnum text-[20px] font-semibold leading-none tracking-[-0.02em] text-txt-primary">{v}</div>
                    <div className="mt-1.5 label-xs text-txt-disabled">{k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual = real UI */}
            <div className="reveal lg:col-span-6" style={{ transitionDelay: "140ms" }}>
              <HeroTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ── ticker strip ── */}
      <div className="relative border-y border-line-subtle bg-[#080c12]/80">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-none" style={{ animation: "qx-ticker 42s linear infinite", display: "flex" }}>
            {[...INDICES, ...INDICES, ...INDICES, ...INDICES].map((i, k) => (
              <span key={k} className="flex shrink-0 items-center gap-2.5 border-r border-line-subtle px-5 py-2.5">
                <span className="label-xs text-txt-disabled">{i.name}</span>
                <span className="mono text-[11.5px] text-txt-secondary">{i.value.toLocaleString("en-IN")}</span>
                <span className={cn("mono text-[10.5px]", i.chgPct >= 0 ? "text-pos" : "text-neg")}>{i.chgPct >= 0 ? "↑" : "↓"}{Math.abs(i.chgPct).toFixed(2)}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 02–07 alternating sections ── */}
      {SECTIONS.map((s, i) => (
        <section 
          key={s.k} 
          id={s.k} 
          onMouseEnter={() => setActiveHoverSection(s.k)}
          className={cn("relative py-16 lg:py-24 transition-colors", i % 2 === 1 && "bg-[#080d14]/40")}
        >
          {i % 2 === 1 && <div className="pointer-events-none absolute inset-0 grid-texture-fine opacity-60" aria-hidden />}
          <div className="relative mx-auto max-w-[1400px] px-5 lg:px-8">
            <div className={cn("grid items-center gap-10 lg:grid-cols-12 lg:gap-14", i % 2 === 1 && "lg:[direction:rtl]")}>
              <div className={cn("lg:col-span-5", i % 2 === 1 && "lg:[direction:ltr]")}>
                <div className="reveal flex items-center gap-3">
                  <span className="mono text-[11px] text-txt-disabled">{s.n}</span>
                  <span className="h-px w-8 bg-line-strong" />
                  <s.icon size={14} className="text-acc" strokeWidth={1.6} />
                </div>
                <h2 className="reveal mt-4 text-[27px] font-semibold leading-tight tracking-[-0.025em] text-txt-primary lg:text-[32px]" style={{ transitionDelay: "60ms" }}>{s.title}</h2>
                <p className="reveal mt-2 text-[14px] text-acc/90" style={{ transitionDelay: "80ms" }}>{s.lead}</p>
                <p className="reveal mt-4 max-w-[54ch] text-[13px] leading-relaxed text-txt-muted" style={{ transitionDelay: "120ms" }}>{s.body}</p>
                <dl className="reveal mt-7 grid grid-cols-3 gap-4 border-t border-line-subtle pt-5" style={{ transitionDelay: "160ms" }}>
                  {s.stats.map(([k, v]) => (
                    <div key={k}>
                      <dd className="tnum text-[17px] font-semibold leading-none text-txt-primary">{v}</dd>
                      <dt className="mt-1.5 label-xs text-txt-disabled">{k}</dt>
                    </div>
                  ))}
                </dl>
              </div>
              <div className={cn("reveal lg:col-span-7", i % 2 === 1 && "lg:[direction:ltr]")} style={{ transitionDelay: "100ms" }}>
                <SectionVisual kind={s.k} onHoverAction={(msg) => setActiveHoverSection(`${s.k}:${msg}`)} />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── 08 ARCHITECTURE ── */}
      <section id="arch" onMouseEnter={() => setActiveHoverSection("arch")} className="relative py-16 lg:py-24">
        <div className="relative mx-auto max-w-[1400px] px-5 lg:px-8">
          <div className="reveal max-w-[640px]">
            <div className="flex items-center gap-3">
              <span className="mono text-[11px] text-txt-disabled">08</span>
              <span className="h-px w-8 bg-line-strong" />
              <Boxes size={14} className="text-acc" strokeWidth={1.6} />
            </div>
            <h2 className="mt-4 text-[27px] font-semibold leading-tight tracking-[-0.025em] text-txt-primary lg:text-[32px]">Architecture</h2>
            <p className="mt-4 text-[13px] leading-relaxed text-txt-muted">
              A layered, service-oriented estate. Every surface in the product reads from the same versioned services, so research, risk and execution can never disagree about the state of the book.
            </p>
          </div>

          <div className="mt-10 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: Database, t: "Data Layer", d: "Point-in-time lakehouse, direct venue feeds, vendor fundamentals, NLP corpus and alternative data with contract validation.", items: ["Delta lakehouse", "Kafka ingestion", "Great-Expectations contracts"] },
              { icon: Gauge, t: "Compute Layer", d: "Vectorised factor estimation, GARCH-DCC risk, QP optimisation and event-driven simulation on autoscaling compute.", items: ["Ray cluster", "OSQP solver", "Numba kernels"] },
              { icon: Boxes, t: "Model Layer", d: "Versioned registry with shadow deployment, drift surveillance, purged cross-validation and automated rollback.", items: ["MLflow registry", "PSI drift monitor", "Champion / challenger"] },
              { icon: Terminal, t: "Experience Layer", d: "A single React design system with semantic tokens, dense data tables and one coherent chart language.", items: ["Design tokens", "Command palette", "WCAG-aware contrast"] },
            ].map((c, i) => (
              <div key={c.t} className="reveal group rounded-[8px] border border-line-subtle bg-surface/50 p-4 transition-colors hover:border-line hover:bg-surface-high/60" style={{ transitionDelay: `${i * 60}ms` }}>
                <c.icon size={16} className="text-acc" strokeWidth={1.5} />
                <h3 className="mt-3 text-[13.5px] font-semibold text-txt-primary">{c.t}</h3>
                <p className="mt-2 text-[11.5px] leading-relaxed text-txt-muted">{c.d}</p>
                <ul className="mt-3 space-y-1 border-t border-line-subtle pt-2.5">
                  {c.items.map((it) => (
                    <li key={it} className="mono flex items-center gap-1.5 text-[10px] text-txt-disabled">
                      <span className="h-px w-2 bg-line-strong" />{it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="reveal mt-3 grid gap-2.5 md:grid-cols-3">
            {[
              { icon: Lock, t: "Security", d: "SOC 2 aligned controls, hardware MFA, entitlement-scoped market data and full audit lineage on every order." },
              { icon: Activity, t: "Reliability", d: "99.87% composite uptime, colo-hosted OMS, error-budget-driven release policy and blue/green model deploys." },
              { icon: Zap, t: "Performance", d: "18ms tick ingestion, 34ms mean inference, 1.8s constrained optimisation, 8.4s full-history simulation." },
            ].map((c) => (
              <div key={c.t} className="flex gap-3 rounded-[8px] border border-line-subtle bg-[#080d14]/40 p-4">
                <c.icon size={15} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <h3 className="text-[12.5px] font-semibold text-txt-primary">{c.t}</h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-txt-muted">{c.d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── MASTER ARCHITECTURAL ROADMAP (v10 → v16) ── */}
          <div className="reveal mt-10 rounded-[10px] border border-line bg-surface/40 p-5 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-acc" />
                  <h3 className="text-[16px] font-semibold text-txt-primary">Institutional Master Architectural Matrix (v10 → v17)</h3>
                  <Badge tone="pos">v17 SOVEREIGN ACTIVE</Badge>
                </div>
                <p className="mt-1 text-[12px] text-txt-muted">
                  Sovereign institutional breakthroughs: Conformal Prediction, Continuous-Time Mean-Field Games, Contrastive Time-Series Learning, Hybrid Quantum QAOA &amp; zk-STARKs
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neu">125 Active API Endpoints</Badge>
                <Badge tone="acc">Post-Quantum zk-STARKs &amp; QAOA Verified</Badge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {/* v17 Pillar */}
              <div className="rounded-[8px] border border-acc/50 bg-acc/10 p-3.5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] font-bold text-acc">VERSION 17 (Master Sovereign)</span>
                  <Badge tone="pos">LATEST ACTIVE</Badge>
                </div>
                <ul className="space-y-1.5 text-[11px] text-txt-secondary">
                  <li className="flex items-start gap-1.5">
                    <span className="mono text-acc font-bold">1.</span>
                    <span><strong>Conformal Prediction Risk Intervals:</strong> Distribution-free, finite-sample valid VaR &amp; CVaR bounds with 1−α coverage.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mono text-acc font-bold">2.</span>
                    <span><strong>Continuous-Time Mean-Field Games (MFG):</strong> Coupled HJB-FPK continuous PDEs for high-frequency liquidity crowding &amp; cascade risk.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mono text-acc font-bold">3.</span>
                    <span><strong>Contrastive Representation Learning:</strong> InfoNCE self-supervised hypersphere embeddings for regime shift &amp; spoofing anomaly alerts.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mono text-acc font-bold">4.</span>
                    <span><strong>Hybrid Quantum QAOA &amp; QUBO Solver:</strong> Ising Spin Hamiltonians for discrete lot-size, cardinality-constrained portfolio rebalancing.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mono text-acc font-bold">5.</span>
                    <span><strong>zk-STARKs Audited Regulatory Filings:</strong> Transparent, post-quantum FRI execution traces for UCITS 5/10/40 &amp; SEC Form PF compliance.</span>
                  </li>
                </ul>
              </div>

              {/* v16 Pillar */}
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] font-bold text-txt-primary">VERSION 16 (Continuous SDE)</span>
                  <Badge tone="neu">DEPLOYED</Badge>
                </div>
                <ul className="space-y-1.5 text-[11px] text-txt-muted">
                  <li><strong>Transformer-SDE World Model:</strong> Continuous Neural-SDE Euler-Maruyama counterfactual stress testing.</li>
                  <li><strong>Neuromorphic SNN (Loihi 2):</strong> LIF spike processing on L3 ITCH ticks (~412 ns latency, ~0.42 pJ/spike).</li>
                  <li><strong>Topological Crash Early Warning (TDA):</strong> Persistent Homology &amp; Betti numbers (β₀, β₁) on correlation distance.</li>
                  <li><strong>zk-RWA Collateral Vaults:</strong> Pedersen commitments &amp; Groth16 zk-SNARK solvency proofs on BN254.</li>
                  <li><strong>Stackelberg Differential Game:</strong> Closed-form leader-follower execution solver vs predatory HFT tracking.</li>
                </ul>
              </div>

              {/* v15 Pillar */}
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] font-bold text-txt-primary">VERSION 15 (Foundation)</span>
                  <Badge tone="neu">DEPLOYED</Badge>
                </div>
                <ul className="space-y-1.5 text-[11px] text-txt-muted">
                  <li><strong>Multi-Task Diffusion Alpha:</strong> Score-based forward reverse denoising for volatility.</li>
                  <li><strong>Score-Based SDE Generative Stress:</strong> 500-path stochastic macro diffusion fan charts.</li>
                  <li><strong>zk-MPC Multi-Desk Aggregator:</strong> Shamir secret sharing over GF(p) with Lagrange reconstruction.</li>
                  <li><strong>PPO Anti-Predatory Router:</strong> Reinforced dynamic venue allocation vs toxic flow.</li>
                  <li><strong>Automated Regulatory Engine:</strong> SEC Form PF, MiFID II RTS 28 &amp; Basel III filings.</li>
                </ul>
              </div>

              {/* v14 Pillar */}
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] font-bold text-txt-primary">VERSION 14 (Quantum &amp; ZK)</span>
                  <Badge tone="neu">DEPLOYED</Badge>
                </div>
                <ul className="space-y-1.5 text-[11px] text-txt-muted">
                  <li><strong>Quantum VQE Covariance:</strong> 4-Qubit RealAmplitudes parametric ground-state solver.</li>
                  <li><strong>Basel IV Liquidity Cockpit:</strong> LCR &amp; NSFR multi-tier statutory liquidity tracking.</li>
                  <li><strong>MADDPG Execution Router:</strong> Centralized critic multi-agent coordinated splits.</li>
                  <li><strong>zk-SNARK Collateral Vault:</strong> ISDA SIMM v2.6 margin proof verification.</li>
                </ul>
              </div>

              {/* v13 Pillar */}
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] font-bold text-txt-primary">VERSION 13 (Graph Contagion)</span>
                  <Badge tone="neu">DEPLOYED</Badge>
                </div>
                <ul className="space-y-1.5 text-[11px] text-txt-muted">
                  <li><strong>Heterogeneous R-GCN Contagion:</strong> Multi-hop message passing across 6 relation kernels.</li>
                  <li><strong>MPC ZK Dark Pool:</strong> Yao&apos;s garbled circuits &amp; Shamir (3,5) polynomial matching.</li>
                  <li><strong>Atomic DvP Settlement:</strong> Dual-deposit smart escrow with sub-second finality.</li>
                </ul>
              </div>

              {/* v12 Pillar */}
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] font-bold text-txt-primary">VERSION 12 (PQC &amp; Microstructure)</span>
                  <Badge tone="neu">DEPLOYED</Badge>
                </div>
                <ul className="space-y-1.5 text-[11px] text-txt-muted">
                  <li><strong>Diffusion L3 Order Book:</strong> Langevin score-based LOB flash crash modeling.</li>
                  <li><strong>ISDA SIMM Cross-Margining LP:</strong> Primal-dual carry cost optimization.</li>
                  <li><strong>NIST Post-Quantum Cryptography:</strong> FIPS 203 (ML-KEM) &amp; FIPS 204 (ML-DSA-87).</li>
                </ul>
              </div>

              {/* v10 - v11 Pillar */}
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] font-bold text-txt-primary">VERSIONS 10 &amp; 11 (Foundational Quant)</span>
                  <Badge tone="neu">DEPLOYED</Badge>
                </div>
                <ul className="space-y-1.5 text-[11px] text-txt-muted">
                  <li><strong>Avellaneda-Stoikov MM:</strong> Optimal inventory reservation spreads.</li>
                  <li><strong>SVAR Causal Shocks:</strong> Structural vector autoregressive impulse response.</li>
                  <li><strong>EU SFDR Climate Stress:</strong> NGFS carbon tax &amp; physical/transition impairment.</li>
                  <li><strong>Self-Healing RL Guardrail:</strong> Real-time VPIN toxicity mitigation.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 09 PERFORMANCE ── */}
      <section id="perf" onMouseEnter={() => setActiveHoverSection("perf")} className="relative border-y border-line-subtle bg-[#080d14]/40 py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 grid-texture-fine opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-5 lg:px-8">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-[560px]">
              <div className="flex items-center gap-3">
                <span className="mono text-[11px] text-txt-disabled">09</span>
                <span className="h-px w-8 bg-line-strong" />
                <Gauge size={14} className="text-acc" strokeWidth={1.6} />
              </div>
              <h2 className="mt-4 text-[27px] font-semibold leading-tight tracking-[-0.025em] text-txt-primary lg:text-[32px]">Performance</h2>
              <p className="mt-3 text-[13px] leading-relaxed text-txt-muted">
                Simulated composite results, out-of-sample, net of an 18bps all-in cost assumption. Presented for demonstration only.
              </p>
            </div>
            <Badge tone="gold">SIMULATED — NOT A TRACK RECORD</Badge>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            {[
              ["CAGR", "21.4%", "vs 12.8% bench"], ["Sharpe", "1.82", "Rf 6.8%"], ["Sortino", "2.41", "downside σ 6.2%"],
              ["Max Drawdown", "−8.43%", "recovered in 22d"], ["Win Rate", "58.4%", "542 trades"], ["Information Ratio", "1.21", "vs NIFTY 50"],
            ].map(([k, v, s], i) => (
              <div key={k} className="reveal rounded-[8px] border border-line-subtle bg-surface/60 px-3.5 py-3" style={{ transitionDelay: `${i * 50}ms` }}>
                <div className="label-xs text-txt-muted">{k}</div>
                <div className={cn("tnum mt-1.5 text-[22px] font-semibold leading-none tracking-[-0.02em]", String(v).startsWith("−") ? "text-neg" : "text-txt-primary")}>{v}</div>
                <div className="mt-2 text-[10px] text-txt-disabled">{s}</div>
              </div>
            ))}
          </div>

          <div className="reveal mt-3 overflow-hidden rounded-[8px] border border-line-subtle bg-surface/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="label-sm text-txt-secondary">Composite equity curve — indexed</span>
              <span className="mono text-[10.5px] text-txt-muted">Apr 2019 → Aug 2026</span>
            </div>
            <Sparkline data={PERF.map((p) => p.portfolio)} width={1300} height={110} tone="pos" strokeWidth={1.1} fluid />
          </div>
        </div>
      </section>

      {/* ── 10 CTA ── */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 radial-veil" aria-hidden />
        <div className="relative mx-auto max-w-[820px] px-5 text-center">
          <div className="reveal">
            <Badge tone="pos" dot>PAPER ENVIRONMENT · NO CAPITAL AT RISK</Badge>
            <h2 className="mt-6 text-[30px] font-semibold leading-[1.06] tracking-[-0.03em] text-txt-primary sm:text-[42px]">
              Enter the quantitative<br />research command center.
            </h2>
            <p className="mx-auto mt-5 max-w-[54ch] text-[13.5px] leading-relaxed text-txt-muted">
              Explore the full workstation — dashboard, alpha lab, optimizer, risk center, backtesting studio, model registry and the grounded AI copilot.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              <Link to="/dashboard"><Button size="lg" variant="primary" icon={ArrowRight}>ENTER QUANTX</Button></Link>
              <Link to="/copilot"><Button size="lg" variant="outline" icon={Sparkles}>MEET THE COPILOT</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-line-subtle bg-[#080d14]/70">
        <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <Logo />
              <p className="mt-4 max-w-[38ch] text-[11.5px] leading-relaxed text-txt-muted">
                Quantitative Intelligence for Modern Capital. Research. Optimize. Manage Risk.
              </p>
              <p className="mt-4 text-[10.5px] leading-relaxed text-txt-disabled">
                All data shown is synthetic and generated for demonstration purposes. Nothing on this site is investment advice or an offer of any financial product.
              </p>
            </div>
            {[
              { t: "Platform", l: [["Overview", "/dashboard"], ["Markets", "/markets"], ["Alpha Lab", "/research/alpha"], ["Optimizer", "/portfolio/optimizer"]] },
              { t: "Risk & Ops", l: [["Risk Center", "/risk"], ["Backtesting", "/backtest"], ["Models", "/models"], ["Data Quality", "/data"]] },
              { t: "System", l: [["AI Copilot", "/copilot"], ["Alerts", "/alerts"], ["Monitoring", "/monitoring"], ["Settings", "/settings"]] },
            ].map((g) => (
              <div key={g.t}>
                <h3 className="label-xs text-txt-disabled">{g.t}</h3>
                <ul className="mt-3 space-y-2">
                  {g.l.map(([l, to]) => (
                    <li key={l}>
                      <Link to={to} className="text-[11.5px] text-txt-secondary transition-colors hover:text-acc">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-5">
            <p className="text-[10.5px] text-txt-disabled">© 2026 QUANTX. Simulated demonstration environment.</p>
            <p className="mono text-[10px] text-txt-disabled">build quantx-web 4.2.0 · ap-south-1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════ LANDING TELEMETRY HUD (v2) ═══════════════════════ */

function LandingTelemetryHUD({
  isOpen,
  onClose,
  activeSection,
  onTriggerPreloader
}: {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onTriggerPreloader: () => void;
}) {
  const [logs, setLogs] = useState<TelemetryLog[]>([
    { timestamp: '16:05:00.001', source: 'DATA', message: 'Apache Kafka tick streaming connected. Pool: NIFTY 50 Equities.', level: 'INFO' },
    { timestamp: '16:05:00.012', source: 'COMPUTE', message: 'Ray distributed cluster verified. 3 compute worker nodes active.', level: 'SUCCESS' },
    { timestamp: '16:05:00.045', source: 'COMPLIANCE', message: 'scrypt session token isolation verified. In-memory enclave locked.', level: 'SUCCESS' }
  ]);
  const logRef = useRef<HTMLDivElement>(null);

  /* Derive which HOVER_CODE_TRACE entry to show */
  const traceKey = ((): keyof typeof HOVER_CODE_TRACE => {
    for (const k of Object.keys(HOVER_CODE_TRACE)) {
      if (k !== 'default' && activeSection.startsWith(k)) return k as keyof typeof HOVER_CODE_TRACE;
    }
    return 'default';
  })();
  const trace = HOVER_CODE_TRACE[traceKey];

  useEffect(() => {
    const timestamp = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 899 + 100);
    let sectionLogs: TelemetryLog[] = [];

    if (activeSection.startsWith("alpha")) {
      sectionLogs = [
        { timestamp, source: 'MODEL', message: 'Recalculating rolling Information Coefficients (IC) over 5d, 21d, and 63d.', level: 'INFO' },
        { timestamp, source: 'COMPUTE', message: 'Ensemble gradient-boosted regression updated (Numba optimized inference: 34ms).', level: 'SUCCESS' }
      ];
    } else if (activeSection.startsWith("opt")) {
      sectionLogs = [
        { timestamp, source: 'COMPUTE', message: 'Formulating OSQP convex quadratic problem over 50x50 Ledoit-Wolf matrix.', level: 'INFO' },
        { timestamp, source: 'COMPLIANCE', message: 'Constraint check: Single-name cap (12%) & Sector cap (30%) satisfied.', level: 'SUCCESS' }
      ];
    } else if (activeSection.startsWith("risk")) {
      sectionLogs = [
        { timestamp, source: 'COMPUTE', message: 'Dispatched 12,480 Monte Carlo paths to Ray task workers across 3 nodes.', level: 'INFO' },
        { timestamp, source: 'MODEL', message: 'GARCH-DCC variance decomposed: Style (38.4%), Sector (24.1%), Idiosyncratic (12.2%).', level: 'SUCCESS' }
      ];
    } else if (activeSection.startsWith("bt")) {
      sectionLogs = [
        { timestamp, source: 'DATA', message: 'Point-in-time order book replayed without survivorship bias.', level: 'INFO' },
        { timestamp, source: 'COMPUTE', message: 'Simulated 1,842 rebalance events under Almgren-Chriss transaction cost impact.', level: 'SUCCESS' }
      ];
    } else if (activeSection.startsWith("ai")) {
      sectionLogs = [
        { timestamp, source: 'MODEL', message: 'AI Quant Copilot retrieved live portfolio state & risk matrix.', level: 'INFO' },
        { timestamp, source: 'COMPUTE', message: 'Generated structured research memo with quantified factor drivers (620ms).', level: 'SUCCESS' }
      ];
    } else if (activeSection.startsWith("market")) {
      sectionLogs = [
        { timestamp, source: 'DATA', message: 'Ingesting consolidated NSE/BSE tick feeds (4,218 instruments mapped).', level: 'INFO' }
      ];
    }

    if (sectionLogs.length > 0) {
      setLogs((prev) => [...prev, ...sectionLogs].slice(-40));
    }
  }, [activeSection]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 z-40 w-full max-w-md hud-panel p-0 shadow-2xl flex flex-col font-mono text-xs animate-in slide-in-from-right duration-300 overflow-hidden">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-pos anim-pulse-dot" />
          <span className="font-bold text-txt-primary tracking-wider">QUANTX TELEMETRY HUD</span>
          <span className="label-xs text-txt-disabled">[ MODE: LIVE DEMO ]</span>
        </div>
        <button onClick={onClose} className="rounded p-1 text-txt-muted hover:bg-surface hover:text-txt-primary">
          <X size={15} />
        </button>
      </div>

      {/* System Metrics Strip */}
      <div className="border-b border-line-subtle px-4 py-2">
        <div className="grid grid-cols-4 gap-2 text-[9.5px]">
          {[
            { k: 'Ingestion', v: '18ms', c: 'text-acc' },
            { k: 'Inference', v: '34ms', c: 'text-acc2' },
            { k: 'Optimizer', v: '1.8s', c: 'text-gold' },
            { k: 'Drift', v: '<100μs', c: 'text-pos' },
          ].map(({ k, v, c }) => (
            <div key={k} className="text-center">
              <div className="text-txt-disabled">{k}</div>
              <div className={cn('font-bold tnum', c)}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Split Panel: Code Trace (left) + Live Log (right) ── (Section 5 spec) */}
      <div className="flex flex-1 min-h-0 border-b border-line-subtle">
        {/* Left: Math Formula & Code Trace */}
        <div className="flex w-[52%] flex-col border-r border-line-subtle">
          <div className="border-b border-line-subtle px-3 py-1.5 label-xs text-txt-disabled">TRACE CODE / MATHEMATICAL SOLVER VIEW</div>
          <div key={traceKey} className="flex-1 overflow-auto p-3 space-y-2.5 anim-code-trace">
            {/* Hover target label */}
            <div className="text-[9.5px] text-acc/80 font-medium">[Hover Target: {trace.label}]</div>
            {/* Formula */}
            <div className="rounded-[4px] border border-acc/15 bg-acc/5 p-2 text-[9px] leading-relaxed text-acc/90">
              {trace.formula}
            </div>
            {/* Code snippet */}
            <div className="rounded-[4px] border border-line-subtle bg-[#020406] p-2">
              <pre className="text-[9px] leading-relaxed text-txt-secondary whitespace-pre-wrap break-words">{trace.code}</pre>
            </div>
          </div>
        </div>

        {/* Right: Live Console Log */}
        <div className="flex flex-col w-[48%]">
          <div className="border-b border-line-subtle px-3 py-1.5 label-xs text-txt-disabled">LIVE CONSOLE LOG BUFFER</div>
          <div ref={logRef} className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[#020305] text-[9px] leading-relaxed">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-txt-disabled shrink-0">[{log.timestamp}]</span>
                <span className={cn(
                  "shrink-0 font-semibold",
                  log.source === 'COMPLIANCE' ? 'text-gold' :
                  log.source === 'COMPUTE' ? 'text-acc2' :
                  log.source === 'MODEL' ? 'text-warn' : 'text-pos'
                )}>
                  [{log.source}]
                </span>
                <span className="text-txt-secondary">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-line-subtle">
        <div className="flex items-center gap-3 text-[9.5px]">
          <span className="text-txt-muted">MiFID II RTS 25:</span>
          <span className="text-pos font-medium">&lt;14μs PTP Synced</span>
          <span className="text-txt-disabled">|</span>
          <span className="text-txt-muted">RAY:</span>
          <span className="text-acc2 font-medium">3 Nodes</span>
        </div>
        <button onClick={onTriggerPreloader} className="text-[9.5px] text-acc hover:underline">
          Replay Preloader
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ HTML5 Canvas Micro-Sparkline (v2 Section 6.1) ═══════════════════════ */

/**
 * Optimized HTML5 Canvas renderer for real-time portfolio sparklines.
 * Bypasses React DOM node bloat for dense sparkline matrices (v2 spec §6.1).
 */
function drawCanvasSparkline(
  canvas: HTMLCanvasElement,
  dataPoints: number[],
  strokeColor = '#3DDC97',
): void {
  if (!canvas || !dataPoints || dataPoints.length < 2) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = strokeColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const minVal = Math.min(...dataPoints);
  const maxVal = Math.max(...dataPoints);
  const range = maxVal - minVal || 1.0;
  const xStep = rect.width / (dataPoints.length - 1);
  ctx.beginPath();
  dataPoints.forEach((val, i) => {
    const x = i * xStep;
    const y = rect.height - ((val - minVal) / range) * rect.height;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

/**
 * React wrapper around drawCanvasSparkline — zero SVG overhead.
 */
function CanvasSparkline({ data, height = 34, strokeColor = '#3DDC97' }: {
  data: number[];
  height?: number;
  strokeColor?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const draw = () => {
      if (canvasRef.current) drawCanvasSparkline(canvasRef.current, data, strokeColor);
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data, strokeColor]);
  return (
    <canvas
      ref={canvasRef}
      className="canvas-sparkline"
      style={{ height }}
      aria-hidden
    />
  );
}

/* ═══════════════════════ Hero terminal — real UI, not a photo ═══════════════════════ */

function HeroTerminal() {
  const data = PERF.slice(-90);
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 rounded-[20px] bg-acc/4 blur-3xl" aria-hidden />
      <div className="relative overflow-hidden rounded-[10px] border border-line bg-bg-secondary shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)]">
        <div className="flex items-center justify-between border-b border-line-subtle bg-bg-primary/70 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-pos anim-pulse-dot" />
            <span className="label-xs text-txt-secondary">Executive Command Center</span>
          </div>
          <span className="mono text-[9.5px] text-txt-disabled">15:30:04 IST · PAPER</span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-line-subtle">
          {[["NAV", "₹10.42 Cr", "+14.72%", "pos"], ["Sharpe", "1.82", "+0.14", "pos"], ["VaR 95%", "₹18.4 L", "+18.4%", "neg"]].map(([k, v, d, t]) => (
            <div key={k} className="bg-bg-secondary px-3 py-2.5">
              <div className="label-xs text-txt-muted">{k}</div>
              <div className="tnum mt-1 text-[15px] font-semibold leading-none text-txt-primary">{v}</div>
              <div className={cn("mono mt-1 text-[9.5px]", t === "pos" ? "text-pos" : "text-neg")}>{d}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-line-subtle p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="label-xs text-txt-secondary">Portfolio vs NIFTY 50</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-[2px] w-3 rounded bg-acc" /><span className="text-[9.5px] text-txt-muted">Portfolio</span></span>
              <span className="flex items-center gap-1"><span className="h-[2px] w-3 rounded bg-acc2" /><span className="text-[9.5px] text-txt-muted">NIFTY</span></span>
            </span>
          </div>
          <div className="relative h-[124px] overflow-hidden rounded-[4px] border border-line-subtle bg-bg-primary/50 p-1.5">
            <div className="absolute inset-1.5">
              <Sparkline data={data.map((d) => d.nifty)} width={520} height={112} tone="neu" fill={false} strokeWidth={0.9} fluid />
            </div>
            <div className="absolute inset-1.5">
              <Sparkline data={data.map((d) => d.portfolio)} width={520} height={112} tone="pos" strokeWidth={1.2} fluid />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px border-t border-line-subtle bg-line-subtle sm:grid-cols-[1.3fr_1fr]">
          <div className="bg-bg-secondary p-3">
            <div className="mb-2 label-xs text-txt-secondary">Alpha Intelligence</div>
            <table className="w-full">
              <tbody>
                {ALPHA_ROWS.slice(0, 4).map((r) => (
                  <tr key={r.ticker} className="border-b border-line-subtle/60 last:border-0">
                    <td className="py-1.5 mono text-[10.5px] text-txt-primary">{r.ticker}</td>
                    <td className="py-1.5 text-right mono text-[10.5px] text-txt-secondary">{r.alpha.toFixed(2)}</td>
                    <td className="py-1.5 text-right">
                      <span className="inline-block rounded-[2px] px-1 mono text-[9px]" style={{ background: `rgba(61,220,151,${0.06 + (r.momentum / 100) * 0.18})`, color: "#f2f5f7" }}>+{r.momentum}</span>
                    </td>
                    <td className="py-1.5 text-right mono text-[10px] text-txt-muted">{r.mlProb}%</td>
                    <td className="py-1.5 text-right">
                      <span className={cn("label-xs", r.signal === "BUY" ? "text-pos" : r.signal === "SELL" ? "text-neg" : "text-txt-muted")}>{r.signal}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 bg-bg-secondary p-3">
            <div className="relative shrink-0">
              <AllocationRadial data={ALLOCATION} size={92} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="tnum text-[11px] font-semibold text-txt-primary">72%</span>
                <span className="label-xs text-txt-disabled" style={{ fontSize: 7 }}>EQUITY</span>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {ALLOCATION.map((a) => (
                <li key={a.key} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: a.color }} />
                    <span className="truncate text-[10px] text-txt-muted">{a.key}</span>
                  </span>
                  <span className="mono text-[10px] text-txt-secondary">{a.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-line-subtle bg-neg/5 px-3 py-2">
          <span className="h-1 w-1 rounded-full bg-neg anim-pulse-dot" />
          <span className="label-xs text-neg">CRITICAL</span>
          <span className="truncate text-[10.5px] text-txt-secondary">Portfolio beta exceeded 1.10 — auto-hedge engaged</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ Section visuals (Interactive widgets) ═══════════════════════ */

function Frame({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[10px] glass-card shadow-[0_36px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-line-subtle px-3.5 py-2.5">
        <span className="label-xs text-txt-secondary">{title}</span>
        {meta && <span className="mono text-[9.5px] text-txt-disabled">{meta}</span>}
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

function SectionVisual({ kind, onHoverAction }: { kind: string; onHoverAction?: (msg: string) => void }) {
  const [selectedSector, setSelectedSector] = useState<string>("Industrials");
  const [optTarget, setOptTarget] = useState<"current" | "opt" | "min" | "max">("opt");
  const [riskScenario, setRiskScenario] = useState<"baseline" | "rates" | "gfc" | "tech">("baseline");
  const [copilotPromptIdx, setCopilotPromptIdx] = useState<number>(0);

  if (kind === "market") {
    const sectors = [
      { name: "Industrials", val: 2.04, leader: "L&T (+2.8%)" },
      { name: "Energy", val: 1.86, leader: "RELIANCE (+2.1%)" },
      { name: "Auto", val: 1.62, leader: "TATAMOTORS (+3.4%)" },
      { name: "Financials", val: 1.24, leader: "HDFCBANK (+1.5%)" },
      { name: "Utilities", val: 0.94, leader: "NTPC (+1.2%)" },
      { name: "Consumer", val: 0.34, leader: "ITC (+0.8%)" },
      { name: "Technology", val: -0.58, leader: "TCS (-0.9%)" },
      { name: "Materials", val: -1.18, leader: "TATASTEEL (-1.8%)" }
    ];

    return (
      <Frame title="Sector rotation & breadth" meta="NSE · interactive click">
        <ul className="space-y-2">
          {sectors.map((s) => {
            const isSel = selectedSector === s.name;
            return (
              <li 
                key={s.name} 
                onClick={() => {
                  setSelectedSector(s.name);
                  onHoverAction?.(`Sector ${s.name} selected: ${s.leader}`);
                }}
                className={cn(
                  "cursor-pointer rounded p-1 transition-all",
                  isSel ? "bg-surface-selected border border-acc/30" : "hover:bg-surface/50"
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-[11.5px] text-txt-secondary font-medium">{s.name}</span>
                  <div className="flex items-center gap-2">
                    {isSel && <span className="mono text-[10px] text-acc">{s.leader}</span>}
                    <span className={cn("mono text-[11px]", s.val >= 0 ? "text-pos" : "text-neg")}>
                      {s.val >= 0 ? "↑ +" : "↓ −"}{Math.abs(s.val).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="relative mt-1 h-1.5 rounded-full bg-line-subtle">
                  <span className="absolute left-1/2 top-0 h-full w-px bg-line-strong" />
                  <span className={cn("absolute top-0 h-full rounded-full", s.val >= 0 ? "left-1/2 bg-acc/70" : "right-1/2 bg-neg/70")}
                    style={{ width: `${Math.min(46, (Math.abs(s.val) / 2.4) * 46)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Frame>
    );
  }

  if (kind === "alpha")
    return (
      <Frame title="Factor composite studio" meta="NIFTY 200 · live blend">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { n: "Momentum", sr: 1.64, c: C.acc, ic: "0.068" },
            { n: "ML Ensemble", sr: 1.71, c: C.acc2, ic: "0.084" },
            { n: "Quality", sr: 1.31, c: C.gold, ic: "0.042" },
            { n: "Value", sr: 1.12, c: "#B98CFF", ic: "0.035" }
          ].map((f, i) => (
            <div 
              key={f.n} 
              onMouseEnter={() => onHoverAction?.(`Factor ${f.n} IC: ${f.ic}`)}
              className="glass-card-interactive rounded-[6px] p-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-txt-secondary">{f.n}</span>
                <span className="mono text-[11px] text-txt-primary">SR {f.sr.toFixed(2)}</span>
              </div>
              {/* v2 §6.1: Use Canvas sparkline for ML Ensemble (zero SVG DOM overhead) */}
              <div className="mt-2 h-[34px]">
                {f.n === "ML Ensemble" ? (
                  <CanvasSparkline
                    data={sparkOf(880 + i * 29, 30, 0.22, 0.12)}
                    height={34}
                    strokeColor={f.c}
                  />
                ) : (
                  <Sparkline data={sparkOf(880 + i * 29, 30, 0.22, 0.12)} width={230} height={34} strokeWidth={1} tone="pos" fluid />
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[9px] text-txt-disabled">
                <span>IC: {f.ic}</span>
                <span className="text-acc">ACTIVE</span>
              </div>
              <div className="mt-1 h-[2px] rounded-full" style={{ background: f.c, opacity: 0.7 }} />
            </div>
          ))}
        </div>
      </Frame>
    );

  if (kind === "opt") {
    const targets = {
      current: { ret: "13.8%", vol: "12.4%", sr: "1.42", to: "0.0%", label: "Current Portfolio" },
      opt: { ret: "16.4%", vol: "10.8%", sr: "1.82", to: "13.2%", label: "Convex Optimized" },
      min: { ret: "11.2%", vol: "7.9%", sr: "1.28", to: "18.4%", label: "Minimum Variance" },
      max: { ret: "19.6%", vol: "14.2%", sr: "1.88", to: "24.1%", label: "Max Sharpe Ratio" }
    };

    return (
      <Frame title="Interactive efficient frontier" meta="OSQP · 6 constraints">
        <svg viewBox="0 0 400 180" className="w-full select-none" role="img" aria-label="Efficient frontier illustration">
          {[0, 1, 2, 3].map((g) => <line key={g} x1={20} x2={390} y1={10 + g * 44} y2={10 + g * 44} stroke="#16202a" strokeWidth={1} />)}
          <path d="M30,160 C110,140 170,86 250,52 C300,32 340,24 380,20" fill="none" stroke={C.acc2} strokeWidth={1.2} className="anim-draw" />
          
          {/* Current */}
          <g onClick={() => { setOptTarget("current"); onHoverAction?.("Target: Current baseline allocation"); }} className="cursor-pointer">
            <circle cx="150" cy="100" r={optTarget === "current" ? "6" : "4"} fill={C.neu} stroke={optTarget === "current" ? "#fff" : "none"} strokeWidth="1.5" />
            <text x="160" y="103" fill="#647180" fontSize="9">Current</text>
          </g>
          {/* Optimized */}
          <g onClick={() => { setOptTarget("opt"); onHoverAction?.("Target: Ledoit-Wolf convex optimized"); }} className="cursor-pointer">
            <circle cx="252" cy="52" r={optTarget === "opt" ? "7" : "4.5"} fill={C.acc} stroke={optTarget === "opt" ? "#fff" : "none"} strokeWidth="1.5" />
            <text x="262" y="55" fill="#9AA7B5" fontSize="9" fontWeight="bold">Optimized</text>
          </g>
          {/* Min variance */}
          <g onClick={() => { setOptTarget("min"); onHoverAction?.("Target: Global minimum variance"); }} className="cursor-pointer">
            <circle cx="60" cy="148" r={optTarget === "min" ? "6" : "4"} fill={C.acc2} stroke={optTarget === "min" ? "#fff" : "none"} strokeWidth="1.5" />
            <text x="70" y="151" fill="#647180" fontSize="9">Min var</text>
          </g>
          {/* Max Sharpe */}
          <g onClick={() => { setOptTarget("max"); onHoverAction?.("Target: Maximum Sharpe tangency portfolio"); }} className="cursor-pointer">
            <circle cx="330" cy="28" r={optTarget === "max" ? "6" : "4"} fill={C.gold} stroke={optTarget === "max" ? "#fff" : "none"} strokeWidth="1.5" />
            <text x="268" y="24" fill="#647180" fontSize="9">Max Sharpe</text>
          </g>
        </svg>

        <div className="mt-2 grid grid-cols-4 gap-3 border-t border-line-subtle pt-3">
          <div><div className="label-xs text-txt-disabled">Return</div><div className="mono mt-1 text-[13px] text-txt-primary">{targets[optTarget].ret}</div></div>
          <div><div className="label-xs text-txt-disabled">Vol</div><div className="mono mt-1 text-[13px] text-txt-primary">{targets[optTarget].vol}</div></div>
          <div><div className="label-xs text-txt-disabled">Sharpe</div><div className="mono mt-1 text-[13px] text-acc font-semibold">{targets[optTarget].sr}</div></div>
          <div><div className="label-xs text-txt-disabled">Turnover</div><div className="mono mt-1 text-[13px] text-txt-primary">{targets[optTarget].to}</div></div>
        </div>
      </Frame>
    );
  }

  if (kind === "risk") {
    const scenarios = {
      baseline: { var: "1.77%", cvar: "2.42%", drop: "0.0%", desc: "Normal market baseline condition" },
      rates: { var: "2.84%", cvar: "3.91%", drop: "−4.2%", desc: "+250bps central bank rate spike" },
      gfc: { var: "6.12%", cvar: "8.45%", drop: "−18.4%", desc: "2008 GFC multi-asset liquidity crunch" },
      tech: { var: "3.45%", cvar: "4.82%", drop: "−6.8%", desc: "Technology factor crowding unwind" }
    };

    return (
      <Frame title="Risk decomposition & stress simulator" meta="GARCH-DCC v4.0.0">
        <div className="flex h-3 overflow-hidden rounded-[3px] mb-3">
          {[["#6EA8FE", 46.2], ["#3DDC97", 21.4], ["#C8A96B", 18.1], ["#8290A0", 11.8], ["#E8B75A", 2.5]].map(([c, w], i) => (
            <span key={i} style={{ width: `${w}%`, background: c as string, opacity: 0.82 }} />
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between rounded-[4px] border border-line-subtle bg-bg-primary/50 p-2 text-[11px]">
          <span className="text-txt-secondary">Simulate Shock:</span>
          <select
            value={riskScenario}
            onChange={(e) => {
              const val = e.target.value as "baseline" | "rates" | "gfc" | "tech";
              setRiskScenario(val);
              onHoverAction?.(`Stress Test: ${scenarios[val].desc} -> VaR: ${scenarios[val].var}`);
            }}
            className="rounded border border-line-strong bg-surface px-2 py-0.5 text-[11px] text-txt-primary focus:outline-none"
          >
            <option value="baseline">Baseline State</option>
            <option value="rates">+250bps Rate Hike</option>
            <option value="gfc">2008 GFC Liquidity Crisis</option>
            <option value="tech">Tech Crowding Unwind</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-line-subtle pt-2.5 text-center">
          <div className="rounded bg-surface/50 p-2">
            <div className="label-xs text-txt-disabled">1D VaR 95%</div>
            <div className="mono text-[13px] font-semibold text-neg mt-1">{scenarios[riskScenario].var}</div>
          </div>
          <div className="rounded bg-surface/50 p-2">
            <div className="label-xs text-txt-disabled">Expected Shortfall</div>
            <div className="mono text-[13px] font-semibold text-neg mt-1">{scenarios[riskScenario].cvar}</div>
          </div>
          <div className="rounded bg-surface/50 p-2">
            <div className="label-xs text-txt-disabled">Shock Drawdown</div>
            <div className="mono text-[13px] font-semibold text-neg mt-1">{scenarios[riskScenario].drop}</div>
          </div>
        </div>
      </Frame>
    );
  }

  if (kind === "bt")
    return (
      <Frame title="Simulation tearsheet" meta="1,842 rebalance dates">
        <Sparkline data={PERF.map((p) => p.portfolio)} width={560} height={92} tone="pos" strokeWidth={1.1} fluid />
        <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3 border-t border-line-subtle pt-3 sm:grid-cols-6">
          {[["CAGR", "21.4%"], ["Sharpe", "1.82"], ["MaxDD", "−8.43%"], ["Win", "58.4%"], ["Turnover", "13.2%"], ["Alpha", "+7.9%"]].map(([k, v]) => (
            <div key={k}>
              <div className="label-xs text-txt-disabled">{k}</div>
              <div className={cn("mono mt-1 text-[12.5px]", String(v).startsWith("−") ? "text-neg" : "text-txt-primary")}>{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-12 gap-[2px]">
          {Array.from({ length: 60 }).map((_, i) => {
            const v = Math.sin(i / 3.1) * 3 + Math.cos(i / 1.7) * 1.6;
            return (
              <span 
                key={i} 
                onMouseEnter={() => onHoverAction?.(`Rebalance period #${i + 1780}: ${v >= 0 ? "+" : ""}${v.toFixed(2)}%`)}
                className="h-4 rounded-[2px] transition-transform hover:scale-125 cursor-pointer" 
                style={{ background: v >= 0 ? `rgba(61,220,151,${0.1 + Math.min(0.4, Math.abs(v) / 9)})` : `rgba(255,92,108,${0.1 + Math.min(0.4, Math.abs(v) / 9)})` }} 
              />
            );
          })}
        </div>
      </Frame>
    );

  const copilotPrompts = [
    {
      q: "Why did portfolio risk increase today?",
      ans: "Portfolio VaR increased 18.4% today due to financial covariance spike:",
      drivers: [
        ["01", "Banking correlation increased", "0.42 → 0.61", "+45.2%"],
        ["02", "HDFCBANK weight increased", "5.2% → 7.1%", "+1.9pp"],
        ["03", "Market volatility increased", "11.2% → 12.5%", "+12.0%"]
      ],
      actions: ["View Risk Attribution", "Run Stress Test"]
    },
    {
      q: "Identify factor crowding in Technology sector",
      ans: "Identified high momentum crowding in IT factor family:",
      drivers: [
        ["01", "TCS / INFY Pair Correlation", "0.78 → 0.89", "+14.1%"],
        ["02", "Momentum Decile 10 Crowding", "88th Percentile", "HIGH"],
        ["03", "Predicted Reversal Slippage", "12.4 bps", "ELEVATED"]
      ],
      actions: ["Rebalance Alpha Weights", "Trim Tech Beta"]
    }
  ];

  const curr = copilotPrompts[copilotPromptIdx];

  return (
    <Frame title="QUANT COPILOT" meta="grounded research note">
      <div className="flex gap-1.5 mb-2.5">
        {copilotPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCopilotPromptIdx(idx);
              onHoverAction?.(`Copilot Question: ${p.q}`);
            }}
            className={cn(
              "text-[10.5px] rounded px-2 py-1 transition-colors border",
              copilotPromptIdx === idx ? "border-acc/40 bg-acc/10 text-acc" : "border-line-subtle bg-surface/50 text-txt-muted hover:text-txt-primary"
            )}
          >
            {p.q.slice(0, 24)}...
          </button>
        ))}
      </div>

      <div className="rounded-[6px] border border-line-subtle bg-bg-primary/50 px-3 py-2 text-[11.5px] text-txt-primary font-medium">
        {curr.q}
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-txt-secondary">
        {curr.ans}
      </p>
      <ol className="mt-2 divide-y divide-line-subtle overflow-hidden rounded-[6px] border border-line-subtle">
        {curr.drivers.map(([n, t, d, v]) => (
          <li key={n} className="flex items-start gap-2.5 bg-bg-primary/30 px-2.5 py-1.5 text-[10.5px]">
            <span className="mono mt-0.5 text-[9.5px] text-txt-disabled">{n}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-txt-primary">{t}</span>
              <span className="mono block text-[9.5px] text-txt-muted">{d}</span>
            </span>
            <span className="mono text-[10.5px] text-neg">{v}</span>
          </li>
        ))}
      </ol>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {curr.actions.map((a, i) => (
          <span key={a} className={cn("rounded-[4px] border px-2 py-0.5 text-[10px]", i === 0 ? "border-acc/35 bg-acc/8 text-acc" : "border-line bg-surface-high text-txt-secondary")}>{a}</span>
        ))}
      </div>
    </Frame>
  );
}
