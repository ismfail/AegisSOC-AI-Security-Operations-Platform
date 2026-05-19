import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AegisSOC - AI Security Operations Platform",
  description:
    "Autonomous threat hunting, incident triage, RAG threat intelligence, and SOC analytics."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
