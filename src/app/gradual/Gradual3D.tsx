"use client";
import Plot from "react-plotly.js";
import { GradualResult } from "./types";

export default function Gradual3D({ data }: { data: GradualResult }) {
  const { samples, hull_points } = data;
  return (
    <Plot
      data={[
        {
          x: samples.map((p) => p[0]),
          y: samples.map((p) => p[1]),
          z: samples.map((p) => p[2] || 0),
          mode: "markers",
          type: "scatter3d",
          marker: { size: 2, opacity: 0.6, color: "blue" },
          name: "Samples",
        },
        {
          x: hull_points.map((p) => p[0]),
          y: hull_points.map((p) => p[1]),
          z: hull_points.map((p) => p[2] || 0),
          mode: "markers",
          type: "scatter3d",
          marker: { size: 3, color: "white" },
          name: "Hull Vertices",
        },
      ]}
      layout={{
        scene: {
          xaxis: { title: { text: "X" } },
          yaxis: { title: { text: "Y" } },
          zaxis: { title: { text: "Z" } }
        },
        title: { text: "3D Gradual Semantics Projection" },
        paper_bgcolor: "#111",
        plot_bgcolor: "#111",
        font: { color: "#fff" },
      }}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
