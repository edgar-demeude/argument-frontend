import { SimulationNodeDatum } from "d3-force";

export interface GraphNode extends Omit<SimulationNodeDatum, "fx" | "fy" | "fz"> {
  id: string;
  text?: string;
  __bckgWidth?: number;
  __bckgHeight?: number;
  __collisionRadius?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ForceGraph2DProps {
  width: number;
  height: number;
  graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  onNodeClick?: (node: GraphNode) => void;
  nodeCanvasObject?: (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => void;
  nodePointerAreaPaint?: (node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => void;
  linkColor?: (link: GraphLink) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ABAApiResponse {
  assumptions: string[];
  arguments: string[];
  attacks: string[];
  reverse_attacks: string[];
}