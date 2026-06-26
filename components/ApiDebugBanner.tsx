"use client";

import { useMemo } from "react";
import api, { getApiBase as getApiBaseNamed } from "@/lib/api";

export default function ApiDebugBanner() {
  const getBase = (typeof getApiBaseNamed === "function") ? getApiBaseNamed : api.getApiBase;
  const base = useMemo(() => getBase(), []);

  return (
    <div style={{
      padding: "10px 12px",
      borderRadius: 10,
      background: "#111",
      color: "#eee",
      marginBottom: 14,
      fontSize: 13,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap"
    }}>
      <div><b>API Base:</b> {base || "(relative / empty)"} </div>
      <div style={{ opacity: 0.85 }}>
        <b>Tip:</b> Set <code>NEXT_PUBLIC_API_BASE</code> for cloud builds
      </div>
    </div>
  );
}