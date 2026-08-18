import { useMemo, useState } from "react";
import { Activity, AlertTriangle, Bell, CheckCheck, Database, RefreshCw, Server, Zap } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import {
  Badge, Button, ErrorState, Panel, Progress, RiskBadge, SegmentedControl, Skeleton, Toggle, Tooltip, useAsync, useToast,
} from "../components/ui";
import { DataTable, type Column } from "../components/ui/DataTable";
import { MiniArea, Sparkline, C } from "../components/charts";
import { StatCell, TickerCell } from "../components/finance";
import { alertService, dataService, modelService, portfolioService } from "../services";
import type { DataSource } from "../data/quant";
import { sparkOf } from "../data/market";
import { num } from "../lib/format";
import { cn } from "../utils/cn";

/* ═══════════════════════════ DATA QUALITY CENTER ═══════════════════════════ */

export function DataCenter() {
  const sources = useAsync(() => dataService.sources(), []);
  const [showError, setShowError] = useState(false);
  const { push } = useToast();

  const cols: Column<DataSource>[] = useMemo(() => [
    { key: "n", header: "Source", width: "220px", sortable: true, value: (r) => r.name,
      render: (r) => (
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", r.status === "HEALTHY" ? "bg-pos" : r.status === "DEGRADED" ? "bg-warn" : "bg-neg")} />
          <span className="min-w-0">
            <span className="block truncate text-[11.5px] text-txt-primary">{r.name}</span>
            <span className="block truncate text-[10px] text-txt-muted">{r.vendor}</span>
          </span>
        </span>
      ) },
    { key: "c", header: "Category", sortable: true, hideBelow: "md", value: (r) => r.category, render: (r) => <span className="text-[11px] text-txt-muted">{r.category}</span> },
    { key: "s", header: "Status", sortable: true, value: (r) => r.status, render: (r) => <RiskBadge level={r.status} /> },
    { key: "u", header: "Last updated", align: "right", sortable: true, hideBelow: "sm", value: (r) => r.updated, render: (r) => <span className="mono text-[11px] text-txt-secondary">{r.updated}</span> },
    { key: "cov", header: "Coverage", align: "right", sortable: true, value: (r) => r.coverage,
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-10 overflow-hidden rounded-full bg-line-subtle">
            <span className="block h-full rounded-full" style={{ width: `${r.coverage}%`, background: r.coverage > 97 ? C.acc : r.coverage > 90 ? C.warn : C.neg }} />
          </span>
          <span className="mono text-[11px] text-txt-primary">{r.coverage.toFixed(1)}%</span>
        </span>
      ) },
    { key: "m", header: "Missing", align: "right", sortable: true, hideBelow: "md", value: (r) => r.missing,
      render: (r) => <span className={cn("mono text-[11px]", r.missing > 5 ? "text-neg" : r.missing > 1 ? "text-warn" : "text-txt-secondary")}>{r.missing.toFixed(1)}%</span> },
    { key: "l", header: "Latency", align: "right", sortable: true, hideBelow: "lg", value: (r) => r.latency, render: (r) => <span className="mono text-[11px] text-txt-secondary">{r.latency}</span> },
    { key: "r", header: "Volume", align: "right", hideBelow: "lg", render: (r) => <span className="mono text-[11px] text-txt-muted">{r.rows}</span> },
  ], []);

  const healthy = (sources.data ?? []).filter((s) => s.status === "HEALTHY").length;

  return (
    <>
      <PageHeader
        title="Data Quality Center"
        sub="Feed health, freshness, coverage and completeness across market, fundamental, news, macro and alternative data pipelines."
        meta={<><Badge tone="pos" dot>{healthy} healthy</Badge><Badge tone="warn" dot>1 degraded</Badge><Badge tone="neg" dot>1 stale</Badge></>}
        actions={
          <>
            <Toggle checked={showError} onChange={setShowError} label="Simulate feed failure" />
            <Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => push({ title: "Pipelines re-checked", body: "10 sources polled · 1 stale feed persists." })}>Re-check all</Button>
          </>
        }
      />

      {showError && (
        <div className="mb-4">
          <ErrorState
            title="Data feed interrupted"
            body="Alternative data (satellite freight) is currently unavailable. Downstream alpha sleeves are falling back to last-known values, which may degrade signal quality."
            meta="Last successful update: 05:28:19 IST · retry 4 of 8 · vendor Orbital Insight"
            onRetry={() => { setShowError(false); push({ title: "Feed restored", body: "Satellite freight reconnected · backfilling 4h 12m of data." }); }}
          />
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-5">
        <OpsKpi k="Sources monitored" v="10" s="5 categories" />
        <OpsKpi k="Overall coverage" v="96.7%" s="weighted by usage" tone="pos" />
        <OpsKpi k="Freshness SLA" v="98.2%" s="30-day rolling" tone="pos" />
        <OpsKpi k="Open incidents" v="2" s="1 critical" tone="warn" />
        <OpsKpi k="Rows ingested (24h)" v="1.84B" s="+4.2% vs avg" />
      </div>

      <Panel level={3} className="mb-4" title="Source Registry" sub="Live pipeline status · click a row for lineage" bodyClass="p-0">
        {sources.loading || !sources.data ? <Skeleton className="m-3 h-64" /> : (
          <DataTable columns={cols} rows={sources.data} rowKey={(r) => r.name} searchKeys={["name", "category", "vendor"]} defaultSort={{ key: "cov", dir: "desc" }} />
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel level={3} title="Ingestion Throughput" sub="Rows per minute, last 6 hours">
          <MiniArea data={sparkOf(4242, 40, 0.1, 0.18).map((v, i) => ({ d: `${i}`, v: +(v * 120).toFixed(0) }))} color={C.acc2} height={140} format={(v) => `${num(v, 0)}/min`} />
        </Panel>
        <Panel level={3} title="Validation Rules" sub="Automated data contracts">
          <ul className="space-y-2.5">
            {[
              { k: "Schema conformance", v: 100 }, { k: "Null threshold", v: 97 },
              { k: "Outlier detection (5σ)", v: 99 }, { k: "Corporate action reconcile", v: 94 }, { k: "Cross-vendor price parity", v: 99 },
            ].map((r) => (
              <li key={r.k}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11.5px] text-txt-secondary">{r.k}</span>
                  <span className={cn("mono text-[11.5px]", r.v < 96 ? "text-warn" : "text-txt-primary")}>{r.v}%</span>
                </div>
                <div className="mt-1.5"><Progress value={r.v} tone={r.v < 96 ? "warn" : "acc"} height={2} /></div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel level={3} title="Recent Incidents">
          <ol className="space-y-3">
            {[
              { t: "05:28", s: "STALE", m: "Satellite freight feed stopped emitting", tone: "neg" },
              { t: "05:14", s: "DEGRADED", m: "Corporate actions partial load (96.2%)", tone: "warn" },
              { t: "02:11", s: "RESOLVED", m: "Refinitiv L1 latency spike (420ms)", tone: "pos" },
              { t: "01:04", s: "RESOLVED", m: "Fundamentals loader retry succeeded", tone: "pos" },
            ].map((e) => (
              <li key={e.t} className="flex gap-2.5">
                <span className="mono shrink-0 pt-0.5 text-[10.5px] text-txt-disabled">{e.t}</span>
                <span className="min-w-0">
                  <RiskBadge level={e.s === "RESOLVED" ? "HEALTHY" : e.s} />
                  <span className="mt-1 block text-[11px] leading-relaxed text-txt-muted">{e.m}</span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}

/* ═══════════════════════════════ ALERTS ═══════════════════════════════ */

const SEVERITIES = ["All", "Critical", "Warning", "Info"] as const;

export function Alerts() {
  const [sev, setSev] = useState<(typeof SEVERITIES)[number]>("All");
  const [acked, setAcked] = useState<Set<string>>(new Set());
  const alerts = useAsync(() => alertService.list(), []);
  const { push } = useToast();

  const list = (alerts.data ?? []).filter((a) => sev === "All" || a.severity === sev.toUpperCase());

  return (
    <>
      <PageHeader
        title="Alerts"
        sub="Risk breaches, alpha decay, model drift and regime transitions — routed by severity to the desk, risk committee and MLOps."
        meta={<><Badge tone="neg" dot>2 critical</Badge><Badge tone="warn" dot>3 warnings</Badge><Badge tone="info" dot>3 info</Badge></>}
        actions={
          <>
            <SegmentedControl options={SEVERITIES} value={sev} onChange={setSev} ariaLabel="Severity filter" />
            <Button size="sm" variant="secondary" icon={CheckCheck}
              onClick={() => { setAcked(new Set((alerts.data ?? []).map((a) => a.id))); push({ title: "All alerts acknowledged", body: "8 alerts marked as reviewed by A. Kulkarni." }); }}>
              Acknowledge all
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <OpsKpi k="Open alerts" v={String(8 - acked.size)} s="of 8 total" tone={acked.size === 8 ? "pos" : "warn"} />
        <OpsKpi k="Mean time to ack" v="4m 12s" s="30-day rolling" />
        <OpsKpi k="Breaches (30d)" v="3" s="all remediated" />
        <OpsKpi k="Escalations" v="1" s="risk committee" tone="warn" />
      </div>

      <div className="space-y-2">
        {alerts.loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)
          : list.map((a) => {
              const isAck = a.ack || acked.has(a.id);
              return (
                <article key={a.id}
                  className={cn(
                    "group grid grid-cols-1 gap-3 rounded-[8px] border bg-surface/50 px-3.5 py-3 transition-all duration-200 md:grid-cols-[auto_1fr_auto]",
                    isAck ? "border-line-subtle opacity-60" : a.severity === "CRITICAL" ? "border-neg/35" : a.severity === "WARNING" ? "border-warn/30" : "border-line-subtle",
                  )}>
                  <div className="flex items-center gap-2.5 md:flex-col md:items-start md:gap-1.5 md:pt-0.5">
                    <RiskBadge level={a.severity} />
                    <span className="mono text-[10px] text-txt-disabled">{a.id}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="text-[13px] font-medium text-txt-primary">{a.title}</h3>
                      <span className="mono text-[10px] text-txt-disabled">{a.source}</span>
                    </div>
                    <p className="mt-1 max-w-[80ch] text-[11.5px] leading-relaxed text-txt-secondary">{a.body}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 md:flex-col md:items-end">
                    <span className="mono text-[10.5px] text-txt-muted">{a.time} IST</span>
                    {isAck ? <span className="label-xs text-txt-disabled">✓ Acknowledged</span> : (
                      <Button size="xs" variant="outline" onClick={() => setAcked((s) => new Set(s).add(a.id))}>Acknowledge</Button>
                    )}
                  </div>
                </article>
              );
            })}
        {!alerts.loading && list.length === 0 && (
          <Panel level={3}><div className="px-4 py-12 text-center"><Bell size={18} className="mx-auto text-txt-disabled" /><p className="mt-2 text-[12px] text-txt-secondary">No {sev.toLowerCase()} alerts</p><p className="mt-1 text-[11px] text-txt-muted">All monitored thresholds are currently within tolerance.</p></div></Panel>
        )}
      </div>
    </>
  );
}

/* ═════════════════════════════ MONITORING ═════════════════════════════ */

export function Monitoring() {
  const services = useAsync(() => modelService.services(), []);
  return (
    <>
      <PageHeader
        title="Platform Monitoring"
        sub="Service health, latency budgets and job scheduling across the QUANTX estate."
        meta={<><Badge tone="pos" dot>7 operational</Badge><Badge tone="warn" dot>1 degraded</Badge><Badge tone="neu">ap-south-1 / colo-mumbai</Badge></>}
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <OpsKpi k="Composite uptime" v="99.87%" s="30-day" tone="pos" />
        <OpsKpi k="Error budget left" v="62%" s="monthly SLO" />
        <OpsKpi k="p99 latency" v="620ms" s="copilot inference" />
        <OpsKpi k="Jobs today" v="184" s="3 failed, retried" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Panel level={3} className="lg:col-span-7" title="Services" sub="Live health and latency" bodyClass="p-0">
          {services.loading || !services.data ? <Skeleton className="m-3 h-64" /> : (
            <ul>
              {services.data.map((s, i) => (
                <li key={s.name} className="flex items-center gap-3 border-b border-line-subtle px-3.5 py-2.5 last:border-0 hover:bg-surface-hover/40">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.status === "OPERATIONAL" ? "bg-pos" : "bg-warn")} />
                  <span className="min-w-0 flex-1">
                    <span className="mono block truncate text-[11.5px] text-txt-primary">{s.name}</span>
                    <span className="block truncate text-[10px] text-txt-muted">{s.region}</span>
                  </span>
                  <Sparkline data={sparkOf(600 + i * 13, 20, 0.02, 0.06)} width={64} height={18} tone={s.status === "OPERATIONAL" ? "pos" : "neg"} fill={false} animate={false} strokeWidth={0.9} />
                  <span className="mono w-14 shrink-0 text-right text-[11px] text-txt-secondary">{s.uptime.toFixed(2)}%</span>
                  <span className="mono hidden w-14 shrink-0 text-right text-[11px] text-txt-muted sm:block">{s.p99}</span>
                  <span className="hidden shrink-0 sm:block"><RiskBadge level={s.status} /></span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="grid content-start gap-3 lg:col-span-5">
          <Panel level={3} title="Scheduled Jobs" sub="Next 24 hours">
            <ul className="space-y-2.5">
              {[
                { t: "18:00", j: "EOD marks & NAV strike", s: "PENDING" },
                { t: "20:30", j: "Fundamentals delta load", s: "PENDING" },
                { t: "22:00", j: "Factor re-estimation", s: "PENDING" },
                { t: "02:00", j: "Alpha-XGB nightly retrain", s: "PENDING" },
                { t: "05:45", j: "Pre-open universe refresh", s: "PENDING" },
              ].map((r) => (
                <li key={r.t} className="flex items-center justify-between gap-2 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="mono shrink-0 text-[10.5px] text-txt-muted">{r.t}</span>
                    <span className="truncate text-[11.5px] text-txt-secondary">{r.j}</span>
                  </span>
                  <Badge tone="neu">{r.s}</Badge>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel level={3} title="Resource Utilisation">
            <ul className="space-y-3">
              {[{ k: "Compute (vCPU)", v: 64 }, { k: "Memory", v: 58 }, { k: "GPU (inference)", v: 41 }, { k: "Lakehouse storage", v: 72 }, { k: "Network egress", v: 28 }].map((r) => (
                <li key={r.k}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] text-txt-secondary">{r.k}</span>
                    <span className="mono text-[11.5px] text-txt-primary">{r.v}%</span>
                  </div>
                  <div className="mt-1.5"><Progress value={r.v} tone={r.v > 80 ? "warn" : "acc2"} height={2} /></div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════ EXECUTION ══════════════════════════════ */

export function Execution() {
  const fills = useAsync(() => portfolioService.executions(), []);
  return (
    <>
      <PageHeader
        title="Execution"
        sub="Order blotter, algo performance and implementation shortfall for the current session. Paper environment — no orders reach the street."
        meta={<><Badge tone="warn" dot>PAPER TRADING</Badge><Badge tone="neu">OMS colo-mumbai</Badge><Badge tone="neu">8 orders today</Badge></>}
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-5">
        <OpsKpi k="Orders" v="8" s="6 filled · 1 partial" />
        <OpsKpi k="Notional traded" v="₹1.42 Cr" s="1.36% of NAV" />
        <OpsKpi k="Avg slippage" v="−0.03%" s="vs arrival price" tone="pos" />
        <OpsKpi k="Impl. shortfall" v="₹1.24 L" s="incl. costs" />
        <OpsKpi k="Fill rate" v="96.4%" s="volume-weighted" tone="pos" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Panel level={3} className="xl:col-span-8" title="Order Blotter" sub="Session fills, 22 Aug 2026" bodyClass="p-0">
          {fills.loading || !fills.data ? <Skeleton className="m-3 h-64" /> : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-bg-secondary/95">
                    {["Time", "Instrument", "Side", "Qty", "Price", "Algo", "Slippage", "Status"].map((h, i) => (
                      <th key={h} className={cn("label-xs whitespace-nowrap border-b border-line px-2.5 py-2 text-txt-muted", i > 2 && "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fills.data.map((f) => (
                    <tr key={f.time} className="border-b border-line-subtle/70 transition-colors hover:bg-surface-hover/50">
                      <td className="mono whitespace-nowrap px-2.5 py-1.5 text-[11px] text-txt-muted">{f.time}</td>
                      <td className="px-2.5 py-1.5"><TickerCell ticker={f.ticker} /></td>
                      <td className="px-2.5 py-1.5">
                        <span className={cn("label-xs", f.side === "BUY" ? "text-pos" : "text-neg")}>{f.side === "BUY" ? "▲ BUY" : "▼ SELL"}</span>
                      </td>
                      <td className="mono px-2.5 py-1.5 text-right text-[11px] text-txt-secondary">{num(f.qty, 0)}</td>
                      <td className="mono px-2.5 py-1.5 text-right text-[11.5px] text-txt-primary">₹{num(f.px, 2)}</td>
                      <td className="mono px-2.5 py-1.5 text-right text-[11px] text-txt-muted">{f.algo}</td>
                      <td className={cn("mono px-2.5 py-1.5 text-right text-[11px]", f.slip <= 0 ? "text-pos" : "text-neg")}>{f.slip >= 0 ? "+" : "−"}{Math.abs(f.slip).toFixed(2)}%</td>
                      <td className="px-2.5 py-1.5 text-right"><RiskBadge level={f.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="grid content-start gap-3 xl:col-span-4">
          <Panel level={3} title="Algo Performance" sub="Slippage vs arrival, 30-day">
            <ul className="space-y-2.5">
              {[{ a: "VWAP", v: -0.04, n: 142 }, { a: "TWAP", v: 0.02, n: 96 }, { a: "POV 8%", v: -0.08, n: 61 }, { a: "Implementation Shortfall", v: 0.01, n: 44 }].map((r) => (
                <li key={r.a} className="flex items-center justify-between gap-2 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
                  <span className="min-w-0">
                    <span className="block truncate text-[11.5px] text-txt-secondary">{r.a}</span>
                    <span className="block text-[10px] text-txt-disabled">{r.n} orders</span>
                  </span>
                  <span className={cn("mono shrink-0 text-[11.5px]", r.v <= 0 ? "text-pos" : "text-neg")}>{r.v >= 0 ? "+" : "−"}{Math.abs(r.v).toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel level={3} title="Market Impact Model" sub="Exec-Impact-Net v0.9.3 (shadow)">
            <div className="grid grid-cols-2 gap-3">
              <StatCell k="Predicted" v="8.4 bps" />
              <StatCell k="Realised" v="7.1 bps" tone="pos" />
              <StatCell k="Model error" v="−1.3 bps" tone="pos" />
              <StatCell k="Participation" v="12.4%" />
            </div>
            <div className="mt-3 flex items-start gap-2 border-t border-line-subtle pt-2.5">
              <Zap size={11} className="mt-0.5 shrink-0 text-txt-muted" />
              <p className="text-[10.5px] leading-relaxed text-txt-muted">Shadow model outperformed the production linear estimate on 68% of parent orders this month.</p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════ SETTINGS ══════════════════════════════ */

export function Settings() {
  const [dense, setDense] = useState(true);
  const [motion, setMotion] = useState(true);
  const [sound, setSound] = useState(false);
  const [live, setLive] = useState(false);
  const { push } = useToast();

  return (
    <>
      <PageHeader title="Settings" sub="Workspace preferences, environment control, risk thresholds and notification routing." />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <Panel level={3} title="Environment" tone={live ? "neg" : undefined}>
          <div className="flex items-start gap-3 rounded-[6px] border border-warn/25 bg-warn/6 px-3 py-2.5">
            <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warn" />
            <div>
              <p className="label-xs text-warn">Paper trading active</p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-txt-secondary">Orders are simulated against the consolidated tape. No capital is at risk.</p>
            </div>
          </div>
          <div className="mt-3 space-y-2.5">
            <Toggle checked={live} onChange={(v) => { if (v) { push({ title: "Live trading blocked", body: "Requires desk-head approval and hardware 2FA.", tone: "neg" }); return; } setLive(v); }} label="Enable live trading" />
            <Toggle checked={sound} onChange={setSound} label="Audible breach alerts" />
          </div>
        </Panel>

        <Panel level={3} title="Interface">
          <div className="space-y-2.5">
            <Toggle checked={dense} onChange={setDense} label="Dense table mode by default" />
            <Toggle checked={motion} onChange={setMotion} label="Chart & number animations" />
          </div>
          <div className="mt-3 border-t border-line-subtle pt-3">
            <div className="mb-1.5 label-xs text-txt-disabled">Number format</div>
            <SegmentedControl options={["Indian (Cr / L)", "International (M / B)"] as const} value="Indian (Cr / L)" onChange={() => {}} ariaLabel="Number format" />
          </div>
          <div className="mt-3">
            <div className="mb-1.5 label-xs text-txt-disabled">Base currency</div>
            <SegmentedControl options={["INR", "USD"] as const} value="INR" onChange={() => {}} ariaLabel="Base currency" />
          </div>
        </Panel>

        <Panel level={3} title="Risk Thresholds" sub="Applied to the Multi-Strat Core mandate">
          <ul className="space-y-2.5">
            {[["Max single-name weight", "10.0%"], ["Max sector weight", "25.0%"], ["Portfolio beta cap", "1.10"], ["Daily VaR limit (95%)", "2.30% of NAV"], ["Max drawdown alert", "−12.0%"], ["Liquidity (days to exit)", "5.0d"]].map(([k, v]) => (
              <li key={k} className="flex items-baseline justify-between gap-2 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
                <span className="text-[11.5px] text-txt-secondary">{k}</span>
                <span className="mono text-[11.5px] text-txt-primary">{v}</span>
              </li>
            ))}
          </ul>
          <Button size="xs" variant="outline" className="mt-3">Request threshold change</Button>
        </Panel>

        <Panel level={3} title="Notification Routing">
          <ul className="space-y-2.5">
            {[["Critical breaches", "Desk + Risk committee + SMS"], ["Warnings", "Desk + email digest"], ["Model drift", "MLOps channel"], ["Data incidents", "Data platform on-call"], ["Backtest completion", "In-app only"]].map(([k, v]) => (
              <li key={k} className="flex items-baseline justify-between gap-3 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
                <span className="shrink-0 text-[11.5px] text-txt-secondary">{k}</span>
                <span className="truncate text-right text-[10.5px] text-txt-muted">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel level={3} title="Session & Access">
          <ul className="space-y-2.5">
            {[["User", "A. Kulkarni"], ["Role", "Portfolio Manager"], ["Desk", "Multi-Strat 04"], ["Entitlements", "NSE L1, BSE L1, Global L1"], ["MFA", "Hardware key · enrolled"], ["Session started", "08:42:11 IST"]].map(([k, v]) => (
              <li key={k} className="flex items-baseline justify-between gap-2 border-b border-line-subtle pb-2.5 last:border-0 last:pb-0">
                <span className="text-[11.5px] text-txt-secondary">{k}</span>
                <span className="mono truncate text-[11px] text-txt-primary">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel level={3} title="About">
          <ul className="space-y-2">
            {[["Build", "quantx-web 4.2.0"], ["API", "v3 · ap-south-1"], ["Design system", "QUANTX DS 2.1"], ["Data", "Simulated / demonstration"]].map(([k, v]) => (
              <li key={k} className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-txt-muted">{k}</span>
                <span className="mono text-[10.5px] text-txt-secondary">{v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-line-subtle pt-2.5 text-[10.5px] leading-relaxed text-txt-muted">
            All figures in this environment are synthetic and generated deterministically for demonstration. Nothing here constitutes investment advice.
          </p>
          <div className="mt-3 flex items-center gap-3 text-txt-disabled">
            <Tooltip content="Data platform"><Database size={13} /></Tooltip>
            <Tooltip content="Compute"><Server size={13} /></Tooltip>
            <Tooltip content="Telemetry"><Activity size={13} /></Tooltip>
          </div>
        </Panel>
      </div>
    </>
  );
}

function OpsKpi({ k, v, s, tone }: { k: string; v: string; s: string; tone?: "pos" | "warn" | "neg" }) {
  return (
    <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
      <div className="label-xs truncate text-txt-muted">{k}</div>
      <div className={cn("tnum mt-1 text-[18px] font-semibold leading-none", tone === "pos" ? "text-pos" : tone === "warn" ? "text-warn" : tone === "neg" ? "text-neg" : "text-txt-primary")}>{v}</div>
      <div className="mt-1.5 truncate text-[10px] text-txt-disabled">{s}</div>
    </div>
  );
}
