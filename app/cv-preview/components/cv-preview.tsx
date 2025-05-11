"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";
import type { CVData } from "@/app/create-cv/types/cv-data";
import CvTemplate from "@/app/create-cv/components/cv-template";
import { useLanguage } from "@/contexts/LanguageContext";

export const CvPreviewClient = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const cvId = searchParams.get("cvId");
  const lang = searchParams.get("lang");
  const paymentPending = searchParams.get("paymentPending");

  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!cvId) return;

    const fetchCV = async () => {
      try {
        const res = await fetch(`/api/cv-data?cvId=${cvId}`);
        const data = await res.json();
        setCvData(data.data);
      } catch (e) {
        toast({
          title: "Error",
          description: "Failed to load CV data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCV();
  }, [cvId]);

  useEffect(() => {
    if (!paymentPending) return;

    setIsLoading(true);

    const pollTokens = async () => {
      const res = await fetch("/api/subscription-status");
      const data = await res.json();

      if (data.tokens_left > 0) {
        toast({
          title: "Payment Successful",
          description: "Your CV is ready for download.",
          variant: "default",
        });
        setIsLoading(false);
      } else {
        setTimeout(pollTokens, 3000);
      }
    };

    pollTokens();
  }, [paymentPending]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvId: cvData?.id,
          cvDataId: cvData?.cv_user_data_id,
          language: lang ?? "en",
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?cvId=" + cvData?.id + "&lang=en");
          setIsDownloading(false);
          return;
        }
        if (response.status === 402) {
          router.push("/subscriptions?cvId=" + cvData?.id + "&lang=en");
          setIsDownloading(false);
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
        toast({
          title: "Download Successful",
          description: "Your CV has been downloaded.",
          variant: "default",
        });
        setIsDownloading(false);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Download error:", error);
      setIsDownloading(false);
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
          <p className="text-muted-foreground mt-2">{t("cv.ready")}</p>
          <p className="text-muted-foreground mt-2">
            <a href={cvData.job_url}>{t("cv.jobOffer")}</a>
          </p>
        </div>

        <Button
          onClick={handleDownload}
          className="shadow-sm"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {t("cv.downloadBtn")}
        </Button>
      </div>

      <CvTemplate cvData={cvData} lang={lang ?? "en"} />
    </div>
  );
};
