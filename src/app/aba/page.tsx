"use client";
import { useEffect, useRef, useState } from "react";
import ABAPanel from "./AbaPanel";
import ABAResultsPanel from "./AbaResultsPanel";
import ABAGraph3D from "./ABAGraph";
import { GraphData, GraphLink, GraphNode, ABAApiResponse } from "../components/types";
import { GraphWrapperRef } from "../components/GraphWrapper";
import { API_URL } from "../../../config";

export default function ABAPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [abaResults, setAbaResults] = useState<ABAApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [originalGraphData, setOriginalGraphData] = useState<GraphData | null>(null);
  const graphRef = useRef<GraphWrapperRef>(null);

  // --- Helpers ---
  /**
   * Extracts the display name for ABA+ nodes from argument string.
   * Example: "[A8]={c,a} ⊢ s" → "{c,a}".
   */
  const getNodeNameMap = (data: ABAApiResponse): Record<string, string> => {
    const map: Record<string, string> = {};
    (data.arguments ?? []).forEach(arg => {
      const match = arg.match(/^\[([A0-9]+)\]=\{([^}]*)\}/);
      if (match) {
        map[match[1]] = `{${match[2]}}`;
      }
    });
    return map;
  };

  /**
   * Cleans the internal node id from argument string.
   * Example: "[A8]={c,a} ⊢ s" → "A8".
   */
  const cleanLabel = (arg: string) =>
    arg.startsWith("[") && arg.indexOf("]") > 0 ? arg.slice(1, arg.indexOf("]")) : arg;

  /**
   * Generates graph nodes and links for ABA/ABA+.
   * For ABA+, node names are set to assumption sets (e.g. "{a,c}").
   * For ABA, node names are set to their internal id (e.g. "A1").
   */
  const generateGraph = (data: ABAApiResponse) => {
    const nodeNameMap = getNodeNameMap(data);
    const isABAPlus = data.reverse_attacks && data.reverse_attacks.length > 0;
    const nodes: GraphNode[] = (data.arguments ?? []).map(arg => {
      const id = cleanLabel(arg);
      // For ABA+, use assumption set as name; for ABA, use internal id (e.g. "A1")
      return {
        id,
        text: isABAPlus && nodeNameMap[id] ? nodeNameMap[id] : id,
      };
    });

    const links: GraphLink[] = (data.attacks ?? []).map(att => {
      const [source, target] = att.split("→").map(p => p.trim());
      return { source: cleanLabel(source), target: cleanLabel(target), label: isABAPlus ? "Normal Attack" : "Attack", color: isABAPlus ? "#f87171" : "#f87171" };
    });

    const reverseLinks: GraphLink[] = (data.reverse_attacks ?? []).map((_, i) => ({
      source: nodes[i % nodes.length]?.id ?? `node-${i}`,
      target: nodes[(i + 1) % nodes.length]?.id ?? `node-${i + 1}`,
      label: isABAPlus ? "Reverse Attack" : "",
      color: "#60a5fa",
      dashed: true,
    }));

    setGraphData({ nodes, links: [...links, ...reverseLinks] });
  };

  // --- Zoom handling ---
  const zoomGraph = (delay = 150) => {
    setTimeout(() => graphRef.current?.zoomToFit?.(400, 50), delay);
  };

  useEffect(() => {
    zoomGraph(200); // initial zoom
  }, []);

  useEffect(() => {
    if (graphData.nodes.length > 0) zoomGraph(150);
  }, [graphData]);

  useEffect(() => {
    const resize = () => {
      window.dispatchEvent(new Event("resize"));
      graphRef.current?.zoomToFit?.(400, 50);
    };

    // Call after mount
    const timer1 = setTimeout(resize, 100);
    const timer2 = setTimeout(resize, 300); // ensure layout is done

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // --- Toggle 2D/3D ---
  const handleToggleMode = () => {
    setIs3D(prev => !prev);
    if (originalGraphData) setGraphData(originalGraphData);
    zoomGraph(100);
  };

  // --- File upload / ABA generation ---
  const uploadFileAndGenerate = async (endpoint: string) => {
    if (!selectedFile) return alert("Please select a file first");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${API_URL}/${endpoint}`, { method: "POST", body: formData });
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

  const handleGenerateABA = () => uploadFileAndGenerate("aba-upload");
  const handleGenerateABAPlus = () => uploadFileAndGenerate("aba-plus-upload");

  return (
    <div className="flex h-screen" style={{ height: "calc(100vh - 64px)" }}>
      <ABAPanel
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onGenerateABA={handleGenerateABA}
        onGenerateABAPlus={handleGenerateABAPlus}
        loading={loading}
        onToggleMode={handleToggleMode}
        is3D={is3D}
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