"use client";
import dynamic from "next/dynamic";
import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { GraphData, GraphNode } from "./types";
import { LinkObject } from "react-force-graph-3d";
import { ForceGraphMethods } from "react-force-graph-3d";

const ForceGraph3D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph3D),
  { ssr: false }
);

export interface Graph3DRef {
  zoomToFit: (duration?: number, padding?: number) => void;
}

interface BaseGraph3DProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
  linkColor?: (link: LinkObject) => string;
  linkCurvature?: (link: LinkObject) => number;
  linkArrowLength?: (link: LinkObject) => number;
  linkWidth?: (link: LinkObject) => number;
}

const Graph3DBase = forwardRef<Graph3DRef, BaseGraph3DProps>(
  ({ graphData, onNodeClick, linkColor, linkWidth, linkCurvature, linkArrowLength }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [aframeLoaded, setAframeLoaded] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Load AFRAME only on client
    useEffect(() => {
      if (typeof window !== "undefined" && !aframeLoaded) {
        import("aframe")
          .then(() => setAframeLoaded(true))
          .catch((err) => console.error("Error loading AFrame:", err));
      }
    }, [aframeLoaded]);

    useImperativeHandle(ref, () => ({
      zoomToFit: (duration = 400, padding = 50) => {
        fgRef.current?.zoomToFit?.(duration, padding);
      },
    }));

    useEffect(() => {
    const handleResize = () => {
        if (containerRef.current) {
        setDimensions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
        });
        }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Auto zoom
    useEffect(() => {
      if (fgRef.current && graphData.nodes.length > 0) {
        fgRef.current.zoomToFit?.(400, 50);
      }
    }, [graphData]);

    if (!aframeLoaded)
      return <div className="w-full h-full flex items-center justify-center text-white">Loading 3D engine...</div>;

    return (
      <div ref={containerRef} className="w-full h-full relative">
        <ForceGraph3D
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={fgRef as any}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor="#1e293b"
            nodeLabel="id"
            linkLabel="label"
            nodeAutoColorBy="id"
            linkDirectionalArrowLength={linkArrowLength ?? (() => 0)}
            linkDirectionalArrowRelPos={1}
            linkCurvature={linkCurvature ?? (() => 0.2)}
            linkColor={linkColor ?? (() => "#aaa")}
            linkWidth={linkWidth ?? (() => 1.5)}
            onNodeClick={(node) => onNodeClick(node as GraphNode)}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.4}
            nodeRelSize={8}
        />
      </div>
    );
  }
);

Graph3DBase.displayName = "Graph3DBase";
export default Graph3DBase;
