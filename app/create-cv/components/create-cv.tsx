"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LinkIcon,
  Loader2,
  Upload,
} from "lucide-react";
import LoadingScreen from "@/app/create-cv/components/loading-screen";
import { useCurrentUser } from "@/hooks/use-auth";
import { CV } from "@/app/create-cv/types/cv";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [cvTab, setCvTab] = useState("upload");

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

  // const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setUploadedPhoto(file);
  //   }
  // };

  if (isGenerating) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("create.title")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("create.titleDesc")}</p>
        </div>
        <Card className="dark:glass-dark glass neumorphic">
          <CardHeader>
            <CardTitle>
              {t("create.step")} {step} {t("create.of")} 2
            </CardTitle>
            <CardDescription>
              {step === 1 ? `${t("create.enterUrl")}` : `${t("create.upload")}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {step === 1 ? (
                <>
                  <Tabs defaultValue="url" onValueChange={setJobOfferTab}>
                    <TabsList className="dark:glass-dark glass neumorphic mb-4">
                      <TabsTrigger value="url">
                        {t("create.pasteUrl")}
                      </TabsTrigger>
                      <TabsTrigger value="desc">
                        {t("create.pasteJobDesc")}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="url">
                      <div className="space-y-2">
                        <Label htmlFor="job-url">{t("create.jobUrl")}</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="job-url"
                            placeholder="https://example.com/job-posting"
                            value={jobUrl}
                            onChange={(e) => setJobUrl(e.target.value)}
                            className="pl-10 dark:glass-dark glass neumorphic"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("create.pasteUrlDesc")}: justjoin.it,
                          nofluffjobs.com)
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="desc">
                      <div className="space-y-2">
                        <Label htmlFor="job-desc">
                          {t("create.jobListingDesc")}
                        </Label>
                        <div className="relative">
                          <textarea
                            id="job-desc"
                            placeholder="We're hiring a Full Stack Developer to join our fast-growing SaaS team. You'll work on modern web apps using TypeScript, React, and Node.js, building features from concept to deployment. Experience with PostgreSQL and cloud platforms like AWS or Vercel is a plus. You should write clean code, enjoy solving real-world problems, and be comfortable collaborating in an Agile environment..."
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                            className="w-full min-h-[300px] p-4 dark:glass-dark glass neumorphic rounded-md border border-input bg-background resize-none"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("create.pasteJobDescExplanation")}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <>
                  <Tabs value={cvTab} onValueChange={setCvTab}>
                    {user.user && (
                      <TabsList className="dark:glass-dark glass neumorphic mb-4">
                        <TabsTrigger value="upload">
                          {t("create.uploadCv")}
                        </TabsTrigger>
                        <TabsTrigger value="existing">
                          {t("create.useExistingCv")}
                        </TabsTrigger>
                      </TabsList>
                    )}

                    <TabsContent value="upload">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-primary/40 rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 transition-colors">
                          <input
                            id="cv-upload"
                            type="file"
                            className="hidden"
                            onChange={handleCVFileChange}
                            accept=".pdf,.doc,.docx,.txt"
                          />
                          <label htmlFor="cv-upload" className="cursor-pointer">
                            <div className="space-y-2">
                              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                                <Upload className="h-6 w-6 text-primary" />
                              </div>
                              <div className="text-lg font-medium">
                                {t("create.upload")}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {t("create.dropCv")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("create.supportedFormats")}: PDF
                              </p>
                            </div>
                          </label>
                        </div>
                        {uploadedCV && (
                          <div className="flex items-center p-3 rounded-md bg-primary/10">
                            <FileText className="h-5 w-5 mr-2 text-primary" />
                            <span className="text-sm">{uploadedCV.name}</span>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="existing">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          {t("create.selectCv")}
                        </p>
                        {cvs.map((cv) => (
                          <div
                            key={cv.id}
                            className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedCv(cv);
                              setUploadedCV(null);
                            }}
                          >
                            <div
                              className={`flex items-center ${selectedCv?.id === cv.id ? "bg-primary/10 p-2 rounded-md border border-primary/20" : ""}`}
                            >
                              <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {cv.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t("create.createdAt")}{" "}
                                  {new Date(cv.created_at).toLocaleString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                  {/*{step === 1 && (*/}
                  {/*  <div className="mt-6">*/}
                  {/*    <Label htmlFor="photo-upload" className="mb-2">*/}
                  {/*      Upload Profile Photo (Optional)*/}
                  {/*    </Label>*/}
                  {/*    <div className="border-2 border-dashed border-primary/40 rounded-lg p-4 text-center cursor-pointer hover:border-primary/60 transition-colors">*/}
                  {/*      <input*/}
                  {/*        id="photo-upload"*/}
                  {/*        type="file"*/}
                  {/*        className="hidden"*/}
                  {/*        onChange={handlePhotoChange}*/}
                  {/*        accept="image/*"*/}
                  {/*      />*/}
                  {/*      <label*/}
                  {/*        htmlFor="photo-upload"*/}
                  {/*        className="cursor-pointer"*/}
                  {/*      >*/}
                  {/*        <div className="space-y-2">*/}
                  {/*          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">*/}
                  {/*            <Upload className="h-6 w-6 text-primary" />*/}
                  {/*          </div>*/}
                  {/*          <div className="text-lg font-medium">*/}
                  {/*            Upload your photo*/}
                  {/*          </div>*/}
                  {/*          <p className="text-sm text-muted-foreground">*/}
                  {/*            Drop your photo here or click to browse*/}
                  {/*          </p>*/}
                  {/*        </div>*/}
                  {/*      </label>*/}
                  {/*    </div>*/}
                  {/*    {uploadedPhoto && (*/}
                  {/*      <div className="mt-2 flex items-center p-3 rounded-md bg-primary/10">*/}
                  {/*        {uploadedPhoto && (*/}
                  {/*          <div className="flex items-center gap-2">*/}
                  {/*            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">*/}
                  {/*              <img*/}
                  {/*                src={*/}
                  {/*                  URL.createObjectURL(uploadedPhoto) ||*/}
                  {/*                  "/placeholder.svg"*/}
                  {/*                }*/}
                  {/*                alt="Profile preview"*/}
                  {/*                className="h-full w-full object-cover"*/}
                  {/*              />*/}
                  {/*            </div>*/}
                  {/*            <span className="text-sm">*/}
                  {/*              {uploadedPhoto.name}*/}
                  {/*            </span>*/}
                  {/*          </div>*/}
                  {/*        )}*/}
                  {/*      </div>*/}
                  {/*    )}*/}
                  {/*  </div>*/}
                  {/*)}*/}

                  <div className="mt-6">
                    <Label htmlFor="cv-language" className="mb-2">
                      {t("create.language")}
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={cvLanguage === "en" ? "default" : "outline"}
                        className={`w-24 ${cvLanguage === "en" ? "bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white" : ""}`}
                        onClick={() => setCvLanguage("en")}
                      >
                        {t("create.english")}
                      </Button>
                      <Button
                        type="button"
                        variant={cvLanguage === "pl" ? "default" : "outline"}
                        className={`w-24 ${cvLanguage === "pl" ? "bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white" : ""}`}
                        onClick={() => setCvLanguage("pl")}
                      >
                        {t("create.polish")}
                      </Button>
                      <Button
                        type="button"
                        variant={cvLanguage === "es" ? "default" : "outline"}
                        className={`w-24 ${cvLanguage === "es" ? "bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white" : ""}`}
                        onClick={() => setCvLanguage("es")}
                      >
                        {t("create.spanish")}
                      </Button>
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> {t("create.back")}
                </Button>
                <Button
                  onClick={handleNext}
                  className="neumorphic-button bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white"
                  disabled={isProcessingJobOffer}
                >
                  <>
                    {step === 2 ? t("create.generateCv") : t("create.next")}
                    {isProcessingJobOffer ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="mr-2 h-4 w-4" />
                    )}
                  </>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
