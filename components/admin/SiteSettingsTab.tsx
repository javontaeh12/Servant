"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";

interface SiteSettings {
  quoteFormMode: "builder" | "simple";
}

export default function SiteSettingsTab() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const toggleQuoteForm = async () => {
    if (!settings || saving) return;
    const newMode = settings.quoteFormMode === "builder" ? "simple" : "builder";
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteFormMode: newMode }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-slate-text mb-1">Site Settings</h2>
        <p className="text-slate-muted text-sm">Control how your public-facing website behaves.</p>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-sm">
          {error}
        </p>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 px-4 py-3 rounded-sm">
          <CheckCircle2 size={16} /> Settings saved.
        </div>
      )}

      {/* Quote Form Toggle */}
      <div className="border border-sky-deep rounded-sm p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-bold text-slate-text mb-1">
              Quote Request Form
            </h3>
            <p className="text-slate-muted text-sm mb-3">
              Choose which form customers see on the{" "}
              <span className="font-medium text-slate-text">/quote</span> page.
            </p>
            <div className="space-y-2 text-sm">
              <div className={`flex items-start gap-2 p-3 rounded-sm border ${settings?.quoteFormMode === "builder" ? "border-primary bg-primary/5" : "border-sky-deep"}`}>
                <span className="font-bold text-slate-text w-16 shrink-0">Builder</span>
                <span className="text-slate-muted">Multi-step wizard with meal selection, add-ons, and real-time pricing. Currently active: {settings?.quoteFormMode === "builder" ? "✓" : ""}</span>
              </div>
              <div className={`flex items-start gap-2 p-3 rounded-sm border ${settings?.quoteFormMode === "simple" ? "border-primary bg-primary/5" : "border-sky-deep"}`}>
                <span className="font-bold text-slate-text w-16 shrink-0">Simple</span>
                <span className="text-slate-muted">Clean single-page form collecting contact info, event details, menu preferences, and guest count. Currently active: {settings?.quoteFormMode === "simple" ? "✓" : ""}</span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleQuoteForm}
            disabled={saving}
            className="flex items-center gap-2 shrink-0 px-4 py-2 text-sm font-bold border border-sky-deep hover:border-primary hover:text-primary transition-colors rounded-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : settings?.quoteFormMode === "builder" ? (
              <>
                <ToggleLeft size={18} className="text-slate-muted" />
                Switch to Simple
              </>
            ) : (
              <>
                <ToggleRight size={18} className="text-primary" />
                Switch to Builder
              </>
            )}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-sky-deep">
          <p className="text-xs text-slate-muted">
            <span className="font-bold">Currently showing:</span>{" "}
            <span className="text-primary font-medium capitalize">
              {settings?.quoteFormMode === "builder" ? "Quote Builder (multi-step)" : "Simple Quote Form"}
            </span>{" "}
            on the public website.
          </p>
        </div>
      </div>
    </div>
  );
}
