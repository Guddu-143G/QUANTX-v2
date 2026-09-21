import React, { useState, useEffect } from "react";
import {
  v34Service,
  type DnaEncodeResponse,
  type DnaDecodeResponse,
  type DnaVaultRecord,
  type DnaMetrics,
} from "../../services/v34";
import { num } from "../../lib/format";
import {
  Dna,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  Binary,
  Layers,
  Flame,
  Clock,
  ArrowRightLeft,
} from "lucide-react";

export const BiologicalDNAArchivalVault: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [encodeData, setEncodeData] = useState<DnaEncodeResponse | null>(null);
  const [decodeData, setDecodeData] = useState<DnaDecodeResponse | null>(null);
  const [vaultRecords, setVaultRecords] = useState<DnaVaultRecord[]>([]);
  const [payloadText, setPayloadText] = useState<string>(
    "QUANTX_TRADE_AUDIT_VERIFIED_95VAR_PASS_2026_09_17"
  );
  const [ticker, setTicker] = useState<string>("RELIANCE");
  const [notionalInr, setNotionalInr] = useState<number>(12500000.0);
  const [error, setError] = useState<string | null>(null);

  const handleEncode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await v34Service.encodeDnaSequence(payloadText);
      setEncodeData(res);
      setDecodeData(null);
    } catch (err: any) {
      setError(err.message || "Failed to encode DNA sequence.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async (seq: string) => {
    setDecoding(true);
    try {
      const res = await v34Service.decodeDnaSequence(seq);
      setDecodeData(res);
    } catch (err: any) {
      setError(err.message || "Failed to decode DNA sequence.");
    } finally {
      setDecoding(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const res = await v34Service.archiveDnaTradeAudit(
        `ORD-INST-${Math.floor(1000 + Math.random() * 9000)}`,
        ticker,
        notionalInr,
        "zk-snark-0x8f92b4"
      );
      setVaultRecords((prev) => [res.record, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to archive to DNA vault.");
    } finally {
      setArchiving(false);
    }
  };

  const fetchVault = async () => {
    try {
      const data = await v34Service.getDnaVaultRecords();
      setVaultRecords(data);
    } catch (err: any) {
      console.error("Failed to fetch DNA vault:", err);
    }
  };

  useEffect(() => {
    handleEncode();
    fetchVault();
  }, []);

  const getBaseColor = (base: string) => {
    switch (base) {
      case "A":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "C":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "G":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "T":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Dna className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Biological DNA Data Archival & Wetware Storage Vault
              </h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400">
                Goldman Constellation · 10,000-Year Durability
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Encodes microsecond trade logs, risk vectors, and zk-SNARK solvency proofs into synthetic DNA oligonucleotides with rotating nucleotide mapping to eliminate homopolymer sequencing errors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-purple-500/10 px-2.5 py-1 text-xs font-mono text-purple-300 border border-purple-500/20">
              <HardDrive className="h-3.5 w-3.5" />
              215 Petabytes / Gram Density
            </span>
          </div>
        </div>

        {/* Telemetry KPIs */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded border border-line-subtle bg-bg-primary p-3">
            <span className="text-[11px] uppercase tracking-wider text-text-muted">Volumetric Density</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-mono font-semibold text-emerald-400">215</span>
              <span className="text-xs text-text-muted">PB/g</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-muted">Millions of years vs magnetic tape</p>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-3">
            <span className="text-[11px] uppercase tracking-wider text-text-muted">Shelf Life</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-mono font-semibold text-cyan-400">10,000+</span>
              <span className="text-xs text-text-muted">Years</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-muted">Zero bit-rot room temp storage</p>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-3">
            <span className="text-[11px] uppercase tracking-wider text-text-muted">Error Correction</span>
            <div className="mt-1 text-xs font-mono font-semibold text-purple-300 truncate">
              RS(255, 223) GF(2^8)
            </div>
            <p className="mt-0.5 text-[10px] text-text-muted">Up to 12% strand loss recovery</p>
          </div>

          <div className="rounded border border-line-subtle bg-bg-primary p-3">
            <span className="text-[11px] uppercase tracking-wider text-text-muted">Melting Temp (Tm)</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-mono font-semibold text-amber-400">
                {encodeData?.metrics?.melting_temp_celsius || 64.5}
              </span>
              <span className="text-xs text-text-muted">°C</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-muted">Biochemical thermal stability</p>
          </div>
        </div>
      </div>

      {/* ── Interactive DNA Synthesis & Decoding Studio ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Encoding Input */}
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <Binary className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-text-primary">
                Oligonucleotide Encoder
              </h3>
            </div>
            <span className="text-xs font-mono text-text-muted">
              Binary → Quaternary (A,C,G,T)
            </span>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              Audit Data / Trade Payload:
            </label>
            <textarea
              rows={3}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary p-2.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEncode}
              disabled={loading}
              className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Synthesize DNA Sequence
            </button>

            {encodeData && (
              <button
                onClick={() => handleDecode(encodeData.dna_sequence)}
                disabled={decoding}
                className="flex items-center gap-1.5 rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition disabled:opacity-50"
              >
                <ArrowRightLeft className={`h-3.5 w-3.5 ${decoding ? "animate-spin" : ""}`} />
                Lossless Reverse Decode
              </button>
            )}
          </div>

          {decodeData && (
            <div className="rounded border border-cyan-500/30 bg-cyan-500/10 p-3 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Decoded Result: 100% Lossless Recovery
                </span>
                <span>{decodeData.byte_count} Bytes</span>
              </div>
              <div className="text-xs font-mono text-text-primary break-all bg-bg-primary/60 p-2 rounded">
                {decodeData.decoded_text}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right: Nucleotide Constellation Sequence Preview */}
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <Dna className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-text-primary">
                Synthesized Nucleotide Strand
              </h3>
            </div>
            {encodeData && (
              <span className="text-xs font-mono text-text-muted">
                {encodeData.oligomer_length} Bases | GC: {encodeData.metrics.gc_content_pct}%
              </span>
            )}
          </div>

          {encodeData ? (
            <div className="space-y-3">
              {/* Base Badges Container */}
              <div className="rounded border border-line-subtle bg-bg-primary p-3 max-h-[140px] overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-wrap gap-1">
                {encodeData.dna_sequence.split("").slice(0, 120).map((base, idx) => (
                  <span
                    key={idx}
                    className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold ${getBaseColor(
                      base
                    )}`}
                  >
                    {base}
                  </span>
                ))}
                {encodeData.dna_sequence.length > 120 && (
                  <span className="text-text-muted text-[10px] self-center">
                    + {encodeData.dna_sequence.length - 120} more bases
                  </span>
                )}
              </div>

              {/* Base Distribution Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="rounded border border-amber-500/20 bg-amber-500/5 p-1.5">
                  <span className="text-amber-400 font-bold">Adenine (A)</span>
                  <div className="text-[11px] text-text-muted">
                    {encodeData.metrics.base_distribution.A} ({((encodeData.metrics.base_distribution.A / encodeData.oligomer_length) * 100).toFixed(1)}%)
                  </div>
                </div>
                <div className="rounded border border-cyan-500/20 bg-cyan-500/5 p-1.5">
                  <span className="text-cyan-400 font-bold">Cytosine (C)</span>
                  <div className="text-[11px] text-text-muted">
                    {encodeData.metrics.base_distribution.C} ({((encodeData.metrics.base_distribution.C / encodeData.oligomer_length) * 100).toFixed(1)}%)
                  </div>
                </div>
                <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-1.5">
                  <span className="text-emerald-400 font-bold">Guanine (G)</span>
                  <div className="text-[11px] text-text-muted">
                    {encodeData.metrics.base_distribution.G} ({((encodeData.metrics.base_distribution.G / encodeData.oligomer_length) * 100).toFixed(1)}%)
                  </div>
                </div>
                <div className="rounded border border-rose-500/20 bg-rose-500/5 p-1.5">
                  <span className="text-rose-400 font-bold">Thymine (T)</span>
                  <div className="text-[11px] text-text-muted">
                    {encodeData.metrics.base_distribution.T} ({((encodeData.metrics.base_distribution.T / encodeData.oligomer_length) * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-text-muted">
              Click "Synthesize DNA Sequence" to preview nucleotide strands.
            </div>
          )}
        </div>
      </div>

      {/* ── Immutable DNA Vault Records ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Immutable DNA Vault Archival Blotter
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-24 rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary"
            />
            <input
              type="number"
              placeholder="Notional"
              value={notionalInr}
              onChange={(e) => setNotionalInr(parseFloat(e.target.value) || 0)}
              className="w-28 rounded border border-line-subtle bg-bg-primary px-2 py-1 text-xs font-mono text-text-primary"
            />
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="rounded bg-purple-600 hover:bg-purple-500 px-3 py-1 text-xs font-medium text-white transition disabled:opacity-50"
            >
              Vault Trade Audit
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-line-subtle bg-bg-primary text-text-muted">
                <th className="p-2.5">Archive ID</th>
                <th className="p-2.5">Order ID</th>
                <th className="p-2.5">Ticker</th>
                <th className="p-2.5">Notional (₹)</th>
                <th className="p-2.5">Oligomer Bases</th>
                <th className="p-2.5">GC Content</th>
                <th className="p-2.5">Melting Temp</th>
                <th className="p-2.5">Durability</th>
                <th className="p-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {vaultRecords.map((r) => (
                <tr key={r.archive_id} className="hover:bg-bg-tertiary/40 transition">
                  <td className="p-2.5 font-bold text-purple-400">{r.archive_id}</td>
                  <td className="p-2.5 text-text-primary">{r.order_id}</td>
                  <td className="p-2.5 font-semibold text-emerald-400">{r.ticker}</td>
                  <td className="p-2.5">₹{num(r.notional_inr)}</td>
                  <td className="p-2.5">{r.oligomer_length_bases} bp</td>
                  <td className="p-2.5">{r.gc_content_pct}%</td>
                  <td className="p-2.5">{r.melting_temp_c}°C</td>
                  <td className="p-2.5">
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20">
                      {r.durability_years} yrs
                    </span>
                  </td>
                  <td className="p-2.5 text-text-muted text-[11px]">{new Date(r.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
