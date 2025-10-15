import { GraphNode } from "../../components/types";

/**
 * Utility to create a GraphNode from an id.
 */
export function createNode(id: string | number): GraphNode {
  return { id: String(id), text: String(id) };
}

/**
 * Sleep utility (for simulating delay or debugging)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
