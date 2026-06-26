import HealthCheckClient from "@/components/HealthCheckClient";

export default function HealthPage() {
  return (
    <div style={{ padding: 24, background: "#fff", color: "#111", minHeight: "100vh" }}>
      <div style={{ padding: 12, border: "3px solid #111", borderRadius: 12, display: "inline-block" }}>
        <strong>HEALTH PAGE RENDERING ✅</strong>
      </div>
      <div style={{ height: 16 }} />
      <HealthCheckClient />
    </div>
  );
}