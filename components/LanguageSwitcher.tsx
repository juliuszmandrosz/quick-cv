"use client";
import React from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "pl" : "en");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-white/80 hover:bg-gray-100"
      onClick={toggleLanguage}
    >
      <Globe className="w-4 h-4" />
      {language === "en" ? "PL" : "EN"}
    </Button>
  );
};

export default LanguageSwitcher;
