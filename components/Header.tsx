"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useRouter } from "next/navigation";

const Header = () => {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <header className="border-b border-gray-100 py-4 w-full top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold gradient-text">Nice CV</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-gray-600 hover:text-nicecv-purple transition-colors"
          >
            {t("header.features")}
          </a>
          <a
            href="#how-it-works"
            className="text-gray-600 hover:text-nicecv-purple transition-colors"
          >
            {t("header.howItWorks")}
          </a>
          <a
            href="#testimonials"
            className="text-gray-600 hover:text-nicecv-purple transition-colors"
          >
            {t("header.testimonials")}
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Button
            onClick={() => router.push("/login")}
            className="bg-nicecv-purple hover:bg-nicecv-dark-purple text-white"
          >
            {t("header.signUp")}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
