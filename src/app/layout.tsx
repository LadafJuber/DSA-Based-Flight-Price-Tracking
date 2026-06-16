import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlightTrack — Real-Time Flight Tracker",
  description: "Track flights, get real-time status updates, and set price alerts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}