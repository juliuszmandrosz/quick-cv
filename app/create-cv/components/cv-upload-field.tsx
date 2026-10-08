"use client";

import type React from "react";
import { useRef } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

type CvUploadFieldProps = {
  inputId: string;
  accept: string;
  formatsHint: string;
  uploadedCv: File | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
};

/** Drop zone for a CV file plus a card showing the chosen file. */
export default function CvUploadField({
  inputId,
  accept,
  formatsHint,
  uploadedCv,
  onUpload,
  onRemove,
}: CvUploadFieldProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleRemove = () => {
    onRemove();
    // Clear the native input so picking the same file again fires onChange.
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <div className="relative block w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 py-8 text-center hover:border-primary/50 transition-colors duration-200 group cursor-pointer bg-background hover:bg-muted/20">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px]"
          onChange={handleChange}
          accept={accept}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
            <UploadCloud className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {t("create.dropCv")}
          </p>
          <p className="text-xs text-muted-foreground">{formatsHint}</p>
        </div>
      </div>
      {uploadedCv && (
        <Card className="bg-muted/50 border-primary/20 shadow-sm">
          <CardContent className="p-3 flex items-center space-x-3">
            <FileText className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
              <p
                className="text-sm font-medium text-foreground truncate"
                title={uploadedCv.name}
              >
                {uploadedCv.name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive h-7 w-7"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("create.removeFile")}</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
