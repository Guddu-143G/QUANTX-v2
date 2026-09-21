import { useState } from "react";
import {
  Cpu,
  Server,
  BrainCircuit,
  Lock,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link } from "../lib/router";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, useToast } from "../components/ui";
import { cn } from "../utils/cn";
import { MarketWorldModelVisualizer } from "../components/finance/MarketWorldModelVisualizer";
import { SelfHealingEMSMonitor } from "../components/finance/SelfHealingEMSMonitor";
import { CounterfactualDecayViewer } from "../components/finance/CounterfactualDecayViewer";
import { ZkAuditPanel } from "../components/finance/ZkAuditPanel";

const TABS = [
  { id: "world_model", label: "Generative Market World Model", icon: Cpu },
  { id: "ems_failover", label: "Self-Healing EMS & SmartNIC", icon: Server },
  { id: "counterfactual_decay", label: "Counterfactual SCM & Alpha Decay", icon: BrainCircuit },
  { id: "zk_audit", label: "Zero-Knowledge zk-Audit Prover", icon: Lock },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function WorldModelV31Studio() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("world_model");

  return (
    <>
      <PageHeader
        title="Generative World Model & Self-Healing EMS Studio"
        meta={
          <>
            <Badge tone="cyan" dot>
              v31 MASTER SUITE
            </Badge>
            <Badge tone="pos">4-TIER SMARTNIC EMS</Badge>
            <Badge tone="neu">HALO2 ZK-AUDIT READY</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/sovereign-v33">
              <Button size="sm" variant="primary" icon={ExternalLink}>
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
                  body: `Active view updated to v31 ${tab.label}.`,
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
        {activeTab === "world_model" && <MarketWorldModelVisualizer />}

        {activeTab === "ems_failover" && <SelfHealingEMSMonitor />}

        {activeTab === "counterfactual_decay" && <CounterfactualDecayViewer />}

        {activeTab === "zk_audit" && <ZkAuditPanel />}
      </div>

      {/* ── Institutional Footnote / Architecture Cross-Links ── */}
      <div className="mt-12 rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-semibold text-text-primary">
                QUANTX v31 Institutional Master Architecture
              </h4>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              Fully compliant with SEBI algorithmic trading guidelines, featuring zero-knowledge proof generation, 4-tier sub-millisecond failover routing, and Pearl's SCM counterfactual risk modeling.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <Link to="/post-quantum-v32" className="text-cyan-400 hover:underline">
              v32 Post-Quantum →
            </Link>
            <span className="text-text-muted">•</span>
            <Link to="/portfolio" className="text-cyan-400 hover:underline">
              Portfolio Holdings →
            </Link>
            <span className="text-text-muted">•</span>
            <Link to="/autonomous-v30" className="text-cyan-400 hover:underline">
              v30 Execution Slicer →
            </Link>
            <span className="text-text-muted">•</span>
            <Link to="/dl-visual-v10" className="text-cyan-400 hover:underline">
              Visual DL10 Studio →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
