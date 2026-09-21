import { useState } from "react";
import {
  Orbit,
  Brain,
  Sparkles,
  Key,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Globe2,
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { MultiverseV36PipelineDispatcher } from "../components/finance/MultiverseV36PipelineDispatcher";
import { MultiPlanetaryCapitalFabricBlotter } from "../components/finance/MultiPlanetaryCapitalFabricBlotter";
import { NeuromorphicBCITelemetryPanel } from "../components/finance/NeuromorphicBCITelemetryPanel";
import { HolographicAdSRiskManifoldVisualizer } from "../components/finance/HolographicAdSRiskManifoldVisualizer";
import { ZeroKnowledgePoCAlphaBlotter } from "../components/finance/ZeroKnowledgePoCAlphaBlotter";

const TABS = [
  { id: "pipeline_dispatch", label: "Multiverse Pipeline (5-Stage)", icon: Zap },
  { id: "orbital_fabric", label: "Multi-Planetary Fabric & DTN", icon: Orbit },
  { id: "bci_telemetry", label: "Neuromorphic BCI Consent Gate", icon: Brain },
  { id: "holographic_risk", label: "Holographic AdS/CFT Risk Manifold", icon: Sparkles },
  { id: "zk_poc_engine", label: "zk-PoC Halo2 Causal Alpha", icon: Key },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MultiverseV36Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline_dispatch");

  return (
    <>
      <PageHeader
        title="Multi-Planetary Sovereign Capital Fabrics, BCI & zk-PoC Studio"
        meta={
          <>
            <Badge tone="cyan" dot>
              v36 MASTER SUITE
            </Badge>
            <Badge tone="pos">RELATIVISTIC DTN-PBFT</Badge>
            <Badge tone="purple">NEUROMORPHIC BCI GATE</Badge>
            <Badge tone="warn">HOLOGRAPHIC AdS/CFT</Badge>
            <Badge tone="cyan">HALO2 zk-PoC DO-CALCULUS</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/omni-v37">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v37 Omni Studio
              </Button>
            </Link>

            <Link to="/singularity-v35">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v35 Singularity OMS
              </Button>
            </Link>

            <Link to="/sovereign-v34">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v34 Sovereign DNA
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                Active Portfolio
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── Sub-Navigation Tabs ── */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 border-b border-line-subtle pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                push({
                  title: `Switched to ${tab.label}`,
                  body: `Active view updated to v36 ${tab.label}.`,
                  tone: "neu",
                });
              }}
              className={cn(
                "flex items-center gap-2 rounded-[6px] px-3.5 py-1.5 text-xs font-mono font-medium transition-all",
                isActive
                  ? "bg-cyan-500/15 text-cyan-400 shadow-sm ring-1 ring-cyan-500/30 font-bold"
                  : "text-text-muted hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <Icon size={14} className={isActive ? "text-cyan-400" : "text-text-muted"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Content ── */}
      <div className="space-y-6">
        {activeTab === "pipeline_dispatch" && <MultiverseV36PipelineDispatcher />}

        {activeTab === "orbital_fabric" && <MultiPlanetaryCapitalFabricBlotter />}

        {activeTab === "bci_telemetry" && <NeuromorphicBCITelemetryPanel />}

        {activeTab === "holographic_risk" && <HolographicAdSRiskManifoldVisualizer />}

        {activeTab === "zk_poc_engine" && <ZeroKnowledgePoCAlphaBlotter />}
      </div>

      {/* ── Institutional Footnote / Architecture Cross-Links ── */}
      <div className="mt-12 rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-semibold text-text-primary">
                QUANTX v36 Multi-Planetary Sovereign Capital Fabrics, BCI &amp; zk-PoC Architecture
              </h4>
            </div>
            <p className="mt-1 text-[11px] text-text-muted max-w-4xl">
              Equipped with delay-tolerant consensus protocols (DTN-PBFT) across planetary nodes, relativistic asset price arbitrage
              over light delays (P_orbital(t) = P_terrestrial(t - Δt) · exp((μ - 0.5σ²)dt + σ W_dt)), non-invasive Neuromorphic BCI
              cognitive stress gating (β / (α + θ) ≤ 2.5), 4-dimensional Anti-de Sitter (AdS/CFT) bulk hyperbolic risk geometry with
              topological liquidity wormhole detection, and Zero-Knowledge Proof-of-Causality (zk-PoC) Halo2 circuits enforcing
              Pearl Do-Calculus causal authenticity without trade secrecy exposure.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <Link to="/singularity-v35" className="text-cyan-400 hover:underline">
              ← v35 Singularity &amp; OMS
            </Link>
            <span className="text-text-muted">|</span>
            <Link to="/sovereign-v34" className="text-purple-400 hover:underline">
              v34 Sovereign DNA
            </Link>
            <span className="text-text-muted">|</span>
            <Link to="/portfolio" className="text-emerald-400 hover:underline flex items-center gap-1">
              Portfolio Ledger <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
