// app/privacy-policy/page.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("checkout.back")}
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy for Nice CV</h1>
      <ol className="space-y-4 list-decimal list-inside">
        <li>
          <strong>Introduction &amp; Who We Are</strong>
          <p>
            Nice CV respects your privacy. This policy explains how we handle
            your personal data when you use Nice CV ("Service"). This policy
            aims to comply with GDPR.
          </p>
        </li>
        <li>
          <strong>Information We Collect</strong>
          <p>
            <strong>You Provide:</strong> Account details (name, email), and the
            sensitive information you enter for your CV (contact info,
            work/education history, skills, etc.).
            <br />
            <strong>We Collect Automatically:</strong> Usage data (how you use
            the app), device information (ID, OS, IP address). We may use
            cookies for functionality and analytics.
          </p>
        </li>
        <li>
          <strong>How &amp; Why We Use Your Data (Legal Basis)</strong>
          <div>
            We process your data:
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>To Provide the Service (Contractual Necessity):</strong>{" "}
                Creating/managing your CV, operating your account.
              </li>
              <li>
                <strong>
                  To Improve &amp; Secure the Service (Legitimate Interests):
                </strong>{" "}
                Analytics, troubleshooting, security monitoring.
              </li>
              <li>
                <strong>With Your Permission (Consent):</strong> For optional
                features or marketing (if applicable). You can withdraw consent
                anytime.
              </li>
              <li>
                <strong>To Comply with Law (Legal Obligation):</strong> If
                legally required.
              </li>
            </ul>
            We need your CV data to make the app work for you. We handle this
            sensitive information carefully.
          </div>
        </li>
        <li>
          <strong>Sharing Your Information</strong>
          <div>
            We don't sell your data.
            <br />
            We only share it with:
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>Service Providers:</strong> Companies helping us operate
                (e.g., cloud hosting, analytics). They are bound by contract
                (including GDPR DPAs where needed) to protect your data.
              </li>
              <li>
                <strong>Legal Reasons:</strong> If required by law or to protect
                rights and safety.
              </li>
              <li>
                <strong>Business Transfers:</strong> If we merge or are
                acquired.
              </li>
              <li>
                <strong>Your Consent:</strong> If you ask us to share it.
              </li>
            </ul>
          </div>
        </li>
        <li>
          <strong>Security &amp; Retention</strong>
          <p>
            We use technical and organizational measures (like encryption and
            access controls) to protect your data. We keep your data as long as
            your account is active or as needed for legal/service purposes. You
            can request deletion (see Your Rights). We use measures such as
            HTTPS encryption, database access controls, and secure cloud
            storage.
          </p>
        </li>
        <li>
          <strong>Your GDPR Rights</strong>
          <div>
            You have rights over your data:
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>Access:</strong> Get a copy of your data.
              </li>
              <li>
                <strong>Rectify:</strong> Correct inaccurate data.
              </li>
              <li>
                <strong>Erase:</strong> Request deletion of your data.
              </li>
              <li>
                <strong>Restrict:</strong> Limit how we process your data.
              </li>
              <li>
                <strong>Object:</strong> Object to processing based on
                legitimate interests.
              </li>
              <li>
                <strong>Portability:</strong> Get your data in a transferable
                format.
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Take back permission you
                gave.
              </li>
              <li>
                <strong>Complain:</strong> Lodge a complaint with your local
                data protection authority.
              </li>
            </ul>
            To exercise these rights, contact us.
          </div>
        </li>
        <li>
          <strong>Children</strong>
          <p>
            Our Service is not for users under 16. We don't knowingly collect
            data from children.
          </p>
        </li>
        <li>
          <strong>Changes &amp; Contact</strong>
          <p>
            We may update this policy; check the Effective Date (14-04-2025).
            <br />
            To ask questions, contact us at{" "}
            <a href="mailto:juliusz@mandrosz.dev" className="text-blue-600">
              juliusz@mandrosz.dev
            </a>
          </p>
        </li>
      </ol>
    </main>
  );
}
