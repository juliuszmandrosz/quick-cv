"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type WizardHeaderProps = {
  step: number;
  totalSteps: number;
};

/** Sticky page header with the title, language switcher and progress bar. */
export default function WizardHeader({ step, totalSteps }: WizardHeaderProps) {
  const { t } = useLanguage();
  const progress = (step / totalSteps) * 100;

  return (
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
              {t("create.step")} {step} {t("create.of")} {totalSteps}
            </span>
            <span className="text-xs sm:text-sm">
              {Math.round(progress)}% {t("create.complete")}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 sm:h-2.5 md:h-3">
            <div
              className="bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] h-2 sm:h-2.5 md:h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
