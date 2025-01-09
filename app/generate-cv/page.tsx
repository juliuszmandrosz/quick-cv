"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation"; // do wyciągania query param
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cvResult, setCvResult] = useState<string>("");

  const searchParams = useSearchParams();
  const cvUserDataId = searchParams.get("cv_user_data_id"); // np. ?cvUserDataId=123

  const handleGenerateCV = async () => {
    if (!cvUserDataId) {
      alert("Brak parametru cvUserDataId w URL!");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvUserDataId }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.error || "Błąd podczas generowania CV");
      }

      setCvResult(json.cv);
      alert("CV wygenerowane pomyślnie!");
    } catch (error: any) {
      alert(error.message || "Wystąpił błąd");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">CV Generator</h1>
      <Separator className="my-4" />
      <p className="mb-4">
        Kliknij przycisk poniżej, aby wygenerować CV. Upewnij się, że w adresie
        URL znajduje się parametr <code>cvUserDataId</code>.
      </p>
      <Button onClick={handleGenerateCV} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate CV"}
      </Button>
      {cvResult && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Wygenerowane CV:</h2>
          <pre className="p-4 whitespace-pre-wrap">{cvResult}</pre>
        </div>
      )}
    </div>
  );
}
