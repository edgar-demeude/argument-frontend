"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import "aframe";
import { GraphData } from "./types";

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

    // expose zoomToFit method to parent
    useImperativeHandle(ref, () => ({
      zoomToFit: (duration = 400, padding = 50) => {
        fgRef.current?.zoomToFit?.(duration, padding);
      },
    }));

    // auto zoom when graphData changes
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
        // Physics tweaks to make nodes cluster better
        d3AlphaDecay={0.05}        // slower decay = more time to settle
        d3VelocityDecay={0.4}      // less friction, nodes spread nicely
        // linkDistance={120}          // smaller = tighter graph
        nodeRelSize={8}             // size of nodes
        />

    );
  }
);

Graph3D.displayName = "Graph3D";

export default Graph3D;
