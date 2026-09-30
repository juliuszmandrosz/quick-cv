"use client";

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Coffee, Loader2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * The generation pipeline runs three sequential calls. Measured durations on
 * gpt-6.1-sol: reading the CV ~8s, building the strategy ~16s, writing the CV
 * ~30s. The bar maps onto those stages instead of a fixed timer, so it cannot
 * finish while the work is still running.
 */
export type GenerationStage = "extracting" | "planning" | "writing";

const STAGES: Record<GenerationStage, { from: number; to: number }> = {
  extracting: { from: 0, to: 25 },
  planning: { from: 25, to: 55 },
  writing: { from: 55, to: 97 },
};

export default function LoadingScreen({
  stage = "extracting",
}: {
  stage?: GenerationStage;
}) {
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const { t } = useLanguage();
  const stageStartedAt = useRef(Date.now());

  const messages = [
    t("loader.loader1"),
    t("loader.loader2"),
    t("loader.loader3"),
    t("loader.loader4"),
    t("loader.loader5"),
    t("loader.loader6"),
  ];

  useEffect(() => {
    stageStartedAt.current = Date.now();
  }, [stage]);

  useEffect(() => {
    const { from, to } = STAGES[stage];

    // Ease towards the top of the current stage without ever reaching it: a
    // stage that runs long slows down rather than overtaking the real work.
    const tick = setInterval(() => {
      const elapsed = (Date.now() - stageStartedAt.current) / 1000;
      const eased = 1 - Math.exp(-elapsed / 12);
      const target = from + (to - from) * eased;
      setProgress((prev) => Math.max(prev, target));
    }, 250);

    return () => clearInterval(tick);
  }, [stage]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 10000);

    return () => clearInterval(messageInterval);
  }, [messages.length]);

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
          {t("loader.magic")}
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
          <div className="text-sm text-slate-400 text-right mt-1">
            {Math.min(Math.round(progress), 100)}%
          </div>
        </div>

        {progress < 30 ? (
          <p
            className={`mt-8 text-slate-300 ${isMobile ? "text-sm" : "text-base"}`}
          >
            {t("loader.explanation")}
          </p>
        ) : (
          <p
            className={`mt-8 text-slate-300 ${isMobile ? "text-sm" : "text-base"}`}
          >
            {t("loader.promise")}
          </p>
        )}
      </div>
    </div>
  );
}
