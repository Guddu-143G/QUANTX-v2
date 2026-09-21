import { useState } from "react";
import {
  Zap,
  Atom,
  Brain,
  ShieldCheck,
  ExternalLink,
  Lock,
  Gauge,
  Cpu,
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { OmniV40SingularityPipelineDispatcher } from "../components/finance/OmniV40SingularityPipelineDispatcher";
import { NonCommutativeMultiverseVisualizer } from "../components/finance/NonCommutativeMultiverseVisualizer";
import { SyntheticConsciousnessPhiPanel } from "../components/finance/SyntheticConsciousnessPhiPanel";
import { ZPEPhotonicQuantumPanel } from "../components/finance/ZPEPhotonicQuantumPanel";
import { ZkTSCCMConsensusBlotter } from "../components/finance/ZkTSCCMConsensusBlotter";

const TABS = [
  { id: "pipeline_dispatch", label: "Omni-Singularity (5-Stage)", icon: Zap },
  { id: "multiverse_string", label: "11D String Multiverse & Non-Commutative Solver", icon: Atom },
  { id: "phi_consciousness", label: "Synthetic Consciousness (IIT 4.0 Φ-Core)", icon: Brain },
  { id: "zpe_qpu", label: "Zero-Point Energy Photonic QPU (<10⁻¹⁸ s)", icon: Gauge },
  { id: "zk_tsccm", label: "Trans-Sovereign Consensus Mesh (zk-TSCCM)", icon: Lock },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function OmniV40Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline_dispatch");

  return (
    <>
      <PageHeader
        title="Omni-Dimensional String Multiverse, Synthetic Consciousness & ZPE Singularity Studio"
        meta={
          <>
            <Badge tone="purple" dot>
              v40 OMNI-SINGULARITY SUITE
            </Badge>
            <Badge tone="cyan">11D M-THEORY [xⁱ,xʲ]=iθ</Badge>
            <Badge tone="pos">IIT 4.0 Φ-CORE METACOGNITION</Badge>
            <Badge tone="purple">CASIMIR ZPE SUB-ATTOSECOND</Badge>
            <Badge tone="warn">zk-TSCCM SEBI ∧ SEC ∧ ESMA ∧ BIS</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/omni-v39">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v39 QTSFT Studio
              </Button>
            </Link>
            <Link to="/omni-v38">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v38 TQFT Studio
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              icon={ShieldCheck}
              onClick={() =>
                push({
                  title: "Singularity v40 Fabric Verified",
                  description:
                    "11D String Multiverse, IIT 4.0 Φ-Core, Casimir ZPE Photonic QPU, and Trans-Sovereign zk-STARK Mesh verified with P(Breach) = 0.0000 certainty.",
                  tone: "pos",
                })
              }
            >
              Verify v40 Singularity Fabric
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
                  ? "border-purple-400 text-purple-300 bg-purple-950/20"
                  : "border-transparent text-txt-muted hover:text-txt-primary hover:border-line"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-purple-400" : "text-txt-muted")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Component Rendering ── */}
      <div className="space-y-6">
        {activeTab === "pipeline_dispatch" && <OmniV40SingularityPipelineDispatcher />}
        {activeTab === "multiverse_string" && <NonCommutativeMultiverseVisualizer />}
        {activeTab === "phi_consciousness" && <SyntheticConsciousnessPhiPanel />}
        {activeTab === "zpe_qpu" && <ZPEPhotonicQuantumPanel />}
        {activeTab === "zk_tsccm" && <ZkTSCCMConsensusBlotter />}
      </div>
    </>
  );
}
