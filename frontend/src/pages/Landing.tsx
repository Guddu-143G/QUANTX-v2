import { useEffect, useState } from "react";
import {
  Activity, ArrowRight, Atom, Boxes, Database, FlaskConical, Gauge, LineChart, Lock,
  Scale, ShieldAlert, Sparkles, Terminal, Zap,
} from "lucide-react";
import { Logo } from "../components/layout/AppShell";
import { Badge, Button, useReveal } from "../components/ui";
import { AllocationRadial, Sparkline, C } from "../components/charts";
import { ALLOCATION, PERF } from "../data/portfolio";
import { ALPHA_ROWS } from "../data/quant";
import { INDICES, sparkOf } from "../data/market";
import { Link } from "../lib/router";
import { cn } from "../utils/cn";

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

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div ref={ref} className="min-h-screen overflow-x-hidden bg-bg-primary">
      {/* ── NAV ── */}
      <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled && "border-b border-line-subtle bg-bg-primary/88 backdrop-blur-xl")}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {[["Platform", "#market"], ["Alpha", "#alpha"], ["Risk", "#risk"], ["Architecture", "#arch"], ["Performance", "#perf"]].map(([l, h]) => (
              <a key={l} href={h} className="text-[12px] text-txt-secondary transition-colors hover:text-txt-primary">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
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
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden pt-28 lg:pt-32">
        {/* Abstract hero background */}
        <div className="pointer-events-none absolute inset-0 grid-texture mask-fade-b" aria-hidden />
        <div className="pointer-events-none absolute inset-0 radial-veil" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-acc/25 to-transparent" aria-hidden />

        <div className="relative mx-auto max-w-[1400px] px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="reveal flex flex-wrap items-center gap-2">
                <Badge tone="pos" dot>LIVE RESEARCH ENGINE</Badge>
                <Badge tone="neu">v4.2 · ap-south-1</Badge>
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
                <a href="#market"><Button size="lg" variant="outline">EXPLORE PLATFORM</Button></a>
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
      <div className="relative border-y border-line-subtle bg-bg-secondary/60">
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
        <section key={s.k} id={s.k} className={cn("relative py-16 lg:py-24", i % 2 === 1 && "bg-bg-secondary/40")}>
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
                <SectionVisual kind={s.k} />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── 08 ARCHITECTURE ── */}
      <section id="arch" className="relative py-16 lg:py-24">
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
              <div key={c.t} className="flex gap-3 rounded-[8px] border border-line-subtle bg-bg-secondary/40 p-4">
                <c.icon size={15} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <h3 className="text-[12.5px] font-semibold text-txt-primary">{c.t}</h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-txt-muted">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 09 PERFORMANCE ── */}
      <section id="perf" className="relative border-y border-line-subtle bg-bg-secondary/40 py-16 lg:py-24">
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
      <footer className="border-t border-line-subtle bg-bg-secondary/50">
        <div className="mx-auto max-w-[1400px] px-5 py-12 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_repeat(2,1fr)_1.4fr]">
            {/* Brand */}
            <div>
              <Logo />
              <p className="mt-5 max-w-[38ch] text-[12px] leading-relaxed text-txt-muted">
                Quantitative Intelligence for Modern Capital. Research. Optimize. Manage Risk.
              </p>
              <p className="mt-5 text-[10.5px] leading-relaxed text-txt-disabled">
                All data shown is synthetic and generated for demonstration purposes. Nothing on this site is investment advice or an offer of any financial product.
              </p>
            </div>

            {/* Links */}
            {[
              { t: "Platform", l: [["Overview", "/dashboard"], ["Markets", "/markets"], ["Alpha Lab", "/research/alpha"], ["Optimizer", "/portfolio/optimizer"]] },
              { t: "Risk & Ops", l: [["Risk Center", "/risk"], ["Backtesting", "/backtest"], ["Models", "/models"], ["Data Quality", "/data"]] }
            ].map((g) => (
              <div key={g.t}>
                <h3 className="text-[11px] font-semibold tracking-wider text-txt-disabled uppercase">{g.t}</h3>
                <ul className="mt-4 space-y-2.5">
                  {g.l.map(([l, to]) => (
                    <li key={l}>
                      <Link to={to} className="text-[12px] text-txt-secondary transition-colors hover:text-acc">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Waitlist Form */}
            <div>
              <h3 className="text-[11px] font-semibold tracking-wider text-txt-disabled uppercase">Institutional Access</h3>
              <p className="mt-4 text-[12px] leading-relaxed text-txt-secondary">
                Join the waitlist to receive access to our proprietary risk models, automated hedging suite, and alternative data integrations.
              </p>
              <div className="mt-5">
                <WaitlistForm />
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line-subtle pt-6">
            <div className="flex items-center gap-4">
              <p className="text-[11px] text-txt-disabled">© 2026 QUANTX. Simulated demonstration environment.</p>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-txt-muted hover:text-txt-primary cursor-pointer transition-colors">Privacy</span>
                <span className="text-[11px] text-txt-muted hover:text-txt-primary cursor-pointer transition-colors">Terms</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-pos anim-pulse-dot" />
              <p className="mono text-[10px] text-txt-disabled">All Systems Operational · ap-south-1</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    
    try {
      const response = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing_footer" })
      });
      const data = await response.json();
      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "You have been added to the waitlist.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.detail || "Unable to join waitlist.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} className="relative">
      <div className="relative flex items-center">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Corporate email address" 
          disabled={status === "loading" || status === "success"}
          className={cn(
            "w-full rounded-[6px] border border-line bg-surface/50 py-2.5 pl-3 pr-24 text-[12.5px] text-txt-primary transition-colors",
            "focus:border-acc focus:bg-surface-high focus:outline-none focus:ring-1 focus:ring-acc placeholder:text-txt-disabled",
            (status === "loading" || status === "success") && "opacity-60 cursor-not-allowed"
          )} 
        />
        <div className="absolute right-1">
          <Button 
            type="submit" 
            variant="primary" 
            size="sm" 
            loading={status === "loading"}
            disabled={status === "success" || !email}
            className="h-7 text-[10.5px] px-3"
          >
            {status === "success" ? "Joined" : "Request Access"}
          </Button>
        </div>
      </div>
      {message && (
        <p className={cn("mt-2 text-[11px]", status === "success" ? "text-pos" : "text-neg")}>
          {message}
        </p>
      )}
    </form>
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

/* ═══════════════════════ Section visuals ═══════════════════════ */

function Frame({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-bg-secondary/80 shadow-[0_36px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-line-subtle px-3.5 py-2.5">
        <span className="label-xs text-txt-secondary">{title}</span>
        {meta && <span className="mono text-[9.5px] text-txt-disabled">{meta}</span>}
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

function SectionVisual({ kind }: { kind: string }) {
  if (kind === "market")
    return (
      <Frame title="Sector rotation & breadth" meta="NSE · intraday">
        <ul className="space-y-2.5">
          {[["Industrials", 2.04], ["Energy", 1.86], ["Auto", 1.62], ["Financials", 1.24], ["Utilities", 0.94], ["Consumer", 0.34], ["Technology", -0.58], ["Materials", -1.18]].map(([s, v]) => (
            <li key={s as string}>
              <div className="flex items-baseline justify-between">
                <span className="text-[11.5px] text-txt-secondary">{s}</span>
                <span className={cn("mono text-[11px]", (v as number) >= 0 ? "text-pos" : "text-neg")}>{(v as number) >= 0 ? "↑ +" : "↓ −"}{Math.abs(v as number).toFixed(2)}%</span>
              </div>
              <div className="relative mt-1 h-1.5 rounded-full bg-line-subtle">
                <span className="absolute left-1/2 top-0 h-full w-px bg-line-strong" />
                <span className={cn("absolute top-0 h-full rounded-full", (v as number) >= 0 ? "left-1/2 bg-acc/70" : "right-1/2 bg-neg/70")}
                  style={{ width: `${Math.min(46, (Math.abs(v as number) / 2.4) * 46)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </Frame>
    );

  if (kind === "alpha")
    return (
      <Frame title="Factor composite" meta="NIFTY 200 · long-short decile">
        <div className="grid grid-cols-2 gap-2.5">
          {[["Momentum", 1.64, C.acc], ["ML Ensemble", 1.71, C.acc2], ["Quality", 1.31, C.gold], ["Value", 1.12, "#B98CFF"]].map(([n, sr, c], i) => (
            <div key={n as string} className="rounded-[6px] border border-line-subtle bg-bg-primary/50 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-txt-secondary">{n}</span>
                <span className="mono text-[11px] text-txt-primary">SR {(sr as number).toFixed(2)}</span>
              </div>
              <div className="mt-2"><Sparkline data={sparkOf(880 + i * 29, 30, 0.22, 0.12)} width={230} height={34} strokeWidth={1} tone="pos" fluid /></div>
              <div className="mt-1.5 h-[2px] rounded-full" style={{ background: c as string, opacity: 0.7 }} />
            </div>
          ))}
        </div>
      </Frame>
    );

  if (kind === "opt")
    return (
      <Frame title="Efficient frontier" meta="OSQP · 6 constraints">
        <svg viewBox="0 0 400 200" className="w-full" role="img" aria-label="Efficient frontier illustration">
          {[0, 1, 2, 3, 4].map((g) => <line key={g} x1={20} x2={390} y1={10 + g * 44} y2={10 + g * 44} stroke="#16202a" strokeWidth={1} />)}
          <path d="M30,176 C110,150 170,96 250,58 C300,36 340,28 380,24" fill="none" stroke={C.acc2} strokeWidth={1.2} className="anim-draw" />
          <circle cx="150" cy="112" r="4" fill={C.neu} /><text x="160" y="115" fill="#647180" fontSize="9">Current</text>
          <circle cx="252" cy="58" r="4.5" fill={C.acc} /><text x="262" y="61" fill="#9AA7B5" fontSize="9">Optimized</text>
          <circle cx="60" cy="162" r="4" fill={C.acc2} /><text x="70" y="165" fill="#647180" fontSize="9">Min variance</text>
          <circle cx="330" cy="32" r="4" fill={C.gold} /><text x="238" y="26" fill="#647180" fontSize="9">Max Sharpe</text>
        </svg>
        <div className="mt-2 grid grid-cols-4 gap-3 border-t border-line-subtle pt-3">
          {[["Return", "16.4%"], ["Vol", "10.8%"], ["Sharpe", "1.82"], ["Turnover", "13.2%"]].map(([k, v]) => (
            <div key={k}><div className="label-xs text-txt-disabled">{k}</div><div className="mono mt-1 text-[13px] text-txt-primary">{v}</div></div>
          ))}
        </div>
      </Frame>
    );

  if (kind === "risk")
    return (
      <Frame title="Risk decomposition & limits" meta="GARCH-DCC v4.0.0">
        <div className="flex h-3.5 overflow-hidden rounded-[3px]">
          {[["#6EA8FE", 46.2], ["#3DDC97", 21.4], ["#C8A96B", 18.1], ["#8290A0", 11.8], ["#E8B75A", 2.5]].map(([c, w], i) => (
            <span key={i} style={{ width: `${w}%`, background: c as string, opacity: 0.82 }} />
          ))}
        </div>
        <ul className="mt-3 space-y-2">
          {[["Single stock weight", 8.4, 10], ["Sector concentration", 23.0, 25], ["Portfolio beta", 0.94, 1.1], ["Daily VaR (95%)", 1.77, 2.3]].map(([k, c, l]) => {
            const u = ((c as number) / (l as number)) * 100;
            return (
              <li key={k as string}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11.5px] text-txt-secondary">{k}</span>
                  <span className={cn("mono text-[11px]", u > 90 ? "text-neg" : u > 80 ? "text-warn" : "text-txt-primary")}>{c} / {l}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line-subtle">
                  <span className={cn("block h-full rounded-full", u > 90 ? "bg-neg/80" : u > 80 ? "bg-warn/80" : "bg-acc/70")} style={{ width: `${u}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Frame>
    );

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
            return <span key={i} className="h-4 rounded-[2px]" style={{ background: v >= 0 ? `rgba(61,220,151,${0.08 + Math.min(0.4, Math.abs(v) / 9)})` : `rgba(255,92,108,${0.08 + Math.min(0.4, Math.abs(v) / 9)})` }} />;
          })}
        </div>
      </Frame>
    );

  return (
    <Frame title="QUANT COPILOT" meta="grounded research note">
      <div className="rounded-[6px] border border-line-subtle bg-bg-primary/50 px-3 py-2 text-[11.5px] text-txt-primary">
        Why did portfolio risk increase today?
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-txt-secondary">
        Portfolio VaR increased <span className="mono text-txt-primary">18.4%</span> today. Primary drivers:
      </p>
      <ol className="mt-2.5 divide-y divide-line-subtle overflow-hidden rounded-[6px] border border-line-subtle">
        {[
          ["01", "Banking correlation increased", "0.42 → 0.61", "+45.2%"],
          ["02", "HDFCBANK weight increased", "5.2% → 7.1%", "+1.9pp"],
          ["03", "Market volatility increased", "11.2% → 12.5%", "+12.0%"],
          ["04", "Financial concentration increased", "20.6% → 23.0%", "+2.4pp"],
        ].map(([n, t, d, v]) => (
          <li key={n} className="flex items-start gap-2.5 bg-bg-primary/30 px-2.5 py-2">
            <span className="mono mt-0.5 text-[9.5px] text-txt-disabled">{n}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-txt-primary">{t}</span>
              <span className="mono block text-[10px] text-txt-muted">{d}</span>
            </span>
            <span className="mono text-[10.5px] text-neg">{v}</span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["View Risk Attribution", "Run Stress Test", "Open Portfolio"].map((a, i) => (
          <span key={a} className={cn("rounded-[5px] border px-2 py-1 text-[10.5px]", i === 0 ? "border-acc/35 bg-acc/8 text-acc" : "border-line bg-surface-high text-txt-secondary")}>{a}</span>
        ))}
      </div>
    </Frame>
  );
}
