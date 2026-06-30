import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "LexiMind Academy",
  description: "Professional learning, CEU-ready education, certification pathways, and clinical growth tools for therapy providers.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Providers>
          <SiteNav />
          <main id="main-content" className="container page">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
