"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Unhandled runtime error in Jira Access Management:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] flex items-center justify-center p-6 text-center">
      <div className="card max-w-md w-full p-8 flex flex-col items-center gap-4 border-[var(--risk)] shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-[var(--risk-soft)] text-[var(--risk)] flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-[var(--text)]">Something Went Wrong</h2>
          <p className="text-xs text-[var(--text-2)] mt-1.5 leading-relaxed">
            An unforeseen runtime exception occurred. The error boundary intercepted the failure to prevent a total crash.
          </p>
        </div>

        {error?.message && (
          <div className="w-full p-3 rounded-xl bg-[var(--bg-elev)] border border-[var(--border)] text-left">
            <span className="text-[10px] font-mono text-[var(--text-3)] block uppercase tracking-wider mb-1">Error Trace</span>
            <p className="text-xs font-mono text-[var(--risk)] truncate">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={() => reset()}
            className="btn btn-primary flex-1 justify-center py-2.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recover Session</span>
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="btn btn-ghost flex-1 justify-center py-2.5 text-xs"
          >
            Reset Storage
          </button>
        </div>
      </div>
    </div>
  );
}
