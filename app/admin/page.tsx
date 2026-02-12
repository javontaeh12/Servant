"use client";

import { useState } from "react";
import {
  Lock,
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingConfig, AddOn } from "@/lib/types";

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass =
  "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadPricing = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pricing");
      const data = await res.json();
      setConfig(data);
    } catch {
      setSaveError("Failed to load pricing config");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(false);
    // Verify password by attempting a PUT with the password
    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(
          // Fetch current config first, then send it back unchanged to verify password
          await fetch("/api/pricing").then((r) => r.json())
        ),
      });
      if (res.ok) {
        setAuthenticated(true);
        await loadPricing();
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to save");
      }
    } catch {
      setSaveError("Failed to save pricing config");
    } finally {
      setSaving(false);
    }
  };

  const updateEventType = (key: string, value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      eventTypes: { ...config.eventTypes, [key]: value },
    });
  };

  const updateServiceStyle = (key: string, value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      serviceStyles: { ...config.serviceStyles, [key]: value },
    });
  };

  const updateAddOn = (index: number, field: keyof AddOn, value: string | number) => {
    if (!config) return;
    const addOns = [...config.addOns];
    addOns[index] = { ...addOns[index], [field]: value };
    setConfig({ ...config, addOns });
  };

  const addNewAddOn = () => {
    if (!config) return;
    const id = `addon_${Date.now()}`;
    setConfig({
      ...config,
      addOns: [
        ...config.addOns,
        {
          id,
          name: "",
          description: "",
          pricingType: "flat",
          price: 0,
        },
      ],
    });
  };

  const removeAddOn = (index: number) => {
    if (!config) return;
    const addOns = config.addOns.filter((_, i) => i !== index);
    setConfig({ ...config, addOns });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <Lock className="mx-auto text-primary mb-4" size={32} strokeWidth={1.5} />
            <h1 className="font-heading text-2xl font-bold text-slate-text mb-2">
              Admin Access
            </h1>
            <p className="text-slate-muted text-sm">
              Enter the admin password to manage pricing.
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              className={inputClass}
              autoFocus
            />
            {authError && (
              <p className="text-red-500 text-sm text-center">
                Invalid password. Please try again.
              </p>
            )}
            <button
              onClick={handleLogin}
              disabled={!password}
              className={cn(
                "w-full bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-6 py-3.5 rounded-sm transition-all",
                password ? "hover:bg-primary-dark" : "opacity-30 cursor-not-allowed"
              )}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-bold text-slate-text mb-2">
            Pricing Manager
          </h1>
          <p className="text-slate-muted text-sm">
            Update pricing for the quote form. Changes take effect immediately.
          </p>
        </div>

        {/* Event Types */}
        <section className="mb-10">
          <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
            Event Type Base Prices
          </h2>
          <div className="space-y-3">
            {Object.entries(config.eventTypes).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <span className="flex-1 text-sm text-slate-text">{key}</span>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      updateEventType(key, parseFloat(e.target.value) || 0)
                    }
                    className={cn(inputClass, "pl-7 w-32")}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Service Styles */}
        <section className="mb-10">
          <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
            Service Style Modifiers
          </h2>
          <p className="text-slate-muted/60 text-xs mb-4">
            Positive values add to the base price, negative values subtract.
          </p>
          <div className="space-y-3">
            {Object.entries(config.serviceStyles).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <span className="flex-1 text-sm text-slate-text">{key}</span>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      updateServiceStyle(key, parseFloat(e.target.value) || 0)
                    }
                    className={cn(inputClass, "pl-7 w-32")}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Per-Person Rate */}
        <section className="mb-10">
          <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
            Per-Person Rate
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-text">Rate per guest</span>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
                $
              </span>
              <input
                type="number"
                value={config.perPersonRate}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    perPersonRate: parseFloat(e.target.value) || 0,
                  })
                }
                className={cn(inputClass, "pl-7 w-32")}
              />
            </div>
          </div>
        </section>

        {/* Add-Ons */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase">
              Add-Ons
            </h2>
            <button
              onClick={addNewAddOn}
              className="flex items-center gap-1.5 text-primary text-xs font-bold hover:text-primary-dark transition-colors"
            >
              <Plus size={14} /> Add New
            </button>
          </div>
          <div className="space-y-4">
            {config.addOns.map((addOn, index) => (
              <div
                key={addOn.id}
                className="border border-sky-deep rounded-sm p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        type="text"
                        value={addOn.name}
                        onChange={(e) =>
                          updateAddOn(index, "name", e.target.value)
                        }
                        placeholder="Add-on name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <input
                        type="text"
                        value={addOn.description}
                        onChange={(e) =>
                          updateAddOn(index, "description", e.target.value)
                        }
                        placeholder="Short description"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeAddOn(index)}
                    className="text-red-400 hover:text-red-600 transition-colors mt-6"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <label className={labelClass}>Pricing Type</label>
                    <select
                      value={addOn.pricingType}
                      onChange={(e) =>
                        updateAddOn(
                          index,
                          "pricingType",
                          e.target.value as "per-person" | "flat"
                        )
                      }
                      className={cn(inputClass, "appearance-none w-40")}
                    >
                      <option value="per-person">Per Person</option>
                      <option value="flat">Flat Rate</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={addOn.price}
                        onChange={(e) =>
                          updateAddOn(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={cn(inputClass, "pl-7 w-28")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="sticky bottom-0 bg-white border-t border-sky-deep py-4 -mx-6 px-6">
          <div className="flex items-center justify-between">
            <div>
              {saved && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 size={16} /> Saved successfully
                </div>
              )}
              {saveError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-8 py-3.5 flex items-center gap-2 rounded-sm hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
