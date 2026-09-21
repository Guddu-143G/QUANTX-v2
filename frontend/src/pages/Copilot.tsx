import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight, Atom, Braces, ChevronDown, ChevronRight, CornerDownLeft, Cpu, Database,
  FileText, FlaskConical, Layers, Radio, Scale, ShieldAlert, Sparkles, Terminal,
} from "lucide-react";
import { Badge, Button, Panel, StatusIndicator, useToast } from "../components/ui";
import { Sparkline } from "../components/charts";
import { copilotService } from "../services";
import { AGENT_PROFILES, COPILOT_SEED, COPILOT_SUGGESTIONS, type CopilotBlock, type CopilotMsg } from "../data/quant";
import { cn } from "../utils/cn";
import { timeIST } from "../lib/format";
import { useRouter } from "../lib/router";

const THINKING_STEPS = [
  "C&C Router parsing query intent",
  "Resolving portfolio & factor context",
  "Dispatching tool calls to domain agents",
  "Computing mathematical bounds & risks",
  "Synthesizing structured LaTeX brief",
];

const AGENT_ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  ShieldAlert,
  FlaskConical,
  Scale,
  Atom,
  FileText,
};

export default function Copilot() {
  const [msgs, setMsgs] = useState<CopilotMsg[]>(COPILOT_SEED);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("auto");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const { push } = useToast();

  useEffect(() => {
    const q = sessionStorage.getItem("qx-copilot-ask");
    if (q) {
      sessionStorage.removeItem("qx-copilot-ask");
      setTimeout(() => send(q), 300);
    }
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
    const t = setInterval(() => setStep((s) => Math.min(THINKING_STEPS.length - 1, s + 1)), 180);

    const targetId = selectedAgentId === "auto" ? undefined : selectedAgentId;
    const response = await copilotService.ask(text, targetId);
    clearInterval(t);
    setBusy(false);
    setMsgs((m) => [
      ...m,
      {
        role: "ai",
        blocks: response.blocks,
        ts: timeIST().slice(0, 5),
        agent_id: response.agent.id,
        agent_name: response.agent.name,
        agent_role: response.agent.role,
      },
    ]);
  };

  const onAction = (a: string) => {
    const map: Record<string, string> = {
      "View Risk Attribution": "/risk",
      "Run Stress Test": "/risk",
      "Open Portfolio": "/portfolio",
      "Open Alpha Lab": "/research/alpha",
      "Open Dashboard": "/dashboard",
      "Send to Optimizer": "/portfolio/optimizer",
      "Open Performance Chart": "/dashboard",
      "Open Stress Testing": "/risk",
      "Open Drawdown Analysis": "/backtest",
      "View Attribution": "/backtest",
      "Compare vs Benchmark": "/dashboard",
      "Rebalance Factor Weights": "/research/alpha",
      "Stage Rate Hedge": "/ops",
      "Stage Orders": "/ops",
      "Disable Liquidity Sleeve": "/research/alpha",
      "Export Tearsheet": "/backtest",
      "Export Scenario Report": "/risk",
    };
    if (map[a]) {
      navigate(map[a]);
    } else {
      push({
        title: `Action Dispatched — ${a}`,
        body: "Instruction logged and sent to live execution queue.",
        tone: "pos",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
      {/* ── Context rail & Multi-Agent Network Status ── */}
      <aside className="hidden content-start gap-3 xl:col-span-3 xl:flex xl:flex-col xl:h-[calc(100vh-9.5rem)] xl:overflow-y-auto xl:pr-1">
        <Panel level={3} title="Multi-Agent Mesh" sub="Autonomous quantitative network">
          <ul className="space-y-2">
            {AGENT_PROFILES.map((ag) => {
              const Icon = AGENT_ICON_MAP[ag.icon] || Cpu;
              const isSelected = selectedAgentId === ag.id;
              return (
                <li
                  key={ag.id}
                  onClick={() => setSelectedAgentId(ag.id)}
                  className={cn(
                    "flex items-start justify-between gap-2 rounded-[6px] border p-2 transition cursor-pointer",
                    isSelected
                      ? "border-acc bg-acc/10 shadow-sm"
                      : "border-line-subtle bg-surface-2 hover:border-line hover:bg-surface-hover"
                  )}
                  title={`Click to route queries to ${ag.name}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon size={13} className={cn("mt-0.5 shrink-0", isSelected ? "text-acc" : "text-txt-muted")} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-[11px] font-medium", isSelected ? "text-acc font-semibold" : "text-txt-primary")}>{ag.name}</span>
                        <span className="mono text-[9px] text-txt-disabled">({ag.latency})</span>
                      </div>
                      <div className="text-[9.5px] text-txt-muted">{ag.role}</div>
                    </div>
                  </div>
                  <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", isSelected ? "bg-acc anim-pulse-dot" : "bg-acc/70")} title="Agent Online" />
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel level={3} title="Session Grounding" sub="Real-time multi-tenant data context">
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
      </aside>

      {/* ── Conversation & Orchestration Center ── */}
      <div className="xl:col-span-9">
        <div className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface/40 h-[calc(100vh-9.5rem)] min-h-[580px]">
          <header className="border-b border-line-subtle bg-bg-secondary/70 px-4 py-3 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-acc/25 bg-acc/8">
                  <Sparkles size={15} className="text-acc" strokeWidth={1.6} />
                </span>
                <div>
                  <h1 className="text-[13px] font-bold tracking-[0.14em] text-txt-primary">QUANT MULTI-AGENT COPILOT</h1>
                  <div className="mt-0.5 flex items-center gap-2">
                    <StatusIndicator tone="pos" label="6 Specialized Agents Online" />
                    <span className="text-[10px] text-txt-disabled">·</span>
                    <span className="label-xs text-pos font-medium">FastAPI Live Engine (8001)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge tone="pos" dot>LIVE BACKEND CONNECTED</Badge>
                <Badge tone="neu" dot>{msgs.filter((m) => m.role === "ai").length} research notes</Badge>
                <Button size="xs" variant="ghost" onClick={() => setMsgs([])}>Clear</Button>
              </div>
            </div>

            {/* Agent Router Filter Tabs */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line-subtle/60 pt-2.5">
              <span className="mr-1 text-[10px] font-medium text-txt-disabled uppercase tracking-wider">Target:</span>
              <button
                onClick={() => setSelectedAgentId("auto")}
                className={cn("rounded-[5px] px-2 py-1 text-[11px] transition", selectedAgentId === "auto" ? "bg-acc text-bg font-semibold" : "bg-surface-2 text-txt-secondary hover:text-txt-primary")}
              >
                Auto-Router (C&C)
              </button>
              {AGENT_PROFILES.map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgentId(ag.id)}
                  className={cn("rounded-[5px] px-2 py-1 text-[11px] transition", selectedAgentId === ag.id ? "bg-acc text-bg font-semibold" : "bg-surface-2 text-txt-secondary hover:text-txt-primary")}
                >
                  {ag.name}
                </button>
              ))}
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
            {msgs.length === 0 && (
              <div className="mx-auto max-w-[560px] py-14 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[9px] border border-line bg-bg-secondary">
                  <Radio size={17} className="text-txt-muted" strokeWidth={1.4} />
                </span>
                <h2 className="mt-4 text-[15px] font-semibold text-txt-primary">Ask the Multi-Agent Research Engine</h2>
                <p className="mx-auto mt-1.5 max-w-[420px] text-[12px] leading-relaxed text-txt-muted">
                  Queries are decomposed by the C&C Router and dispatched to specialized agents across Risk, AlphaLab, Convex Optimization, and Backtesting with verifiable tool call traces.
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

          <footer className="border-t border-line-subtle bg-bg-secondary/70 p-3 sm:p-4 shrink-0">
            <div className="mx-auto max-w-[900px]">
              <form onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-end gap-2 rounded-[8px] border border-line bg-bg-primary/70 p-2 transition-colors focus-within:border-line-strong">
                <span className="mono pb-1.5 pl-1 text-[11px] text-acc">›</span>
                <textarea
                  value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  rows={1} placeholder="Ask about tail risk, alpha decay, optimal trim, or rate shocks…"
                  aria-label="Ask the quant copilot"
                  className="max-h-28 min-h-[26px] flex-1 resize-none bg-transparent py-1 text-[12.5px] leading-relaxed text-txt-primary placeholder:text-txt-disabled focus:outline-none"
                />
                <Button type="submit" size="sm" variant="primary" disabled={!input.trim() || busy} icon={CornerDownLeft}>Dispatch</Button>
              </form>
              <p className="mt-2 text-[10px] leading-relaxed text-txt-disabled">
                Multi-agent responses are synthesized from verified portfolio databases and quantitative engines. Always verify mandate limits prior to trade execution.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Message Renderers ─────────────────────────── */

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
        <span className="label-xs text-acc">Router Orchestrator</span>
        <span className="label-xs text-txt-disabled">executing multi-agent pipeline…</span>
      </div>
      <div className="rounded-[8px] rounded-tl-[2px] border border-line-subtle bg-bg-secondary/60 p-3.5">
        <ol className="space-y-1.5">
          {THINKING_STEPS.map((t, i) => (
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
  const agentName = m.agent_name || "Quant Copilot";
  const agentRole = m.agent_role || "Research Synthesis";

  return (
    <div className="anim-fade-up">
      <div className="mb-1.5 flex items-center gap-2">
        <Sparkles size={11} className="text-acc" />
        <span className="label-xs text-acc font-semibold">{agentName}</span>
        <span className="label-xs text-txt-muted">· {agentRole}</span>
        <span className="label-xs text-txt-disabled">· {m.ts}</span>
      </div>
      <div className="overflow-hidden rounded-[8px] rounded-tl-[2px] border border-line bg-surface/70 shadow-lg">
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

function ToolCallInspector({ b }: { b: Extract<CopilotBlock, { kind: "tool_call" }> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-[7px] border border-acc/20 bg-bg-primary/80">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-surface-2/80 px-3 py-2 text-left transition hover:bg-surface-hover"
      >
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-acc" />
          <span className="mono text-[11px] font-semibold text-acc">{b.tool_name}</span>
          <span className="text-[10px] text-txt-disabled">
            ({b.invoker_agent} → {b.target_agent})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="pos">SUCCESS 200</Badge>
          {open ? <ChevronDown size={13} className="text-txt-muted" /> : <ChevronRight size={13} className="text-txt-muted" />}
        </div>
      </button>

      {open && (
        <div className="divide-y divide-line-subtle border-t border-line-subtle p-3 space-y-2">
          <div>
            <div className="mb-1 label-xs text-txt-muted">Call ID & Invocation Parameters</div>
            <pre className="overflow-x-auto rounded-[5px] bg-bg-secondary p-2 mono text-[10px] text-txt-secondary">
              {JSON.stringify({ call_id: b.call_id, parameters: b.parameters }, null, 2)}
            </pre>
          </div>
          <div className="pt-2">
            <div className="mb-1 label-xs text-txt-muted">Execution Output Payload</div>
            <pre className="overflow-x-auto rounded-[5px] bg-bg-secondary p-2 mono text-[10px] text-txt-secondary">
              {JSON.stringify(b.response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function LatexFormulaCard({ b }: { b: Extract<CopilotBlock, { kind: "latex_formula" }> }) {
  return (
    <div className="rounded-[7px] border border-line-subtle bg-bg-secondary/70 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-xs text-txt-disabled">Mathematical Formulation</span>
        <span className="mono text-[9.5px] text-acc">LaTeX Grounded</span>
      </div>
      <div className="overflow-x-auto py-1 font-mono text-[12px] text-txt-primary tracking-wide">
        {b.formula}
      </div>
      {b.explanation && (
        <p className="mt-1 text-[10.5px] text-txt-muted italic">{b.explanation}</p>
      )}
    </div>
  );
}

function Block({ b, onAction }: { b: CopilotBlock; onAction: (a: string) => void }) {
  if (b.kind === "text") return <RichText text={b.text} />;

  if (b.kind === "tool_call") return <ToolCallInspector b={b} />;

  if (b.kind === "latex_formula") return <LatexFormulaCard b={b} />;

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
        <div className="mb-1.5 label-xs text-txt-disabled">Data lineage & Model citations</div>
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
