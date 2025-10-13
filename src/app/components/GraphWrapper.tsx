import { forwardRef, useRef, useEffect, useState } from "react";
import { GraphData, GraphNode } from "./types";
import { LinkObject } from "react-force-graph-3d";
import ForceGraph3DComponent, {
  ForceGraph3DComponentRef,
} from "./ForceGraph3DComponent";
import ForceGraph2DComponent, {
  ForceGraph2DComponentRef,
} from "./ForceGraph2DComponent";

export interface GraphWrapperRef {
  zoomToFit: (duration?: number, padding?: number) => void;
}

interface GraphWrapperProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
  is3D: boolean;
  linkColor?: (link: LinkObject) => string;
  linkCurvature?: (link: LinkObject) => number;
  linkArrowLength?: (link: LinkObject) => number;
  linkWidth?: (link: LinkObject) => number;
}

interface Dimensions {
  width: number;
  height: number;
}

const GraphWrapper = forwardRef<GraphWrapperRef, GraphWrapperProps>(
  (
    {
      graphData,
      onNodeClick,
      is3D,
      linkColor,
      linkWidth,
      linkCurvature,
      linkArrowLength,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graph3DRef = useRef<ForceGraph3DComponentRef>(null);
    const graph2DRef = useRef<ForceGraph2DComponentRef>(null);
    const [dimensions, setDimensions] = useState<Dimensions>({
      width: 0,
      height: 0,
    });
    const [aframeLoaded, setAframeLoaded] = useState(false);

    // Load AFrame for 3D rendering
    useEffect(() => {
      if (typeof window !== "undefined" && !aframeLoaded && is3D) {
        import("aframe")
          .then(() => setAframeLoaded(true))
          .catch((err) => console.error("Error loading AFrame:", err));
      }
    }, [aframeLoaded, is3D]);

    // Handle window resize
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

    // Expose zoomToFit via ref callback
    useEffect(() => {
      if (ref && "current" in ref) {
        ref.current = {
          zoomToFit: (duration = 400, padding = 50) => {
            if (is3D) {
              graph3DRef.current?.zoomToFit?.(duration, padding);
            } else {
              graph2DRef.current?.zoomToFit?.(duration, padding);
            }
          },
        };
      }
    }, [ref, is3D]);

    // Show loading state while AFrame is loading for 3D mode
    if (is3D && !aframeLoaded) {
      return (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <div className="mb-4">Loading 3D engine...</div>
            <div className="animate-spin">⏳</div>
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="w-full h-full">
        {is3D ? (
          <ForceGraph3DComponent
            key="force-graph-3d"
            ref={graph3DRef}
            graphData={graphData}
            onNodeClick={onNodeClick}
            linkColor={linkColor}
            linkCurvature={linkCurvature}
            linkArrowLength={linkArrowLength}
            linkWidth={linkWidth}
            width={dimensions.width}
            height={dimensions.height}
          />
        ) : (
          <ForceGraph2DComponent
            key="force-graph-2d"
            ref={graph2DRef}
            graphData={graphData}
            onNodeClick={onNodeClick}
            width={dimensions.width}
            height={dimensions.height}
          />
        )}
      </div>
    );
  }
);

GraphWrapper.displayName = "GraphWrapper";
export default GraphWrapper;