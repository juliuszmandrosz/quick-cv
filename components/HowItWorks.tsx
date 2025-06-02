"use client";
import React from "react";
import { ClipboardCheck, FileText, Link2, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="section-padding bg-nicecv-soft-gray">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="gradient-text">{t("howItWorks.title")}</span>
          </h2>
          <p className="text-xl text-gray-700">{t("howItWorks.subtitle")}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-nicecv-purple/20 -translate-x-1/2 hidden md:block"></div>

            <div
              className="flex flex-col md:flex-row items-center mb-16 md:mb-24 relative animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="md:w-1/2 md:pr-12 mb-6 md:mb-0 md:text-right">
                <h3 className="text-2xl font-bold mb-3">
                  {t("howItWorks.url.title")}
                </h3>
                <p className="text-lg text-gray-700">
                  {t("howItWorks.url.desc")}
                </p>
              </div>

              <div className="w-16 h-16 bg-nicecv-purple flex items-center justify-center rounded-full text-white font-bold text-xl z-10 my-4 md:my-0">
                <Link2 className="w-8 h-8" />
              </div>

              <div className="md:w-1/2 md:pl-12">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center mb-3">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            <div
              className="flex flex-col md:flex-row-reverse items-center mb-16 md:mb-24 relative animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="md:w-1/2 md:pl-12 mb-6 md:mb-0 md:text-left">
                <h3 className="text-2xl font-bold mb-3">
                  {t("howItWorks.upload.title")}
                </h3>
                <p className="text-lg text-gray-700">
                  {t("howItWorks.upload.desc")}
                </p>
              </div>

              <div className="w-16 h-16 bg-nicecv-purple flex items-center justify-center rounded-full text-white font-bold text-xl z-10 my-4 md:my-0">
                <FileText className="w-8 h-8" />
              </div>

              <div className="md:w-1/2 md:pr-12">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <div className="h-8 bg-gray-100 rounded-md flex items-center px-3 mb-3">
                    <div className="w-full bg-nicecv-purple/20 h-4 rounded"></div>
                  </div>
                  <div className="h-24 bg-gray-100 rounded-md p-3">
                    <div className="h-3 bg-white rounded w-full mb-2"></div>
                    <div className="h-3 bg-white rounded w-full mb-2"></div>
                    <div className="h-3 bg-white rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex flex-col md:flex-row items-center relative animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="md:w-1/2 md:pr-12 mb-6 md:mb-0 md:text-right">
                <h3 className="text-2xl font-bold mb-3">
                  {t("howItWorks.get.title")}
                </h3>
                <p className="text-lg text-gray-700">
                  {t("howItWorks.get.desc")}
                </p>
              </div>

              <div className="w-16 h-16 bg-nicecv-purple flex items-center justify-center rounded-full text-white font-bold text-xl z-10 my-4 md:my-0">
                <Zap className="w-8 h-8" />
              </div>

              <div className="md:w-1/2 md:pl-12">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex mb-3">
                    <div className="h-6 bg-nicecv-purple/20 rounded w-1/3 mr-2"></div>
                    <ClipboardCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="h-4 bg-nicecv-purple/10 rounded w-full mb-2"></div>
                  <div className="h-4 bg-nicecv-purple/10 rounded w-full mb-2"></div>
                  <div className="h-4 bg-nicecv-purple/10 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
