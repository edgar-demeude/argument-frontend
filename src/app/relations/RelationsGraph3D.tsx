"use client";
import { forwardRef } from "react";
import Graph3DBase, { Graph3DRef } from "../components/graph3DBase";
import { GraphData, GraphNode } from "../components/types";

interface RelationsGraph3DProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
}

const RelationsGraph3D = forwardRef<Graph3DRef, RelationsGraph3DProps>(
  ({ graphData, onNodeClick }, ref) => {
    return (
      <Graph3DBase
        ref={ref}
        graphData={graphData}
        onNodeClick={onNodeClick}
        linkColor={(link) =>
          link.label.includes("Support") ? "#34d399" : "#f87171"
        }
        linkArrowLength={() => 4}
        linkCurvature={() => 0.15}
        linkWidth={() => 1}
      />
    );
  }
);

RelationsGraph3D.displayName = "RelationsGraph3D";
export default RelationsGraph3D;
