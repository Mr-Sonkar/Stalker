import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Privacy Scanner | Personal Privacy & Exposure Intelligence Dashboard",
  description:
    "Unified single-page intelligence dashboard to scan digital footprints, monitor credential breaches, audit browser hardware entropy, and suppress broker listings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="bg-grid-ambient" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
