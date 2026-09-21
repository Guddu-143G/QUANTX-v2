import { useState } from "react";
import {
  Zap,
  Cpu,
  Radio,
  Dna,
  Lock,
  ExternalLink,
  ShieldCheck,
  Globe2,
  Sparkles,
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { OmniV37PipelineDispatcher } from "../components/finance/OmniV37PipelineDispatcher";
import { FractionalCalculusAlphaBlotter } from "../components/finance/FractionalCalculusAlphaBlotter";
import { PhotonicQRNGEntropyViewer } from "../components/finance/PhotonicQRNGEntropyViewer";
import { BioDigitalSwarmEvolutionPanel } from "../components/finance/BioDigitalSwarmEvolutionPanel";
import { ZeroKnowledgeMJRCSummaryBlotter } from "../components/finance/ZeroKnowledgeMJRCSummaryBlotter";

const TABS = [
  { id: "pipeline_dispatch", label: "Omni-Pipeline (5-Stage)", icon: Zap },
  { id: "fractional_alpha", label: "Fractional Calculus & Hurst Alpha", icon: Cpu },
  { id: "photonic_qrng", label: "Photonic QRNG Vacuum Entropy", icon: Radio },
  { id: "bio_swarm", label: "Bio-Digital Swarm & Z3 Prover", icon: Dna },
  { id: "zk_mjrc", label: "zk-MJRC Global Consensus", icon: Lock },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function OmniV37Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline_dispatch");

  return (
    <>
      <PageHeader
        title="Fractional Calculus, Photonic QRNG & zk-MJRC Consensus Studio"
        meta={
          <>
            <Badge tone="cyan" dot>
              v37 OMNI-SOVEREIGN SUITE
            </Badge>
            <Badge tone="purple">CAPUTO FRACTIONAL MEMORY</Badge>
            <Badge tone="cyan">40 Gbps PHOTONIC QRNG</Badge>
            <Badge tone="pos">SWARM Z3 THEOREM PROVER</Badge>
            <Badge tone="warn">zk-MJRC MULTI-JURISDICTION</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/omni-v38">
              <Button size="sm" variant="primary" icon={ExternalLink}>
                v38 Singularity Studio
              </Button>
            </Link>
            <Link to="/multiverse-v36">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v36 Multiverse Studio
              </Button>
            </Link>
            <Link to="/singularity-v35">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v35 Singularity OMS
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
                  title: `Switched View: ${tab.label}`,
                  message: `QUANTX Version 37 ${tab.label} telemetry activated.`,
                  tone: "pos",
                });
              }}
              className={cn(
                "group relative flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-all duration-150",
                isActive
                  ? "bg-surface text-txt-primary shadow-sm border border-line-subtle"
                  : "text-txt-muted hover:bg-surface-hover hover:text-txt-secondary"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isActive
                    ? "text-cyan-400"
                    : "text-txt-disabled group-hover:text-txt-muted"
                )}
              />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-2.5 left-2 right-2 h-0.5 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab View Content ── */}
      <div className="space-y-6">
        {activeTab === "pipeline_dispatch" && <OmniV37PipelineDispatcher />}
        {activeTab === "fractional_alpha" && <FractionalCalculusAlphaBlotter />}
        {activeTab === "photonic_qrng" && <PhotonicQRNGEntropyViewer />}
        {activeTab === "bio_swarm" && <BioDigitalSwarmEvolutionPanel />}
        {activeTab === "zk_mjrc" && <ZeroKnowledgeMJRCSummaryBlotter />}
      </div>
    </>
  );
}
