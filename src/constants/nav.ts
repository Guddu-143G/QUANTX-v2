import {
  Activity, Atom, Bell, Boxes, Braces, Database, FlaskConical, Gauge, LayoutDashboard,
  LineChart, Newspaper, Scale, Settings, ShieldAlert, Sparkles, Wallet, Zap,
} from "lucide-react";

export type NavItem = { label: string; to: string; icon: React.ElementType; badge?: string; tone?: "pos" | "warn" | "neg" };

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
      { label: "Markets", to: "/markets", icon: LineChart },
      { label: "Research", to: "/research", icon: Newspaper },
      { label: "Alpha Lab", to: "/research/alpha", icon: FlaskConical },
      { label: "Portfolio", to: "/portfolio", icon: Wallet },
      { label: "Optimization", to: "/portfolio/optimizer", icon: Scale },
      { label: "Risk", to: "/risk", icon: ShieldAlert, badge: "1", tone: "neg" },
      { label: "Backtesting", to: "/backtest", icon: Atom },
      { label: "Execution", to: "/execution", icon: Zap },
      { label: "Models", to: "/models", icon: Boxes },
      { label: "Data", to: "/data", icon: Database },
      { label: "AI Copilot", to: "/copilot", icon: Sparkles, badge: "AI", tone: "pos" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Alerts", to: "/alerts", icon: Bell, badge: "4", tone: "warn" },
      { label: "Monitoring", to: "/monitoring", icon: Activity },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

export const ROUTE_TITLES: Record<string, string[]> = {
  "/dashboard": ["Workspace", "Overview"],
  "/markets": ["Workspace", "Markets"],
  "/research": ["Workspace", "Research", "News & Sentiment"],
  "/research/alpha": ["Workspace", "Research", "Alpha Lab"],
  "/portfolio": ["Workspace", "Portfolio"],
  "/portfolio/optimizer": ["Workspace", "Portfolio", "Optimizer"],
  "/risk": ["Workspace", "Risk Command Center"],
  "/backtest": ["Workspace", "Backtesting Studio"],
  "/execution": ["Workspace", "Execution"],
  "/models": ["Workspace", "Model Monitoring"],
  "/data": ["Workspace", "Data Quality Center"],
  "/copilot": ["Workspace", "Quant Copilot"],
  "/alerts": ["System", "Alerts"],
  "/monitoring": ["System", "Monitoring"],
  "/settings": ["System", "Settings"],
};

export type Command = { id: string; label: string; hint?: string; group: string; to?: string; action?: string; icon: React.ElementType; keywords?: string };

export const COMMANDS: Command[] = [
  { id: "c1", label: "Open Overview", group: "Navigation", to: "/dashboard", icon: LayoutDashboard, keywords: "dashboard home command center" },
  { id: "c2", label: "Open Portfolio Risk", group: "Navigation", to: "/risk", icon: ShieldAlert, keywords: "var cvar beta stress" },
  { id: "c3", label: "Open Alpha Lab", group: "Navigation", to: "/research/alpha", icon: FlaskConical, keywords: "factor momentum value quality" },
  { id: "c4", label: "Open Portfolio Optimizer", group: "Navigation", to: "/portfolio/optimizer", icon: Scale, keywords: "efficient frontier constraints" },
  { id: "c5", label: "Open Backtesting Studio", group: "Navigation", to: "/backtest", icon: Atom, keywords: "simulate strategy equity curve" },
  { id: "c6", label: "Open Model Monitoring", group: "Navigation", to: "/models", icon: Boxes, keywords: "mlops drift xgb finbert" },
  { id: "c7", label: "Open Data Quality Center", group: "Navigation", to: "/data", icon: Database, keywords: "feeds coverage freshness" },
  { id: "c8", label: "Open Quant Copilot", group: "Navigation", to: "/copilot", icon: Sparkles, keywords: "ai assistant research" },
  { id: "c9", label: "Open Markets", group: "Navigation", to: "/markets", icon: LineChart, keywords: "indices heatmap breadth" },
  { id: "c10", label: "Open Execution Blotter", group: "Navigation", to: "/execution", icon: Zap, keywords: "orders fills slippage algo" },

  { id: "a1", label: "Run Backtest", hint: "Momentum-Quality Composite", group: "Actions", to: "/backtest", action: "run-backtest", icon: Atom },
  { id: "a2", label: "Optimize Portfolio", hint: "Max Sharpe under constraints", group: "Actions", to: "/portfolio/optimizer", action: "optimize", icon: Scale },
  { id: "a3", label: "Show today's alpha", hint: "Ranked cross-sectional signals", group: "Actions", to: "/dashboard", icon: Gauge },
  { id: "a4", label: "Explain drawdown", hint: "Ask Copilot", group: "Actions", to: "/copilot", action: "ask:Explain the March drawdown", icon: Sparkles },
  { id: "a5", label: "Compare portfolio vs NIFTY", hint: "Ask Copilot", group: "Actions", to: "/copilot", action: "ask:Compare portfolio vs NIFTY 50 YTD", icon: Sparkles },
  { id: "a6", label: "Run stress test", hint: "Scenario library", group: "Actions", to: "/risk", action: "stress", icon: ShieldAlert },
  { id: "a7", label: "Toggle environment", hint: "Paper ⇄ Live", group: "Actions", action: "toggle-env", icon: Braces },
];
