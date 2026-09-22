import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; // Safe optimized high-performance script loader component wrapper
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlightWatcher - Cheap Flight Alerts & Mistake Fares",
  description: "Discover cheap flights, hidden deals, and mistake fares before everyone else.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ========================================================= */}
        {/* FIXED GOOGLE TAG MANAGER CONFIGURATION LAYERS             */}
        {/* ========================================================= */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XN595EZ5ZD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-XN595EZ5ZD');
          `}
        </Script>
        {/* ========================================================= */}
        {/* GOOGLE SITE INDEX VERIFICATION LAYER                      */}
        {/* ========================================================= */}
        <meta name="google-site-verification" content="google276e65e34d107ed1" /> 
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
