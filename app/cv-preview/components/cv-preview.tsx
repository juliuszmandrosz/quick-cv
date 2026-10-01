"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Flame, Loader2, Save, Target, Unlock } from "lucide-react";
import type { CVData } from "@/app/create-cv/types/cv-data";
import CvTemplate from "@/app/create-cv/components/cv-template";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-auth";

export const CvPreviewClient = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const user = useCurrentUser();
  const router = useRouter();
  const cvId = searchParams.get("cvId");
  const lang = searchParams.get("lang");
  const path = searchParams.get("path");
  const paymentPending = searchParams.get("paymentPending");
  const loginSuccessful = searchParams.get("loginSuccessful");

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
          title: t("create.error"),
          description: t("cv.errorLoading"),
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
          title: t("cv.paymentSuccessTitle"),
          description: t("cv.paymentSuccess"),
          variant: "default",
        });
        setIsLoading(false);
      } else {
        setTimeout(pollTokens, 3000);
      }
    };

    pollTokens();
  }, [paymentPending]);

  useEffect(() => {
    const redirectToPayment = async () => {
      if (!loginSuccessful) return;
      setIsLoading(true);
      const res = await fetch("/api/subscription-status");
      const data = await res.json();
      console.log(data);
      if (data?.tokens_left > 0) return;
      router.push("/checkout?cvId=" + cvId + "&lang=en");
      setIsLoading(false);
      setIsDownloading(false);
    };

    redirectToPayment();
  }, [loginSuccessful]);

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
          router.push("/checkout?cvId=" + cvData?.id + "&lang=en");
          setIsDownloading(false);
          return;
        }
        throw new Error(`PDF generation failed with ${response.status}`);
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = cvData?.file_name ?? "cv.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: t("cv.downloadSuccessTitle"),
          description: t("cv.downloadSuccess"),
          variant: "default",
        });
        setIsDownloading(false);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: t("create.error"),
        description: t("cv.downloadError"),
        variant: "destructive",
      });
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
        <p className="text-gray-500">{t("cv.noData")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("cv.preview")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("cv.ready")}</p>
          {cvData.job_url && (
            <p className="text-muted-foreground mt-2">
              <a href={cvData.job_url}>{t("cv.jobOffer")}</a>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-sm 2xl:text-base text-orange-800 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg py-2.5 sm:py-3 px-4 sm:px-5 mb-4">
        <Flame className="h-4 w-4 2xl:h-5 2xl:w-5 text-orange-500" />
        <span>{t("cv.joinUsers")}</span>
      </div>

      <CvTemplate cvData={cvData} lang={lang ?? "en"} />

      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 text-xs 2xl:text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 py-2.5 sm:py-3 px-4 sm:px-5 mt-4 rounded-md">
        <Flame className="h-4 w-4 2xl:h-5 2xl:w-5 text-orange-500" />
        <span>{t("cv.optimizedCvs")}</span>
        <span className="hidden sm:inline">•</span>
        <Target className="h-4 w-4 2xl:h-5 2xl:w-5 text-purple-500" />
        <span>{t("cv.moreInterviews")}</span>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-border/50 shadow-xl z-50">
        <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl mx-auto px-4 py-3 md:py-4 xl:py-3 2xl:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {user?.user ? (
              <Link href={`/${path ?? ""}`}>
                <Button
                  variant="outline"
                  className="shadow-sm w-full sm:w-auto"
                >
                  {t("cv.dashboard")}
                </Button>
              </Link>
            ) : (
              <div />
            )}

            <Button
              onClick={handleDownload}
              className="h-10 sm:h-11 md:h-12 lg:h-10 xl:h-10 2xl:h-12 px-4 sm:px-5 md:px-6 lg:px-4 xl:px-4 2xl:px-6 text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base font-medium bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white shadow-lg"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <div className="flex items-center">
                  {cvData.token_consumed ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("cv.download")}
                    </>
                  ) : (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      {t("cv.unlock")}
                    </>
                  )}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="h-16 sm:h-20 md:h-24 lg:h-20 xl:h-20 2xl:h-24" />
    </div>
  );
};
