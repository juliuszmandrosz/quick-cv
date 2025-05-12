"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Coffee, Loader2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function LoadingScreen() {
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const messages = [
    "Building something special just for you...",
    "Grab a coffee while we craft your perfect CV...",
    "Adding that professional touch to your resume...",
    "Almost there! Your CV is going to be a BOMB!",
    "Polishing the final details...",
    "Just a few more seconds for perfection...",
  ];

  useEffect(() => {
    const totalDuration = 70; // czas trwania w sekundach
    const increment = 100 / totalDuration;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + increment;
      });
    }, 1000);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 10000);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, totalDuration * 1000); // 70 sekund

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(hideTimer);
    };
  }, [messages.length]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div
        className={`text-center p-6 ${isMobile ? "w-full px-4" : "w-2/3 max-w-2xl"}`}
      >
        <div className="mb-8 flex justify-center">
          {progress < 50 ? (
            <Coffee
              className={`${isMobile ? "h-16 w-16" : "h-24 w-24"} animate-pulse text-amber-400`}
            />
          ) : (
            <Sparkles
              className={`${isMobile ? "h-16 w-16" : "h-24 w-24"} animate-pulse text-amber-400`}
            />
          )}
        </div>

        <h2 className={`mb-4 font-bold ${isMobile ? "text-2xl" : "text-4xl"}`}>
          NICE CV Magic in Progress
        </h2>

        <div className="mb-8 min-h-16 flex items-center justify-center">
          <p
            className={`${isMobile ? "text-lg" : "text-xl"} animate-fadeIn`}
            key={messageIndex}
          >
            {messages[messageIndex]}
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <Loader2 className="h-5 w-5 animate-spin" />
          <Progress value={progress} className="h-2 w-full" />
        </div>

        <p
          className={`mt-8 text-slate-300 ${isMobile ? "text-sm" : "text-base"}`}
        >
          We're creating something extraordinary that will make your CV stand
          out!
        </p>
      </div>
    </div>
  );
}
