"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  DollarSign,
  Plus,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SquarePayment } from "@/lib/types";

const inputClass =
  "w-full bg-sky/50 border border-sky-deep text-slate-text px-4 py-3 focus:border-primary/50 focus:outline-none transition-colors text-sm rounded-sm";
const labelClass =
  "block text-slate-muted text-xs font-bold tracking-wide uppercase mb-2";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function statusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "text-green-600 bg-green-50";
    case "FAILED":
    case "CANCELED":
      return "text-red-600 bg-red-50";
    case "PENDING":
      return "text-yellow-600 bg-yellow-50";
    default:
      return "text-slate-muted bg-sky";
  }
}

export default function PaymentsTab() {
  const [payments, setPayments] = useState<SquarePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // New payment form
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInstanceRef = useRef<unknown>(null);
  const paymentsInstanceRef = useRef<unknown>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/square/payments");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPayments(data);
    } catch {
      setError("Failed to load payments. Square keys may not be configured.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const initSquareCard = useCallback(async () => {
    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const env = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT;
    if (!appId) {
      setPaymentError("Square application ID not configured");
      return;
    }

    try {
      // Load Square Web Payments SDK
      if (!document.getElementById("square-web-sdk")) {
        const script = document.createElement("script");
        script.id = "square-web-sdk";
        script.src =
          env === "production"
            ? "https://web.squarecdn.com/v1/square.js"
            : "https://sandbox.web.squarecdn.com/v1/square.js";
        script.async = true;
        document.head.appendChild(script);
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Square SDK"));
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Square = (window as any).Square;
      if (!Square) throw new Error("Square SDK not available");

      const payments = await Square.payments(appId, undefined);
      paymentsInstanceRef.current = payments;

      const card = await payments.card();
      await card.attach(cardRef.current);
      cardInstanceRef.current = card;
      setCardReady(true);
    } catch (err) {
      console.error("Square init error:", err);
      setPaymentError("Failed to initialize payment form");
    }
  }, []);

  useEffect(() => {
    if (showForm) {
      initSquareCard();
    }
    return () => {
      if (cardInstanceRef.current) {
        (cardInstanceRef.current as { destroy?: () => void }).destroy?.();
        cardInstanceRef.current = null;
      }
      setCardReady(false);
    };
  }, [showForm, initSquareCard]);

  const handleProcessPayment = async () => {
    if (!cardInstanceRef.current || !amount) return;
    setProcessing(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (cardInstanceRef.current as any).tokenize();
      if (result.status !== "OK") {
        throw new Error(result.errors?.[0]?.message || "Card tokenization failed");
      }

      const res = await fetch("/api/square/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId: result.token,
          amount: parseFloat(amount),
          note,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(`Payment processed! ID: ${data.paymentId}`);
        setAmount("");
        setNote("");
        setShowForm(false);
        fetchPayments();
      } else {
        setPaymentError(data.error || "Payment failed");
      }
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : "Failed to process payment"
      );
    } finally {
      setProcessing(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const searchable = [
        p.description,
        formatAmount(p.amount),
        String(p.amount),
        p.status,
        formatDate(p.createdAt),
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-primary text-xs font-bold tracking-[0.15em] uppercase">
          Payment History
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            className="flex items-center gap-1.5 text-primary text-xs font-bold hover:text-primary-dark transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white font-body font-bold text-xs tracking-wide uppercase px-5 py-2.5 rounded-sm hover:bg-primary-dark transition-all flex items-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2.5} />
            Collect Payment
          </button>
        </div>
      </div>

      {/* Status messages */}
      {paymentSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm mb-4 border border-green-200 bg-green-50 p-3 rounded-sm">
          <CheckCircle2 size={16} /> {paymentSuccess}
        </div>
      )}
      {paymentError && (
        <div className="flex items-center gap-2 text-red-500 text-sm mb-4 border border-red-200 bg-red-50 p-3 rounded-sm">
          <AlertCircle size={16} /> {paymentError}
        </div>
      )}

      {/* Search & Filter */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted/50"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by amount, description, date..."
          className={cn(inputClass, "pl-10")}
        />
      </div>
      <div className="flex gap-1 border border-sky-deep rounded-sm p-1 mb-6 w-fit">
        {["all", "COMPLETED", "PENDING", "FAILED", "CANCELED"].map((status) => {
          const count =
            status === "all"
              ? payments.length
              : payments.filter((p) => p.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide transition-colors",
                statusFilter === status
                  ? "bg-primary text-white"
                  : "text-slate-muted hover:text-slate-text"
              )}
            >
              {status === "all" ? "All" : status} ({count})
            </button>
          );
        })}
      </div>

      {/* New payment form */}
      {showForm && (
        <div className="border border-sky-deep rounded-sm p-5 mb-6 space-y-4">
          <h3 className="text-slate-text text-sm font-bold">Process Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={cn(inputClass, "pl-7")}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Payment description"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Card Details</label>
            <div
              ref={cardRef}
              className="border border-sky-deep rounded-sm p-3 min-h-[50px]"
            />
          </div>
          <button
            onClick={handleProcessPayment}
            disabled={processing || !cardReady || !amount}
            className="bg-primary text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-8 py-3.5 flex items-center gap-2 rounded-sm hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Processing...
              </>
            ) : (
              "Charge Card"
            )}
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-16">
          <AlertCircle className="mx-auto text-slate-muted/30 mb-4" size={48} strokeWidth={1} />
          <p className="text-slate-muted text-sm mb-2">{error}</p>
          <p className="text-slate-muted/50 text-xs">
            Add SQUARE_ACCESS_TOKEN and other Square env vars to enable payments.
          </p>
        </div>
      )}

      {/* Payments table */}
      {!error && filteredPayments.length === 0 && (
        <div className="text-center py-16">
          <DollarSign
            className="mx-auto text-slate-muted/30 mb-4"
            size={48}
            strokeWidth={1}
          />
          <p className="text-slate-muted text-sm">
            {payments.length === 0
              ? "No payments found."
              : "No payments match your search."}
          </p>
        </div>
      )}

      {!error && filteredPayments.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sky-deep">
                  <th className="text-left py-3 px-2 text-slate-muted text-xs font-bold tracking-wide uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 text-slate-muted text-xs font-bold tracking-wide uppercase">
                    Amount
                  </th>
                  <th className="text-left py-3 px-2 text-slate-muted text-xs font-bold tracking-wide uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 text-slate-muted text-xs font-bold tracking-wide uppercase">
                    Note
                  </th>
                  <th className="text-left py-3 px-2 text-slate-muted text-xs font-bold tracking-wide uppercase">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b border-sky-deep/50">
                    <td className="py-3 px-2 text-slate-muted text-sm whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="py-3 px-2 text-slate-text font-bold text-sm">
                      {formatAmount(p.amount)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-1 rounded-sm",
                          statusColor(p.status)
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-muted text-sm max-w-[200px] truncate">
                      {p.description || "—"}
                    </td>
                    <td className="py-3 px-2">
                      {p.receiptUrl && (
                        <a
                          href={p.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="border border-sky-deep rounded-sm p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-text font-bold text-sm">
                    {formatAmount(p.amount)}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded-sm",
                      statusColor(p.status)
                    )}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-slate-muted text-xs">
                  {formatDate(p.createdAt)}
                </p>
                {p.description && (
                  <p className="text-slate-muted text-sm">{p.description}</p>
                )}
                {p.receiptUrl && (
                  <a
                    href={p.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs font-bold hover:text-primary-dark transition-colors flex items-center gap-1"
                  >
                    View Receipt <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
