import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Diurna — Daily Intelligence Briefing",
  description: "AI-powered daily intelligence briefing covering AI, Tech, Finance, Investing, Politics. Bilingual Chinese/English.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${ibmMono.variable} h-full`}>
      <body className="min-h-full bg-[#07070a] text-[#e8e3d8] antialiased">
        {children}
      </body>
    </html>
  );
}
