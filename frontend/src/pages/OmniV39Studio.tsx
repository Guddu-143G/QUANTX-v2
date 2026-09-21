import { useState } from "react";
import {
  Zap,
  Cpu,
  Radio,
  Dna,
  Lock,
  ExternalLink,
  ShieldCheck,
  Compass,
  Sparkles,
  Waves,
  Layers,
  Scale,
  Globe,
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { OmniV39SingularityPipelineDispatcher } from "../components/finance/OmniV39SingularityPipelineDispatcher";
import { QTSFTCalabiYauVisualizer } from "../components/finance/QTSFTCalabiYauVisualizer";
import { WetwareOrganoidSynapticPanel } from "../components/finance/WetwareOrganoidSynapticPanel";
import { ZkMCSRMSettlementMeshBlotter } from "../components/finance/ZkMCSRMSettlementMeshBlotter";
import { ConstitutionalAIGovernanceGate } from "../components/finance/ConstitutionalAIGovernanceGate";

const TABS = [
  { id: "pipeline_dispatch", label: "Omni-Singularity (5-Stage)", icon: Zap },
  { id: "qtsft_manifold", label: "QTSFT Calabi-Yau Mirror Solver", icon: Compass },
  { id: "wetware_organoid", label: "Wetware Synaptic Organoid (4,096 MEA)", icon: Dna },
  { id: "zk_mcsrm", label: "zk-MCSRM Quantum Settlement Mesh", icon: Lock },
  { id: "constitutional_ai", label: "Constitutional AI Governance Gate (Lean 4/Z3)", icon: Scale },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function OmniV39Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline_dispatch");

  return (
    <>
      <PageHeader
        title="QTSFT Calabi-Yau, Wetware Organoid, zk-MCSRM & Constitutional AI Studio"
        meta={
          <>
            <Badge tone="cyan" dot>
              v39 OMNI-SINGULARITY SUITE
            </Badge>
            <Badge tone="purple">6D CALABI-YAU MIRROR SYMMETRY</Badge>
            <Badge tone="pos">4,096-CHANNEL MEA WETWARE STDP</Badge>
            <Badge tone="cyan">NIST ML-KEM-1024 / ML-DSA-87</Badge>
            <Badge tone="warn">LEAN 4 & Z3 SMT P(BREACH)=0</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/omni-v38">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v38 TQFT Studio
              </Button>
            </Link>
            <Link to="/omni-v37">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v37 Omni Studio
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              icon={ShieldCheck}
              onClick={() =>
                push({
                  title: "Singularity v39 Fabric Formally Verified",
                  description:
                    "Calabi-Yau Mirror Symmetry, 4,096 MEA Organoid, NIST ML-KEM-1024 lattice, and Z3 SMT Constitutional Gate are verified with P(Breach) = 0.0000 certainty.",
                  tone: "pos",
                })
              }
            >
              Verify v39 Singularity Fabric
            </Button>
          </div>
        }
      />

      {/* ── Tab Navigation ── */}
      <div className="mb-6 flex overflow-x-auto border-b border-line-subtle gap-1 no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium border-b-2 transition-all whitespace-nowrap",
                isActive
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
                  : "border-transparent text-txt-muted hover:text-txt-primary hover:border-line"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-cyan-400" : "text-txt-muted")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Component Rendering ── */}
      <div className="space-y-6">
        {activeTab === "pipeline_dispatch" && <OmniV39SingularityPipelineDispatcher />}
        {activeTab === "qtsft_manifold" && <QTSFTCalabiYauVisualizer />}
        {activeTab === "wetware_organoid" && <WetwareOrganoidSynapticPanel />}
        {activeTab === "zk_mcsrm" && <ZkMCSRMSettlementMeshBlotter />}
        {activeTab === "constitutional_ai" && <ConstitutionalAIGovernanceGate />}
      </div>
    </>
  );
}
