"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginHeader } from "./login-header";
import { LoginTab } from "./login-tab";
import { RecoverTab } from "./recover-tab";
import { SignupTab } from "./signup-tab";
import { SocialLogin } from "./social-login";
import { useLoginForm } from "./use-login-form";

const TAB_TRIGGER_CLASS =
  "flex-1 rounded-md px-2 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-white transition-all";

const LINK_CLASS =
  "text-primary hover:text-primary/80 dark:text-primary/90 dark:hover:text-primary/70";

export default function LoginForm() {
  const { t } = useLanguage();
  const form = useLoginForm();
  const { activeTab, setActiveTab, cvId } = form;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Button
          onClick={form.goBack}
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("create.back")}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <LoginHeader cvId={cvId} />

        <Card className="overflow-hidden border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
          <CardHeader className="space-y-0 pb-0 sm:space-y-1 sm:pb-2" />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex justify-between bg-gray-100/80 dark:bg-gray-700/50 rounded-lg mx-6 p-1">
              <TabsTrigger value="login" className={TAB_TRIGGER_CLASS}>
                {t("login.login")}
              </TabsTrigger>
              <TabsTrigger value="signup" className={TAB_TRIGGER_CLASS}>
                {t("login.signUp")}
              </TabsTrigger>
              <TabsTrigger value="recover" className={TAB_TRIGGER_CLASS}>
                {t("login.recover")}
              </TabsTrigger>
            </TabsList>

            <CardContent className="pt-4 pb-2 px-4 sm:pt-6 sm:pb-4 sm:px-6">
              <TabsContent value="login">
                <LoginTab form={form} />
              </TabsContent>
              <TabsContent value="signup">
                <SignupTab form={form} />
              </TabsContent>
              <TabsContent value="recover">
                <RecoverTab form={form} />
              </TabsContent>
            </CardContent>

            <SocialLogin
              cvId={cvId}
              onGoogleLogin={() => form.handleSocialLogin("google")}
            />

            {/* Switch between login and signup */}
            <CardFooter className="text-center pt-0 pb-6">
              {activeTab === "login" ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("login.noAccount")}{" "}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("signup");
                    }}
                    className={`${LINK_CLASS} font-medium`}
                  >
                    {t("login.signUp")}
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("login.hasAccount")}{" "}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("login");
                    }}
                    className={`${LINK_CLASS} font-medium`}
                  >
                    {t("login.login")}
                  </Link>
                </p>
              )}
            </CardFooter>
          </Tabs>
        </Card>

        {/* Terms and privacy */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          {t("login.byContinuing")}{" "}
          <Link href="#" className={LINK_CLASS}>
            {t("footer.termsOfService")}
          </Link>{" "}
          {t("login.and")}{" "}
          <Link href="#" className={LINK_CLASS}>
            {t("footer.privacyPolicy")}
          </Link>
        </p>
      </div>
    </div>
  );
}
