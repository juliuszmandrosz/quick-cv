"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LinkIcon,
  Upload,
} from "lucide-react";

export default function CreateCvClientPage() {
  const [step, setStep] = useState<number>(1);
  const [jobUrl, setJobUrl] = useState<string>("");
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [jobOfferId, setJobOfferId] = useState<string | null>(null);
  const [cvLanguage, setCvLanguage] = useState<string>("en");

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cvId = searchParams.get("cvId");
  const lang = searchParams.get("lang");

  const handleNext = async () => {
    if (step === 1) {
      if (!jobUrl) {
        toast({
          title: "Missing Information",
          description: "Please provide a job description URL",
          variant: "destructive",
        });
        return;
      }

      try {
        const res = await fetch("/api/job-offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobUrl }),
        });
        const result = await res.json();
        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "Error processing job URL",
            variant: "destructive",
          });
          return;
        }
        setJobOfferId(result.data[0]?.id);
        toast({
          title: "Job Offer Processed",
          description: "Job offer details saved successfully.",
        });
        setStep(2);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error processing job URL",
          variant: "destructive",
        });
      }
    } else if (step === 2) {
      if (!uploadedCV) {
        toast({
          title: "Missing Information",
          description: "Please upload your CV",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Processing CV. Un momento amigo",
        description: "Analyzing CV and extracting data...",
      });
      try {
        const formData = new FormData();
        formData.append("cv", uploadedCV);
        formData.append("language", cvLanguage || "en");
        if (jobOfferId) {
          formData.append("job_offer_id", jobOfferId);
        }
        formData.append("additional_details", "");
        if (uploadedPhoto) {
          formData.append("profile_photo", uploadedPhoto || undefined);
        }
        const extractCvResponse = await fetch("/api/extract-cv", {
          method: "POST",
          body: formData,
        } as RequestInit);
        const extractCvResult = await extractCvResponse.json();
        if (!extractCvResult.success) {
          toast({
            title: "Error",
            description: extractCvResult.error || "Error creating CV",
            variant: "destructive",
          });
          return;
        }
        const generatePromptPlanResponse = await fetch(
          "/api/generate-prompt-plan",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cvUserDataId: extractCvResult.cvUserDataId,
            }),
          },
        );

        const generatePromptPlanResult =
          await generatePromptPlanResponse.json();

        if (!generatePromptPlanResult.success) {
          toast({
            title: "Error",
            description: generatePromptPlanResult.error || "Error creating CV",
            variant: "destructive",
          });
          return;
        }

        const generateCvResponse = await fetch("/api/generate-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvUserDataId: extractCvResult.cvUserDataId,
            language: cvLanguage,
          }),
        });

        const generateCvResult = await generateCvResponse.json();

        if (!generateCvResult.success) {
          toast({
            title: "Error",
            description: generateCvResult.error || "Error creating CV",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "CV Generated",
          description: "Your tailored CV has been created.",
        });
        router.push(
          "/cv-preview?cvId=" + generateCvResult.cvId + "&lang=" + cvLanguage,
        );
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error processing CV",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedCV(file);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedPhoto(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New CV</h1>
          <p className="text-muted-foreground mt-2">
            Create a perfectly tailored CV for your dream job
          </p>
        </div>
        <Card className="dark:glass-dark glass neumorphic">
          <CardHeader>
            <CardTitle>Step {step} of 2</CardTitle>
            <CardDescription>
              {step === 1
                ? "Enter job description URL"
                : "Upload your CV and Profile Photo"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="job-url">Job Description URL</Label>
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
                      Paste the URL of the job description you're applying for
                    </p>
                  </div>
                  <div className="space-y-2 mt-6">
                    <Label htmlFor="notes">
                      Additional Information (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any specific details about the job or your application"
                      className="min-h-[100px] dark:glass-dark glass neumorphic"
                    />
                  </div>
                </>
              ) : (
                <>
                  <Tabs defaultValue="upload">
                    <TabsList className="dark:glass-dark glass neumorphic mb-4">
                      <TabsTrigger value="upload">Upload CV</TabsTrigger>
                      <TabsTrigger value="existing">
                        Use Existing CV
                      </TabsTrigger>
                    </TabsList>
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
                                Upload your CV
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Drop your CV here or click to browse
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Supported formats: PDF, DOC, DOCX, TXT
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
                          Select an existing CV from your repository
                        </p>
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer"
                            onClick={() => {
                              setUploadedCV(new File([""], `CV-${i}.pdf`));
                              toast({
                                title: "CV Selected",
                                description: `Selected CV #${i} from your repository`,
                              });
                            }}
                          >
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  Software Developer CV #{i}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Last updated {i} day{i > 1 ? "s" : ""} ago
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="mt-6">
                    <Label htmlFor="photo-upload" className="mb-2">
                      Upload Profile Photo (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-primary/40 rounded-lg p-4 text-center cursor-pointer hover:border-primary/60 transition-colors">
                      <input
                        id="photo-upload"
                        type="file"
                        className="hidden"
                        onChange={handlePhotoChange}
                        accept="image/*"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <div className="text-lg font-medium">
                            Upload your photo
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Drop your photo here or click to browse
                          </p>
                        </div>
                      </label>
                    </div>
                    {uploadedPhoto && (
                      <div className="mt-2 flex items-center p-3 rounded-md bg-primary/10">
                        {uploadedPhoto && (
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                              <img
                                src={
                                  URL.createObjectURL(uploadedPhoto) ||
                                  "/placeholder.svg"
                                }
                                alt="Profile preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="text-sm">
                              {uploadedPhoto.name}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <Label htmlFor="cv-language" className="mb-2">
                      CV Language
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={cvLanguage === "en" ? "default" : "outline"}
                        className={`w-24 ${cvLanguage === "en" ? "bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white" : ""}`}
                        onClick={() => setCvLanguage("en")}
                      >
                        English
                      </Button>
                      <Button
                        type="button"
                        variant={cvLanguage === "pl" ? "default" : "outline"}
                        className={`w-24 ${cvLanguage === "pl" ? "bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white" : ""}`}
                        onClick={() => setCvLanguage("pl")}
                      >
                        Polish
                      </Button>
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="neumorphic-button bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white"
                >
                  {step === 2 ? "Generate CV" : "Next"}{" "}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
