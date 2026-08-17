import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)] flex items-center justify-center p-6 text-center">
      <div className="card max-w-md w-full p-8 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="badge role font-mono mb-2">404 — PAGE NOT FOUND</span>
          <h2 className="text-2xl font-extrabold text-[var(--text)] mt-1">Resource Not Found</h2>
          <p className="text-xs text-[var(--text-2)] mt-1.5 leading-relaxed">
            The requested console path does not exist or has been decommissioned from the Jira Provisioning Engine.
          </p>
        </div>

        <Link href="/" className="btn btn-primary w-full justify-center py-2.5 mt-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
