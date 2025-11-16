import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Golf Practice Sessions",
  description: "Log and analyze your golf practice sessions over time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white/80 backdrop-blur">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold tracking-tight">
                  Golf Practice Tracker
                </div>
                <div className="text-xs text-slate-500">
                  Log sessions, track trends, stay out of swing chaos.
                </div>
              </div>
              <span className="hidden sm:inline-flex text-[10px] px-2 py-1 rounded-full bg-slate-900 text-slate-100 uppercase tracking-wide">
                Personal lab
              </span>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t bg-white/80 backdrop-blur">
            <div className="max-w-3xl mx-auto px-4 py-2 text-[11px] text-slate-500 flex justify-between">
              <span>Built for repetition and feedback loops.</span>
              <span>v0.1</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
