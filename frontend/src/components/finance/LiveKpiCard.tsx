import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

type Tone = "pos" | "neg" | "warn" | "neu";

interface LiveKpiCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  change?: string;
  flash?: boolean;
}

const toneClasses: Record<Tone, string> = {
  pos: "text-pos",
  neg: "text-neg",
  warn: "text-warn",
  neu: "text-txt-primary",
};

const flashClasses: Record<Tone, string> = {
  pos: "ring-1 ring-pos/40 bg-pos/5",
  neg: "ring-1 ring-neg/40 bg-neg/5",
  warn: "ring-1 ring-warn/40 bg-warn/5",
  neu: "ring-1 ring-acc/20 bg-acc/3",
};

export function LiveKpiCard({ label, value, sub, tone = "neu", change, flash = false }: LiveKpiCardProps) {
  const [flashing, setFlashing] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 800);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div
      className={cn(
        "rounded-[8px] border border-line-subtle bg-surface/60 px-3 py-2.5 transition-all duration-300",
        flashing && flash && flashClasses[tone],
      )}
    >
      <div className="label-xs truncate text-txt-muted">{label}</div>
      <div className={cn("tnum mt-1 text-[17px] font-semibold leading-none tracking-[-0.02em] transition-colors duration-300", toneClasses[tone])}>
        {value}
      </div>
      {(sub || change) && (
        <div className="mt-1.5 flex items-center gap-1.5">
          {change && (
            <span className={cn("mono text-[9.5px] font-medium", tone === "pos" ? "text-pos" : tone === "neg" ? "text-neg" : "text-txt-disabled")}>
              {change}
            </span>
          )}
          {sub && <span className="truncate text-[9.5px] text-txt-disabled">{sub}</span>}
        </div>
      )}
      {flashing && flash && (
        <div className={cn("mt-1 h-px w-full rounded-full opacity-60 transition-opacity", tone === "pos" ? "bg-pos" : tone === "neg" ? "bg-neg" : "bg-warn")} />
      )}
    </div>
  );
}
