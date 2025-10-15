"use client";
import { useEffect, useState, RefObject } from "react";
import { API_URL } from "../../../../config";

export interface ExampleFile {
  name: string;
  path: string;
}

interface UseABAFileLoaderProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>; //
  setSelectedFile: (file: File) => void;
}

export function useABAFileLoader({ fileInputRef, setSelectedFile }: UseABAFileLoaderProps) {
  const [exampleFiles, setExampleFiles] = useState<ExampleFile[]>([]);
  const [fileContent, setFileContent] = useState<string>("");

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

    const reader = new FileReader();
    reader.onload = (e) => setFileContent(e.target?.result as string);
    reader.readAsText(file);

    setSelectedFile(file);
  };

  const handleExampleSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = exampleFiles.find((ex) => ex.name === event.target.value);
    if (!selected) return;

    try {
      const res = await fetch(`${API_URL}/aba-examples/${selected.path}`);
      const text = await res.text();
      setFileContent(text);

      const tempFile = new File([text], selected.name, { type: "text/plain" });
      setSelectedFile(tempFile);
    } catch (err) {
      console.error("Failed to load example file:", err);
    }
  };

  return {
    fileContent,
    exampleFiles,
    handleFileChange,
    handleExampleSelect,
  };
}
