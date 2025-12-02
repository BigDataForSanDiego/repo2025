import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareLink SD — Telehealth MVP",
  description: "Intake → Triage → Waiting → Session + Staff Console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="container py-3 flex items-center justify-between">
            <div className="font-bold">CareLink SD</div>
            <nav className="flex gap-3 text-sm flex-wrap">
              <a className="hover:underline" href="/">Home</a>
              <a className="hover:underline" href="/intake">Client</a>
              <a className="hover:underline" href="/resources">Resources</a>
              <a className="hover:underline" href="/shelters">Shelters</a>
              <a className="hover:underline" href="/food">Food</a>
              <a className="hover:underline" href="/affordable-food">Affordable Food</a>
              <a className="hover:underline" href="/hygiene">Hygiene</a>
              <a className="hover:underline" href="/medical">Medical</a>
              <a className="hover:underline" href="/tax-dashboard">Tax Dashboard</a>
              <a className="hover:underline" href="/staff">Staff</a>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="container py-10 text-xs text-gray-500">
          Built for Hackathon: Innovating to Tackle Homelessness in San Diego County.
        </footer>
      </body>
    </html>
  );
}

