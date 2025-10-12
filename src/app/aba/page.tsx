"use client";
import { useRef, useState } from "react";
import ABAPanel from "./abaPannelProps";
import ABAResultsPanel from "./abaResultsPanel";
import { GraphData, GraphLink, GraphNode, ABAApiResponse } from "../components/types";
import { Graph3DRef } from "../components/graph3DBase";
import { API_URL } from "../../../config";
import ABAGraph3D from "./ABAGraph3D";

export default function ABAPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [abaResults, setAbaResults] = useState<ABAApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphRef = useRef<Graph3DRef>(null);

  const handleGenerateABA = async (file: File) => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/aba-upload`, {
        method: "POST",
        body: formData,
      });

      const data: ABAApiResponse = await res.json();
      setAbaResults(data);

      // Transform results into nodes/links for 3D graph
      const cleanLabel = (arg: string) => {
        if (arg.startsWith("[") && arg.indexOf("]") > 0) {
          return arg.slice(1, arg.indexOf("]"));
        }
        return arg;
      };

      // Nodes
      const nodes: GraphNode[] = (data.arguments ?? []).map((arg) => {
        const id = cleanLabel(arg);
        return { id, text: arg };
      });

      // Links from attacks
      const links: GraphLink[] = (data.attacks ?? []).map((att) => {
        // ex: "[A7] -> [A5]"
        const parts = att.split("→").map((p) => p.trim());
        const source = cleanLabel(parts[0]);
        const target = cleanLabel(parts[1]);
        return { source, target, label: "attack" };
      });

      // Optional: reverse attacks with dashed style or different color
      const reverseLinks: GraphLink[] = (data.reverse_attacks ?? []).map((r, i) => {
        const source = nodes[i % nodes.length]?.id ?? `node-${i}`;
        const target = nodes[(i + 1) % nodes.length]?.id ?? `node-${i + 1}`;
        return { source, target, label: "reverse", dashed: true };
      });

      // Merge all links
      setGraphData({ nodes, links: [...links, ...reverseLinks] });

      setTimeout(() => {
        graphRef.current?.zoomToFit?.(400, 50);
      }, 150);
    } catch (error) {
      console.error("Error generating ABA:", error);
      setAbaResults(null);
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left panel: ABA file upload */}
      <ABAPanel onGenerateABA={handleGenerateABA} loading={loading} />

      {/* Center: 3D graph */}
      <div className="flex-1 h-full overflow-hidden relative">
        <ABAGraph3D
          ref={graphRef}
          graphData={graphData}
          onNodeClick={(node) => setSelectedNode(node)}
        />
      </div>

      {/* Right panel: ABA+ results */}
      <ABAResultsPanel results={abaResults} />
    </div>
  );
}
