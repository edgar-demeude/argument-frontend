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
  nodeLabel?: (node: GraphNode) => string;
  loading?: boolean;
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
      nodeLabel,
      loading
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

    // inside GraphWrapper return
    return (
      <div ref={containerRef} className="w-full h-full relative">
        {/* --- Loading overlay when loading --- */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[color-mix(in_oklab,var(--background)_85%,transparent)] backdrop-blur-sm">
            <div className="relative w-14 h-14">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-l-blue-400 animate-[spin_1.2s_linear_infinite_reverse]"></div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-500 animate-pulse">
              Loading graph data…
            </p>
          </div>
        )}

        {/* --- 3D / 2D graph --- */}
        {graphData && graphData.nodes?.length && aframeLoaded && (
          is3D ? (
            <ForceGraph3DComponent
              key="force-graph-3d"
              ref={graph3DRef}
              graphData={graphData}
              onNodeClick={onNodeClick}
              linkColor={linkColor}
              linkCurvature={linkCurvature}
              linkArrowLength={linkArrowLength}
              linkWidth={linkWidth}
              nodeLabel={nodeLabel}
              width={dimensions.width}
              height={dimensions.height}
            />
          ) : (
            <ForceGraph2DComponent
              key="force-graph-2d"
              ref={graph2DRef}
              graphData={graphData}
              linkColor={linkColor}
              onNodeClick={onNodeClick}
              nodeLabel={nodeLabel}
              width={dimensions.width}
              height={dimensions.height}
            />
          )
        )}

        {/* --- No data placeholder (behind overlay) --- */}
        {!graphData || !graphData.nodes?.length ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="text-xl font-semibold text-[var(--accent)] animate-pulse">
                No data yet
              </div>
              <div className="text-sm text-[color-mix(in_oklab,var(--foreground)_80%,transparent)]">
                Upload or generate a dataset to visualize it here.
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);

GraphWrapper.displayName = "GraphWrapper";
export default GraphWrapper;
