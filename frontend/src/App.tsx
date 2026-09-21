import { RouterProvider, useRouter } from "./lib/router";
import { AuthProvider, useAuth } from "./lib/auth";
import { AppShell } from "./components/layout/AppShell";
import { EmptyState, Panel, ToastProvider, Button } from "./components/ui";
import { Compass } from "lucide-react";
import { Link } from "./lib/router";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Markets, { Research } from "./pages/Markets";
import AlphaLab from "./pages/AlphaLab";
import Portfolio from "./pages/Portfolio";
import Optimizer from "./pages/Optimizer";
import Risk from "./pages/Risk";
import Backtest from "./pages/Backtest";
import Models from "./pages/Models";
import AssetDetail from "./pages/AssetDetail";
import { Alerts, DataCenter, Execution, Monitoring, Settings } from "./pages/Ops";

import Copilot from "./pages/Copilot";
import PortfolioAnalysis from "./pages/PortfolioAnalysis";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ZerodhaIntegration from "./pages/ZerodhaIntegration";
import MARLOrchestrator from "./pages/MARLOrchestrator";
import DLTradingStudio from "./pages/DLTradingStudio";
import CausalAgenticStudio from "./pages/CausalAgenticStudio";
import SovereignStudio from "./pages/SovereignStudio";
import TDAQuantumStudio from "./pages/TDAQuantumStudio";
import UniversalMarketStudio from "./pages/UniversalMarketStudio";
import VisualDL10Studio from "./pages/VisualDL10Studio";
import AutonomousV30Studio from "./pages/AutonomousV30Studio";
import WorldModelV31Studio from "./pages/WorldModelV31Studio";
import PostQuantumV32Studio from "./pages/PostQuantumV32Studio";
import SovereignV33Studio from "./pages/SovereignV33Studio";
import SovereignV34Studio from "./pages/SovereignV34Studio";
import SingularityV35Studio from "./pages/SingularityV35Studio";
import MultiverseV36Studio from "./pages/MultiverseV36Studio";
import OmniV37Studio from "./pages/OmniV37Studio";
import OmniV38Studio from "./pages/OmniV38Studio";
import OmniV39Studio from "./pages/OmniV39Studio";
import OmniV40Studio from "./pages/OmniV40Studio";



function NotFound({ path }: { path: string }) {
  return (
    <Panel level={3}>
      <EmptyState
        icon={Compass}
        title="Route not found"
        body={`No module is mapped to “${path}”. Use ⌘K to search the workspace, or return to the executive command center.`}
        action={<Link to="/dashboard"><Button size="sm" variant="primary">Open Overview</Button></Link>}
      />
    </Panel>
  );
}

function Routes() {
  const { path } = useRouter();
  const { user, loading } = useAuth();

  if (path === "/" || path === "") return <Landing />;
  if (path === "/signin") return <Auth mode="signin" />;
  if (path === "/signup") return <Auth mode="signup" />;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg text-[12px] text-txt-muted gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-acc border-t-transparent" />
        <span className="font-mono text-[11px] text-txt-secondary">Loading secure workspace…</span>
      </div>
    );
  }

  if (!user) return <Auth mode="signin" />;

  let page: React.ReactNode;
  if (path === "/dashboard") page = <Dashboard />;
  else if (path === "/markets") page = <Markets />;
  else if (path === "/research") page = <Research />;
  else if (path === "/research/alpha") page = <AlphaLab />;
  else if (path === "/portfolio") page = <Portfolio />;
  else if (path === "/integrations/zerodha") page = <ZerodhaIntegration />;
  else if (path === "/portfolio/analysis") page = <PortfolioAnalysis />;
  else if (path === "/portfolio/optimizer") page = <Optimizer />;
  else if (path === "/risk") page = <Risk />;
  else if (path === "/backtest") page = <Backtest />;
  else if (path === "/execution") page = <Execution />;
  else if (path === "/models") page = <Models />;
  else if (path === "/marl") page = <MARLOrchestrator />;
  else if (path === "/dl-trading") page = <DLTradingStudio />;
  else if (path === "/causal-ai") page = <CausalAgenticStudio />;
  else if (path === "/sovereign-ai") page = <SovereignStudio />;
  else if (path === "/tda-quantum") page = <TDAQuantumStudio />;
  else if (path === "/universal-market") page = <UniversalMarketStudio />;
  else if (path === "/visual-dl10") page = <VisualDL10Studio />;
  else if (path === "/autonomous-v30") page = <AutonomousV30Studio />;
  else if (path === "/world-model-v31") page = <WorldModelV31Studio />;
  else if (path === "/post-quantum-v32") page = <PostQuantumV32Studio />;
  else if (path === "/sovereign-v33") page = <SovereignV33Studio />;
  else if (path === "/sovereign-v34") page = <SovereignV34Studio />;
  else if (path === "/singularity-v35") page = <SingularityV35Studio />;
  else if (path === "/multiverse-v36") page = <MultiverseV36Studio />;
  else if (path === "/omni-v37") page = <OmniV37Studio />;
  else if (path === "/omni-v38") page = <OmniV38Studio />;
  else if (path === "/omni-v39") page = <OmniV39Studio />;
  else if (path === "/omni-v40") page = <OmniV40Studio />;

  else if (path === "/data") page = <DataCenter />;
  else if (path === "/copilot") page = <Copilot />;
  else if (path === "/alerts") page = <Alerts />;
  else if (path === "/monitoring") page = <Monitoring />;
  else if (path === "/settings") page = <Settings />;
  else if (path === "/profile") page = <Profile />;
  else if (path.startsWith("/assets/")) page = <AssetDetail ticker={decodeURIComponent(path.split("/")[2] ?? "")} />;
  else page = <NotFound path={path} />;

  return (
    <AppShell>
      <div key={path} className="anim-fade">{page}</div>
    </AppShell>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider><ToastProvider><Routes /></ToastProvider></AuthProvider>
    </RouterProvider>
  );
}
