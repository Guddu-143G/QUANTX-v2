import { RouterProvider, useRouter } from "./lib/router";
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

  if (path === "/" || path === "") return <Landing />;

  let page: React.ReactNode;
  if (path === "/dashboard") page = <Dashboard />;
  else if (path === "/markets") page = <Markets />;
  else if (path === "/research") page = <Research />;
  else if (path === "/research/alpha") page = <AlphaLab />;
  else if (path === "/portfolio") page = <Portfolio />;
  else if (path === "/portfolio/optimizer") page = <Optimizer />;
  else if (path === "/risk") page = <Risk />;
  else if (path === "/backtest") page = <Backtest />;
  else if (path === "/execution") page = <Execution />;
  else if (path === "/models") page = <Models />;
  else if (path === "/data") page = <DataCenter />;
  else if (path === "/copilot") page = <Copilot />;
  else if (path === "/alerts") page = <Alerts />;
  else if (path === "/monitoring") page = <Monitoring />;
  else if (path === "/settings") page = <Settings />;
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
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </RouterProvider>
  );
}
