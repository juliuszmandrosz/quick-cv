"use client";

import type React from "react";
import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  forgotPasswordAction,
  signInAction,
  signInWithGoogleAction,
  signUpAction,
} from "@/app/actions"; // UI Components

// UI Components
interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
}

const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  isVisible,
  toggleVisibility,
  placeholder = "••••••••",
  error = false,
  errorMessage = "",
}: PasswordInputProps) => (
  <div className="relative">
    <input
      id={id}
      name={name}
      type={isVisible ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
        error ? "border-red-500 dark:border-red-500" : ""
      }`}
      autoComplete="off"
    />
    <button
      type="button"
      onClick={toggleVisibility}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      tabIndex={-1}
    >
      {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
    {error && errorMessage && (
      <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
    )}
  </div>
);

interface LoadingButtonProps {
  loading: boolean;
  isPending: boolean;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  isPending,
  children,
}) => (
  <Button
    disabled={loading || isPending}
    className="w-full bg-gradient-to-r from-primary/90 to-primary hover:from-primary/80 hover:to-primary/90 text-white transition-all duration-200"
  >
    {loading || isPending ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </>
    ) : (
      <>
        {children} <ArrowRight className="ml-2 h-4 w-4" />
      </>
    )}
  </Button>
);

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Check for URL messages on component mount
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

  // Form validation
  const passwordsMatch = password === confirmPassword;
  const isValidPassword = password.length >= 8;
  const isFormValid = {
    login: email.length > 0 && password.length > 0,
    signup: email.length > 0 && isValidPassword && passwordsMatch,
    recover: recoveryEmail.length > 0,
  };

  // Get URL parameters for redirects
  const getFormDataWithParams = (formData = new FormData()) => {
    const cvId = searchParams.get("cvId");
    const lang = searchParams.get("lang");
    if (cvId) formData.append("cvId", cvId);
    if (lang) formData.append("lang", lang);
    return formData;
  };

  // Form submission handlers
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
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
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
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred.",
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
    } catch (error: any) {
      toast({
        title: "Recovery Failed",
        description: error.message || "An unexpected error occurred.",
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
    } catch (error: any) {
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Failed`,
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 -z-10"></div>

      <Button
        onClick={() => {
          const routerData = getFormDataWithParams();
          if (routerData.get("cvId")) {
            const cvId = routerData.get("cvId");
            const lang = routerData.get("lang");
            router.push(
              `/cv-preview?cvId=${cvId}${lang ? `&lang=${lang}` : "en"}`,
            );
          } else {
            router.push("/");
          }
        }}
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 md:top-8 md:left-8 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </Button>

      <div className="w-full max-w-md">
        {/* Logo and tagline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            NICE{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary">
              CV
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Stop tailoring,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary">
              start interviewing.
            </span>
          </p>
        </div>

        {/* Main card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-2" />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tab navigation */}
            <TabsList className="flex justify-between bg-gray-100/80 dark:bg-gray-700/50 rounded-lg mx-6 p-1">
              <TabsTrigger
                value="login"
                className="flex-1 rounded-md px-2 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-white transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="flex-1 rounded-md px-2 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-white transition-all"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger
                value="recover"
                className="flex-1 rounded-md px-2 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-white transition-all"
              >
                Recover
              </TabsTrigger>
            </TabsList>

            <CardContent className="pt-6 pb-4 px-6">
              {/* Login tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("recover");
                        }}
                        className="text-xs text-primary hover:text-primary/80 dark:text-primary/90 dark:hover:text-primary/70"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <PasswordInput
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      isVisible={passwordVisible}
                      toggleVisibility={() =>
                        setPasswordVisible(!passwordVisible)
                      }
                      error={password.length > 0 && password.length < 8}
                      errorMessage="Password must be at least 8 characters"
                    />
                  </div>

                  <LoadingButton loading={loading} isPending={isPending}>
                    Login
                  </LoadingButton>
                </form>
              </TabsContent>

              {/* Signup tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="text-sm font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>

                    <PasswordInput
                      id="signup-password"
                      name="signup-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      isVisible={passwordVisible}
                      toggleVisibility={() =>
                        setPasswordVisible(!passwordVisible)
                      }
                      error={password.length > 0 && password.length < 8}
                      errorMessage="Password must be at least 8 characters"
                    />
                    {password.length === 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Password must be at least 8 characters
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <PasswordInput
                      id="confirm-password"
                      name="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      isVisible={confirmPasswordVisible}
                      toggleVisibility={() =>
                        setConfirmPasswordVisible(!confirmPasswordVisible)
                      }
                      error={confirmPassword.length > 0 && !passwordsMatch}
                      errorMessage="Passwords don't match"
                    />
                  </div>

                  <LoadingButton loading={loading} isPending={isPending}>
                    Sign up
                  </LoadingButton>
                </form>
              </TabsContent>

              {/* Password recovery tab */}
              <TabsContent value="recover">
                <form onSubmit={handlePasswordRecovery} className="space-y-4">
                  {!recoverySubmitted ? (
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="recoveryEmail"
                          className="text-sm font-medium"
                        >
                          Email
                        </Label>
                        <Input
                          id="recoveryEmail"
                          placeholder="name@example.com"
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-primary"
                          required
                        />
                      </div>

                      <Alert
                        variant="default"
                        className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                      >
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                          We'll send you instructions on how to reset your
                          password.
                        </AlertDescription>
                      </Alert>

                      <LoadingButton loading={loading} isPending={isPending}>
                        Send Recovery Email
                      </LoadingButton>
                    </>
                  ) : (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                        Check your inbox
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                        We've sent recovery instructions to:
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {recoveryEmail}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRecoverySubmitted(false);
                          setRecoveryEmail("");
                          setActiveTab("login");
                        }}
                        className="mt-4 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Back to Login
                      </Button>
                    </div>
                  )}
                </form>
              </TabsContent>
            </CardContent>

            {/* Social login divider */}
            <div className="relative my-4 px-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="flex justify-center px-6 pb-6">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("google")}
                className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <GoogleIcon className="h-5 w-5 mr-2" />
                Google
              </Button>
            </div>

            {/* Footer links */}
            <CardFooter className="text-center pt-0 pb-6">
              {activeTab === "login" ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("signup");
                    }}
                    className="text-primary hover:text-primary/80 dark:text-primary/90 dark:hover:text-primary/70 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("login");
                    }}
                    className="text-primary hover:text-primary/80 dark:text-primary/90 dark:hover:text-primary/70 font-medium"
                  >
                    Login
                  </Link>
                </p>
              )}
            </CardFooter>
          </Tabs>
        </Card>

        {/* Terms and privacy */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          By continuing, you agree to NICE CV's{" "}
          <Link
            href="#"
            className="text-primary hover:text-primary/80 dark:text-primary/90 dark:hover:text-primary/70"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="text-primary hover:text-primary/80 dark:text-primary/90 dark:hover:text-primary/70"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

// Google icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
