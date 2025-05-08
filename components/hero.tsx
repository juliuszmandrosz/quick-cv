"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, FileUp, Pause, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export const Hero = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.storage
      .from("podcasts")
      .getPublicUrl("learn_more.wav");
    setAudioUrl(data.publicUrl);
  }, []);

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
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  preload="auto"
                  onEnded={handleAudioEnded}
                />
              )}
            </div>
          </div>

          <div
            className="lg:w-1/2 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex justify-center items-center mb-8">
                <div className="rounded-full bg-nicecv-soft-gray p-4">
                  <FileText className="w-8 h-8 text-nicecv-purple" />
                </div>
                <ArrowRight className="mx-4 text-nicecv-gray" />
                <div className="rounded-full bg-nicecv-soft-gray p-4">
                  <FileUp className="w-8 h-8 text-nicecv-purple" />
                </div>
                <ArrowRight className="mx-4 text-nicecv-gray" />
                <div className="rounded-full bg-nicecv-purple p-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white opacity-70"></div>
                <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="h-6 bg-nicecv-soft-gray rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-nicecv-soft-gray rounded w-full mb-2"></div>
                  <div className="h-4 bg-nicecv-soft-gray rounded w-full mb-2"></div>
                  <div className="h-4 bg-nicecv-soft-gray rounded w-2/3 mb-4"></div>

                  <div className="h-6 bg-nicecv-soft-gray rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-nicecv-soft-gray rounded w-full mb-2"></div>
                  <div className="h-4 bg-nicecv-soft-gray rounded w-4/5 mb-4"></div>

                  <div className="h-6 bg-nicecv-purple/20 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-nicecv-purple/20 rounded w-full mb-2"></div>
                  <div className="h-4 bg-nicecv-purple/20 rounded w-full mb-2"></div>
                  <div className="h-4 bg-nicecv-purple/20 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
