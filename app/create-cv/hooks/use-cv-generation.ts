"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import type { GenerationStage } from "@/app/create-cv/components/loading-screen";
import type { CV } from "@/app/create-cv/types/cv";

export type JobOfferSource = "url" | "desc";

export type JobOfferInput = {
  source: JobOfferSource;
  jobUrl: string;
  jobDesc: string;
};

/** Where the CV data for generation comes from. */
export type CvSource =
  | { kind: "upload"; file: File; photo?: File | null }
  | { kind: "existing"; cv: CV };

/**
 * Every API route answers with `{ success: true, ...payload }` or
 * `{ success: false, error }` (with a 4xx/5xx status). We always read the JSON
 * body and branch on `success`, so the server's error message reaches the user.
 */
type ApiResponse<T> =
  ({ success: true } & T) | { success: false; error?: string };

async function postJson<T>(
  url: string,
  body: unknown,
  method: "POST" | "PATCH" = "POST",
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as ApiResponse<T>;
}

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

/**
 * Orchestrates the create-CV flow: analysing the job offer (step 1) and the
 * extract -> plan -> write pipeline that produces the tailored CV (step 2).
 */
export function useCvGeneration() {
  const [jobOfferId, setJobOfferId] = useState<string | null>(null);
  const [isProcessingJobOffer, setIsProcessingJobOffer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] =
    useState<GenerationStage>("extracting");

  const { toast } = useToast();
  const router = useRouter();
  const { t } = useLanguage();

  const showError = (description: string) =>
    toast({ title: t("create.error"), description, variant: "destructive" });

  /** Saves/analyses the job offer. Resolves to `true` when step 1 succeeded. */
  const submitJobOffer = async ({
    source,
    jobUrl,
    jobDesc,
  }: JobOfferInput): Promise<boolean> => {
    try {
      setIsProcessingJobOffer(true);
      toast({
        title: t("create.processing"),
        description: t("create.analyzing"),
      });

      type JobOfferResponse = { data: { id: string }[] };
      const result =
        source === "url"
          ? await postJson<JobOfferResponse>("/api/job-offers", { jobUrl })
          : await postJson<JobOfferResponse>("/api/analyze-job-offer", {
              jobDesc,
            });

      setIsProcessingJobOffer(false);
      if (!result.success) {
        showError(result.error || t("create.errorUrl"));
        return false;
      }

      setJobOfferId(result.data[0]?.id);
      toast({
        title: t("create.processedTitle"),
        description: t("create.processedDesc"),
      });
      return true;
    } catch (error: unknown) {
      setIsProcessingJobOffer(false);
      showError(errorMessage(error) || t("create.errorUrl"));
      return false;
    }
  };

  /** Resolves the CV data id: extracts an uploaded file, or links an existing CV. */
  const resolveCvUserDataId = async (
    cvSource: CvSource,
    language: string,
  ): Promise<ApiResponse<{ cvUserDataId: string }>> => {
    if (cvSource.kind === "upload") {
      const formData = new FormData();
      formData.append("cv", cvSource.file);
      formData.append("language", language || "en");
      if (jobOfferId) {
        formData.append("job_offer_id", jobOfferId);
      }
      if (cvSource.photo) {
        formData.append("profile_photo", cvSource.photo);
      }
      setGenerationStage("extracting");
      const res = await fetch("/api/extract-cv", {
        method: "POST",
        body: formData,
      });
      return (await res.json()) as ApiResponse<{ cvUserDataId: string }>;
    }

    const cvUserDataId = cvSource.cv.id;
    const result = await postJson<object>(
      "/api/job-offers",
      { jobOfferId, cvUserDataId },
      "PATCH",
    );
    return result.success ? { success: true, cvUserDataId } : result;
  };

  /** Runs extract -> plan -> write, then navigates to the CV preview. */
  const generateCv = async (cvSource: CvSource, language: string) => {
    setIsGenerating(true);

    const fail = (error: string | undefined) => {
      setIsGenerating(false);
      showError(error || t("create.errorCv"));
    };

    try {
      const cvData = await resolveCvUserDataId(cvSource, language);
      if (!cvData.success) return fail(cvData.error);
      const { cvUserDataId } = cvData;

      setGenerationStage("planning");
      const plan = await postJson<{ promptPlanId: string }>(
        "/api/generate-prompt-plan",
        { cvUserDataId, jobOfferId },
      );
      if (!plan.success) return fail(plan.error);

      setGenerationStage("writing");
      const generated = await postJson<{ cvId: string }>("/api/generate-cv", {
        cvUserDataId,
        language,
        jobOfferId,
        promptPlanId: plan.promptPlanId,
      });
      if (!generated.success) return fail(generated.error);

      setIsGenerating(false);
      toast({
        title: t("create.cvGeneratedTitle"),
        description: t("create.cvGeneratedDesc"),
      });
      router.push("/cv-preview?cvId=" + generated.cvId + "&lang=" + language);
    } catch (error: unknown) {
      fail(errorMessage(error));
    }
  };

  return {
    isProcessingJobOffer,
    isGenerating,
    generationStage,
    submitJobOffer,
    generateCv,
  };
}
