export interface GraphNode {
  id: string;
  text?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ABAApiResponse {
  assumptions: string[];
  arguments: string[];
  attacks: string[];
  reverse_attacks: string[];
}