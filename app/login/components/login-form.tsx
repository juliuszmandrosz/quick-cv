"use client";

import React, { useEffect, useState, useTransition } from "react";
import { AlertTriangle, ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
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

import {
  forgotPasswordAction,
  signInAction,
  signInWithGoogleAction,
  signUpAction,
} from "@/app/actions";

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sprawdzamy, czy mamy komunikaty w URL
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const cvId = searchParams.get("cvId");
      const lang = searchParams.get("lang");
      formData.append("email", email);
      formData.append("password", password);
      if (cvId) formData.append("cvId", cvId);
      if (lang) formData.append("lang", lang);
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
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
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
      const formData = new FormData();
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

  const handleSocialLogin = async (provider: "google" | "apple") => {
    try {
      startTransition(async () => {
        const formData = new FormData();
        const cvId = searchParams.get("cvId");
        const lang = searchParams.get("lang");
        if (cvId) formData.append("cvId", cvId);
        if (lang) formData.append("lang", lang);
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
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#9B87F5]/10 to-[#5B2EFF]/10 dark:from-[#9B87F5]/20 dark:to-[#5B2EFF]/20 -z-10"></div>

      <Button
        onClick={() => router.back()}
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 md:top-8 md:left-8 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="ml-1">Back</span>
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            NICE{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF]">
              CV
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Stop tailoring,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF]">
              start interviewing.
            </span>
          </p>
        </div>

        <Card className="overflow-hidden border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-2">
            {/* Optionally, you can add a title here */}
          </CardHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex justify-between bg-gray-100/80 dark:bg-gray-700/50 rounded-lg mx-6 p-1">
              <TabsTrigger
                value="login"
                className="flex-1 rounded-md px-2 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9B87F5] data-[state=active]:to-[#5B2EFF] data-[state=active]:text-white transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="flex-1 rounded-md px-2 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9B87F5] data-[state=active]:to-[#5B2EFF] data-[state=active]:text-white transition-all"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger
                value="recover"
                className="flex-1 rounded-md px-2 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9B87F5] data-[state=active]:to-[#5B2EFF] data-[state=active]:text-white transition-all"
              >
                Recover
              </TabsTrigger>
            </TabsList>

            <CardContent className="pt-6 pb-4 px-6">
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
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-[#9B87F5]"
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
                        className="text-xs text-[#5B2EFF] hover:text-[#9B87F5] dark:text-[#9B87F5] dark:hover:text-[#5B2EFF]"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        placeholder="••••••••"
                        type={passwordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-[#9B87F5]"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-eye"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-eye-off"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08C14.4 6.6 16.67 9.32 17.83 12 16.67 14.68 14.4 17.4 10.73 18.92" />
                            <path d="M13.28 5.08C9.6 6.6 7.33 9.32 6.17 12 7.33 14.68 9.6 17.4 13.28 18.92" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    disabled={loading || isPending}
                    className="w-full bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white transition-all duration-200 mt-4"
                  >
                    {loading || isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      <>
                        Login <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

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
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-[#9B87F5]"
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
                    <div className="relative">
                      <Input
                        id="signup-password"
                        placeholder="••••••••"
                        type={passwordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-[#9B87F5]"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-eye"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-eye-off"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08C14.4 6.6 16.67 9.32 17.83 12 16.67 14.68 14.4 17.4 10.73 18.92" />
                            <path d="M13.28 5.08C9.6 6.6 7.33 9.32 6.17 12 7.33 14.68 9.6 17.4 13.28 18.92" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                          </svg>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Password must be at least 8 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        placeholder="••••••••"
                        type={passwordVisible ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-[#9B87F5] ${
                          confirmPassword && password !== confirmPassword
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                        required
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Passwords don't match
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    disabled={
                      loading ||
                      isPending ||
                      (confirmPassword && password) !== confirmPassword
                    }
                    className="w-full bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white transition-all duration-200 mt-4"
                  >
                    {loading || isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      <>
                        Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

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
                          className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-[#9B87F5]"
                          required
                        />
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-sm flex items-start border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-amber-500" />
                        <span className="text-amber-800 dark:text-amber-200">
                          We'll send you instructions on how to reset your
                          password.
                        </span>
                      </div>
                      <Button
                        disabled={loading || isPending}
                        className="w-full bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white transition-all duration-200 mt-4"
                      >
                        {loading || isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait
                          </>
                        ) : (
                          <>
                            Recover Password{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-green-600 dark:text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
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

            <div className="flex justify-center px-6 pb-6">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("google")}
                className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 mr-2"
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
                Google
              </Button>
              {/*<Button*/}
              {/*  variant="outline"*/}
              {/*  onClick={() => handleSocialLogin("apple")}*/}
              {/*  className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"*/}
              {/*>*/}
              {/*  <svg*/}
              {/*    xmlns="http://www.w3.org/2000/svg"*/}
              {/*    width="20"*/}
              {/*    height="20"*/}
              {/*    viewBox="0 0 24 24"*/}
              {/*    fill="currentColor"*/}
              {/*    className="mr-2"*/}
              {/*  >*/}
              {/*    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.913 1.183-4.962 3.007-2.115 3.667-.539 9.103 1.519 12.11 1 1.427 2.19 3.027 3.754 2.973 1.513-.061 2.082-.974 3.912-.974 1.82 0 2.333.974 3.918.947 1.616-.027 2.646-1.47 3.634-2.897 1.142-1.667 1.616-3.293 1.642-3.38-.035-.027-3.154-1.214-3.18-4.812-.027-3.007 2.454-4.45 2.568-4.523-1.411-2.063-3.595-2.3-4.361-2.347-1.948-.147-3.615 1.06-4.483 1.06z" />*/}
              {/*    <path d="M12.084 3.667c.828-1.004 1.378-2.38 1.227-3.768-1.183.048-2.615.794-3.46 1.798-.76.877-1.423 2.285-1.244 3.634 1.323.103 2.674-.683 3.477-1.664z" />*/}
              {/*  </svg>*/}
              {/*  Apple*/}
              {/*</Button>*/}
            </div>

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
                    className="text-[#5B2EFF] hover:text-[#9B87F5] dark:text-[#9B87F5] dark:hover:text-[#5B2EFF] font-medium"
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
                    className="text-[#5B2EFF] hover:text-[#9B87F5] dark:text-[#9B87F5] dark:hover:text-[#5B2EFF] font-medium"
                  >
                    Login
                  </Link>
                </p>
              )}
            </CardFooter>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          By continuing, you agree to NICE CV's{" "}
          <Link
            href="#"
            className="text-[#5B2EFF] hover:text-[#9B87F5] dark:text-[#9B87F5] dark:hover:text-[#5B2EFF]"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="text-[#5B2EFF] hover:text-[#9B87F5] dark:text-[#9B87F5] dark:hover:text-[#5B2EFF]"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
