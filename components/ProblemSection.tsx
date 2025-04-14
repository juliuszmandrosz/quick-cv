"use client";
import React from "react";
import { BrainCircuit, Clock, Users, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ProblemSection = () => {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-white">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("problem.title")}{" "}
            <span className="gradient-text">{t("problem.titleBold")}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div
            className="animate-slide-in-left"
            style={{ animationDelay: "0.1s" }}
          >
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 mb-6">
              {t("problem.paragraph1")}
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 mb-6">
              {t("problem.paragraph2")}
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 mb-6">
              {t("problem.paragraph3")}
            </p>
            <p className="text-xl md:text-2xl font-semibold text-nicecv-dark-purple mt-8">
              {t("problem.question")}
            </p>
          </div>

          <div
            className="grid grid-cols-2 gap-6 animate-slide-in-right"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("problem.hoursWasted.title")}
              </h3>
              <p className="text-gray-600">{t("problem.hoursWasted.desc")}</p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("problem.rejected.title")}
              </h3>
              <p className="text-gray-600">{t("problem.rejected.desc")}</p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("problem.fatigue.title")}
              </h3>
              <p className="text-gray-600">{t("problem.fatigue.desc")}</p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("problem.invisible.title")}
              </h3>
              <p className="text-gray-600">{t("problem.invisible.desc")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
