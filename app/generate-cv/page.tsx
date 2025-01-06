"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCV = async () => {
    setIsGenerating(true);
    // Here you would typically call an API or run a function to generate the CV
    // For this example, we'll just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert("CV generated successfully!"); // Replace with actual logic
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">CV Generator</h1>
      <Separator className="my-4" />
      <p className="mb-4">Click the button below to generate your CV.</p>
      <Button onClick={handleGenerateCV} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate CV"}
      </Button>
    </div>
  );
}
