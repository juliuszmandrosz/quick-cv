import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmailField } from "./email-field";
import { LoadingButton } from "./loading-button";
import type { LoginFormState } from "./use-login-form";

/** Forgot-password form, replaced by a confirmation once the email is sent. */
export function RecoverTab({ form }: { form: LoginFormState }) {
  const { t } = useLanguage();

  return (
    <form onSubmit={form.handlePasswordRecovery} className="space-y-4">
      {!form.recoverySubmitted ? (
        <>
          <EmailField
            labelFor="recoveryEmail"
            inputId="recoveryEmail"
            label={t("login.email")}
            value={form.recoveryEmail}
            onChange={form.setRecoveryEmail}
          />

          <Alert
            variant="default"
            className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
          >
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              {t("login.emailInstructions")}
            </AlertDescription>
          </Alert>

          <LoadingButton loading={form.loading} isPending={form.isPending}>
            {t("login.sendEmail")}
          </LoadingButton>
        </>
      ) : (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {t("login.checkInbox")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            {t("login.emailSent")}
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {form.recoveryEmail}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={form.resetRecovery}
            className="mt-4 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t("login.backToLogin")}
          </Button>
        </div>
      )}
    </form>
  );
}
