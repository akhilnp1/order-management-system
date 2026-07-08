import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Order Management Dashboard",
  description: "Real-time order management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper-soft font-body text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
