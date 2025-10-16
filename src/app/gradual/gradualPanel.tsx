"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "../../../config";

interface GradualExample {
  name: string;
  path: string;
  content: string;
}

interface GradualPanelProps {
  args: string[];
  setArgs: (args: string[]) => void;
  relations: [string, string][];
  setRelations: (rels: [string, string][]) => void;
  nSamples: number;
  setNSamples: (n: number) => void;
  maxIter: number;
  setMaxIter: (n: number) => void;
  loading: boolean;
  onCompute: () => void;
}

export default function GradualPanel({
  args,
  setArgs,
  relations,
  setRelations,
  nSamples,
  setNSamples,
  maxIter,
  setMaxIter,
  loading,
  onCompute,
}: GradualPanelProps) {
  const [exampleFiles, setExampleFiles] = useState<GradualExample[]>([]);
  const [selectedExample, setSelectedExample] = useState<string>("");
  const [manualArgs, setManualArgs] = useState(args.join(","));
  const [manualRels, setManualRels] = useState(relations.map(([a, b]) => `${a}->${b}`).join(","));

  // Fetch available examples
  useEffect(() => {
    async function fetchExamples() {
      try {
        const res = await fetch(`${API_URL}/gradual-examples`);
        const data = await res.json();
        setExampleFiles(data.examples || []);
      } catch (err) {
        console.error("Failed to fetch gradual examples:", err);
      }
    }
    fetchExamples();
  }, []);

  // Handle example selection
  const handleExampleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedExample(name);
    if (!name) return;

    try {
      const ex = exampleFiles.find(ex => ex.name === name);
      if (!ex) return;

      const res = await fetch(`${API_URL}/gradual-examples/${ex.path}`);
      const text = await res.text();
      const parsed = JSON.parse(text);

      setManualArgs(parsed.args.join(","));
      setManualRels(parsed.relations.map(([a, b]: [string, string]) => `${a}->${b}`).join(","));
      setArgs(parsed.args);
      setRelations(parsed.relations);
    } catch (err) {
      console.error("Failed to load example file:", err);
    }
  };

  // Manual text updates
  const handleArgsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualArgs(e.target.value);
    const arr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
    setArgs(arr);
  };

  const handleRelsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualRels(e.target.value);
    const rels = e.target.value
      .split(",")
      .map(pair => {
        const [from, to] = pair.split("->").map(s => s.trim());
        return from && to ? [from, to] : null;
      })
      .filter(Boolean) as [string, string][];
    setRelations(rels);
  };

  return (
    <div className="w-1/4 bg-gray-800 p-5 overflow-y-auto text-white flex-shrink-0">
      {/* Panel header */}
      <h2 className="text-xl font-semibold mb-4">Gradual Semantics</h2>

      {/* Example selection box */}
      <div className="p-4 bg-gray-700 rounded-lg shadow-inner mb-6">
        <label className="block text-white font-semibold mb-2">Example Selection</label>

        <select
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-green-500 cursor-pointer transition"
          onChange={handleExampleSelect}
          value={selectedExample}
        >
          <option value="">Choose an example</option>
          {exampleFiles.map((ex) => (
            <option key={ex.path} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </select>

        <p className="text-center text-gray-400 my-3 text-sm">— or manually input —</p>

        {/* Manual arguments input */}
        <label className="block text-sm font-semibold mb-1">Arguments (comma separated)</label>
        <textarea
          value={manualArgs}
          onChange={handleArgsChange}
          className="w-full h-20 p-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
          placeholder="A,B,C"
        />

        {/* Manual relations input */}
        <label className="block text-sm font-semibold mb-1">Relations (A-{'>'}B,B-{'>'}C)</label>
        <textarea
          value={manualRels}
          onChange={handleRelsChange}
          className="w-full h-20 p-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="A->B,B->C"
        />
      </div>

      {/* Sliders configuration */}
      <div className="p-4 bg-gray-700 rounded-lg shadow-inner mb-6">
        <label className="block mb-2 font-semibold text-white">
          Number of Samples: <span className="text-green-400">{nSamples}</span>
        </label>
        <input
          type="range"
          min={100}
          max={5000}
          step={100}
          value={nSamples}
          onChange={e => setNSamples(Number(e.target.value))}
          className="w-full accent-green-500 mb-4"
        />

        <label className="block mb-2 font-semibold text-white">
          Max Iterations: <span className="text-green-400">{maxIter}</span>
        </label>
        <input
          type="range"
          min={100}
          max={10000}
          step={100}
          value={maxIter}
          onChange={e => setMaxIter(Number(e.target.value))}
          className="w-full accent-green-500"
        />
      </div>

      {/* Compute button */}
      <button
        onClick={onCompute}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 ${
          loading
            ? "bg-blue-400 text-gray-200 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
        }`}
      >
        {loading ? "Computing..." : "Compute Gradual Semantics"}
      </button>
    </div>
  );
}
