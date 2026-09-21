import { useState } from "react";
import {
  Cpu,
  Network,
  Dna,
  Vote,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { MemristiveVMMVisualizer } from "../components/finance/MemristiveVMMVisualizer";
import { ZkFederatedLiquidityGraphViewer } from "../components/finance/ZkFederatedLiquidityGraphViewer";
import { MarketImmuneDefensePanel } from "../components/finance/MarketImmuneDefensePanel";
import { BFTRiskSwarmConsensusBlotter } from "../components/finance/BFTRiskSwarmConsensusBlotter";

const TABS = [
  { id: "memristive_vmm", label: "Memristive Analog VMM & SPDE Solver", icon: Cpu },
  { id: "zk_fldg", label: "zk-FLDG Federated Liquidity Discovery", icon: Network },
  { id: "immune_defense", label: "Bio-Inspired Market Immune System", icon: Dna },
  { id: "bft_risk_swarm", label: "BFT Risk Swarm Consensus (2/3+ Quorum)", icon: Vote },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SovereignV33Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("memristive_vmm");

  return (
    <>
      <PageHeader
        title="Sovereign Memristive Computing & BFT Risk Swarm Studio"
        meta={
          <>
            <Badge tone="warn" dot>
              v33 MASTER SUITE
            </Badge>
            <Badge tone="pos">SUB-PICOSECOND MEMRISTOR VMM</Badge>
            <Badge tone="cyan">ZK-FEDERATED LIQUIDITY GRAPH</Badge>
            <Badge tone="purple">BFT RISK SWARM CONSENSUS</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/sovereign-v34">
              <Button size="sm" variant="primary" icon={ExternalLink}>
                v34 Sovereign DNA & Quantum
              </Button>
            </Link>
            <Link to="/post-quantum-v32">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v32 Post-Quantum & Photonic
              </Button>
            </Link>
            <Link to="/world-model-v31">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v31 World Model & EMS
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
                  body: `Active view updated to v33 ${tab.label}.`,
                  tone: "neu",
                });
              }}
              className={cn(
                "flex items-center gap-2 rounded-[6px] px-3.5 py-1.5 text-xs font-mono font-medium transition-all",
                isActive
                  ? "bg-amber-500/15 text-amber-400 shadow-sm ring-1 ring-amber-500/30 font-bold"
                  : "text-text-muted hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <Icon size={14} className={isActive ? "text-amber-400" : "text-text-muted"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Content ── */}
      <div className="space-y-6">
        {activeTab === "memristive_vmm" && <MemristiveVMMVisualizer />}

        {activeTab === "zk_fldg" && <ZkFederatedLiquidityGraphViewer />}

        {activeTab === "immune_defense" && <MarketImmuneDefensePanel />}

        {activeTab === "bft_risk_swarm" && <BFTRiskSwarmConsensusBlotter />}
      </div>

      {/* ── Institutional Footnote / Architecture Cross-Links ── */}
      <div className="mt-12 rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-semibold text-text-primary">
                QUANTX v33 Sovereign Memristive, zk-FLDG & BFT Immune Architecture
              </h4>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              Featuring sub-picosecond analog memristor crossbar VMMs (0.78 ps, 0.15 fJ/op), privacy-preserving Zero-Knowledge Federated Liquidity Discovery Graph (zk-FLDG), Negative & Clonal Selection bio-inspired antibody perimeter defense, and 2/3+ Byzantine Fault Tolerant risk swarm consensus.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <Link to="/sovereign-v34" className="text-cyan-400 font-semibold hover:underline">
              v34 Sovereign DNA Studio →
            </Link>
            <span className="text-text-muted">|</span>
            <Link to="/post-quantum-v32" className="text-emerald-400 hover:underline">
              ← v32 Post-Quantum Studio
            </Link>
            <span className="text-text-muted">|</span>
            <Link to="/portfolio" className="text-amber-400 hover:underline flex items-center gap-1">
              Portfolio Ledger <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
