import React, { useState, useEffect } from "react";
import {
  type ZkComplianceProofResponse,
  type ZkVerificationResult,
  worldModelV31Service,
} from "../../services/v31";
import { inr, inrCompact, pct, num } from "../../lib/format";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Eye,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Award,
  Hash,
  Copy,
  Download,
  Key,
} from "lucide-react";

export const ZkAuditPanel: React.FC = () => {
  const [loadingProof, setLoadingProof] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [proofData, setProofData] = useState<ZkComplianceProofResponse | null>(null);
  const [verificationResult, setVerificationResult] = useState<ZkVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [userAum, setUserAum] = useState<number>(50000000); // 5 Cr
  const [portfolioVar95, setPortfolioVar95] = useState<number>(1850000); // 18.5 L
  const [maxVarLimit, setMaxVarLimit] = useState<number>(2500000); // 25 L
  const [maxPosWeight, setMaxPosWeight] = useState<number>(0.095); // 9.5%
  const [capitalTier, setCapitalTier] = useState<string>("TIER_1_LARGE_CAP");
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateProof = async () => {
    setLoadingProof(true);
    setError(null);
    setVerificationResult(null);
    try {
      const res = await worldModelV31Service.generateZkProof({
        user_aum: userAum,
        portfolio_var_95_inr: portfolioVar95,
        max_var_limit_inr: maxVarLimit,
        max_position_weight: maxPosWeight,
        capital_tier: capitalTier,
      });
      setProofData(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate zk-SNARK compliance proof.");
    } finally {
      setLoadingProof(false);
    }
  };

  const verifyProof = async () => {
    if (!proofData) return;
    setLoadingVerify(true);
    try {
      const res = await worldModelV31Service.verifyZkProof({
        proof_commitments: proofData.proof_commitments,
        public_inputs: proofData.public_inputs,
      });
      setVerificationResult(res);
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoadingVerify(false);
    }
  };

  useEffect(() => {
    generateProof();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Control Header ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
                <Lock className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Zero-Knowledge Regulatory Compliance Proof Generator
              </h2>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-400">
                zk-Audit (Halo2 / Groth16)
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Mathematically proves $95\%$ 1-Day VaR and single-position caps to SEBI/RBI auditors without revealing portfolio weights or proprietary alpha signals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={generateProof}
              disabled={loadingProof}
              className="flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingProof ? "animate-spin" : ""}`} />
              {loadingProof ? "Synthesizing Circuit..." : "Generate zk-SNARK Proof"}
            </button>
          </div>
        </div>

        {/* ── Audit Parameter Inputs ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="text-[11px] font-medium text-text-muted">Portfolio AUM (₹)</label>
            <input
              type="number"
              value={userAum}
              onChange={(e) => setUserAum(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Portfolio 1D 95% VaR (₹)</label>
            <input
              type="number"
              value={portfolioVar95}
              onChange={(e) => setPortfolioVar95(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Regulatory Max VaR (₹)</label>
            <input
              type="number"
              value={maxVarLimit}
              onChange={(e) => setMaxVarLimit(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Max Single Position Cap</label>
            <select
              value={maxPosWeight}
              onChange={(e) => setMaxPosWeight(parseFloat(e.target.value))}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-amber-500 focus:outline-none"
            >
              <option value={0.08}>8.0% (Conservative)</option>
              <option value={0.095}>9.5% (Tier 1 Large Cap Standard)</option>
              <option value={0.12}>12.0% (Tier 1 Maximum Cap)</option>
              <option value={0.15}>15.0% (Breach Condition)</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      {/* ── Zero-Knowledge Information Architecture ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Public Inputs (Visible to Auditor) */}
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-text-primary">
                Public Inputs (Disclosed to Auditor)
              </h3>
            </div>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-400 border border-cyan-500/30">
              AUDITOR READABLE
            </span>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
              <span className="text-text-muted">Portfolio AUM:</span>
              <span className="font-bold text-text-primary">{inrCompact(userAum)} ({inr(userAum, 0)})</span>
            </div>
            <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
              <span className="text-text-muted">1-Day 95% VaR Limit:</span>
              <span className="font-bold text-text-primary">{inr(maxVarLimit, 0)}</span>
            </div>
            <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
              <span className="text-text-muted">Single-Position Cap:</span>
              <span className="font-bold text-text-primary">{(maxPosWeight * 100).toFixed(1)}% / 12.0%</span>
            </div>
            <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
              <span className="text-text-muted">Regulatory Capital Tier:</span>
              <span className="font-bold text-cyan-400">{capitalTier}</span>
            </div>
          </div>
        </div>

        {/* Private Witness (Hidden via zk-SNARK) */}
        <div className="rounded-[8px] border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-center justify-between border-b border-line-subtle pb-3">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-text-primary">
                Private Witness (Zero-Knowledge Protected)
              </h3>
            </div>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-400 border border-amber-500/40">
              PROPRIETARY CONFIDENTIAL
            </span>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between rounded bg-bg-primary/80 p-2.5 border border-line-subtle">
              <span className="text-text-muted">Individual Stock Holdings:</span>
              <span className="font-bold text-amber-400">HIDDEN [REDACTED BY SNARK]</span>
            </div>
            <div className="flex items-center justify-between rounded bg-bg-primary/80 p-2.5 border border-line-subtle">
              <span className="text-text-muted">Position Weights Vector:</span>
              <span className="font-bold text-amber-400">HIDDEN [REDACTED BY SNARK]</span>
            </div>
            <div className="flex items-center justify-between rounded bg-bg-primary/80 p-2.5 border border-line-subtle">
              <span className="text-text-muted">Multi-Factor Alpha Signals:</span>
              <span className="font-bold text-amber-400">HIDDEN [REDACTED BY SNARK]</span>
            </div>
            <div className="flex items-center justify-between rounded bg-bg-primary/80 p-2.5 border border-line-subtle">
              <span className="text-text-muted">Order Execution Schedule:</span>
              <span className="font-bold text-amber-400">HIDDEN [REDACTED BY SNARK]</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Generated Proof & Cryptographic Commitments ── */}
      {proofData && (
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Cryptographic zk-SNARK Commitment Digest
                </h3>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-text-muted font-mono">
                <span>Proof ID: {proofData.proof_id}</span>
                <span>•</span>
                <span>Prover Synthesized in {proofData.generation_time_ms.toFixed(1)} ms</span>
                <span>•</span>
                <span>Circuit Constraints: {proofData.public_inputs.circuit_constraints_count}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={verifyProof}
                disabled={loadingVerify}
                className="flex items-center gap-2 rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                <FileCheck className={`h-3.5 w-3.5 ${loadingVerify ? "animate-spin" : ""}`} />
                {loadingVerify ? "Auditing Circuit..." : "Verify Proof (Auditor)"}
              </button>

              <button
                onClick={() => setShowCertificate(true)}
                className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition"
              >
                <Award className="h-3.5 w-3.5" />
                View Certificate
              </button>
            </div>
          </div>

          {/* Proof Commitments Grid */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
            <div className="rounded bg-bg-primary p-3 border border-line-subtle">
              <div className="flex items-center justify-between text-text-muted">
                <span>π_a (G1 Curve Point)</span>
                <button
                  onClick={() => copyToClipboard(proofData.proof_commitments.pi_a, "pi_a")}
                  className="hover:text-text-primary"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-2 text-cyan-400 break-all text-[11px]">
                {proofData.proof_commitments.pi_a}
              </div>
            </div>

            <div className="rounded bg-bg-primary p-3 border border-line-subtle">
              <div className="flex items-center justify-between text-text-muted">
                <span>π_b (G2 Curve Point)</span>
                <button
                  onClick={() => copyToClipboard(proofData.proof_commitments.pi_b, "pi_b")}
                  className="hover:text-text-primary"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-2 text-purple-400 break-all text-[11px]">
                {proofData.proof_commitments.pi_b}
              </div>
            </div>

            <div className="rounded bg-bg-primary p-3 border border-line-subtle">
              <div className="flex items-center justify-between text-text-muted">
                <span>π_c (G1 Curve Point)</span>
                <button
                  onClick={() => copyToClipboard(proofData.proof_commitments.pi_c, "pi_c")}
                  className="hover:text-text-primary"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-2 text-emerald-400 break-all text-[11px]">
                {proofData.proof_commitments.pi_c}
              </div>
            </div>

            <div className="rounded bg-bg-primary p-3 border border-line-subtle">
              <div className="flex items-center justify-between text-text-muted">
                <span>Commitment Hash</span>
                <button
                  onClick={() => copyToClipboard(proofData.proof_commitments.commitment_hash, "hash")}
                  className="hover:text-text-primary"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-2 text-amber-400 break-all text-[11px]">
                {proofData.proof_commitments.commitment_hash}
              </div>
            </div>
          </div>

          {copiedField && (
            <div className="mt-2 text-[10px] font-mono text-emerald-400">
              Copied {copiedField} to clipboard!
            </div>
          )}

          {/* Verification Verdict Display */}
          {verificationResult && (
            <div className="mt-5 rounded-[8px] border border-emerald-500/40 bg-emerald-500/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                  <div>
                    <div className="text-sm font-bold text-emerald-300">
                      REGULATORY AUDIT VERIFIED: {verificationResult.verification_status}
                    </div>
                    <div className="text-xs text-text-muted">
                      {verificationResult.regulatory_verdict}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-text-muted">Verifier Execution Time:</span>
                  <div className="text-sm font-bold text-emerald-400">
                    {verificationResult.verifier_elapsed_ms.toFixed(2)} ms (&lt; 5 ms standard)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Compliance Certificate Modal ── */}
      {showCertificate && proofData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="max-w-xl w-full rounded-[8px] border border-amber-500/40 bg-bg-secondary p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line-subtle pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Award className="h-5 w-5" />
                <h3 className="text-base font-bold">SEBI / RBI zk-Audit Compliance Certificate</h3>
              </div>
              <button
                onClick={() => setShowCertificate(false)}
                className="text-text-muted hover:text-text-primary text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="rounded bg-bg-primary p-3 border border-line-subtle space-y-1.5">
                <div className="text-text-muted">Certificate ID: <span className="text-text-primary">{proofData.proof_id}</span></div>
                <div className="text-text-muted">Protocol: <span className="text-text-primary">{proofData.protocol}</span></div>
                <div className="text-text-muted">Capital Tier: <span className="text-text-primary">{proofData.public_inputs.capital_tier}</span></div>
                <div className="text-text-muted">Portfolio AUM: <span className="text-text-primary">{inr(proofData.public_inputs.user_aum_inr, 0)}</span></div>
                <div className="text-text-muted">1D 95% VaR Bound: <span className="text-emerald-400 font-bold">&le; {inr(proofData.public_inputs.var_95_limit_inr, 0)} (VERIFIED)</span></div>
                <div className="text-text-muted">Single-Position Cap: <span className="text-emerald-400 font-bold">&le; {proofData.public_inputs.tier_pos_cap_pct}% (VERIFIED)</span></div>
                <div className="text-text-muted">Zero-Knowledge Witness Disclosed: <span className="text-emerald-400 font-bold">FALSE (Zero Leakage)</span></div>
              </div>

              <div className="rounded bg-bg-primary p-3 border border-line-subtle">
                <span className="text-text-muted text-[10px]">Cryptographic Seal:</span>
                <p className="text-[10px] text-amber-400 break-all mt-1">
                  {proofData.proof_commitments.commitment_hash}
                </p>
              </div>

              <div className="text-[11px] text-text-muted italic">
                {proofData.confidentiality_guarantee}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowCertificate(false)}
                className="rounded bg-bg-primary px-4 py-1.5 text-xs font-semibold text-text-muted border border-line-subtle hover:text-text-primary"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `zk-compliance-${proofData.proof_id}.json`;
                  a.click();
                }}
                className="flex items-center gap-1.5 rounded bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
              >
                <Download className="h-3.5 w-3.5" />
                Export Audit JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
