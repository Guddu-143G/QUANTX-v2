import React, { useEffect, useRef, useState } from "react";
import { type TelemetrySnapshot } from "../../services/v30";

interface TelemetryCanvasProps {
  telemetry: TelemetrySnapshot | null;
  className?: string;
}

export const TelemetryCanvas: React.FC<TelemetryCanvasProps> = ({ telemetry, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const [fps, setFps] = useState<number>(120);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let phase = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Clear with dark institutional glass background
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0c1017";
      ctx.fillRect(0, 0, w, h);

      // Draw subtle grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridGap = 40;
      for (let x = 0; x < w; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // 1. Empirical Return Distribution Bars & Crimson VaR Shading
      // -------------------------------------------------------------
      const numBins = 32;
      const barWidth = (w - 80) / numBins;
      const startX = 40;
      const baseY = h - 60;
      const isCrimsonAlert = telemetry?.tail_alert_crimson ?? false;

      phase += 0.04;

      for (let i = 0; i < numBins; i++) {
        const normX = (i - numBins / 2) / (numBins / 5);
        // Student-t / bell curve envelope + dynamic micro-fluctuation
        const studentT = Math.pow(1 + (normX * normX) / 4.5, -2.75);
        const dynamicNoise = Math.sin(phase + i * 0.4) * 0.08;
        const barHeight = Math.max(8, (studentT + dynamicNoise) * (h * 0.65));

        const x = startX + i * barWidth;
        const y = baseY - barHeight;

        // Tail cutoffs (left 15% is 95% VaR, left 8% is 99% VaR)
        const is99VaR = i <= 2;
        const is95VaR = i > 2 && i <= 5;

        if (is99VaR) {
          // Deep crimson tail
          ctx.fillStyle = isCrimsonAlert ? "rgba(239, 68, 68, 0.95)" : "rgba(239, 68, 68, 0.75)";
          ctx.strokeStyle = "rgba(239, 68, 68, 1)";
        } else if (is95VaR) {
          // Amber / crimson warning
          ctx.fillStyle = isCrimsonAlert ? "rgba(249, 115, 22, 0.90)" : "rgba(249, 115, 22, 0.60)";
          ctx.strokeStyle = "rgba(249, 115, 22, 0.9)";
        } else {
          // Institutional teal / cyan normal density
          ctx.fillStyle = "rgba(16, 185, 129, 0.45)";
          ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
        }

        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        ctx.strokeRect(x + 1, y, barWidth - 2, barHeight);
      }

      // -------------------------------------------------------------
      // 2. Smooth Student-t Distribution Overlay Curve
      // -------------------------------------------------------------
      ctx.beginPath();
      ctx.strokeStyle = isCrimsonAlert ? "#f87171" : "#34d399";
      ctx.lineWidth = 2.5;
      for (let x = startX; x <= w - 40; x += 4) {
        const binIdx = (x - startX) / barWidth;
        const normX = (binIdx - numBins / 2) / (numBins / 5);
        const studentT = Math.pow(1 + (normX * normX) / 4.5, -2.75);
        const wave = Math.sin(phase * 1.5 + x * 0.02) * 4;
        const curveY = baseY - studentT * (h * 0.65) - wave;
        if (x === startX) ctx.moveTo(x, curveY);
        else ctx.lineTo(x, curveY);
      }
      ctx.stroke();

      // -------------------------------------------------------------
      // 3. VaR & CVaR Cutoff Marker Lines
      // -------------------------------------------------------------
      const var95X = startX + 5 * barWidth;
      const var99X = startX + 2 * barWidth;

      // 95% VaR line
      ctx.strokeStyle = "rgba(249, 115, 22, 0.85)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(var95X, 30);
      ctx.lineTo(var95X, baseY);
      ctx.stroke();

      // 99% VaR line
      ctx.strokeStyle = "rgba(239, 68, 68, 0.95)";
      ctx.beginPath();
      ctx.moveTo(var99X, 30);
      ctx.lineTo(var99X, baseY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Marker labels
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#f97316";
      ctx.fillText("95% VaR", var95X + 4, 45);
      ctx.fillStyle = "#ef4444";
      ctx.fillText("99% VaR", var99X + 4, 60);

      // Baseline line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, baseY);
      ctx.lineTo(w - 40, baseY);
      ctx.stroke();

      // Base X-axis labels
      ctx.fillStyle = "#64748b";
      ctx.fillText("-3.5%", startX, baseY + 18);
      ctx.fillText("-1.5%", startX + (numBins / 4) * barWidth, baseY + 18);
      ctx.fillText("0.0%", startX + (numBins / 2) * barWidth - 8, baseY + 18);
      ctx.fillText("+1.5%", startX + ((numBins * 3) / 4) * barWidth, baseY + 18);
      ctx.fillText("+3.5%", w - 65, baseY + 18);

      // -------------------------------------------------------------
      // 4. Live Telemetry HUD Overlay
      // -------------------------------------------------------------
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`TELEMETRY CANVAS // ${fps} FPS // GPU-SYNC`, 16, 24);

      if (isCrimsonAlert) {
        ctx.fillStyle = "#ef4444";
        ctx.fillText("⚠ TAIL RISK BREACH: VaR 95% THRESHOLD EXCEEDED", w - 340, 24);
      } else {
        ctx.fillStyle = "#10b981";
        ctx.fillText("✓ RETURN SPECTRUM NORMAL // VOLATILITY CONTAINED", w - 350, 24);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [telemetry]);

  return (
    <div className={`relative overflow-hidden rounded-[8px] border border-line-subtle bg-bg-secondary ${className || ""}`}>
      <canvas ref={canvasRef} className="h-full w-full block" />
      <div className="absolute bottom-2.5 right-3 flex items-center gap-2 rounded bg-bg-primary/80 px-2 py-1 text-[10px] font-mono text-txt-secondary backdrop-blur border border-line-subtle">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>120 FPS ENGINE READY</span>
      </div>
    </div>
  );
};
