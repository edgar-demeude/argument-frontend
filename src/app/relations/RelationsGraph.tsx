"use client";
import { forwardRef } from "react";
import GraphWrapper, { GraphWrapperRef } from "../components/GraphWrapper";
import { GraphData, GraphNode } from "../components/types";
import { LinkObject } from "react-force-graph-3d";

interface RelationsGraphProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
  is3D: boolean;
  loading?: boolean;
}

const RelationsGraph = forwardRef<GraphWrapperRef, RelationsGraphProps>(
  ({ graphData, onNodeClick, is3D }, ref) => {
    const linkColor = (link: LinkObject): string => {
      if (typeof link.label === "string") {
        return link.label.includes("Support") ? "#34d399" : "#f87171";
      }
      return "#999999";
    };

    return (
      <GraphWrapper
        ref={ref}
        graphData={graphData}
        onNodeClick={onNodeClick}
        is3D={is3D}
        linkColor={linkColor}
        linkArrowLength={() => 4}
        linkCurvature={() => 0.15}
        linkWidth={() => 1}
      />
    );
  }
);

RelationsGraph.displayName = "RelationsGraph";
export default RelationsGraph;
