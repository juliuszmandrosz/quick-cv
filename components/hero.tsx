"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="hero-gradient section-padding pt-32 pb-16">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center">
          <div
            className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")} <br />{" "}
              <span className="gradient-text">{t("hero.titleBold")}</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8">{t("hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-nicecv-purple hover:bg-nicecv-dark-purple text-white text-lg px-8 py-6"
                onClick={() => router.push("/create-cv")}
              >
                {t("hero.cta")}
              </Button>
              <Button
                variant="outline"
                className="text-nicecv-dark-purple border-nicecv-purple hover:bg-nicecv-soft-gray text-lg px-8 py-6 flex items-center gap-2"
                onClick={handleToggleAudio}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" /> {t("hero.pause")}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> {t("hero.learnMore")}
                  </>
                )}
              </Button>
              <audio
                ref={audioRef}
                src="/podcast.wav"
                preload="auto"
                onEnded={handleAudioEnded}
              />
            </div>
          </div>

          <div
            className="lg:w-1/2 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="overflow-hidden rounded-xl">
              <video
                src="/demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
