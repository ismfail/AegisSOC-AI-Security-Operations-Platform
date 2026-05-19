import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

export function PlatformHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  const links = [
    { href: "/", label: "Command" },
    { href: "/detections", label: "Detections" },
    { href: "/compliance", label: "Compliance" },
    { href: "/api/detections/export", label: "Detection Pack" },
    { href: "/api/stix", label: "STIX Export" }
  ];

  return (
    <header className="border-b border-white/10 bg-void/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg border border-signal/30 bg-signal/15 text-signal shadow-glow">
            <ShieldAlert className="size-7" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-signal">{eyebrow}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">{description}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-medium text-slate-300 hover:border-signal/40 hover:text-signal"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Panel({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="scanlines rounded-xl border border-white/10 bg-panel/70 p-5 shadow-glow">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-glow">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

export function Badge({
  children,
  tone = "muted",
  className = ""
}: {
  children: ReactNode;
  tone?: "green" | "blue" | "orange" | "red" | "muted";
  className?: string;
}) {
  const tones = {
    green: "border-signal/30 bg-signal/10 text-signal",
    blue: "border-blue-400/30 bg-blue-500/10 text-blue-200",
    orange: "border-orange-400/30 bg-orange-500/10 text-orange-200",
    red: "border-red-400/30 bg-red-500/10 text-red-200",
    muted: "border-white/10 bg-white/[0.05] text-slate-300"
  };

  return <span className={`rounded-md border px-2 py-1 text-xs font-medium ${className || tones[tone]}`}>{children}</span>;
}

export function Bar({ label, value, width }: { label: string; value: string; width: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-200">{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-signal" style={{ width: `${Math.min(100, width)}%` }} />
      </div>
    </div>
  );
}

export function EvidenceList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{title}</p>
      <ul className="space-y-1.5 text-sm text-slate-300">
        {rows.map((row) => (
          <li key={row}>- {row}</li>
        ))}
      </ul>
    </div>
  );
}
