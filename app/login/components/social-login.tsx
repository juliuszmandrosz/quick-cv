import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoogleIcon } from "./google-icon";

interface SocialLoginProps {
  cvId: string | null;
  onGoogleLogin: () => void;
}

/** "Or continue with" divider followed by the Google sign-in button. */
export function SocialLogin({ cvId, onGoogleLogin }: SocialLoginProps) {
  const { t } = useLanguage();

  return (
    <>
      <div className="relative my-4 px-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
            {t("login.orContinueWith")}
          </span>
        </div>
      </div>

      <div className="flex justify-center px-6 pb-6">
        <Button
          variant="outline"
          onClick={onGoogleLogin}
          className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          <GoogleIcon className="h-5 w-5 mr-2" />
          {t(
            cvId
              ? "login.continueWithGoogleUnlock"
              : "login.continueWithGoogle",
          )}
        </Button>
      </div>
    </>
  );
}
