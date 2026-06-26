export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ minHeight: "100vh" }}>
      {children}
    </section>
  );
}

