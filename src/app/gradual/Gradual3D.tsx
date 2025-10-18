"use client";

import React from "react";
import dynamic from "next/dynamic";
import { GradualOutput } from "./types";

// Dynamically import Plotly (avoids `self is not defined` under Turbopack)
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <div className="text-sm opacity-70">Loading 3D plot…</div>,
});

type Props = {
  data: GradualOutput | null;
};

export default function Gradual3D({ data }: Props) {
  if (!data) return <div className="text-sm opacity-70">No data yet.</div>;

  const axes = data.axes ?? [];
  const pts = data.samples ?? [];
  const hullPts = data.hull_points ?? [];

  // Determine effective dimension from payload
  const dim = Math.min(3, Math.max(1, axes.length || data.num_args));

  const theme = {
    paper_bgcolor: "var(--background)",
    plot_bgcolor: "var(--background)",
    font: { color: "var(--foreground)" },
  };

  // ----- 1D -----
  if (dim === 1) {
    const x = pts.map((p) => p[0]);
    const xmin = x.length ? Math.min(...x) : 0;
    const xmax = x.length ? Math.max(...x) : 0;

    return (
      <Plot
        data={[
          {
            x,
            y: x.map(() => 0),
            type: "scatter",
            mode: "markers",
            name: "Samples",
            marker: { size: 6, opacity: 0.6, color: "blue" },
          },
          {
            x: [xmin, xmax],
            y: [0, 0],
            type: "scatter",
            mode: "lines",
            name: "Convex Hull",
            line: { color: "var(--foreground)" },
          },
        ]}
        layout={{
          ...theme,
          height: 520,
          margin: { t: 60, r: 20, b: 50, l: 55 },
          title: {
            text: `1D Convex Hull (${axes[0] ?? "A"})`,
          },
          xaxis: {
            title: { text: axes[0] ?? "A" },
            color: "var(--foreground)",
          },
          yaxis: { visible: false },
          showlegend: true,
        }}
        style={{ width: "100%" }}
      />
    );
  }

  // ----- 2D -----
  if (dim === 2) {
    const x = pts.map((p) => p[0]);
    const y = pts.map((p) => p[1]);

    const hx = hullPts.map((p) => p[0]);
    const hy = hullPts.map((p) => p[1]);

    return (
      <Plot
        data={
          [
            {
              x,
              y,
              type: "scatter",
              mode: "markers",
              name: "Points",
              marker: { size: 5, opacity: 0.6, color: "blue" },
            },
            ...(hullPts.length >= 3
              ? [
                {
                  x: [...hx, hx[0]],
                  y: [...hy, hy[0]],
                  type: "scatter",
                  mode: "lines+markers",
                  name: "Convex Hull",
                  line: { color: "var(--foreground)" },
                  marker: { size: 4, color: "var(--foreground)" },
                },
              ]
              : []),
          ] as any
        }
        layout={{
          ...theme,
          height: 700,
          margin: { t: 60, r: 20, b: 50, l: 55 },
          title: {
            text: `2D Projection (${axes[0] ?? "A"}, ${axes[1] ?? "B"})`,
          },
          xaxis: {
            title: { text: axes[0] ?? "A" },
            color: "var(--foreground)",
          },
          yaxis: {
            title: { text: axes[1] ?? "B" },
            color: "var(--foreground)",
          },
          showlegend: true,
        }}
        style={{ width: "100%" }}
      />
    );
  }

  // ----- 3D -----
  const x = pts.map((p) => p[0]);
  const y = pts.map((p) => p[1]);
  const z = pts.map((p) => p[2]);

  const hx = hullPts.map((p) => p[0]);
  const hy = hullPts.map((p) => p[1]);
  const hz = hullPts.map((p) => p[2]);

  const traces: any[] = [
    {
      x,
      y,
      z,
      type: "scatter3d",
      mode: "markers",
      name: "Points",
      marker: { size: 3, opacity: 0.6, color: "blue" },
    },
  ];

  if (hullPts.length >= 4) {
    traces.push({
      x: hx,
      y: hy,
      z: hz,
      type: "scatter3d",
      mode: "markers",
      name: "Hull Vertices",
      marker: { size: 3, color: "red" },
    });
  }

  return (
    <Plot
      data={traces}
      layout={{
        ...theme,
        height: 800,
        margin: { t: 60, r: 20, b: 50, l: 55 },
        title: {
          text: `3D Projection (${axes[0] ?? "A"}, ${axes[1] ?? "B"}, ${axes[2] ?? "C"
            })`,
        },
        scene: {
          xaxis: {
            title: { text: axes[0] ?? "A" },
            backgroundcolor: "var(--background)",
            color: "var(--foreground)",
            gridcolor: "rgba(127,127,127,0.4)",
          },
          yaxis: {
            title: { text: axes[1] ?? "B" },
            backgroundcolor: "var(--background)",
            color: "var(--foreground)",
            gridcolor: "rgba(127,127,127,0.4)",
          },
          zaxis: {
            title: { text: axes[2] ?? "C" },
            backgroundcolor: "var(--background)",
            color: "var(--foreground)",
            gridcolor: "rgba(127,127,127,0.4)",
          },
          bgcolor: "var(--background)",
        },
        showlegend: true,
      }}
      style={{ width: "100%" }}
    />
  );
}
