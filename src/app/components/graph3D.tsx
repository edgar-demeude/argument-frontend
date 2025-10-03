"use client";
import dynamic from "next/dynamic";
import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { GraphData, GraphNode } from "./types";

// Client-side ForceGraph3D dynamic import only
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

const Graph3D = forwardRef<Graph3DRef, Graph3DProps>(({ graphData, onNodeClick }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [aframeLoaded, setAframeLoaded] = useState(false);

  // Customer-side AFRAME load only
  useEffect(() => {
    if (typeof window !== "undefined" && !aframeLoaded) {
      import("aframe")
        .then(() => setAframeLoaded(true))
        .catch((err) => console.error("Erreur lors du chargement d'Aframe :", err));
    }
  }, [aframeLoaded]);

  useImperativeHandle(ref, () => ({
    zoomToFit: (duration = 400, padding = 50) => {
      fgRef.current?.zoomToFit?.(duration, padding);
    },
  }));

  // Dynamic rezise
  useEffect(() => {
    const handleResize = () => {
      if (fgRef.current && containerRef.current) {
        fgRef.current.width = containerRef.current.clientWidth;
        fgRef.current.height = containerRef.current.clientHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto zoom on data
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.zoomToFit?.(400, 50);
    }
  }, [graphData]);

  if (!aframeLoaded) return <div className="w-full h-full flex items-center justify-center text-white">Loading 3D engine...</div>;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ForceGraph3D
        ref={fgRef}
        width={containerRef.current?.clientWidth}
        height={containerRef.current?.clientHeight}
        graphData={graphData}
        backgroundColor="#1e293b"
        nodeLabel="id"
        linkLabel="label"
        nodeAutoColorBy="id"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkDirectionalArrowLength={(link: any) => (link.label === "attack" ? 6 : 0)}
        linkDirectionalArrowRelPos={1}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkCurvature={(link: any) =>
          link.source === link.target ? 0.5 : 0.2
        }
        onNodeClick={(node) => onNodeClick(node as GraphNode)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkColor={(link: any) =>
          link.label === "attack" ? "#f87171" : "#34d399"
        }
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.4}
        nodeRelSize={8}
      />
    </div>
  );
});

Graph3D.displayName = "Graph3D";

export default Graph3D;