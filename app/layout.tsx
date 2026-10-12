import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "./island.css";
import "./race-map.css";

export const metadata: Metadata = {
  title: "Cowes Week Live | Sailing & Powerboat Race Centre",
  description: "Follow the fleet. Manage the race. A connected sailing and powerboat event centre for Cowes.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
