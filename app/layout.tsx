import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { VaultProvider } from "@/lib/vault-context";
import { CommandPalette } from "@/components/CommandPalette";
import { RouteProgress } from "@/components/RouteProgress";

export const metadata: Metadata = {
  title: "VaultX — Zero-Knowledge Password Manager",
  description: "AES-256-GCM encrypted password vault with breach detection and strength analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <RouteProgress />
        <VaultProvider>
          <div className="page-bg min-h-screen">
            <div className="grid-overlay" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
          <CommandPalette />
        </VaultProvider>
        <Toaster theme="dark" position="bottom-right" richColors toastOptions={{
          style: { background: "rgba(13,13,26,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }
        }} />
      </body>
    </html>
  );
}
