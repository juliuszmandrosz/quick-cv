"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

type CvLanguagePickerProps = {
  value: string;
  onChange: (language: string) => void;
};

/** Button group choosing the language the generated CV is written in. */
export default function CvLanguagePicker({
  value,
  onChange,
}: CvLanguagePickerProps) {
  const { t } = useLanguage();

  const languages = [
    { value: "en", label: t("create.english") },
    { value: "pl", label: t("create.polish") },
    { value: "es", label: t("create.spanish") },
  ];

  return (
    <div className="space-y-3 sm:pt-2">
      <Label className="text-sm sm:text-base font-semibold">
        {t("create.language")}
      </Label>
      <div className="flex flex-wrap gap-3">
        {languages.map((lang) => {
          const isActive = value === lang.value;
          return (
            <Button
              key={lang.value}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`h-10 px-4 text-sm font-medium rounded-md transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white shadow-md ring-2 ring-offset-2 ring-primary/70 ring-offset-background"
                  : "border-border hover:bg-muted/50 hover:border-muted-foreground/50"
              }`}
              onClick={() => onChange(lang.value)}
            >
              {lang.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
