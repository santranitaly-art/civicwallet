import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThirdwebProvider } from "thirdweb/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CivicWallet - Portafoglio di Merito Civico",
    template: "%s | CivicWallet",
  },
  description:
    "Il tuo portafoglio digitale di merito civico. Guadagna badge per il tuo volontariato e accedi a benefit esclusivi.",
  keywords: [
    "volontariato",
    "badge",
    "civic wallet",
    "merito civico",
    "blockchain",
    "soulbound token",
  ],
  authors: [{ name: "CivicWallet" }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "CivicWallet",
    title: "CivicWallet - Portafoglio di Merito Civico",
    description:
      "Il tuo portafoglio digitale di merito civico. Guadagna badge per il tuo volontariato.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1a237e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThirdwebProvider>{children}</ThirdwebProvider>
      </body>
    </html>
  );
}
