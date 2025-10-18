import dynamic from "next/dynamic";
import { forwardRef, useRef, useEffect } from "react";
import { GraphData, GraphNode } from "./types";
import { LinkObject } from "react-force-graph-3d";

const ForceGraph3D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph3D),
  { ssr: false }
);

export interface ForceGraph3DComponentRef {
  zoomToFit: (duration?: number, padding?: number) => void;
}

interface ForceGraph3DComponentProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
  linkColor?: (link: LinkObject) => string;
  linkCurvature?: (link: LinkObject) => number;
  linkArrowLength?: (link: LinkObject) => number;
  linkWidth?: (link: LinkObject) => number;
  nodeLabel?: (node: GraphNode) => string;
  width: number;
  height: number;
}

const ForceGraph3DComponent = forwardRef<ForceGraph3DComponentRef, ForceGraph3DComponentProps>(
  ({ graphData, onNodeClick, nodeLabel, linkColor, linkWidth, linkCurvature, linkArrowLength, width, height }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fgRef = useRef<any>(null);

    // Get color from CSS
    const rootStyle = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
    const background = (rootStyle?.getPropertyValue("--background") || "#111").trim();

    useEffect(() => {
      if (!fgRef.current) return;
      const timer = setTimeout(() => {
        fgRef.current?.zoomToFit?.(400, 50);
        fgRef.current?.d3ReheatSimulation?.();
      }, 100);
      return () => clearTimeout(timer);
    }, [graphData]);

    useEffect(() => {
      if (ref && "current" in ref) {
        ref.current = {
          zoomToFit: (duration = 400, padding = 50) => {
            fgRef.current?.zoomToFit?.(duration, padding);
          },
        };
      }
    }, [ref]);

    return (
      <ForceGraph3D
        ref={fgRef}
        width={width}
        height={height}
        graphData={graphData}
        backgroundColor={background}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeLabel={(node: any) => nodeLabel?.(node as GraphNode) ?? node.id} // cast here
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
        nodeRelSize={6}
      />
    );
  }
);

ForceGraph3DComponent.displayName = "ForceGraph3DComponent";
export default ForceGraph3DComponent;
