"use client";

import type React from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  FileText,
  HelpCircle,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/app/actions";
import { useSearchParams } from "next/navigation";

interface SubscriptionPlanProps {
  title: string;
  price: string;
  cvCount: number;
  isPopular?: boolean;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  title,
  price,
  cvCount,
  isPopular = false,
}) => {
  const { toast } = useToast();

  const handleSubscribe = async () => {
    const searchParams = useSearchParams();

    const cvId = searchParams.get("cvId");
    const lang = searchParams.get("lang");

    if (!cvId) {
      toast({
        title: "Error",
        description: "CV ID is missing. Please check the link.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Subscription Selected",
      description: `You've selected the ${title} plan. Proceeding to checkout...`,
    });

    await createCheckoutSession(title.toLowerCase(), cvId, lang ?? "en");
  };

  return (
    <Card
      className={`border shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] ${
        isPopular
          ? "border-[#5B2EFF] dark:border-[#9B87F5] border-2"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {isPopular && (
        <div className="bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] text-white py-1.5 px-3 text-xs font-medium text-center">
          MOST POPULAR
        </div>
      )}

      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-xl text-gray-800 dark:text-white">
          {title}
        </CardTitle>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold text-[#5B2EFF] dark:text-[#9B87F5]">
            {price}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <ul className="space-y-3 text-sm">
          {[
            `Create ${cvCount} CVs`,
            "English & Polish language support",
            "Professional template",
            "PDF format",
          ].map((item, i) => (
            <li key={i} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pb-5">
        <Button
          onClick={handleSubscribe}
          className={`w-full bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white transition-all duration-200 ${
            isPopular ? "shadow-md" : ""
          }`}
        >
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function Subscription() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#9B87F5]/10 to-[#5B2EFF]/10 dark:from-[#9B87F5]/20 dark:to-[#5B2EFF]/20 -z-10"></div>

      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto pt-16 md:pt-20 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
        <div className="text-center mb-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              NICE{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF]">
                CV
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Stop tailoring,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF]">
                {" "}
                start interviewing.{" "}
              </span>
            </p>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select a subscription that suits your needs. All plans include our
            premium features and support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <SubscriptionPlan title="Ultimate" price="€8" cvCount={22} />
          <SubscriptionPlan title="Professional" price="€6" cvCount={15} />
          <SubscriptionPlan title="Standard" price="€4" cvCount={9} isPopular />
          <SubscriptionPlan title="Basic" price="€3" cvCount={5} />
        </div>

        <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md max-w-4xl mx-auto overflow-hidden opacity-0 animate-[scaleIn_0.5s_ease-in-out_0.3s_forwards]">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 shadow-inner flex items-center justify-center">
                  <HelpCircle className="h-12 w-12 text-[#5B2EFF] dark:text-[#9B87F5]" />
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Need Help Choosing?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Not sure which plan is right for you? Here are some things to
                  consider:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FileText className="h-5 w-5 mr-2 text-[#5B2EFF] dark:text-[#9B87F5] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Number of CVs:</strong> Consider how many
                      different CV versions you'll need.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Languages className="h-5 w-5 mr-2 text-[#5B2EFF] dark:text-[#9B87F5] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      <strong>Language Support:</strong> All plans support
                      English and Polish languages.
                    </span>
                  </li>
                </ul>

                <div className="mt-6">
                  <Button className="bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] text-white transition-all duration-200">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
