"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";
import type { CVData } from "@/app/generate-cv/types/cv-data";
import CvTemplate from "@/app/generate-cv/components/cv-template";

const CVPreviewPage = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const cvId = searchParams.get("cvId");

  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cvId) return;

    const pollCVData = async () => {
      try {
        const res = await fetch(`/api/cv-data?cvId=${cvId}`);
        if (!res.ok) throw new Error("Failed to fetch CV data");
        const data = await res.json();

        // Załóżmy, że backend zwraca "paymentCompleted" (true/false)
        if (data.data && data.data.paymentCompleted) {
          setCvData(data.data);
          setIsLoading(false);
        } else {
          // Jeśli płatność nie została potwierdzona, polluj ponownie za 3 sekundy
          setTimeout(pollCVData, 3000);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load CV data",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    pollCVData();
  }, [cvId, toast]);

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: cvData?.id,
          cvDataId: cvData?.cv_user_data_id,
          language: "en",
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?cvId=" + cvData?.id + "&lang=en");
          return;
        }
        if (response.status === 402) {
          router.push("/subscriptions?cvId=" + cvData?.id + "&lang=en");
          return;
        }
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cv.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-gray-500">No CV data found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CV Preview</h1>
          <p className="text-muted-foreground mt-2">
            Your tailored CV is ready for download
          </p>
        </div>

        <Button onClick={handleDownload} className="shadow-sm">
          <Download className="mr-2 h-4 w-4" /> Download CV
        </Button>
      </div>

      <CvTemplate cvData={cvData} />
    </div>
  );
};

export default CVPreviewPage;
