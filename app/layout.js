export const metadata = {
  title: "MicroCourse LMS",
  description: "Start learning with micro courses today.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
