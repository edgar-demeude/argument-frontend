"use client";
import { forwardRef } from "react";
import GraphWrapper, { GraphWrapperRef } from "../components/GraphWrapper";
import { GraphData, GraphNode } from "../components/types";

interface ABAGraph3DProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
  is3D: boolean;
}

const ABAGraph3D = forwardRef<GraphWrapperRef, ABAGraph3DProps>(
  ({ graphData, onNodeClick, is3D }, ref) => (
    <GraphWrapper
      ref={ref}
      is3D={is3D}
      graphData={graphData}
      onNodeClick={onNodeClick}
      nodeLabel={(node) => node.text ?? node.id ?? "unknown"}
      linkColor={(link) => link.color ?? "#34d399"}
      linkCurvature={(link) => (link.source === link.target ? 0.5 : 0.2)}
      linkArrowLength={(link) =>
        link.label === "Attack" ||
          link.label === "Normal Attack" ||
          link.label === "Reverse Attack"
          ? 6
          : 0
      }
      linkWidth={(link) => {
        if (link.label === "Reverse Attack") return 0.5;
        if (link.label === "Attack" || link.label === "Normal Attack") return 1; // standard
        return 1.5; // fallback
      }}
    />
  )
);

ABAGraph3D.displayName = "ABAGraph3D";
export default ABAGraph3D;
