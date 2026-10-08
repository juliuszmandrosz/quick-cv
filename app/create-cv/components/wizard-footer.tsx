"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";

type WizardFooterProps = {
  isLastStep: boolean;
  isBusy: boolean;
  onBack: () => void;
  onNext: () => void;
};

/** Fixed bottom bar with the Back and Next / Generate buttons. */
export default function WizardFooter({
  isLastStep,
  isBusy,
  onBack,
  onNext,
}: WizardFooterProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-border/50 shadow-xl z-50">
      <div className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl mx-auto px-4 py-3 md:py-4 xl:py-3 2xl:py-4">
        <div className="flex justify-between gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-10 sm:h-11 md:h-12 lg:h-10 xl:h-10 2xl:h-12 px-4 sm:px-5 md:px-6 lg:px-4 xl:px-4 2xl:px-6 text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base font-medium border-2"
          >
            <ChevronLeft className="mr-1 sm:mr-1.5 md:mr-2 lg:mr-1.5 xl:mr-1.5 2xl:mr-2 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-5 2xl:w-5" />
            {t("create.back")}
          </Button>

          <Button
            onClick={onNext}
            className="h-10 sm:h-11 md:h-12 lg:h-10 xl:h-10 2xl:h-12 px-4 sm:px-5 md:px-6 lg:px-4 xl:px-4 2xl:px-6 text-sm sm:text-base md:text-base lg:text-xs xl:text-xs 2xl:text-base font-medium bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white shadow-lg"
            disabled={isBusy}
          >
            {isBusy ? (
              <Loader2 className="mr-1 sm:mr-1.5 md:mr-2 lg:mr-1.5 xl:mr-1.5 2xl:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : isLastStep ? (
              <Sparkles className="mr-2 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-1 sm:mr-1.5 md:mr-2 lg:mr-1.5 xl:mr-1.5 2xl:mr-2 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:h-5 lg:h-4 lg:w-4 xl:h-4 xl:w-4 2xl:h-5 2xl:w-5" />
            )}
            {isLastStep ? t("create.generateCv") : t("create.step1next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
