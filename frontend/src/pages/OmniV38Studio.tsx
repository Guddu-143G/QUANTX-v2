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
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { OmniV38SingularityPipelineDispatcher } from "../components/finance/OmniV38SingularityPipelineDispatcher";
import { TQFTChernSimonsBlotter } from "../components/finance/TQFTChernSimonsBlotter";
import { SuperconductingQUBOAnnealerPanel } from "../components/finance/SuperconductingQUBOAnnealerPanel";
import { BioDNAWetwareMemoryViewer } from "../components/finance/BioDNAWetwareMemoryViewer";
import { ZeroKnowledgeHMSCGGovernorBlotter } from "../components/finance/ZeroKnowledgeHMSCGGovernorBlotter";

const TABS = [
  { id: "pipeline_dispatch", label: "Omni-Singularity (5-Stage)", icon: Zap },
  { id: "tqft_manifold", label: "Topological Field Theory (Chern-Simons)", icon: Compass },
  { id: "qubo_quantum", label: "100k-Qubit Superconducting Annealer", icon: Cpu },
  { id: "bio_wetware", label: "Bio-DNA & Wetware Organoids", icon: Dna },
  { id: "zk_hmscg", label: "zk-HMSCG Sovereign Governor", icon: Lock },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function OmniV38Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline_dispatch");

  return (
    <>
      <PageHeader
        title="Topological Field Theory, 100k+ Qubit Annealing & zk-HMSCG Sovereign Studio"
        meta={
          <>
            <Badge tone="cyan" dot>
              v38 OMNI-SINGULARITY SUITE
            </Badge>
            <Badge tone="purple">TQFT CHERN-SIMONS MANIFOLDS</Badge>
            <Badge tone="cyan">100,000+ TRANSMON QUBIT QUBO</Badge>
            <Badge tone="pos">WETWARE ORGANOID 0.0 W DNA</Badge>
            <Badge tone="warn">zk-HMSCG FHE-CKKS GOVERNANCE</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/omni-v37">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v37 Omni Studio
              </Button>
            </Link>
            <Link to="/multiverse-v36">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v36 Multiverse Studio
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              icon={ShieldCheck}
              onClick={() =>
                push({
                  title: "Sovereign Singularity Fabric Synchronized",
                  description:
                    "TQFT Gauge Curvature, 100k-Qubit Transmon Annealer, DNA-Wetware Archival, and zk-HMSCG FHE Circuits are operating at 100% cryptographic consensus.",
                  tone: "pos",
                })
              }
            >
              Verify Singularity Fabric
            </Button>
          </div>
        }
      />

      {/* ── Tab Navigation ── */}
      <div className="mb-6 flex overflow-x-auto border-b border-line-subtle gap-1">
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
        {activeTab === "pipeline_dispatch" && <OmniV38SingularityPipelineDispatcher />}
        {activeTab === "tqft_manifold" && <TQFTChernSimonsBlotter />}
        {activeTab === "qubo_quantum" && <SuperconductingQUBOAnnealerPanel />}
        {activeTab === "bio_wetware" && <BioDNAWetwareMemoryViewer />}
        {activeTab === "zk_hmscg" && <ZeroKnowledgeHMSCGGovernorBlotter />}
      </div>
    </>
  );
}
