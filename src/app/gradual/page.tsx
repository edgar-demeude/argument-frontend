"use client";

import React, { useState } from "react";
import GradualPanel from "./gradualPanel";
import Gradual3D from "./Gradual3D";
import { GradualInput, GradualOutput } from "./types";
import { API_URL } from "../../../config";


export default function Page() {
  const [data, setData] = useState<GradualOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json = JSON.parse(text) as GradualOutput;
      setData(json);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* LEFT PANEL */}
      <div className="w-1/4 bg-gray-800 p-5 overflow-y-auto text-white flex-shrink-0">
        <GradualPanel onRun={handleCompute} />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6 overflow-hidden">
        {loading && (
          <div className="text-sm mb-2 opacity-70">Computing results…</div>
        )}
        {error && (
          <div className="text-sm text-red-500 mb-2">Error: {error}</div>
        )}
        {data && (
          <div className="text-sm mb-4 opacity-90">
            <div>
              <strong>Axes:</strong>{" "}
              {data.axes && data.axes.length ? data.axes.join(", ") : "—"}
            </div>
            <div>
              <strong>Hull Volume:</strong>{" "}
              {data.hull_volume?.toFixed(4) ?? "—"}
            </div>
            <div>
              <strong>Hull Area:</strong>{" "}
              {data.hull_area?.toFixed(4) ?? "—"}
            </div>
          </div>
        )}

        <div className="flex-1 w-full h-full">
          <Gradual3D data={data} />
        </div>
      </div>
    </div>
  );
}
