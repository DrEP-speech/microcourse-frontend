import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "MicroCourse",
  description: "Bite-sized courses, real quizzes, real progress.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#080d1a",
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
