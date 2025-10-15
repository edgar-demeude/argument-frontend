import { useState } from "react";
import { API_URL } from "../../../../config";
import { GraphData, GraphNode } from "../../components/types";
import { createNode } from "./utils";

interface CSVResult {
  parent: string;
  child: string;
  relation: { predicted_label: string; probability: number };
  progress?: number;
}

export function useCSVLoader(
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>,
  setOriginalGraphData: React.Dispatch<React.SetStateAction<GraphData | null>>
) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [samples, setSamples] = useState<string[]>([]);
  const [selectedSample, setSelectedSample] = useState<string>("");
  const [customFile, setCustomFile] = useState<File | null>(null);

  async function fetchSamples() {
    try {
      const res = await fetch(`${API_URL}/samples`);
      const data = await res.json();
      setSamples(data.samples || []);
    } catch (err) {
      console.error("Error loading samples:", err);
    }
  }

  async function handleLoadCSV() {
    if (!customFile && !selectedSample) {
      alert("Choose a CSV or sample.");
      return;
    }

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    try {
      if (customFile) {
        formData.append("file", customFile);
      } else if (selectedSample) {
        const res = await fetch(`${API_URL}/samples/${selectedSample}`);
        const csvText = await res.text();
        formData.append("file", new Blob([csvText], { type: "text/csv" }), selectedSample);
      }

      const res = await fetch(`${API_URL}/predict-csv-stream`, { method: "POST", body: formData });
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      const nodes: GraphNode[] = [];
      const links: GraphData["links"] = [];
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const data: CSVResult = JSON.parse(part.replace("data: ", ""));
            if (!data.parent || !data.child) continue;

            if (!nodes.find((n) => n.id === data.parent)) nodes.push(createNode(data.parent));
            if (!nodes.find((n) => n.id === data.child)) nodes.push(createNode(data.child));

            links.push({
              source: data.child,
              target: data.parent,
              label: `${data.relation.predicted_label} (${(data.relation.probability * 100).toFixed(1)}%)`,
            });

            const updated = { nodes: [...nodes], links: [...links] };
            setGraphData(updated);
            setOriginalGraphData(updated);
            setProgress(data.progress || 0);
          } catch (err) {
            console.error("Streaming parse error:", err);
          }
        }
      }
    } catch (err) {
      console.error("CSV load error:", err);
      alert("Failed to load CSV.");
    } finally {
      setLoading(false);
      setProgress(0);
      setCustomFile(null);
      setSelectedSample("");
    }
  }

  return {
    loading,
    progress,
    samples,
    selectedSample,
    setSelectedSample,
    customFile,
    setCustomFile,
    handleLoadCSV,
    fetchSamples,
  };
}
