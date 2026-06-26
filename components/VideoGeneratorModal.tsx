"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type Props = {
  lessonId: string;
  onClose: () => void;
  brandColor?: string;
};

type GenerateResp =
  | { jobId?: string; fileUrl?: string; url?: string }
  | { data?: { jobId?: string; fileUrl?: string; url?: string } };

export default function VideoGeneratorModal({
  lessonId,
  onClose,
  brandColor = "#2563eb",
}: Props): React.ReactElement {
  const [prompt, setPrompt] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const headerStyle = useMemo(
    () => ({
      background: brandColor,
      color: "white",
      padding: "12px 16px",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      fontWeight: 700 as const,
    }),
    [brandColor]
  );

  const close = () => {
    setErr(null);
    setLoading(false);
    onClose();
  };

  const extract = (res: any) => {
    const r: any = res?.data ?? res;
    return {
      jobId: r?.jobId ?? r?.data?.jobId ?? null,
      url: r?.fileUrl ?? r?.url ?? r?.data?.fileUrl ?? r?.data?.url ?? null,
    };
  };

  const startGenerate = async () => {
    setErr(null);
    setLoading(true);
    setFileUrl(null);
    setJobId(null);

    try {
      // You can change the endpoint later to match your backend.
      // This is runtime-only; compile will be clean either way.
      const res = await api.post<GenerateResp>("/ai/video/generate", {
        lessonId,
        prompt,
      });

      const { jobId: j, url } = extract(res);

      if (url) {
        setFileUrl(url);
        setLoading(false);
        return;
      }

      if (!j) {
        setErr("No jobId or url returned from server.");
        setLoading(false);
        return;
      }

      setJobId(j);
      setLoading(false);
    } catch (e: any) {
      setErr(e?.message ?? "Video generation failed.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;

    let alive = true;
    const interval = setInterval(async () => {
      try {
        // Poll endpoint (adjust later if your backend differs)
        const res = await api.get("/ai/video/status/" + encodeURIComponent(jobId));
        const { url } = extract(res);

        if (alive && url) {
          setFileUrl(url);
          setJobId(null);
          clearInterval(interval);
        }
      } catch {
        // silent polling errors; keep trying
      }
    }, 2500);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [jobId]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
      onClick={close}
    >
      <div
        style={{
          width: "min(720px, 96vw)",
          background: "#0b0b0c",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>AI Video Generator</div>

        <div style={{ padding: 16, color: "white" }}>
          <div style={{ opacity: 0.9, marginBottom: 10 }}>
            Lesson: <b>{lessonId}</b>
          </div>

          <label style={{ display: "block", marginBottom: 8, opacity: 0.9 }}>
            Prompt (optional)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Create a 30–45 second recap with key points + 3 quiz-style takeaways…"
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              resize: "vertical",
              outline: "none",
            }}
          />

          {err ? (
            <div style={{ marginTop: 10, color: "#ff6b6b" }}>{err}</div>
          ) : null}

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              onClick={startGenerate}
              disabled={loading}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: brandColor,
                color: "white",
                fontWeight: 700,
              }}
            >
              {loading ? "Working…" : "Generate Video"}
            </button>

            <button
              onClick={close}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "transparent",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Close
            </button>
          </div>

          {jobId ? (
            <div style={{ marginTop: 12, opacity: 0.85 }}>
              Job started: <b>{jobId}</b> (polling…)
            </div>
          ) : null}

          {fileUrl ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ marginBottom: 8, opacity: 0.9 }}>Result:</div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: brandColor, fontWeight: 700 }}
              >
                Open generated video
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

