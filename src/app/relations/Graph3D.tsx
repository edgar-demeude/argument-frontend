"use client";
import dynamic from "next/dynamic";
import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { GraphData } from "./types"

// Charge aframe dynamiquement côté client
const loadAFrame = async () => {
  if (typeof window !== "undefined") {
    await import("aframe");
  }
};

const ForceGraph3D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph3D),
  { ssr: false }
);

export interface Graph3DRef {
  zoomToFit: (duration?: number, padding?: number) => void;
}

interface Graph3DProps {
  graphData: GraphData;
  onNodeClick: (node: any) => void;
}

const Graph3D = forwardRef<Graph3DRef, Graph3DProps>(
  ({ graphData, onNodeClick }, ref) => {
    const fgRef = useRef<any>(null);

    // Charge aframe au montage du composant
    useEffect(() => {
      loadAFrame();
    }, []);

    useImperativeHandle(ref, () => ({
      zoomToFit: (duration = 400, padding = 50) => {
        fgRef.current?.zoomToFit?.(duration, padding);
      },
    }));

    useEffect(() => {
      if (fgRef.current && graphData.nodes.length > 0) {
        fgRef.current.zoomToFit(400, 50);
      }
    }, [graphData]);

    return (
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#1e293b"
        nodeLabel="id"
        linkWidth={3}
        linkLabel="label"
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={(link: any) =>
          typeof link.label === "string" && link.label.startsWith("Attack") ? 6 : 0
        }
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.2}
        onNodeClick={onNodeClick}
        linkColor={(link: any) =>
          typeof link.label === "string" && link.label.startsWith("Attack") ? "#f87171" : "#34d399"
        }
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.4}
        nodeRelSize={8}
      />
    );
  }
);

Graph3D.displayName = "Graph3D";
export default Graph3D;
