"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CvTemplate from "@/app/create-cv/components/cv-template";
import { Loader2 } from "lucide-react";

export default function CvDownload() {
  const searchParams = useSearchParams();
  const cvId = searchParams.get("cvId");

  const [cvData, setCvData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("siema");
    if (!cvId) return;

    const fetchData = async () => {
      try {
        console.log("siema2");
        const res = await fetch(`/api/cv-data?cvId=${cvId}`, {
          cache: "no-store",
        });
        console.log("siema3");
        const json = await res.json();
        console.log("siema4");
        console.log(json);
        if (json.success) {
          setCvData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch CV data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cvId]);

  if (!cvId) {
    return <div className="p-6">Brak identyfikatora CV. Sprawdź link.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="p-6">
        Nie znaleziono danych CV. Sprawdź, czy identyfikator jest poprawny.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <CvTemplate cvData={cvData} />
    </div>
  );
}
