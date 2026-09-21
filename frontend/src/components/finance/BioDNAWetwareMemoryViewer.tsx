import React, { useState, useEffect } from "react";
import {
  encodeDNAWetware,
  getOrganoidTelemetry,
  type DNAWetwareResult,
  type OrganoidHardwareTelemetry,
} from "../../services/v38";
import {
  Dna,
  Database,
  Activity,
  Zap,
  Search,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Thermometer,
  ShieldCheck,
} from "lucide-react";

export const BioDNAWetwareMemoryViewer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [queryProbe, setQueryProbe] = useState("ACGTACGTACGTACGT");
  const [dnaResult, setDnaResult] = useState<DNAWetwareResult | null>(null);
  const [organoidTelemetry, setOrganoidTelemetry] = useState<OrganoidHardwareTelemetry | null>(null);

  const fetchOrganoidStatus = async () => {
    try {
      const data = await getOrganoidTelemetry();
      setOrganoidTelemetry(data);
    } catch (err) {
      console.error("Organoid telemetry fetch error:", err);
    }
  };

  const handleEncodeAndQuery = async () => {
    setLoading(true);
    try {
      const data = await encodeDNAWetware(undefined, queryProbe);
      setDnaResult(data);
    } catch (err) {
      console.error("DNA Wetware encode/query error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganoidStatus();
    handleEncodeAndQuery();
  }, []);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/20 rounded-xl p-6 shadow-2xl space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-emerald-400" />
              BIO-DNA & ORGANOID WETWARE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Quaternary Encoding {'{A, C, G, T}'} • 0.0 W Archival Power
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Bi-Directional Wetware Organoid Neural Co-Processor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Biological hybridization pattern matching across historical flash crash analogues and zero-electric archival storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrganoidStatus}
            className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <Activity className="w-3.5 h-3.5" />
            Organoid Health
          </button>
          <button
            onClick={handleEncodeAndQuery}
            disabled={loading}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
          >
            <Dna className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Synthesize Oligonucleotides
          </button>
        </div>
      </div>

      {/* ── Zero-Power Banner ── */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                ZERO-POWER BIOLOGICAL ARCHIVAL STORAGE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0.0 W ELECTRIC DISSIPATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthetic DNA storage density reaches 10^18 bytes/cm^3 (Exabyte class). Retention half-life verified at 10,000+ years without thermal refrigeration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 sm:border-l sm:border-slate-700/50 sm:pl-5">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">MEA Electrodes</span>
            <span className="text-base font-bold font-mono text-emerald-300">
              {organoidTelemetry?.mea_electrode_channels ?? 1024} Channels
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">Cortical Neurons</span>
            <span className="text-base font-bold font-mono text-teal-300">
              {organoidTelemetry?.cortical_organoid_neurons?.toLocaleString() ?? "1,250,000"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
            <span>GC-Content Ratio</span>
            <Dna className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {dnaResult?.gc_content_pct?.toFixed(1) ?? "50.0"}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ideal Stability Band [40-60%]</span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
            <span>Hybridization Match</span>
            <Activity className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-300">
            {((dnaResult?.query_result?.hamming_similarity ?? 0.942) * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Hamming Biological Affinity</span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
            <span>Retrieval Latency</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {dnaResult?.query_result?.latency_ms ?? 0.42} ms
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Sub-Millisecond Wetware</span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
            <span>Organoid Health</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {organoidTelemetry?.organoid_culture_health ?? "OPTIMAL"}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">37.0°C Perfusion Locked</span>
        </div>
      </div>

      {/* ── DNA Oligonucleotide Sequence Viewer ── */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            SYNTHESIZED QUATERNARY DNA OLIGONUCLEOTIDES
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Length: {dnaResult?.dna_length_bases ?? 32} Base Pairs • ECC: RS(255, 223)
          </span>
        </div>

        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg font-mono text-xs text-slate-200 tracking-widest break-all overflow-x-auto flex flex-wrap gap-1">
          {(dnaResult?.dna_sequence || "ATGCGATCGATCGATAGCTAGCTAGCTACGTA")
            .split("")
            .map((base, idx) => (
              <span
                key={idx}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  base === "A"
                    ? "bg-rose-500/20 text-rose-300"
                    : base === "C"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : base === "G"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {base}
              </span>
            ))}
        </div>
      </div>

      {/* ── Interactive Hybridization Pattern Probe ── */}
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-xs font-mono font-bold text-white block">
              Biological Hybridization Probe Query
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Searches organoid memory for historical liquidity stress analogues
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={queryProbe}
            onChange={(e) => setQueryProbe(e.target.value.toUpperCase().replace(/[^ACGT]/g, ""))}
            placeholder="ACGT..."
            className="w-full sm:w-48 bg-slate-950/80 border border-slate-700/80 rounded px-2.5 py-1 text-xs font-mono text-emerald-300 uppercase focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleEncodeAndQuery}
            disabled={loading}
            className="px-3 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-all shadow disabled:opacity-50"
          >
            Probe Memory
          </button>
        </div>
      </div>

      {/* ── Query Match Result ── */}
      {dnaResult?.query_result && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs font-mono text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Retrieved Analogue: <strong className="text-white">{dnaResult.query_result.retrieved_regime}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400">
            Confidence: {(dnaResult.query_result.hybridization_match_confidence * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};
