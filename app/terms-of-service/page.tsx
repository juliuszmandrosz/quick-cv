// app/terms-of-service/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsOfServicePage() {
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
      <h1 className="text-3xl font-bold mb-6">Terms of Service for Nice CV</h1>
      <ol className="space-y-4 list-decimal list-inside">
        <li>
          <strong>Agreement &amp; Service</strong>
          <p>
            Welcome to Nice CV! By using our app and services
            (&quot;Service&quot;), provided by us, you agree to these Terms. Our
            Service helps you create and manage CVs/resumes. If you don&apos;t
            agree, please don&apos;t use the Service. You must be at least 16
            years old (or the age of consent in your region) to use the Service.
          </p>
        </li>
        <li>
          <strong>Your Account</strong>
          <p>
            You need an account for most features. Keep your information
            accurate and your password safe. You&apos;re responsible for your
            account activity.
          </p>
        </li>
        <li>
          <strong>Using the Service</strong>
          <p>
            License: We grant you a limited, non-exclusive right to use the
            Service for personal CV creation. The number of CVs you can generate
            or download depends on the bundle plan you purchased.
          </p>
        </li>
        <li>
          <strong>Your CV Content</strong>
          <p>
            You own the information you put into your CV (&quot;User
            Content&quot;). You grant us a license to use, store, and process
            your User Content solely to provide and improve the Service. You are
            responsible for the accuracy and legality of your User Content.
          </p>
        </li>
        <li>
          <strong>Our Intellectual Property</strong>
          <p>
            We own the Service, including the app, brand, and technology
            (excluding your User Content).
          </p>
        </li>
        <li>
          <strong>Disclaimers &amp; Liability</strong>
          <p>
            &quot;As Is&quot;: The Service is provided &quot;as is&quot; without
            warranties. We don&apos;t guarantee it will be error-free, secure,
            or always available. Users should verify the final CV content before
            using it in any application process. We are not liable for indirect
            or consequential damages. It is the User&apos;s responsibility to
            perform a final review of all CVs/resumes submitted for job
            applications.
          </p>
        </li>
        <li>
          <strong>Indemnification</strong>
          <p>
            You agree to indemnify us for any claims or costs arising from your
            misuse of the Service, your User Content, or your violation of these
            Terms.
          </p>
        </li>
        <li>
          <strong>Termination</strong>
          <p>
            You can stop using the Service and request account deletion anytime
            and request the deletion of personal information. We can suspend or
            terminate your access if you violate these Terms. To delete your
            account and personal data, please contact us at juliusz@mandrosz.dev
          </p>
        </li>
      </ol>
    </main>
  );
}
