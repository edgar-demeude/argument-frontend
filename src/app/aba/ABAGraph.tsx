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
      linkColor={(link) => {
        if (link.label === "attack") return "#f87171"; // red
        if (link.label === "reverse") return "#60a5fa"; // blue
        return "#34d399"; // green fallback
      }}
      linkCurvature={(link) => link.source === link.target ? 0.5 : 0.2}
      linkArrowLength={(link) => (link.label === "attack" || link.label === "reverse" ? 6 : 0)}
      linkWidth={(link) => (link.label === "attack" ? 1 : link.label === "reverse" ? 0.5 : 1.5)}
    />
  )
);

ABAGraph3D.displayName = "ABAGraph3D";
export default ABAGraph3D;
