import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmailField } from "./email-field";
import { LoadingButton } from "./loading-button";
import { PasswordInput } from "./password-input";
import type { LoginFormState } from "./use-login-form";

/** Account creation form with password confirmation. */
export function SignupTab({ form }: { form: LoginFormState }) {
  const { t } = useLanguage();
  const { password, confirmPassword } = form;

  return (
    <form onSubmit={form.handleSignup} className="space-y-4">
      <EmailField
        labelFor="signup-email"
        inputId="signup-email"
        label={t("login.email")}
        value={form.email}
        onChange={form.setEmail}
      />

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-sm font-medium">
          {t("login.password")}
        </Label>

        <PasswordInput
          id="signup-password"
          name="signup-password"
          value={password}
          onChange={(e) => form.setPassword(e.target.value)}
          isVisible={form.passwordVisible}
          toggleVisibility={form.togglePasswordVisible}
          error={password.length > 0 && password.length < 8}
          errorMessage="Password must be at least 8 characters"
        />
        {password.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("login.passwordLength")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-sm font-medium">
          {t("login.confirmPassword")}
        </Label>
        <PasswordInput
          id="confirm-password"
          name="confirm-password"
          value={confirmPassword}
          onChange={(e) => form.setConfirmPassword(e.target.value)}
          isVisible={form.confirmPasswordVisible}
          toggleVisibility={form.toggleConfirmPasswordVisible}
          error={confirmPassword.length > 0 && !form.passwordsMatch}
          errorMessage="Passwords don't match"
        />
      </div>

      <LoadingButton loading={form.loading} isPending={form.isPending}>
        {t("login.signUp")}
      </LoadingButton>
    </form>
  );
}
