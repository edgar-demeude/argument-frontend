"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "../../../config";

interface ABAPanelProps {
  selectedFile: File | null;
  setSelectedFile: (file: File) => void;
  fileContent: string;
  onGenerateABA: () => void;
  onGenerateABAPlus: () => void;
  loading: boolean;
  onToggleMode: () => void;
  is3D: boolean;
}

interface ExampleFile {
  name: string;
  path: string;
}

export default function ABAPanel({
  selectedFile,
  setSelectedFile,
  fileContent,
  onGenerateABA,
  onGenerateABAPlus,
  loading,
  onToggleMode,
  is3D
}: ABAPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exampleFiles, setExampleFiles] = useState<ExampleFile[]>([]);

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const res = await fetch(`${API_URL}/aba-examples`);
        const data = await res.json();
        setExampleFiles(data.examples.map((name: string) => ({ name, path: name })));
      } catch (err) {
        console.error("Failed to fetch example files:", err);
      }
    };
    fetchExamples();
  }, []);

  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleExampleSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = exampleFiles.find(ex => ex.name === event.target.value);
    if (!selected) return;

    try {
      const res = await fetch(`${API_URL}/aba-examples/${selected.path}`);
      const text = await res.text();
      const tempFile = new File([text], selected.name, { type: "text/plain" });
      setSelectedFile(tempFile);
    } catch (err) {
      console.error("Failed to load example file:", err);
    }
  };

  return (
    <div className="w-1/6 bg-gray-800 p-4 overflow-y-auto text-white flex-shrink-0 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Upload ABA File</h2>

      {/* File upload */}
      <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer mb-2 text-center w-full hover:bg-blue-600 transition">
        {loading ? "Loading..." : "Upload .txt File"}
        <input type="file" ref={fileInputRef} accept=".txt" className="hidden" onChange={handleFileChange} />
      </label>

      {/* Example file select */}
      <select
        className="bg-gray-700 border rounded p-2 mb-4 text-white w-full hover:bg-gray-600 transition"
        onChange={handleExampleSelect}
        defaultValue=""
      >
        <option value="" disabled>Select Example File</option>
        {exampleFiles.map(ex => <option key={ex.path} value={ex.name}>{ex.name}</option>)}
      </select>

      {/* Selected file info */}
      {selectedFile && (
        <div className="bg-gray-900 p-2 rounded text-sm text-gray-200 overflow-auto max-h-48 mb-2">
          <pre>{selectedFile.name}</pre>
        </div>
      )}

      {/* Generate ABA button */}
      <button
        onClick={onGenerateABA}
        className="bg-green-500 text-white px-4 py-2 rounded w-full mb-2 hover:bg-green-600 transition"
        disabled={loading || !selectedFile}
      >
        {loading ? "Generating ABA..." : "Generate ABA"}
      </button>

      {/* Generate ABA+ button */}
      <button
        onClick={onGenerateABAPlus}
        className="bg-purple-500 text-white px-4 py-2 rounded w-full mb-2 hover:bg-purple-600 transition"
        disabled={loading || !selectedFile}
      >
        {loading ? "Generating ABA+..." : "Generate ABA+"}
      </button>

      {/* 2D/3D toggle button */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
        <span>{is3D ? "3D Mode" : "2D Mode"}</span>
        <button
          onClick={onToggleMode}
          disabled={loading}
          className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-500 transition"
        >
          Switch to {is3D ? "2D" : "3D"}
        </button>
      </div>
    </div>
  );
}
