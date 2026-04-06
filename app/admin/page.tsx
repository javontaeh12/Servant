"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Calendar,
  DollarSign,
  UtensilsCrossed,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Home,
  Building2,
  Images,
  Sparkles,
  ToggleLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

const BookingsTab = dynamic(() => import("@/components/admin/BookingsTab"));
const PaymentsTab = dynamic(() => import("@/components/admin/PaymentsTab"));
const MenuTab = dynamic(() => import("@/components/admin/MenuTab"));
const PricingTab = dynamic(() => import("@/components/admin/PricingTab"));
const BusinessTab = dynamic(() => import("@/components/admin/BusinessTab"));
const GalleryTab = dynamic(() => import("@/components/admin/GalleryTab"));
const SpecialtiesTab = dynamic(() => import("@/components/admin/SpecialtiesTab"));
const SiteSettingsTab = dynamic(() => import("@/components/admin/SiteSettingsTab"));

const TABS = [
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "payments", label: "Payments", icon: DollarSign },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "pricing", label: "Pricing", icon: Settings },
  { id: "business", label: "Business", icon: Building2 },
  { id: "specialties", label: "Specialties", icon: Sparkles },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "site-settings", label: "Site Settings", icon: ToggleLeft },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("bookings");
  const [session, setSession] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const squareStatus = searchParams.get("square");
  const calendarStatus = searchParams.get("calendar");
  const [calendarInfo, setCalendarInfo] = useState<{
    connected: boolean;
    email?: string;
  } | null>(null);
  const [squareInfo, setSquareInfo] = useState<{
    connected: boolean;
    merchantId?: string;
  } | null>(null);
  const [disconnectingCal, setDisconnectingCal] = useState(false);
  const [disconnectingSq, setDisconnectingSq] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setSession({ email: data.email, name: data.name });
        }
      })
      .finally(() => setLoading(false));

    fetch("/api/calendar/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setCalendarInfo(data); });

    fetch("/api/square/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setSquareInfo(data); });
  }, []);

  const handleDisconnectCalendar = async () => {
    if (!confirm("Disconnect Google Calendar?")) return;
    setDisconnectingCal(true);
    try {
      const res = await fetch("/api/calendar/disconnect", { method: "POST" });
      if (res.ok) setCalendarInfo({ connected: false });
    } finally {
      setDisconnectingCal(false);
    }
  };

  const handleDisconnectSquare = async () => {
    if (!confirm("Disconnect Square?")) return;
    setDisconnectingSq(true);
    try {
      const res = await fetch("/api/square/disconnect", { method: "POST" });
      if (res.ok) setSquareInfo({ connected: false });
    } finally {
      setDisconnectingSq(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-text mb-1">
              Admin Portal
            </h1>
            <p className="text-slate-muted text-sm">
              {session
                ? `Signed in as ${session.name.split(" ").pop()?.charAt(0).toUpperCase()}${session.name.split(" ").pop()?.slice(1).toLowerCase() || session.name}`
                : "Manage bookings, payments, menu, and pricing."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-muted hover:text-primary transition-colors px-3 py-2 border border-sky-deep rounded-sm"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-muted hover:text-red-500 transition-colors px-3 py-2"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Square connection status */}
        {squareStatus === "connected" && (
          <div className="flex items-center gap-2 text-green-600 text-sm mb-4 bg-green-50 border border-green-200 rounded-sm px-4 py-2">
            <CheckCircle2 size={16} /> Square account connected successfully!
          </div>
        )}
        {squareStatus === "error" && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded-sm px-4 py-2">
            <AlertCircle size={16} /> Failed to connect Square. Try again.
          </div>
        )}

        {/* Calendar connection status */}
        {calendarStatus === "connected" && (
          <div className="flex items-center gap-2 text-green-600 text-sm mb-4 bg-green-50 border border-green-200 rounded-sm px-4 py-2">
            <CheckCircle2 size={16} /> Google Calendar connected successfully!
          </div>
        )}
        {calendarStatus === "error" && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded-sm px-4 py-2">
            <AlertCircle size={16} /> Failed to connect Google Calendar. Try again.
          </div>
        )}
        {calendarStatus === "no_refresh" && (
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-4 bg-amber-50 border border-amber-200 rounded-sm px-4 py-2">
            <AlertCircle size={16} /> No refresh token received. Please disconnect and reconnect your Google account.
          </div>
        )}

        {/* Connection cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Google Calendar card */}
          {calendarInfo && (
            <div className="border border-sky-deep rounded-sm px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Calendar size={18} className={calendarInfo.connected ? "text-green-600" : "text-slate-muted"} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-text">Google Calendar</p>
                  {calendarInfo.connected ? (
                    <p className="text-xs text-slate-muted truncate">{calendarInfo.email}</p>
                  ) : (
                    <p className="text-xs text-slate-muted">Not connected</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {calendarInfo.connected && (
                  <button
                    onClick={handleDisconnectCalendar}
                    disabled={disconnectingCal}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 border border-red-200 rounded-sm disabled:opacity-50"
                  >
                    {disconnectingCal ? "..." : "Disconnect"}
                  </button>
                )}
                <a
                  href="/api/auth/google-calendar"
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-colors px-3 py-1.5 border border-sky-deep rounded-sm"
                >
                  {calendarInfo.connected ? "Reconnect" : "Connect"}
                </a>
              </div>
            </div>
          )}

          {/* Square card */}
          {squareInfo && (
            <div className="border border-sky-deep rounded-sm px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <DollarSign size={18} className={squareInfo.connected ? "text-green-600" : "text-slate-muted"} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-text">Square</p>
                  {squareInfo.connected ? (
                    <p className="text-xs text-slate-muted truncate">
                      {squareInfo.merchantId ? `Merchant ${squareInfo.merchantId}` : "Connected"}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-muted">Not connected</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {squareInfo.connected && (
                  <button
                    onClick={handleDisconnectSquare}
                    disabled={disconnectingSq}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 border border-red-200 rounded-sm disabled:opacity-50"
                  >
                    {disconnectingSq ? "..." : "Disconnect"}
                  </button>
                )}
                <a
                  href="/api/auth/square"
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-colors px-3 py-1.5 border border-sky-deep rounded-sm"
                >
                  {squareInfo.connected ? "Reconnect" : "Connect"}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="relative">
          <div className="flex gap-1 border-b border-sky-deep mb-8 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory">
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
                    "flex items-center gap-1 px-2 sm:px-3 md:px-5 py-3 text-[10px] sm:text-xs font-bold tracking-[0.05em] sm:tracking-[0.1em] uppercase transition-all border-b-2 whitespace-nowrap snap-start",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-muted hover:text-slate-text"
                  )}
                >
                  <Icon size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* Scroll fade hint on right edge */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
        </div>

        {/* Tab content */}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "menu" && <MenuTab />}
        {activeTab === "pricing" && <PricingTab />}
        {activeTab === "business" && <BusinessTab />}
        {activeTab === "specialties" && <SpecialtiesTab />}
        {activeTab === "gallery" && <GalleryTab />}
        {activeTab === "site-settings" && <SiteSettingsTab />}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        }
      >
        <AdminContent />
      </Suspense>
    </ErrorBoundary>
  );
}
