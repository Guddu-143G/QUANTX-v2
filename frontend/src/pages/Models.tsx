import { useState } from "react";
import { Boxes, GitBranch, RefreshCw, Upload } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, Panel, Progress, RiskBadge, SegmentedControl, Skeleton, useAsync, useToast } from "../components/ui";
import { MiniArea, C } from "../components/charts";
import { ModelCard, StatCell } from "../components/finance";
import { modelService } from "../services";
import type { Model } from "../data/quant";
import { cn } from "../utils/cn";

const FILTERS = ["All", "Production", "Staging", "Shadow"] as const;

export default function Models() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sel, setSel] = useState<Model | null>(null);
  const models = useAsync(() => modelService.list(), []);
  const { push } = useToast();

  const list = (models.data ?? []).filter((m) => filter === "All" || m.status === filter.toUpperCase());
  const active = sel ?? list[0] ?? null;

  return (
    <>
      <PageHeader
        title="Model Monitoring"
        sub="Production ML registry — versioning, drift surveillance, latency budgets and deployment lineage across the alpha, risk and execution stacks."
        meta={
          <>
            <Badge tone="pos" dot>5 in production</Badge>
            <Badge tone="warn" dot>1 drift alert</Badge>
            <Badge tone="neu">Registry v2.8</Badge>
          </>
        }
        actions={
          <>
            <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Model status filter" />
            <Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => push({ title: "Registry synced", body: "8 models · 0 schema changes detected." })}>Sync</Button>
            <Button size="sm" variant="primary" icon={Upload}>Deploy candidate</Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-5">
        <Kpi k="Models registered" v="8" s="across 5 desks" />
        <Kpi k="In production" v="5" s="99.94% uptime" tone="pos" />
        <Kpi k="Mean inference" v="34ms" s="p99 620ms" />
        <Kpi k="Drift alerts (7d)" v="1" s="Exec-Impact-Net" tone="warn" />
        <Kpi k="Retrains this month" v="6" s="2 scheduled" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            {models.loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[190px]" />)
              : list.map((m) => <ModelCard key={m.name} m={m} onClick={() => setSel(m)} />)}
          </div>
        </div>

        <div className="grid content-start gap-3 xl:col-span-4">
          {!active ? <Skeleton className="h-72" /> : (
            <>
              <Panel level={3} title="Model Detail" sub={`${active.name} · v${active.version}`}
                actions={<RiskBadge level={active.status} />}>
                <div className="mb-3 h-16 rounded-[6px] border border-line-subtle bg-bg-secondary/50 p-1.5">
                  <MiniArea data={active.series.map((v, i) => ({ d: `T-${active.series.length - i}`, v: +v.toFixed(2) }))}
                    color={active.drift === "HIGH" ? C.neg : C.acc} height={56} />
                </div>
                <dl className="space-y-2">
                  {[
                    ["Architecture", active.type], ["Owner", active.owner], ["Version", `v${active.version}`],
                    ["Training data", active.rows], ["Features", `${active.features}`],
                    ["Last trained", active.trained], ["Last deployment", active.deployed],
                    ["Inference latency", active.latency],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-2 border-b border-line-subtle pb-2 last:border-0 last:pb-0">
                      <dt className="text-[11.5px] text-txt-muted">{k}</dt>
                      <dd className="mono truncate text-[11.5px] text-txt-primary">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line-subtle pt-3">
                  <StatCell k="Sharpe" v={active.sharpe ? active.sharpe.toFixed(2) : "—"} tone={active.sharpe > 1.5 ? "pos" : undefined} />
                  <StatCell k="Accuracy" v={active.accuracy ? `${active.accuracy}%` : "—"} />
                  <StatCell k="Drift" v={active.drift} tone={active.drift === "HIGH" ? "neg" : active.drift === "MEDIUM" ? "warn" : "pos"} />
                </div>
              </Panel>

              <Panel level={3} title="Drift Surveillance" sub="Population stability index by feature group">
                <ul className="space-y-3">
                  {[
                    { f: "Price / momentum", psi: 0.06 }, { f: "Volume profile", psi: 0.18 },
                    { f: "Fundamentals", psi: 0.04 }, { f: "Sentiment embeddings", psi: 0.11 },
                    { f: "Macro regime", psi: 0.08 },
                  ].map((r) => (
                    <li key={r.f}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11.5px] text-txt-secondary">{r.f}</span>
                        <span className={cn("mono text-[11.5px]", r.psi > 0.15 ? "text-neg" : r.psi > 0.1 ? "text-warn" : "text-txt-primary")}>PSI {r.psi.toFixed(2)}</span>
                      </div>
                      <div className="mt-1.5"><Progress value={(r.psi / 0.25) * 100} tone={r.psi > 0.15 ? "neg" : r.psi > 0.1 ? "warn" : "acc"} height={2} /></div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-line-subtle pt-2.5 text-[10.5px] leading-relaxed text-txt-muted">
                  Volume-profile inputs breached the 0.15 PSI threshold. A retrain is scheduled for <span className="mono text-txt-secondary">25 Aug 2026, 02:00 IST</span>.
                </p>
              </Panel>

              <Panel level={3} title="Deployment Lineage" bodyClass="p-0">
                <ol className="relative px-3.5 py-3">
                  <span className="absolute left-[22px] top-4 bottom-4 w-px bg-line-subtle" aria-hidden />
                  {[
                    { v: "v3.2.1", d: "21 Aug 2026", s: "Promoted to production", tone: "pos" },
                    { v: "v3.2.0", d: "19 Aug 2026", s: "Shadow validation passed", tone: "info" },
                    { v: "v3.1.4", d: "02 Aug 2026", s: "Rolled back — latency regression", tone: "neg" },
                    { v: "v3.1.3", d: "28 Jul 2026", s: "Promoted to production", tone: "pos" },
                  ].map((e) => (
                    <li key={e.v} className="relative flex gap-3 pb-3.5 pl-0 last:pb-0">
                      <span className={cn("z-10 mt-1 flex h-2 w-2 shrink-0 rounded-full ring-4 ring-surface",
                        e.tone === "pos" ? "bg-acc" : e.tone === "neg" ? "bg-neg" : "bg-acc2")} />
                      <span className="min-w-0">
                        <span className="flex items-baseline gap-2">
                          <span className="mono text-[11.5px] text-txt-primary">{e.v}</span>
                          <span className="text-[10px] text-txt-disabled">{e.d}</span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-txt-muted">{e.s}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="flex items-center gap-1.5 border-t border-line-subtle px-3.5 py-2">
                  <GitBranch size={10} className="text-txt-disabled" />
                  <span className="mono text-[10px] text-txt-muted">main · commit 8f3c21a · CI #4182</span>
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-line-subtle bg-surface/40 px-4 py-3">
        <Boxes size={13} className="text-txt-muted" strokeWidth={1.6} />
        <p className="text-[11px] text-txt-muted">
          All models are evaluated on strictly out-of-sample windows with purged, embargoed cross-validation to prevent look-ahead leakage.
        </p>
      </div>
    </>
  );
}

function Kpi({ k, v, s, tone }: { k: string; v: string; s: string; tone?: "pos" | "warn" }) {
  return (
    <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
      <div className="label-xs truncate text-txt-muted">{k}</div>
      <div className={cn("tnum mt-1 text-[18px] font-semibold leading-none", tone === "pos" ? "text-pos" : tone === "warn" ? "text-warn" : "text-txt-primary")}>{v}</div>
      <div className="mt-1.5 truncate text-[10px] text-txt-disabled">{s}</div>
    </div>
  );
}
