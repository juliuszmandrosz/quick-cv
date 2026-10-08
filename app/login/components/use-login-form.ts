"use client";

import type React from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  forgotPasswordAction,
  signInAction,
  signInWithGoogleAction,
  signUpAction,
} from "@/app/actions";

const UNEXPECTED_ERROR = "An unexpected error occurred.";

function errorMessage(error: unknown): string {
  return (error instanceof Error && error.message) || UNEXPECTED_ERROR;
}

/**
 * State and submit handlers for the login / signup / recover tabs.
 *
 * `cvId` and `lang` from the URL are forwarded to every server action so the
 * user lands back on the CV they were working on after authenticating.
 */
export function useLoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Surface status messages passed back by server-action redirects.
  useEffect(() => {
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    if (status && message) {
      toast({
        description: message,
        variant: status === "error" ? "destructive" : "default",
      });
    }
  }, [searchParams, toast]);

  const passwordsMatch = password === confirmPassword;
  const cvId = searchParams.get("cvId");

  const getFormDataWithParams = (formData = new FormData()) => {
    const cvId = searchParams.get("cvId");
    const lang = searchParams.get("lang");
    if (cvId) formData.append("cvId", cvId);
    if (lang) formData.append("lang", lang);
    return formData;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = getFormDataWithParams();
      formData.append("email", email);
      formData.append("password", password);

      startTransition(async () => {
        await signInAction(formData);
      });
    } catch (error: unknown) {
      toast({
        title: "Login Failed",
        description: errorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!passwordsMatch) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = getFormDataWithParams();
      formData.append("email", email);
      formData.append("password", password);

      startTransition(async () => {
        await signUpAction(formData);
      });
    } catch (error: unknown) {
      toast({
        title: "Signup Failed",
        description: errorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = getFormDataWithParams();
      formData.append("email", recoveryEmail);

      startTransition(async () => {
        await forgotPasswordAction(formData);
      });
      setRecoverySubmitted(true);
    } catch (error: unknown) {
      toast({
        title: "Recovery Failed",
        description: errorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    try {
      startTransition(async () => {
        const formData = getFormDataWithParams();
        if (provider === "google") {
          await signInWithGoogleAction(formData);
        }
      });
    } catch (error: unknown) {
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Failed`,
        description: errorMessage(error),
        variant: "destructive",
      });
    }
  };

  /** Back to the CV preview the user came from, or home. */
  const goBack = () => {
    const routerData = getFormDataWithParams();
    const cvId = routerData.get("cvId");
    const lang = routerData.get("lang");
    router.push(cvId ? `/cv-preview?cvId=${cvId}&lang=${lang || "en"}` : "/");
  };

  const resetRecovery = () => {
    setRecoverySubmitted(false);
    setRecoveryEmail("");
    setActiveTab("login");
  };

  return {
    cvId,
    activeTab,
    setActiveTab,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    recoveryEmail,
    setRecoveryEmail,
    passwordsMatch,
    passwordVisible,
    togglePasswordVisible: () => setPasswordVisible(!passwordVisible),
    confirmPasswordVisible,
    toggleConfirmPasswordVisible: () =>
      setConfirmPasswordVisible(!confirmPasswordVisible),
    loading,
    isPending,
    recoverySubmitted,
    handleLogin,
    handleSignup,
    handlePasswordRecovery,
    handleSocialLogin,
    goBack,
    resetRecovery,
  };
}

export type LoginFormState = ReturnType<typeof useLoginForm>;
