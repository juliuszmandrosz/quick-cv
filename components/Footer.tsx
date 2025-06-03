"use client";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SiX } from "@icons-pack/react-simple-icons";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 gradient-text">Nice CV</h3>
            <p className="text-gray-600 mb-4">{t("footer.title")}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.product")}</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-600 hover:text-nicecv-purple transition-colors"
                >
                  {t("footer.features")}
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-600 hover:text-nicecv-purple transition-colors"
                >
                  {t("footer.howItWorks")}
                </a>
              </li>
              {/*<li>*/}
              {/*  <a*/}
              {/*    href="#"*/}
              {/*    className="text-gray-600 hover:text-nicecv-purple transition-colors"*/}
              {/*  >*/}
              {/*    {t("footer.pricing")}*/}
              {/*  </a>*/}
              {/*</li>*/}
            </ul>
          </div>

          {/*<div>*/}
          {/*  <h4 className="font-semibold mb-4">Company</h4>*/}
          {/*  <ul className="space-y-2">*/}
          {/*    <li>*/}
          {/*      <a*/}
          {/*        href="#"*/}
          {/*        className="text-gray-600 hover:text-nicecv-purple transition-colors"*/}
          {/*      >*/}
          {/*        About Us*/}
          {/*      </a>*/}
          {/*    </li>*/}
          {/*    <li>*/}
          {/*      <a*/}
          {/*        href="#"*/}
          {/*        className="text-gray-600 hover:text-nicecv-purple transition-colors"*/}
          {/*      >*/}
          {/*        Blog*/}
          {/*      </a>*/}
          {/*    </li>*/}
          {/*    <li>*/}
          {/*      <a*/}
          {/*        href="#"*/}
          {/*        className="text-gray-600 hover:text-nicecv-purple transition-colors"*/}
          {/*      >*/}
          {/*        Careers*/}
          {/*      </a>*/}
          {/*    </li>*/}
          {/*  </ul>*/}
          {/*</div>*/}

          <div>
            <h4 className="font-semibold mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy-policy"
                  className="text-gray-600 hover:text-nicecv-purple transition-colors"
                >
                  {t("footer.privacyPolicy")}
                </a>
              </li>
              <li>
                <a
                  href="/terms-of-service"
                  className="text-gray-600 hover:text-nicecv-purple transition-colors"
                >
                  {t("footer.termsOfService")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 mb-4 md:mb-0">
            &copy; {currentYear} Nice CV. {t("footer.allRightsReserved")}
          </p>

          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-nicecv-purple transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <SiX></SiX>
            </a>

            <a
              href="#"
              className="text-gray-400 hover:text-nicecv-purple transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
