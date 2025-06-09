"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  FileText,
  Globe,
  HelpCircle,
  Languages,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface SubscriptionPlanProps {
  cvId?: string | null;
  lang?: string | null;
  title: string;
  price: string;
  cvCount: number;
  isPopular?: boolean;
}

interface CurrencyRates {
  [key: string]: {
    [key: string]: number;
  };
}

const SubscriptionPlan: React.FC<
  SubscriptionPlanProps & { currency: string }
> = ({ cvId, lang, title, price, cvCount, isPopular = false, currency }) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubscribe = async (
    cvId?: string | null,
    lang?: string | null,
  ) => {
    toast({
      title: t("checkout.planSelected"),
      description: `${t("checkout.planSelectedMessage")} ${title}. ${t("checkout.proceeding")}`,
    });

    await createCheckoutSession(
      `${title.toLowerCase()}`,
      currency,
      cvId,
      lang ?? "en",
    );
  };

  return (
    <Card
      className={`border shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] ${
        isPopular
          ? "border-[#5B2EFF] dark:border-[#9B87F5] border-2"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {isPopular && (
        <div className="bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] text-white py-1.5 px-3 text-xs font-medium text-center">
          {t("checkout.mostPopular")}
        </div>
      )}

      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-xl text-gray-800 dark:text-white">
          {title}
        </CardTitle>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold text-[#5B2EFF] dark:text-[#9B87F5]">
            {currency === "EUR" ? "€" : ""}
            {price}
            {currency === "PLN" ? "zł" : ""}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <ul className="space-y-3 text-sm">
          {[
            `${t("checkout.create")} ${cvCount} ${t("checkout.cvs")}`,
            `${t("checkout.languages")}`,
            `${t("checkout.template")}`,
            `${t("checkout.pdf")}`,
          ].map((item, i) => (
            <li key={i} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pb-3">
        <Button
          onClick={() => handleSubscribe(cvId, lang)}
          className={`w-full bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white transition-all duration-200 ${
            isPopular ? "shadow-md" : ""
          }`}
        >
          {t("checkout.buyNow")}
        </Button>
      </CardFooter>

      <p className="text-xs text-muted-foreground text-center pb-4">
        🔒 {t("checkout.securePayment")}
      </p>
    </Card>
  );
};

export default function SubscriptionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cvId = searchParams.get("cvId");
  const lang = searchParams.get("lang") || "en";

  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState<"EUR" | "PLN">("EUR");
  const { t } = useLanguage();

  const currencyRates: CurrencyRates = {
    EUR: {
      Basic: 3,
      Standard: 4,
      Professional: 6,
      Ultimate: 8,
    },
    PLN: {
      Basic: 13,
      Standard: 17,
      Professional: 26,
      Ultimate: 34,
    },
  };

  const getPrice = (plan: string) => {
    return currencyRates[currency][plan];
  };

  useEffect(() => {
    setMounted(true);

    const timer = setTimeout(() => {
      const container = document.querySelector(".subscription-container");
      if (container) {
        container.classList.remove("opacity-0");
        container.classList.add("opacity-100");
      }
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#9B87F5]/10 to-[#5B2EFF]/10 dark:from-[#9B87F5]/20 dark:to-[#5B2EFF]/20 -z-10"></div>

      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Button
          onClick={() => {
            if (cvId) {
              router.push("/cv-preview?cvId=" + cvId + "&lang=" + lang);
            } else {
              router.push("/dashboard");
            }
          }}
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("checkout.back")}
        </Button>
      </div>

      <div
        className={`subscription-container max-w-7xl mx-auto transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        <div className="text-center space-y-4 mb-4 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("checkout.nice")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF]">
                {t("checkout.cv")}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("checkout.stopTailoring")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF]">
                {t("checkout.startInterviewing")}
              </span>
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm 2xl:text-base text-purple-900 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg py-2.5 px-4">
              <Unlock className="h-4 w-4 text-purple-600" />
              <span className="font-medium">{t("checkout.bannerMessage")}</span>
            </div>
          </div>

          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t("checkout.heading")}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t("checkout.subheading")}
          </p>

          <div className="flex justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-white/80 hover:bg-gray-100"
                >
                  <Globe className="h-4 w-4" />
                  {currency === "EUR"
                    ? t("checkout.currencyEUR")
                    : t("checkout.currencyPLN")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCurrency("EUR")}>
                  {t("checkout.currencyEUR")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency("PLN")}>
                  {t("checkout.currencyPLN")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <LanguageSwitcher />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4 sm:mb-8">
          <SubscriptionPlan
            cvId={cvId}
            lang={lang}
            title="Ultimate"
            price={getPrice("Ultimate").toString()}
            cvCount={22}
            currency={currency}
          />
          <SubscriptionPlan
            cvId={cvId}
            lang={lang}
            title="Professional"
            price={getPrice("Professional").toString()}
            cvCount={15}
            currency={currency}
          />
          <SubscriptionPlan
            cvId={cvId}
            lang={lang}
            title="Standard"
            price={getPrice("Standard").toString()}
            cvCount={9}
            isPopular
            currency={currency}
          />
          <SubscriptionPlan
            cvId={cvId}
            lang={lang}
            title="Basic"
            price={getPrice("Basic").toString()}
            cvCount={5}
            currency={currency}
          />
        </div>

        <Card
          className={`border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md max-w-4xl mx-auto overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 shadow-inner flex items-center justify-center">
                  <HelpCircle className="h-12 w-12 text-[#5B2EFF] dark:text-[#9B87F5]" />
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t("checkout.helpTitle")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t("checkout.helpDescription")}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FileText className="h-5 w-5 mr-2 text-[#5B2EFF] dark:text-[#9B87F5] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>{t("checkout.helpCvsTitle")}</strong>{" "}
                      {t("checkout.helpCvsDesc")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Languages className="h-5 w-5 mr-2 text-[#5B2EFF] dark:text-[#9B87F5] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>{t("checkout.helpLangTitle")}</strong>{" "}
                      {t("checkout.helpLangDesc")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
