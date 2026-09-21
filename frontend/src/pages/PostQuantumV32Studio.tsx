import { useState } from "react";
import {
  Lock,
  Sun,
  ArrowRightLeft,
  Network,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { PQCLatticeSecurityPanel } from "../components/finance/PQCLatticeSecurityPanel";
import { PhotonicTensorVisualizer } from "../components/finance/PhotonicTensorVisualizer";
import { AtomicZkDvPSettlementBlotter } from "../components/finance/AtomicZkDvPSettlementBlotter";
import { SelfCorrectingCausalGraphViewer } from "../components/finance/SelfCorrectingCausalGraphViewer";

const TABS = [
  { id: "pqc_security", label: "Post-Quantum Security (Dilithium/Kyber)", icon: Lock },
  { id: "photonic_tensor", label: "Photonic Tensor Accelerator (Sub-ps)", icon: Sun },
  { id: "atomic_dvp", label: "Autonomous zk-DvP Atomic Settlement", icon: ArrowRightLeft },
  { id: "causal_graph", label: "Self-Correcting Causal Graph (SC-CRL)", icon: Network },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function PostQuantumV32Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("pqc_security");

  return (
    <>
      <PageHeader
        title="Post-Quantum Security & Photonic Causal Studio"
        meta={
          <>
            <Badge tone="cyan" dot>
              v32 MASTER SUITE
            </Badge>
            <Badge tone="pos">NIST FIPS 203/204 PQC</Badge>
            <Badge tone="neu">SUB-PICOSECOND PHOTONIC MZI</Badge>
            <Badge tone="purple">ATOMIC ZK-DVP</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/sovereign-v34">
              <Button size="sm" variant="primary" icon={ExternalLink}>
                v34 Sovereign DNA
              </Button>
            </Link>
            <Link to="/sovereign-v33">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v33 Sovereign Memristive
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
                  body: `Active view updated to v32 ${tab.label}.`,
                  tone: "neu",
                });
              }}
              className={cn(
                "flex items-center gap-2 rounded-[6px] px-3.5 py-1.5 text-xs font-mono font-medium transition-all",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 shadow-sm ring-1 ring-emerald-500/30 font-bold"
                  : "text-text-muted hover:bg-bg-secondary hover:text-text-primary"
              )}
            >
              <Icon size={14} className={isActive ? "text-emerald-400" : "text-text-muted"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Content ── */}
      <div className="space-y-6">
        {activeTab === "pqc_security" && <PQCLatticeSecurityPanel />}

        {activeTab === "photonic_tensor" && <PhotonicTensorVisualizer />}

        {activeTab === "atomic_dvp" && <AtomicZkDvPSettlementBlotter />}

        {activeTab === "causal_graph" && <SelfCorrectingCausalGraphViewer />}
      </div>

      {/* ── Institutional Footnote / Architecture Cross-Links ── */}
      <div className="mt-12 rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-text-primary">
                QUANTX v32 Post-Quantum, Photonic & Causal Ecosystem
              </h4>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              Fully compliant with NIST FIPS 203/204 standards, featuring sub-picosecond Mach-Zehnder optical tensor contraction, zero-counterparty zk-DvP atomic settlements, and kernel PC/FCI self-correcting causal discovery.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <Link to="/sovereign-v33" className="text-amber-400 font-semibold hover:underline">
              v33 Sovereign Memristive →
            </Link>
            <span className="text-text-muted">•</span>
            <Link to="/world-model-v31" className="text-emerald-400 hover:underline">
              v31 World Model →
            </Link>
            <span className="text-text-muted">•</span>
            <Link to="/portfolio" className="text-emerald-400 hover:underline">
              Portfolio Ledger →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
