"use client";

import { useState } from "react";
import { FileText, TrendingUp, UploadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CV } from "@/app/create-cv/types/cv";
import CvSamplePreview from "@/app/create-cv/components/cv-sample-preview";
import CvUploadField from "@/app/create-cv/components/cv-upload-field";
import ExistingCvList from "@/app/create-cv/components/existing-cv-list";
import CvLanguagePicker from "@/app/create-cv/components/cv-language-picker";

type CvStepProps = {
  /** Signed-in users with saved CVs may pick one instead of uploading. */
  canUseExistingCvs: boolean;
  cvs: CV[];
  uploadedCv: File | null;
  onUploadCv: (file: File) => void;
  onRemoveUploadedCv: () => void;
  selectedCv: CV | null;
  onSelectCv: (cv: CV) => void;
  language: string;
  onLanguageChange: (language: string) => void;
};

/** Step 2: provide a CV (upload or pick a saved one) and the output language. */
export default function CvStep({
  canUseExistingCvs,
  cvs,
  uploadedCv,
  onUploadCv,
  onRemoveUploadedCv,
  selectedCv,
  onSelectCv,
  language,
  onLanguageChange,
}: CvStepProps) {
  const { t } = useLanguage();
  const [cvTab, setCvTab] = useState("upload");

  const handleSelectCv = (cv: CV) => {
    onSelectCv(cv);
    setCvTab("existing");
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-5">
          <CvSamplePreview />
        </div>

        <div className="mt-4 sm:mt-0 lg:col-span-7 space-y-6">
          {canUseExistingCvs ? (
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
                <CvUploadField
                  inputId="cv-upload"
                  accept=".pdf,.doc,.docx"
                  formatsHint={`${t("create.supportedFormats")}: PDF`}
                  uploadedCv={uploadedCv}
                  onUpload={onUploadCv}
                  onRemove={onRemoveUploadedCv}
                />
              </TabsContent>
              <TabsContent value="existing" className="mt-6 space-y-4">
                <Label className="text-base font-semibold block mb-1">
                  {t("create.selectCv")}
                </Label>
                <ExistingCvList
                  cvs={cvs}
                  selectedCv={selectedCv}
                  onSelect={handleSelectCv}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-sm sm:text-base font-semibold block mb-1">
                {t("create.upload")}
              </Label>
              <CvUploadField
                inputId="cv-upload-fallback"
                accept=".pdf"
                formatsHint={t("create.supportedFormats")}
                uploadedCv={uploadedCv}
                onUpload={onUploadCv}
                onRemove={onRemoveUploadedCv}
              />
            </div>
          )}

          <CvLanguagePicker value={language} onChange={onLanguageChange} />
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
  );
}
