"use client";

import { useRef, useState, useEffect } from "react";
import GradualPanel from "./GradualPanel";
import Gradual3D from "./Gradual3D";
import { GradualInput, GradualOutput } from "./types";
import { API_URL } from "../../../config";
import GradualResultsPanel from "./GradualResultsPanel";

export default function GradualPage() {
  const [data, setData] = useState<GradualOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showHull, setShowHull] = useState(true);

  const graphRef = useRef<{ zoomToFit?: (ms?: number, pad?: number) => void } | null>(null);

  // --- Zoom and resize handling ---
  const zoomGraph = (delay = 150) => {
    setTimeout(() => graphRef.current?.zoomToFit?.(400, 50), delay);
  };

  useEffect(() => {
    zoomGraph(200);
  }, []);

  useEffect(() => {
    const resize = () => {
      window.dispatchEvent(new Event("resize"));
      graphRef.current?.zoomToFit?.(400, 50);
    };

    const timer1 = setTimeout(resize, 100);
    const timer2 = setTimeout(resize, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // --- Compute request ---
  async function handleCompute(payload: GradualInput) {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${API_URL}/gradual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

      const json = JSON.parse(text) as GradualOutput;
      setData(json);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen" style={{ height: "calc(100vh - 64px)" }}>
      {/* LEFT PANEL */}
      <GradualPanel
        onRun={handleCompute}
        showHull={showHull}
        setShowHull={setShowHull}
      />

      {/* CENTER GRAPH */}
      <div className="flex-1 h-full overflow-hidden relative bg-[var(--background)] text-[var(--foreground)]">
        {/* --- LOADING ANIMATION --- */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[color-mix(in_oklab,var(--background)_85%,transparent)] backdrop-blur-sm">
            <div className="relative w-14 h-14">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-l-blue-400 animate-[spin_1.2s_linear_infinite_reverse]"></div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-500 animate-pulse">
              Computing results…
            </p>
          </div>
        )}

        {/* --- ERROR --- */}
        {error && (
          <div className="absolute top-4 left-4 text-sm text-red-500 z-20">
            Error: {error}
          </div>
        )}

        {/* --- GRAPH --- */}
        <Gradual3D data={data} showHull={showHull} />

      </div>

      {/* RIGHT RESULTS PANEL */}
      <GradualResultsPanel data={data} />

    </div>
  );
}
