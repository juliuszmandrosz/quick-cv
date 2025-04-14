"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

const CTASection = () => {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <section className="section-padding bg-gradient-to-br from-nicecv-purple/90 to-nicecv-dark-purple text-white">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {t("cta.title")}
          </h2>
          <p
            className="text-xl mb-8 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {t("cta.subtitle")}
          </p>

          <div
            className="grid sm:grid-cols-3 gap-4 mb-10 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-center sm:justify-end">
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{t("cta.feature1")}</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{t("cta.feature2")}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{t("cta.feature3")}</span>
            </div>
          </div>

          <Button
            onClick={() => {
              router.push("/create-cv");
            }}
            className="bg-white text-nicecv-dark-purple hover:bg-gray-100 text-lg px-8 py-6 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            {t("cta.button")}
          </Button>

          <p
            className="text-sm mt-4 text-white/80 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            {t("cta.free")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
