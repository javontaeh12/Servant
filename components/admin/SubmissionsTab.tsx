"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Mail, Phone, Trash2, CheckCheck, ChevronDown, ChevronUp } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  submittedAt: string;
  read: boolean;
}

export default function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(() => {
    setLoading(true);
    fetch("/api/contact/submissions")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Submission[]) => setSubmissions(data))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleExpand = async (id: string) => {
    const isOpening = expandedId !== id;
    setExpandedId(isOpening ? id : null);

    // Mark as read when opened
    if (isOpening) {
      const sub = submissions.find((s) => s.id === id);
      if (sub && !sub.read) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, read: true } : s))
        );
        fetch("/api/contact/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }).catch(() => {});
      }
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/contact/submissions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16">
        <Mail className="text-slate-muted/40 mx-auto mb-4" size={40} strokeWidth={1.5} />
        <p className="text-slate-muted text-sm font-medium">No submissions yet</p>
        <p className="text-slate-muted/60 text-xs mt-1">
          Contact form messages will appear here.
        </p>
      </div>
    );
  }

  const unreadCount = submissions.filter((s) => !s.read).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-slate-text">
            Contact Submissions
          </h2>
          {unreadCount > 0 && (
            <p className="text-xs text-slate-muted mt-0.5">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Submission list */}
      <div className="space-y-3">
        {submissions.map((sub) => {
          const isExpanded = expandedId === sub.id;
          const isDeleting = deletingId === sub.id;

          return (
            <div
              key={sub.id}
              className={`border rounded-sm transition-all duration-200 ${
                sub.read
                  ? "border-sky-deep bg-white"
                  : "border-primary/30 bg-primary/[0.03]"
              }`}
            >
              {/* Row header */}
              <button
                type="button"
                onClick={() => handleExpand(sub.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {!sub.read && (
                    <span className="shrink-0 w-2 h-2 bg-primary rounded-full" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-text text-sm truncate">
                      {sub.name}
                    </p>
                    <p className="text-xs text-slate-muted truncate">{sub.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-slate-muted hidden sm:block">
                    {formatDate(sub.submittedAt)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-slate-muted" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-muted" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-sky-deep">
                  {/* Date on mobile */}
                  <p className="text-xs text-slate-muted mt-4 mb-3 sm:hidden">
                    {formatDate(sub.submittedAt)}
                  </p>

                  {/* Contact details */}
                  <div className="flex flex-wrap gap-4 mt-4 mb-4">
                    <a
                      href={`mailto:${sub.email}`}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                    >
                      <Mail size={13} />
                      {sub.email}
                    </a>
                    {sub.phone && (
                      <a
                        href={`tel:${sub.phone}`}
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                      >
                        <Phone size={13} />
                        {sub.phone}
                      </a>
                    )}
                  </div>

                  {/* Message */}
                  <div className="bg-sky/50 border border-sky-deep rounded-sm p-4 mb-4">
                    <p className="text-xs font-bold text-slate-muted uppercase tracking-wide mb-2">
                      Message
                    </p>
                    <p className="text-sm text-slate-text leading-relaxed whitespace-pre-wrap">
                      {sub.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <a
                      href={`mailto:${sub.email}?subject=Re: Your inquiry`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-sm transition-colors"
                    >
                      <Mail size={13} />
                      Reply
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(sub.id)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-muted hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {submissions.length > 0 && unreadCount === 0 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-muted/60">
          <CheckCheck size={14} />
          All caught up
        </div>
      )}
    </div>
  );
}
