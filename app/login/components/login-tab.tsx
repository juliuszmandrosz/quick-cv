import Link from "next/link";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmailField } from "./email-field";
import { LoadingButton } from "./loading-button";
import { PasswordInput } from "./password-input";
import type { LoginFormState } from "./use-login-form";

/** Email + password sign-in form. */
export function LoginTab({ form }: { form: LoginFormState }) {
  const { t } = useLanguage();
  const { password } = form;

  return (
    <form onSubmit={form.handleLogin} className="space-y-4">
      <EmailField
        labelFor="email"
        inputId="email"
        label={t("login.email")}
        value={form.email}
        onChange={form.setEmail}
      />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-sm font-medium">
            {t("login.password")}
          </Label>
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              form.setActiveTab("recover");
            }}
            className="text-xs text-primary hover:text-primary/80 dark:text-primary/90 dark:hover:text-primary/70"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>

        <PasswordInput
          id="password"
          name="password"
          value={password}
          onChange={(e) => form.setPassword(e.target.value)}
          isVisible={form.passwordVisible}
          toggleVisibility={form.togglePasswordVisible}
          error={password.length > 0 && password.length < 8}
          errorMessage="Password must be at least 8 characters"
        />
      </div>

      <LoadingButton loading={form.loading} isPending={form.isPending}>
        {t("login.login")}
      </LoadingButton>
    </form>
  );
}
