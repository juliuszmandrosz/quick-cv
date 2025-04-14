import { TooltipProvider } from "@/components/ui/tooltip"; // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext"; // import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Twoja apka",
  description: "Opis",
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
      </body>
    </html>
  );
}
