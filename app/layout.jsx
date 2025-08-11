import "./globals.css";
import Header from "../components/Header";

export const metadata = {
  title: "MicroCourse LMS",
  description: "Learning made simple",
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  themeColor: "#000000",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
