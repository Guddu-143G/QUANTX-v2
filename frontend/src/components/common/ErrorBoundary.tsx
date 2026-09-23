import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Self-Healing React Error Boundary for QUANTX modules.
 * Isolates runtime exceptions (e.g. hydration mismatches, null pointers in .map(), WebGL errors)
 * preventing entire white-screen application crashes.
 */
export class QuantXErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("QUANTX Module Runtime Exception Caught by QuantXErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public resetBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-950/20 border border-red-800/50 rounded-xl text-center my-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-lg mb-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>{this.props.fallbackTitle || "QUANTX Module Runtime Isolation Notice"}</span>
          </div>
          <p className="text-gray-300 text-sm mb-3 max-w-xl mx-auto">
            {this.state.error?.message ||
              "A data evaluation or hydration exception occurred. The module has safely isolated this view."}
          </p>
          <p className="text-gray-500 text-xs mb-4">
            Component stack isolated to prevent whole-system downtime. You can safely reset this module state.
          </p>
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={this.resetBoundary}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Module State
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-200 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-white/10"
            >
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default QuantXErrorBoundary;
