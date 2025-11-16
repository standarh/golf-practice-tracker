import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Golf Practice Tracker",
  description: "Log sessions, track trends, and improve your swing.",
  manifest: "/manifest.webmanifest",
  themeColor: "#22c55e"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
