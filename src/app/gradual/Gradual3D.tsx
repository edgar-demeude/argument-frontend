"use client";

import React from "react";
import dynamic from "next/dynamic";
import { GradualOutput } from "./types";

// Dynamically import Plotly (avoids `self is not defined` under Turbopack)
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full w-full text-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-l-blue-400 animate-[spin_1.2s_linear_infinite_reverse]"></div>
      </div>
      <p className="mt-6 text-lg font-medium text-gray-500 animate-pulse">
        Loading 3D plot…
      </p>
    </div>
  ),
});


type Props = {
  data: GradualOutput | null;
  showHull?: boolean;
};

export default function Gradual3D({ data, showHull = true }: Props) {
  if (!data) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="text-xl font-semibold text-[var(--accent)] animate-pulse">
            No data yet
          </div>
          <div className="text-sm text-[color-mix(in_oklab,var(--foreground)_80%,transparent)]">
            Upload or generate a dataset to visualize it here.
          </div>
        </div>
      </div>
    );
  }

  const axes = data.axes ?? [];
  const pts = data.samples ?? [];
  const hullPts = data.hull_points ?? [];

  const dim = Math.min(3, Math.max(1, axes.length || data.num_args || 1));

  // Récupération dynamique des couleurs CSS (exécuté côté client uniquement)
  const rootStyle = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const background = (rootStyle?.getPropertyValue("--background") || "#111").trim();
  const foreground = (rootStyle?.getPropertyValue("--foreground") || "#fff").trim();
  const accent = (rootStyle?.getPropertyValue("--accent") || "dodgerblue").trim();

  const baseLayout = {
    paper_bgcolor: background,
    plot_bgcolor: background,
    font: { color: foreground },
    showlegend: true,
  };

  // ----- 1D -----
  if (dim === 1) {
    const x = pts.map((p) => p[0]);
    const xmin = x.length ? Math.min(...x) : 0;
    const xmax = x.length ? Math.max(...x) : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traces: any[] = [
      {
        x,
        y: x.map(() => 0),
        type: "scatter",
        mode: "markers",
        name: "Samples",
        marker: { size: 6, opacity: 0.6, color: accent },
      },
      {
        x: [xmin, xmax],
        y: [0, 0],
        type: "scatter",
        mode: "lines",
        name: "Convex Hull",
        line: { color: foreground },
      },
    ];

    return (
      <Plot
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={traces as any}
        layout={{
          ...baseLayout,
          title: { text: `1D Convex Hull (${axes[0] ?? "A"})` },
          xaxis: { title: { text: axes[0] ?? "A" }, color: foreground },
          yaxis: { visible: false },
        }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  // ----- 2D -----
  if (dim === 2) {
    const x = pts.map((p) => p[0]);
    const y = pts.map((p) => p[1]);

    const hx = hullPts.map((p) => p[0]);
    const hy = hullPts.map((p) => p[1]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traces: any[] = [
      {
        x,
        y,
        type: "scatter",
        mode: "markers",
        name: "Samples",
        marker: { size: 5, opacity: 0.6, color: accent },
      },
    ];

    if (hullPts.length >= 3) {
      traces.push({
        x: [...hx, hx[0]],
        y: [...hy, hy[0]],
        type: "scatter",
        mode: "lines+markers",
        name: "Convex Hull",
        line: { color: foreground },
        marker: { size: 4, color: foreground },
      });
    }

    return (
      <Plot
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={traces as any}
        layout={{
          ...baseLayout,
          title: { text: `2D Projection (${axes[0] ?? "A"}, ${axes[1] ?? "B"})` },
          xaxis: { title: { text: axes[0] ?? "A" }, color: foreground },
          yaxis: { title: { text: axes[1] ?? "B" }, color: foreground },
        }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  // --- 3D only ---
  if (dim === 3) {
    const x = pts.map((p) => p[0]);
    const y = pts.map((p) => p[1]);
    const z = pts.map((p) => p[2]);

    const hx = hullPts.map((p) => p[0]);
    const hy = hullPts.map((p) => p[1]);
    const hz = hullPts.map((p) => p[2]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traces: any[] = [
      {
        x,
        y,
        z,
        type: "scatter3d",
        mode: "markers",
        name: "Points",
        marker: { size: 3, opacity: 0.6, color: accent },
      },
    ];

    if (showHull && hullPts.length >= 4) {
      // Mesh hull gris semi-transparent
      traces.push({
        x: hx,
        y: hy,
        z: hz,
        type: "mesh3d",
        name: "Convex Hull Mesh",
        opacity: 0.15,
        color: "gray",
        alphahull: 0,
        flatshading: true,
      });

      // Hull vertices
      traces.push({
        x: hx,
        y: hy,
        z: hz,
        type: "scatter3d",
        mode: "markers",
        name: "Hull Vertices",
        marker: { size: 3, color: foreground },
      });
    }

    return (
      <Plot
        data={traces}
        layout={{
          ...baseLayout,
          title: {
            text: `3D Projection (${axes[0] ?? "A"}, ${axes[1] ?? "B"}, ${axes[2] ?? "C"})`,
          },
          scene: {
            xaxis: { title: { text: axes[0] ?? "A" }, color: foreground, gridcolor: "rgba(127,127,127,0.3)" },
            yaxis: { title: { text: axes[1] ?? "B" }, color: foreground, gridcolor: "rgba(127,127,127,0.3)" },
            zaxis: { title: { text: axes[2] ?? "C" }, color: foreground, gridcolor: "rgba(127,127,127,0.3)" },
            bgcolor: background,
          },
        }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  return <div>Non-3D view not changed</div>;
}
