"use client";

import { useState } from "react";
import { CalendarDays, Copy, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalendarSyncInfo() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://iasfcatering.com";
  const feedUrl = `${baseUrl}/api/bookings/calendar.ics?token=YOUR_CRON_SECRET`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="border border-sky-deep rounded-sm mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-sky/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" />
          <span className="text-sm font-bold text-slate-text">Sync to External Calendar</span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-muted" />
        ) : (
          <ChevronDown size={16} className="text-slate-muted" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-sky-deep px-4 py-4 space-y-4">
          <p className="text-slate-muted text-sm">
            Subscribe to your bookings calendar from Google Calendar, Apple Calendar, or Outlook.
            All approved and pending bookings will sync automatically.
          </p>

          {/* Feed URL */}
          <div>
            <label className="block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2">
              Calendar Feed URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={feedUrl}
                className="flex-1 bg-sky/50 border border-sky-deep text-slate-text px-3 py-2 text-xs rounded-sm font-mono"
              />
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-sm text-xs font-bold transition-colors border",
                  copied
                    ? "border-green-200 text-green-600 bg-green-50"
                    : "border-sky-deep text-primary hover:bg-sky/50"
                )}
              >
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-slate-muted/70 mt-1">
              Replace YOUR_CRON_SECRET with the CRON_SECRET value from your Vercel environment variables.
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <div className="border border-sky-deep rounded-sm p-3">
              <h4 className="text-xs font-bold text-slate-text mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google Calendar
              </h4>
              <ol className="text-xs text-slate-muted space-y-1 list-decimal list-inside">
                <li>Open Google Calendar on your computer</li>
                <li>Click the <strong>+</strong> next to {`"Other calendars"`} on the left</li>
                <li>Select <strong>{`"From URL"`}</strong></li>
                <li>Paste the calendar feed URL above</li>
                <li>Click <strong>{`"Add calendar"`}</strong></li>
              </ol>
            </div>

            <div className="border border-sky-deep rounded-sm p-3">
              <h4 className="text-xs font-bold text-slate-text mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Apple Calendar (iPhone / Mac)
              </h4>
              <ol className="text-xs text-slate-muted space-y-1 list-decimal list-inside">
                <li>Open <strong>Settings</strong> &gt; <strong>Calendar</strong> &gt; <strong>Accounts</strong></li>
                <li>Tap <strong>{`"Add Account"`}</strong> &gt; <strong>{`"Other"`}</strong></li>
                <li>Tap <strong>{`"Add Subscribed Calendar"`}</strong></li>
                <li>Paste the calendar feed URL</li>
                <li>Tap <strong>{`"Subscribe"`}</strong></li>
              </ol>
            </div>

            <div className="border border-sky-deep rounded-sm p-3">
              <h4 className="text-xs font-bold text-slate-text mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0078D4">
                  <path d="M21.17 2.06A2.13 2.13 0 0019.1 1H4.9A2.13 2.13 0 002.83 2.06 2.13 2.13 0 002 4.1v15.8c0 .76.31 1.49.83 2.04A2.13 2.13 0 004.9 23h14.2c.76 0 1.49-.31 2.07-.86.52-.55.83-1.28.83-2.04V4.1c0-.76-.31-1.49-.83-2.04zM12 17.5H7v-1.5h5v1.5zm5-4H7V12h10v1.5zm0-4H7V8h10v1.5z" />
                </svg>
                Outlook
              </h4>
              <ol className="text-xs text-slate-muted space-y-1 list-decimal list-inside">
                <li>Open Outlook Calendar</li>
                <li>Click <strong>{`"Add calendar"`}</strong> in the left panel</li>
                <li>Select <strong>{`"Subscribe from web"`}</strong></li>
                <li>Paste the calendar feed URL</li>
                <li>Click <strong>{`"Import"`}</strong></li>
              </ol>
            </div>
          </div>

          <p className="text-[11px] text-slate-muted/70">
            The calendar updates automatically. Most calendar apps refresh subscriptions every few hours.
          </p>
        </div>
      )}
    </div>
  );
}
