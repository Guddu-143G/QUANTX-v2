import { useEffect, useState } from "react";
import { Save, ShieldCheck, Key, Fingerprint, Clock, AlertTriangle, User, Briefcase, Mail } from "lucide-react";
import { PageHeader } from "../components/layout/AppShell";
import { Badge, Button, Panel } from "../components/ui";
import { useAuth } from "../lib/auth";
import { cn } from "../utils/cn";

type ProfileData = {
  full_name: string;
  email: string;
  title: string;
  desk: string;
  preferences: { risk_profile?: string; report_focus?: string; base_currency?: string };
};

export default function Profile() {
  const { signOut, refresh } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    fetch("/api/v1/profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setMessage("Unable to load profile."));
  }, []);
  
  const update = (key: keyof ProfileData, value: string) => setData(d => d ? { ...d, [key]: value } : d);
  
  async function save() {
    if (!data) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/v1/profile", { 
      method: "PATCH", 
      credentials: "include", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(data) 
    });
    
    if (response.ok) {
      setData(await response.json());
      await refresh();
      setMessage("Profile and custom research preferences saved.");
    } else {
      setMessage((await response.json()).detail || "Unable to save profile.");
    }
    setSaving(false);
  }
  
  if (!data) return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-acc"></span>
        <span className="mono text-[10px] text-txt-disabled">DECRYPTING IDENTITY...</span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1200px] pb-10">
      <PageHeader 
        title="Identity & Preferences" 
        sub="Configure your desk identity, security posture, and the defaults that shape your portfolio analytics." 
        meta={
          <div className="flex items-center gap-2">
            <Badge tone="pos" dot>SECURE PROFILE</Badge>
            <Badge tone="neu">SOC 2 COMPLIANT</Badge>
          </div>
        }
      />
      
      {/* ── SECURITY OVERVIEW ── */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-[8px] border border-line-subtle bg-surface/50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pos/10 text-pos">
            <Fingerprint size={18} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[11.5px] font-semibold text-txt-primary">Hardware MFA Active</div>
            <div className="mt-0.5 text-[10.5px] text-txt-secondary">YubiKey 5C NFC</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[8px] border border-line-subtle bg-surface/50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-acc/10 text-acc">
            <Key size={18} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[11.5px] font-semibold text-txt-primary">API Access Keys</div>
            <div className="mt-0.5 text-[10.5px] text-txt-secondary">2 active • 1 rotating soon</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[8px] border border-line-subtle bg-surface/50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neu/10 text-neu">
            <Clock size={18} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[11.5px] font-semibold text-txt-primary">Last Authenticated</div>
            <div className="mt-0.5 text-[10.5px] text-txt-secondary">Today, 08:14 IST • IP 103.14.x.x</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── IDENTITY PANEL ── */}
        <div className="lg:col-span-7">
          <Panel level={2} title="Desk Identity" sub="Your primary trading and research credentials">
            <div className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input icon={User} label="Full Name" value={data.full_name} onChange={v => update("full_name", v)} />
                <Input icon={Mail} label="Corporate Email" value={data.email} disabled />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input icon={Briefcase} label="Role / Title" value={data.title} onChange={v => update("title", v)} />
                <Input label="Desk / Mandate" value={data.desk} onChange={v => update("desk", v)} />
              </div>
            </div>
          </Panel>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-line-subtle bg-bg-primary/50 p-4">
            <div className="flex items-center gap-4">
              <Button variant="primary" icon={Save} loading={saving} onClick={save}>Commit Changes</Button>
              {message && <span className={cn("text-[11.5px]", message.includes("Unable") ? "text-neg" : "text-pos")}>{message}</span>}
            </div>
            <Button variant="ghost" className="text-neg hover:bg-neg/10 hover:text-neg" onClick={signOut}>Terminate Session</Button>
          </div>
        </div>

        {/* ── RESEARCH PREFERENCES ── */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Panel level={2} title="Research Defaults" sub="Baseline configuration for new portfolios">
            <div className="space-y-4 pt-2">
              <Select 
                label="Baseline Risk Posture" 
                value={data.preferences.risk_profile ?? "Balanced"} 
                options={["Conservative", "Balanced", "Growth", "Aggressive"]} 
                onChange={v => setData(d => d ? { ...d, preferences: { ...d.preferences, risk_profile: v } } : d)} 
              />
              <Select 
                label="Primary Report Emphasis" 
                value={data.preferences.report_focus ?? "Risk and concentration"} 
                options={["Risk and concentration", "Performance attribution", "Factor exposure", "Tax and turnover"]} 
                onChange={v => setData(d => d ? { ...d, preferences: { ...d.preferences, report_focus: v } } : d)} 
              />
              <Select 
                label="Base Currency" 
                value={data.preferences.base_currency ?? "INR"} 
                options={["INR", "USD", "EUR", "GBP", "JPY"]} 
                onChange={v => setData(d => d ? { ...d, preferences: { ...d.preferences, base_currency: v } } : d)} 
              />
              
              <div className="mt-2 flex items-start gap-2.5 rounded-[6px] border border-line-subtle bg-bg-secondary/60 p-3">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-acc" />
                <p className="text-[10.5px] leading-relaxed text-txt-secondary">
                  These defaults do not override hard-coded limits in uploaded CSV or API data; they only set the starting analytical context for the UI.
                </p>
              </div>
            </div>
          </Panel>

          <Panel level={3} className="border-warn/20 bg-warn/5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn" strokeWidth={2} />
              <div>
                <h4 className="text-[12px] font-semibold text-txt-primary">Access Levels</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-txt-secondary">
                  Your current role <span className="font-semibold text-txt-primary">[{data.title}]</span> grants you Level 2 execution rights. To request Level 3 (Derivatives) or modify your limits, contact the Risk Committee.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, disabled, icon: Icon }: { label: string; value: string; onChange?: (v: string) => void; disabled?: boolean; icon?: React.ElementType }) {
  return (
    <label className="block">
      <span className="label-xs mb-1.5 block text-txt-secondary">{label}</span>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-txt-muted">
            <Icon size={14} strokeWidth={2} />
          </div>
        )}
        <input 
          disabled={disabled} 
          value={value} 
          onChange={e => onChange?.(e.target.value)} 
          className={cn(
            "w-full rounded-[6px] border border-line bg-surface/50 py-2.5 text-[12.5px] text-txt-primary transition-colors",
            "focus:border-acc focus:bg-surface-high focus:outline-none focus:ring-1 focus:ring-acc",
            disabled ? "cursor-not-allowed opacity-50" : "hover:border-line-strong",
            Icon ? "pl-9 pr-3" : "px-3"
          )}
        />
      </div>
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label-xs mb-1.5 block text-txt-secondary">{label}</span>
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className={cn(
          "w-full appearance-none rounded-[6px] border border-line bg-surface/50 px-3 py-2.5 text-[12.5px] text-txt-primary transition-colors",
          "focus:border-acc focus:bg-surface-high focus:outline-none focus:ring-1 focus:ring-acc hover:border-line-strong"
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23647180'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundPosition: `right 8px center`,
          backgroundRepeat: `no-repeat`,
          backgroundSize: `14px`
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
