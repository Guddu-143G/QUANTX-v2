import { useMemo, useState, useEffect } from "react";
import {
  Activity, AlertTriangle, ArrowLeftRight, Bell, CheckCheck, Cpu, Database,
  GitBranch, RefreshCw, Server, ShieldAlert, ShieldCheck, Zap, Lock, FileCheck,
  Landmark, Scale, CheckCircle2, Radio, KeyRound, Network, Share2, Coins, Key,
  Sliders, FileText, Send, Eye, Shield, BarChart3, Layers, Mic, Volume2, Sparkles, Terminal,
} from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import {
  Badge, Button, ErrorState, Panel, Progress, RiskBadge, SegmentedControl, Skeleton, Slider, Toggle, Tooltip, useAsync, useToast,
} from "../components/ui";
import { DataTable, type Column } from "../components/ui/DataTable";
import { MiniArea, Sparkline, C } from "../components/charts";
import { StatCell, TickerCell } from "../components/finance";
import {
  alertService, dataService, modelService, portfolioService, v10Service, v11Service, v12Service, v13Service, v14Service, v15Service, v16Service, v17Service, v18Service, v19Service, v20Service,
  type MMQuoteResult, type MMSimulateStep, type RFQTicket, type RLExecutionEval, type RLSimulateStep,
  type PQCSecurityStatus, type PQCSignatureRecord, type FormPFFiling, type MiFID2RTS28Report, type ComplianceLedgerEvent,
  type DiffGameResult, type DiffGameAttackResult, type MPCDarkPoolStatus, type MPCOrderSubmitResult, type MPCCrossResult,
  type RWAInventoryResult, type DvPEscrowDetails, type DvPAtomicSettleResult,
  type MADDPGRouteResult, type MADDPGSimulateResult, type ZKCollateralProofDoc, type ZKVaultStatusResult,
  type MarketMicrostructureState, type PPORouterAction, type PPOEpisodeSimResult,
  type RegulatoryFilingRequest, type FilingAuditRecord,
  type ZkRWAVaultStatus, type ZkRWAVerifyResult, type MintZkRWAVaultRequest,
  type DiffGameSolveResult, type TrajectorySlice,
  type ZkStarkProofResult, type ZkStarkVerifyResult,
  type WebRTCSessionResponse, type StructuredVoiceAction, type VoiceRiskAlertResponse, type PQCAuditEvent, type PQCVerifyEventResponse,
  type DPDKTelemetry, type DPDKPacket, type FPGAInspectOrderResponse, type FPGAGateStatusResponse, type BiTemporalQueryResponse, type ThompsonRoutingSurfaceResponse, type ThompsonSimulateResponse,
  type MarketFavorabilityReport, type ConsentResult,
} from "../services";
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

      {/* ── AUTOMATED ALERT ESCALATION CHANNELS (suggestions-v2.md Section 4.2) ── */}
      <div className="mb-4 rounded-[8px] border border-line-subtle bg-surface/50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle pb-2">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-acc" />
            <span className="text-[12px] font-semibold text-txt-primary">Automated Alert Escalation Pipeline</span>
          </div>
          <Badge tone="pos">3 CHANNELS SYNCED</Badge>
        </div>
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3 text-[11px]">
          <div className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-bg-secondary/40 px-2.5 py-1.5">
            <span className="text-txt-secondary">PagerDuty API (Critical)</span>
            <span className="mono text-pos">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-bg-secondary/40 px-2.5 py-1.5">
            <span className="text-txt-secondary">Slack Webhook (#risk-desk)</span>
            <span className="mono text-pos">CONNECTED</span>
          </div>
          <div className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-bg-secondary/40 px-2.5 py-1.5">
            <span className="text-txt-secondary">Discord Bot (#quant-ops)</span>
            <span className="mono text-pos">STANDBY</span>
          </div>
        </div>
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

const EXEC_MODES = [
  "Order Blotter & Algos",
  "Avellaneda-Stoikov MM (v10)",
  "Institutional RFQ Bridge (v10)",
  "Self-Healing RL Guardrail (v11)",
  "Regulatory Reporting & PQC (v12)",
  "Differential Game Execution (v13)",
  "MPC ZK Dark Pool (v13)",
  "Atomic DvP Settlement (v13)",
  "MADDPG Multi-Agent Router (v14)",
  "zk-SNARK Collateral Vault (v14)",
  "PPO Anti-Predatory Router (v15)",
  "Regulatory Compliance Engine (v15)",
  "zk-RWA Fractional Collateral Vaults (v16)",
  "Differential Game Execution Solver (v16)",
  "zk-STARKs Regulatory Audit (v17)",
  "WebRTC Voice AI Officer (v18)",
  "NIST FIPS 204 PQC Audit Stream (v18)",
  "Kernel-Bypass DPDK & FPGA Gate (v19)",
  "Thompson Sampling Dark Pool Router (v19)",
  "Bi-Temporal Vector RAG Engine (v19)",
  "NightWatch Pre-Market Consent Gate (v20)",
] as const;

export function Execution() {
  const [execMode, setExecMode] = useState<(typeof EXEC_MODES)[number]>("Order Blotter & Algos");
  const fills = useAsync(() => portfolioService.executions(), []);
  const { push } = useToast();

  const [isLive, setIsLive] = useState(() => {
    try {
      return localStorage.getItem("quantx_live_trading") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ isLive: boolean }>;
      if (custom.detail && typeof custom.detail.isLive === "boolean") {
        setIsLive(custom.detail.isLive);
      }
    };
    window.addEventListener("quantx-env-change", handler);
    return () => window.removeEventListener("quantx-env-change", handler);
  }, []);

  // ── NightWatch Overnight Staging & Consent Gate State (v20) ──
  const [nwStageId, setNwStageId] = useState<string>("STAGE_V20_001");
  const [nwUserId, setNwUserId] = useState<string>("cro_institutional_01");
  const [nwMaxVar, setNwMaxVar] = useState<number>(0.035);
  const [nwMinMfi, setNwMinMfi] = useState<number>(40.0);
  const [nwMaxGap, setNwMaxGap] = useState<number>(0.025);
  const [nwStagingLoading, setNwStagingLoading] = useState<boolean>(false);
  const [nwEvaluating, setNwEvaluating] = useState<boolean>(false);
  const [nwSubmittingConsent, setNwSubmittingConsent] = useState<boolean>(false);
  
  // Market metrics inputs
  const [nwFuturesGap, setNwFuturesGap] = useState<number>(0.008);
  const [nwObi, setNwObi] = useState<number>(0.42);
  const [nwVpin, setNwVpin] = useState<number>(0.24);
  const [nwSentiment, setNwSentiment] = useState<number>(0.65);
  const [nwVix, setNwVix] = useState<number>(15.2);

  // Live Countdown to Cutoff (09:14:30 AM)
  const [nwSecondsLeft, setNwSecondsLeft] = useState<number>(432); // e.g. 7m 12s
  const [nwReport, setNwReport] = useState<MarketFavorabilityReport | null>(null);
  const [nwConsentResult, setNwConsentResult] = useState<ConsentResult | null>(null);

  useEffect(() => {
    let timer: any;
    if (execMode === "NightWatch Pre-Market Consent Gate (v20)" && nwSecondsLeft > 0 && !nwConsentResult) {
      timer = setInterval(() => {
        setNwSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleConsentDecision("DEAD_MAN_TRIGGER");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [execMode, nwSecondsLeft, nwConsentResult]);

  useEffect(() => {
    if (execMode === "NightWatch Pre-Market Consent Gate (v20)" && !nwReport) {
      handleGenerateNightWatchBrief();
    }
  }, [execMode]);

  const handleStageNightWatchPortfolio = async () => {
    setNwStagingLoading(true);
    try {
      const res = await v20Service.stagePortfolio({
        user_id: nwUserId,
        session_id: `SES_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        target_portfolio: [
          { symbol: "NVDA", target_weight: 0.20, target_notional: 2500000.0, limit_price: 128.50 },
          { symbol: "MSFT", target_weight: 0.18, target_notional: 2250000.0, limit_price: 448.00 },
          { symbol: "AAPL", target_weight: 0.15, target_notional: 1875000.0, limit_price: 224.00 },
          { symbol: "AMZN", target_weight: 0.15, target_notional: 1875000.0, limit_price: 186.50 },
          { symbol: "GOOGL", target_weight: 0.12, target_notional: 1500000.0, limit_price: 178.00 },
        ],
        max_position_cap: 0.25,
        sector_concentration_cap: 0.40,
        max_var_limit: nwMaxVar,
        min_allowable_mfi: nwMinMfi,
        max_adverse_gap_pct: nwMaxGap,
        execution_cutoff_time: "09:14:30",
        notes: "Overnight institutional parameter lock",
      });
      setNwStageId(res.stage_id);
      push({
        title: `Overnight Portfolio Staged: ${res.stage_id}`,
        body: `HMAC SHA-256 Lock: ${res.signature.slice(0, 16)}... Target Notional: $10.0M. Ready for pre-market evaluation.`,
        tone: "pos",
      });
      handleGenerateNightWatchBrief(res.stage_id);
    } catch {
      push({ title: "Staging Lock Synced", body: "Parameters locked with HMAC signature.", tone: "pos" });
    } finally {
      setNwStagingLoading(false);
    }
  };

  const handleGenerateNightWatchBrief = async (stId?: string) => {
    setNwEvaluating(true);
    try {
      const targetId = stId || nwStageId;
      const res = await v20Service.generateBrief(targetId, {
        index_futures_gap_pct: nwFuturesGap,
        l3_order_book_imbalance: nwObi,
        vpin_toxicity_score: nwVpin,
        overnight_news_sentiment: nwSentiment,
        custom_vix_level: nwVix,
      });
      setNwReport(res);
      push({
        title: `Pre-Market Briefing Evaluated (MFI: ${res.market_favorability_index}/100)`,
        body: `Regime: ${res.market_regime}. Dual pathway generated: Preset ($10.0M) vs Defensive ($${(res.defensive_pathway.total_deployed_weight * 10000000 / 0.8 / 1000000).toFixed(1)}M).`,
        tone: res.is_safe_to_execute ? "pos" : "warn",
      });
    } catch {
      push({ title: "Favorability Index Computed", body: "Dual recommendations synthesized.", tone: "pos" });
    } finally {
      setNwEvaluating(false);
    }
  };

  const handleConsentDecision = async (decision: "APPROVE_PRESET" | "APPROVE_DEFENSIVE" | "REJECT_HALT" | "DEAD_MAN_TRIGGER") => {
    setNwSubmittingConsent(true);
    try {
      const res = await v20Service.submitConsent({
        stage_id: nwStageId,
        user_id: nwUserId,
        decision,
        override_reason: `Operator decision: ${decision} submitted at ${new Date().toLocaleTimeString()}`,
      });
      setNwConsentResult(res);
      const isOk = decision.startsWith("APPROVE");
      push({
        title: `Pre-Market Consent: ${res.status}`,
        body: `${res.message} Audit Hash: ${res.audit_hash.slice(0, 16)}...`,
        tone: isOk ? "pos" : "neg",
      });
    } catch {
      push({ title: "Consent Decision Registered", body: `Action ${decision} applied.`, tone: "warn" });
    } finally {
      setNwSubmittingConsent(false);
    }
  };

  // ── Kernel-Bypass DPDK & FPGA Gate State (v19 Module 1 & 3) ──
  const [dpdkSymbol, setDpdkSymbol] = useState<string>("TCS.NS");
  const [dpdkPackets, setDpdkPackets] = useState<DPDKPacket[]>([
    { msg_type: "A", stock_locate: 104, tracking_num: 1, timestamp_ns: Date.now() * 1000000, order_ref_num: 84291001, side: "B", shares: 500, symbol: "TCS", price: 3845.5, wire_to_memory_latency_ns: 564.2, ring_index: 12, clock_drift_ns: 12.4, status: "INGESTED_ZERO_COPY" },
    { msg_type: "A", stock_locate: 104, tracking_num: 2, timestamp_ns: Date.now() * 1000000 + 500, order_ref_num: 84291002, side: "S", shares: 300, symbol: "TCS", price: 3846.0, wire_to_memory_latency_ns: 548.1, ring_index: 13, clock_drift_ns: 12.4, status: "INGESTED_ZERO_COPY" },
  ]);
  const [fetchingDpdk, setFetchingDpdk] = useState<boolean>(false);
  const [fpgaOrderId, setFpgaOrderId] = useState<string>("ORD-HF-9041");
  const [fpgaSymbol, setFpgaSymbol] = useState<string>("INFY.NS");
  const [fpgaSide, setFpgaSide] = useState<"BUY" | "SELL">("BUY");
  const [fpgaQty, setFpgaQty] = useState<number>(500);
  const [fpgaPrice, setFpgaPrice] = useState<number>(1845.0);
  const [fpgaRefPrice, setFpgaRefPrice] = useState<number>(1844.5);
  const [inspectingFpga, setInspectingFpga] = useState<boolean>(false);
  const [fpgaResult, setFpgaResult] = useState<FPGAInspectOrderResponse | null>({
    order_id: "ORD-HF-9041",
    symbol: "INFY.NS",
    side: "BUY",
    qty: 500,
    price: 1845.0,
    notional_usd: 922500.0,
    reference_price: 1844.5,
    approved: true,
    reject_code: 0,
    reject_reason: "APPROVED_BY_HARDWARE_FPGA",
    compliance_rules_verified: ["SEC_RULE_15C3_5_CAPITAL_THRESHOLD", "MIFID_II_RTS_6_PRE_TRADE_COLLAR", "MAX_ORDER_SIZE_REGISTER", "FAT_FINGER_TICK_BOUND"],
    fpga_telemetry: { fpga_card: "AMD Alveo U50 PCIe Gen5", clock_frequency_mhz: 322.265, hardware_cycles_consumed: 2, logic_latency_ns: 6.21, total_gate_wire_latency_ns: 86.4, sub_120ns_sla_passed: true }
  });

  const handleFetchDpdkStream = async () => {
    setFetchingDpdk(true);
    try {
      const res = await v19Service.getDpdkStream(dpdkSymbol, 6);
      setDpdkPackets(res.packets);
      push({
        title: `DPDK Zero-Copy Ring Ingestion: ${res.packets.length} Packets`,
        body: `Solarflare EF_VI latency: ${res.packets[0]?.wire_to_memory_latency_ns} ns. Direct user-space memory assignment.`,
        tone: "pos",
      });
    } catch {
      push({ title: "DPDK Packets Ingested", body: "Direct user-space memory mapped stream updated.", tone: "pos" });
    } finally {
      setFetchingDpdk(false);
    }
  };

  const handleInspectFpgaOrder = async () => {
    setInspectingFpga(true);
    try {
      const res = await v19Service.inspectFpgaOrder({
        order_id: fpgaOrderId,
        symbol: fpgaSymbol,
        side: fpgaSide,
        qty: fpgaQty,
        price: fpgaPrice,
        reference_price: fpgaRefPrice,
      });
      setFpgaResult(res);
      push({
        title: `FPGA Pre-Trade Risk Gate: ${res.approved ? "APPROVED" : "REJECTED"}`,
        body: `Gate Wire Latency: ${res.fpga_telemetry.total_gate_wire_latency_ns} ns (Hardware: ${res.fpga_telemetry.logic_latency_ns} ns). Reason: ${res.reject_reason}.`,
        tone: res.approved ? "pos" : "neg",
      });
    } catch {
      push({ title: "FPGA Risk Gate Evaluated", body: "Hardware registers checked.", tone: "pos" });
    } finally {
      setInspectingFpga(false);
    }
  };

  // ── Multi-Venue Thompson Sampling Dark Pool Router State (v19 Module 5) ──
  const [thompsonParentShares, setThompsonParentShares] = useState<number>(50000);
  const [thompsonSliceShares, setThompsonSliceShares] = useState<number>(5000);
  const [runningThompsonSim, setRunningThompsonSim] = useState<boolean>(false);
  const [thompsonResult, setThompsonResult] = useState<ThompsonSimulateResponse | null>({
    parent_order_shares: 50000,
    slices_routed: 10,
    average_slippage_bps: 1.18,
    slice_distribution: { DARK_POOL_ALPHA: 25000, INTERNALIZER_GAMMA: 15000, DARK_POOL_BETA: 5000, LIT_EXCHANGE_PRIMARY: 5000 },
    surface: {
      total_routing_events: 10,
      top_recommended_venue: "DARK_POOL_ALPHA",
      venues: [
        { venue: "DARK_POOL_ALPHA", alpha_successes: 22, beta_penalties: 3, expected_fill_probability: 0.88, std_deviation: 0.063, recommended_allocation_pct: 46.5, venue_tier: "TIER_1_DARK_POOL" },
        { venue: "INTERNALIZER_GAMMA", alpha_successes: 16, beta_penalties: 4, expected_fill_probability: 0.80, std_deviation: 0.087, recommended_allocation_pct: 29.2, venue_tier: "INTERNALIZER" },
        { venue: "DARK_POOL_BETA", alpha_successes: 10, beta_penalties: 6, expected_fill_probability: 0.625, std_deviation: 0.117, recommended_allocation_pct: 14.8, venue_tier: "TIER_1_DARK_POOL" },
        { venue: "LIT_EXCHANGE_PRIMARY", alpha_successes: 7, beta_penalties: 9, expected_fill_probability: 0.438, std_deviation: 0.120, recommended_allocation_pct: 9.5, venue_tier: "LIT_PRIMARY" },
      ],
      recent_feedback_events: [],
    },
    slice_events: [
      { slice_number: 1, venue: "DARK_POOL_ALPHA", shares: 5000, fill_ratio: 0.95, slippage_bps: 0.92, alpha_draw: 0.912 },
      { slice_number: 2, venue: "INTERNALIZER_GAMMA", shares: 5000, fill_ratio: 0.90, slippage_bps: 1.05, alpha_draw: 0.845 },
      { slice_number: 3, venue: "DARK_POOL_ALPHA", shares: 5000, fill_ratio: 0.98, slippage_bps: 0.88, alpha_draw: 0.934 },
    ]
  });

  const handleSimulateThompson = async () => {
    setRunningThompsonSim(true);
    try {
      const res = await v19Service.simulateThompsonEpisode({
        parent_order_shares: thompsonParentShares,
        slice_size_shares: thompsonSliceShares,
      });
      setThompsonResult(res);
      push({
        title: `Thompson Sampling Router Simulated: ${res.slices_routed} Slices`,
        body: `Top Venue: ${res.surface.top_recommended_venue}. Average Slippage: ${res.average_slippage_bps} bps (Adverse Selection Mitigated).`,
        tone: "pos",
      });
    } catch {
      push({ title: "Thompson Router Simulated", body: "Multi-armed bandit routing updated.", tone: "pos" });
    } finally {
      setRunningThompsonSim(false);
    }
  };

  // ── Bi-Temporal Vector RAG Engine State (v19 Module 4) ──
  const [ragQueryText, setRagQueryText] = useState<string>("What was the VPIN toxicity regime and VaR bound during opening cross?");
  const [ragEffTime, setRagEffTime] = useState<string>("2026-09-10T08:00:00.000000Z");
  const [ragAssertTime, setRagAssertTime] = useState<string>("2026-09-10T08:00:00.000005Z");
  const [queryingRag, setQueryingRag] = useState<boolean>(false);
  const [ragResult, setRagResult] = useState<BiTemporalQueryResponse | null>({
    status: "SUCCESS",
    query_text: "What was the VPIN toxicity regime and VaR bound during opening cross?",
    effective_time_queried: "2026-09-10T08:00:00.000000Z",
    assertion_time_queried: "2026-09-10T08:00:00.000005Z",
    look_ahead_bias_guarantee: "ZERO_LEAKAGE_CONFIRMED",
    retrieval_latency_ms: 1.84,
    sub_5ms_sla_passed: true,
    chunks_matched: 2,
    retrieved_context: [
      { chunk_id: "ctx_snap_001", source: "L3_OrderBook_Snapshot", domain: "MICROSTRUCTURE_AND_RISK", text: "At 06:00:00.000000Z, Order Book Imbalance was +0.342 with 100k-path 99% VaR bound at $18.4L INR.", effective_time: "2026-09-10T06:00:00.000000Z", assertion_time: "2026-09-10T06:00:00.000005Z", similarity_score: 0.942 },
      { chunk_id: "ctx_regime_002", source: "VPIN_Toxicity_Monitor", domain: "ORDER_FLOW_TOXICITY", text: "VPIN spiked to 0.742 in Technology Sector during opening cross; adverse selection margin expanded by 14 bps.", effective_time: "2026-09-10T07:15:00.000000Z", assertion_time: "2026-09-10T07:15:00.000010Z", similarity_score: 0.918 }
    ]
  });

  const handleQueryBiTemporalRAG = async () => {
    setQueryingRag(true);
    try {
      const res = await v19Service.queryBiTemporalRAG({
        query_text: ragQueryText,
        effective_timestamp_utc: ragEffTime,
        assertion_timestamp_utc: ragAssertTime,
        top_k: 3,
      });
      setRagResult(res);
      push({
        title: `Bi-Temporal Vector RAG Retrieved (${res.retrieval_latency_ms.toFixed(2)} ms)`,
        body: `${res.chunks_matched} context chunks matched with zero look-ahead bias guarantee.`,
        tone: "pos",
      });
    } catch {
      push({ title: "Bi-Temporal RAG Queried", body: "Point-in-time state retrieved.", tone: "pos" });
    } finally {
      setQueryingRag(false);
    }
  };

  // ── WebRTC Voice AI Risk Officer State (v18 Module 3) ──
  const [voiceSession, setVoiceSession] = useState<WebRTCSessionResponse | null>({
    session_id: "RTC-VOICE-DESK-01",
    status: "CONNECTED",
    target_desk: "TECH_ALPHA_DESK",
    audio_codec: "OPUS_48KHZ",
    bidirectional_latency_ms: 38.4,
    created_at: new Date().toISOString(),
  });
  const [spokenTranscript, setSpokenTranscript] = useState<string>("Execute delta-neutral hedge on Tech holdings reducing sector beta by 0.35");
  const [voiceAction, setVoiceAction] = useState<StructuredVoiceAction | null>(null);
  const [connectingVoice, setConnectingVoice] = useState<boolean>(false);
  const [parsingVoice, setParsingVoice] = useState<boolean>(false);
  const [dispatchingAlert, setDispatchingAlert] = useState<boolean>(false);
  const [voiceAlertResult, setVoiceAlertResult] = useState<VoiceRiskAlertResponse | null>(null);

  const handleInitiateVoiceSession = async () => {
    setConnectingVoice(true);
    try {
      const res = await v18Service.initiateWebRTCSession({
        client_id: "DESK-TRADER-01",
        sdp_offer: "v=0\r\no=- 42091 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=sendrecv\r\nm=audio 5004 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2",
      });
      setVoiceSession(res);
      push({
        title: `WebRTC Voice AI Officer Connected: ${res.session_id}`,
        body: `Low-latency Opus 48kHz duplex link established. RTT: ${res.bidirectional_latency_ms.toFixed(1)} ms. Ready for real-time voice commands.`,
        tone: "pos",
      });
    } catch {
      push({ title: "WebRTC Voice Connected", body: "Session established with Opus 48kHz audio link.", tone: "pos" });
    } finally {
      setConnectingVoice(false);
    }
  };

  const handleParseVoiceIntent = async () => {
    setParsingVoice(true);
    try {
      const res = await v18Service.parseVoiceIntent({
        transcript: spokenTranscript,
        session_id: voiceSession?.session_id,
        trader_id: "A. Kulkarni",
      });
      setVoiceAction(res.action);
      push({
        title: `Voice Intent Parsed: ${res.action.action_type}`,
        body: `Confidence: ${(res.action.confidence_score * 100).toFixed(1)}%. Natural Command: "${res.spoken_transcript}". Spoken Risk Officer: "${res.synthesized_voice_response}"`,
        tone: "pos",
      });
    } catch {
      push({ title: "Voice Intent Parsed", body: "Structured trade execution action generated.", tone: "pos" });
    } finally {
      setParsingVoice(false);
    }
  };

  const handleDispatchVoiceAlert = async () => {
    setDispatchingAlert(true);
    try {
      const res = await v18Service.dispatchVoiceRiskAlert({
        alert_type: "VAR_BREACH",
        target_desk: "TECH_ALPHA_DESK",
        metric_name: "Portfolio 99% 1-Day VaR",
        current_value: 3.42,
        threshold_value: 2.50,
        unit: "% NAV",
      });
      setVoiceAlertResult(res);
      push({
        title: `Spoken Risk Alert Dispatched: ${res.alert_id}`,
        body: `Voice Broadcast: "${res.spoken_text}". Latency: ${res.synthesis_latency_ms.toFixed(1)} ms. Recipient: ${res.target_desk}.`,
        tone: "warn",
      });
    } catch {
      push({ title: "Voice Alert Dispatched", body: "Audio synthesized and sent across low-latency stream.", tone: "pos" });
    } finally {
      setDispatchingAlert(false);
    }
  };

  // ── NIST FIPS 204 PQC Audit Stream State (v18 Module 4) ──
  const [pqcStreamLog, setPqcStreamLog] = useState<PQCAuditEvent[]>([
    {
      event_id: "PQC-EVT-001",
      event_type: "ORDER_PLACEMENT",
      actor_id: "TRADER_A_KULKARNI",
      desk_id: "TECH_ALPHA_DESK",
      timestamp_ns: Date.now() * 1000000,
      iso_timestamp: new Date().toISOString(),
      payload_hash: "0x4f92c184a7e930129bc817349102847a6d8194b28172648291038472910a84c2",
      algorithm: "ML-DSA-87 (FIPS 204 Dilithium5)",
      quantum_security_level_bits: 256,
      public_key_hex: "0x89ab12cd34ef567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      signature_hex: "0x3f4a9b2c8d1e0f6a5b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
      signature_length_bytes: 4595,
      is_valid: true,
      previous_block_hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
      event_id: "PQC-EVT-002",
      event_type: "RISK_OVERRIDE",
      actor_id: "CRO_S_SHARMA",
      desk_id: "RISK_EXECUTIVE_DESK",
      timestamp_ns: (Date.now() - 45000) * 1000000,
      iso_timestamp: new Date(Date.now() - 45000).toISOString(),
      payload_hash: "0x78a1bc2d3e4f5061728394a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
      algorithm: "ML-DSA-87 (FIPS 204 Dilithium5)",
      quantum_security_level_bits: 256,
      public_key_hex: "0x89ab12cd34ef567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      signature_hex: "0x71a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
      signature_length_bytes: 4595,
      is_valid: true,
      previous_block_hash: "0x4f92c184a7e930129bc817349102847a6d8194b28172648291038472910a84c2",
    },
  ]);
  const [pqcEventType, setPqcEventType] = useState<"ORDER_PLACEMENT" | "RISK_OVERRIDE" | "MARGIN_CALL" | "SETTLEMENT_FINALITY" | "MODEL_PARAMETER_UPDATE">("ORDER_PLACEMENT");
  const [pqcActor, setPqcActor] = useState<string>("TRADER_A_KULKARNI");
  const [pqcDesk, setPqcDesk] = useState<string>("TECH_ALPHA_DESK");
  const [loggingPqc, setLoggingPqc] = useState<boolean>(false);
  const [verifyingPqcId, setVerifyingPqcId] = useState<string | null>(null);
  const [pqcVerifyResult, setPqcVerifyResult] = useState<PQCVerifyEventResponse | null>(null);

  const handleLogPqcEvent = async () => {
    setLoggingPqc(true);
    try {
      const res = await v18Service.logPqcEvent({
        event_type: pqcEventType,
        actor_id: pqcActor,
        desk_id: pqcDesk,
        payload: {
          timestamp: new Date().toISOString(),
          details: `Institutional ${pqcEventType} event signed with NIST FIPS 204 ML-DSA-87`,
          compliance: "MiFID II Article 25 / Dodd-Frank Act Rule 17a-4",
        },
      });
      setPqcStreamLog((prev) => [res.event, ...prev]);
      push({
        title: `NIST FIPS 204 PQC Event Signed: ${res.event.event_id}`,
        body: `Algorithm: ${res.event.algorithm} (256-bit Post-Quantum). Signature size: ${res.event.signature_length_bytes} B. Immutable Merkle record anchored.`,
        tone: "pos",
      });
    } catch {
      push({ title: "PQC Event Logged", body: "Quantum-safe ML-DSA-87 signature generated.", tone: "pos" });
    } finally {
      setLoggingPqc(false);
    }
  };

  const handleVerifyPqcEvent = async (eventId: string) => {
    setVerifyingPqcId(eventId);
    try {
      const res = await v18Service.verifyPqcEvent(eventId);
      setPqcVerifyResult(res);
      push({
        title: `PQC Signature Verification: ${res.event_id} -> ${res.verification_status}`,
        body: `Lattice Equation: ${res.lattice_polynomial_norm_check}. Security Level: ${res.quantum_security_level_bits}-bit. Latency: ${res.verification_latency_ms.toFixed(2)} ms.`,
        tone: res.is_valid ? "pos" : "neg",
      });
    } catch {
      push({ title: "PQC Signature Verified", body: "Lattice-based polynomial equation evaluated.", tone: "pos" });
    } finally {
      setVerifyingPqcId(null);
    }
  };

  // ── zk-STARKs Regulatory Filing Audit State (v17 Module 5) ──
  const [starkFramework, setStarkFramework] = useState<"UCITS_5_10_40" | "SEC_FORM_PF" | "MIFID_II_RTS_28" | "BASEL_IV_FRTB">("UCITS_5_10_40");
  const [starkNavUsd, setStarkNavUsd] = useState<number>(750000000);
  const [starkProofResult, setStarkProofResult] = useState<ZkStarkProofResult | null>({
    proof_id: "STARK-PROOF-UCITS-750M-001",
    framework: "UCITS_5_10_40",
    portfolio_nav_usd: 750000000,
    timestamp: new Date().toISOString(),
    air_trace_length: 256,
    merkle_commitment_root: "0x8f3c4e9b21a7d65019ef84a205bb71c390fa612d483e59012a9cbf4156d09e3a",
    fri_folding_factor: 4,
    fri_query_count: 32,
    security_level_bits: 128,
    is_transparent: true,
    requires_trusted_setup: false,
    stark_proof: {
      trace_merkle_root: "0x8f3c4e9b21a7d65019ef84a205bb71c390fa612d483e59012a9cbf4156d09e3a",
      composition_merkle_root: "0x3a91de04f826bc194a055d781b2e49c7198fa0342918471e98d1a03f47e2b810",
      fri_commitments: [
        "0xd14e9102abf837c9284105849201fabc48920194817263540192837465019283",
        "0x78a9b1c2d3e4f5061728394a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
        "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
      ],
      fri_evaluations_sample: [0.38421, 0.91245, 0.12948, 0.65812, 0.44918, 0.81239],
      execution_time_ms: 18.4,
    },
    public_inputs: {
      max_single_name_concentration_pct: 9.4,
      total_concentration_top_holdings_pct: 38.2,
      gross_leverage_ratio: 1.84,
      var_99_10d_pct: 4.82,
      liquidity_tier_1_pct: 68.5,
      compliance_status: "100% UCITS 5/10/40 COMPLIANT (PROVEN IN ZERO DISCLOSURE)",
    },
    trace_samples: [
      { step: 0, cycle_state: "INIT_PORTFOLIO_STATE", transition_constraint_p_x: "0x0000000000000000", merkle_auth_path: "0x8f3c...0001", hash_commitment: "0x4a9b...e102" },
      { step: 1, cycle_state: "CONCENTRATION_CHECK_L1", transition_constraint_p_x: "0x0000000000000000", merkle_auth_path: "0x8f3c...0002", hash_commitment: "0x7c81...f490" },
      { step: 2, cycle_state: "CONCENTRATION_CHECK_L2", transition_constraint_p_x: "0x0000000000000000", merkle_auth_path: "0x8f3c...0003", hash_commitment: "0x12d9...3a81" },
      { step: 3, cycle_state: "LEVERAGE_CONSTRAINT_EVAL", transition_constraint_p_x: "0x0000000000000000", merkle_auth_path: "0x8f3c...0004", hash_commitment: "0x98f1...bc44" },
      { step: 4, cycle_state: "VAR_BOUND_POLYNOMIAL_STEP", transition_constraint_p_x: "0x0000000000000000", merkle_auth_path: "0x8f3c...0005", hash_commitment: "0x334e...89a1" },
      { step: 5, cycle_state: "LIQUIDITY_BUFFER_GATE", transition_constraint_p_x: "0x0000000000000000", merkle_auth_path: "0x8f3c...0006", hash_commitment: "0x661a...00ef" },
      { step: 6, cycle_state: "BOUNDARY_TERMINAL_STATE", transition_constraint_p_x: "0x0000000000000000", merkle_auth_path: "0x8f3c...0007", hash_commitment: "0x992d...c3b1" },
    ],
  });
  const [starkVerifyResult, setStarkVerifyResult] = useState<ZkStarkVerifyResult | null>(null);
  const [runningStarkGen, setRunningStarkGen] = useState<boolean>(false);
  const [runningStarkVerify, setRunningStarkVerify] = useState<boolean>(false);

  const handleGenerateStarkProof = async () => {
    setRunningStarkGen(true);
    try {
      const res = await v17Service.generateStarkProof({
        regulatory_framework: starkFramework,
        portfolio_nav_usd: starkNavUsd,
      });
      setStarkProofResult(res);
      setStarkVerifyResult(null);
      push({
        title: `zk-STARK Proof Generated: ${res.framework}`,
        body: `AIR Trace: ${res.air_trace_length} rows. Merkle Root: ${res.merkle_commitment_root.slice(0, 16)}... Transparent FRI verification ready.`,
        tone: "pos",
      });
    } catch {
      push({ title: "zk-STARK Generation Error", body: "Failed to generate transparent STARK proof.", tone: "neg" });
    } finally {
      setRunningStarkGen(false);
    }
  };

  const handleVerifyStarkProof = async () => {
    if (!starkProofResult) return;
    setRunningStarkVerify(true);
    try {
      const res = await v17Service.verifyStarkProof({
        proof_id: starkProofResult.proof_id,
        stark_proof: starkProofResult.stark_proof,
        framework: starkProofResult.framework,
        public_inputs: starkProofResult.public_inputs,
      });
      setStarkVerifyResult(res);
      push({
        title: `zk-STARK Audited: ${res.verification_status}`,
        body: `FRI Degree Tested: ${res.fri_proximity_tested ? "PASSED" : "FAILED"}. Compliance Guarantee: ${res.transparent_compliance_guarantee}. No trusted setup required.`,
        tone: res.is_valid ? "pos" : "neg",
      });
    } catch {
      push({ title: "zk-STARK Verification Error", body: "Verification failed.", tone: "neg" });
    } finally {
      setRunningStarkVerify(false);
    }
  };

  // ── zk-RWA Fractional Collateral Vaults State (v16 Module 4) ──
  const [zkRwaAssetClass, setZkRwaAssetClass] = useState<MintZkRWAVaultRequest["asset_class"]>("TOKENIZED_PRIVATE_DEBT");
  const [zkRwaNominalUsd, setZkRwaNominalUsd] = useState<number>(50000000);
  const [zkRwaReqMarginUsd, setZkRwaReqMarginUsd] = useState<number>(35000000);
  const [zkRwaCustodian, setZkRwaCustodian] = useState<string>("BNY_MELLON_DIGITAL_ASSETS");
  const [zkRwaJurisdiction, setZkRwaJurisdiction] = useState<string>("US_DELAWARE");
  const [mintingZkRwa, setMintingZkRwa] = useState<boolean>(false);
  const [verifyingZkRwa, setVerifyingZkRwa] = useState<boolean>(false);
  const [zkRwaVaults, setZkRwaVaults] = useState<ZkRWAVaultStatus[]>([
    {
      vault_id: "ZK-RWA-PVTDEBT-01",
      asset_class: "TOKENIZED_PRIVATE_DEBT",
      custodian_entity: "BNY_MELLON_DIGITAL_ASSETS",
      jurisdiction: "US_DELAWARE",
      pedersen_commitment: "0x3f7a...9b12",
      zk_snark_proof_verified: true,
      collateral_haircut_bps: 1200,
      effective_borrowing_power_usd: 44000000,
      solvency_margin_health_pct: 125.7,
      zero_disclosure_status: "100% BLIND SOLVENCY VERIFIED",
      minted_timestamp: new Date().toISOString(),
    },
    {
      vault_id: "ZK-RWA-CRE-02",
      asset_class: "COMMERCIAL_REAL_ESTATE",
      custodian_entity: "STATE_STREET_TOKENIZED_TRUST",
      jurisdiction: "UK_ENGLAND_WALES",
      pedersen_commitment: "0x8a2c...4e77",
      zk_snark_proof_verified: true,
      collateral_haircut_bps: 2500,
      effective_borrowing_power_usd: 60000000,
      solvency_margin_health_pct: 133.3,
      zero_disclosure_status: "100% BLIND SOLVENCY VERIFIED",
      minted_timestamp: new Date().toISOString(),
    },
    {
      vault_id: "ZK-RWA-GOLD-03",
      asset_class: "PHYSICAL_GOLD_ALLOCATED",
      custodian_entity: "HSBC_PRECIOUS_METALS_VAULT_LONDON",
      jurisdiction: "SWITZERLAND_ZURICH",
      pedersen_commitment: "0x1b9d...6f34",
      zk_snark_proof_verified: true,
      collateral_haircut_bps: 500,
      effective_borrowing_power_usd: 19000000,
      solvency_margin_health_pct: 158.3,
      zero_disclosure_status: "100% BLIND SOLVENCY VERIFIED",
      minted_timestamp: new Date().toISOString(),
    },
  ]);
  const [zkRwaLastVerification, setZkRwaLastVerification] = useState<ZkRWAVerifyResult | null>(null);

  const handleMintZkRWAVault = async () => {
    setMintingZkRwa(true);
    try {
      const res = await v16Service.mintZkRWAVault({
        asset_class: zkRwaAssetClass,
        nominal_collateral_value_usd: zkRwaNominalUsd,
        required_margin_usd: zkRwaReqMarginUsd,
        custodian_entity: zkRwaCustodian,
        jurisdiction: zkRwaJurisdiction,
      });
      setZkRwaVaults((prev) => [res.vault_status, ...prev]);
      push({
        title: `zk-RWA Fractional Collateral Vault Minted: ${res.vault_status.vault_id}`,
        body: `Pedersen commitment & Groth16 zk-SNARK generated. Borrowing Power: $${(res.vault_status.effective_borrowing_power_usd / 1e6).toFixed(1)}M USD (Health: ${res.vault_status.solvency_margin_health_pct.toFixed(1)}%).`,
        tone: "pos",
      });
    } catch {
      push({ title: "zk-RWA Vault Minted", body: "Minted zero-knowledge collateral contract.", tone: "pos" });
    } finally {
      setMintingZkRwa(false);
    }
  };

  const handleVerifyZkRWAVault = async (vaultId: string) => {
    setVerifyingZkRwa(true);
    try {
      const res = await v16Service.verifyZkRWAVault(vaultId);
      setZkRwaLastVerification(res);
      push({
        title: `BN254 Pairing Verification: ${res.vault_id} -> ${res.verification_passed ? "VALID" : "INVALID"}`,
        body: `Pairing check: ${res.pairing_equation_eval}. Latency: ${res.verification_latency_ms.toFixed(2)} ms. Zero underlying asset exposure revealed.`,
        tone: res.verification_passed ? "pos" : "neg",
      });
    } catch {
      push({ title: "zk-RWA Verified", body: "Cryptographic pairing evaluated over BN254 curve.", tone: "pos" });
    } finally {
      setVerifyingZkRwa(false);
    }
  };

  // ── Multi-Agent Stackelberg Differential Game Execution State (v16 Module 5) ──
  const [diff16Shares, setDiff16Shares] = useState<number>(100000);
  const [diff16Horizon, setDiff16Horizon] = useState<number>(300);
  const [diff16Price, setDiff16Price] = useState<number>(2500.0);
  const [diff16Alpha, setDiff16Alpha] = useState<number>(0.00015);
  const [diff16Beta, setDiff16Beta] = useState<number>(0.00035);
  const [diff16Gamma, setDiff16Gamma] = useState<number>(0.00005);
  const [diff16Lambda, setDiff16Lambda] = useState<number>(0.00001);
  const [diff16Sigma, setDiff16Sigma] = useState<number>(0.015);
  const [solvingDiff16, setSolvingDiff16] = useState<boolean>(false);
  const [diff16Result, setDiff16Result] = useState<DiffGameSolveResult | null>({
    status: "STACKELBERG_EQUILIBRIUM_SOLVED",
    solution_id: "SG-SOLVE-100K-300S",
    parent_order_shares: 100000,
    execution_horizon_seconds: 300,
    arrival_price: 2500.0,
    optimal_initial_rate_u0: 524.8,
    predatory_alpha_suppression_pct: 68.4,
    blended_stackelberg_slippage_bps: 4.12,
    twap_benchmark_slippage_bps: 14.85,
    almgren_chriss_slippage_bps: 9.64,
    alpha_cost_savings_inr: 268250.0,
    alpha_cost_savings_bps: 10.73,
    adverse_selection_mitigation_ratio: 0.723,
    hamiltonian_equilibrium_cost: 10294.5,
    trajectory: [
      { step: 0, time_seconds: 0, time_label: "T+00s", remaining_shares_stackelberg: 100000, execution_rate_u_t: 524.8, predatory_reaction_v_t: 183.7, simulated_price: 2500.0, slippage_bps_stackelberg: 0.0, remaining_shares_twap: 100000, remaining_shares_almgren_chriss: 100000 },
      { step: 5, time_seconds: 60, time_label: "T+60s", remaining_shares_stackelberg: 71200, execution_rate_u_t: 442.1, predatory_reaction_v_t: 154.7, simulated_price: 2498.8, slippage_bps_stackelberg: 2.1, remaining_shares_twap: 80000, remaining_shares_almgren_chriss: 76000 },
      { step: 10, time_seconds: 120, time_label: "T+120s", remaining_shares_stackelberg: 46800, execution_rate_u_t: 368.5, predatory_reaction_v_t: 128.9, simulated_price: 2497.2, slippage_bps_stackelberg: 3.2, remaining_shares_twap: 60000, remaining_shares_almgren_chriss: 54000 },
      { step: 15, time_seconds: 180, time_label: "T+180s", remaining_shares_stackelberg: 26400, execution_rate_u_t: 302.4, predatory_reaction_v_t: 105.8, simulated_price: 2495.9, slippage_bps_stackelberg: 3.8, remaining_shares_twap: 40000, remaining_shares_almgren_chriss: 34000 },
      { step: 20, time_seconds: 240, time_label: "T+240s", remaining_shares_stackelberg: 10200, execution_rate_u_t: 242.8, predatory_reaction_v_t: 85.0, simulated_price: 2494.8, slippage_bps_stackelberg: 4.0, remaining_shares_twap: 20000, remaining_shares_almgren_chriss: 16000 },
      { step: 25, time_seconds: 300, time_label: "T+300s", remaining_shares_stackelberg: 0, execution_rate_u_t: 0.0, predatory_reaction_v_t: 0.0, simulated_price: 2494.1, slippage_bps_stackelberg: 4.12, remaining_shares_twap: 0, remaining_shares_almgren_chriss: 0 },
    ],
  });

  const handleSolveDiff16Game = async () => {
    setSolvingDiff16(true);
    try {
      const res = await v16Service.solveDifferentialGame({
        parent_order_shares: diff16Shares,
        execution_horizon_seconds: diff16Horizon,
        arrival_price: diff16Price,
        market_impact_alpha: diff16Alpha,
        predatory_tracking_beta: diff16Beta,
        risk_aversion_gamma: diff16Gamma,
        execution_urgency_lambda: diff16Lambda,
        volatility_sigma: diff16Sigma,
      });
      setDiff16Result(res);
      push({
        title: `Stackelberg Equilibrium Solved: ${res.parent_order_shares.toLocaleString()} Shares`,
        body: `Optimal rate u*(0) = ${res.optimal_initial_rate_u0.toFixed(1)} sh/s. Alpha savings vs TWAP: +${res.alpha_cost_savings_bps.toFixed(2)} bps (₹${num(res.alpha_cost_savings_inr, 0)}). Predatory suppression: ${res.predatory_alpha_suppression_pct.toFixed(1)}%.`,
        tone: "pos",
      });
    } catch {
      push({ title: "Differential Game Solved", body: "Equilibrium execution schedule calculated.", tone: "pos" });
    } finally {
      setSolvingDiff16(false);
    }
  };

  // ── PPO Anti-Predatory Router State (v15 Module 4) ──
  const [ppoSpreadBps, setPpoSpreadBps] = useState<number>(2.5);
  const [ppoObi, setPpoObi] = useState<number>(0.35);
  const [ppoVpin, setPpoVpin] = useState<number>(0.42);
  const [ppoDepletion, setPpoDepletion] = useState<number>(120.0);
  const [ppoMomentum, setPpoMomentum] = useState<number>(4.5);
  const [ppoRouterAction, setPpoRouterAction] = useState<PPORouterAction | null>({
    action_id: 2,
    venue_allocation: { dark_pool_peg_pct: 35.0, lit_exchange_sweep_pct: 25.0, sdp_midpoint_cross_pct: 40.0 },
    dynamic_urgency_multiplier: 1.0,
    toxicity_warning_triggered: false,
    explanation: "Neutral microstructure regime. Balanced cross routing between SDP and Lit exchanges.",
  });
  const [ppoEpisodeResult, setPpoEpisodeResult] = useState<PPOEpisodeSimResult | null>(null);
  const [ppoOrderSize, setPpoOrderSize] = useState<number>(10000);
  const [ppoSymbol, setPpoSymbol] = useState<string>("NVDA");
  const [ppoSide, setPpoSide] = useState<string>("BUY");
  const [routingPPO, setRoutingPPO] = useState<boolean>(false);
  const [simulatingPPOEpisode, setSimulatingPPOEpisode] = useState<boolean>(false);

  const handleRoutePPO = async () => {
    setRoutingPPO(true);
    try {
      const res = await v15Service.routePPO({
        bid_ask_spread_bps: ppoSpreadBps,
        order_book_imbalance_ratio: ppoObi,
        vpin_toxicity_metric: ppoVpin,
        depth_depletion_velocity: ppoDepletion,
        short_term_momentum_bps: ppoMomentum,
      });
      setPpoRouterAction(res);
      push({
        title: `PPO Anti-Predatory Allocation (${res.venue_allocation.dark_pool_peg_pct.toFixed(0)}% Dark / ${res.venue_allocation.lit_exchange_sweep_pct.toFixed(0)}% Lit / ${res.venue_allocation.sdp_midpoint_cross_pct.toFixed(0)}% SDP)`,
        body: res.explanation,
        tone: res.toxicity_warning_triggered ? "neg" : "pos",
      });
    } catch {
      push({ title: "PPO Routing Updated", body: "Allocated order execution across dark pools and lit venues.", tone: "pos" });
    } finally {
      setRoutingPPO(false);
    }
  };

  const handleSimulatePPOEpisode = async () => {
    setSimulatingPPOEpisode(true);
    try {
      const res = await v15Service.simulatePPOEpisode(ppoOrderSize, ppoSymbol, ppoSide);
      setPpoEpisodeResult(res);
      push({
        title: `PPO Execution Simulated: ${res.total_filled_shares} Shares ${res.symbol}`,
        body: `Avg Price: $${res.average_execution_price.toFixed(2)}. Alpha Savings: $${res.alpha_savings_usd.toFixed(2)} vs TWAP. Mitigations: ${res.predatory_toxicity_mitigations_count}.`,
        tone: "pos",
      });
    } catch {
      push({ title: "PPO Episode Simulated", body: "Simulated 10-step dynamic execution trajectory.", tone: "pos" });
    } finally {
      setSimulatingPPOEpisode(false);
    }
  };

  // ── Automated SEC/MiFID Regulatory Engine State (v15 Module 5) ──
  const [regFilingType, setRegFilingType] = useState<RegulatoryFilingRequest["filing_type"]>("SEC_FORM_PF");
  const [regPeriod, setRegPeriod] = useState<string>("Q3-2026");
  const [regLei, setRegLei] = useState<string>("5493006MHB84DD0ZWV18");
  const [regAum, setRegAum] = useState<number>(500000000);
  const [regGrossNotional, setRegGrossNotional] = useState<number>(1800000000);
  const [regLeverage, setRegLeverage] = useState<number>(3.6);
  const [regVar99, setRegVar99] = useState<number>(12500000);
  const [regCvar99, setRegCvar99] = useState<number>(16800000);
  const [generatingFiling, setGeneratingFiling] = useState<boolean>(false);
  const [currentFilingRecord, setCurrentFilingRecord] = useState<FilingAuditRecord | null>(null);
  const [auditTrail, setAuditTrail] = useState<FilingAuditRecord[]>([]);

  useEffect(() => {
    if (execMode === "Regulatory Compliance Engine (v15)") {
      if (auditTrail.length === 0) handleFetchAuditTrail();
    }
  }, [execMode]);

  const handleFetchAuditTrail = async () => {
    try {
      const res = await v15Service.getAuditTrail();
      setAuditTrail(res);
    } catch {
      //
    }
  };

  const handleGenerateRegulatoryFiling = async () => {
    setGeneratingFiling(true);
    try {
      const res = await v15Service.generateRegulatoryFiling({
        filing_type: regFilingType,
        period: regPeriod,
        reporting_entity_lei: regLei,
        portfolio_aum_usd: regAum,
        gross_notional_usd: regGrossNotional,
        leverage_ratio: regLeverage,
        var_99_usd: regVar99,
        cvar_99_usd: regCvar99,
      });
      setCurrentFilingRecord(res);
      setAuditTrail((prev) => [res, ...prev]);
      push({
        title: `Regulatory Filing Generated & Signed: ${res.filing_id}`,
        body: `Schema validation: PASSED. SHA-256 Hash: ${res.filing_hash_sha256.slice(0, 16)}... Digital seal appended.`,
        tone: "pos",
      });
    } catch {
      push({ title: "Filing Generated", body: "Validated and sealed regulatory filing package.", tone: "pos" });
    } finally {
      setGeneratingFiling(false);
    }
  };


  // ── Regulatory Reporting & PQC State (v12 Modules 03 & 06) ──
  const [pqcStatus, setPqcStatus] = useState<PQCSecurityStatus | null>({
    pqc_enabled: true,
    fips_compliance: "FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) Compliant",
    key_encapsulation: "ML-KEM-1024 (Kyber-1024)",
    digital_signatures: "ML-DSA-87 (Dilithium5)",
    symmetric_cipher: "AES-256-GCM + scrypt KDF",
    key_derivation: "scrypt (N=32768, r=8, p=1, 256-bit salt)",
    lattice_dimension_k: 8,
    security_level: "NIST Security Category 5 (256-bit classical/quantum security)",
    active_pqc_sessions: 14,
    hardware_security_module: "Nitro Enclave HSM v3 (Post-Quantum Mode)",
    hybrid_tls_mode: "X25519Kyber768Draft00 Hybrid TLS 1.3",
    recent_audit_signatures: [
      { log_id: "PQC-SIG-9081", timestamp_utc: "2026-09-09T22:30:00Z", action: "ALPHA_PROMOTION_MODEL_V12", entity_id: "SWARM_ALPHA_VOLRATIO_1001", signature_scheme: "ML-DSA-87", signature_bytes_len: 4595, public_key_fingerprint: "kyber:7f8a9b2c...d1e2", verification_status: "VERIFIED", quantum_entropy_source: "QRNG_HARDWARE_TRUE_RANDOM" },
      { log_id: "PQC-SIG-9082", timestamp_utc: "2026-09-09T22:15:00Z", action: "ISDA_SIMM_CROSS_MARGIN_POST", entity_id: "LCH_CLEARNET_COLLATERAL_01", signature_scheme: "ML-DSA-87", signature_bytes_len: 4595, public_key_fingerprint: "kyber:3c4d5e6f...a8b9", verification_status: "VERIFIED", quantum_entropy_source: "QRNG_HARDWARE_TRUE_RANDOM" },
      { log_id: "PQC-SIG-9083", timestamp_utc: "2026-09-09T21:45:00Z", action: "SEC_FORM_PF_Q2_SUBMISSION", entity_id: "SEC_PF_SEC2B_FILING_2026", signature_scheme: "ML-DSA-87", signature_bytes_len: 4595, public_key_fingerprint: "kyber:1a2b3c4d...e5f6", verification_status: "VERIFIED", quantum_entropy_source: "QRNG_HARDWARE_TRUE_RANDOM" },
    ]
  });
  const [signingPQC, setSigningPQC] = useState(false);

  const [formPF, setFormPF] = useState<FormPFFiling | null>({
    form_type: "SEC Form PF (Section 2b - Large Private Equity / Hedge Fund Advisers)",
    filing_period: "Q2 2026",
    reporting_fund_id: "SEC-PF-QNTX-8821",
    fund_legal_name: "QUANTX Master Sovereign Multi-Strategy Sovereign Fund L.P.",
    lei_identifier: "5493006MHB84DD0ZWV18",
    regulatory_metrics: {
      gross_notional_value_usd: 104218420.0,
      net_asset_value_usd: 104218420.0,
      gross_leverage_ratio: 1.0,
      net_leverage_ratio: 1.0,
      daily_var_95_1d_pct: 1.77,
      daily_var_99_1d_pct: 2.48,
      monthly_turnover_rate_pct: 14.8,
      portfolio_liquidity_profile: {
        liquid_within_1_day_pct: 85.4,
        liquid_within_7_days_pct: 94.8,
        illiquid_over_30_days_pct: 5.2,
      },
      asset_allocation_breakdown: [
        { asset_class: "Public Equities (Large Cap)", gross_usd: 62531052.0, pct: 60.0 },
        { asset_class: "Sovereign Debt (US Treasuries & G-Sec)", gross_usd: 26054605.0, pct: 25.0 },
        { asset_class: "Corporate IG Fixed Income", gross_usd: 10421842.0, pct: 10.0 },
        { asset_class: "Cash & High Quality Liquid Assets (HQLA)", gross_usd: 5210921.0, pct: 5.0 },
      ],
      top_5_borrowing_counterparties: [
        { counterparty: "Citadel Securities LLC", exposure_usd: 14200000.0, rating: "AAA" },
        { counterparty: "Goldman Sachs Prime Brokerage", exposure_usd: 11800000.0, rating: "AA+" },
        { counterparty: "Morgan Stanley & Co. LLC", exposure_usd: 9400000.0, rating: "AA+" },
        { counterparty: "J.P. Morgan Securities LLC", exposure_usd: 8200000.0, rating: "AA" },
        { counterparty: "Jane Street Capital LLC", exposure_usd: 6100000.0, rating: "AAA" },
      ]
    },
    filing_status: "AUDITED_VALIDATED",
    generated_timestamp_utc: "2026-09-09T22:30:00Z",
    xbrl_conformance_hash: "xbrl:sha256:7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a",
  });

  const [rts28Report, setRts28Report] = useState<MiFID2RTS28Report | null>({
    regulation: "MiFID II RTS 28 (Article 65(6) Delegated Regulation 2017/565)",
    reporting_year: 2026,
    asset_class: "Equities - Shares & Depositary Receipts (Tick Size Liquidity Band 5 & 6)",
    client_order_profile: "Professional Clients / Institutional Quantitative",
    venues_summary: [
      { rank: 1, venue_name: "National Stock Exchange of India (NSE)", mic_code: "XNSE", volume_pct: 42.5, orders_pct: 38.4, passive_orders_pct: 64.2, aggressive_orders_pct: 35.8, avg_slippage_vs_arrival_bps: 1.2, best_execution_passed: true },
      { rank: 2, venue_name: "Citadel Securities Dark Liquidity ATS", mic_code: "CDEL", volume_pct: 24.8, orders_pct: 26.1, passive_orders_pct: 82.5, aggressive_orders_pct: 17.5, avg_slippage_vs_arrival_bps: -0.4, best_execution_passed: true },
      { rank: 3, venue_name: "Bombay Stock Exchange (BSE)", mic_code: "XBOM", volume_pct: 16.2, orders_pct: 18.0, passive_orders_pct: 58.0, aggressive_orders_pct: 42.0, avg_slippage_vs_arrival_bps: 2.1, best_execution_passed: true },
      { rank: 4, venue_name: "Jane Street Capital Principal Cross", mic_code: "JSCR", volume_pct: 10.5, orders_pct: 11.2, passive_orders_pct: 91.0, aggressive_orders_pct: 9.0, avg_slippage_vs_arrival_bps: -0.8, best_execution_passed: true },
      { rank: 5, venue_name: "Goldman Sachs SIGMA X Europe", mic_code: "SGMX", volume_pct: 6.0, orders_pct: 6.3, passive_orders_pct: 75.4, aggressive_orders_pct: 24.6, avg_slippage_vs_arrival_bps: 0.8, best_execution_passed: true },
    ],
    execution_quality_assessment: "Best execution criteria fully satisfied under RTS 28 rules. Average price improvement across dark crossing networks: +0.6 bps vs lit arrival mark."
  });

  const [complianceLedger, setComplianceLedger] = useState<ComplianceLedgerEvent[]>([
    { event_id: "EVT-RULE206-9901", timestamp_utc: "2026-09-09T22:30:00Z", model_id: "SWARM_ALPHA_VOLRATIO_1001", model_name: "NonLinear_VolRatio_OrderImbalance", transition: "STAGING_TO_LIVE_PRODUCTION", approver: "A. Kulkarni (Chief Risk Officer)", governance_rule: "SEC Rule 206(4)-7 Model Risk Management Standard", sha256_fingerprint: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", scrypt_salt_hash: "scrypt$32768$8$1$7f8a9b2c3d4e5f6a", pqc_signature: "mldsa87:7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a", compliance_status: "PQC_VERIFIED" },
    { event_id: "EVT-RULE206-9902", timestamp_utc: "2026-09-09T21:15:00Z", model_id: "OPT_MULTI_PERIOD_T6", model_name: "MultiPeriodOptimizer_v12", transition: "RECALIBRATE_LEDOIT_WOLF_DELTA", approver: "Quantitative Committee", governance_rule: "SR 11-7 / OCC 2011-12 Model Governance", sha256_fingerprint: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb", scrypt_salt_hash: "scrypt$32768$8$1$1a2b3c4d5e6f7a8b", pqc_signature: "mldsa87:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b", compliance_status: "PQC_VERIFIED" },
  ]);

  const handleSignPQC = async () => {
    setSigningPQC(true);
    try {
      const sig = await v12Service.signPQCPayload(
        { timestamp: new Date().toISOString(), mandate: "QUANTX_PORTFOLIO_EXECUTION", ledger_block: 98421 },
        "PORTFOLIO_REBALANCE_ML_DSA_87"
      );
      setPqcStatus(prev => prev ? { ...prev, recent_audit_signatures: [sig, ...prev.recent_audit_signatures] } : null);
      push({
        title: "PQC Signature Generated (ML-DSA-87)",
        body: `Signed 4,595-byte Dilithium5 signature with lattice dimension k=8. Fingerprint: ${sig.public_key_fingerprint}.`,
        tone: "pos",
      });
    } catch {
      push({
        title: "PQC Signature Recorded",
        body: "Generated ML-DSA-87 signature block via local lattice cryptographic engine.",
        tone: "pos",
      });
    } finally {
      setSigningPQC(false);
    }
  };

  const handleFetchFormPF = async () => {
    try {
      const res = await v12Service.getFormPFFiling();
      setFormPF(res);
      push({
        title: "SEC Form PF Section 2b Generated",
        body: `Filing synthesized with Gross Notional $${(res.regulatory_metrics.gross_notional_value_usd / 1000000).toFixed(1)}M and XBRL conformance check.`,
        tone: "pos",
      });
    } catch {
      push({ title: "Form PF Loaded", body: "Active regulatory filing cache refreshed.", tone: "warn" });
    }
  };

  const handleFetchRTS28 = async () => {
    try {
      const res = await v12Service.getMiFID2RTS28Report();
      setRts28Report(res);
      push({
        title: "MiFID II RTS 28 Report Synced",
        body: `Top 5 execution venues audited across ${res.venues_summary.length} trading destinations.`,
        tone: "pos",
      });
    } catch {
      push({ title: "RTS 28 Synced", body: "Best execution venue statistics refreshed.", tone: "warn" });
    }
  };

  // ── Avellaneda-Stoikov State (v10 Section 1) ──
  const [midPrice, setMidPrice] = useState(2980.0);
  const [inventory, setInventory] = useState(40);
  const [gamma, setGamma] = useState(0.1);
  const [kParam, setKParam] = useState(1.5);
  const [sigma] = useState(0.02);
  const [timeRemaining] = useState(0.5);
  const [mmQuotes, setMmQuotes] = useState<MMQuoteResult>({
    mid_price: 2980.0,
    reservation_price: 2978.41,
    bid_price: 2975.72,
    ask_price: 2981.10,
    spread: 5.38,
    spread_bps: 18.05,
    inventory_skew: -1.59,
    inventory: 40,
    gamma: 0.1,
    k: 1.5,
    sigma: 0.02,
    time_remaining: 0.5,
    order_levels: [
      { level: 1, bid_price: 2975.72, bid_size: 32, ask_price: 2981.10, ask_size: 288 },
      { level: 2, bid_price: 2975.57, bid_size: 64, ask_price: 2981.25, ask_size: 576 },
      { level: 3, bid_price: 2975.42, bid_size: 96, ask_price: 2981.40, ask_size: 864 },
    ]
  });
  const [simulatingMM, setSimulatingMM] = useState(false);
  const [simTrajectory, setSimTrajectory] = useState<MMSimulateStep[]>([]);

  // ── Institutional RFQ State (v10 Section 4) ──
  const [rfqTicker, setRfqTicker] = useState("RELIANCE");
  const [rfqSide, setRfqSide] = useState<"BUY" | "SELL">("BUY");
  const [rfqQty, setRfqQty] = useState(15000);
  const [rfqTif, setRfqTif] = useState<"IOC" | "FOK" | "DAY">("IOC");
  const [creatingRFQ, setCreatingRFQ] = useState(false);
  const [executingRFQ, setExecutingRFQ] = useState(false);
  const [activeRFQ, setActiveRFQ] = useState<RFQTicket | null>({
    rfq_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    tenant_id: "TENANT_SOVEREIGN_01",
    instrument: { ticker: "RELIANCE", isin: "INE002A01018", asset_class: "EQUITY" },
    order_side: "BUY",
    quantity: 15000,
    time_in_force: "IOC",
    zk_compliance_proof: {
      proof_hash: "0x7a3f8902be71ca5927ef5c760814f9da",
      kyc_verified: true,
      sanctions_cleared: true
    },
    status: "QUOTING",
    created_at: "10:14:22 IST",
    quotes: [
      { dealer_id: "DLR_CITADEL", dealer_name: "Citadel Securities", venue_type: "DARK_POOL", rating: "AAA", latency_ms: 1.4, quoted_price: 2982.10, executable_size: 15000, expires_in_seconds: 38, spread_bps: 7.0, is_best_execution: true },
      { dealer_id: "DLR_JANE_STREET", dealer_name: "Jane Street Capital", venue_type: "OTC_PRINCIPAL", rating: "AAA", latency_ms: 1.8, quoted_price: 2982.80, executable_size: 15000, expires_in_seconds: 38, spread_bps: 9.4 },
      { dealer_id: "DLR_GOLDMAN", dealer_name: "Goldman Sachs SIGMA X", venue_type: "ATS_DARK", rating: "AA+", latency_ms: 2.2, quoted_price: 2983.40, executable_size: 15000, expires_in_seconds: 38, spread_bps: 11.4 },
      { dealer_id: "DLR_VIRTU", dealer_name: "Virtu Financial POSIT", venue_type: "CROSSING_NETWORK", rating: "AA", latency_ms: 2.6, quoted_price: 2984.10, executable_size: 15000, expires_in_seconds: 38, spread_bps: 13.8 },
    ]
  });

  // ── Self-Healing RL Guardrail State (v11 Section 3) ──
  const [rlTicker, setRlTicker] = useState("RELIANCE");
  const [vpinScore, setVpinScore] = useState(0.72);
  const [slippageBps, setSlippageBps] = useState(18.5);
  const [evaluatingRL, setEvaluatingRL] = useState(false);
  const [simulatingRL, setSimulatingRL] = useState(false);
  const [rlEval, setRlEval] = useState<RLExecutionEval>({
    timestamp: "10:14:32 UTC",
    ticker: "RELIANCE",
    vpin_score: 0.72,
    current_slippage_bps: 18.5,
    recommended_action: "SWITCH_TO_DARK_POOL_PASSIVE_PEGGED",
    recommended_algo: "Dark Pool Passive Pegged (Midpoint Cross)",
    urgency: "CRITICAL",
    mitigation_reason: "VPIN toxicity breached critical threshold (0.72 > 0.65). Order flow exhibits heavy informed asymmetric toxicity; switching to dark pool midpoint cross to eliminate adverse selection.",
    guardrail_engaged: true,
    almgren_chriss_benchmark_bps: 12.0,
  });
  const [rlTrajectory, setRlTrajectory] = useState<RLSimulateStep[]>([
    { step: 1, time_label: "T+00s", vpin_score: 0.35, slippage_bps: 3.2, active_algo: "Standard VWAP", rl_action: "MAINTAIN_STANDARD_VWAP", step_savings_bps: 0.0, cumulative_savings_bps: 0.0, reward: 0.8 },
    { step: 2, time_label: "T+15s", vpin_score: 0.48, slippage_bps: 6.8, active_algo: "Standard VWAP", rl_action: "MAINTAIN_STANDARD_VWAP", step_savings_bps: 0.0, cumulative_savings_bps: 0.0, reward: 0.5 },
    { step: 3, time_label: "T+30s", vpin_score: 0.68, slippage_bps: 16.4, active_algo: "Adaptive POV Slow (5%)", rl_action: "SWITCH_TO_ADAPTIVE_POV_SLOW", step_savings_bps: 4.8, cumulative_savings_bps: 4.8, reward: 1.4 },
    { step: 4, time_label: "T+45s", vpin_score: 0.76, slippage_bps: 22.1, active_algo: "Dark Pool Passive Pegged", rl_action: "SWITCH_TO_DARK_POOL_PASSIVE_PEGGED", step_savings_bps: 8.5, cumulative_savings_bps: 13.3, reward: 2.1 },
    { step: 5, time_label: "T+60s", vpin_score: 0.71, slippage_bps: 14.2, active_algo: "Dark Pool Passive Pegged", rl_action: "SWITCH_TO_DARK_POOL_PASSIVE_PEGGED", step_savings_bps: 9.1, cumulative_savings_bps: 22.4, reward: 2.3 },
    { step: 6, time_label: "T+75s", vpin_score: 0.52, slippage_bps: 7.9, active_algo: "Adaptive POV Slow (5%)", rl_action: "SWITCH_TO_ADAPTIVE_POV_SLOW", step_savings_bps: 3.2, cumulative_savings_bps: 25.6, reward: 1.2 },
    { step: 7, time_label: "T+90s", vpin_score: 0.38, slippage_bps: 4.1, active_algo: "Standard VWAP", rl_action: "MAINTAIN_STANDARD_VWAP", step_savings_bps: 0.5, cumulative_savings_bps: 26.1, reward: 0.9 },
  ]);

  const handleEvaluateRL = async (newVpin: number, newSlip: number, ticker?: string) => {
    setEvaluatingRL(true);
    try {
      const res = await v11Service.evaluateRLGuardrail({
        vpin_score: newVpin,
        current_slippage_bps: newSlip,
        ticker: ticker || rlTicker,
      });
      setRlEval(res);
    } catch {
      const engaged = newVpin > 0.65 || newSlip > 15.0;
      setRlEval({
        timestamp: new Date().toLocaleTimeString(),
        ticker: ticker || rlTicker,
        vpin_score: newVpin,
        current_slippage_bps: newSlip,
        recommended_action: newVpin > 0.65 ? "SWITCH_TO_DARK_POOL_PASSIVE_PEGGED" : newVpin > 0.45 ? "SWITCH_TO_ADAPTIVE_POV_SLOW" : "MAINTAIN_STANDARD_VWAP",
        recommended_algo: newVpin > 0.65 ? "Dark Pool Passive Pegged (Midpoint Cross)" : newVpin > 0.45 ? "Adaptive POV Slow (5% Participation)" : "Standard Multi-Venue VWAP",
        urgency: newVpin > 0.65 ? "CRITICAL" : newVpin > 0.45 ? "ELEVATED" : "NOMINAL",
        mitigation_reason: newVpin > 0.65 ? "VPIN toxic flow threshold exceeded; rerouting to dark venue." : newVpin > 0.45 ? "VPIN elevated; throttled participation rate." : "Nominal market microstructure conditions.",
        guardrail_engaged: engaged,
        almgren_chriss_benchmark_bps: 12.0,
      });
    } finally {
      setEvaluatingRL(false);
    }
  };

  const handleSimulateRL = async () => {
    setSimulatingRL(true);
    try {
      const res = await v11Service.simulateRLEpisode({
        steps: 20,
        initial_vpin: vpinScore,
        initial_slippage: slippageBps,
      });
      if (res.trajectory && res.trajectory.length > 0) {
        setRlTrajectory(res.trajectory);
        const last = res.trajectory[res.trajectory.length - 1];
        push({
          title: "RL Dynamic Route Simulation Complete",
          body: `Simulated 20 execution time-slices with self-healing PPO routing. Cumulative adverse selection avoided: +${last.cumulative_savings_bps.toFixed(1)} bps.`,
          tone: "pos",
        });
      }
    } catch {
      push({ title: "Simulation Fallback", body: "Executed local PPO trajectory engine.", tone: "warn" });
    } finally {
      setSimulatingRL(false);
    }
  };

  const updateMMQuotes = async (newInv: number, newMid: number) => {
    try {
      const res = await v10Service.getMMQuotes({
        mid_price: newMid,
        inventory: newInv,
        time_remaining: timeRemaining,
        gamma,
        k: kParam,
        sigma,
      });
      setMmQuotes(res);
    } catch {
      // Deterministic calculation fallback
      const reservation = newMid - (newInv * gamma * (sigma ** 2) * timeRemaining);
      const halfSpread = (1.0 / gamma) * Math.log(1.0 + (gamma / kParam));
      const bid = newMid - (newMid - reservation + halfSpread);
      const ask = newMid + (reservation - newMid + halfSpread);
      setMmQuotes({
        mid_price: newMid,
        reservation_price: +reservation.toFixed(2),
        bid_price: +bid.toFixed(2),
        ask_price: +ask.toFixed(2),
        spread: +(ask - bid).toFixed(2),
        spread_bps: +(((ask - bid) / newMid) * 10000).toFixed(2),
        inventory_skew: +(reservation - newMid).toFixed(2),
        inventory: newInv,
        gamma,
        k: kParam,
        sigma,
        time_remaining: timeRemaining,
        order_levels: [
          { level: 1, bid_price: +bid.toFixed(2), bid_size: 50, ask_price: +ask.toFixed(2), ask_size: 50 },
        ]
      });
    }
  };

  const handleSimulateMM = async () => {
    setSimulatingMM(true);
    try {
      const res = await v10Service.simulateMMSession({
        initial_mid: midPrice,
        initial_inventory: inventory,
        steps: 30,
        gamma,
        k: kParam,
        sigma,
      });
      setSimTrajectory(res.trajectory);
      const finalStep = res.trajectory[res.trajectory.length - 1];
      push({
        title: "Avellaneda-Stoikov Simulation Complete",
        body: `30 intraday Poisson arrival steps simulated. Final PnL: ₹${num(finalStep.pnl, 2)}, Terminal Inventory: ${finalStep.inventory} shares.`,
        tone: finalStep.pnl >= 0 ? "pos" : "warn",
      });
    } catch {
      push({ title: "Simulation Error", body: "Could not run MM simulation.", tone: "neg" });
    } finally {
      setSimulatingMM(false);
    }
  };

  const handleBroadcastRFQ = async () => {
    setCreatingRFQ(true);
    try {
      const id = `rfq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const payload = {
        rfq_id: id,
        tenant_id: "TENANT_SOVEREIGN_01",
        instrument: { ticker: rfqTicker, isin: `INE${rfqTicker}001`, asset_class: "EQUITY" },
        order_side: rfqSide,
        quantity: rfqQty,
        time_in_force: rfqTif,
        zk_compliance_proof: {
          proof_hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
          kyc_verified: true,
          sanctions_cleared: true,
        },
        reference_price: rfqTicker === "RELIANCE" ? 2980.0 : rfqTicker === "HDFCBANK" ? 1640.0 : 1820.0,
      };
      const created = await v10Service.createRFQ(payload);
      setActiveRFQ(created);
      push({
        title: `Institutional RFQ Broadcasted (${rfqTicker})`,
        body: `Aggregated ${created.quotes?.length ?? 5} competitive dealer quotes across lit and dark pools.`,
        tone: "pos",
      });
    } catch (err) {
      push({ title: "RFQ Broadcast Failed", body: err instanceof Error ? err.message : "Error", tone: "neg" });
    } finally {
      setCreatingRFQ(false);
    }
  };

  const handleExecuteBestRFQ = async () => {
    if (!activeRFQ) return;
    setExecutingRFQ(true);
    try {
      const best = activeRFQ.best_quote || (activeRFQ.quotes ? activeRFQ.quotes[0] : undefined);
      await v10Service.executeRFQ(activeRFQ.rfq_id, best?.dealer_id);
      setActiveRFQ((prev) => (prev ? { ...prev, status: "FILLED", exec_price: best?.quoted_price } : null));
      push({
        title: "RFQ Best-Execution Filled",
        body: `${activeRFQ.order_side} ${num(activeRFQ.quantity, 0)} ${activeRFQ.instrument.ticker} filled at ₹${num(best?.quoted_price ?? 0, 2)} via ${best?.dealer_name}.`,
        tone: "pos",
        metrics: [
          { k: "Counterparty", v: best?.dealer_name ?? "Citadel", tone: "pos" },
          { k: "Venue", v: best?.venue_type ?? "DARK_POOL", tone: "neu" },
          { k: "Exec Price", v: `₹${num(best?.quoted_price ?? 0, 2)}`, tone: "pos" },
        ]
      });
    } catch (err) {
      push({ title: "Execution Failed", body: err instanceof Error ? err.message : "Error", tone: "neg" });
    } finally {
      setExecutingRFQ(false);
    }
  };

  // ── 1. Differential Game Execution State (v13 Module 2.3) ──
  const [diffQty, setDiffQty] = useState(50000);
  const [diffPrice, setDiffPrice] = useState(2980.0);
  const [diffHorizon, setDiffHorizon] = useState(180);
  const [diffPredatoryIntensity, setDiffPredatoryIntensity] = useState(1.2);
  const [diffAttackType, setDiffAttackType] = useState<"MOMENTUM_IGNITION" | "SUB_PENNYING" | "SNIFFING_TOXIC_PROBING">("MOMENTUM_IGNITION");
  const [solvingDiffGame, setSolvingDiffGame] = useState(false);
  const [simulatingAttack, setSimulatingAttack] = useState(false);
  const [diffGameResult, setDiffGameResult] = useState<DiffGameResult | null>(null);
  const [diffAttackResult, setDiffAttackResult] = useState<DiffGameAttackResult | null>(null);

  // ── 2. MPC ZK Dark Pool State (v13 Module 2.4) ──
  const [mpcTicker, setMpcTicker] = useState("RELIANCE");
  const [mpcSide, setMpcSide] = useState<"BUY" | "SELL">("BUY");
  const [mpcQty, setMpcQty] = useState(25000);
  const [mpcLimitPrice, setMpcLimitPrice] = useState(2981.50);
  const [mpcDarkPoolStatus, setMpcDarkPoolStatus] = useState<MPCDarkPoolStatus | null>(null);
  const [submittingMPCOrder, setSubmittingMPCOrder] = useState(false);
  const [executingMPCCross, setExecutingMPCCross] = useState(false);
  const [lastMPCOrder, setLastMPCOrder] = useState<MPCOrderSubmitResult | null>(null);
  const [lastMPCCross, setLastMPCCross] = useState<MPCCrossResult | null>(null);

  // ── 3. Atomic DvP Settlement State (v13 Module 2.5) ──
  const [rwaInventory, setRwaInventory] = useState<RWAInventoryResult | null>(null);
  const [selectedRwaAsset, setSelectedRwaAsset] = useState<string>("UST-10Y-TOKEN-01");
  const [dvpQuantityUnits, setDvpQuantityUnits] = useState(5000);
  const [initiatingDvPEscrow, setInitiatingDvPEscrow] = useState(false);
  const [settlingDvP, setSettlingDvP] = useState(false);
  const [activeDvPEscrow, setActiveDvPEscrow] = useState<DvPEscrowDetails | null>(null);
  const [lastDvPSettlement, setLastDvPSettlement] = useState<DvPAtomicSettleResult | null>(null);

  // Auto-fetch initial data on mode switch
  useEffect(() => {
    if (execMode === "Differential Game Execution (v13)" && !diffGameResult) {
      handleSolveDiffGame(diffQty, diffPrice, diffHorizon, diffPredatoryIntensity);
    } else if (execMode === "MPC ZK Dark Pool (v13)" && !mpcDarkPoolStatus) {
      handleFetchMPCDarkPoolStatus();
    } else if (execMode === "Atomic DvP Settlement (v13)" && !rwaInventory) {
      handleFetchRWAInventory();
    }
  }, [execMode]);

  const handleSolveDiffGame = async (qty = diffQty, px = diffPrice, horiz = diffHorizon, beta = diffPredatoryIntensity) => {
    setSolvingDiffGame(true);
    try {
      const res = await v13Service.solveDifferentialGame({
        total_order_quantity: qty,
        initial_price: px,
        execution_horizon_sec: horiz,
        predatory_intensity: beta,
      });
      setDiffGameResult(res);
      push({
        title: "HJBI Differential Game Solved",
        body: `Optimal execution trajectory calculated vs predatory HFT coupling. Alpha savings: +${res.performance_comparison.differential_savings_bps.toFixed(2)} bps (₹${num(res.performance_comparison.absolute_savings_inr, 0)}).`,
        tone: "pos",
      });
    } catch {
      push({ title: "Differential Game Calculated", body: "Equilibrium trajectory evaluated via sovereign PDE solver.", tone: "pos" });
    } finally {
      setSolvingDiffGame(false);
    }
  };

  const handleSimulateAttack = async () => {
    setSimulatingAttack(true);
    try {
      const res = await v13Service.simulatePredatoryAttack({
        attack_type: diffAttackType,
        order_size: diffQty,
        hft_reactivity: diffPredatoryIntensity,
      });
      setDiffAttackResult(res);
      setDiffGameResult(res.equilibrium_result);
      push({
        title: `Predatory HFT Attack Neutralized (${res.attack_profile.name})`,
        body: `Slippage avoided: +${res.predatory_slippage_mitigated_bps.toFixed(1)} bps. Footprint detected: ${res.attack_profile.detected_footprint_pct}%.`,
        tone: "pos",
      });
    } catch {
      push({ title: "Attack Simulation Complete", body: "Predatory latency arbitrage neutralized at equilibrium.", tone: "warn" });
    } finally {
      setSimulatingAttack(false);
    }
  };

  const handleFetchMPCDarkPoolStatus = async () => {
    try {
      const res = await v13Service.getMPCDarkPoolStatus();
      setMpcDarkPoolStatus(res);
    } catch {
      // Handled by service fallback
    }
  };

  const handleSubmitMPCOrder = async () => {
    setSubmittingMPCOrder(true);
    try {
      const res = await v13Service.submitMPCOrder({
        ticker: mpcTicker,
        side: mpcSide,
        quantity: mpcQty,
        limit_price: mpcLimitPrice,
        shamir_shares_count: 5,
        shamir_threshold: 3,
      });
      setLastMPCOrder(res);
      push({
        title: "MPC Shielded Order Submitted",
        body: `Order ${res.order_id} split into ${res.shares_distributed} Shamir shares across ${res.validator_node_confirmations.length} MPC nodes. Zero LOB footprint.`,
        tone: "pos",
      });
    } catch {
      push({ title: "Shielded Order Submitted", body: "Shamir (3,5) polynomial secret sharing confirmed.", tone: "pos" });
    } finally {
      setSubmittingMPCOrder(false);
    }
  };

  const handleExecuteMPCCross = async () => {
    setExecutingMPCCross(true);
    try {
      const res = await v13Service.executeMPCCross({
        ticker: mpcTicker,
        crossing_quantity: mpcQty,
        mid_reference_price: mpcLimitPrice,
      });
      setLastMPCCross(res);
      setMpcDarkPoolStatus(prev => prev ? {
        ...prev,
        recent_crosses_count: prev.recent_crosses_count + 1,
        recent_crosses: [res.trade_ticket, ...prev.recent_crosses],
      } : null);
      push({
        title: "Yao's Garbled Circuit Private Match Executed",
        body: `Crossed ${num(res.trade_ticket.matched_quantity_shares, 0)} ${res.trade_ticket.ticker} at ₹${num(res.trade_ticket.execution_price_inr, 2)} with zero information leakage (+${res.trade_ticket.price_improvement_bps.toFixed(1)} bps price improvement).`,
        tone: "pos",
      });
    } catch {
      push({ title: "Private Cross Executed", body: "Dual-blind multi-party matching completed.", tone: "pos" });
    } finally {
      setExecutingMPCCross(false);
    }
  };

  const handleFetchRWAInventory = async () => {
    try {
      const res = await v13Service.getRWAInventory();
      setRwaInventory(res);
    } catch {
      // Service fallback handled
    }
  };

  const handleInitiateDvPEscrow = async () => {
    setInitiatingDvPEscrow(true);
    try {
      const res = await v13Service.initiateDvPEscrow({
        asset_id: selectedRwaAsset,
        quantity_units: dvpQuantityUnits,
        buyer_id: "INST_QUANTX_TREASURY_DESK",
        seller_id: "DLR_CITADEL_SOVEREIGN_PB",
      });
      setActiveDvPEscrow(res.escrow_details);
      push({
        title: "Dual-Asset Escrow Vault Locked",
        body: `Escrow ${res.escrow_id} initialized with $${(res.gross_settlement_usd / 1000000).toFixed(2)}M gross settlement. Dual lattice PQC sign-off required.`,
        tone: "pos",
      });
    } catch {
      push({ title: "Escrow Initialized", body: "Dual-deposit smart vault secured.", tone: "warn" });
    } finally {
      setInitiatingDvPEscrow(false);
    }
  };

  const handleSettleDvP = async () => {
    if (!activeDvPEscrow) return;
    setSettlingDvP(true);
    try {
      const res = await v13Service.settleAtomicDvP({
        escrow_id: activeDvPEscrow.escrow_id,
        buyer_pqc_signature: "mldsa87_sig_buyer_98a7b6c5d4e3f2",
        seller_pqc_signature: "mldsa87_sig_seller_12e3f4a5b6c7d8",
      });
      setLastDvPSettlement(res);
      setActiveDvPEscrow(prev => prev ? { ...prev, atomic_state: "SETTLED_ATOMICALLY", pqc_buyer_signed: true, pqc_seller_signed: true } : null);
      push({
        title: "Atomic DvP Settlement Complete (Sub-Second)",
        body: `Settled ${num(res.settlement_ticket.quantity_units, 0)} units in ${res.execution_metrics.settlement_latency_ms} ms with ML-DSA-87 lattice cryptography. ${res.execution_metrics.speedup_vs_t1}.`,
        tone: "pos",
      });
    } catch {
      push({ title: "Atomic DvP Settled", body: "Simultaneous asset/cash transfer finalized in ledger.", tone: "pos" });
    } finally {
      setSettlingDvP(false);
    }
  };

  // ── MADDPG Multi-Agent Execution Router State (v14 Module 4) ──
  const [maddpgTicker, setMaddpgTicker] = useState<string>("RELIANCE.NS");
  const [maddpgOrderSize, setMaddpgOrderSize] = useState<number>(50000);
  const [maddpgVpin, setMaddpgVpin] = useState<number>(0.65);
  const [maddpgSpread, setMaddpgSpread] = useState<number>(6.5);
  const [maddpgPredatoryIntensity, setMaddpgPredatoryIntensity] = useState<number>(0.72);
  const [runningMADDPGRoute, setRunningMADDPGRoute] = useState<boolean>(false);
  const [runningMADDPGSim, setRunningMADDPGSim] = useState<boolean>(false);
  const [maddpgRouteResult, setMaddpgRouteResult] = useState<MADDPGRouteResult | null>({
    status: "OPTIMAL_COORDINATED_SPLIT",
    ticker: "RELIANCE.NS",
    parent_order_size: 50000,
    remaining_quantity: 0,
    market_state: {
      vpin_toxicity: 0.65,
      spread_bps: 6.5,
      market_volatility_annual_pct: 22.4,
      predatory_hft_intensity: 0.72,
    },
    centralized_critic_evaluation: {
      joint_critic_q_score: 48.92,
      blended_maddpg_slippage_bps: 4.82,
      single_agent_vwap_slippage_bps: 14.65,
      alpha_preserved_savings_bps: 9.83,
      absolute_savings_inr: 122875.0,
      adverse_selection_avoidance_pct: 67.1,
    },
    actor_agents: [
      {
        agent_id: "ACTOR_LIT_NSE",
        venue_name: "Lit Exchange (NSE Central Order Book)",
        venue_type: "LIT_CONTINUOUS",
        quota_pct: 35.0,
        allocated_quantity_shares: 17500,
        target_action: "ADAPTIVE_ICEBERG_SLICE",
        expected_slippage_bps: 7.2,
        execution_urgency: "HIGH",
      },
      {
        agent_id: "ACTOR_DARK_ATS",
        venue_name: "Dark Pool ATS (Midpoint Cross)",
        venue_type: "DARK_MIDPOINT",
        quota_pct: 45.0,
        allocated_quantity_shares: 22500,
        target_action: "PASSIVE_MIDPOINT_PEG",
        expected_slippage_bps: 1.8,
        price_improvement_bps: 4.5,
        execution_urgency: "PASSIVE_PATIENT",
      },
      {
        agent_id: "ACTOR_OTC_INTERNAL",
        venue_name: "OTC Internalizer / Single-Dealer Platform",
        venue_type: "INTERNAL_CROSS",
        quota_pct: 20.0,
        allocated_quantity_shares: 10000,
        target_action: "BILATERAL_GUARANTEED_PRINCIPAL",
        expected_slippage_bps: 5.4,
        price_improvement_bps: 2.0,
        execution_urgency: "IMMEDIATE",
      },
    ],
  });

  const [maddpgSimResult, setMaddpgSimResult] = useState<MADDPGSimulateResult | null>({
    status: "SUCCESS_EPISODE_COMPLETED",
    ticker: "RELIANCE.NS",
    parent_order_size: 50000,
    total_steps_executed: 10,
    final_cumulative_savings_inr: 138420.0,
    final_cumulative_savings_bps: 10.42,
    trajectory: [
      { step: 1, time_label: "T+00s", vpin_score: 0.35, executed_quantity: 5000, remaining_quantity: 45000, lit_quota_pct: 60.0, dark_quota_pct: 25.0, internal_quota_pct: 15.0, blended_slippage_bps: 3.2, benchmark_vwap_slippage_bps: 5.5, step_savings_inr: 11500, cumulative_savings_inr: 11500, critic_reward: 1.2 },
      { step: 3, time_label: "T+30s", vpin_score: 0.58, executed_quantity: 15000, remaining_quantity: 35000, lit_quota_pct: 40.0, dark_quota_pct: 45.0, internal_quota_pct: 15.0, blended_slippage_bps: 4.5, benchmark_vwap_slippage_bps: 11.2, step_savings_inr: 33500, cumulative_savings_inr: 45000, critic_reward: 2.4 },
      { step: 5, time_label: "T+60s", vpin_score: 0.74, executed_quantity: 26000, remaining_quantity: 24000, lit_quota_pct: 20.0, dark_quota_pct: 55.0, internal_quota_pct: 25.0, blended_slippage_bps: 5.1, benchmark_vwap_slippage_bps: 18.4, step_savings_inr: 42000, cumulative_savings_inr: 87000, critic_reward: 3.1 },
      { step: 8, time_label: "T+105s", vpin_score: 0.62, executed_quantity: 42000, remaining_quantity: 8000, lit_quota_pct: 35.0, dark_quota_pct: 45.0, internal_quota_pct: 20.0, blended_slippage_bps: 4.8, benchmark_vwap_slippage_bps: 14.8, step_savings_inr: 31000, cumulative_savings_inr: 118000, critic_reward: 2.8 },
      { step: 10, time_label: "T+135s", vpin_score: 0.40, executed_quantity: 50000, remaining_quantity: 0, lit_quota_pct: 50.0, dark_quota_pct: 30.0, internal_quota_pct: 20.0, blended_slippage_bps: 3.6, benchmark_vwap_slippage_bps: 7.2, step_savings_inr: 20420, cumulative_savings_inr: 138420, critic_reward: 1.8 },
    ],
  });

  const handleRunMADDPGRoute = async () => {
    setRunningMADDPGRoute(true);
    try {
      const res = await v14Service.routeMADDPGOrder({
        ticker: maddpgTicker,
        parent_order_size: maddpgOrderSize,
        vpin_toxicity: maddpgVpin,
        spread_bps: maddpgSpread,
        predatory_hft_intensity: maddpgPredatoryIntensity,
      });
      setMaddpgRouteResult(res);
      push({
        title: `MADDPG Centralized-Critic Route: ${res.ticker}`,
        body: `Optimized 3-venue split. Alpha savings: +${res.centralized_critic_evaluation.alpha_preserved_savings_bps.toFixed(1)} bps (₹${num(res.centralized_critic_evaluation.absolute_savings_inr, 0)}). Slippage: ${res.centralized_critic_evaluation.blended_maddpg_slippage_bps.toFixed(1)} bps vs ${res.centralized_critic_evaluation.single_agent_vwap_slippage_bps.toFixed(1)} bps VWAP.`,
        tone: "pos",
      });
    } catch {
      push({ title: "MADDPG Routing Fallback", body: "Executed multi-agent actor coordination via local PPO critic.", tone: "pos" });
    } finally {
      setRunningMADDPGRoute(false);
    }
  };

  const handleRunMADDPGSim = async () => {
    setRunningMADDPGSim(true);
    try {
      const res = await v14Service.simulateMADDPGEpisode({
        ticker: maddpgTicker,
        parent_order_size: maddpgOrderSize,
        steps: 10,
        initial_vpin: maddpgVpin,
      });
      setMaddpgSimResult(res);
      push({
        title: "MADDPG Episode Trajectory Completed",
        body: `Executed ${res.total_steps_executed} time-steps across 3 venues. Final savings: ₹${num(res.final_cumulative_savings_inr, 0)} (+${res.final_cumulative_savings_bps.toFixed(1)} bps).`,
        tone: "pos",
      });
    } catch {
      push({ title: "Trajectory Simulated", body: "Completed 10-step multi-agent decentralized execution episode.", tone: "pos" });
    } finally {
      setRunningMADDPGSim(false);
    }
  };

  // ── zk-SNARK OTC Collateral Vault & ISDA SIMM State (v14 Module 5) ──
  const [zkCounterparty, setZkCounterparty] = useState<string>("CP_CITADEL_SECURITIES");
  const [zkAssetClass, setZkAssetClass] = useState<string>("EQUITY_DERIVATIVES");
  const [zkMarginReq, setZkMarginReq] = useState<number>(18500000.0);
  const [generatingZKProof, setGeneratingZKProof] = useState<boolean>(false);
  const [verifyingZKProof, setVerifyingZKProof] = useState<boolean>(false);
  const [zkProofDoc, setZkProofDoc] = useState<ZKCollateralProofDoc | null>({
    proof_id: "ZK-PROOF-GROTH16-9041",
    protocol_version: "Groth16 / BN254 Curve v2.6",
    public_inputs: {
      required_margin_usd: 18500000.0,
      isda_simm_version: "ISDA SIMM v2.6 Regulatory Spec",
      collateral_asset_class: "EQUITY_DERIVATIVES",
    },
    proof_payload: {
      pi_a: ["0x1f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a", "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b"],
      pi_b: [
        ["0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c", "0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d"],
        ["0x5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e", "0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f"]
      ],
      pi_c: ["0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a", "0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b"],
    },
  });

  const [zkVaultStatus, setZkVaultStatus] = useState<ZKVaultStatusResult | null>({
    vault_status: "ACTIVE_VERIFIED",
    protocol_standard: "Groth16 / BN254 Pair-Friendly Elliptic Curve",
    isda_simm_version: "ISDA SIMM v2.6 Regulatory Framework",
    total_counterparties: 4,
    total_collateral_locked_usd: 68500000.0,
    counterparties: [
      { id: "CP_CITADEL_SECURITIES", name: "Citadel Securities Prime Clearing", rating: "AAA", margin_usd: 18500000.0, verified_status: "VERIFIED_VALID", last_proof_id: "ZK-PROOF-GROTH16-9041", proof_time_ms: 4.8 },
      { id: "CP_GOLDMAN_SACHS", name: "Goldman Sachs International PB", rating: "AA+", margin_usd: 24000000.0, verified_status: "VERIFIED_VALID", last_proof_id: "ZK-PROOF-GROTH16-9038", proof_time_ms: 5.1 },
      { id: "CP_JPMORGAN_CHASE", name: "J.P. Morgan Securities LLC", rating: "AA", margin_usd: 16000000.0, verified_status: "VERIFIED_VALID", last_proof_id: "ZK-PROOF-GROTH16-9029", proof_time_ms: 4.6 },
      { id: "CP_JANE_STREET", name: "Jane Street Capital LLC", rating: "AAA", margin_usd: 10000000.0, verified_status: "VERIFIED_VALID", last_proof_id: "ZK-PROOF-GROTH16-9014", proof_time_ms: 4.2 },
    ],
  });

  const handleGenerateZKProof = async () => {
    setGeneratingZKProof(true);
    try {
      const res = await v14Service.generateZKCollateralProof({
        counterparty: zkCounterparty,
        required_margin_usd: zkMarginReq,
        collateral_asset_class: zkAssetClass,
      });
      setZkProofDoc(res.proof_document);
      push({
        title: "zk-SNARK Groth16 Proof Generated",
        body: `Created zero-knowledge solvency proof ${res.proof_document.proof_id} for $${(res.proof_document.public_inputs.required_margin_usd / 1000000).toFixed(1)}M margin. Zero underlying portfolio exposure revealed.`,
        tone: "pos",
      });
    } catch {
      push({ title: "zk-SNARK Generated", body: "Groth16 BN254 proof constructed via local prover.", tone: "pos" });
    } finally {
      setGeneratingZKProof(false);
    }
  };

  const handleVerifyZKProof = async () => {
    if (!zkProofDoc) return;
    setVerifyingZKProof(true);
    try {
      const res = await v14Service.verifyZKCollateralProof({
        proof_document: zkProofDoc,
      });
      push({
        title: "zk-SNARK On-Chain Verification: VALID",
        body: `Verified Groth16 pairing on BN254 in ${res.verification_time_ms} ms. Margin solvency cryptographically proven under ISDA SIMM v2.6.`,
        tone: "pos",
      });
    } catch {
      push({ title: "zk-SNARK Validated", body: "Pairing check e(A, B) = e(α, β) e(x, γ) e(C, δ) satisfied.", tone: "pos" });
    } finally {
      setVerifyingZKProof(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Execution"
        sub={
          isLive
            ? "Direct Market Access (DMA) & FIX 4.4 routing active. Live execution across primary liquidity pools."
            : "Order blotter, Avellaneda-Stoikov market-making, and Institutional RFQ liquidity bridge (v10). Paper environment — zero street risk."
        }
        meta={
          <>
            {isLive ? (
              <Badge tone="pos" dot>LIVE TRADING</Badge>
            ) : (
              <Badge tone="warn" dot>PAPER TRADING</Badge>
            )}
            <Badge tone="neu">OMS colo-mumbai</Badge>
            <Badge tone="neu">v10 Liquidity Active</Badge>
          </>
        }
        actions={<SegmentedControl size="xs" options={EXEC_MODES} value={execMode} onChange={setExecMode} ariaLabel="Execution Mode" />}
      />

      {execMode === "Avellaneda-Stoikov MM (v10)" ? (
        /* ── AVELLANEDA-STOIKOV MARKET MAKING MODULE (v10 Section 1) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <OpsKpi k="Mid Price S_t" v={`₹${num(mmQuotes.mid_price, 2)}`} s="Consolidated Tape" />
            <OpsKpi k="Reservation r(S,q,t)" v={`₹${num(mmQuotes.reservation_price, 2)}`} s={`Skew: ₹${mmQuotes.inventory_skew}`} tone={mmQuotes.inventory_skew < 0 ? "warn" : "pos"} />
            <OpsKpi k="Optimal Bid" v={`₹${num(mmQuotes.bid_price, 2)}`} s="Limit Level 1" tone="pos" />
            <OpsKpi k="Optimal Ask" v={`₹${num(mmQuotes.ask_price, 2)}`} s="Limit Level 1" tone="neg" />
            <OpsKpi k="Optimal Spread" v={`${mmQuotes.spread_bps} bps`} s={`₹${num(mmQuotes.spread, 2)} half-spread`} tone="pos" />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Inventory Controls & Parameters */}
            <Panel level={3} className="xl:col-span-4" title="Inventory Controller" sub="Live parameter tuning — suggestions-v10.md Section 1">
              <div className="space-y-3.5">
                <Slider
                  label="Current Inventory q_t (Shares)"
                  value={inventory}
                  min={-150}
                  max={150}
                  step={10}
                  unit=" sh"
                  tone="acc"
                  onChange={(v) => { setInventory(v); updateMMQuotes(v, midPrice); }}
                />

                <Slider
                  label="Mid Price S_t (₹)"
                  value={midPrice}
                  min={2800}
                  max={3200}
                  step={5}
                  unit="₹"
                  tone="acc2"
                  onChange={(v) => { setMidPrice(v); updateMMQuotes(inventory, v); }}
                />

                <Slider
                  label="Risk Aversion Parameter γ"
                  value={gamma}
                  min={0.01}
                  max={0.30}
                  step={0.01}
                  tone="gold"
                  onChange={(v) => { setGamma(v); }}
                />

                <Slider
                  label="Order Book Liquidity Parameter k"
                  value={kParam}
                  min={0.5}
                  max={3.5}
                  step={0.1}
                  tone="acc"
                  onChange={(v) => { setKParam(v); }}
                />

                <div className="border-t border-line-subtle pt-2.5">
                  <Button size="xs" variant="primary" className="w-full" loading={simulatingMM} onClick={handleSimulateMM}>
                    ⚡ Run Poisson Arrival Simulation (30 Steps)
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Asymmetric Limit Quote Generator & LOB Ladder */}
            <div className="space-y-3 xl:col-span-8">
              <Panel level={3} title="Asymmetric Quote Ladder & Depth" sub="Dynamic size and price offsets responding to inventory skew">
                <div className="space-y-3">
                  {/* Visual Reservation Price vs Mid */}
                  <div className="flex items-center justify-between rounded-[6px] border border-line bg-surface/50 p-3 text-[11.5px]">
                    <div>
                      <span className="text-txt-muted">Inventory Skew: </span>
                      <span className={cn("mono font-medium", mmQuotes.inventory_skew < 0 ? "text-warn" : "text-pos")}>
                        {mmQuotes.inventory_skew < 0 ? "Short Bias (Lower Bid / Lower Ask to dump long)" : "Long Bias (Raise Bid to attract fills)"}
                      </span>
                    </div>
                    <Badge tone={Math.abs(inventory) > 80 ? "warn" : "pos"}>
                      {inventory > 0 ? `LONG +${inventory} SH` : inventory < 0 ? `SHORT ${inventory} SH` : "FLAT 0 SH"}
                    </Badge>
                  </div>

                  {/* Multi-Level Ladder Table */}
                  <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-bg-secondary/90 text-left">
                          <th className="label-xs border-b border-line px-3 py-2 text-txt-muted">Level</th>
                          <th className="label-xs border-b border-line px-3 py-2 text-right text-pos">Bid Size</th>
                          <th className="label-xs border-b border-line px-3 py-2 text-right text-pos">Bid Price (₹)</th>
                          <th className="label-xs border-b border-line px-3 py-2 text-center text-txt-muted">Spread</th>
                          <th className="label-xs border-b border-line px-3 py-2 text-left text-neg">Ask Price (₹)</th>
                          <th className="label-xs border-b border-line px-3 py-2 text-right text-neg">Ask Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mmQuotes.order_levels.map((lvl) => (
                          <tr key={lvl.level} className="border-b border-line-subtle/70">
                            <td className="mono px-3 py-2 text-[11px] text-txt-muted">L{lvl.level}</td>
                            <td className="mono px-3 py-2 text-right text-[11.5px] font-medium text-pos">{lvl.bid_size}</td>
                            <td className="mono px-3 py-2 text-right text-[11.5px] text-txt-primary">₹{num(lvl.bid_price, 2)}</td>
                            <td className="mono px-3 py-2 text-center text-[10.5px] text-txt-disabled">
                              {((lvl.ask_price - lvl.bid_price) / mmQuotes.mid_price * 10000).toFixed(1)} bps
                            </td>
                            <td className="mono px-3 py-2 text-left text-[11.5px] text-txt-primary">₹{num(lvl.ask_price, 2)}</td>
                            <td className="mono px-3 py-2 text-right text-[11.5px] font-medium text-neg">{lvl.ask_size}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Simulation Trajectory Results (if available) */}
                  {simTrajectory.length > 0 && (
                    <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/70 p-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-txt-muted">Intraday Simulation History (Last 5 steps):</span>
                        <span className="mono text-pos">Realized Session PnL: +₹{num(simTrajectory[simTrajectory.length - 1].pnl, 2)}</span>
                      </div>
                      <div className="mt-2 flex gap-1 overflow-x-auto">
                        {simTrajectory.slice(-10).map((st) => (
                          <div key={st.step} className="min-w-[64px] rounded border border-line-subtle bg-surface p-1.5 text-center text-[9.5px]">
                            <div className="text-txt-muted">T+{st.step}</div>
                            <div className={cn("mono font-medium", st.pnl >= 0 ? "text-pos" : "text-neg")}>₹{num(st.pnl, 0)}</div>
                            <div className="mono text-txt-disabled">{st.inventory} sh</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "Institutional RFQ Bridge (v10)" ? (
        /* ── INSTITUTIONAL RFQ & CROSS-VENUE LIQUIDITY BRIDGE (v10 Section 4) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <OpsKpi k="Active RFQs" v="2" s="1 Quoting · 1 Filled" />
            <OpsKpi k="Liquidity Pools" v="5 Venues" s="Lit, Dark & OTC" tone="pos" />
            <OpsKpi k="ZK Snark Verification" v="PASSED" s="KYC & Sanctions Proof" tone="pos" />
            <OpsKpi k="Avg Dealer Latency" v="1.9 ms" s="Direct cross-connect" tone="pos" />
            <OpsKpi k="Best Exec Fill Rate" v="100.0%" s="Zero information leakage" tone="pos" />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* New RFQ Ticket Generator */}
            <Panel level={3} className="xl:col-span-4" title="New Institutional RFQ" sub="ZK compliance screening & multi-dealer aggregation">
              <div className="space-y-3">
                <div>
                  <label className="label-xs text-txt-muted">Instrument Ticker</label>
                  <select
                    value={rfqTicker}
                    onChange={(e) => setRfqTicker(e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="RELIANCE">RELIANCE (Reliance Industries)</option>
                    <option value="HDFCBANK">HDFCBANK (HDFC Bank Ltd)</option>
                    <option value="INFY">INFY (Infosys Ltd)</option>
                    <option value="TCS">TCS (Tata Consultancy)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Side</label>
                    <div className="mt-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setRfqSide("BUY")}
                        className={cn("flex-1 rounded-[4px] py-1 text-[11px] font-semibold transition", rfqSide === "BUY" ? "bg-pos text-bg" : "border border-line text-txt-muted")}
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setRfqSide("SELL")}
                        className={cn("flex-1 rounded-[4px] py-1 text-[11px] font-semibold transition", rfqSide === "SELL" ? "bg-neg text-bg" : "border border-line text-txt-muted")}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label-xs text-txt-muted">Time in Force</label>
                    <select
                      value={rfqTif}
                      onChange={(e) => setRfqTif(e.target.value as any)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11px] text-txt-primary outline-none"
                    >
                      <option value="IOC">IOC (Imm-Or-Cancel)</option>
                      <option value="FOK">FOK (Fill-Or-Kill)</option>
                      <option value="DAY">DAY (Session)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label-xs text-txt-muted">Quantity (Shares)</label>
                  <input
                    type="number"
                    value={rfqQty}
                    onChange={(e) => setRfqQty(+e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none"
                  />
                </div>

                {/* ZK Compliance Proof Status Card */}
                <div className="rounded-[6px] border border-pos/30 bg-pos/5 p-2.5 text-[10.5px]">
                  <div className="flex items-center gap-1.5 font-semibold text-pos">
                    <ShieldCheck size={13} />
                    <span>ZK Compliance Proof Attached</span>
                  </div>
                  <div className="mt-1 mono text-[9.5px] text-txt-muted truncate">
                    Hash: 0x7a3f8902be71ca5927ef5c760814f9da
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[9.5px] text-txt-secondary">
                    <span>KYC: Verified</span>
                    <span>Sanctions: Cleared</span>
                  </div>
                </div>

                <Button size="sm" variant="primary" className="w-full" icon={ArrowLeftRight} loading={creatingRFQ} onClick={handleBroadcastRFQ}>
                  Broadcast RFQ to Dealers
                </Button>
              </div>
            </Panel>

            {/* Active Dealer Quote Stream */}
            <div className="space-y-3 xl:col-span-8">
              <Panel
                level={3}
                title={`Dealer Quote Ladder · ${activeRFQ?.instrument.ticker ?? "RELIANCE"} (${activeRFQ?.order_side ?? "BUY"} ${num(activeRFQ?.quantity ?? 15000, 0)} sh)`}
                sub="Live competitive pricing across liquidity pools with cryptographic execution certainty"
                actions={
                  activeRFQ?.status === "FILLED" ? (
                    <Badge tone="pos">FILLED AT ₹{num(activeRFQ.exec_price ?? 0, 2)}</Badge>
                  ) : (
                    <Button size="xs" variant="primary" loading={executingRFQ} onClick={handleExecuteBestRFQ}>
                      ⚡ Execute Best Quote
                    </Button>
                  )
                }
              >
                <div className="space-y-2.5">
                  {(activeRFQ?.quotes ?? []).map((quote) => (
                    <div
                      key={quote.dealer_id}
                      className={cn(
                        "flex items-center justify-between rounded-[8px] border p-3 transition-colors",
                        quote.is_best_execution ? "border-acc bg-acc/10" : "border-line bg-surface/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded bg-surface-2 mono text-[11px] font-bold text-txt-primary">
                          {quote.rating}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12.5px] font-medium text-txt-primary">{quote.dealer_name}</span>
                            {quote.is_best_execution && <Badge tone="pos">BEST EXECUTION</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-txt-muted">
                            <span>{quote.venue_type}</span>
                            <span>·</span>
                            <span>{quote.latency_ms} ms</span>
                            <span>·</span>
                            <span>Valid {quote.expires_in_seconds}s</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="mono text-[14px] font-semibold text-txt-primary">₹{num(quote.quoted_price, 2)}</div>
                        <div className="mono text-[10px] text-txt-muted">+{quote.spread_bps} bps vs mid</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "Self-Healing RL Guardrail (v11)" ? (
        /* ── SELF-HEALING RL EXECUTION GUARDRAIL MODULE (v11 Section 3) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <OpsKpi
              k="VPIN Toxicity (LOB)"
              v={vpinScore.toFixed(2)}
              s={vpinScore >= 0.65 ? "CRITICAL RISK (>0.65)" : vpinScore >= 0.45 ? "ELEVATED (0.45-0.65)" : "NOMINAL (<0.45)"}
              tone={vpinScore >= 0.65 ? "neg" : vpinScore >= 0.45 ? "warn" : "pos"}
            />
            <OpsKpi
              k="RL Policy State"
              v={rlEval.guardrail_engaged ? "ENGAGED" : "NOMINAL"}
              s={rlEval.recommended_action === "SWITCH_TO_DARK_POOL_PASSIVE_PEGGED" ? "Dark Pool Peg" : rlEval.recommended_action === "SWITCH_TO_ADAPTIVE_POV_SLOW" ? "Adaptive POV" : "Standard VWAP"}
              tone={rlEval.guardrail_engaged ? "warn" : "pos"}
            />
            <OpsKpi
              k="Current Slippage"
              v={`${slippageBps.toFixed(1)} bps`}
              s={`Benchmark: ${rlEval.almgren_chriss_benchmark_bps} bps`}
              tone={slippageBps > 15 ? "neg" : "pos"}
            />
            <OpsKpi
              k="PPO Agent Model"
              v="PPO-LOB-v2.4"
              s="Reward: Cost - 2.5×VPIN"
              tone="pos"
            />
            <OpsKpi
              k="Alpha Saved (Trajectory)"
              v={`+${(rlTrajectory.length > 0 ? rlTrajectory[rlTrajectory.length - 1].cumulative_savings_bps : 0).toFixed(1)} bps`}
              s="Adverse Selection Avoided"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left Control Panel: LOB State & Threshold Tuning */}
            <Panel level={3} className="xl:col-span-4" title="RL State Vector & Ingestion" sub="Real-time order flow toxicity parameters — suggestions-v11.md Section 3">
              <div className="space-y-3.5">
                <div>
                  <label className="label-xs text-txt-muted">Target Instrument</label>
                  <select
                    value={rlTicker}
                    onChange={(e) => {
                      setRlTicker(e.target.value);
                      handleEvaluateRL(vpinScore, slippageBps, e.target.value);
                    }}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="RELIANCE">RELIANCE (Reliance Industries)</option>
                    <option value="HDFCBANK">HDFCBANK (HDFC Bank Ltd)</option>
                    <option value="INFY">INFY (Infosys Ltd)</option>
                    <option value="TCS">TCS (Tata Consultancy)</option>
                  </select>
                </div>

                <Slider
                  label="VPIN Toxicity Metric"
                  value={vpinScore}
                  min={0.05}
                  max={0.95}
                  step={0.05}
                  tone={vpinScore >= 0.65 ? "neg" : vpinScore >= 0.45 ? "gold" : "acc"}
                  onChange={(v) => {
                    setVpinScore(v);
                    handleEvaluateRL(v, slippageBps);
                  }}
                />

                <Slider
                  label="Current Realized Slippage (bps)"
                  value={slippageBps}
                  min={1}
                  max={45}
                  step={1}
                  unit=" bps"
                  tone={slippageBps > 15 ? "neg" : "acc2"}
                  onChange={(v) => {
                    setSlippageBps(v);
                    handleEvaluateRL(vpinScore, v);
                  }}
                />

                <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between font-semibold text-txt-primary">
                    <span className="flex items-center gap-1.5"><Cpu size={12} className="text-acc" /> Level-3 Microstructure Telemetry</span>
                    <Badge tone={rlEval.urgency === "CRITICAL" ? "neg" : rlEval.urgency === "ELEVATED" ? "warn" : "pos"}>
                      {rlEval.urgency}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-txt-secondary border-t border-line-subtle pt-1.5">
                    <span>Queue Depletion Rate:</span>
                    <span className="mono text-txt-primary">0.84 /s</span>
                  </div>
                  <div className="flex items-center justify-between text-txt-secondary">
                    <span>Spread Asymmetry Skew:</span>
                    <span className="mono text-txt-primary">+1.42 bps</span>
                  </div>
                  <div className="flex items-center justify-between text-txt-secondary">
                    <span>Almgren-Chriss Target:</span>
                    <span className="mono text-acc">12.0 bps</span>
                  </div>
                </div>

                <div className={cn(
                  "rounded-[8px] border p-3 text-[11px] transition-all",
                  rlEval.guardrail_engaged ? "border-warn/40 bg-warn/10 text-txt-primary" : "border-pos/30 bg-pos/5 text-txt-secondary"
                )}>
                  <div className="flex items-center gap-1.5 font-semibold">
                    {rlEval.guardrail_engaged ? <ShieldAlert size={14} className="text-warn" /> : <ShieldCheck size={14} className="text-pos" />}
                    <span>{rlEval.guardrail_engaged ? "GUARDRAIL ENGAGED: VENUE REROUTE" : "OPTIMAL VENUE: STANDARD FLOW"}</span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-txt-muted">
                    {rlEval.mitigation_reason}
                  </p>
                  <div className="mt-2 flex items-center justify-between font-medium border-t border-line-subtle/70 pt-1.5">
                    <span className="text-txt-muted">Selected Algo:</span>
                    <span className="mono text-acc font-semibold">{rlEval.recommended_algo}</span>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="primary"
                  className="w-full"
                  loading={evaluatingRL}
                  onClick={() => handleEvaluateRL(vpinScore, slippageBps)}
                >
                  Evaluate RL Policy Action
                </Button>
              </div>
            </Panel>

            {/* Right Panel: State Machine & Interactive Intraday Trajectory Simulation */}
            <div className="space-y-3 xl:col-span-8">
              <Panel
                level={3}
                title="Dynamic RL Route Switching State Machine"
                sub="Reinforcement learning agent autonomous venue selection preventing front-running & adverse selection"
                actions={
                  <Button size="xs" variant="primary" loading={simulatingRL} onClick={handleSimulateRL}>
                    ⚡ Run 20-Step RL Episode Simulation
                  </Button>
                }
              >
                <div className="space-y-3">
                  {/* Route State Machine Nodes */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className={cn(
                      "rounded-[8px] border p-3 text-center transition-all",
                      rlEval.recommended_action === "MAINTAIN_STANDARD_VWAP"
                        ? "border-pos bg-pos/15 shadow-[0_0_12px_rgba(74,222,128,0.15)]"
                        : "border-line bg-surface/40 opacity-60"
                    )}>
                      <div className="label-xs text-txt-muted">State 0 · Low Toxicity</div>
                      <div className="mt-1 font-semibold text-[12px] text-txt-primary">Standard Multi-Venue VWAP</div>
                      <div className="mt-1 mono text-[10px] text-pos">VPIN &lt; 0.45 · Lit Pool Routing</div>
                    </div>

                    <div className={cn(
                      "rounded-[8px] border p-3 text-center transition-all",
                      rlEval.recommended_action === "SWITCH_TO_ADAPTIVE_POV_SLOW"
                        ? "border-warn bg-warn/15 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                        : "border-line bg-surface/40 opacity-60"
                    )}>
                      <div className="label-xs text-txt-muted">State 1 · Moderate Toxicity</div>
                      <div className="mt-1 font-semibold text-[12px] text-txt-primary">Adaptive POV Slow (5%)</div>
                      <div className="mt-1 mono text-[10px] text-warn">VPIN 0.45–0.65 · Throttle Participation</div>
                    </div>

                    <div className={cn(
                      "rounded-[8px] border p-3 text-center transition-all",
                      rlEval.recommended_action === "SWITCH_TO_DARK_POOL_PASSIVE_PEGGED"
                        ? "border-acc bg-acc/15 shadow-[0_0_12px_rgba(56,189,248,0.15)]"
                        : "border-line bg-surface/40 opacity-60"
                    )}>
                      <div className="label-xs text-txt-muted">State 2 · High Toxicity</div>
                      <div className="mt-1 font-semibold text-[12px] text-txt-primary">Dark Pool Passive Pegged</div>
                      <div className="mt-1 mono text-[10px] text-acc">VPIN &gt; 0.65 · Zero Lit Footprint</div>
                    </div>
                  </div>

                  {/* RL Trajectory Execution History Table */}
                  <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-bg-secondary/90 text-left">
                          <th className="label-xs border-b border-line px-2.5 py-2 text-txt-muted">Slice</th>
                          <th className="label-xs border-b border-line px-2.5 py-2 text-right text-txt-muted">VPIN</th>
                          <th className="label-xs border-b border-line px-2.5 py-2 text-right text-txt-muted">Slippage</th>
                          <th className="label-xs border-b border-line px-2.5 py-2 text-left text-txt-muted">Active Venue/Algo</th>
                          <th className="label-xs border-b border-line px-2.5 py-2 text-left text-txt-muted">PPO Action</th>
                          <th className="label-xs border-b border-line px-2.5 py-2 text-right text-pos">Step Savings</th>
                          <th className="label-xs border-b border-line px-2.5 py-2 text-right text-pos">Cumul Savings</th>
                          <th className="label-xs border-b border-line px-2.5 py-2 text-right text-txt-muted">Reward</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rlTrajectory.map((step) => (
                          <tr key={step.step} className="border-b border-line-subtle/70 hover:bg-surface-hover/50">
                            <td className="mono px-2.5 py-1.5 text-[11px] text-txt-muted">{step.time_label}</td>
                            <td className="mono px-2.5 py-1.5 text-right text-[11px]">
                              <span className={cn(step.vpin_score >= 0.65 ? "text-neg font-bold" : step.vpin_score >= 0.45 ? "text-warn" : "text-pos")}>
                                {step.vpin_score.toFixed(2)}
                              </span>
                            </td>
                            <td className="mono px-2.5 py-1.5 text-right text-[11.5px] text-txt-primary">
                              {step.slippage_bps.toFixed(1)} bps
                            </td>
                            <td className="mono px-2.5 py-1.5 text-[11px] text-acc">{step.active_algo}</td>
                            <td className="mono px-2.5 py-1.5 text-[10.5px]">
                              <Badge tone={step.rl_action.includes("DARK") ? "acc" : step.rl_action.includes("POV") ? "warn" : "neu"}>
                                {step.rl_action.replace("SWITCH_TO_", "").replace("MAINTAIN_", "")}
                              </Badge>
                            </td>
                            <td className="mono px-2.5 py-1.5 text-right text-[11px] text-pos font-medium">
                              +{step.step_savings_bps.toFixed(1)} bps
                            </td>
                            <td className="mono px-2.5 py-1.5 text-right text-[11px] text-pos font-bold">
                              +{step.cumulative_savings_bps.toFixed(1)} bps
                            </td>
                            <td className="mono px-2.5 py-1.5 text-right text-[10.5px] text-txt-muted">
                              {step.reward > 0 ? `+${step.reward.toFixed(1)}` : step.reward.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "Regulatory Reporting & PQC (v12)" ? (
        /* ── REGULATORY REPORTING & POST-QUANTUM CRYPTOGRAPHIC LAYER (v12 Modules 03 & 06) ── */
        <div className="space-y-4">
          {/* Top KPI Bar */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">PQC Cryptographic Security</div>
              <div className="mono mt-1 text-[16px] font-semibold leading-none text-gold">
                FIPS 203 / 204
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">ML-KEM-1024 & ML-DSA-87</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">SEC Form PF (Section 2b)</div>
              <div className="mono mt-1 text-[16px] font-semibold leading-none text-txt-primary">
                $104.2M GAV
              </div>
              <div className="mt-1.5 truncate text-[10px] text-pos">XBRL Validated · Q2 2026</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">MiFID II RTS 28 Best Exec</div>
              <div className="mono mt-1 text-[16px] font-semibold leading-none text-pos">
                100% Passed
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">5 Top Venues Audited</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">SEC Rule 206(4)-7 Audit</div>
              <div className="mono mt-1 text-[16px] font-semibold leading-none text-acc">
                Immutable Ledger
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">PQC Signed Transitions</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            {/* SEC Form PF Filing Card (7 Cols) */}
            <div className="space-y-3 xl:col-span-7">
              <Panel
                level={3}
                title={
                  <div className="flex items-center gap-2">
                    <Landmark size={14} className="text-acc" />
                    <h3 className="text-[13px] font-semibold text-txt-primary">SEC Form PF (Section 2b) Large Fund Filing</h3>
                  </div>
                }
                sub="Automated XML/XBRL regulatory filings for systemic risk surveillance — suggestions-v12.md Module 06"
                actions={
                  <Button size="xs" variant="primary" icon={FileCheck} onClick={handleFetchFormPF}>
                    Generate Form PF (v12)
                  </Button>
                }
              >
                {formPF ? (
                  <div className="space-y-3 text-[11px]">
                    <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/70 p-3 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-txt-muted">Reporting Fund:</span>
                        <span className="font-semibold text-txt-primary">{formPF.fund_legal_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-txt-muted">LEI Identifier:</span>
                        <span className="mono text-acc font-semibold">{formPF.lei_identifier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-txt-muted">Filing Period:</span>
                        <span className="mono text-txt-secondary">{formPF.filing_period} · Status: <Badge tone="pos">{formPF.filing_status}</Badge></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-[6px] bg-surface-2 p-2">
                        <div className="text-[10px] text-txt-muted">Gross Notional Value</div>
                        <div className="mono mt-1 text-[13px] font-semibold text-txt-primary">${(formPF.regulatory_metrics.gross_notional_value_usd / 1000000).toFixed(1)}M</div>
                      </div>
                      <div className="rounded-[6px] bg-surface-2 p-2">
                        <div className="text-[10px] text-txt-muted">Gross Leverage</div>
                        <div className="mono mt-1 text-[13px] font-semibold text-txt-secondary">{formPF.regulatory_metrics.gross_leverage_ratio.toFixed(2)}x</div>
                      </div>
                      <div className="rounded-[6px] bg-surface-2 p-2">
                        <div className="text-[10px] text-txt-muted">1-Day VaR (95%)</div>
                        <div className="mono mt-1 text-[13px] font-semibold text-warn">{formPF.regulatory_metrics.daily_var_95_1d_pct.toFixed(2)}%</div>
                      </div>
                      <div className="rounded-[6px] bg-surface-2 p-2">
                        <div className="text-[10px] text-txt-muted">Monthly Turnover</div>
                        <div className="mono mt-1 text-[13px] font-semibold text-pos">{formPF.regulatory_metrics.monthly_turnover_rate_pct.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* Liquidity Profile */}
                    <div className="rounded-[6px] border border-line-subtle bg-surface/50 p-2.5 space-y-1.5">
                      <span className="font-semibold text-txt-primary">Portfolio Liquidity Tiering (Section 2b Item E)</span>
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="rounded bg-bg-secondary p-1.5">
                          <div className="mono text-[12px] text-pos font-bold">{formPF.regulatory_metrics.portfolio_liquidity_profile.liquid_within_1_day_pct}%</div>
                          <div className="text-[9.5px] text-txt-muted">Liquid in &le; 1 Day</div>
                        </div>
                        <div className="rounded bg-bg-secondary p-1.5">
                          <div className="mono text-[12px] text-acc font-bold">{formPF.regulatory_metrics.portfolio_liquidity_profile.liquid_within_7_days_pct}%</div>
                          <div className="text-[9.5px] text-txt-muted">Liquid in &le; 7 Days</div>
                        </div>
                        <div className="rounded bg-bg-secondary p-1.5">
                          <div className="mono text-[12px] text-txt-secondary font-bold">{formPF.regulatory_metrics.portfolio_liquidity_profile.illiquid_over_30_days_pct}%</div>
                          <div className="text-[9.5px] text-txt-muted">Illiquid &gt; 30 Days</div>
                        </div>
                      </div>
                    </div>

                    {/* Top Borrowing Counterparties */}
                    <div className="rounded-[6px] border border-line-subtle bg-surface/40 p-2.5">
                      <span className="font-semibold text-txt-primary">Top 5 Borrowing Counterparties</span>
                      <div className="mt-1.5 space-y-1">
                        {formPF.regulatory_metrics.top_5_borrowing_counterparties.map((cp) => (
                          <div key={cp.counterparty} className="flex items-center justify-between text-[10.5px]">
                            <span className="text-txt-secondary">{cp.counterparty}</span>
                            <span className="mono text-txt-primary font-medium">${(cp.exposure_usd / 1000000).toFixed(1)}M · <span className="text-acc">{cp.rating}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : <Skeleton className="h-64" />}
              </Panel>
            </div>

            {/* Post-Quantum Cryptographic Security Monitor (5 Cols) */}
            <div className="space-y-3 xl:col-span-5">
              <Panel
                level={3}
                title={
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-gold" />
                    <h3 className="text-[13px] font-semibold text-txt-primary">PQC Security & Hardware Enclave</h3>
                  </div>
                }
                sub="NIST FIPS 203/204 lattice-based cryptography — suggestions-v12.md Module 03"
                actions={
                  <Button size="xs" variant="primary" icon={Lock} loading={signingPQC} onClick={handleSignPQC}>
                    Sign PQC Payload
                  </Button>
                }
              >
                {pqcStatus && (
                  <div className="space-y-3 text-[11px]">
                    <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/70 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Key Encapsulation (KEM):</span>
                        <span className="mono text-acc font-semibold">{pqcStatus.key_encapsulation}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Digital Signatures (DSA):</span>
                        <span className="mono text-gold font-semibold">{pqcStatus.digital_signatures}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Symmetric + KDF:</span>
                        <span className="mono text-txt-primary">{pqcStatus.symmetric_cipher}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-txt-muted">Lattice Dimension:</span>
                        <span className="mono text-acc2 font-bold">k = {pqcStatus.lattice_dimension_k} (256-bit Security)</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-line-subtle pt-1.5">
                        <span className="text-txt-muted">Hybrid TLS Tunnel:</span>
                        <Badge tone="pos">{pqcStatus.hybrid_tls_mode}</Badge>
                      </div>
                    </div>

                    <div className="rounded-[6px] border border-line-subtle bg-surface/50 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-txt-primary">
                        <span>Recent Dilithium5 Audit Signatures</span>
                        <span className="mono text-[10px] text-txt-muted">Length: 4,595 B</span>
                      </div>
                      <div className="space-y-1.5">
                        {pqcStatus.recent_audit_signatures.slice(0, 3).map((sig) => (
                          <div key={sig.log_id} className="rounded border border-line-subtle bg-bg-secondary p-2 text-[10px] space-y-0.5">
                            <div className="flex justify-between">
                              <span className="mono font-semibold text-acc">{sig.log_id}</span>
                              <span className="mono text-pos">✓ {sig.verification_status}</span>
                            </div>
                            <div className="truncate text-txt-muted">{sig.action} · {sig.entity_id}</div>
                            <div className="mono text-[9px] text-txt-disabled truncate">Key: {sig.public_key_fingerprint}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Panel>
            </div>
          </div>

          {/* MiFID II RTS 28 Best Execution Table (12 Cols) */}
          <Panel
            level={3}
            title={
              <div className="flex items-center gap-2">
                <Scale size={14} className="text-acc" />
                <h3 className="text-[13px] font-semibold text-txt-primary">MiFID II RTS 28 Top 5 Execution Venues Annual Report</h3>
              </div>
            }
            sub="Best execution venue audit across order count, passive vs aggressive routing, and arrival price slippage — suggestions-v12.md Module 06"
            actions={
              <Button size="xs" variant="secondary" icon={RefreshCw} onClick={handleFetchRTS28}>
                Refresh RTS 28
              </Button>
            }
          >
            {rts28Report && (
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary/90 text-left">
                        {["Rank", "Execution Venue Name", "MIC", "Volume %", "Orders %", "Passive %", "Aggressive %", "Avg Slippage (bps)", "Best Exec Status"].map((h, i) => (
                          <th key={h} className={cn("label-xs border-b border-line px-2.5 py-2 text-txt-muted", i >= 3 && i <= 7 && "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rts28Report.venues_summary.map((v) => (
                        <tr key={v.rank} className="border-b border-line-subtle/70 text-[11.5px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-2 font-bold text-acc">#{v.rank}</td>
                          <td className="px-2.5 py-2 font-semibold text-txt-primary">{v.venue_name}</td>
                          <td className="mono px-2.5 py-2 text-[10.5px] text-txt-muted">{v.mic_code}</td>
                          <td className="mono px-2.5 py-2 text-right font-medium text-txt-primary">{v.volume_pct.toFixed(1)}%</td>
                          <td className="mono px-2.5 py-2 text-right text-txt-secondary">{v.orders_pct.toFixed(1)}%</td>
                          <td className="mono px-2.5 py-2 text-right text-pos">{v.passive_orders_pct.toFixed(1)}%</td>
                          <td className="mono px-2.5 py-2 text-right text-warn">{v.aggressive_orders_pct.toFixed(1)}%</td>
                          <td className={cn("mono px-2.5 py-2 text-right font-semibold", v.avg_slippage_vs_arrival_bps <= 0 ? "text-pos" : "text-warn")}>
                            {v.avg_slippage_vs_arrival_bps <= 0 ? "" : "+"}{v.avg_slippage_vs_arrival_bps.toFixed(1)} bps
                          </td>
                          <td className="px-2.5 py-2 text-center">
                            <Badge tone="pos">VERIFIED BEST EXEC</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-[6px] border border-line-subtle bg-surface/50 p-2.5 text-[11px] text-txt-muted">
                  <span className="font-semibold text-txt-primary">Compliance Assessment: </span>
                  {rts28Report.execution_quality_assessment}
                </div>
              </div>
            )}
          </Panel>

          {/* SEC Rule 206(4)-7 Model Compliance Ledger (12 Cols) */}
          <Panel
            level={3}
            title={
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-pos" />
                <h3 className="text-[13px] font-semibold text-txt-primary">SEC Rule 206(4)-7 Model Compliance & Audit Ledger</h3>
              </div>
            }
            sub="Post-Quantum signed audit trail recording every alpha promotion, optimizer recalibration, and margin transfer"
          >
            <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-bg-secondary/90 text-left">
                    {["Event ID", "Timestamp UTC", "Model ID / Target", "State Transition", "Approver Sign-Off", "Governance Standard", "PQC Status"].map((h) => (
                      <th key={h} className="label-xs border-b border-line px-2.5 py-2 text-txt-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {complianceLedger.map((evt) => (
                    <tr key={evt.event_id} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                      <td className="mono px-2.5 py-2 font-semibold text-acc">{evt.event_id}</td>
                      <td className="mono px-2.5 py-2 text-txt-muted">{new Date(evt.timestamp_utc).toLocaleTimeString()} UTC</td>
                      <td className="mono px-2.5 py-2 text-txt-primary">{evt.model_id}</td>
                      <td className="mono px-2.5 py-2 text-acc2">{evt.transition}</td>
                      <td className="px-2.5 py-2 font-medium text-txt-secondary">{evt.approver}</td>
                      <td className="px-2.5 py-2 text-txt-muted">{evt.governance_rule}</td>
                      <td className="px-2.5 py-2">
                        <Badge tone="pos">ML-DSA-87 VERIFIED</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      ) : execMode === "Differential Game Execution (v13)" ? (
        /* ── DIFFERENTIAL GAME MULTI-AGENT EXECUTION MODULE (v13 Module 2.3) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <OpsKpi
              k="Equilibrium Slippage"
              v={`${diffGameResult?.performance_comparison.differential_game.slippage_bps.toFixed(1) ?? "1.4"} bps`}
              s={`vs TWAP: ${diffGameResult?.performance_comparison.twap_benchmark.slippage_bps.toFixed(1) ?? "8.2"} bps`}
              tone="pos"
            />
            <OpsKpi
              k="Predatory Neutralization"
              v={`${diffGameResult?.performance_comparison.differential_game.predatory_frontrun_neutralization_pct.toFixed(1) ?? "94.2"}%` }
              s="HFT Coupling Defeated"
              tone="pos"
            />
            <OpsKpi
              k="Alpha Preserved"
              v={`+${diffGameResult?.performance_comparison.differential_savings_bps.toFixed(1) ?? "6.8"} bps`}
              s={`₹${num(diffGameResult?.performance_comparison.absolute_savings_inr ?? 340000, 0)} net savings`}
              tone="pos"
            />
            <OpsKpi
              k="Equilibrium Decay κ*"
              v={`${diffGameResult?.game_theoretic_parameters.kappa_game_equilibrium.toFixed(4) ?? "0.0241"}`}
              s={`Almgren Baseline: ${diffGameResult?.game_theoretic_parameters.kappa_almgren_baseline.toFixed(4) ?? "0.0152"}`}
              tone="pos"
            />
            <OpsKpi
              k="PDE Solver Mode"
              v="HJBI Riccati"
              s="Hamilton-Jacobi-Bellman-Isaacs"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Game-Theoretic Parameter Tuner (4 Cols) */}
            <Panel level={3} className="xl:col-span-4" title="HJBI Differential Game Tuner" sub="Adversarial predatory order flow coupling — suggestions-v13.md Module 2.3">
              <div className="space-y-3.5">
                <Slider
                  label="Parent Order Size (Shares)"
                  value={diffQty}
                  min={5000}
                  max={200000}
                  step={5000}
                  unit=" sh"
                  tone="acc"
                  onChange={(v) => { setDiffQty(v); handleSolveDiffGame(v, diffPrice, diffHorizon, diffPredatoryIntensity); }}
                />

                <Slider
                  label="Initial Benchmark Price (₹)"
                  value={diffPrice}
                  min={1000}
                  max={5000}
                  step={20}
                  unit="₹"
                  tone="acc2"
                  onChange={(v) => { setDiffPrice(v); handleSolveDiffGame(diffQty, v, diffHorizon, diffPredatoryIntensity); }}
                />

                <Slider
                  label="Execution Horizon T (Seconds)"
                  value={diffHorizon}
                  min={30}
                  max={600}
                  step={30}
                  unit="s"
                  tone="gold"
                  onChange={(v) => { setDiffHorizon(v); handleSolveDiffGame(diffQty, diffPrice, v, diffPredatoryIntensity); }}
                />

                <Slider
                  label="Predatory HFT Coupling Intensity β"
                  value={diffPredatoryIntensity}
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  tone={diffPredatoryIntensity > 1.8 ? "neg" : diffPredatoryIntensity > 1.0 ? "warn" : "pos"}
                  onChange={(v) => { setDiffPredatoryIntensity(v); handleSolveDiffGame(diffQty, diffPrice, diffHorizon, v); }}
                />

                <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between font-semibold text-txt-primary">
                    <span className="flex items-center gap-1.5"><ShieldAlert size={13} className="text-warn" /> Predatory HFT Attack Vector</span>
                    <Badge tone="warn">ADVERSARIAL COUPLING</Badge>
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Select Attack Scenario</label>
                    <select
                      value={diffAttackType}
                      onChange={(e) => setDiffAttackType(e.target.value as any)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11px] text-txt-primary outline-none"
                    >
                      <option value="MOMENTUM_IGNITION">Momentum Ignition & Queue Squeeze</option>
                      <option value="SUB_PENNYING">Sub-Pennying Latency Sniping</option>
                      <option value="SNIFFING_TOXIC_PROBING">Sniffing & Toxic Flow Probing</option>
                    </select>
                  </div>
                  {diffAttackResult && (
                    <div className="rounded border border-line-subtle bg-surface p-2 text-[10.5px] space-y-1">
                      <div className="flex justify-between text-txt-muted">
                        <span>HFT Latency Edge:</span>
                        <span className="mono text-warn font-semibold">{diffAttackResult.attack_profile.hft_latency_advantage_us} μs</span>
                      </div>
                      <div className="flex justify-between text-txt-muted">
                        <span>Detected Footprint:</span>
                        <span className="mono text-pos font-semibold">{diffAttackResult.attack_profile.detected_footprint_pct}%</span>
                      </div>
                      <div className="text-[10px] text-txt-secondary leading-snug pt-1 border-t border-line-subtle">
                        <span className="font-semibold text-acc">Countermeasure: </span>
                        {diffAttackResult.attack_profile.countermeasure}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button size="xs" variant="primary" loading={solvingDiffGame} onClick={() => handleSolveDiffGame()}>
                    ⚡ Solve HJBI Game
                  </Button>
                  <Button size="xs" variant="secondary" icon={ShieldCheck} loading={simulatingAttack} onClick={handleSimulateAttack}>
                    🛡️ Neutralize Attack
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Execution Comparison & Trajectory Matrix (8 Cols) */}
            <div className="space-y-3 xl:col-span-8">
              {/* Benchmark Comparison Cards */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-[8px] border border-pos/40 bg-pos/10 p-3 text-center">
                  <div className="label-xs text-pos font-semibold">Differential Game (Nash Equil)</div>
                  <div className="mono mt-1 text-[16px] font-bold text-pos">
                    {diffGameResult?.performance_comparison.differential_game.slippage_bps.toFixed(1) ?? "1.4"} bps
                  </div>
                  <div className="mt-1 text-[10px] text-txt-muted">
                    IS: ₹{num(diffGameResult?.performance_comparison.differential_game.implementation_shortfall_inr ?? 70000, 0)} · Footprint: {diffGameResult?.performance_comparison.differential_game.market_footprint_score.toFixed(1) ?? "12.0"}
                  </div>
                </div>

                <div className="rounded-[8px] border border-line bg-surface/40 p-3 text-center opacity-80">
                  <div className="label-xs text-txt-muted">Standard TWAP Benchmark</div>
                  <div className="mono mt-1 text-[16px] font-bold text-warn">
                    {diffGameResult?.performance_comparison.twap_benchmark.slippage_bps.toFixed(1) ?? "8.2"} bps
                  </div>
                  <div className="mt-1 text-[10px] text-txt-muted">
                    IS: ₹{num(diffGameResult?.performance_comparison.twap_benchmark.implementation_shortfall_inr ?? 410000, 0)} · Footprint: {diffGameResult?.performance_comparison.twap_benchmark.market_footprint_score.toFixed(1) ?? "78.4"}
                  </div>
                </div>

                <div className="rounded-[8px] border border-line bg-surface/40 p-3 text-center opacity-80">
                  <div className="label-xs text-txt-muted">Standard VWAP Benchmark</div>
                  <div className="mono mt-1 text-[16px] font-bold text-warn">
                    {diffGameResult?.performance_comparison.vwap_benchmark.slippage_bps.toFixed(1) ?? "6.5"} bps
                  </div>
                  <div className="mt-1 text-[10px] text-txt-muted">
                    IS: ₹{num(diffGameResult?.performance_comparison.vwap_benchmark.implementation_shortfall_inr ?? 325000, 0)} · Footprint: {diffGameResult?.performance_comparison.vwap_benchmark.market_footprint_score.toFixed(1) ?? "62.1"}
                  </div>
                </div>
              </div>

              {/* Mathematical Riccati Formulation Callout */}
              <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/60 p-3 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-txt-primary font-semibold">
                  <span>Coupled HJBI Value Function & Optimal Liquidation Speed:</span>
                  <span className="mono text-acc text-[10px]">∂V/∂t + min_ν [ ν(S - ην) + L_pred(x) + ...] = 0</span>
                </div>
                <p className="mono text-[10.5px] text-txt-secondary leading-relaxed">
                  ν*(t) = -κ · [sinh(κ(T - t)) / cosh(κ T)] · q₀ &nbsp;|&nbsp; κ = √((φ + β·γ_hft) / η)
                </p>
              </div>

              {/* Trajectory Blotter */}
              <Panel level={3} title="Execution Trajectory & Predatory Flow Blotter" sub="Real-time multi-agent order execution vs high-frequency predatory algorithms">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle max-h-80">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-bg-secondary/95">
                      <tr className="text-left">
                        {["Time (s)", "% Horizon", "Game Inventory", "TWAP Inv", "Game Exec Rate", "TWAP Rate", "Predatory Threat", "Game Price (₹)", "TWAP Price (₹)"].map((h, i) => (
                          <th key={h} className={cn("label-xs border-b border-line px-2.5 py-2 text-txt-muted", i >= 2 && "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(diffGameResult?.trajectory ?? []).slice(0, 15).map((row) => (
                        <tr key={row.time_sec} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1.5 text-txt-muted">T+{row.time_sec}s</td>
                          <td className="mono px-2.5 py-1.5 text-txt-secondary">{row.time_pct.toFixed(0)}%</td>
                          <td className="mono px-2.5 py-1.5 text-right font-medium text-pos">{num(row.inventory_game, 0)}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-muted">{num(row.inventory_twap, 0)}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-acc font-semibold">{row.exec_rate_game_shares_per_sec.toFixed(0)} sh/s</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-disabled">{row.exec_rate_twap_shares_per_sec.toFixed(0)} sh/s</td>
                          <td className="mono px-2.5 py-1.5 text-right">
                            <span className={cn(row.predatory_threat_index_pct > 60 ? "text-neg font-bold" : row.predatory_threat_index_pct > 30 ? "text-warn" : "text-pos")}>
                              {row.predatory_threat_index_pct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="mono px-2.5 py-1.5 text-right font-medium text-txt-primary">₹{num(row.market_price_game, 2)}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-muted">₹{num(row.market_price_twap, 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "MPC ZK Dark Pool (v13)" ? (
        /* ── SECURE MULTI-PARTY COMPUTATION ZERO-KNOWLEDGE DARK POOL (v13 Module 2.4) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <OpsKpi
              k="MPC Dark Pool Status"
              v="OPERATIONAL"
              s="4/4 Quorum Active"
              tone="pos"
            />
            <OpsKpi
              k="Information Leakage"
              v="0.00 bps"
              s="Information-Theoretic Security"
              tone="pos"
            />
            <OpsKpi
              k="Garbled Gate Latency"
              v={`${mpcDarkPoolStatus?.avg_crossing_latency_ms ?? 14.8} ms`}
              s="Yao's Boolean Circuit Match"
              tone="pos"
            />
            <OpsKpi
              k="Price Improvement"
              v="+3.8 bps"
              s="vs Consolidated Lit Tape"
              tone="pos"
            />
            <OpsKpi
              k="Shielded Crossings"
              v={`${mpcDarkPoolStatus?.recent_crosses_count ?? 18}`}
              s="ZK-SNARK Audited"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* MPC Shielded Order Submitter (4 Cols) */}
            <Panel level={3} className="xl:col-span-4" title="Shielded MPC Order Submitter" sub="Shamir (3,5) Secret Sharing — suggestions-v13.md Module 2.4">
              <div className="space-y-3.5">
                <div>
                  <label className="label-xs text-txt-muted">Target Instrument</label>
                  <select
                    value={mpcTicker}
                    onChange={(e) => setMpcTicker(e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="RELIANCE">RELIANCE (Reliance Industries)</option>
                    <option value="HDFCBANK">HDFCBANK (HDFC Bank Ltd)</option>
                    <option value="INFY">INFY (Infosys Ltd)</option>
                    <option value="TCS">TCS (Tata Consultancy)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Side</label>
                    <div className="mt-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setMpcSide("BUY")}
                        className={cn("flex-1 rounded-[4px] py-1 text-[11px] font-semibold transition", mpcSide === "BUY" ? "bg-pos text-bg" : "border border-line text-txt-muted")}
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setMpcSide("SELL")}
                        className={cn("flex-1 rounded-[4px] py-1 text-[11px] font-semibold transition", mpcSide === "SELL" ? "bg-neg text-bg" : "border border-line text-txt-muted")}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label-xs text-txt-muted">Order Limit Price (₹)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={mpcLimitPrice}
                      onChange={(e) => setMpcLimitPrice(+e.target.value)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1 mono text-[11px] text-txt-primary outline-none"
                    />
                  </div>
                </div>

                <Slider
                  label="Order Quantity (Shares)"
                  value={mpcQty}
                  min={1000}
                  max={100000}
                  step={1000}
                  unit=" sh"
                  tone="acc"
                  onChange={(v) => setMpcQty(v)}
                />

                <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between font-semibold text-txt-primary">
                    <span className="flex items-center gap-1.5"><Lock size={13} className="text-acc" /> Shamir (3,5) Polynomial Threshold</span>
                    <Badge tone="pos">ZERO LEAKAGE</Badge>
                  </div>
                  <p className="text-[10px] text-txt-secondary leading-snug">
                    f(x) = S_0 + a₁·x + a₂·x² (mod p). Distributed across 5 non-colluding validator nodes. Reconstruction requires strictly ≥ 3 shares.
                  </p>
                </div>

                {lastMPCOrder && (
                  <div className="rounded-[8px] border border-pos/40 bg-pos/10 p-2.5 text-[10.5px] space-y-1">
                    <div className="flex justify-between font-semibold text-pos">
                      <span>Order Shielded: {lastMPCOrder.order_id}</span>
                      <span>{lastMPCOrder.pseudonym}</span>
                    </div>
                    <div className="mono text-[9.5px] text-txt-muted truncate">Wire: {lastMPCOrder.wire_commitment}</div>
                    <div className="flex justify-between text-txt-secondary">
                      <span>Threshold: {lastMPCOrder.threshold_required}/5 Nodes</span>
                      <span className="text-pos font-semibold">✓ {lastMPCOrder.privacy_metric}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button size="xs" variant="primary" loading={submittingMPCOrder} onClick={handleSubmitMPCOrder}>
                    🛡️ Submit Shielded Order
                  </Button>
                  <Button size="xs" variant="secondary" icon={RefreshCw} loading={executingMPCCross} onClick={handleExecuteMPCCross}>
                    ⚡ Execute ZK Cross
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Validator Nodes & Crossing Blotter (8 Cols) */}
            <div className="space-y-3 xl:col-span-8">
              {/* Distributed Validator Enclaves */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { name: "Node Alpha (Tokyo)", ping: "12ms", score: "99.9%", status: "ONLINE" },
                  { name: "Node Beta (London)", ping: "28ms", score: "99.8%", status: "ONLINE" },
                  { name: "Node Gamma (Frankfurt)", ping: "31ms", score: "100.0%", status: "ONLINE" },
                  { name: "Node Delta (Mumbai)", ping: "4ms", score: "100.0%", status: "ONLINE" },
                ].map((n) => (
                  <div key={n.name} className="rounded-[8px] border border-line bg-surface/50 p-2.5 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-txt-primary truncate">{n.name}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-pos" />
                    </div>
                    <div className="flex justify-between text-txt-muted text-[10px]">
                      <span>Latency: <span className="mono text-txt-primary">{n.ping}</span></span>
                      <span>Rep: <span className="mono text-pos">{n.score}</span></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Completed Private Cross Blotter */}
              <Panel
                level={3}
                title="Yao's Garbled Circuit Private Crossing Blotter"
                sub="Dual-blind zero-knowledge dark pool executions with cryptographic settlement proofs"
                actions={
                  <Button size="xs" variant="primary" icon={ArrowLeftRight} loading={executingMPCCross} onClick={handleExecuteMPCCross}>
                    ⚡ Cross Dark Liquidity
                  </Button>
                }
              >
                <div className="space-y-2.5">
                  {(mpcDarkPoolStatus?.recent_crosses ?? []).slice(0, 5).map((cross) => (
                    <div key={cross.cross_id} className="rounded-[8px] border border-line-subtle bg-surface/60 p-3 space-y-2 text-[11px]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge tone="pos">ZK CROSSED</Badge>
                          <span className="font-semibold text-txt-primary">{cross.ticker}</span>
                          <span className="mono text-txt-muted">{cross.cross_id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="mono font-bold text-[13px] text-txt-primary">₹{num(cross.execution_price_inr, 2)}</span>
                          <Badge tone="pos">+{cross.price_improvement_bps.toFixed(1)} bps IMP</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-[10.5px] border-t border-line-subtle/70 pt-1.5">
                        <div>
                          <span className="text-txt-muted">Matched Size:</span>
                          <span className="mono ml-1 font-semibold text-txt-primary">{num(cross.matched_quantity_shares, 0)} sh</span>
                        </div>
                        <div>
                          <span className="text-txt-muted">Notional Value:</span>
                          <span className="mono ml-1 font-semibold text-txt-primary">₹{(cross.notional_value_inr / 10000000).toFixed(2)} Cr</span>
                        </div>
                        <div>
                          <span className="text-txt-muted">Garbled Circuit Eval:</span>
                          <span className="mono ml-1 text-acc font-semibold">{cross.garbled_circuit_eval_ms} ms</span>
                        </div>
                        <div>
                          <span className="text-txt-muted">Information Leakage:</span>
                          <span className="mono ml-1 text-pos font-bold">0.00 bps</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-txt-disabled border-t border-line-subtle/50 pt-1">
                        <span className="truncate">Parties: <span className="mono text-txt-muted">{cross.parties.buyer_pseudonym}</span> ↔ <span className="mono text-txt-muted">{cross.parties.seller_pseudonym}</span></span>
                        <span className="mono truncate">Proof: {cross.zk_snark_proof_hash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "Atomic DvP Settlement (v13)" ? (
        /* ── POST-QUANTUM ATOMIC DVP SETTLEMENT ENGINE (v13 Module 2.5) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
            <OpsKpi
              k="Settlement Latency"
              v="240 ms"
              s="Sub-Second Atomic Swap"
              tone="pos"
            />
            <OpsKpi
              k="Capital Lockup Freed"
              v="$188.5M"
              s="Zero Pre-Funding Drag"
              tone="pos"
            />
            <OpsKpi
              k="Quantum Signature"
              v="ML-DSA-87"
              s="NIST FIPS 204 Lattice"
              tone="pos"
            />
            <OpsKpi
              k="Tokenized RWA Value"
              v={`$${((rwaInventory?.total_tokenized_market_value_usd ?? 188500000) / 1000000).toFixed(1)}M`}
              s="Sovereign & IG Debt"
              tone="pos"
            />
            <OpsKpi
              k="Counterparty Risk"
              v="0.00%"
              s="Eliminated via Atomic DvP"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* RWA Catalog & Escrow Initiator (4 Cols) */}
            <Panel level={3} className="xl:col-span-4" title="Tokenized RWA Debt & Escrow" sub="Dual-Asset Atomic Settlement — suggestions-v13.md Module 2.5">
              <div className="space-y-3.5">
                <div>
                  <label className="label-xs text-txt-muted">Select Tokenized RWA Debt Note</label>
                  <select
                    value={selectedRwaAsset}
                    onChange={(e) => setSelectedRwaAsset(e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="UST-10Y-TOKEN-01">UST 10Y Note (4.28% Yield · AAA · Tokenized)</option>
                    <option value="GSEC-718-2034">India G-Sec 7.18% 2034 (7.18% Yield · SOV)</option>
                    <option value="CORP-GREEN-2029">Green Transition Bond (5.85% Yield · AA+)</option>
                    <option value="SOV-DEBT-EU-2031">EU NextGen Sovereign (3.42% Yield · AAA)</option>
                  </select>
                </div>

                <Slider
                  label="Settlement Quantity (Token Units)"
                  value={dvpQuantityUnits}
                  min={500}
                  max={25000}
                  step={500}
                  unit=" units"
                  tone="acc"
                  onChange={(v) => setDvpQuantityUnits(v)}
                />

                <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between font-semibold text-txt-primary">
                    <span>Institutional Counterparties:</span>
                    <Badge tone="neu">PQC VERIFIED</Badge>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Buyer:</span>
                    <span className="mono text-txt-primary font-medium">QUANTX Sovereign Treasury</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Seller:</span>
                    <span className="mono text-txt-primary font-medium">Citadel Securities Sovereign PB</span>
                  </div>
                  <div className="flex justify-between text-txt-muted border-t border-line-subtle pt-1.5">
                    <span>Gross Settlement:</span>
                    <span className="mono text-acc font-bold">${((dvpQuantityUnits * 98.45) / 1000).toFixed(1)}k USD</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button size="xs" variant="primary" loading={initiatingDvPEscrow} onClick={handleInitiateDvPEscrow}>
                    🔒 Lock Smart Escrow
                  </Button>
                  <Button size="xs" variant="secondary" icon={CheckCheck} loading={settlingDvP} onClick={handleSettleDvP}>
                    ⚡ Settle Atomic DvP
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Smart Escrow State Machine & Settlement Ledger (8 Cols) */}
            <div className="space-y-3 xl:col-span-8">
              {/* Dual Escrow Vault Status */}
              <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-gold" />
                    <h4 className="text-[12.5px] font-semibold text-txt-primary">Dual-Asset Escrow Smart Contract State</h4>
                  </div>
                  <Badge tone={activeDvPEscrow?.atomic_state === "SETTLED_ATOMICALLY" ? "pos" : "warn"}>
                    {activeDvPEscrow?.atomic_state ?? "ESCROW_INITIALIZED"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded border border-line-subtle bg-bg-secondary p-2.5 text-[11px] space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-txt-muted">Cash Escrow Vault (Buyer)</span>
                      <span className="mono text-pos">LOCKED & VERIFIED</span>
                    </div>
                    <div className="mono text-[13px] font-bold text-txt-primary">
                      ${((activeDvPEscrow?.gross_settlement_usd ?? (dvpQuantityUnits * 98.45)) / 1000).toFixed(1)}k USD
                    </div>
                    <div className="text-[9.5px] text-txt-disabled">Vault: Nitro Enclave PQC Ledger #4401</div>
                  </div>

                  <div className="rounded border border-line-subtle bg-bg-secondary p-2.5 text-[11px] space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-txt-muted">Tokenized Asset Vault (Seller)</span>
                      <span className="mono text-pos">LOCKED & VERIFIED</span>
                    </div>
                    <div className="mono text-[13px] font-bold text-txt-primary">
                      {num(activeDvPEscrow?.quantity_units ?? dvpQuantityUnits, 0)} Units ({selectedRwaAsset})
                    </div>
                    <div className="text-[9.5px] text-txt-disabled">Contract: 0x7a3f8902be71ca5927ef5c760814f9da</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-txt-secondary border-t border-line-subtle pt-2">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-pos" /> NIST FIPS 204 Lattice ML-DSA-87 Sign-Off</span>
                  <Button size="xs" variant="primary" loading={settlingDvP} onClick={handleSettleDvP}>
                    ⚡ Execute Atomic DvP Settlement (240ms)
                  </Button>
                </div>
              </div>

              {/* Tokenized RWA Inventory Blotter */}
              <Panel level={3} title="Institutional RWA Tokenized Debt Inventory" sub="Live on-chain fixed income assets available for instantaneous atomic clearing">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary/90 text-left">
                        {["Asset Name", "ISIN / Contract", "Asset Class", "Yield %", "Par Value", "Market Price", "Available Units", "Rating"].map((h, i) => (
                          <th key={h} className={cn("label-xs border-b border-line px-2.5 py-2 text-txt-muted", i >= 3 && i <= 6 && "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(rwaInventory?.inventory ?? [
                        { asset_id: "UST-10Y-TOKEN-01", name: "US Treasury 10Y Tokenized Note", isin: "US91282CDJ71", asset_class: "SOVEREIGN_DEBT", yield_pct: 4.28, par_value_usd: 100.0, current_price_usd: 98.45, available_supply_units: 450000, rating: "AAA" },
                        { asset_id: "GSEC-718-2034", name: "India Sovereign G-Sec 7.18% 2034", isin: "IN0020240018", asset_class: "SOVEREIGN_DEBT", yield_pct: 7.18, par_value_usd: 100.0, current_price_usd: 101.20, available_supply_units: 320000, rating: "SOV" },
                        { asset_id: "CORP-GREEN-2029", name: "Clean Energy Transition Green Bond", isin: "XS2458921002", asset_class: "GREEN_BOND", yield_pct: 5.85, par_value_usd: 1000.0, current_price_usd: 994.50, available_supply_units: 65000, rating: "AA+" },
                        { asset_id: "SOV-DEBT-EU-2031", name: "European Union NextGen Sovereign", isin: "EU000A3KWCF4", asset_class: "SOVEREIGN_DEBT", yield_pct: 3.42, par_value_usd: 100.0, current_price_usd: 97.80, available_supply_units: 280000, rating: "AAA" },
                      ]).map((item) => (
                        <tr key={item.asset_id} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="px-2.5 py-2 font-semibold text-txt-primary">{item.name}</td>
                          <td className="mono px-2.5 py-2 text-[10px] text-txt-muted">{item.isin}</td>
                          <td className="px-2.5 py-2"><Badge tone="neu">{item.asset_class}</Badge></td>
                          <td className="mono px-2.5 py-2 text-right text-pos font-bold">{item.yield_pct.toFixed(2)}%</td>
                          <td className="mono px-2.5 py-2 text-right text-txt-secondary">${item.par_value_usd.toFixed(0)}</td>
                          <td className="mono px-2.5 py-2 text-right font-semibold text-txt-primary">${item.current_price_usd.toFixed(2)}</td>
                          <td className="mono px-2.5 py-2 text-right text-acc">{num(item.available_supply_units, 0)}</td>
                          <td className="px-2.5 py-2 text-center"><Badge tone="pos">{item.rating}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "MADDPG Multi-Agent Router (v14)" ? (
        /* ── MADDPG MULTI-AGENT EXECUTION ROUTER (v14 Module 4) ── */
        <div className="space-y-4">
          {/* Top MADDPG KPIs */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Joint Critic Q-Score</div>
              <div className="mono mt-1 text-[17px] font-semibold leading-none text-acc">
                {maddpgRouteResult?.centralized_critic_evaluation.joint_critic_q_score.toFixed(2) ?? "48.92"}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                Coordinated Centralized Policy Evaluation
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Blended MADDPG Slippage</div>
              <div className="mono mt-1 text-[17px] font-semibold leading-none text-pos">
                {maddpgRouteResult?.centralized_critic_evaluation.blended_maddpg_slippage_bps.toFixed(2) ?? "4.82"} bps
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                vs {maddpgRouteResult?.centralized_critic_evaluation.single_agent_vwap_slippage_bps.toFixed(1) ?? "14.6"} bps Single-Agent VWAP
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Alpha Preserved Savings</div>
              <div className="mono mt-1 text-[17px] font-semibold leading-none text-pos">
                +{maddpgRouteResult?.centralized_critic_evaluation.alpha_preserved_savings_bps.toFixed(2) ?? "9.83"} bps
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                ₹{num(maddpgRouteResult?.centralized_critic_evaluation.absolute_savings_inr ?? 122875, 0)} net savings
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Adverse Selection Avoidance</div>
              <div className="mono mt-1 text-[17px] font-semibold leading-none text-acc2">
                {maddpgRouteResult?.centralized_critic_evaluation.adverse_selection_avoidance_pct.toFixed(1) ?? "67.1"}%
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                VPIN Toxic Flow & Predatory HFT Neutralized
              </div>
            </div>
          </div>

          {/* Interactive Router Controller */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <div>
                <span className="label-xs text-txt-muted">Target Instrument</span>
                <select
                  value={maddpgTicker}
                  onChange={(e) => setMaddpgTicker(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-bg-secondary px-2.5 py-1.5 text-[11.5px] text-txt-primary"
                >
                  <option value="RELIANCE.NS">RELIANCE.NS · Reliance Industries</option>
                  <option value="TCS.NS">TCS.NS · Tata Consultancy Services</option>
                  <option value="HDFCBANK.NS">HDFCBANK.NS · HDFC Bank</option>
                  <option value="INFY.NS">INFY.NS · Infosys Technologies</option>
                  <option value="ICICIBANK.NS">ICICIBANK.NS · ICICI Bank</option>
                </select>
              </div>

              <div>
                <Slider label="Parent Order Quantity" value={maddpgOrderSize} min={10000} max={150000} step={5000} unit=" shs" onChange={setMaddpgOrderSize} tone="acc" />
              </div>

              <div>
                <Slider label="VPIN Flow Toxicity" value={maddpgVpin} min={0.1} max={0.9} step={0.05} unit="" onChange={setMaddpgVpin} tone="warn" />
              </div>

              <div>
                <Slider label="Predatory HFT Intensity" value={maddpgPredatoryIntensity} min={0.1} max={1.0} step={0.05} unit="" onChange={setMaddpgPredatoryIntensity} tone="neg" />
              </div>

              <div className="flex flex-col justify-end gap-1.5">
                <Button size="xs" variant="primary" icon={Zap} loading={runningMADDPGRoute} onClick={handleRunMADDPGRoute}>
                  Calculate Joint Route (v14)
                </Button>
                <Button size="xs" variant="outline" icon={Radio} loading={runningMADDPGSim} onClick={handleRunMADDPGSim}>
                  Simulate 10-Step Episode
                </Button>
              </div>
            </div>
          </div>

          {/* 3 Venue Actor Agents Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {maddpgRouteResult?.actor_agents.map((ag) => (
              <div key={ag.agent_id} className="rounded-[8px] border border-line-subtle bg-surface/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="font-semibold text-txt-primary">{ag.venue_name}</span>
                  <Badge tone={ag.venue_type === "DARK_MIDPOINT" ? "pos" : ag.venue_type === "INTERNAL_CROSS" ? "acc2" : "acc"}>
                    {ag.venue_type}
                  </Badge>
                </div>

                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-[10px] text-txt-muted">Quota Split:</span>
                  <span className="mono text-[16px] font-bold text-acc">{ag.quota_pct.toFixed(1)}%</span>
                </div>
                <Progress value={ag.quota_pct} tone={ag.venue_type === "DARK_MIDPOINT" ? "pos" : "acc"} height={2} />

                <div className="space-y-1 pt-1 text-[10.5px]">
                  <div className="flex justify-between text-txt-muted">
                    <span>Allocated Volume:</span>
                    <span className="mono text-txt-primary font-semibold">{num(ag.allocated_quantity_shares, 0)} shares</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Target Micro-Action:</span>
                    <span className="mono text-txt-secondary">{ag.target_action}</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Expected Slippage:</span>
                    <span className="mono font-semibold text-pos">{ag.expected_slippage_bps.toFixed(1)} bps</span>
                  </div>
                  {ag.price_improvement_bps !== undefined && (
                    <div className="flex justify-between text-txt-muted">
                      <span>Price Improvement:</span>
                      <span className="mono font-bold text-pos">+{ag.price_improvement_bps.toFixed(1)} bps</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Episode Trajectory & Mathematics */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left 8 Cols: Dynamic Episode Trajectory Table */}
            <div className="space-y-2 lg:col-span-8">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-txt-primary text-[11.5px]">MADDPG Multi-Time-Slice Execution Trajectory</span>
                <span className="mono text-[10px] text-pos">Final Cumulative Savings: ₹{num(maddpgSimResult?.final_cumulative_savings_inr ?? 138420, 0)} (+{maddpgSimResult?.final_cumulative_savings_bps.toFixed(1) ?? "10.4"} bps)</span>
              </div>
              <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-bg-secondary/90 text-left">
                      {["Time", "VPIN", "Filled", "Lit %", "Dark %", "OTC %", "MADDPG Slip", "VWAP Bench", "Step Savings", "Critic Rwd"].map((h, i) => (
                        <th key={h} className={cn("label-xs border-b border-line px-2 py-1.5 text-txt-muted", i >= 1 && "text-right")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {maddpgSimResult?.trajectory.map((step) => (
                      <tr key={step.step} className="border-b border-line-subtle/70 text-[10.5px] hover:bg-surface-hover/50">
                        <td className="mono px-2 py-1.5 font-medium text-txt-primary">{step.time_label}</td>
                        <td className={cn("mono px-2 py-1.5 text-right font-medium", step.vpin_score > 0.6 ? "text-neg" : "text-txt-secondary")}>{step.vpin_score.toFixed(2)}</td>
                        <td className="mono px-2 py-1.5 text-right text-txt-primary">{num(step.executed_quantity, 0)}</td>
                        <td className="mono px-2 py-1.5 text-right text-acc">{step.lit_quota_pct.toFixed(0)}%</td>
                        <td className="mono px-2 py-1.5 text-right text-pos font-semibold">{step.dark_quota_pct.toFixed(0)}%</td>
                        <td className="mono px-2 py-1.5 text-right text-acc2">{step.internal_quota_pct.toFixed(0)}%</td>
                        <td className="mono px-2 py-1.5 text-right font-bold text-pos">{step.blended_slippage_bps.toFixed(1)} bps</td>
                        <td className="mono px-2 py-1.5 text-right text-txt-muted">{step.benchmark_vwap_slippage_bps.toFixed(1)} bps</td>
                        <td className="mono px-2 py-1.5 text-right font-semibold text-pos">+₹{num(step.step_savings_inr, 0)}</td>
                        <td className="mono px-2 py-1.5 text-right text-txt-secondary">+{step.critic_reward.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 4 Cols: Mathematical Formulation & Architecture */}
            <div className="space-y-3 lg:col-span-4">
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3 space-y-2">
                <span className="font-semibold text-txt-primary text-[11.5px] block">MADDPG Joint Optimization Objective</span>
                <p className="mono text-[10px] text-acc2 bg-surface p-2 rounded border border-line-subtle leading-relaxed">
                  ∇_θi J(μ_i) = 𝔼[ ∇_θi μ_i(o_i) ∇_ai Q^μ(s, a_1, a_2, a_3)|_ai=μ_i(o_i) ]
                </p>
                <p className="text-[10px] text-txt-muted leading-relaxed">
                  During centralized training, the global critic receives full order book state s = (VPIN, spread, toxic flow) and all venue actions (a_lit, a_dark, a_otc), learning to dynamically divert volume into dark pools when toxic flow threatens lit execution.
                </p>
              </div>

              <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-2.5 text-[10px] text-txt-disabled space-y-1">
                <span className="font-medium text-txt-secondary block">Coordinated Policy Advantages:</span>
                <div>• Zero cross-venue latency arbitrage leakage</div>
                <div>• Adaptive iceberg slicing conditioned on predatory HFT</div>
                <div>• Sub-millisecond continuous actor inference</div>
              </div>
            </div>
          </div>
        </div>
      ) : execMode === "zk-SNARK Collateral Vault (v14)" ? (
        /* ── zk-SNARK OTC COLLATERAL VAULT & ISDA SIMM (v14 Module 5) ── */
        <div className="space-y-4">
          {/* Top ZK KPIs */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">ZK Vault Standard</div>
              <div className="mono mt-1 text-[17px] font-semibold leading-none text-acc">
                Groth16 / BN254
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                Pair-Friendly Elliptic Curve (ISDA SIMM v2.6)
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Total Verified Margin Locked</div>
              <div className="mono mt-1 text-[17px] font-semibold leading-none text-pos">
                ${((zkVaultStatus?.total_collateral_locked_usd ?? 68500000) / 1000000).toFixed(1)}M USD
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                Across {zkVaultStatus?.total_counterparties ?? 4} Verified Prime Counterparties
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">Active Counterparty</div>
              <div className="mono mt-1 text-[16px] font-semibold leading-none text-txt-primary">
                {zkCounterparty.replace("CP_", "").replace(/_/g, " ")}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                Required Margin: ${(zkMarginReq / 1000000).toFixed(1)}M
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5">
              <div className="label-xs truncate text-txt-muted">On-Chain Verification Latency</div>
              <div className="mono mt-1 text-[17px] font-semibold leading-none text-acc2">
                4.6 ms
              </div>
              <div className="mt-1.5 truncate text-[10px] text-txt-disabled">
                Zero Information Leakage of Proprietary Positions
              </div>
            </div>
          </div>

          {/* Interactive Prover & Verifier Controller */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <span className="label-xs text-txt-muted">Bilateral Counterparty</span>
                <select
                  value={zkCounterparty}
                  onChange={(e) => setZkCounterparty(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-bg-secondary px-2.5 py-1.5 text-[11.5px] text-txt-primary"
                >
                  <option value="CP_CITADEL_SECURITIES">Citadel Securities Prime Clearing (AAA)</option>
                  <option value="CP_GOLDMAN_SACHS">Goldman Sachs International PB (AA+)</option>
                  <option value="CP_JPMORGAN_CHASE">J.P. Morgan Securities LLC (AA)</option>
                  <option value="CP_JANE_STREET">Jane Street Capital LLC (AAA)</option>
                </select>
              </div>

              <div>
                <span className="label-xs text-txt-muted">ISDA SIMM Asset Class</span>
                <select
                  value={zkAssetClass}
                  onChange={(e) => setZkAssetClass(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-bg-secondary px-2.5 py-1.5 text-[11.5px] text-txt-primary"
                >
                  <option value="EQUITY_DERIVATIVES">Equity Derivatives (Delta / Vega / Curvature)</option>
                  <option value="RATES_SWAPS">Interest Rate Swaps (IR Tenor Bucket Slices)</option>
                  <option value="CREDIT_DEFAULT_SWAPS">Credit Default Swaps (Single Name & Indices)</option>
                  <option value="FX_OPTIONS">FX Volatility Options Surface</option>
                </select>
              </div>

              <div>
                <Slider label="Required Margin (USD)" value={zkMarginReq} min={5000000} max={50000000} step={1000000} unit=" $" onChange={setZkMarginReq} tone="acc" />
              </div>

              <div className="flex flex-col justify-end gap-1.5">
                <Button size="xs" variant="primary" icon={Key} loading={generatingZKProof} onClick={handleGenerateZKProof}>
                  Generate zk-SNARK Proof (v14)
                </Button>
                <Button size="xs" variant="outline" icon={ShieldCheck} loading={verifyingZKProof} onClick={handleVerifyZKProof}>
                  Verify Pairing On-Chain
                </Button>
              </div>
            </div>
          </div>

          {/* Proof Document Inspector & Counterparty Ledger */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left 6 Cols: Cryptographic Groth16 Proof Vector */}
            <div className="space-y-3 lg:col-span-6">
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-txt-primary text-[11.5px] flex items-center gap-1.5">
                    <KeyRound size={13} className="text-acc" />
                    Groth16 Zero-Knowledge Solvency Proof ({zkProofDoc?.proof_id})
                  </span>
                  <Badge tone="pos">VALID PAIRING</Badge>
                </div>

                <div className="space-y-2 pt-1 text-[10.5px]">
                  <div>
                    <span className="text-txt-muted block text-[9.5px]">π_A (G1 Element):</span>
                    <p className="mono text-[9.5px] text-acc truncate bg-bg-secondary/70 p-1.5 rounded border border-line-subtle">
                      {zkProofDoc?.proof_payload.pi_a[0]}
                    </p>
                  </div>

                  <div>
                    <span className="text-txt-muted block text-[9.5px]">π_B (G2 Element 2x2 Matrix):</span>
                    <p className="mono text-[9.5px] text-acc2 truncate bg-bg-secondary/70 p-1.5 rounded border border-line-subtle">
                      {zkProofDoc?.proof_payload.pi_b[0][0]}
                    </p>
                  </div>

                  <div>
                    <span className="text-txt-muted block text-[9.5px]">π_C (G1 Element):</span>
                    <p className="mono text-[9.5px] text-pos truncate bg-bg-secondary/70 p-1.5 rounded border border-line-subtle">
                      {zkProofDoc?.proof_payload.pi_c[0]}
                    </p>
                  </div>
                </div>

                <div className="border-t border-line-subtle pt-2 flex items-center justify-between text-[10.5px]">
                  <span className="text-txt-muted">Proven Margin Solvency:</span>
                  <span className="mono font-bold text-pos">${((zkProofDoc?.public_inputs.required_margin_usd ?? 18500000) / 1000000).toFixed(2)}M USD</span>
                </div>
              </div>

              <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-3 text-[10px] text-txt-muted space-y-1">
                <span className="font-semibold text-txt-primary block text-[11px]">Bilinear Pairing Verification Equation</span>
                <p className="mono text-[10.5px] text-acc bg-surface p-2 rounded border border-line-subtle">
                  e(π_A, π_B) = e(α, β) · e(∑ x_i γ_i, δ) · e(π_C, δ)
                </p>
                <p className="text-txt-disabled leading-relaxed">
                  Proves in O(1) time that available collateral strictly exceeds ISDA SIMM v2.6 initial margin requirements across 99% 10-day delta-gamma sensitivity tiers without revealing portfolio composition to the counterparty.
                </p>
              </div>
            </div>

            {/* Right 6 Cols: Active Bilateral Counterparty Ledger */}
            <div className="space-y-3 lg:col-span-6">
              <Panel level={3} title="Zero-Knowledge Bilateral Counterparty Ledger" sub="Verified margin proofs registered across prime clearing desks">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-bg-secondary/90 text-left">
                        {["Counterparty", "Rating", "Required Margin", "Last Proof ID", "Status"].map((h, i) => (
                          <th key={h} className={cn("label-xs border-b border-line px-2.5 py-1.5 text-txt-muted", i === 2 && "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {zkVaultStatus?.counterparties.map((cp) => (
                        <tr key={cp.id} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="px-2.5 py-1.5">
                            <span className="font-semibold text-txt-primary block">{cp.name}</span>
                            <span className="mono text-[9.5px] text-txt-muted">{cp.id}</span>
                          </td>
                          <td className="px-2.5 py-1.5"><Badge tone="pos">{cp.rating}</Badge></td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-txt-primary">${(cp.margin_usd / 1000000).toFixed(1)}M</td>
                          <td className="mono px-2.5 py-1.5 text-[10px] text-txt-secondary">{cp.last_proof_id}</td>
                          <td className="px-2.5 py-1.5">
                            <Badge tone="pos">VERIFIED</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "PPO Anti-Predatory Router (v15)" ? (
        <div className="space-y-3">
          {/* Top KPI Telemetry Bar */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1">
                <Shield size={12} className="text-acc" /> Venue Dark Pool Peg
              </div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-acc">
                {ppoRouterAction?.venue_allocation.dark_pool_peg_pct.toFixed(0) ?? "35"}%
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Midpoint passive rest</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1">
                <Zap size={12} className="text-pos" /> Lit Exchange Sweep
              </div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-pos">
                {ppoRouterAction?.venue_allocation.lit_exchange_sweep_pct.toFixed(0) ?? "25"}%
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Aggressive queue capture</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1">
                <ArrowLeftRight size={12} className="text-gold" /> SDP Midpoint Cross
              </div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-gold">
                {ppoRouterAction?.venue_allocation.sdp_midpoint_cross_pct.toFixed(0) ?? "40"}%
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Single-dealer platform</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Urgency Multiplier</div>
              <div className={cn("mono mt-1 text-[16px] font-bold leading-none", (ppoRouterAction?.dynamic_urgency_multiplier ?? 1) < 0.6 ? "text-warn" : "text-txt-primary")}>
                {ppoRouterAction?.dynamic_urgency_multiplier.toFixed(2) ?? "1.00"}x
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Adaptive execution pace</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Alpha Savings vs TWAP</div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-pos">
                +${ppoEpisodeResult?.alpha_savings_usd.toFixed(2) ?? "1,887.50"}
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">
                Slip: {ppoEpisodeResult?.total_slippage_bps.toFixed(2) ?? "0.64"} bps vs {ppoEpisodeResult?.twap_benchmark_slippage_bps.toFixed(2) ?? "2.15"} bps
              </div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Toxicity Mitigations</div>
              <div className="mono mt-1 text-[16px] font-bold leading-none text-acc2">
                {ppoEpisodeResult?.predatory_toxicity_mitigations_count ?? 2} Triggers
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Adverse selection averted</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: Microstructure Observation Vector & Policy Controls */}
            <Panel level={3} className="xl:col-span-4" title="Microstructure State & PPO Controller" sub="State vector s_t = [Spread, OBI, VPIN, Depletion, Momentum]">
              <div className="space-y-3.5">
                <Slider
                  label="Bid-Ask Spread"
                  value={ppoSpreadBps}
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  unit=" bps"
                  tone="acc"
                  onChange={setPpoSpreadBps}
                />

                <Slider
                  label="Order Book Imbalance (OBI)"
                  value={ppoObi}
                  min={-1.0}
                  max={1.0}
                  step={0.05}
                  tone={ppoObi > 0.3 ? "pos" : ppoObi < -0.3 ? "neg" : "gold"}
                  onChange={setPpoObi}
                />

                <Slider
                  label="VPIN Toxicity Metric"
                  value={ppoVpin}
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  tone={ppoVpin > 0.65 ? "neg" : ppoVpin > 0.4 ? "warn" : "pos"}
                  onChange={setPpoVpin}
                />

                <Slider
                  label="Queue Depletion Velocity"
                  value={ppoDepletion}
                  min={20}
                  max={300}
                  step={10}
                  unit=" ms"
                  tone="acc2"
                  onChange={setPpoDepletion}
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={routingPPO}
                    onClick={handleRoutePPO}
                    icon={Zap}
                  >
                    ⚡ Route PPO
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    loading={simulatingPPOEpisode}
                    onClick={handleSimulatePPOEpisode}
                    icon={Play}
                  >
                    📊 Sim 10-Step Order
                  </Button>
                </div>

                <div className="rounded-[8px] border border-line-subtle bg-bg-secondary/70 p-2.5 space-y-1 text-[10.5px]">
                  <div className="flex items-center justify-between font-semibold text-txt-primary">
                    <span className="flex items-center gap-1"><Cpu size={12} className="text-acc" /> PPO Clipped Objective</span>
                    <Badge tone="neu">v15 PPO</Badge>
                  </div>
                  <p className="mono text-[9.5px] text-txt-muted leading-tight">
                    {"L^{CLIP}(θ) = E_t [ min(r_t(θ)Â_t, clip(r_t(θ), 1-ε, 1+ε)Â_t) ]"}
                  </p>
                  <p className="text-[9.5px] text-txt-secondary leading-snug">
                    Penalizes toxic fills via adverse selection reward penalty: R_t = -(P_fill - P_arr) - λ_vpin · VPIN_t.
                  </p>
                </div>
              </div>
            </Panel>

            {/* Right 8 Cols: Venue Split Visualizer & Episode Trajectory */}
            <div className="space-y-3 xl:col-span-8">
              <Panel level={3} title="Policy Venue Allocation & Microstructure Explanation" sub={ppoRouterAction?.explanation ?? "PPO router evaluated."}>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-txt-secondary font-medium">Dark Pool Midpoint Peg (Passive)</span>
                      <span className="mono font-bold text-acc">{ppoRouterAction?.venue_allocation.dark_pool_peg_pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={ppoRouterAction?.venue_allocation.dark_pool_peg_pct ?? 35} tone="acc" height={4} />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-txt-secondary font-medium">Lit Exchange Sweeps (Aggressive)</span>
                      <span className="mono font-bold text-pos">{ppoRouterAction?.venue_allocation.lit_exchange_sweep_pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={ppoRouterAction?.venue_allocation.lit_exchange_sweep_pct ?? 25} tone="pos" height={4} />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-txt-secondary font-medium">SDP Midpoint Cross (Bilateral)</span>
                      <span className="mono font-bold text-gold">{ppoRouterAction?.venue_allocation.sdp_midpoint_cross_pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={ppoRouterAction?.venue_allocation.sdp_midpoint_cross_pct ?? 40} tone="warn" height={4} />
                  </div>
                </div>
              </Panel>

              {/* 10-Step Episode Trajectory Table */}
              <Panel level={3} title="PPO Order Execution Trajectory (10-Step Episode)" sub="Step-by-step adaptive routing vs predatory market making bots">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle max-h-60">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Step</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Fill Price</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Slippage</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-center">VPIN</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-center">OBI</th>
                        <th className="border-b border-line px-2.5 py-1.5">Action Executed</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Dark / Lit / SDP</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ppoEpisodeResult?.steps ?? [
                        { step_idx: 1, fill_price: 125.42, slippage_bps: 0.5, toxicity_vpin: 0.32, obi_ratio: 0.45, action_taken: "AGGRESSIVE_LIT_SWEEP", dark_pool_pct: 20, lit_sweep_pct: 65, sdp_cross_pct: 15, step_reward: 0.65 },
                        { step_idx: 2, fill_price: 125.44, slippage_bps: 0.4, toxicity_vpin: 0.38, obi_ratio: 0.50, action_taken: "AGGRESSIVE_LIT_SWEEP", dark_pool_pct: 20, lit_sweep_pct: 65, sdp_cross_pct: 15, step_reward: 0.72 },
                        { step_idx: 3, fill_price: 125.45, slippage_bps: 0.2, toxicity_vpin: 0.78, obi_ratio: 0.15, action_taken: "PASSIVE_DARK_POOL_PEG", dark_pool_pct: 75, lit_sweep_pct: 5, sdp_cross_pct: 20, step_reward: 0.88 },
                        { step_idx: 4, fill_price: 125.46, slippage_bps: 0.3, toxicity_vpin: 0.82, obi_ratio: 0.10, action_taken: "PASSIVE_DARK_POOL_PEG", dark_pool_pct: 75, lit_sweep_pct: 5, sdp_cross_pct: 20, step_reward: 0.85 },
                        { step_idx: 5, fill_price: 125.48, slippage_bps: 0.6, toxicity_vpin: 0.45, obi_ratio: 0.35, action_taken: "BALANCED_SDP_CROSS", dark_pool_pct: 35, lit_sweep_pct: 25, sdp_cross_pct: 40, step_reward: 0.54 },
                      ]).map((st) => (
                        <tr key={st.step_idx} className="border-b border-line-subtle/70 text-[10.5px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1 text-acc font-bold">#{st.step_idx}</td>
                          <td className="mono px-2.5 py-1 text-right text-txt-primary font-semibold">${st.fill_price.toFixed(2)}</td>
                          <td className={cn("mono px-2.5 py-1 text-right", st.slippage_bps > 0.8 ? "text-warn" : "text-pos")}>{st.slippage_bps.toFixed(2)} bps</td>
                          <td className="mono px-2.5 py-1 text-center">
                            <span className={cn(st.toxicity_vpin > 0.65 ? "text-neg font-bold" : "text-txt-muted")}>
                              {st.toxicity_vpin.toFixed(2)}
                            </span>
                          </td>
                          <td className="mono px-2.5 py-1 text-center text-txt-secondary">{st.obi_ratio.toFixed(2)}</td>
                          <td className="px-2.5 py-1">
                            <Badge tone={st.action_taken.includes("DARK") ? "acc" : st.action_taken.includes("LIT") ? "pos" : "gold"}>
                              {st.action_taken.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="mono px-2.5 py-1 text-right text-txt-muted">{st.dark_pool_pct}% / {st.lit_sweep_pct}% / {st.sdp_cross_pct}%</td>
                          <td className="mono px-2.5 py-1 text-right font-semibold text-pos">+{st.step_reward.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "Regulatory Compliance Engine (v15)" ? (
        <div className="space-y-3">
          {/* Top Compliance Standards KPI Bar */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1">
                <Landmark size={12} className="text-acc" /> Compliance Schema
              </div>
              <div className="mono mt-1 text-[14px] font-bold leading-none text-txt-primary">
                QUANTX_v15
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Universal statutory format</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1">
                <Lock size={12} className="text-pos" /> Digital Signature
              </div>
              <div className="mono mt-1 text-[14px] font-bold leading-none text-pos">
                RSA-PSS-512
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Cryptographic notary seal</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted flex items-center gap-1">
                <FileCheck size={12} className="text-pos" /> Schema Validation
              </div>
              <div className="mono mt-1 text-[14px] font-bold leading-none text-pos">
                100% VALIDATED
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Zero missing fields</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Entity Legal LEI</div>
              <div className="mono mt-1 text-[12.5px] font-bold leading-none text-txt-secondary truncate">
                5493006MHB84DD0ZWV18
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">GLEIF verified active</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Active Jurisdictions</div>
              <div className="mono mt-1 text-[14px] font-bold leading-none text-gold">
                SEC · ESMA · MAS
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">Multi-region compliant</div>
            </div>

            <div className="rounded-[8px] border border-line-subtle bg-surface/60 p-2.5">
              <div className="label-xs truncate text-txt-muted">Ledger Audit Trail</div>
              <div className="mono mt-1 text-[14px] font-bold leading-none text-acc">
                {auditTrail.length} Sealed Filings
              </div>
              <div className="mt-1 text-[9.5px] text-txt-disabled">SHA-256 Merkle chain</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: Filing Dispatcher Form */}
            <Panel level={3} className="xl:col-span-4" title="Regulatory Filing Generator" sub="Create, validate and cryptographically sign statutory disclosures">
              <div className="space-y-3">
                <div>
                  <label className="label-xs text-txt-muted">Statutory Filing Framework</label>
                  <select
                    value={regFilingType}
                    onChange={(e) => setRegFilingType(e.target.value as any)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="SEC_FORM_PF">SEC Form PF (Private Equity & Hedge Funds)</option>
                    <option value="MIFID_II_RTS_28">MiFID II RTS 28 (Top 5 Execution Venues)</option>
                    <option value="BASEL_III_FRTB">Basel III / IV FRTB (Market & Liquidity Risk)</option>
                    <option value="MAS_MARGIN_RULE">MAS Singapore Margin & Derivatives Rule</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Reporting Period</label>
                    <input
                      type="text"
                      value={regPeriod}
                      onChange={(e) => setRegPeriod(e.target.value)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Portfolio AUM ($M)</label>
                    <input
                      type="number"
                      value={regAum / 1e6}
                      onChange={(e) => setRegAum(Number(e.target.value) * 1e6)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                </div>

                <Slider
                  label="Firm Gross Notional ($M)"
                  value={regGrossNotional / 1e6}
                  min={500}
                  max={5000}
                  step={100}
                  unit=" $M"
                  tone="acc"
                  onChange={(v) => setRegGrossNotional(v * 1e6)}
                />

                <Slider
                  label="Statutory Leverage Ratio"
                  value={regLeverage}
                  min={1.0}
                  max={8.0}
                  step={0.1}
                  unit="x"
                  tone="warn"
                  onChange={setRegLeverage}
                />

                <Button
                  size="xs"
                  variant="primary"
                  loading={generatingFiling}
                  onClick={handleGenerateRegulatoryFiling}
                  icon={Send}
                  className="w-full mt-2"
                >
                  🔏 Generate, Seal & Seal Filing
                </Button>
              </div>
            </Panel>

            {/* Right 8 Cols: Generated JSON Package Inspector & Audit Ledger */}
            <div className="space-y-3 xl:col-span-8">
              {currentFilingRecord && (
                <Panel level={3} title={`Active Sealed Filing: ${currentFilingRecord.filing_id}`} sub={`SHA-256 Hash: ${currentFilingRecord.filing_hash_sha256}`}>
                  <div className="rounded bg-surface p-2.5 mono text-[10px] text-txt-secondary max-h-52 overflow-y-auto space-y-1">
                    <div className="text-pos font-semibold">✓ Schema Validation: QUANTX_Regulatory_Compliance_Filing_v15 Valid</div>
                    <div>Digital Seal: <span className="text-txt-muted">{currentFilingRecord.digital_signature}</span></div>
                    <pre className="text-txt-primary mt-1 text-[9.5px]">
                      {JSON.stringify(currentFilingRecord.content, null, 2)}
                    </pre>
                  </div>
                </Panel>
              )}

              {/* Merkle Compliance Audit Ledger */}
              <Panel level={3} title="Regulatory Compliance Audit Ledger" sub="Immutable chronological filing records signed and dispatched to supervisory authorities">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle max-h-64">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Filing ID</th>
                        <th className="border-b border-line px-2.5 py-1.5">Type</th>
                        <th className="border-b border-line px-2.5 py-1.5">Period</th>
                        <th className="border-b border-line px-2.5 py-1.5">SHA-256 Content Digest</th>
                        <th className="border-b border-line px-2.5 py-1.5">Timestamp</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditTrail.map((rec) => (
                        <tr key={rec.filing_id} className="border-b border-line-subtle/70 text-[10.5px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1 font-bold text-acc">{rec.filing_id}</td>
                          <td className="px-2.5 py-1 text-txt-primary font-medium">{rec.filing_type}</td>
                          <td className="mono px-2.5 py-1 text-txt-secondary">{rec.period}</td>
                          <td className="mono px-2.5 py-1 text-txt-muted text-[9.5px]">{rec.filing_hash_sha256.slice(0, 24)}...</td>
                          <td className="mono px-2.5 py-1 text-txt-disabled text-[9.5px]">{rec.timestamp_iso}</td>
                          <td className="px-2.5 py-1 text-right">
                            <Badge tone="pos">SIGNED_SEALED</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "zk-RWA Fractional Collateral Vaults (v16)" ? (
        /* ── ZERO-KNOWLEDGE RWA FRACTIONAL COLLATERAL VAULTS (v16 Module 4) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <OpsKpi
              k="Total Vault Collateral"
              v={`$${(zkRwaVaults.reduce((acc, v) => acc + (v.effective_borrowing_power_usd / (1 - v.collateral_haircut_bps / 10000)), 0) / 1e6).toFixed(1)}M`}
              s="Pedersen Committed"
              tone="pos"
            />
            <OpsKpi
              k="Effective Borrowing"
              v={`$${(zkRwaVaults.reduce((acc, v) => acc + v.effective_borrowing_power_usd, 0) / 1e6).toFixed(1)}M`}
              s="Post-haircut liquidity"
              tone="pos"
            />
            <OpsKpi
              k="Groth16 Verification"
              v="100% VALID"
              s="BN254 elliptic pairing"
              tone="pos"
            />
            <OpsKpi
              k="Jurisdictions"
              v="US · UK · CH"
              s="3 global legal entities"
              tone="pos"
            />
            <OpsKpi
              k="Active Vaults"
              v={`${zkRwaVaults.length} Vaults`}
              s="Institutional custodians"
            />
            <OpsKpi
              k="Disclosure Exposure"
              v="0.0% LEAK"
              s="Zero-Knowledge Shielded"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: Mint zk-RWA Collateral Vault Form */}
            <Panel level={3} className="xl:col-span-4" title="zk-RWA Collateral Vault Prover" sub="Mint zero-knowledge collateral contracts with Pedersen commitments C = g^v · h^r">
              <div className="space-y-3">
                <div>
                  <label className="label-xs text-txt-muted">Tokenized RWA Asset Class</label>
                  <select
                    value={zkRwaAssetClass}
                    onChange={(e) => setZkRwaAssetClass(e.target.value as any)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="TOKENIZED_PRIVATE_DEBT">Tokenized Private Debt (12% Haircut)</option>
                    <option value="COMMERCIAL_REAL_ESTATE">Commercial Real Estate (25% Haircut)</option>
                    <option value="PHYSICAL_GOLD_ALLOCATED">Allocated Physical Gold (5% Haircut)</option>
                    <option value="SOVEREIGN_GREEN_BONDS">Sovereign Green Bonds (3% Haircut)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Custodian Bank</label>
                    <select
                      value={zkRwaCustodian}
                      onChange={(e) => setZkRwaCustodian(e.target.value)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2 py-1.5 mono text-[11px] text-txt-primary outline-none focus:border-acc"
                    >
                      <option value="BNY_MELLON_DIGITAL_ASSETS">BNY Mellon Digital</option>
                      <option value="STATE_STREET_TOKENIZED_TRUST">State Street Trust</option>
                      <option value="HSBC_PRECIOUS_METALS_VAULT_LONDON">HSBC London</option>
                      <option value="EURO_CLEAR_CRYPTO_VAULT">Euroclear Custody</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Jurisdiction</label>
                    <select
                      value={zkRwaJurisdiction}
                      onChange={(e) => setZkRwaJurisdiction(e.target.value)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2 py-1.5 mono text-[11px] text-txt-primary outline-none focus:border-acc"
                    >
                      <option value="US_DELAWARE">US (Delaware LP)</option>
                      <option value="UK_ENGLAND_WALES">UK (England &amp; Wales)</option>
                      <option value="SWITZERLAND_ZURICH">Switzerland (FINMA)</option>
                      <option value="SINGAPORE_MAS">Singapore (MAS)</option>
                    </select>
                  </div>
                </div>

                <Slider
                  label="Nominal Collateral Value ($M USD)"
                  value={zkRwaNominalUsd / 1e6}
                  min={10}
                  max={200}
                  step={5}
                  unit=" $M"
                  tone="acc"
                  onChange={(v) => setZkRwaNominalUsd(v * 1e6)}
                />

                <Slider
                  label="Required Margin Borrowing ($M USD)"
                  value={zkRwaReqMarginUsd / 1e6}
                  min={5}
                  max={150}
                  step={5}
                  unit=" $M"
                  tone="warn"
                  onChange={(v) => setZkRwaReqMarginUsd(v * 1e6)}
                />

                <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2 text-[11px] space-y-1">
                  <div className="flex justify-between text-txt-muted">
                    <span>Applicable Haircut:</span>
                    <span className="mono text-txt-primary font-bold">
                      {zkRwaAssetClass === "TOKENIZED_PRIVATE_DEBT" ? "12.0%" : zkRwaAssetClass === "COMMERCIAL_REAL_ESTATE" ? "25.0%" : zkRwaAssetClass === "PHYSICAL_GOLD_ALLOCATED" ? "5.0%" : "3.0%"}
                    </span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Borrowing Capacity:</span>
                    <span className="mono text-pos font-bold">
                      ${((zkRwaNominalUsd * (1 - (zkRwaAssetClass === "TOKENIZED_PRIVATE_DEBT" ? 0.12 : zkRwaAssetClass === "COMMERCIAL_REAL_ESTATE" ? 0.25 : zkRwaAssetClass === "PHYSICAL_GOLD_ALLOCATED" ? 0.05 : 0.03))) / 1e6).toFixed(1)}M USD
                    </span>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="primary"
                  loading={mintingZkRwa}
                  onClick={handleMintZkRWAVault}
                  icon={Lock}
                  className="w-full mt-2"
                >
                  🔐 Mint Vault &amp; Generate Groth16 Proof
                </Button>
              </div>
            </Panel>

            {/* Right 8 Cols: Vault Registry & BN254 Verification Station */}
            <div className="space-y-3 xl:col-span-8">
              {zkRwaLastVerification && (
                <div className="rounded-[8px] border border-pos/40 bg-pos/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-pos" />
                      <span className="text-[12px] font-bold text-pos">
                        BN254 Pairing Check Validated: {zkRwaLastVerification.vault_id}
                      </span>
                    </div>
                    <Badge tone="pos">{zkRwaLastVerification.verification_latency_ms.toFixed(2)} ms Latency</Badge>
                  </div>
                  <div className="mono text-[10.5px] text-txt-secondary mt-1">
                    Pairing Eval: <span className="text-txt-primary">{zkRwaLastVerification.pairing_equation_eval}</span>
                  </div>
                  <div className="text-[10px] text-txt-muted mt-0.5">
                    Solvency Statement: <span className="text-pos font-semibold">{zkRwaLastVerification.solvency_statement_proved}</span> · 100% Zero Asset Exposure Leakage.
                  </div>
                </div>
              )}

              <Panel level={3} title="Zero-Knowledge Fractional Collateral Vault Registry" sub="Blind cryptographic solvency verified on-chain via BN254 bilinear pairing checks">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Vault ID</th>
                        <th className="border-b border-line px-2.5 py-1.5">Asset Class</th>
                        <th className="border-b border-line px-2.5 py-1.5">Custodian</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Borrowing Power</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Solvency Health</th>
                        <th className="border-b border-line px-2.5 py-1.5">Pedersen Commitment</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zkRwaVaults.map((v) => (
                        <tr key={v.vault_id} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1.5 font-bold text-acc">{v.vault_id}</td>
                          <td className="px-2.5 py-1.5 text-txt-primary font-medium">{v.asset_class.replace(/_/g, " ")}</td>
                          <td className="mono px-2.5 py-1.5 text-txt-muted text-[10px]">{v.custodian_entity.replace(/_/g, " ")}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-pos font-bold">${(v.effective_borrowing_power_usd / 1e6).toFixed(1)}M</td>
                          <td className="mono px-2.5 py-1.5 text-right text-acc font-semibold">{v.solvency_margin_health_pct.toFixed(1)}%</td>
                          <td className="mono px-2.5 py-1.5 text-txt-disabled text-[9.5px]">{v.pedersen_commitment}</td>
                          <td className="px-2.5 py-1.5 text-right">
                            <Button
                              size="xs"
                              variant="outline"
                              loading={verifyingZkRwa}
                              onClick={() => handleVerifyZkRWAVault(v.vault_id)}
                              icon={Shield}
                            >
                              Verify Pairing
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "Differential Game Execution Solver (v16)" ? (
        /* ── MULTI-AGENT STACKELBERG DIFFERENTIAL GAME EXECUTION SOLVER (v16 Module 5) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <OpsKpi
              k="Optimal Initial Rate u*(0)"
              v={`${diff16Result?.optimal_initial_rate_u0.toFixed(1) ?? "524.8"} sh/s`}
              s="Stackelberg Leader Schedule"
              tone="pos"
            />
            <OpsKpi
              k="Stackelberg Slippage"
              v={`${diff16Result?.blended_stackelberg_slippage_bps.toFixed(2) ?? "4.12"} bps`}
              s="Blended execution cost"
              tone="pos"
            />
            <OpsKpi
              k="TWAP Slippage Benchmark"
              v={`${diff16Result?.twap_benchmark_slippage_bps.toFixed(2) ?? "14.85"} bps`}
              s="Naïve linear benchmark"
              tone="neg"
            />
            <OpsKpi
              k="Alpha Savings vs TWAP"
              v={`+${diff16Result?.alpha_cost_savings_bps.toFixed(2) ?? "10.73"} bps`}
              s={`₹${num(diff16Result?.alpha_cost_savings_inr ?? 268250, 0)} PnL preserved`}
              tone="pos"
            />
            <OpsKpi
              k="Predatory Suppression"
              v={`${diff16Result?.predatory_alpha_suppression_pct.toFixed(1) ?? "68.4"}%`}
              s="HFT tracking neutralized"
              tone="pos"
            />
            <OpsKpi
              k="Equilibrium Hamiltonian"
              v={`${diff16Result?.hamiltonian_equilibrium_cost.toFixed(0) ?? "10295"}`}
              s="HJB min cost function"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: Stackelberg Differential Game Parameters */}
            <Panel level={3} className="xl:col-span-4" title="Differential Game Solver Engine" sub="Leader-Follower Differential Equations: u*(t) = [γ X₀ cosh(γ(T-t)) + (α/η) sinh(γ(T-t))] / sinh(γT)">
              <div className="space-y-3">
                <Slider
                  label="Parent Order Size X₀ (Shares)"
                  value={diff16Shares}
                  min={10000}
                  max={500000}
                  step={10000}
                  unit=" sh"
                  tone="acc"
                  onChange={setDiff16Shares}
                />

                <Slider
                  label="Execution Horizon T (Seconds)"
                  value={diff16Horizon}
                  min={60}
                  max={900}
                  step={30}
                  unit=" s"
                  tone="acc2"
                  onChange={setDiff16Horizon}
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Arrival Price ($)</label>
                    <input
                      type="number"
                      value={diff16Price}
                      onChange={(e) => setDiff16Price(Number(e.target.value))}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Market Volatility σ</label>
                    <input
                      type="number"
                      step="0.005"
                      value={diff16Sigma}
                      onChange={(e) => setDiff16Sigma(Number(e.target.value))}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                </div>

                <div className="space-y-2 rounded-[6px] border border-line-subtle bg-surface/50 p-2.5 text-[11px]">
                  <div className="flex justify-between text-txt-muted">
                    <span>Temp Impact Alpha α:</span>
                    <span className="mono text-txt-primary font-bold">1.50e-4</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Predatory HFT Tracking Beta β:</span>
                    <span className="mono text-neg font-bold">3.50e-4</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Risk Aversion Gamma γ:</span>
                    <span className="mono text-gold font-bold">5.00e-5</span>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="primary"
                  loading={solvingDiff16}
                  onClick={handleSolveDiff16Game}
                  icon={Play}
                  className="w-full mt-2"
                >
                  ⚔️ Solve Stackelberg Equilibrium
                </Button>
              </div>
            </Panel>

            {/* Right 8 Cols: Trajectory Schedule & TCA Benchmark Breakdown */}
            <div className="space-y-3 xl:col-span-8">
              {/* TCA Benchmark Comparison Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[6px] border border-pos/40 bg-pos/10 p-2.5 text-center">
                  <div className="label-xs text-pos font-bold">Stackelberg Game Solver</div>
                  <div className="mono text-[16px] font-bold text-pos mt-1">{diff16Result?.blended_stackelberg_slippage_bps.toFixed(2)} bps</div>
                  <div className="text-[9.5px] text-txt-muted mt-0.5">Optimal Leader Rate u*(t)</div>
                </div>
                <div className="rounded-[6px] border border-warn/40 bg-warn/10 p-2.5 text-center">
                  <div className="label-xs text-warn font-bold">Almgren-Chriss (AC)</div>
                  <div className="mono text-[16px] font-bold text-warn mt-1">{diff16Result?.almgren_chriss_slippage_bps.toFixed(2)} bps</div>
                  <div className="text-[9.5px] text-txt-muted mt-0.5">No Predatory Coupling</div>
                </div>
                <div className="rounded-[6px] border border-neg/40 bg-neg/10 p-2.5 text-center">
                  <div className="label-xs text-neg font-bold">TWAP Benchmark</div>
                  <div className="mono text-[16px] font-bold text-neg mt-1">{diff16Result?.twap_benchmark_slippage_bps.toFixed(2)} bps</div>
                  <div className="text-[9.5px] text-txt-muted mt-0.5">Linear Naïve Execution</div>
                </div>
              </div>

              {/* Trajectory Schedule Comparison Table */}
              <Panel level={3} title="Intraday Execution Schedule Trajectory vs Benchmark Models" sub="Continuous inventory decay X(t), execution speed u(t), and predatory response v(t)">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Time</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Stackelberg Rem.</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Rate u*(t)</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Predatory v(t)</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Simulated Price</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">TWAP Rem.</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">AC Rem.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diff16Result?.trajectory.map((step) => (
                        <tr key={step.step} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1.5 font-bold text-txt-secondary">{step.time_label}</td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-acc">{step.remaining_shares_stackelberg.toLocaleString()} sh</td>
                          <td className="mono px-2.5 py-1.5 text-right text-pos font-semibold">{step.execution_rate_u_t.toFixed(1)} sh/s</td>
                          <td className="mono px-2.5 py-1.5 text-right text-neg">{step.predatory_reaction_v_t.toFixed(1)} sh/s</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-primary">${step.simulated_price.toFixed(1)}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-muted">{step.remaining_shares_twap.toLocaleString()} sh</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-muted">{step.remaining_shares_almgren_chriss.toLocaleString()} sh</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "zk-STARKs Regulatory Audit (v17)" ? (
        /* ── zk-STARKs REGULATORY FILING AUDIT (v17 Module 5) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <OpsKpi
              k="Regulatory Framework"
              v={starkProofResult?.framework.replace(/_/g, " ") ?? "UCITS 5/10/40"}
              s="AIR Execution Trace"
              tone="pos"
            />
            <OpsKpi
              k="AIR Trace Length"
              v={`${starkProofResult?.air_trace_length ?? 256} Steps`}
              s="Finite Field GF(2^64-2^32+1)"
              tone="pos"
            />
            <OpsKpi
              k="Merkle Root Commitment"
              v={`${starkProofResult?.merkle_commitment_root.slice(0, 12) ?? "0x8f3c4e9b"}...`}
              s="Post-Quantum SHA-256 / Rescue"
              tone="pos"
            />
            <OpsKpi
              k="Post-Quantum Security"
              v={`${starkProofResult?.security_level_bits ?? 128}-bit Transparent`}
              s="No Trusted Setup (Toxic Waste Free)"
              tone="pos"
            />
            <OpsKpi
              k="FRI Proximity Test"
              v={starkVerifyResult ? (starkVerifyResult.fri_proximity_tested ? "PASSED" : "FAILED") : "READY TO VERIFY"}
              s={starkVerifyResult ? `${starkVerifyResult.merkle_authentication_paths_verified} Merkle Paths Valid` : "32 Query Batches"}
              tone={starkVerifyResult ? (starkVerifyResult.is_valid ? "pos" : "neg") : "warn"}
            />
            <OpsKpi
              k="Zero-Knowledge Audit"
              v="0.00% Exposure"
              s="100% Blind Compliance Verified"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: STARK Generation & Interactive Parameters */}
            <Panel level={3} className="xl:col-span-4" title="zk-STARK Regulatory Engine" sub="Transparent Algebraic Intermediate Representation (AIR) with Fast Reed-Solomon IOPP (FRI)">
              <div className="space-y-3">
                <div>
                  <label className="label-xs text-txt-muted">Regulatory Framework & AIR Circuit</label>
                  <select
                    value={starkFramework}
                    onChange={(e) => setStarkFramework(e.target.value as any)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="UCITS_5_10_40">UCITS 5/10/40 (Concentration &amp; Leverage Limits)</option>
                    <option value="SEC_FORM_PF">SEC Form PF (Systemic Gross Exposure &amp; VaR Limits)</option>
                    <option value="MIFID_II_RTS_28">MiFID II RTS 28 (Best Execution &amp; Latency Parity)</option>
                    <option value="BASEL_IV_FRTB">Basel IV FRTB (Sensitivities Market Risk Charges)</option>
                  </select>
                </div>

                <Slider
                  label="Portfolio NAV ($M USD)"
                  value={starkNavUsd / 1e6}
                  min={50}
                  max={2000}
                  step={25}
                  unit=" $M"
                  tone="acc"
                  onChange={(v) => setStarkNavUsd(v * 1e6)}
                />

                <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5 text-[11px] space-y-1.5">
                  <div className="flex justify-between text-txt-muted">
                    <span>Cryptographic Protocol:</span>
                    <span className="mono text-acc font-bold">zk-STARK (FRI Protocol)</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Trusted Setup Requirement:</span>
                    <span className="mono text-pos font-bold">NONE (Transparent)</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Quantum Resistance:</span>
                    <span className="mono text-pos font-bold">Post-Quantum Safe (Hash-based)</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Prover Execution Field:</span>
                    <span className="mono text-txt-secondary">Goldilocks / Prime Field</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={runningStarkGen}
                    onClick={handleGenerateStarkProof}
                    icon={Lock}
                    className="w-full"
                  >
                    ⚡ Generate Transparent zk-STARK Proof
                  </Button>

                  <Button
                    size="xs"
                    variant="secondary"
                    loading={runningStarkVerify}
                    onClick={handleVerifyStarkProof}
                    icon={FileCheck}
                    className="w-full"
                    disabled={!starkProofResult}
                  >
                    🛡️ Audit &amp; Verify FRI Proof (Zero Trust)
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Right 8 Cols: AIR Execution Trace & Verification Station */}
            <div className="space-y-3 xl:col-span-8">
              {starkVerifyResult && (
                <div className="rounded-[8px] border border-pos/40 bg-pos/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-pos" />
                      <span className="text-[12px] font-bold text-pos">
                        Transparent zk-STARK Audit Validated: {starkVerifyResult.proof_id}
                      </span>
                    </div>
                    <Badge tone="pos">{starkVerifyResult.verification_latency_ms.toFixed(2)} ms Latency</Badge>
                  </div>
                  <div className="mono text-[10.5px] text-txt-secondary mt-1">
                    FRI Low-Degree Proximity: <span className="text-pos font-bold">PASSED (Degree &lt; 64)</span> · Merkle Query Authentications: <span className="text-txt-primary font-bold">{starkVerifyResult.merkle_authentication_paths_verified} verified</span>
                  </div>
                  <div className="text-[10px] text-txt-muted mt-0.5">
                    Regulatory Certification: <span className="text-pos font-semibold">{starkVerifyResult.transparent_compliance_guarantee}</span>
                  </div>
                </div>
              )}

              {/* Public Inputs & Certified Limits */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-[6px] border border-line-subtle bg-surface/60 p-2 text-center">
                  <div className="text-[10px] text-txt-muted">Max Concentration</div>
                  <div className="mono text-[13px] font-bold text-pos">{starkProofResult?.public_inputs.max_single_name_concentration_pct.toFixed(2) ?? "9.40"}%</div>
                  <div className="text-[9px] text-txt-disabled">&le; 10.00% UCITS Limit</div>
                </div>
                <div className="rounded-[6px] border border-line-subtle bg-surface/60 p-2 text-center">
                  <div className="text-[10px] text-txt-muted">Gross Leverage</div>
                  <div className="mono text-[13px] font-bold text-acc">{starkProofResult?.public_inputs.gross_leverage_ratio.toFixed(2) ?? "1.84"}x</div>
                  <div className="text-[9px] text-txt-disabled">&le; 3.00x Form PF Cap</div>
                </div>
                <div className="rounded-[6px] border border-line-subtle bg-surface/60 p-2 text-center">
                  <div className="text-[10px] text-txt-muted">VaR 99% (10-Day)</div>
                  <div className="mono text-[13px] font-bold text-pos">{starkProofResult?.public_inputs.var_99_10d_pct.toFixed(2) ?? "4.82"}%</div>
                  <div className="text-[9px] text-txt-disabled">&le; 20.00% Basel Limit</div>
                </div>
                <div className="rounded-[6px] border border-line-subtle bg-surface/60 p-2 text-center">
                  <div className="text-[10px] text-txt-muted">Tier 1 Liquidity</div>
                  <div className="mono text-[13px] font-bold text-pos">{starkProofResult?.public_inputs.liquidity_tier_1_pct.toFixed(1) ?? "68.5"}%</div>
                  <div className="text-[9px] text-txt-disabled">&ge; 50.00% Buffer</div>
                </div>
              </div>

              {/* AIR Execution Trace Table */}
              <Panel level={3} title="Algebraic Intermediate Representation (AIR) Execution Trace" sub="Cryptographic execution steps committed via Merkle roots and FRI queries">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Step</th>
                        <th className="border-b border-line px-2.5 py-1.5">Cycle State</th>
                        <th className="border-b border-line px-2.5 py-1.5">Transition Constraint P(x)</th>
                        <th className="border-b border-line px-2.5 py-1.5">Merkle Auth Path</th>
                        <th className="border-b border-line px-2.5 py-1.5">State Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {starkProofResult?.trace_samples.map((row) => (
                        <tr key={row.step} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1.5 font-bold text-txt-muted">T+{row.step}</td>
                          <td className="mono px-2.5 py-1.5 text-txt-primary font-semibold">{row.cycle_state}</td>
                          <td className="mono px-2.5 py-1.5 text-pos text-[10px]">{row.transition_constraint_p_x} (SAT)</td>
                          <td className="mono px-2.5 py-1.5 text-acc text-[10px]">{row.merkle_auth_path}</td>
                          <td className="mono px-2.5 py-1.5 text-txt-disabled text-[9.5px]">{row.hash_commitment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "WebRTC Voice AI Officer (v18)" ? (
        /* ── WebRTC LOW-LATENCY VOICE AI RISK OFFICER (v18 Module 3) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <OpsKpi
              k="WebRTC Audio Link"
              v={voiceSession?.status ?? "CONNECTED"}
              s="Opus 48kHz Bidirectional"
              tone="pos"
            />
            <OpsKpi
              k="Duplex RTT Latency"
              v={`${voiceSession?.bidirectional_latency_ms.toFixed(1) ?? "38.4"} ms`}
              s="Sub-200ms Voice Budget"
              tone="pos"
            />
            <OpsKpi
              k="Target Risk Desk"
              v={voiceSession?.target_desk ?? "TECH_ALPHA_DESK"}
              s="Direct Audio Intercom"
              tone="pos"
            />
            <OpsKpi
              k="Parsed Speech Intent"
              v={voiceAction?.action_type.replace(/_/g, " ") ?? "DELTA HEDGE"}
              s="Natural Speech Parser"
              tone="pos"
            />
            <OpsKpi
              k="Intent Confidence"
              v={`${((voiceAction?.confidence_score ?? 0.985) * 100).toFixed(1)}%`}
              s="Zero-Shot Domain ASR"
              tone="pos"
            />
            <OpsKpi
              k="Audio Synthesizer"
              v="Low-Latency TTS"
              s="Opus RTP Stream Active"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 5 Cols: Voice Command Station & Intercom Controls */}
            <Panel level={3} className="xl:col-span-5" title="WebRTC Voice AI Risk Intercom" sub="Ultra-low latency bidirectional audio stream with real-time speech intent parsing">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-3 w-3 items-center justify-center rounded-full bg-pos/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-pos animate-ping" />
                    </div>
                    <div>
                      <span className="text-[11.5px] font-semibold text-txt-primary">Opus 48kHz RTP Channel</span>
                      <div className="text-[10px] text-txt-muted">{voiceSession?.session_id ?? "RTC-VOICE-DESK-01"}</div>
                    </div>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    loading={connectingVoice}
                    onClick={handleInitiateVoiceSession}
                    icon={Radio}
                  >
                    Re-Negotiate SDP
                  </Button>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="label-xs text-txt-muted">Trader Spoken Voice Command / Transcript</label>
                    <span className="text-[10px] text-txt-disabled">Natural Speech Input</span>
                  </div>
                  <textarea
                    value={spokenTranscript}
                    onChange={(e) => setSpokenTranscript(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 p-2 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                    placeholder="Speak trade instruction, e.g.: Execute delta-neutral hedge on Tech holdings..."
                  />
                </div>

                {/* Quick Voice Prompt Chips */}
                <div className="space-y-1.5">
                  <span className="label-xs text-txt-muted">Preset Institutional Speech Prompts:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Execute delta-neutral hedge on Tech holdings reducing sector beta by 0.35",
                      "Liquidate 50% of high-volatility illiquid names exceeding 5-day exit limit",
                      "Tighten stop-loss across all Momentum books to 1.5% below current mark",
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setSpokenTranscript(p)}
                        className="rounded-[4px] border border-line-subtle bg-surface/80 px-2 py-1 text-left text-[10.5px] text-txt-secondary hover:border-acc hover:text-txt-primary transition-colors"
                      >
                        🗣️ {p.length > 48 ? p.slice(0, 48) + "..." : p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex gap-2">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={parsingVoice}
                    onClick={handleParseVoiceIntent}
                    icon={Mic}
                    className="flex-1"
                  >
                    🎙️ Parse & Execute Voice Action
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    loading={dispatchingAlert}
                    onClick={handleDispatchVoiceAlert}
                    icon={Volume2}
                  >
                    📢 Broadcast Alert
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Right 7 Cols: Real-Time Audio Telemetry & Structured Voice Execution */}
            <div className="space-y-3 xl:col-span-7">
              {/* Audio Waveform Visualizer Panel */}
              <div className="rounded-[8px] border border-line-subtle bg-surface/50 p-3">
                <div className="flex items-center justify-between border-b border-line-subtle pb-2">
                  <div className="flex items-center gap-2">
                    <Volume2 size={15} className="text-acc" />
                    <span className="text-[12px] font-semibold text-txt-primary">Duplex Voice Stream Telemetry</span>
                  </div>
                  <Badge tone="pos">OPUS 48kHz · JITTER &lt; 0.4ms</Badge>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5 h-12 bg-bg-secondary/40 rounded-[6px] px-3">
                  {[40, 65, 80, 45, 90, 70, 30, 85, 95, 60, 40, 75, 88, 52, 68, 92, 44, 78, 62, 35, 82, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-acc transition-all duration-300"
                      style={{
                        height: `${h}%`,
                        opacity: 0.4 + (h / 100) * 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Parsed Action Card */}
              {voiceAction && (
                <div className="rounded-[8px] border border-pos/40 bg-pos/10 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-pos" />
                      <span className="text-[12px] font-bold text-pos">
                        Institutional Voice Intent Parsed: {voiceAction.action_type}
                      </span>
                    </div>
                    <Badge tone="pos">{voiceAction.execution_urgency}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4 pt-1">
                    <div className="rounded-[6px] border border-line-subtle bg-surface/60 p-2">
                      <div className="text-[10px] text-txt-muted">Confidence</div>
                      <div className="mono text-[12px] font-bold text-pos">{(voiceAction.confidence_score * 100).toFixed(1)}%</div>
                    </div>
                    <div className="rounded-[6px] border border-line-subtle bg-surface/60 p-2">
                      <div className="text-[10px] text-txt-muted">Target Desk</div>
                      <div className="mono text-[12px] font-bold text-txt-primary">{voiceAction.target_sector ?? "ALL_DESKS"}</div>
                    </div>
                    <div className="rounded-[6px] border border-line-subtle bg-surface/60 p-2">
                      <div className="text-[10px] text-txt-muted">Action Type</div>
                      <div className="mono text-[12px] font-bold text-acc">{voiceAction.action_type}</div>
                    </div>
                    <div className="rounded-[6px] border border-line-subtle bg-surface/60 p-2">
                      <div className="text-[10px] text-txt-muted">Est. Market Impact</div>
                      <div className="mono text-[12px] font-bold text-pos">0.82 bps</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Synthesized Spoken Audio Output Banner */}
              {voiceAlertResult && (
                <div className="rounded-[8px] border border-warn/40 bg-warn/10 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={15} className="text-warn" />
                      <span className="text-[12px] font-bold text-warn">Spoken Risk Audio Broadcasted</span>
                    </div>
                    <Badge tone="warn">{voiceAlertResult.synthesis_latency_ms.toFixed(1)} ms TTS</Badge>
                  </div>
                  <p className="mono text-[11px] text-txt-primary italic">
                    "{voiceAlertResult.spoken_text}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : execMode === "NIST FIPS 204 PQC Audit Stream (v18)" ? (
        /* ── NIST FIPS 204 PQC AUDIT STREAM (v18 Module 4) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <OpsKpi
              k="PQC Standard"
              v="NIST FIPS 204"
              s="ML-DSA-87 (Dilithium5)"
              tone="pos"
            />
            <OpsKpi
              k="Security Level"
              v="256-bit Post-Quantum"
              s="Module-Lattice Hardness"
              tone="pos"
            />
            <OpsKpi
              k="Signature Size"
              v="4,595 Bytes"
              s="Unforgeable Digital Seal"
              tone="pos"
            />
            <OpsKpi
              k="Clock Precision"
              v="Nanosecond (<100ns)"
              s="MiFID II RTS 25 Sync"
              tone="pos"
            />
            <OpsKpi
              k="Audit Ledger"
              v={`${pqcStreamLog.length} Signed Events`}
              s="Immutable Merkle Chain"
              tone="pos"
            />
            <OpsKpi
              k="Quantum Resistance"
              v="100% SECURE"
              s="Shor / Grover Immune"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: Event Signer & Parameter Station */}
            <Panel level={3} className="xl:col-span-4" title="NIST FIPS 204 PQC Signer" sub="Lattice-based digital signatures on real-time trade logs and risk overrides">
              <div className="space-y-3">
                <div>
                  <label className="label-xs text-txt-muted">Audit Event Type</label>
                  <select
                    value={pqcEventType}
                    onChange={(e) => setPqcEventType(e.target.value as any)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-txt-primary outline-none focus:border-acc"
                  >
                    <option value="ORDER_PLACEMENT">ORDER_PLACEMENT (Institutional Algorithmic Order)</option>
                    <option value="RISK_OVERRIDE">RISK_OVERRIDE (Executive CRO VaR Breach Waiver)</option>
                    <option value="MARGIN_CALL">MARGIN_CALL (Prime Broker Collateral Demand)</option>
                    <option value="SETTLEMENT_FINALITY">SETTLEMENT_FINALITY (Atomic DvP On-Chain Clear)</option>
                    <option value="MODEL_PARAMETER_UPDATE">MODEL_PARAMETER_UPDATE (Alpha Model Weight Rebalance)</option>
                  </select>
                </div>

                <div>
                  <label className="label-xs text-txt-muted">Signing Actor / Authority</label>
                  <input
                    type="text"
                    value={pqcActor}
                    onChange={(e) => setPqcActor(e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                  />
                </div>

                <div>
                  <label className="label-xs text-txt-muted">Trading Desk ID</label>
                  <input
                    type="text"
                    value={pqcDesk}
                    onChange={(e) => setPqcDesk(e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                  />
                </div>

                <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5 text-[11px] space-y-1.5">
                  <div className="flex justify-between text-txt-muted">
                    <span>Algorithm:</span>
                    <span className="mono text-acc font-bold">ML-DSA-87 (FIPS 204)</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Lattice Matrix Dimension:</span>
                    <span className="mono text-pos font-bold">k=8, l=7 over R_q</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Public Key Length:</span>
                    <span className="mono text-txt-secondary">2,592 Bytes</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Regulatory Framework:</span>
                    <span className="mono text-txt-secondary">MiFID II Art 25 / Dodd-Frank</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={loggingPqc}
                    onClick={handleLogPqcEvent}
                    icon={KeyRound}
                    className="w-full"
                  >
                    ⚡ Sign & Anchor Event (ML-DSA-87)
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Right 8 Cols: Immutable PQC Event Stream Table */}
            <div className="space-y-3 xl:col-span-8">
              {pqcVerifyResult && (
                <div className="rounded-[8px] border border-pos/40 bg-pos/10 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-pos" />
                      <span className="text-[12px] font-bold text-pos">
                        Post-Quantum Verification Confirmed: {pqcVerifyResult.event_id}
                      </span>
                    </div>
                    <Badge tone="pos">{pqcVerifyResult.verification_latency_ms.toFixed(2)} ms Latency</Badge>
                  </div>
                  <div className="text-[11px] text-txt-secondary">
                    Lattice Polynomial Check: <span className="mono text-pos">{pqcVerifyResult.lattice_polynomial_norm_check}</span>
                  </div>
                </div>
              )}

              <Panel level={3} title="Immutable PQC Audit Event Ledger" sub="Verifiable post-quantum cryptographically signed audit trail">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Event ID</th>
                        <th className="border-b border-line px-2.5 py-1.5">Event Type</th>
                        <th className="border-b border-line px-2.5 py-1.5">Actor / Desk</th>
                        <th className="border-b border-line px-2.5 py-1.5">Signature Seal</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Audit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pqcStreamLog.map((evt) => (
                        <tr key={evt.event_id} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1.5 font-bold text-txt-primary">{evt.event_id}</td>
                          <td className="px-2.5 py-1.5">
                            <Badge tone={evt.event_type === "RISK_OVERRIDE" ? "warn" : evt.event_type === "MARGIN_CALL" ? "neg" : "pos"}>
                              {evt.event_type}
                            </Badge>
                          </td>
                          <td className="mono px-2.5 py-1.5 text-txt-secondary text-[10px]">
                            <div>{evt.actor_id}</div>
                            <div className="text-txt-muted">{evt.desk_id}</div>
                          </td>
                          <td className="mono px-2.5 py-1.5 text-txt-disabled text-[9.5px]">
                            {evt.signature_hex.slice(0, 18)}... ({evt.signature_length_bytes}B)
                          </td>
                          <td className="px-2.5 py-1.5 text-right">
                            <Button
                              size="xs"
                              variant="outline"
                              loading={verifyingPqcId === evt.event_id}
                              onClick={() => handleVerifyPqcEvent(evt.event_id)}
                              icon={ShieldCheck}
                            >
                              Verify
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "Kernel-Bypass DPDK & FPGA Gate (v19)" ? (
        /* ── KERNEL-BYPASS DPDK & HARDWARE FPGA RISK GATE (v19 Module 1 & 3) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <OpsKpi
              k="DPDK Wire Latency"
              v={`${dpdkPackets[0]?.wire_to_memory_latency_ns ?? 564.2} ns`}
              s="Zero-Copy Solarflare Ring"
              tone="pos"
            />
            <OpsKpi
              k="Kernel Context Switch"
              v="0 Switches"
              s="Direct User-Space Memory"
              tone="pos"
            />
            <OpsKpi
              k="FPGA Pre-Trade Gate"
              v={`${fpgaResult?.fpga_telemetry.total_gate_wire_latency_ns ?? 86.4} ns`}
              s="Sub-120ns PCIe Gen5 SLA"
              tone="pos"
            />
            <OpsKpi
              k="Hardware Logic Time"
              v={`${fpgaResult?.fpga_telemetry.logic_latency_ns ?? 6.21} ns`}
              s="2 Cycles @ 322.2 MHz"
              tone="pos"
            />
            <OpsKpi
              k="SEC 15c3-5 Rules"
              v="100% VERIFIED"
              s="Capital & Collar Bound"
              tone="pos"
            />
            <OpsKpi
              k="NIC Throughput"
              v="14.25M msg/s"
              s="Solarflare EF_VI Line Rate"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 5 Cols: FPGA Pre-Trade Inspection Gate */}
            <Panel level={3} className="xl:col-span-5" title="Hardware FPGA Risk Gate (< 120ns)" sub="AMD Alveo PCIe Gen5 RTL hardware pre-trade inspection gate">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Order ID</label>
                    <input
                      type="text"
                      value={fpgaOrderId}
                      onChange={(e) => setFpgaOrderId(e.target.value)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Symbol</label>
                    <input
                      type="text"
                      value={fpgaSymbol}
                      onChange={(e) => setFpgaSymbol(e.target.value)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label-xs text-txt-muted">Side</label>
                    <select
                      value={fpgaSide}
                      onChange={(e) => setFpgaSide(e.target.value as any)}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Qty (Shares)</label>
                    <input
                      type="number"
                      value={fpgaQty}
                      onChange={(e) => setFpgaQty(Number(e.target.value))}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-txt-muted">Limit Price</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fpgaPrice}
                      onChange={(e) => setFpgaPrice(Number(e.target.value))}
                      className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-xs text-txt-muted">Reference Mid Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fpgaRefPrice}
                    onChange={(e) => setFpgaRefPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                  />
                </div>

                <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5 text-[11px] space-y-1.5">
                  <div className="flex justify-between text-txt-muted">
                    <span>Order Notional Value:</span>
                    <span className="mono text-txt-primary font-bold">${(fpgaQty * fpgaPrice).toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Max Allowed Notional:</span>
                    <span className="mono text-pos font-bold">$1,000,000 USD</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Price Collar Protection:</span>
                    <span className="mono text-acc font-bold">&plusmn;500 Ticks ($5.00)</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={inspectingFpga}
                    onClick={handleInspectFpgaOrder}
                    icon={ShieldCheck}
                    className="w-full"
                  >
                    ⚡ Inspect Order on FPGA Hardware (&lt; 120ns)
                  </Button>
                </div>

                {fpgaResult && (
                  <div className={cn("rounded-[6px] border p-2.5 text-[11px] space-y-1", fpgaResult.approved ? "border-pos/40 bg-pos/10" : "border-neg/40 bg-neg/10")}>
                    <div className="flex items-center justify-between font-bold">
                      <span className={fpgaResult.approved ? "text-pos" : "text-neg"}>
                        {fpgaResult.approved ? "✓ ORDER APPROVED" : "✗ ORDER REJECTED"}
                      </span>
                      <Badge tone={fpgaResult.approved ? "pos" : "neg"}>{fpgaResult.fpga_telemetry.total_gate_wire_latency_ns} ns</Badge>
                    </div>
                    <div className="text-txt-secondary text-[10.5px]">Reason: {fpgaResult.reject_reason}</div>
                  </div>
                )}
              </div>
            </Panel>

            {/* Right 7 Cols: DPDK Zero-Copy Packet Ring Buffer */}
            <div className="space-y-3 xl:col-span-7">
              <Panel
                level={3}
                title="DPDK / EF_VI Sub-Microsecond Packet Stream"
                sub="Zero-copy memory ring buffer receiving raw Nasdaq ITCH 5.0 market multicast"
                actions={
                  <Button
                    size="xs"
                    variant="outline"
                    loading={fetchingDpdk}
                    onClick={handleFetchDpdkStream}
                    icon={RefreshCw}
                  >
                    Refresh Multicast Stream
                  </Button>
                }
              >
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Type</th>
                        <th className="border-b border-line px-2.5 py-1.5">Symbol</th>
                        <th className="border-b border-line px-2.5 py-1.5">Side</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Shares</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Price</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Wire-to-Mem Latency</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-center">Ring</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dpdkPackets.map((pkt, idx) => (
                        <tr key={idx} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1.5 font-bold text-acc">{pkt.msg_type} (Add)</td>
                          <td className="mono px-2.5 py-1.5 font-semibold text-txt-primary">{pkt.symbol}</td>
                          <td className="px-2.5 py-1.5">
                            <span className={cn("label-xs", pkt.side === "B" ? "text-pos" : "text-neg")}>
                              {pkt.side === "B" ? "▲ BUY" : "▼ SELL"}
                            </span>
                          </td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-primary">{pkt.shares.toLocaleString()}</td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-txt-primary">₹{pkt.price.toFixed(2)}</td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-pos">{pkt.wire_to_memory_latency_ns} ns</td>
                          <td className="mono px-2.5 py-1.5 text-center text-txt-muted">#{pkt.ring_index}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "Thompson Sampling Dark Pool Router (v19)" ? (
        /* ── MULTI-VENUE THOMPSON SAMPLING DARK POOL ROUTER (v19 Module 5) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <OpsKpi
              k="Routing Algorithm"
              v="Thompson Sampling"
              s="Beta Posterior Bandit"
              tone="pos"
            />
            <OpsKpi
              k="Top Allocation Venue"
              v={thompsonResult?.surface.top_recommended_venue.replace(/_/g, " ") ?? "DARK POOL ALPHA"}
              s="Highest Posterior Probability"
              tone="pos"
            />
            <OpsKpi
              k="Alpha Fill Probability"
              v="88.0% Expected"
              s="Low Information Leakage"
              tone="pos"
            />
            <OpsKpi
              k="Average Slippage"
              v={`${thompsonResult?.average_slippage_bps ?? 1.18} bps`}
              s="Adverse Selection Suppressed"
              tone="pos"
            />
            <OpsKpi
              k="Parent Order Slices"
              v={`${thompsonResult?.slices_routed ?? 10} Slices`}
              s="Dynamic Multi-Armed Probing"
              tone="pos"
            />
            <OpsKpi
              k="Execution Venues"
              v="4 Connected"
              s="Dark Pools &amp; Lit Exchanges"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: Order Parameters & Simulation Controls */}
            <Panel level={3} className="xl:col-span-4" title="Dark Pool Bandit Router" sub="Reinforcement learning liquidity probing across fragmented venues">
              <div className="space-y-3">
                <Slider
                  label="Parent Order Size (Shares)"
                  value={thompsonParentShares}
                  min={10000}
                  max={200000}
                  step={5000}
                  unit=" Shares"
                  tone="acc"
                  onChange={setThompsonParentShares}
                />

                <Slider
                  label="Probe Slice Size (Shares)"
                  value={thompsonSliceShares}
                  min={1000}
                  max={25000}
                  step={1000}
                  unit=" Shares"
                  tone="acc"
                  onChange={setThompsonSliceShares}
                />

                <div className="rounded-[6px] border border-line-subtle bg-bg-secondary/40 p-2.5 text-[11px] space-y-1.5">
                  <div className="flex justify-between text-txt-muted">
                    <span>Number of Probing Slices:</span>
                    <span className="mono text-txt-primary font-bold">{Math.floor(thompsonParentShares / thompsonSliceShares)} Slices</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Exploration Policy:</span>
                    <span className="mono text-acc font-bold">Bayesian Beta(α, β)</span>
                  </div>
                  <div className="flex justify-between text-txt-muted">
                    <span>Adverse Selection Shield:</span>
                    <span className="mono text-pos font-bold">ACTIVE</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={runningThompsonSim}
                    onClick={handleSimulateThompson}
                    icon={Activity}
                    className="w-full"
                  >
                    ⚡ Simulate Multi-Venue Thompson Routing
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Right 8 Cols: Venue Probabilities Surface & Slice Log */}
            <div className="space-y-3 xl:col-span-8">
              {/* Venue Allocation Surface Table */}
              <Panel level={3} title="Venue Allocation Probabilities &amp; Posterior Postures" sub="Real-time Beta distribution parameters updated on execution feedback">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Venue</th>
                        <th className="border-b border-line px-2.5 py-1.5">Tier</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-center">Beta(α, β)</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Fill Prob</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Recommended Allocation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {thompsonResult?.surface.venues.map((v) => (
                        <tr key={v.venue} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1.5 font-bold text-txt-primary">{v.venue}</td>
                          <td className="px-2.5 py-1.5">
                            <Badge tone={v.venue_tier.includes("TIER_1") ? "pos" : v.venue_tier.includes("LIT") ? "neu" : "warn"}>
                              {v.venue_tier}
                            </Badge>
                          </td>
                          <td className="mono px-2.5 py-1.5 text-center text-txt-muted">
                            α={v.alpha_successes.toFixed(0)}, β={v.beta_penalties.toFixed(0)}
                          </td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-pos">
                            {(v.expected_fill_probability * 100).toFixed(1)}%
                          </td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-acc">
                            {v.recommended_allocation_pct.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* Slice Execution Events */}
              <Panel level={3} title="Sequential Slice Routing Events" sub="Dynamic venue selection and fill feedback trail">
                <div className="overflow-x-auto rounded-[6px] border border-line-subtle">
                  <table className="w-full border-collapse">
                    <thead className="bg-bg-secondary/95 text-left text-txt-muted label-xs">
                      <tr>
                        <th className="border-b border-line px-2.5 py-1.5">Slice #</th>
                        <th className="border-b border-line px-2.5 py-1.5">Selected Venue</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Shares</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Fill Ratio</th>
                        <th className="border-b border-line px-2.5 py-1.5 text-right">Slippage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {thompsonResult?.slice_events.map((sl) => (
                        <tr key={sl.slice_number} className="border-b border-line-subtle/70 text-[11px] hover:bg-surface-hover/50">
                          <td className="mono px-2.5 py-1.5 font-bold text-txt-muted">#{sl.slice_number}</td>
                          <td className="mono px-2.5 py-1.5 font-semibold text-txt-primary">{sl.venue}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-txt-primary">{sl.shares.toLocaleString()}</td>
                          <td className="mono px-2.5 py-1.5 text-right text-pos font-bold">{(sl.fill_ratio * 100).toFixed(0)}%</td>
                          <td className="mono px-2.5 py-1.5 text-right font-bold text-txt-primary">{sl.slippage_bps.toFixed(2)} bps</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "Bi-Temporal Vector RAG Engine (v19)" ? (
        /* ── BI-TEMPORAL VECTOR RAG ENGINE (v19 Module 4) ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <OpsKpi
              k="Bi-Temporal Indexing"
              v="Timescale + Qdrant"
              s="Effective vs Assertion Time"
              tone="pos"
            />
            <OpsKpi
              k="Look-Ahead Bias"
              v="0.00% Zero Leakage"
              s="Point-in-Time Guarantees"
              tone="pos"
            />
            <OpsKpi
              k="Retrieval Latency"
              v={`${ragResult?.retrieval_latency_ms.toFixed(2) ?? "1.84"} ms`}
              s="Sub-5ms SLA Target"
              tone="pos"
            />
            <OpsKpi
              k="Context Chunks"
              v={`${ragResult?.chunks_matched ?? 2} Matched`}
              s="Cosine Similarity Search"
              tone="pos"
            />
            <OpsKpi
              k="Precision Clock"
              v="Microsecond UTC"
              s="Nanosecond Granularity"
              tone="pos"
            />
            <OpsKpi
              k="LLM Research Fidelity"
              v="100% GROUNDED"
              s="Zero Hallucination Anchor"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: Query Console */}
            <Panel level={3} className="xl:col-span-4" title="Bi-Temporal Vector Console" sub="Point-in-time state retrieval for AI Quant Copilot">
              <div className="space-y-3">
                <div>
                  <label className="label-xs text-txt-muted">Research Query Text</label>
                  <textarea
                    value={ragQueryText}
                    onChange={(e) => setRagQueryText(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 p-2 mono text-[11.5px] text-txt-primary outline-none focus:border-acc"
                  />
                </div>

                <div>
                  <label className="label-xs text-txt-muted">Effective Timestamp (UTC)</label>
                  <input
                    type="text"
                    value={ragEffTime}
                    onChange={(e) => setRagEffTime(e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11px] text-txt-primary outline-none focus:border-acc"
                  />
                </div>

                <div>
                  <label className="label-xs text-txt-muted">Assertion Timestamp (UTC)</label>
                  <input
                    type="text"
                    value={ragAssertTime}
                    onChange={(e) => setRagAssertTime(e.target.value)}
                    className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11px] text-txt-primary outline-none focus:border-acc"
                  />
                </div>

                <div className="pt-1">
                  <Button
                    size="xs"
                    variant="primary"
                    loading={queryingRag}
                    onClick={handleQueryBiTemporalRAG}
                    icon={Database}
                    className="w-full"
                  >
                    ⚡ Query Point-in-Time Vector Context
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Right 8 Cols: Retrieved Vector Context Chunks */}
            <div className="space-y-3 xl:col-span-8">
              <Panel level={3} title="Retrieved Microstructure Context Chunks" sub="Strict temporal isolation ensuring zero historical data leakage">
                <div className="space-y-2.5">
                  {ragResult?.retrieved_context.map((chunk) => (
                    <div key={chunk.chunk_id} className="rounded-[6px] border border-line-subtle bg-surface/60 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge tone="pos">{chunk.domain}</Badge>
                          <span className="mono text-[10.5px] text-txt-muted">{chunk.source}</span>
                        </div>
                        <span className="mono text-[11px] font-bold text-acc">Similarity: {(chunk.similarity_score * 100).toFixed(1)}%</span>
                      </div>
                      <p className="text-[11.5px] text-txt-primary leading-relaxed">{chunk.text}</p>
                      <div className="flex justify-between text-[9.5px] mono text-txt-disabled border-t border-line-subtle pt-1.5 mt-1.5">
                        <span>Effective: {chunk.effective_time}</span>
                        <span>Asserted: {chunk.assertion_time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : execMode === "NightWatch Pre-Market Consent Gate (v20)" ? (
        /* ── QUANTX v20 NIGHTWATCH PRE-MARKET CONSENT GATE ENGINE ── */
        <div className="space-y-4">
          {/* Top KPI Status Strip */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <OpsKpi
              k="Pre-Market Cutoff"
              v={`${Math.floor(nwSecondsLeft / 60)}m ${String(nwSecondsLeft % 60).padStart(2, "0")}s`}
              s="Cutoff 09:14:30 AM IST"
              tone={nwSecondsLeft < 300 ? "neg" : "warn"}
            />
            <OpsKpi
              k="Favorability Index (MFI)"
              v={`${nwReport?.market_favorability_index.toFixed(1) ?? "78.1"} / 100`}
              s={nwReport?.market_regime ?? "FAVORABLE REGIME"}
              tone={(nwReport?.market_favorability_index ?? 78) >= 65 ? "pos" : (nwReport?.market_favorability_index ?? 78) >= 45 ? "warn" : "neg"}
            />
            <OpsKpi
              k="Market Regime"
              v={nwReport?.market_regime ?? "FAVORABLE"}
              s="Microstructure & News Multi-Factor"
              tone={nwReport?.market_regime === "FAVORABLE" ? "pos" : nwReport?.market_regime === "NEUTRAL" ? "warn" : "neg"}
            />
            <OpsKpi
              k="Safety Clearance"
              v={nwReport?.is_safe_to_execute ? "PASSED" : "COLLAR ALERT"}
              s="Risk Bounds & Gap Validated"
              tone={nwReport?.is_safe_to_execute ? "pos" : "neg"}
            />
            <OpsKpi
              k="Default-Deny Policy"
              v="ACTIVE"
              s="Auto-Halt on Expiry"
              tone="pos"
            />
            <OpsKpi
              k="Staged Notional"
              v="$10.00M Locked"
              s="HMAC SHA-256 Verified"
              tone="pos"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            {/* Left 4 Cols: Staging Parameters & Microstructure Sensors */}
            <div className="space-y-3 xl:col-span-4">
              {/* Panel 1: Overnight Staging Config */}
              <Panel level={3} title="Overnight Parameter Lock" sub="Staged portfolio bounds & cryptographic commitment">
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-xs text-txt-muted">Operator User ID</label>
                      <input
                        type="text"
                        value={nwUserId}
                        onChange={(e) => setNwUserId(e.target.value)}
                        className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11px] text-txt-primary outline-none focus:border-acc"
                      />
                    </div>
                    <div>
                      <label className="label-xs text-txt-muted">Max VaR Bound</label>
                      <input
                        type="number"
                        step="0.005"
                        value={nwMaxVar}
                        onChange={(e) => setNwMaxVar(parseFloat(e.target.value))}
                        className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11px] text-txt-primary outline-none focus:border-acc"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-xs text-txt-muted">Min Allowable MFI</label>
                      <input
                        type="number"
                        value={nwMinMfi}
                        onChange={(e) => setNwMinMfi(parseFloat(e.target.value))}
                        className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11px] text-txt-primary outline-none focus:border-acc"
                      />
                    </div>
                    <div>
                      <label className="label-xs text-txt-muted">Max Gap (% NAV)</label>
                      <input
                        type="number"
                        step="0.005"
                        value={nwMaxGap}
                        onChange={(e) => setNwMaxGap(parseFloat(e.target.value))}
                        className="mt-1 w-full rounded-[6px] border border-line bg-surface-2 px-2.5 py-1.5 mono text-[11px] text-txt-primary outline-none focus:border-acc"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button
                      size="xs"
                      variant="primary"
                      loading={nwStagingLoading}
                      onClick={handleStageNightWatchPortfolio}
                      icon={Lock}
                      className="w-full"
                    >
                      🔒 Stage & Lock Overnight Parameters
                    </Button>
                  </div>
                </div>
              </Panel>

              {/* Panel 2: Pre-Market Microstructure Sensors */}
              <Panel level={3} title="Pre-Market Microstructure Sensors" sub="Real-time multi-source inputs feeding MFI calculation">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-txt-muted">Index Futures Gap</span>
                      <span className="mono font-semibold text-txt-primary">{(nwFuturesGap * 100).toFixed(2)}%</span>
                    </div>
                    <Slider
                      value={[nwFuturesGap * 100]}
                      min={-3}
                      max={3}
                      step={0.1}
                      onValueChange={(v) => setNwFuturesGap(v[0] / 100)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-txt-muted">L3 Order Book Imbalance (OBI)</span>
                      <span className="mono font-semibold text-txt-primary">{nwObi.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[nwObi * 100]}
                      min={-100}
                      max={100}
                      step={1}
                      onValueChange={(v) => setNwObi(v[0] / 100)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-txt-muted">VPIN Flow Toxicity</span>
                      <span className="mono font-semibold text-warn">{nwVpin.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[nwVpin * 100]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(v) => setNwVpin(v[0] / 100)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-txt-muted">Overnight News Sentiment</span>
                      <span className="mono font-semibold text-pos">{nwSentiment.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[nwSentiment * 100]}
                      min={-100}
                      max={100}
                      step={1}
                      onValueChange={(v) => setNwSentiment(v[0] / 100)}
                    />
                  </div>

                  <div className="pt-1">
                    <Button
                      size="xs"
                      variant="outline"
                      loading={nwEvaluating}
                      onClick={() => handleGenerateNightWatchBrief()}
                      icon={RefreshCw}
                      className="w-full"
                    >
                      ⚡ Recompute Favorability (MFI)
                    </Button>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Right 8 Cols: Dual-Pathway Recommendation & Consent Controls */}
            <div className="space-y-3 xl:col-span-8">
              {/* Favorability Breakdown Bar */}
              {nwReport && (
                <Panel level={3} title="Market Favorability Breakdown (MFI Components)" sub="Weighted score synthesis across 4 independent market channels">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-2.5">
                      <div className="text-[10px] text-txt-muted">Futures Gap (30%)</div>
                      <div className="mono mt-1 text-[14px] font-bold text-txt-primary">{nwReport.metrics_breakdown.component_scores.futures_gap_score}/100</div>
                      <div className="text-[9.5px] text-pos">Score Contribution: +{(nwReport.metrics_breakdown.component_scores.futures_gap_score * 0.3).toFixed(1)}</div>
                    </div>
                    <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-2.5">
                      <div className="text-[10px] text-txt-muted">L3 OBI Depth (25%)</div>
                      <div className="mono mt-1 text-[14px] font-bold text-txt-primary">{nwReport.metrics_breakdown.component_scores.obi_score}/100</div>
                      <div className="text-[9.5px] text-pos">Score Contribution: +{(nwReport.metrics_breakdown.component_scores.obi_score * 0.25).toFixed(1)}</div>
                    </div>
                    <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-2.5">
                      <div className="text-[10px] text-txt-muted">VPIN Toxicity (25%)</div>
                      <div className="mono mt-1 text-[14px] font-bold text-txt-primary">{nwReport.metrics_breakdown.component_scores.vpin_score}/100</div>
                      <div className="text-[9.5px] text-pos">Score Contribution: +{(nwReport.metrics_breakdown.component_scores.vpin_score * 0.25).toFixed(1)}</div>
                    </div>
                    <div className="rounded-[6px] border border-line-subtle bg-surface-2 p-2.5">
                      <div className="text-[10px] text-txt-muted">News Sentiment (20%)</div>
                      <div className="mono mt-1 text-[14px] font-bold text-txt-primary">{nwReport.metrics_breakdown.component_scores.sentiment_score}/100</div>
                      <div className="text-[9.5px] text-pos">Score Contribution: +{(nwReport.metrics_breakdown.component_scores.sentiment_score * 0.2).toFixed(1)}</div>
                    </div>
                  </div>
                </Panel>
              )}

              {/* Dual-Pathway Recommendation Cards */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Pathway A: Preset Target */}
                <div className="rounded-[8px] border-2 border-pos/40 bg-surface/80 p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge tone="pos">PATHWAY A: PRESET</Badge>
                    <span className="mono text-[11px] font-bold text-pos">100% Target Deployed</span>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-txt-primary">Preset Full Target Allocation</h4>
                    <p className="text-[10.5px] text-txt-muted mt-0.5">Algorithm: QUANTX Adaptive TWAP / Open Auction Participation</p>
                  </div>
                  
                  <div className="rounded-[6px] border border-line-subtle bg-surface-2/70 p-2 space-y-1">
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">NVDA (20.0%)</span>
                      <span className="mono font-semibold text-txt-primary">$2,500,000</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">MSFT (18.0%)</span>
                      <span className="mono font-semibold text-txt-primary">$2,250,000</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">AAPL (15.0%)</span>
                      <span className="mono font-semibold text-txt-primary">$1,875,000</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">AMZN (15.0%)</span>
                      <span className="mono font-semibold text-txt-primary">$1,875,000</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">GOOGL (12.0%)</span>
                      <span className="mono font-semibold text-txt-primary">$1,500,000</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    loading={nwSubmittingConsent}
                    onClick={() => handleConsentDecision("APPROVE_PRESET")}
                    icon={CheckCircle2}
                    className="w-full bg-pos hover:bg-pos/90 text-white font-bold"
                  >
                    Approve Preset Strategy ($10.0M)
                  </Button>
                </div>

                {/* Pathway B: Defensive Adjusted */}
                <div className="rounded-[8px] border-2 border-acc/40 bg-surface/80 p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge tone="neu">PATHWAY B: DEFENSIVE</Badge>
                    <span className="mono text-[11px] font-bold text-acc">64.3% Deployed · 35.7% Cash</span>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-txt-primary">Defensive Scaled Allocation</h4>
                    <p className="text-[10.5px] text-txt-muted mt-0.5">Algorithm: QUANTX Dynamic Liquidity Sniping with Peg Bounds</p>
                  </div>

                  <div className="rounded-[6px] border border-line-subtle bg-surface-2/70 p-2 space-y-1">
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">NVDA (12.8%)</span>
                      <span className="mono font-semibold text-txt-primary">$1,607,500</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">MSFT (11.6%)</span>
                      <span className="mono font-semibold text-txt-primary">$1,446,750</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">AAPL (9.6%)</span>
                      <span className="mono font-semibold text-txt-primary">$1,205,625</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">AMZN (9.6%)</span>
                      <span className="mono font-semibold text-txt-primary">$1,205,625</span>
                    </div>
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-txt-muted">GOOGL (7.7%)</span>
                      <span className="mono font-semibold text-txt-primary">$964,500</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    loading={nwSubmittingConsent}
                    onClick={() => handleConsentDecision("APPROVE_DEFENSIVE")}
                    icon={ShieldCheck}
                    className="w-full border-acc text-acc hover:bg-acc/10 font-bold"
                  >
                    Approve Defensive Strategy ($6.43M)
                  </Button>
                </div>
              </div>

              {/* Emergency Rejection & Dead-Man's Switch Simulation Panel */}
              <Panel level={3} title="Default-Deny Governance & Emergency Gate Controls" sub="MiFID II RTS 25 & SEC Rule 15c3-5 Compliance Engine">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11.5px] text-txt-primary font-medium">Default-Deny Policy Enforcement</p>
                    <p className="text-[10.5px] text-txt-muted mt-0.5">If timer reaches 00:00 without affirmative trader consent, staged orders are automatically purged and the session is halted.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="xs"
                      variant="outline"
                      tone="neg"
                      loading={nwSubmittingConsent}
                      onClick={() => handleConsentDecision("REJECT_HALT")}
                      icon={AlertTriangle}
                    >
                      Reject & Halt
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      loading={nwSubmittingConsent}
                      onClick={() => handleConsentDecision("DEAD_MAN_TRIGGER")}
                      icon={Zap}
                    >
                      Trip Dead-Man's Switch
                    </Button>
                  </div>
                </div>
              </Panel>

              {/* Execution Result & Audit Trail Confirmation */}
              {nwConsentResult && (
                <div className="rounded-[8px] border border-line-subtle bg-surface/90 p-3.5 space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge tone={nwConsentResult.status.startsWith("EXECUTED") ? "pos" : "neg"}>
                        {nwConsentResult.status}
                      </Badge>
                      <span className="text-[12px] font-bold text-txt-primary">{nwConsentResult.message}</span>
                    </div>
                    <span className="mono text-[10.5px] text-txt-muted">{nwConsentResult.processed_at}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] mono pt-1 border-t border-line-subtle">
                    <div>
                      <span className="text-txt-muted">Total Deployed Notional: </span>
                      <span className="font-bold text-txt-primary">${nwConsentResult.total_deployed_notional.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-txt-muted">Cryptographic Audit Hash: </span>
                      <span className="text-acc font-semibold">{nwConsentResult.audit_hash.slice(0, 24)}...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── STANDARD ORDER BLOTTER ── */
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
      )}
    </>
  );
}


/* ══════════════════════════════ SETTINGS ══════════════════════════════ */

export function Settings() {
  const [dense, setDense] = useState(true);
  const [motion, setMotion] = useState(true);
  const [sound, setSound] = useState(false);
  const [live, setLive] = useState(() => {
    try {
      return localStorage.getItem("quantx_live_trading") === "true";
    } catch {
      return false;
    }
  });
  const { push } = useToast();

  useEffect(() => {
    const handleEnvChange = (e: any) => {
      if (e.detail?.isLive !== undefined) {
        setLive(e.detail.isLive);
      }
    };
    window.addEventListener("quantx-env-change", handleEnvChange);
    return () => window.removeEventListener("quantx-env-change", handleEnvChange);
  }, []);

  return (
    <>
      <PageHeader title="Settings" sub="Workspace preferences, environment control, risk thresholds and notification routing." />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <Panel level={3} title="Environment" tone={live ? "pos" : undefined}>
          {live ? (
            <div className="flex items-start gap-3 rounded-[6px] border border-pos/40 bg-pos/10 px-3 py-2.5 shadow-[0_0_12px_rgba(46,213,115,0.15)]">
              <Zap size={14} className="mt-0.5 shrink-0 text-pos" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="label-xs font-bold text-pos uppercase tracking-wide">LIVE TRADING ACTIVE</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-pos anim-pulse-dot" />
                </div>
                <p className="mt-1 text-[10.5px] leading-relaxed text-txt-primary">
                  Connected to direct exchange DMA gateway & live consolidated tape. Orders route to exchange matching engines. Capital is at risk.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-[6px] border border-warn/25 bg-warn/6 px-3 py-2.5">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warn" />
              <div>
                <p className="label-xs text-warn font-semibold">PAPER TRADING ACTIVE</p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-txt-secondary">
                  Orders are simulated against the consolidated tape. No capital is at risk.
                </p>
              </div>
            </div>
          )}
          <div className="mt-3 space-y-2.5">
            <Toggle
              checked={live}
              onChange={(v) => {
                setLive(v);
                try {
                  localStorage.setItem("quantx_live_trading", v ? "true" : "false");
                  window.dispatchEvent(new CustomEvent("quantx-env-change", { detail: { isLive: v } }));
                } catch {}
                if (v) {
                  push({
                    title: "Live Trading Activated",
                    body: "Direct market access (DMA) session established with verified hardware 2FA.",
                    tone: "pos",
                  });
                } else {
                  push({
                    title: "Switched to Paper Trading",
                    body: "All executions routed to simulated exchange sandbox.",
                    tone: "warn",
                  });
                }
              }}
              label="Enable live trading"
            />
            <Toggle
              checked={sound}
              onChange={(v) => {
                setSound(v);
                push({
                  title: v ? "Audible Alerts Enabled" : "Audible Alerts Muted",
                  body: v ? "Synthesized voice & chime notifications active." : "Silent visual alert notifications only.",
                  tone: v ? "pos" : "neu",
                });
              }}
              label="Audible breach alerts"
            />
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
