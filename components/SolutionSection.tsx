"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Link, Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

const SolutionSection = () => {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <section className="section-padding bg-nicecv-soft-gray">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("solution.title")}{" "}
            <span className="gradient-text">{t("solution.titleBold")}</span>
          </h2>
          <p className="text-xl text-gray-700">{t("solution.subtitle")}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto animate-zoom-in">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-nicecv-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link className="w-8 h-8 text-nicecv-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("solution.step1")}
              </h3>
              <p className="text-gray-600">{t("solution.step1.desc")}</p>
            </div>

            <div className="flex items-center justify-center md:block">
              <div className="hidden md:block border-t-4 border-dashed border-nicecv-purple/30 mt-8"></div>
              <ArrowRight className="md:hidden w-6 h-6 text-nicecv-purple" />
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-nicecv-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-nicecv-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("solution.step2")}
              </h3>
              <p className="text-gray-600">{t("solution.step2.desc")}</p>
            </div>

            <div className="flex items-center justify-center md:block">
              <div className="hidden md:block border-t-4 border-dashed border-nicecv-purple/30 mt-8"></div>
              <ArrowRight className="md:hidden w-6 h-6 text-nicecv-purple" />
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-nicecv-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-nicecv-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("solution.step3")}
              </h3>
              <p className="text-gray-600">{t("solution.step3.desc")}</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              onClick={() => {
                router.push("/create-cv");
              }}
              className="bg-nicecv-purple hover:bg-nicecv-dark-purple text-white text-lg px-8 py-6"
            >
              {t("solution.cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
