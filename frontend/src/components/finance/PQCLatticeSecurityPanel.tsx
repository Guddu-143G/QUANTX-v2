import React, { useState, useEffect } from "react";
import {
  type PqcSignatureResponse,
  type PqcVerifyResponse,
  type PqcKeyEncapsulationResponse,
  postQuantumV32Service,
} from "../../services/v32";
import { inr, num } from "../../lib/format";
import {
  ShieldCheck,
  Lock,
  Key,
  Cpu,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Copy,
  Hash,
  Binary,
  Radio,
  Zap,
  ShieldAlert,
} from "lucide-react";

export const PQCLatticeSecurityPanel: React.FC = () => {
  const [loadingSign, setLoadingSign] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingKem, setLoadingKem] = useState(false);
  const [signData, setSignData] = useState<PqcSignatureResponse | null>(null);
  const [verifyData, setVerifyData] = useState<PqcVerifyResponse | null>(null);
  const [kemData, setKemData] = useState<PqcKeyEncapsulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Order input states
  const [orderId, setOrderId] = useState<string>("ORD-PQC-901");
  const [ticker, setTicker] = useState<string>("RELIANCE");
  const [qty, setQty] = useState<number>(500);
  const [price, setPrice] = useState<number>(2950.0);
  const [side, setSide] = useState<string>("BUY");

  const signOrder = async () => {
    setLoadingSign(true);
    setError(null);
    setVerifyData(null);
    try {
      const payload = {
        order_id: orderId,
        ticker,
        qty,
        price,
        side,
        account_id: "QX-INST-ALPHA-01",
      };
      const res = await postQuantumV32Service.signOrder({ order_payload: payload });
      setSignData(res);
    } catch (err: any) {
      setError(err.message || "PQC order signing failed.");
    } finally {
      setLoadingSign(false);
    }
  };

  const verifySignature = async (tamper: boolean = false) => {
    if (!signData) return;
    setLoadingVerify(true);
    try {
      const payload = {
        order_id: orderId,
        ticker,
        qty: tamper ? qty + 500 : qty, // Simulate alteration if tamper is true
        price,
        side,
        account_id: "QX-INST-ALPHA-01",
      };
      const res = await postQuantumV32Service.verifyOrder({
        order_payload: payload,
        pqc_signature: signData.pqc_signature,
      });
      setVerifyData(res);
    } catch (err: any) {
      setError(err.message || "PQC signature verification failed.");
    } finally {
      setLoadingVerify(false);
    }
  };

  const encapsulateKey = async () => {
    setLoadingKem(true);
    try {
      const res = await postQuantumV32Service.encapsulateKey({ client_endpoint: "ZERODHA_KITE_PQC_WS" });
      setKemData(res);
    } catch (err: any) {
      console.error("Key encapsulation failed:", err);
    } finally {
      setLoadingKem(false);
    }
  };

  useEffect(() => {
    signOrder();
    encapsulateKey();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Header Control ── */}
      <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Lock className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-text-primary">
                Post-Quantum Lattice Security (NIST FIPS 203/204)
              </h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400">
                ML-KEM-1024 + ML-DSA-87
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Protects order routing and live WebSocket telemetry against quantum decryption and "harvest-now-decrypt-later" state threats.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={signOrder}
              disabled={loadingSign}
              className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingSign ? "animate-spin" : ""}`} />
              {loadingSign ? "Generating Lattice Sig..." : "Sign Order (Dilithium5)"}
            </button>
          </div>
        </div>

        {/* ── Order Parameters ── */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          <div>
            <label className="text-[11px] font-medium text-text-muted">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Ticker</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-text-muted">Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="mt-1 w-full rounded border border-line-subtle bg-bg-primary px-3 py-1.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
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

      {/* ── Key Metrics & Security Status Banner ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* ML-KEM-1024 Status */}
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Key Encapsulation (KEM)</span>
            <Key className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400">ML-KEM-1024</div>
          <p className="mt-1 text-[11px] text-text-muted">256-bit post-quantum session safety</p>
        </div>

        {/* ML-DSA-87 Status */}
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Digital Signature (DSA)</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-cyan-400">ML-DSA-87</div>
          <p className="mt-1 text-[11px] text-text-muted">4,595-byte Dilithium5 lattice digest</p>
        </div>

        {/* Lattice Security Level */}
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">NIST Security Category</span>
            <Binary className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-purple-400">CATEGORY 5</div>
          <p className="mt-1 text-[11px] text-text-muted">Maximum post-quantum rating (AES-256 equivalent)</p>
        </div>

        {/* Shor's Algorithm Defense */}
        <div className="rounded-[8px] border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Quantum Threat Defense</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-emerald-400">SHOR-IMMUNE</div>
          <p className="mt-1 text-[11px] text-text-muted">Resistant to polynomial-time quantum attacks</p>
        </div>
      </div>

      {/* ── ML-DSA-87 Signature Inspector & Tamper Testing ── */}
      {signData && (
        <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-text-primary">
                  NIST FIPS 204 Lattice Signature Inspector ({signData.signature_length_bytes} Bytes)
                </h3>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-text-muted font-mono">
                <span>Order: {signData.order_id}</span>
                <span>•</span>
                <span>Modulus q = {signData.lattice_parameters.modulus_q}</span>
                <span>•</span>
                <span>Matrix Dim = {signData.lattice_parameters.matrix_k_l}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => verifySignature(false)}
                disabled={loadingVerify}
                className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                Verify Signature
              </button>
              <button
                onClick={() => verifySignature(true)}
                disabled={loadingVerify}
                className="rounded border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
              >
                Simulate Tampering
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="rounded bg-bg-primary p-3 border border-line-subtle">
              <div className="flex items-center justify-between text-text-muted mb-1">
                <span>ML-DSA-87 Dilithium Signature Digest:</span>
                <button
                  onClick={() => copyToClipboard(signData.pqc_signature, "signature")}
                  className="hover:text-text-primary"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-cyan-300 break-all text-[11px]">{signData.pqc_signature}</div>
            </div>

            <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle text-[11px]">
              <span className="text-text-muted">Canonical Payload SHA-256:</span>
              <span className="text-text-primary font-bold">{signData.canonical_payload_hash}</span>
            </div>
          </div>

          {copiedField && (
            <div className="mt-2 text-[10px] font-mono text-emerald-400">
              Copied {copiedField} to clipboard!
            </div>
          )}

          {/* Verification Result Banner */}
          {verifyData && (
            <div
              className={`mt-4 rounded-[8px] border p-4 ${
                verifyData.verification_status === "SIGNATURE_VALID"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-rose-500/40 bg-rose-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {verifyData.verification_status === "SIGNATURE_VALID" ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        verifyData.verification_status === "SIGNATURE_VALID"
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }`}
                    >
                      {verifyData.verification_status === "SIGNATURE_VALID"
                        ? "LATTICE SIGNATURE VERIFIED AUTHENTIC & UNTAMPERED"
                        : "TAMPER DETECTED: PAYLOAD DOES NOT MATCH LATTICE SIGNATURE"}
                    </div>
                    <div className="text-[11px] text-text-muted font-mono">
                      Lattice error norm: {verifyData.lattice_error_norm.toFixed(2)} (Bound: 78.0)
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded px-2.5 py-1 text-xs font-mono font-bold ${
                    verifyData.verification_status === "SIGNATURE_VALID"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {verifyData.verification_status}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ML-KEM-1024 Session Key Encapsulation & Threat Model ── */}
      {kemData && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* KEM Session Stream */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-text-primary">
                  ML-KEM-1024 WebSocket Key Stream
                </h3>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 border border-emerald-500/30">
                ACTIVE STREAM
              </span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
                <span className="text-text-muted">Endpoint:</span>
                <span className="font-bold text-text-primary">{kemData.client_endpoint}</span>
              </div>
              <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
                <span className="text-text-muted">Shared Secret:</span>
                <span className="font-bold text-emerald-400">{kemData.shared_secret_hash}</span>
              </div>
              <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
                <span className="text-text-muted">Ciphertext Size:</span>
                <span className="font-bold text-text-primary">{kemData.ciphertext_length_bytes} bytes</span>
              </div>
              <div className="rounded bg-bg-primary p-2.5 border border-line-subtle">
                <div className="text-text-muted text-[11px] mb-1">Polynomial Ring:</div>
                <div className="text-purple-400 text-[11px] break-all">{kemData.polynomial_ring}</div>
              </div>
            </div>
          </div>

          {/* Classical vs Post-Quantum Threat Matrix */}
          <div className="rounded-[8px] border border-line-subtle bg-bg-secondary p-5">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Quantum Cryptographic Threat Matrix
                </h3>
              </div>
              <span className="text-xs font-mono text-text-muted">Shor's Algorithm</span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
                <div>
                  <div className="font-semibold text-text-primary">RSA-2048 / 4096</div>
                  <div className="text-[10px] text-text-muted">Integer Factorization</div>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400">
                  COMPROMISED (O(log N)³)
                </span>
              </div>

              <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-line-subtle">
                <div>
                  <div className="font-semibold text-text-primary">ECDSA / Ed25519</div>
                  <div className="text-[10px] text-text-muted">Discrete Logarithms</div>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400">
                  COMPROMISED (O(log N)³)
                </span>
              </div>

              <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-emerald-500/30 bg-emerald-500/5">
                <div>
                  <div className="font-semibold text-emerald-400">ML-KEM-1024 (Kyber)</div>
                  <div className="text-[10px] text-text-muted">Module Lattice LWE</div>
                </div>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                  IMMUNE (2²⁵⁶ OPERATIONS)
                </span>
              </div>

              <div className="flex items-center justify-between rounded bg-bg-primary p-2.5 border border-emerald-500/30 bg-emerald-500/5">
                <div>
                  <div className="font-semibold text-emerald-400">ML-DSA-87 (Dilithium5)</div>
                  <div className="text-[10px] text-text-muted">Short Integer Solution (SIS)</div>
                </div>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                  IMMUNE (NIST CAT 5)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
