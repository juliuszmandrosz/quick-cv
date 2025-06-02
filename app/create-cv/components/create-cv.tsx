"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flame,
  LinkIcon,
  Loader2,
  Sparkles,
  TrendingUp,
  UploadCloud,
  X,
} from "lucide-react";
import LoadingScreen from "@/app/create-cv/components/loading-screen"; // Assuming this path is correct
import type { CV } from "@/app/create-cv/types/cv"; // Assuming this path is correct
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentUser } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function CreateCvClientPage() {
  const [step, setStep] = useState<number>(1);
  const [jobUrl, setJobUrl] = useState<string>("");
  const [jobDesc, setJobDesc] = useState<string>("");
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [jobOfferId, setJobOfferId] = useState<string | null>(null);
  const [cvLanguage, setCvLanguage] = useState<string>("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCv, setSelectedCv] = useState<CV | null>(null);
  const [isProcessingJobOffer, setIsProcessingJobOffer] = useState(false);
  const [jobOfferTab, setJobOfferTab] = useState("url");
  const [cvTab, setCvTab] = useState("upload"); // Default to upload

  const urlInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  const { toast } = useToast();
  const router = useRouter();
  const user = useCurrentUser();
  const { t } = useLanguage();

  const handleNext = async () => {
    if (step === 1) {
      if (
        (jobOfferTab === "url" && !jobUrl) ||
        (jobOfferTab === "desc" && !jobDesc)
      ) {
        toast({
          title: t("create.missingTitle"),
          description: t("create.missingDesc"),
          variant: "destructive",
        });
        return;
      }

      try {
        setIsProcessingJobOffer(true);
        toast({
          title: t("create.processing"),
          description: t("create.analyzing"),
        });
        let result;
        if (jobOfferTab == "url") {
          const res = await fetch("/api/job-offers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobUrl }),
          });
          result = await res.json();
        } else {
          const res = await fetch("/api/analyze-job-offer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobDesc }),
          });
          result = await res.json();
        }

        if (!result.success) {
          setIsProcessingJobOffer(false);
          toast({
            title: t("create.error"),
            description: result.error || t("create.errorUrl"),
            variant: "destructive",
          });
          return;
        }
        setIsProcessingJobOffer(false);
        setJobOfferId(result.data[0]?.id);
        toast({
          title: t("create.processedTitle"),
          description: t("create.processedDesc"),
        });
        setCvTab("upload");
        setStep(2);
      } catch (error: any) {
        setIsProcessingJobOffer(false);
        toast({
          title: t("create.error"),
          description: error.message || t("create.errorUrl"),
          variant: "destructive",
        });
      }
    } else if (step === 2) {
      if (!uploadedCV && !selectedCv) {
        const message = user.user
          ? `${t("create.cvPleaseUploadOrSelect")}`
          : `${t("create.cvPleaseUpload")}`;
        toast({
          title: t("create.missingTitle"),
          description: message,
          variant: "destructive",
        });
        return;
      }
      setIsGenerating(true);
      let cvUserDataId: string | null = null;
      try {
        if (uploadedCV && !selectedCv) {
          const formData = new FormData();
          formData.append("cv", uploadedCV);
          formData.append("language", cvLanguage || "en");
          if (jobOfferId) {
            formData.append("job_offer_id", jobOfferId);
          }
          if (uploadedPhoto) {
            formData.append("profile_photo", uploadedPhoto || undefined);
          }
          const extractCvResponse = await fetch("/api/extract-cv", {
            method: "POST",
            body: formData,
          } as RequestInit);
          const extractCvResult = await extractCvResponse.json();
          if (!extractCvResult.success) {
            setIsGenerating(false);
            toast({
              title: t("create.error"),
              description: extractCvResult.error || t("create.errorCv"),
              variant: "destructive",
            });
            return;
          }
          cvUserDataId = extractCvResult.cvUserDataId;
        } else {
          cvUserDataId = selectedCv!.id;
          const updateJobOfferResponse = await fetch("/api/job-offers", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobOfferId: jobOfferId,
              cvUserDataId: cvUserDataId,
            }),
          });

          const updateJobOfferResult = await updateJobOfferResponse.json();

          if (!updateJobOfferResult.success) {
            setIsGenerating(false);
            toast({
              title: t("create.error"),
              description: updateJobOfferResult.error || t("create.errorCv"),
              variant: "destructive",
            });
            return;
          }
        }

        const generatePromptPlanResponse = await fetch(
          "/api/generate-prompt-plan",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cvUserDataId: cvUserDataId,
              jobOfferId: jobOfferId,
            }),
          },
        );

        const generatePromptPlanResult =
          await generatePromptPlanResponse.json();

        if (!generatePromptPlanResult.success) {
          setIsGenerating(false);
          toast({
            title: t("create.error"),
            description: generatePromptPlanResult.error || t("create.errorCv"),
            variant: "destructive",
          });
          return;
        }

        const generateCvResponse = await fetch("/api/generate-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvUserDataId: cvUserDataId,
            language: cvLanguage,
            jobOfferId: jobOfferId,
            promptPlanId: generatePromptPlanResult.promptPlanId,
          }),
        });

        const generateCvResult = await generateCvResponse.json();

        if (!generateCvResult.success) {
          setIsGenerating(false);
          toast({
            title: t("create.error"),
            description: generateCvResult.error || t("create.errorCv"),
            variant: "destructive",
          });
          return;
        }

        setIsGenerating(false);
        toast({
          title: t("create.cvGeneratedTitle"),
          description: t("create.cvGeneratedDesc"),
        });
        router.push(
          "/cv-preview?cvId=" + generateCvResult.cvId + "&lang=" + cvLanguage,
        );
      } catch (error: any) {
        setIsGenerating(false);
        toast({
          title: t("create.error"),
          description: error.message || t("create.errorCv"),
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (!user.user?.id) return;

    const fetchCvs = async () => {
      try {
        const res = await fetch("/api/cvs");
        const json = await res.json();
        setCvs(json.data);
      } catch (error) {}
    };

    fetchCvs();
  }, [user.user?.id]);

  useEffect(() => {
    if (step === 1) {
      if (jobOfferTab === "url" && urlInputRef.current) {
        setTimeout(() => urlInputRef.current?.focus(), 100);
      } else if (jobOfferTab === "desc" && descInputRef.current) {
        setTimeout(() => descInputRef.current?.focus(), 100);
      }
    }
  }, [jobOfferTab, step]);

  const handleBack = () => {
    if (step === 1) {
      router.push("/");
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedCV(file);
      setSelectedCv(null);
    }
  };

  if (isGenerating) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl 2xl:text-2xl font-bold bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] bg-clip-text text-transparent">
                {t("create.title")}
              </h1>
              <p className="text-sm 2xl:text-base text-muted-foreground mt-1 hidden sm:block">
                {t("create.titleDesc")}
              </p>
            </div>
            <LanguageSwitcher />
          </div>

          <div className="mt-3 sm:mt-4 2xl:mt-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span className="font-medium">
                {t("create.step")} {step} {t("create.of")} 2
              </span>
              <span className="text-xs sm:text-sm">
                {Math.round((step / 2) * 100)}% {t("create.complete")}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 sm:h-2.5 md:h-3">
              <div
                className="bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] h-2 sm:h-2.5 md:h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl mx-auto px-4 py-4 2xl:py-8">
        <Card className="w-full border-0 shadow-lg">
          <CardHeader className="pb-4 2xl:pb-6 px-4 sm:px-5 md:px-6 pt-4 2xl:pt-6">
            <CardTitle className="text-lg 2xl:text-xl font-bold">
              {step === 1
                ? `🔗 ${t("create.step1title")}`
                : `📝 ${t("create.step2title")}`}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm 2xl:text-base text-muted-foreground">
              {step === 1
                ? `${t("create.step1desc")}`
                : `${t("create.step2desc")}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            {step === 1 ? (
              <div className="space-y-4 2xl:space-y-6">
                <div className="space-y-3 2xl:space-y-4">
                  <Label className="text-sm 2xl:text-base font-semibold">
                    {t("create.chooseInput")}
                  </Label>
                  <RadioGroup
                    value={jobOfferTab}
                    onValueChange={setJobOfferTab}
                    className="space-y-3 md:space-y-4"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 2xl:p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                      <RadioGroupItem
                        value="url"
                        id="url-option"
                        className="mt-1 md:mt-0.5"
                      />
                      <Label
                        htmlFor="url-option"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 text-primary" />
                          <span className="font-medium text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base">
                            {t("create.pasteJobLink")}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm text-muted-foreground mt-1">
                          {t("create.pasteJobLinkDesc")}
                        </p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 md:p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                      <RadioGroupItem
                        value="desc"
                        id="desc-option"
                        className="mt-1 md:mt-0.5"
                      />
                      <Label
                        htmlFor="desc-option"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 text-primary" />
                          <span className="font-medium text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base">
                            {t("create.pasteJobDesc")}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm text-muted-foreground mt-1">
                          {t("create.pasteJobDescExplanation")}
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {jobOfferTab === "url" ? (
                    <>
                      <Label
                        htmlFor="job-url"
                        className="text-sm 2xl:text-base font-medium"
                      >
                        {t("create.jobUrl")}
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-3.5 md:pl-4 pointer-events-none">
                          <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        </div>
                        <Input
                          ref={urlInputRef}
                          id="job-url"
                          placeholder="https://justjoin.it/job-offer/fullstack-developer"
                          value={jobUrl}
                          onChange={(e) => setJobUrl(e.target.value)}
                          className="w-full pl-10 sm:pl-11 md:pl-12 lg:pl-10 xl:pl-10 2xl:pl-12 h-10 sm:h-11 md:h-12 lg:h-10 xl:h-10 2xl:h-12 text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base"
                        />
                      </div>
                      <p className="text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2.5 sm:p-3 rounded border">
                        {t("create.supportedPlatforms")}
                      </p>
                    </>
                  ) : (
                    <>
                      <Label
                        htmlFor="job-desc"
                        className="text-sm sm:text-base md:text-base font-medium"
                      >
                        {t("create.jobDescription")}
                      </Label>
                      <textarea
                        ref={descInputRef}
                        id="job-desc"
                        placeholder={t("create.jobDescriptionPlaceholder")}
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        className="w-full min-h-[120px] sm:min-h-[140px] md:min-h-[150px] lg:min-h-[130px] xl:min-h-[130px] 2xl:min-h-[150px] p-3 sm:p-3.5 md:p-4 rounded-lg border-2 border-input focus:border-primary bg-background resize-none text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base leading-relaxed transition-colors"
                      />
                      <p className="text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 p-2.5 sm:p-3 rounded border">
                        {t("create.tip")} {t("create.tipText")}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-sm 2xl:text-base text-muted-foreground bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 rounded-lg py-2.5 sm:py-3 md:py-3.5 lg:py-2.5 xl:py-2.5 2xl:py-3.5 px-4 sm:px-5">
                  <Flame className="h-4 w-4 2xl:h-5 2xl:w-5 text-orange-500" />
                  <span className="font-medium">
                    {t("create.optimizedCvs")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8">
                <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-start">
                  <div className="lg:col-span-5">
                    <Card className="overflow-hidden shadow-lg border-border/30 sticky top-28">
                      <CardHeader className="p-4 bg-muted/20 border-b text-left">
                        <CardTitle className="text-xs sm:text-sm text-foreground">
                          {t("create.cvPreviewTitle")}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {t("create.cvPreviewDesc")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="aspect-auto w-full max-w-[280px] mx-auto rounded-lg overflow-hidden border-2 border-dashed border-primary/20 bg-muted/30 shadow-lg">
                          <img
                            src="/cv-sample.png?width=280"
                            alt={t("create.sampleCvAlt")}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 text-left text-xs text-muted-foreground bg-muted/20 border-t">
                        {t("create.cvPreviewCaption")}
                      </CardFooter>
                    </Card>
                  </div>

                  <div className="mt-4 sm:mt-0 lg:col-span-7 space-y-6">
                    {user.user && cvs.length > 0 ? (
                      <Tabs
                        defaultValue={cvTab}
                        onValueChange={setCvTab}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2 h-11">
                          <TabsTrigger
                            value="upload"
                            className="text-sm font-medium h-full"
                          >
                            <UploadCloud className="w-4 h-4 mr-2" />
                            {t("create.upload")}
                          </TabsTrigger>
                          <TabsTrigger
                            value="existing"
                            className="text-sm font-medium h-full"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {t("create.useExistingCv")}
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent
                          value="upload"
                          className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
                        >
                          <Label className="text-base font-semibold block mb-1">
                            {t("create.upload")}
                          </Label>
                          <div className="relative block w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 py-8 text-center hover:border-primary/50 transition-colors duration-200 group cursor-pointer bg-background hover:bg-muted/20">
                            <input
                              id="cv-upload"
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handleCVFileChange}
                              accept=".pdf,.doc,.docx"
                            />
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                                <UploadCloud className="h-7 w-7 text-primary" />
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                {t("create.dropCv")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("create.supportedFormats")}: PDF
                              </p>
                            </div>
                          </div>
                          {uploadedCV && (
                            <Card className="bg-muted/50 border-primary/20 shadow-sm">
                              <CardContent className="p-3 flex items-center space-x-3">
                                <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                  <p
                                    className="text-sm font-medium text-foreground truncate"
                                    title={uploadedCV.name}
                                  >
                                    {uploadedCV.name}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setUploadedCV(null);
                                    const cvUploadInput =
                                      document.getElementById(
                                        "cv-upload",
                                      ) as HTMLInputElement;
                                    if (cvUploadInput) cvUploadInput.value = "";
                                  }}
                                  className="text-muted-foreground hover:text-destructive h-7 w-7"
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">
                                    {t("create.removeFile")}
                                  </span>
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>
                        <TabsContent
                          value="existing"
                          className="mt-6 space-y-4"
                        >
                          <Label className="text-base font-semibold block mb-1">
                            {t("create.selectCv")}
                          </Label>
                          {cvs.length > 0 ? (
                            <ScrollArea className="max-h-72 overflow-y-auto rounded-md border bg-background">
                              <div className="p-2 space-y-2">
                                {cvs.map((cv) => (
                                  <div
                                    key={cv.id}
                                    className={`flex items-center p-3 rounded-md border-2 transition-all duration-150 cursor-pointer
                                    ${
                                      selectedCv?.id === cv.id
                                        ? "bg-primary/10 border-primary shadow-md"
                                        : "bg-background hover:bg-muted/50 border-transparent hover:border-border"
                                    }`}
                                    onClick={() => {
                                      setSelectedCv(cv);
                                      setUploadedCV(null);
                                      setCvTab("existing");
                                    }}
                                  >
                                    <FileText className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-grow">
                                      <p className="text-sm font-semibold text-foreground">
                                        {cv.title ||
                                          `CV Document ${cv.id.substring(0, 6)}`}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          cv.created_at,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    {selectedCv?.id === cv.id && (
                                      <CheckCircle2 className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <p className="text-sm text-muted-foreground p-4 text-center border rounded-md bg-muted/30">
                              {t("create.noExistingCvs")}
                            </p>
                          )}
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {" "}
                        <Label className="text-sm sm:text-base font-semibold block mb-1">
                          {t("create.upload")}
                        </Label>
                        <div className="relative block w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 py-8 text-center hover:border-primary/50 transition-colors duration-200 group cursor-pointer bg-background hover:bg-muted/20">
                          <input
                            id="cv-upload-fallback"
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleCVFileChange}
                            accept=".pdf"
                          />
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                              <UploadCloud className="h-7 w-7 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {t("create.dropCv")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t("create.supportedFormats")}
                            </p>
                          </div>
                        </div>
                        {uploadedCV && (
                          <Card className="bg-muted/50 border-primary/20 shadow-sm">
                            <CardContent className="p-3 flex items-center space-x-3">
                              <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                              <div className="flex-grow overflow-hidden">
                                <p
                                  className="text-sm font-medium text-foreground truncate"
                                  title={uploadedCV.name}
                                >
                                  {uploadedCV.name}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setUploadedCV(null);
                                  const cvUploadInput = document.getElementById(
                                    "cv-upload-fallback",
                                  ) as HTMLInputElement;
                                  if (cvUploadInput) cvUploadInput.value = "";
                                }}
                                className="text-muted-foreground hover:text-destructive h-7 w-7"
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">
                                  {t("create.removeFile")}
                                </span>
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    <div className="space-y-3 sm:pt-2">
                      <Label className="text-sm sm:text-base font-semibold">
                        {t("create.language")}
                      </Label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          {
                            value: "en",
                            label: t("create.english"),
                          },
                          { value: "pl", label: t("create.polish") },
                          {
                            value: "es",
                            label: t("create.spanish"),
                          },
                        ].map((lang) => (
                          <Button
                            key={lang.value}
                            type="button"
                            variant={
                              cvLanguage === lang.value ? "default" : "outline"
                            }
                            size="sm"
                            className={`h-10 px-4 text-sm font-medium rounded-md transition-all
                              ${
                                cvLanguage === lang.value
                                  ? "bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white shadow-md ring-2 ring-offset-2 ring-primary/70 ring-offset-background"
                                  : "border-border hover:bg-muted/50 hover:border-muted-foreground/50"
                              }`}
                            onClick={() => setCvLanguage(lang.value)}
                          >
                            {lang.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800/50 rounded-xl p-3 text-sm text-center">
                  <div className="flex justify-center items-center mb-1.5">
                    <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400 mr-1.5 flex-shrink-0" />
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {t("create.aiBoostLine1")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                    {t("create.aiBoostLine2")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-border/50 shadow-xl z-50">
        <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl mx-auto px-4 py-3 md:py-4 xl:py-3 2xl:py-4">
          <div className="flex justify-between gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-10 sm:h-11 md:h-12 lg:h-10 xl:h-10 2xl:h-12 px-4 sm:px-5 md:px-6 lg:px-4 xl:px-4 2xl:px-6 text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base font-medium border-2"
            >
              <ChevronLeft className="mr-1 sm:mr-1.5 md:mr-2 lg:mr-1.5 xl:mr-1.5 2xl:mr-2 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-5 2xl:w-5" />
              {t("create.back")}
            </Button>

            <Button
              onClick={handleNext}
              className="h-10 sm:h-11 md:h-12 lg:h-10 xl:h-10 2xl:h-12 px-4 sm:px-5 md:px-6 lg:px-4 xl:px-4 2xl:px-6 text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base font-medium bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white shadow-lg"
              disabled={isProcessingJobOffer || isGenerating}
            >
              {isProcessingJobOffer || isGenerating ? (
                <Loader2 className="mr-1 sm:mr-1.5 md:mr-2 lg:mr-1.5 xl:mr-1.5 2xl:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : step === 2 ? (
                <Sparkles className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-1 sm:mr-1.5 md:mr-2 lg:mr-1.5 xl:mr-1.5 2xl:mr-2 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:h-5 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-5 2xl:w-5" />
              )}
              {step === 2 ? t("create.generateCv") : t("create.step1next")}
            </Button>
          </div>
        </div>
      </div>
      <div className="h-16 sm:h-20 md:h-24 lg:h-20 xl:h-20 2xl:h-24" />
    </div>
  );
}
