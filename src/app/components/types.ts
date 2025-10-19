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

export interface RuleDTO {
  id: string;
  head: string;
  body: string[];
}

export interface FrameworkSnapshot {
  language: string[];
  assumptions: string[];
  rules: RuleDTO[];
  contraries: [string, string][];
  preferences?: Record<string, string[]>;
}

export interface TransformationStep {
  step: "non_circular" | "atomic" | "none";
  applied: boolean;
  reason?: string;
  description?: string;
  result_snapshot?: FrameworkSnapshot;
}

export interface ABAApiResponse {
  meta: {
    request_id: string;
    timestamp: string;
    transformed: boolean;
    transformations_applied: string[];
    warnings?: string[];
    errors?: string[];
  };
  original_framework: FrameworkSnapshot;
  transformations: TransformationStep[];
  final_framework: FrameworkSnapshot;
  arguments: string[];
  attacks: string[];
  aba_plus: {
    assumption_combinations: string[];
    normal_attacks: string[];
    reverse_attacks: string[];
  };
}

