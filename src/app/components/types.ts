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

export interface ABAApiNode {
  id: string;
  text: string;
}

export interface ABAApiLink {
  from: string;
  to: string;
}

export interface ABAApiResponse {
  nodes: ABAApiNode[];
  attacks: ABAApiLink[];
}
