import { useState } from "react";
import {
  Sparkles,
  Radio,
  Cpu,
  Scale,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { SyntheticMarketSingularityStudio } from "../components/finance/SyntheticMarketSingularityStudio";
import { EntangledQuantumPhotonicOMS } from "../components/finance/EntangledQuantumPhotonicOMS";
import { CarbonNanotubeExecutionBlotter } from "../components/finance/CarbonNanotubeExecutionBlotter";
import { ConstitutionalAIGovernancePanel } from "../components/finance/ConstitutionalAIGovernancePanel";
import { SingularityPipelineDispatcher } from "../components/finance/SingularityPipelineDispatcher";

const TABS = [
  { id: "pipeline_dispatch", label: "Autonomous Pipeline (5-Stage)", icon: Zap },
  { id: "singularity_universe", label: "Synthetic Market Singularity (DiT)", icon: Sparkles },
  { id: "entangled_oms", label: "Entangled Quantum Photonic OMS", icon: Radio },
  { id: "cnt_execution", label: "Carbon Nanotube Molecular EMS", icon: Cpu },
  { id: "constitutional_governance", label: "Constitutional AI Fund Governance", icon: Scale },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SingularityV35Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline_dispatch");

  return (
    <>
      <PageHeader
        title="Synthetic Market Singularity, Entangled OMS & Constitutional AI Studio"
        meta={
          <>
            <Badge tone="cyan" dot>
              v35 MASTER SUITE
            </Badge>
            <Badge tone="pos">DiT 15σ TAIL SINGULARITY</Badge>
            <Badge tone="purple">ENTANGLED CV-QKD &lt;1ns</Badge>
            <Badge tone="warn">CNT-FET 0.92ps FABRIC</Badge>
            <Badge tone="cyan">CONSTITUTIONAL P(BREACH)=0</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/multiverse-v36">
              <Button size="sm" variant="primary" icon={ExternalLink}>
                v36 Multiverse &amp; BCI
              </Button>
            </Link>
            <Link to="/sovereign-v34">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v34 Sovereign DNA
              </Button>
            </Link>
            <Link to="/sovereign-v33">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                v33 Sovereign Memristive
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
                  body: `Active view updated to v35 ${tab.label}.`,
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
        {activeTab === "pipeline_dispatch" && <SingularityPipelineDispatcher />}

        {activeTab === "singularity_universe" && <SyntheticMarketSingularityStudio />}

        {activeTab === "entangled_oms" && <EntangledQuantumPhotonicOMS />}

        {activeTab === "cnt_execution" && <CarbonNanotubeExecutionBlotter />}

        {activeTab === "constitutional_governance" && <ConstitutionalAIGovernancePanel />}
      </div>

      {/* ── Institutional Footnote / Architecture Cross-Links ── */}
      <div className="mt-12 rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-semibold text-text-primary">
                QUANTX v35 Synthetic Market Singularity, Entangled Photonic &amp; Constitutional AI Architecture
              </h4>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              Featuring generative Latent Diffusion Transformer (DiT) universe multi-verse modeling (15σ tail gap &amp; 99% depth cliff), Continuous-Variable QKD Bell state photonic OMS state lock (0.85 ps, ΔS collapse detection), sub-nanometer Carbon Nanotube Field-Effect Transistors (0.92 ps gate delay, 1,067x lower thermal dissipation), and zero-human-intervention Constitutional AI governance with deterministic proof bounds (P(Breach) = 0).
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <Link to="/multiverse-v36" className="text-cyan-400 hover:underline">
              v36 Multiverse &amp; BCI →
            </Link>
            <span className="text-text-muted">|</span>
            <Link to="/sovereign-v34" className="text-cyan-400 hover:underline">
              ← v34 Sovereign DNA &amp; Topological
            </Link>
            <span className="text-text-muted">|</span>
            <Link to="/sovereign-v33" className="text-amber-400 hover:underline">
              v33 Sovereign Memristive
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
