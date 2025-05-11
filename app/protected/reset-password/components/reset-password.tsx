"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { resetPasswordAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function ResetPasswordClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionCountRef = useRef(0);

  const cvId = searchParams.get("cvId");
  const lang = searchParams.get("lang");
  const message = searchParams.get("message");

  useEffect(() => {
    if (message) {
      toast({
        title: "",
        description: message,
        variant: "destructive",
      });
    }
  }, [message, submissionCountRef.current]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const password = e.currentTarget.password.value;
    const confirmPassword = e.currentTarget.confirmPassword.value;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("cvId", cvId || "");
      formData.append("lang", lang || "");
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      await resetPasswordAction(formData);

      // After action completes, increment the submission counter
      // This will trigger the useEffect even if the message is the same
      submissionCountRef.current += 1;

      // Force a refresh to get the latest URL parameters
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <form
        className="flex flex-col w-full max-w-md p-8 gap-4 bg-card rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-medium text-center">Reset Password</h1>
        <p className="text-sm text-foreground/60 text-center mb-4">
          Please enter your new password below.
        </p>

        <input
          type="hidden"
          name="cvId"
          value={searchParams.get("cvId") || ""}
        />
        <input
          type="hidden"
          name="lang"
          value={searchParams.get("lang") || ""}
        />

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="New password"
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm password"
              required
              className="pr-10"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Resetting..." : "Reset password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
