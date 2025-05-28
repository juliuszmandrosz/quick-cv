import { TooltipProvider } from "@/components/ui/tooltip"; // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext"; // import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "NICE CV",
  description: "Create the perfect CV for the job you want",
  openGraph: {
    title: "NICE CV – Tailored, ATS-Optimized Resumes in Seconds",
    description:
      "Generate your perfect CV in seconds. Paste a job offer, upload your resume, and get hired faster.",
    url: "https://quick-cv-eight.vercel.app",
    siteName: "NICE CV",
    images: [
      {
        url: "https://unaqbcplczayqbrrkuqq.supabase.co/storage/v1/object/public/logo//NICE%20CV%20LOGO.png",
        width: 1200,
        height: 630,
        alt: "NICE CV Preview",
      },
    ],
    type: "website",
  },
};

// const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <PostHogProvider>
          {/*<QueryClientProvider client={queryClient}>*/}
          <TooltipProvider>
            <LanguageProvider>
              <Toaster />
              <Sonner />
              {children}
            </LanguageProvider>
          </TooltipProvider>
          {/*<ReactQueryDevtools initialIsOpen={false} />*/}
          {/*</QueryClientProvider>*/}
        </PostHogProvider>
      </body>
    </html>
  );
}
