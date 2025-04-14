"use client";

import React from "react";
import FeatureCard from "./FeatureCard";
import {
  Clock,
  FolderArchive,
  Laptop,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="section-padding bg-white">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("features.title")}{" "}
            <span className="gradient-text">{t("features.titleBold")}</span>
          </h2>
          <p className="text-xl text-gray-700">{t("features.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Clock}
            title={t("features.time.title")}
            description={t("features.time.desc")}
          />

          <FeatureCard
            icon={Search}
            title={t("features.ats.title")}
            description={t("features.ats.desc")}
          />

          <FeatureCard
            icon={Sparkles}
            title={t("features.interview.title")}
            description={t("features.interview.desc")}
          />

          <FeatureCard
            icon={Laptop}
            title={t("features.easy.title")}
            description={t("features.easy.desc")}
          />

          <FeatureCard
            icon={FolderArchive}
            title={t("features.repository.title")}
            description={t("features.repository.desc")}
          />

          <FeatureCard
            icon={Target}
            title={t("features.success.title")}
            description={t("features.success.desc")}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
