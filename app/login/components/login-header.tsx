import { Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/** Logo, tagline and — when unlocking a CV — the "one step away" banner. */
export function LoginHeader({ cvId }: { cvId: string | null }) {
  const { t } = useLanguage();

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        NICE{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary">
          CV
        </span>
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        {t("hero.title")}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary">
          {t("hero.titleBold")}
        </span>
      </p>

      {cvId && (
        <div className="flex items-center mt-4 sm:mt-6 mb-0 sm:mb-6 justify-center gap-2 sm:gap-4 text-sm sm:text-base text-purple-800 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/10 dark:to-purple-950/10 border border-purple-200 dark:border-purple-800 rounded-lg py-2.5 sm:py-3 px-4 sm:px-5 text-center">
          <Lock className="h-4 w-4 2xl:h-5 2xl:w-5 text-purple-500" />
          <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">
            <div className="font-medium">{t("login.oneStepAway")}</div>
            <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              {t("login.unlockAndDownload")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
