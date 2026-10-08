"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { FileText, Flame, LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import type { JobOfferSource } from "@/app/create-cv/hooks/use-cv-generation";

type JobOfferStepProps = {
  source: JobOfferSource;
  onSourceChange: (source: JobOfferSource) => void;
  jobUrl: string;
  onJobUrlChange: (value: string) => void;
  jobDesc: string;
  onJobDescChange: (value: string) => void;
};

/** Step 1: provide the job offer either as a link or as pasted text. */
export default function JobOfferStep({
  source,
  onSourceChange,
  jobUrl,
  onJobUrlChange,
  jobDesc,
  onJobDescChange,
}: JobOfferStepProps) {
  const { t } = useLanguage();
  const urlInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus the active input whenever the step is shown or the source changes.
  useEffect(() => {
    if (source === "url" && urlInputRef.current) {
      setTimeout(() => urlInputRef.current?.focus(), 100);
    } else if (source === "desc" && descInputRef.current) {
      setTimeout(() => descInputRef.current?.focus(), 100);
    }
  }, [source]);

  return (
    <div className="space-y-4 2xl:space-y-6">
      <div className="space-y-3 2xl:space-y-4">
        <Label className="text-sm 2xl:text-base font-semibold">
          {t("create.chooseInput")}
        </Label>
        <RadioGroup
          value={source}
          onValueChange={(value) => onSourceChange(value as JobOfferSource)}
          className="space-y-3 md:space-y-4"
        >
          <SourceOption
            value="url"
            icon={LinkIcon}
            title={t("create.pasteJobLink")}
            description={t("create.pasteJobLinkDesc")}
            className="p-3 2xl:p-4"
          />
          <SourceOption
            value="desc"
            icon={FileText}
            title={t("create.pasteJobDesc")}
            description={t("create.pasteJobDescExplanation")}
            className="p-3 sm:p-4 md:p-4"
          />
        </RadioGroup>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {source === "url" ? (
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
                onChange={(e) => onJobUrlChange(e.target.value)}
                className="w-full pl-10 sm:pl-11 md:pl-12 lg:pl-10 xl:pl-10 2xl:pl-12 h-10 sm:h-11 md:h-12 lg:h-10 xl:h-10 2xl:h-12 text-[16px] sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base"
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
              onChange={(e) => onJobDescChange(e.target.value)}
              className="w-full min-h-[120px] sm:min-h-[140px] md:min-h-[150px] lg:min-h-[130px] xl:min-h-[130px] 2xl:min-h-[150px] p-3 sm:p-3.5 md:p-4 rounded-lg border-2 border-input focus:border-primary bg-background resize-none text-[16px] sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base leading-relaxed transition-colors"
            />
            <p className="text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 p-2.5 sm:p-3 rounded border">
              {t("create.tip")} {t("create.tipText")}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-sm 2xl:text-base text-muted-foreground bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 rounded-lg py-2.5 sm:py-3 md:py-3.5 lg:py-2.5 xl:py-2.5 2xl:py-3.5 px-4 sm:px-5">
        <Flame className="h-4 w-4 2xl:h-5 2xl:w-5 text-orange-500" />
        <span className="font-medium">{t("create.optimizedCvs")}</span>
      </div>
    </div>
  );
}

type SourceOptionProps = {
  value: JobOfferSource;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Padding classes; the two options intentionally differ slightly. */
  className: string;
};

function SourceOption({
  value,
  icon: Icon,
  title,
  description,
  className,
}: SourceOptionProps) {
  const id = `${value}-option`;

  return (
    <div
      className={`flex items-start space-x-3 sm:space-x-4 ${className} rounded-lg border border-border/50 hover:border-primary/50 transition-colors`}
    >
      <RadioGroupItem value={value} id={id} className="mt-1 md:mt-0.5" />
      <Label htmlFor={id} className="flex-1 cursor-pointer">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 text-primary" />
          <span className="font-medium text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base">
            {title}
          </span>
        </div>
        <p className="text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </Label>
    </div>
  );
}
