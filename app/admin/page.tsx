"use client";

import { useState } from "react";
import {
  Lock,
  Loader2,
  Calendar,
  DollarSign,
  UtensilsCrossed,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BookingsTab from "@/components/admin/BookingsTab";
import PaymentsTab from "@/components/admin/PaymentsTab";
import MenuTab from "@/components/admin/MenuTab";
import PricingTab from "@/components/admin/PricingTab";

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";

const TABS = [
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "payments", label: "Payments", icon: DollarSign },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "pricing", label: "Pricing", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("bookings");

  const handleLogin = async () => {
    setAuthError(false);
    setAuthLoading(true);
    try {
      const configRes = await fetch("/api/pricing");
      const currentConfig = await configRes.json();
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(currentConfig),
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    } finally {
      setAuthLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <Lock
              className="mx-auto text-primary mb-4"
              size={32}
              strokeWidth={1.5}
            />
            <h1 className="font-heading text-2xl font-bold text-slate-text mb-2">
              Admin Portal
            </h1>
            <p className="text-slate-muted text-sm">
              Enter the admin password to continue.
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
              disabled={!password || authLoading}
              className={cn(
                "w-full bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-6 py-3.5 rounded-sm transition-all flex items-center justify-center gap-2",
                password && !authLoading
                  ? "hover:bg-primary-dark"
                  : "opacity-30 cursor-not-allowed"
              )}
            >
              {authLoading ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-slate-text mb-1">
            Admin Portal
          </h1>
          <p className="text-slate-muted text-sm">
            Manage bookings, payments, menu, and pricing.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-sky-deep mb-8 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                aria-label={tab.label}
                className={cn(
                  "flex items-center gap-1 md:gap-2 px-3 md:px-5 py-3 text-xs font-bold tracking-[0.1em] uppercase transition-all border-b-2 whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-muted hover:text-slate-text"
                )}
              >
                <Icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "bookings" && <BookingsTab password={password} />}
        {activeTab === "payments" && <PaymentsTab password={password} />}
        {activeTab === "menu" && <MenuTab password={password} />}
        {activeTab === "pricing" && <PricingTab password={password} />}
      </div>
    </div>
  );
}
