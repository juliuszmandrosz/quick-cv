"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import LoadingScreen from "@/app/create-cv/components/loading-screen";
import type { CV } from "@/app/create-cv/types/cv";
import {
  useCvGeneration,
  type JobOfferSource,
} from "@/app/create-cv/hooks/use-cv-generation";
import { useExistingCvs } from "@/app/create-cv/hooks/use-existing-cvs";
import WizardHeader from "@/app/create-cv/components/wizard-header";
import WizardFooter from "@/app/create-cv/components/wizard-footer";
import JobOfferStep from "@/app/create-cv/components/job-offer-step";
import CvStep from "@/app/create-cv/components/cv-step";

const TOTAL_STEPS = 2;

export default function CreateCvClientPage() {
  const [step, setStep] = useState<number>(1);
  const [jobOfferTab, setJobOfferTab] = useState<JobOfferSource>("desc");
  const [jobUrl, setJobUrl] = useState<string>("");
  const [jobDesc, setJobDesc] = useState<string>("");
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [selectedCv, setSelectedCv] = useState<CV | null>(null);
  const [cvLanguage, setCvLanguage] = useState<string>("en");

  const { toast } = useToast();
  const router = useRouter();
  const user = useCurrentUser();
  const { t } = useLanguage();
  const cvs = useExistingCvs(user.user?.id);
  const {
    isProcessingJobOffer,
    isGenerating,
    generationStage,
    submitJobOffer,
    generateCv,
  } = useCvGeneration();

  const showMissingInput = (description: string) =>
    toast({
      title: t("create.missingTitle"),
      description,
      variant: "destructive",
    });

  const handleJobOfferNext = async () => {
    if (
      (jobOfferTab === "url" && !jobUrl) ||
      (jobOfferTab === "desc" && !jobDesc)
    ) {
      showMissingInput(t("create.missingDesc"));
      return;
    }

    const ok = await submitJobOffer({ source: jobOfferTab, jobUrl, jobDesc });
    if (ok) setStep(2);
  };

  const handleGenerate = async () => {
    if (selectedCv) {
      await generateCv({ kind: "existing", cv: selectedCv }, cvLanguage);
    } else if (uploadedCV) {
      await generateCv({ kind: "upload", file: uploadedCV }, cvLanguage);
    } else {
      showMissingInput(
        user.user
          ? t("create.cvPleaseUploadOrSelect")
          : t("create.cvPleaseUpload"),
      );
    }
  };

  const handleNext = step === 1 ? handleJobOfferNext : handleGenerate;

  const handleBack = () => {
    if (step === 1) {
      router.push("/");
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleUploadCv = (file: File) => {
    setUploadedCV(file);
    setSelectedCv(null);
  };

  const handleSelectCv = (cv: CV) => {
    setSelectedCv(cv);
    setUploadedCV(null);
  };

  if (isGenerating) {
    return <LoadingScreen stage={generationStage} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <WizardHeader step={step} totalSteps={TOTAL_STEPS} />

      <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl mx-auto px-4 py-4 2xl:py-8">
        <Card className="w-full border-0 shadow-lg">
          <CardHeader className="pb-4 2xl:pb-6 px-4 sm:px-5 md:px-6 pt-4 2xl:pt-6">
            <CardTitle className="text-lg 2xl:text-xl font-bold">
              {step === 1
                ? `🔗 ${t("create.step1title")}`
                : `📝 ${t("create.step2title")}`}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm 2xl:text-base text-muted-foreground">
              {step === 1 ? t("create.step1desc") : t("create.step2desc")}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            {step === 1 ? (
              <JobOfferStep
                source={jobOfferTab}
                onSourceChange={setJobOfferTab}
                jobUrl={jobUrl}
                onJobUrlChange={setJobUrl}
                jobDesc={jobDesc}
                onJobDescChange={setJobDesc}
              />
            ) : (
              <CvStep
                canUseExistingCvs={!!user.user && cvs.length > 0}
                cvs={cvs}
                uploadedCv={uploadedCV}
                onUploadCv={handleUploadCv}
                onRemoveUploadedCv={() => setUploadedCV(null)}
                selectedCv={selectedCv}
                onSelectCv={handleSelectCv}
                language={cvLanguage}
                onLanguageChange={setCvLanguage}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <WizardFooter
        isLastStep={step === TOTAL_STEPS}
        isBusy={isProcessingJobOffer || isGenerating}
        onBack={handleBack}
        onNext={handleNext}
      />
      {/* Spacer so the fixed footer never covers the end of the card. */}
      <div className="h-16 sm:h-20 md:h-24 lg:h-20 xl:h-20 2xl:h-24" />
    </div>
  );
}
