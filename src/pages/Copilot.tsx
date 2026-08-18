import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight, Braces, CornerDownLeft, Cpu, Database, FileText, Layers, Radio, Sparkles, Terminal,
} from "lucide-react";
import { Badge, Button, Panel, StatusIndicator, useToast } from "../components/ui";
import { Sparkline } from "../components/charts";
import { copilotService } from "../services";
import { COPILOT_SEED, COPILOT_SUGGESTIONS, type CopilotBlock, type CopilotMsg } from "../data/quant";
import { cn } from "../utils/cn";
import { timeIST } from "../lib/format";
import { useRouter } from "../lib/router";

const THINKING = [
  "Parsing query intent",
  "Resolving portfolio context",
  "Querying risk-engine",
  "Retrieving factor exposures",
  "Cross-checking news corpus",
  "Composing research note",
];

export default function Copilot() {
  const [msgs, setMsgs] = useState<CopilotMsg[]>(COPILOT_SEED);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const { push } = useToast();

  useEffect(() => {
    const q = sessionStorage.getItem("qx-copilot-ask");
    if (q) { sessionStorage.removeItem("qx-copilot-ask"); setTimeout(() => send(q), 300); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, step]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { role: "user", text, ts: timeIST().slice(0, 5) }]);
    setInput("");
    setBusy(true);
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(THINKING.length - 1, s + 1)), 190);
    const blocks = await copilotService.ask(text);
    clearInterval(t);
    setBusy(false);
    setMsgs((m) => [...m, { role: "ai", blocks, ts: timeIST().slice(0, 5) }]);
  };

  const onAction = (a: string) => {
    const map: Record<string, string> = {
      "View Risk Attribution": "/risk", "Run Stress Test": "/risk", "Open Portfolio": "/portfolio",
      "Open Alpha Lab": "/research/alpha", "Open Dashboard": "/dashboard", "Send to Optimizer": "/portfolio/optimizer",
      "Open Performance Chart": "/dashboard", "Open Stress Testing": "/risk", "Open Drawdown Analysis": "/backtest",
      "View Attribution": "/backtest", "Compare vs Benchmark": "/dashboard", "Rebalance Factor Weights": "/research/alpha",
    };
    if (map[a]) navigate(map[a]);
    else push({ title: `Action queued — ${a}`, body: "Requires desk approval in the paper environment.", tone: "warn" });
  };

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
      {/* ── Context rail ── */}
      <aside className="hidden content-start gap-3 xl:col-span-3 xl:grid">
        <Panel level={3} title="Session Context" sub="Grounding data for this conversation">
          <ul className="space-y-2.5">
            <Ctx icon={Layers} k="Portfolio" v="Multi-Strat Core · ₹10.42 Cr" />
            <Ctx icon={Database} k="Positions snapshot" v="22 Aug 2026 · 15:30 IST" />
            <Ctx icon={Cpu} k="Risk model" v="Risk-GARCH-DCC v4.0.0" />
            <Ctx icon={Braces} k="Alpha model" v="Alpha-XGB v3.2.1" />
            <Ctx icon={FileText} k="News corpus" v="48h · 3,412 documents" />
          </ul>
        </Panel>

        <Panel level={3} title="Suggested Research" sub="One-click institutional queries" bodyClass="p-2">
          <ul className="space-y-1">
            {COPILOT_SUGGESTIONS.map((s) => (
              <li key={s}>
                <button onClick={() => send(s)} disabled={busy}
                  className="group flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-left text-[11.5px] text-txt-secondary transition-colors hover:bg-surface-hover hover:text-txt-primary disabled:opacity-40">
                  <Terminal size={11} className="shrink-0 text-txt-disabled transition-colors group-hover:text-acc" />
                  <span className="truncate">{s}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel level={3} title="Engine Telemetry">
          <ul className="space-y-2">
            {[
              { k: "Model", v: "quantx-research-7b" }, { k: "Context window", v: "128K tokens" },
              { k: "Median latency", v: "620ms" }, { k: "Tool calls", v: "risk, alpha, news, optimizer" },
              { k: "Grounding", v: "Retrieval + live services" },
            ].map((r) => (
              <li key={r.k} className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-txt-muted">{r.k}</span>
                <span className="mono truncate text-[10.5px] text-txt-secondary">{r.v}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </aside>

      {/* ── Conversation ── */}
      <div className="xl:col-span-9">
        <div className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface/40" style={{ minHeight: "calc(100vh - 9rem)" }}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle bg-bg-secondary/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-acc/25 bg-acc/8">
                <Sparkles size={15} className="text-acc" strokeWidth={1.6} />
              </span>
              <div>
                <h1 className="text-[13px] font-bold tracking-[0.14em] text-txt-primary">QUANT COPILOT</h1>
                <div className="mt-0.5 flex items-center gap-2">
                  <StatusIndicator tone="pos" label="Live research engine" />
                  <span className="text-[10px] text-txt-disabled">·</span>
                  <span className="label-xs text-txt-disabled">Grounded on desk data</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge tone="gold">SIMULATED</Badge>
              <Badge tone="neu" dot>{msgs.filter((m) => m.role === "ai").length} research notes</Badge>
              <Button size="xs" variant="ghost" onClick={() => setMsgs([])}>Clear</Button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
            {msgs.length === 0 && (
              <div className="mx-auto max-w-[560px] py-14 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[9px] border border-line bg-bg-secondary">
                  <Radio size={17} className="text-txt-muted" strokeWidth={1.4} />
                </span>
                <h2 className="mt-4 text-[15px] font-semibold text-txt-primary">Ask the research engine</h2>
                <p className="mx-auto mt-1.5 max-w-[420px] text-[12px] leading-relaxed text-txt-muted">
                  Every answer is grounded in live portfolio state, the risk engine and the factor library — with data lineage attached.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                  {COPILOT_SUGGESTIONS.slice(0, 4).map((s) => (
                    <button key={s} onClick={() => send(s)}
                      className="rounded-[5px] border border-line-subtle bg-bg-secondary px-2.5 py-1.5 text-[11px] text-txt-secondary transition-colors hover:border-line hover:text-txt-primary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mx-auto max-w-[900px] space-y-5">
              {msgs.map((m, i) => (m.role === "user" ? <UserMsg key={i} m={m} /> : <AiMsg key={i} m={m} onAction={onAction} />))}
              {busy && <Thinking step={step} />}
            </div>
          </div>

          <footer className="border-t border-line-subtle bg-bg-secondary/70 p-3 sm:p-4">
            <div className="mx-auto max-w-[900px]">
              <form onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-end gap-2 rounded-[8px] border border-line bg-bg-primary/70 p-2 transition-colors focus-within:border-line-strong">
                <span className="mono pb-1.5 pl-1 text-[11px] text-acc">›</span>
                <textarea
                  value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  rows={1} placeholder="Ask about risk, alpha, exposure, execution or models…"
                  aria-label="Ask the quant copilot"
                  className="max-h-28 min-h-[26px] flex-1 resize-none bg-transparent py-1 text-[12.5px] leading-relaxed text-txt-primary placeholder:text-txt-disabled focus:outline-none"
                />
                <Button type="submit" size="sm" variant="primary" disabled={!input.trim() || busy} icon={CornerDownLeft}>Send</Button>
              </form>
              <p className="mt-2 text-[10px] leading-relaxed text-txt-disabled">
                Copilot responses are generated from simulated desk data for demonstration. Not investment advice. Verify every figure against the source system before acting.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── message renderers ─────────────────────────── */

function Ctx({ icon: Icon, k, v }: { icon: React.ElementType; k: string; v: string }) {
  return (
    <li className="flex items-start gap-2">
      <Icon size={12} className="mt-0.5 shrink-0 text-txt-disabled" strokeWidth={1.6} />
      <span className="min-w-0">
        <span className="block label-xs text-txt-disabled">{k}</span>
        <span className="mono block truncate text-[11px] text-txt-secondary">{v}</span>
      </span>
    </li>
  );
}

function UserMsg({ m }: { m: CopilotMsg }) {
  return (
    <div className="flex justify-end anim-fade-up">
      <div className="max-w-[76%]">
        <div className="mb-1 flex items-center justify-end gap-2">
          <span className="label-xs text-txt-disabled">Quant Desk · {m.ts}</span>
        </div>
        <div className="rounded-[8px] rounded-tr-[2px] border border-line bg-surface-high px-3.5 py-2.5 text-[12.5px] leading-relaxed text-txt-primary">
          {m.text}
        </div>
      </div>
    </div>
  );
}

function Thinking({ step }: { step: number }) {
  return (
    <div className="anim-fade">
      <div className="mb-1.5 flex items-center gap-2">
        <Sparkles size={11} className="text-acc" />
        <span className="label-xs text-acc">Copilot</span>
        <span className="label-xs text-txt-disabled">analysing…</span>
      </div>
      <div className="rounded-[8px] rounded-tl-[2px] border border-line-subtle bg-bg-secondary/60 p-3.5">
        <ol className="space-y-1.5">
          {THINKING.map((t, i) => (
            <li key={t} className={cn("flex items-center gap-2 text-[11.5px] transition-colors duration-200", i < step ? "text-txt-secondary" : i === step ? "text-txt-primary" : "text-txt-disabled")}>
              <span className={cn("h-1 w-1 rounded-full", i < step ? "bg-acc" : i === step ? "bg-acc anim-pulse-dot" : "bg-line-strong")} />
              {t}
              {i < step && <span className="mono ml-auto text-[9.5px] text-txt-disabled">done</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function AiMsg({ m, onAction }: { m: CopilotMsg; onAction: (a: string) => void }) {
  return (
    <div className="anim-fade-up">
      <div className="mb-1.5 flex items-center gap-2">
        <Sparkles size={11} className="text-acc" />
        <span className="label-xs text-acc">Copilot</span>
        <span className="label-xs text-txt-disabled">· research note · {m.ts}</span>
      </div>
      <div className="overflow-hidden rounded-[8px] rounded-tl-[2px] border border-line bg-surface/70">
        <div className="space-y-3.5 p-3.5">
          {m.blocks?.map((b, i) => <Block key={i} b={b} onAction={onAction} />)}
        </div>
      </div>
    </div>
  );
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-[12.5px] leading-relaxed text-txt-secondary">
      {parts.map((p, i) =>
        p.startsWith("**") ? <span key={i} className="mono font-medium text-txt-primary">{p.slice(2, -2)}</span> : <span key={i}>{p}</span>,
      )}
    </p>
  );
}

function Block({ b, onAction }: { b: CopilotBlock; onAction: (a: string) => void }) {
  if (b.kind === "text") return <RichText text={b.text} />;

  if (b.kind === "drivers")
    return (
      <div>
        <div className="mb-2 label-xs text-txt-disabled">Primary drivers</div>
        <ol className="divide-y divide-line-subtle overflow-hidden rounded-[7px] border border-line-subtle">
          {b.items.map((d) => (
            <li key={d.n} className="flex items-start gap-3 bg-bg-secondary/40 px-3 py-2.5">
              <span className="mono mt-0.5 shrink-0 text-[10px] text-txt-disabled">{d.n}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-medium text-txt-primary">{d.title}</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-txt-muted">{d.detail}</span>
              </span>
              <span className={cn("mono shrink-0 text-[11px]", d.tone === "neg" ? "text-neg" : d.tone === "pos" ? "text-pos" : "text-warn")}>{d.delta}</span>
            </li>
          ))}
        </ol>
      </div>
    );

  if (b.kind === "metrics")
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {b.items.map((m) => (
          <div key={m.k} className="rounded-[6px] border border-line-subtle bg-bg-secondary/50 px-2.5 py-2">
            <div className="label-xs truncate text-txt-disabled">{m.k}</div>
            <div className="mono mt-1 text-[14px] text-txt-primary">{m.v}</div>
            {m.d && <div className={cn("mono mt-0.5 text-[10px]", m.tone === "pos" ? "text-pos" : m.tone === "neg" ? "text-neg" : "text-txt-muted")}>{m.d}</div>}
          </div>
        ))}
      </div>
    );

  if (b.kind === "series")
    return (
      <div className="rounded-[7px] border border-line-subtle bg-bg-secondary/40 p-3">
        <div className="mb-2 label-xs text-txt-disabled">{b.title}</div>
        <Sparkline data={b.data} width={820} height={70} tone={b.tone ?? "pos"} strokeWidth={1.1} fluid />
      </div>
    );

  if (b.kind === "table")
    return (
      <div className="overflow-x-auto rounded-[7px] border border-line-subtle">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg-secondary/70">
              {b.head.map((h, i) => (
                <th key={h} className={cn("label-xs whitespace-nowrap border-b border-line-subtle px-3 py-2 text-txt-muted", i > 0 && "text-right")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, ri) => (
              <tr key={ri} className="border-b border-line-subtle/70 last:border-0 hover:bg-surface-hover/40">
                {r.map((c, ci) => (
                  <td key={ci} className={cn("whitespace-nowrap px-3 py-1.5 text-[11.5px]", ci === 0 ? "text-txt-secondary" : "mono text-right",
                    ci > 0 && c.startsWith("+") ? "text-pos" : ci > 0 && (c.startsWith("−") || c.startsWith("-")) ? "text-neg" : "text-txt-primary")}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  if (b.kind === "sources")
    return (
      <div className="border-t border-line-subtle pt-2.5">
        <div className="mb-1.5 label-xs text-txt-disabled">Data lineage</div>
        <ul className="flex flex-wrap gap-1.5">
          {b.items.map((s) => (
            <li key={s} className="mono rounded-[4px] border border-line-subtle bg-bg-secondary/60 px-1.5 py-0.5 text-[10px] text-txt-muted">{s}</li>
          ))}
        </ul>
      </div>
    );

  if (b.kind === "actions")
    return (
      <div className="flex flex-wrap gap-1.5 border-t border-line-subtle pt-3">
        {b.items.map((a, i) => (
          <button key={a} onClick={() => onAction(a)}
            className={cn("group inline-flex items-center gap-1.5 rounded-[5px] border px-2.5 py-1.5 text-[11px] transition-colors",
              i === 0 ? "border-acc/35 bg-acc/8 text-acc hover:bg-acc/14" : "border-line bg-surface-high text-txt-secondary hover:border-line-strong hover:text-txt-primary")}>
            {a}
            <ArrowUpRight size={10} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        ))}
      </div>
    );

  return null;
}
