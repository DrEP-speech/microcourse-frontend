import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MicroCourse LMS",
  description: "Learn micro-courses quickly.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* data-theme hook if you add themes later */}
      <body className={inter.className} data-theme="light">
        {children}
      </body>
    </html>
  );
}
