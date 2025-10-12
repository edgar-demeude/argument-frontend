"use client";
import { forwardRef } from "react";
import Graph3DBase, { Graph3DRef } from "../components/graph3DBase";
import { GraphData, GraphNode } from "../components/types";

interface ABAGraph3DProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
}

const ABAGraph3D = forwardRef<Graph3DRef, ABAGraph3DProps>(
  ({ graphData, onNodeClick }, ref) => {
    return (
      <Graph3DBase
        ref={ref}
        graphData={graphData}
        onNodeClick={onNodeClick}
        linkColor={(link) => {
          if (link.label === "attack") return "#f87171"; // red
          if (link.label === "reverse") return "#60a5fa"; // blue
          return "#34d399"; // green fallback
        }}
        linkCurvature={(link) =>
          link.source === link.target ? 0.5 : 0.2
        }
        linkArrowLength={(link) =>
          link.label === "attack" || link.label === "reverse" ? 6 : 0
        }
        linkWidth={(link) => {
          if (link.label === "attack") return 1;
          if (link.label === "reverse") return 0.5;
          return 1.8;
        }}
      />
    );
  }
);

ABAGraph3D.displayName = "ABAGraph3D";
export default ABAGraph3D;
