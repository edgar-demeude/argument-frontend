"use client";
import { useEffect, useRef, useState } from "react";
import ABAPanel from "./abaPanelProps";
import ABAResultsPanel from "./abaResultsPanel";
import { GraphData, GraphLink, GraphNode, ABAApiResponse } from "../components/types";
import { GraphWrapperRef } from "../components/GraphWrapper";
import { API_URL } from "../../../config";
import ABAGraph3D from "./ABAGraph";

export default function ABAPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [abaResults, setAbaResults] = useState<ABAApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [originalGraphData, setOriginalGraphData] = useState<GraphData | null>(null);
  const graphRef = useRef<GraphWrapperRef>(null);

  // Initial resize / zoom
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      graphRef.current?.zoomToFit?.(400, 50);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Zoom when graphData changes
  useEffect(() => {
    if (graphData.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current?.zoomToFit?.(400, 50);
      }, 150);
    }
  }, [graphData]);

  // --- Toggle 2D/3D
  const handleToggleMode = () => {
    setIs3D(prev => !prev);
    if (originalGraphData) setGraphData(originalGraphData);
    setTimeout(() => graphRef.current?.zoomToFit?.(400, 50), 100);
  };

  // --- Helper: map internal ID to assumption set
  const buildArgumentMap = (args: string[]): Record<string, string> => {
    const map: Record<string, string> = {};
    args.forEach((arg) => {
      const match = arg.match(/^\[([A0-9]+)\]=\{([^}]*)\}/);
      if (match) map[match[1]] = `{${match[2]}}`;
    });
    return map;
  };

  // --- Build graph nodes and links
  const generateGraph = (data: ABAApiResponse) => {
    const cleanLabel = (arg: string) =>
      arg.startsWith("[") && arg.indexOf("]") > 0 ? arg.slice(1, arg.indexOf("]")) : arg;

    const nodes: GraphNode[] = (data.arguments ?? []).map(arg => ({ id: cleanLabel(arg), text: arg }));

    const links: GraphLink[] = (data.attacks ?? []).map(att => {
      const parts = att.split("→").map(p => p.trim());
      return { source: cleanLabel(parts[0]), target: cleanLabel(parts[1]), label: "attack" };
    });

    const reverseLinks: GraphLink[] = (data.reverse_attacks ?? []).map((r, i) => ({
      source: nodes[i % nodes.length]?.id ?? `node-${i}`,
      target: nodes[(i + 1) % nodes.length]?.id ?? `node-${i + 1}`,
      label: "reverse",
      dashed: true,
    }));

    setGraphData({ nodes, links: [...links, ...reverseLinks] });
  };

  // --- Generate ABA
  const handleGenerateABA = async () => {
    if (!selectedFile) return alert("Please select a file first");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${API_URL}/aba-upload`, { method: "POST", body: formData });
      const data: ABAApiResponse = await res.json();
      setAbaResults(data);
      generateGraph(data);
    } catch (err) {
      console.error(err);
      setAbaResults(null);
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  };

  // --- Generate ABA+
  const handleGenerateABAPlus = async () => {
    if (!selectedFile) return alert("Please select a file first");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${API_URL}/aba-plus-upload`, { method: "POST", body: formData });
      const data: ABAApiResponse = await res.json();
      setAbaResults(data);
      generateGraph(data);
    } catch (err) {
      console.error(err);
      setAbaResults(null);
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <ABAPanel
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        fileContent={selectedFile?.name ?? ""}
        onGenerateABA={handleGenerateABA}
        onGenerateABAPlus={handleGenerateABAPlus}
        loading={loading}
        onToggleMode={handleToggleMode}
        is3D={is3D} // <-- passe l'état pour le bouton
      />

      <div className="flex-1 h-full overflow-hidden relative">
        <ABAGraph3D
          ref={graphRef}
          graphData={graphData}
          onNodeClick={setSelectedNode}
          is3D={is3D}
        />
      </div>

      <ABAResultsPanel results={abaResults} />
    </div>
  );
}
