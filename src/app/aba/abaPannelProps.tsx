"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "../../../config";

interface ABAPanelProps {
  onGenerateABA: (file: File) => void;
  loading: boolean;
}

interface ExampleFile {
  name: string;
  path: string;
}

export default function ABAPanel({ onGenerateABA, loading }: ABAPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [exampleFiles, setExampleFiles] = useState<ExampleFile[]>([]);

  // Load example files from API on mount
  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const res = await fetch(`${API_URL}/aba-examples`);
        const data = await res.json();
        // Map filenames to ExampleFile objects
        const files = data.examples.map((filename: string) => ({
          name: filename,
          path: filename,
        }));
        setExampleFiles(files);
      } catch (err) {
        console.error("Failed to fetch example files:", err);
      }
    };
    fetchExamples();
  }, []);

  // Handle custom file upload
  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setFileContent(e.target?.result as string);
    reader.readAsText(file);

    onGenerateABA(file);
  };

  // Handle selecting an example file
  const handleExampleSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = exampleFiles.find((ex) => ex.name === event.target.value);
    if (!selected) return;

    try {
      const res = await fetch(`${API_URL}/aba-examples/${selected.path}`);
      const text = await res.text();

      // Create temporary File object to pass to ABA generator
      const tempFile = new File([text], selected.name, { type: "text/plain" });
      setFileContent(text);
      onGenerateABA(tempFile);
    } catch (err) {
      console.error("Failed to load example file:", err);
    }
  };

  return (
    <div className="w-1/6 bg-gray-800 p-4 overflow-y-auto text-white flex-shrink-0 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Upload ABA File</h2>

      {/* Styled file input */}
      <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer mb-2 text-center w-full hover:bg-blue-600 transition">
        {loading ? "Loading..." : "Upload .txt File"}
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Dropdown for example files */}
      <select
        className="bg-gray-700 border rounded p-2 mb-4 text-white w-full hover:bg-gray-600 transition"
        onChange={handleExampleSelect}
        defaultValue=""
      >
        <option value="" disabled>
          Load Example File
        </option>
        {exampleFiles.map((ex) => (
          <option key={ex.path} value={ex.name}>
            {ex.name}
          </option>
        ))}
      </select>

      {/* Preview loaded file */}
      {fileContent && (
        <div className="bg-gray-900 p-2 rounded text-sm text-gray-200 overflow-auto max-h-48 mb-2">
          <pre>{fileContent}</pre>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleFileChange}
        className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 transition"
        disabled={loading}
      >
        {loading ? "Generating ABA..." : "Generate ABA+"}
      </button>
    </div>
  );
}
