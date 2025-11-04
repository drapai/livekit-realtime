import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent 007 - LiveKit Voice Agent",
  description: "Connect and communicate with your AI assistant",
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
