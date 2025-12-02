import "./globals.css";

export const metadata = {
  title: "ReLink",
  description: "ReLink FE skeleton",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
