import React from "react";
import { Cpu } from "lucide-react";

interface SkeletonLoaderProps {
  height?: string;
  title?: string;
  subtitle?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = "400px",
  title = "Loading QuantX Engine...",
  subtitle = "Hydrating stateless quantitative buffers and mathematical models",
}) => {
  return (
    <div
      style={{ minHeight: height }}
      className="w-full rounded-xl border border-line-subtle bg-surface-1/60 p-6 flex flex-col items-center justify-center text-center animate-pulse gap-4"
    >
      <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center border border-white/10">
        <Cpu className="w-6 h-6 text-txt-muted animate-spin" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-txt-primary tracking-wide font-mono">{title}</h4>
        <p className="text-xs text-txt-muted mt-1 max-w-md">{subtitle}</p>
      </div>
      <div className="w-48 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div className="h-full bg-acc/60 rounded-full w-2/3 animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonLoader;
