"use client";

import { Shield, Trash2, Calendar, Mail, FileText, CreditCard } from "lucide-react";

const RETENTION_ITEMS = [
  {
    icon: Calendar,
    label: "Bookings",
    description: "Google Calendar events and booking details",
  },
  {
    icon: Mail,
    label: "Emails",
    description: "Contact form messages and booking notifications",
  },
  {
    icon: FileText,
    label: "Quotes",
    description: "Quote requests and estimated pricing data",
  },
  {
    icon: CreditCard,
    label: "Unpaid Invoices",
    description: "Square invoices that were never paid or completed",
  },
];

export default function DataRetentionTab() {
  return (
    <div className="space-y-8">
      {/* Policy Overview */}
      <div className="border border-sky-deep rounded-sm p-6 bg-sky/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
            <Shield className="text-primary" size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-text mb-2">
              Automatic Data Retention Policy
            </h3>
            <p className="text-slate-muted text-sm leading-relaxed">
              To protect customer privacy and keep your records clean, data
              older than <strong className="text-slate-text">1 year</strong> from
              the event or booking date is automatically removed from the
              system. No action is required on your part.
            </p>
          </div>
        </div>
      </div>

      {/* What Gets Deleted */}
      <div>
        <h4 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
          What Gets Deleted After 1 Year
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RETENTION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-start gap-3 p-4 border border-sky-deep rounded-sm"
              >
                <Trash2 size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-text flex items-center gap-2">
                    <Icon size={14} className="text-slate-muted" />
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-muted mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What Is Kept */}
      <div>
        <h4 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
          What Is Kept Permanently
        </h4>
        <div className="border border-green-200 bg-green-50 rounded-sm p-5">
          <div className="flex items-start gap-3">
            <CreditCard size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">
                Completed Payment History
              </p>
              <p className="text-xs text-green-700 mt-1 leading-relaxed">
                All completed transactions and paid invoices remain permanently
                in your Square Dashboard for tax and accounting purposes. Only
                unpaid or canceled invoices are removed from the system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h4 className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-4">
          How It Works
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 border border-sky-deep rounded-sm">
            <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
              1
            </span>
            <p className="text-sm text-slate-muted">
              The system runs an automatic weekly cleanup every Sunday at 3:00 AM.
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 border border-sky-deep rounded-sm">
            <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
              2
            </span>
            <p className="text-sm text-slate-muted">
              It checks the date of each booking and event. Anything older than
              1 year from the event date is flagged for removal.
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 border border-sky-deep rounded-sm">
            <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
              3
            </span>
            <p className="text-sm text-slate-muted">
              Flagged bookings are removed from Google Calendar, associated
              unpaid invoices are canceled in Square, and related quote data is
              deleted.
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 border border-sky-deep rounded-sm">
            <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
              4
            </span>
            <p className="text-sm text-slate-muted">
              Paid invoices and completed transactions are never touched — they
              stay in Square permanently.
            </p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-slate-muted/60 text-xs leading-relaxed">
        This policy runs automatically and requires no action from you. If you
        have questions about data retention or need to retrieve information
        about a past event, please contact your developer.
      </p>
    </div>
  );
}
