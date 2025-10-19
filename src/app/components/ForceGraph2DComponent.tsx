import dynamic from "next/dynamic";
import { forwardRef, useRef, useEffect, useState } from "react";
import { GraphData, GraphNode } from "./types";
import { forceCollide } from "d3-force";

const ForceGraph2D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph2D),
  { ssr: false }
);

export interface ForceGraph2DComponentRef {
  zoomToFit: (duration?: number, padding?: number) => void;
}

interface ForceGraph2DComponentProps {
  graphData: GraphData;
  nodeLabel?: (node: GraphNode) => string;
  onNodeClick: (node: GraphNode) => void;
  width: number;
  height: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkColor?: (link: any) => string;
}

const ForceGraph2DComponent = forwardRef<ForceGraph2DComponentRef, ForceGraph2DComponentProps>(
  ({ graphData, nodeLabel, onNodeClick, width, height, linkColor }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fgRef = useRef<any>(null);
    const [mounted, setMounted] = useState(false);
    const [ticks, setTicks] = useState(0);

    // Get color from CSS
    const rootStyle = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
    const background = (rootStyle?.getPropertyValue("--background") || "#111").trim();

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted || !fgRef.current) return;

      const timer = setTimeout(() => {
        const fg = fgRef.current;
        if (fg) {
          fg.d3Force("link")?.distance(50).strength(1);
          fg.d3Force("charge")?.strength(-300);
          fg.d3Force("center")?.x(0).y(0);
          fg.d3Force(
            "collision",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            forceCollide((node: any) => (node.__collisionRadius ?? 10) + 10).strength(0.5)
          );
          fg.d3ReheatSimulation();
        }
      }, 50);

      return () => clearTimeout(timer);
    }, [mounted, graphData]);

    useEffect(() => {
      if (!fgRef.current || !graphData?.nodes?.length) return;

      const zoomDuration = 800; // ms
      const zoomPadding = 200;

      // delay before zooming: the larger the graph, the longer the delay
      const zoomDelay = Math.min(2000, 200 + graphData.nodes.length * 15);

      const timer = setTimeout(() => {
        fgRef.current?.zoomToFit(zoomDuration, zoomPadding);
      }, zoomDelay);

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
      <ForceGraph2D
        ref={fgRef}
        width={width}
        height={height}
        graphData={graphData}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeLabel={(node: any) => nodeLabel?.(node as GraphNode) ?? node.id}
        backgroundColor={background}
        onNodeClick={(node) => onNodeClick(node as GraphNode)}
        linkDirectionalArrowLength={35}
        linkDirectionalArrowRelPos={0.95}
        linkColor={
          linkColor ??
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((link: any) => {
            if (link.label === "attack") return "#f87171"; // red
            if (link.label === "support") return "#34d399"; // green
            if (link.label === "reverse") return "#60a5fa"; // blue
            return "#aaa"; // fallback
          })
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkWidth={(link: any) => {
          if (link.label === "attack") return 1.5;
          if (link.label === "support") return 1.2;
          if (link.label === "reverse") return 1.2;
          return 1;
        }}
        d3VelocityDecay={0.7}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.text || node.id;
          const maxWidth = 120;
          const padding = 6;
          const baseFontSize = 12;
          const fontSize = Math.max(8, baseFontSize / globalScale);

          ctx.font = `${fontSize}px var(--font-geist-sans)`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const wrapText = (text: string, maxWidth: number) => {
            const words = text.split(" ");
            const lines: string[] = [];
            let line = "";
            for (const word of words) {
              const testLine = line + word + " ";
              const { width: testWidth } = ctx.measureText(testLine);
              if (testWidth > maxWidth && line) {
                lines.push(line.trim());
                line = word + " ";
              } else {
                line = testLine;
              }
            }
            lines.push(line.trim());
            return lines;
          };

          const lines = wrapText(label, maxWidth);
          const bckgWidth = maxWidth + padding * 2;
          const bckgHeight = lines.length * fontSize + padding * 2;

          const radius = 4;
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.beginPath();
          ctx.moveTo((node.x ?? 0) - bckgWidth / 2 + radius, (node.y ?? 0) - bckgHeight / 2);
          ctx.lineTo((node.x ?? 0) + bckgWidth / 2 - radius, (node.y ?? 0) - bckgHeight / 2);
          ctx.quadraticCurveTo(
            (node.x ?? 0) + bckgWidth / 2,
            (node.y ?? 0) - bckgHeight / 2,
            (node.x ?? 0) + bckgWidth / 2,
            (node.y ?? 0) - bckgHeight / 2 + radius
          );
          ctx.lineTo((node.x ?? 0) + bckgWidth / 2, (node.y ?? 0) + bckgHeight / 2 - radius);
          ctx.quadraticCurveTo(
            (node.x ?? 0) + bckgWidth / 2,
            (node.y ?? 0) + bckgHeight / 2,
            (node.x ?? 0) + bckgWidth / 2 - radius,
            (node.y ?? 0) + bckgHeight / 2
          );
          ctx.lineTo((node.x ?? 0) - bckgWidth / 2 + radius, (node.y ?? 0) + bckgHeight / 2);
          ctx.quadraticCurveTo(
            (node.x ?? 0) - bckgWidth / 2,
            (node.y ?? 0) + bckgHeight / 2,
            (node.x ?? 0) - bckgWidth / 2,
            (node.y ?? 0) + bckgHeight / 2 - radius
          );
          ctx.lineTo((node.x ?? 0) - bckgWidth / 2, (node.y ?? 0) - bckgHeight / 2 + radius);
          ctx.quadraticCurveTo(
            (node.x ?? 0) - bckgWidth / 2,
            (node.y ?? 0) - bckgHeight / 2,
            (node.x ?? 0) - bckgWidth / 2 + radius,
            (node.y ?? 0) - bckgHeight / 2
          );
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#000";
          lines.forEach((line, i) => {
            ctx.fillText(
              line,
              node.x ?? 0,
              (node.y ?? 0) - bckgHeight / 2 + padding + fontSize / 2 + i * fontSize
            );
          });

          node.__bckgWidth = bckgWidth;
          node.__bckgHeight = bckgHeight;
          node.__collisionRadius = Math.max(bckgWidth, bckgHeight) / 2;
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodePointerAreaPaint={(node: any, color, ctx) => {
          const w = node.__bckgWidth ?? 20;
          const h = node.__bckgHeight ?? 16;
          ctx.fillStyle = color;
          ctx.fillRect((node.x ?? 0) - w / 2, (node.y ?? 0) - h / 2, w, h);
        }}
      />
    );
  }
);

ForceGraph2DComponent.displayName = "ForceGraph2DComponent";
export default ForceGraph2DComponent;
