import Header from "../components/Header";

export const metadata = {
  title: "MicroCourse LMS",
  description: "Learn with micro-courses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{maxWidth:900, margin:"0 auto"}}>
        <Header />
        <main style={{ padding:"16px" }}>{children}</main>
      </body>
    </html>
  );
}
