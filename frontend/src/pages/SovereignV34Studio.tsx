import { useState } from "react";
import {
  Dna,
  Orbit,
  Coins,
  Activity,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { BiologicalDNAArchivalVault } from "../components/finance/BiologicalDNAArchivalVault";
import { TopologicalQuantumNPUVisualizer } from "../components/finance/TopologicalQuantumNPUVisualizer";
import { SovereignCBDCBridgeBlotter } from "../components/finance/SovereignCBDCBridgeBlotter";
import { EpigeneticPolicyOptimizerPanel } from "../components/finance/EpigeneticPolicyOptimizerPanel";

const TABS = [
  { id: "dna_archival", label: "Biological DNA Digital Archival Vault", icon: Dna },
  { id: "topological_npu", label: "Topological Quantum NPU (Majorana Braiding)", icon: Orbit },
  { id: "cbdc_bridge", label: "Sovereign CBDC Cross-Chain DvP Bridge", icon: Coins },
  { id: "epigenetic_ai", label: "Epigenetic Multi-Agent Policy Optimizer", icon: Activity },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SovereignV34Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("dna_archival");

  return (
    <>
      <PageHeader
        title="Biological DNA Storage, Topological Quantum & CBDC Studio"
        meta={
          <>
            <Badge tone="cyan" dot>
              v34 MASTER SUITE
            </Badge>
            <Badge tone="pos">10,000-YEAR DNA STORAGE</Badge>
            <Badge tone="purple">TOPOLOGICAL tQNPU CHERN=1</Badge>
            <Badge tone="warn">CROSS-CHAIN CBDC DVP</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/multiverse-v36">
              <Button size="sm" variant="primary" icon={ExternalLink}>
                v36 Multiverse &amp; BCI
              </Button>
            </Link>
            <Link to="/singularity-v35">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v35 Singularity &amp; Entangled
              </Button>
            </Link>
            <Link to="/sovereign-v33">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v33 Sovereign Memristive
              </Button>
            </Link>
            <Link to="/post-quantum-v32">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v32 Post-Quantum
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
                  body: `Active view updated to v34 ${tab.label}.`,
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
        {activeTab === "dna_archival" && <BiologicalDNAArchivalVault />}

        {activeTab === "topological_npu" && <TopologicalQuantumNPUVisualizer />}

        {activeTab === "cbdc_bridge" && <SovereignCBDCBridgeBlotter />}

        {activeTab === "epigenetic_ai" && <EpigeneticPolicyOptimizerPanel />}
      </div>

      {/* ── Institutional Footnote / Architecture Cross-Links ── */}
      <div className="mt-12 rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-semibold text-text-primary">
                QUANTX v34 Biological DNA, Topological Quantum & Sovereign CBDC Architecture
              </h4>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              Featuring 10,000+-year synthetic DNA wetware archival (215 PB/gram), non-Abelian Majorana anyon braiding (1e-12 decoherence), cross-chain sovereign digital fiat atomic DvP settlement (e-INR, e-USD, e-EUR), and continuous epigenetic gene expression policy adaptation in 12.4 µs.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <Link to="/sovereign-v33" className="text-amber-400 hover:underline">
              ← v33 Sovereign Memristive
            </Link>
            <span className="text-text-muted">|</span>
            <Link to="/singularity-v35" className="text-cyan-400 hover:underline">
              v35 Singularity Studio
            </Link>
            <span className="text-text-muted">|</span>
            <Link to="/multiverse-v36" className="text-cyan-400 hover:underline">
              v36 Multiverse Studio →
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
