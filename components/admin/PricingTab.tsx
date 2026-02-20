"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingConfig, AddOn, PricingEntry } from "@/lib/types";
import { SERVICES } from "@/lib/constants";

// Specialty names derived from SERVICES — these are locked (no rename/delete)
const SPECIALTY_NAMES = new Set(SERVICES.map((s) => s.name));

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass =
  "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2";

const DEFAULT_ENTRY: PricingEntry = { price: "", pricingType: "flat" };

export default function PricingTab() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Refs for scroll-to-new-item
  const newEventTypeRef = useRef<HTMLDivElement | null>(null);
  const newServiceStyleRef = useRef<HTMLDivElement | null>(null);
  const scrollToNewEventType = useRef(false);
  const scrollToNewServiceStyle = useRef(false);

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data: PricingConfig) => {
        // Ensure all specialties exist in eventTypes
        const merged = { ...data.eventTypes };
        for (const name of SPECIALTY_NAMES) {
          if (!(name in merged)) {
            merged[name] = DEFAULT_ENTRY;
          }
        }
        setConfig({ ...data, eventTypes: merged });
      })
      .catch(() => setSaveError("Failed to load pricing config"))
      .finally(() => setLoading(false));
  }, []);

  // Scroll to newly added items after render
  useEffect(() => {
    if (scrollToNewEventType.current && newEventTypeRef.current) {
      newEventTypeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      scrollToNewEventType.current = false;
    }
  });

  useEffect(() => {
    if (scrollToNewServiceStyle.current && newServiceStyleRef.current) {
      newServiceStyleRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      scrollToNewServiceStyle.current = false;
    }
  });

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.saved) {
          const merged = { ...data.saved.eventTypes };
          for (const name of SPECIALTY_NAMES) {
            if (!(name in merged)) {
              merged[name] = DEFAULT_ENTRY;
            }
          }
          setConfig({ ...data.saved, eventTypes: merged });
        }
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

  const updateEventType = (key: string, field: keyof PricingEntry, value: number | string) => {
    if (!config) return;
    const current = config.eventTypes[key] ?? DEFAULT_ENTRY;
    setConfig({
      ...config,
      eventTypes: {
        ...config.eventTypes,
        [key]: { ...current, [field]: value },
      },
    });
  };

  const addEventType = () => {
    if (!config) return;
    const name = `New Event Type`;
    scrollToNewEventType.current = true;
    setConfig({
      ...config,
      eventTypes: { ...config.eventTypes, [name]: { ...DEFAULT_ENTRY } },
    });
  };

  const removeEventType = (key: string) => {
    if (!config) return;
    const { [key]: _removed, ...rest } = config.eventTypes;
    void _removed;
    setConfig({ ...config, eventTypes: rest });
  };

  const renameEventType = (oldKey: string, newKey: string) => {
    if (!config || oldKey === newKey) return;
    const entries = Object.entries(config.eventTypes);
    const newEntries = entries.map(([k, v]) =>
      k === oldKey ? [newKey, v] : [k, v]
    );
    setConfig({
      ...config,
      eventTypes: Object.fromEntries(newEntries),
    });
  };

  const updateServiceStyle = (key: string, field: keyof PricingEntry, value: number | string) => {
    if (!config) return;
    const current = config.serviceStyles[key] ?? DEFAULT_ENTRY;
    setConfig({
      ...config,
      serviceStyles: {
        ...config.serviceStyles,
        [key]: { ...current, [field]: value },
      },
    });
  };

  const addServiceStyle = () => {
    if (!config) return;
    const name = `New Service Style`;
    scrollToNewServiceStyle.current = true;
    setConfig({
      ...config,
      serviceStyles: { ...config.serviceStyles, [name]: { ...DEFAULT_ENTRY } },
    });
  };

  const removeServiceStyle = (key: string) => {
    if (!config) return;
    const { [key]: _removed, ...rest } = config.serviceStyles;
    void _removed;
    setConfig({ ...config, serviceStyles: rest });
  };

  const renameServiceStyle = (oldKey: string, newKey: string) => {
    if (!config || oldKey === newKey) return;
    const entries = Object.entries(config.serviceStyles);
    const newEntries = entries.map(([k, v]) =>
      k === oldKey ? [newKey, v] : [k, v]
    );
    setConfig({
      ...config,
      serviceStyles: Object.fromEntries(newEntries),
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
        { id, name: "", description: "", pricingType: "flat", price: 0 },
      ],
    });
  };

  const removeAddOn = (index: number) => {
    if (!config) return;
    const addOns = config.addOns.filter((_, i) => i !== index);
    setConfig({ ...config, addOns });
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const pq = searchQuery.toLowerCase().trim();
  const filteredEventTypes = Object.entries(config.eventTypes).filter(
    ([key]) => !pq || key.toLowerCase().includes(pq)
  );
  const filteredServiceStyles = Object.entries(config.serviceStyles).filter(
    ([key]) => !pq || key.toLowerCase().includes(pq)
  );
  const filteredAddOns = config.addOns
    .map((addOn, index) => ({ addOn, index }))
    .filter(
      ({ addOn }) =>
        !pq ||
        addOn.name.toLowerCase().includes(pq) ||
        addOn.description.toLowerCase().includes(pq)
    );

  const eventTypeKeys = filteredEventTypes.map(([key]) => key);
  const lastEventTypeKey = eventTypeKeys[eventTypeKeys.length - 1];

  const serviceStyleKeys = filteredServiceStyles.map(([key]) => key);
  const lastServiceStyleKey = serviceStyleKeys[serviceStyleKeys.length - 1];

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted/50"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search event types, service styles, add-ons..."
          className={cn(inputClass, "pl-10")}
        />
      </div>

      {/* Event Types */}
      {filteredEventTypes.length > 0 && (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase">
            Event Type Base Prices
          </h2>
          <button
            onClick={addEventType}
            className="flex items-center gap-1.5 text-primary text-xs font-bold hover:text-primary-dark transition-colors"
          >
            <Plus size={14} /> Add Event Type
          </button>
        </div>
        <div className="space-y-3">
          {filteredEventTypes.map(([key, entry]) => {
            const isSpecialty = SPECIALTY_NAMES.has(key);
            const isLast = key === lastEventTypeKey;
            return (
              <div
                key={key}
                ref={isLast ? newEventTypeRef : undefined}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                {isSpecialty ? (
                  <span className="flex-1 text-sm text-slate-text">{key}</span>
                ) : (
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => renameEventType(key, e.target.value)}
                    className={cn(inputClass, "flex-1")}
                    placeholder="Event type name"
                  />
                )}
                <select
                  value={entry.pricingType}
                  onChange={(e) =>
                    updateEventType(key, "pricingType", e.target.value as "flat" | "per-person")
                  }
                  className={cn(inputClass, "appearance-none w-full sm:w-36")}
                >
                  <option value="flat">Flat Rate</option>
                  <option value="per-person">Per Person</option>
                </select>
                <div className="relative w-full sm:w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={entry.price === 0 || entry.price === "" ? "" : entry.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        updateEventType(key, "price", val === "" ? "" : parseFloat(val) || val);
                      }
                    }}
                    onBlur={(e) => {
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) updateEventType(key, "price", num);
                    }}
                    placeholder="0.00"
                    className={cn(inputClass, "pl-7 w-full sm:w-32")}
                  />
                </div>
                {!isSpecialty && (
                  <button
                    onClick={() => removeEventType(key)}
                    className="p-2 -m-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* Service Styles */}
      {filteredServiceStyles.length > 0 && (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase">
            Service Style Modifiers
          </h2>
          <button
            onClick={addServiceStyle}
            className="flex items-center gap-1.5 text-primary text-xs font-bold hover:text-primary-dark transition-colors"
          >
            <Plus size={14} /> Add Service Style
          </button>
        </div>
        <p className="text-slate-muted/60 text-xs mb-4">
          Positive values add to the base price, negative values subtract.
        </p>
        <div className="space-y-3">
          {filteredServiceStyles.map(([key, entry]) => {
            const isLast = key === lastServiceStyleKey;
            return (
              <div
                key={key}
                ref={isLast ? newServiceStyleRef : undefined}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <input
                  type="text"
                  value={key}
                  onChange={(e) => renameServiceStyle(key, e.target.value)}
                  className={cn(inputClass, "flex-1")}
                  placeholder="Service style name"
                />
                <select
                  value={entry.pricingType}
                  onChange={(e) =>
                    updateServiceStyle(key, "pricingType", e.target.value as "flat" | "per-person")
                  }
                  className={cn(inputClass, "appearance-none w-full sm:w-36")}
                >
                  <option value="flat">Flat Rate</option>
                  <option value="per-person">Per Person</option>
                </select>
                <div className="relative w-full sm:w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={entry.price === 0 || entry.price === "" ? "" : entry.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        updateServiceStyle(key, "price", val === "" ? "" : parseFloat(val) || val);
                      }
                    }}
                    onBlur={(e) => {
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) updateServiceStyle(key, "price", num);
                    }}
                    placeholder="0.00"
                    className={cn(inputClass, "pl-7 w-full sm:w-32")}
                  />
                </div>
                <button
                  onClick={() => removeServiceStyle(key)}
                  className="p-2 -m-1 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* Per-Person Rate */}
      {!pq && (
      <section className="mb-10">
        <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
          Per-Person Rate
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-sm text-slate-text">Rate per guest</span>
          <div className="relative w-full sm:w-32">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={config.perPersonRate === 0 || config.perPersonRate === "" ? "" : config.perPersonRate}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                  setConfig({
                    ...config,
                    perPersonRate: val === "" ? "" : parseFloat(val) || val,
                  });
                }
              }}
              onBlur={(e) => {
                const num = parseFloat(e.target.value);
                setConfig({
                  ...config,
                  perPersonRate: isNaN(num) ? 0 : num,
                });
              }}
              placeholder="0.00"
              className={cn(inputClass, "pl-7 w-full sm:w-32")}
            />
          </div>
        </div>
      </section>
      )}

      {/* Add-Ons */}
      {filteredAddOns.length > 0 && (
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
          {filteredAddOns.map(({ addOn, index }) => (
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
                  className="p-2 -m-2 text-red-400 hover:text-red-600 transition-colors mt-6"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
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
                    className={cn(inputClass, "appearance-none w-full sm:w-40")}
                  >
                    <option value="per-person">Per Person</option>
                    <option value="flat">Flat Rate</option>
                  </select>
                </div>
                <div className="w-full sm:w-auto">
                  <label className={labelClass}>Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={addOn.price === 0 || addOn.price === "" ? "" : addOn.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateAddOn(
                            index,
                            "price",
                            val === "" ? "" : parseFloat(val) || val
                          );
                        }
                      }}
                      onBlur={(e) => {
                        const num = parseFloat(e.target.value);
                        if (!isNaN(num)) updateAddOn(index, "price", num);
                      }}
                      placeholder="0.00"
                      className={cn(inputClass, "pl-7 w-full sm:w-28")}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Save */}
      <div className="sticky bottom-0 bg-white border-t border-sky-deep py-4 -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
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
            className="w-full sm:w-auto bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-8 py-3.5 flex items-center justify-center gap-2 rounded-sm hover:bg-primary-dark transition-all disabled:opacity-50"
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
  );
}
