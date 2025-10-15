"use client";
import { useRef } from "react";
import { useABAFileLoader } from "./utils/useABAFileLoader";

interface ABAPanelProps {
  selectedFile: File | null;
  setSelectedFile: (file: File) => void;
  onGenerateABA: () => void;
  onGenerateABAPlus: () => void;
  loading: boolean;
  onToggleMode: () => void;
  is3D: boolean;
}

export default function ABAPanel({
  selectedFile,
  setSelectedFile,
  onGenerateABA,
  onGenerateABAPlus,
  loading,
  onToggleMode,
  is3D,
}: ABAPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fileContent, setFileContent, exampleFiles, handleFileChange, handleExampleSelect } =
    useABAFileLoader({ fileInputRef, setSelectedFile });

  // Sync textarea content to selectedFile
  const handleContentChange = (content: string) => {
    setFileContent(content);
    const tempFile = new File([content], selectedFile?.name || "manual.txt", { type: "text/plain" });
    setSelectedFile(tempFile);
  };

  return (
    <div className="w-1/4 bg-gray-800 p-5 overflow-y-auto text-white flex-shrink-0">
      {/* Mode toggle */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
        <span>{is3D ? "3D Mode" : "2D Mode"}</span>
        <button
          onClick={onToggleMode}
          disabled={loading}
          className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-500 transition"
        >
          Switch to {is3D ? "2D" : "3D"}
        </button>
      </div>

      {/* File upload / manual input */}
      <div className="p-4 bg-gray-700 rounded-lg shadow-inner mb-6">
        <label className="block text-white font-semibold mb-2">ABA File</label>

        <label
          className={`block w-full p-2 text-center rounded-lg cursor-pointer border border-gray-600 bg-gray-800 hover:border-gray-400 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Loading..." : "Upload .txt File"}
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <p className="text-center text-gray-400 my-3 text-sm">— or —</p>

        <select
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-green-500 cursor-pointer transition"
          onChange={handleExampleSelect}
          defaultValue=""
        >
          <option value="">Choose an example</option>
          {exampleFiles.map((ex) => (
            <option key={ex.path} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </select>

        {/* Editable textarea for file content */}
        <textarea
          className="mt-4 w-full h-40 p-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          value={fileContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Type or paste ABA content here..."
        />
      </div>

      {/* Generate ABA buttons */}
      <div className="space-y-3">
        <button
          onClick={onGenerateABA}
          disabled={loading || !selectedFile}
          className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 ${
            loading || !selectedFile
              ? "bg-green-400 text-gray-200 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 active:bg-green-800 cursor-pointer"
          }`}
        >
          {loading ? "Generating ABA..." : "Generate ABA"}
        </button>

        <button
          onClick={onGenerateABAPlus}
          disabled={loading || !selectedFile}
          className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 ${
            loading || !selectedFile
              ? "bg-purple-400 text-gray-200 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 cursor-pointer"
          }`}
        >
          {loading ? "Generating ABA+..." : "Generate ABA+"}
        </button>
      </div>
    </div>
  );
}
