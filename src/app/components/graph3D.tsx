"use client";
import dynamic from "next/dynamic";
import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { GraphData, GraphNode } from "./types";

// Import dynamique de ForceGraph3D côté client uniquement
const ForceGraph3D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph3D),
  { ssr: false }
);

export interface Graph3DRef {
  zoomToFit: (duration?: number, padding?: number) => void;
}

interface Graph3DProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ForceGraphRef {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zoomToFit?: (duration: number, padding: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const Graph3D = forwardRef<Graph3DRef, Graph3DProps>(
  ({ graphData, onNodeClick }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fgRef = useRef<any>(null);

    // Charger aframe uniquement côté client
    useEffect(() => {
      import("aframe");
    }, []);

    // expose zoomToFit method to parent
    useImperativeHandle(ref, () => ({
      zoomToFit: (duration = 400, padding = 50) => {
        fgRef.current?.zoomToFit?.(duration, padding);
      },
    }));

    // auto zoom when graphData changes
    useEffect(() => {
      if (fgRef.current && graphData.nodes.length > 0) {
        fgRef.current.zoomToFit?.(400, 50);
      }
    }, [graphData]);

    return (
      <ForceGraph3D
        ref={fgRef}
        width={undefined}
        height={undefined}
        graphData={graphData}
        backgroundColor="#1e293b"
        nodeLabel="id"
        linkLabel="label"
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={(link) => {
          const label = (link as { label?: string }).label;
          return typeof label === "string" && label.startsWith("Attack") ? 6 : 0;
        }}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.2}
        onNodeClick={(node) => {
          const graphNode = node as GraphNode;
          onNodeClick(graphNode);
        }}
        linkColor={(link) => {
          const label = (link as { label?: string }).label;
          return typeof label === "string" && label.startsWith("Attack") ? "#f87171" : "#34d399";
        }}
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.4}
        nodeRelSize={8}
      />
    );
  }
);

Graph3D.displayName = "Graph3D";

export default Graph3D;