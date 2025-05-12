"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

type Language = "en" | "pl";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export const translations = {
  en: {
    // Header
    "header.features": "Features",
    "header.howItWorks": "How it Works",
    "header.testimonials": "Testimonials",
    "header.login": "Login",
    "header.signUp": "Sign Up Free",

    // Hero
    "hero.title": "Stop Tailoring, ",
    "hero.titleBold": "Start Interviewing",
    "hero.subtitle":
      "Upload your CV and the job description link. Our AI crafts a perfectly optimized resume in seconds, helping you beat the ATS and land more interviews.",
    "hero.cta": "Create Your Perfect CV",
    "hero.learnMore": "Listen More",
    "hero.pause": "Stop audio",

    // Problem Section
    "problem.title": "The Job Hunt ",
    "problem.titleBold": "Shouldn't Be This Hard",
    "problem.paragraph1":
      "Remember the endless hours spent tweaking your CV for just one application? The frustration of matching keywords, the uncertainty if you've done enough, the silence after hitting 'submit'?",
    "problem.paragraph2":
      "You pour your energy into customizing, applying to dozens of roles, only to hear nothing back. It feels like shouting into a void.",
    "problem.paragraph3":
      "The job hunt becomes a draining numbers game, stealing time you could be using to prepare for actual interviews. You know you're qualified, but getting noticed feels impossible.",
    "problem.question": "What if there was a smarter way?",
    "problem.hoursWasted.title": "Hours Wasted",
    "problem.hoursWasted.desc":
      "Manual tailoring takes hours for each application",
    "problem.rejected.title": "Getting Rejected",
    "problem.rejected.desc":
      "Without ATS optimization, your CV gets filtered out",
    "problem.fatigue.title": "Mental Fatigue",
    "problem.fatigue.desc":
      "The repetitive process drains your energy and creativity",
    "problem.invisible.title": "Invisible to Recruiters",
    "problem.invisible.desc":
      "Without the right keywords, recruiters don't see your application",

    // Solution Section
    "solution.title": "Introducing",
    "solution.titleBold": "Nice CV",
    "solution.subtitle":
      "Our AI-powered platform instantly creates perfectly tailored CVs for each job application, helping you get more interviews with less effort.",
    "solution.step1": "1. Upload Your CV",
    "solution.step1.desc": "Upload your existing CV in any common format",
    "solution.step2": "2. Add Job URL",
    "solution.step2.desc": "Paste the link to your target job description",
    "solution.step3": "3. Get Optimized CV",
    "solution.step3.desc": "Download your perfectly tailored CV in seconds",
    "solution.cta": "Create Your Perfect CV",

    // Features Section
    "features.title": "Why Job Seekers ",
    "features.titleBold": "Love Nice CV",
    "features.subtitle":
      "Our platform offers everything you need to stand out in today's competitive job market",
    "features.time.title": "Save Hours of Time",
    "features.time.desc":
      "Get a perfectly tailored CV in seconds, not hours. Apply to more jobs in less time.",
    "features.ats.title": "Beat ATS Systems",
    "features.ats.desc":
      "Our AI perfectly matches keywords from the job description to pass Applicant Tracking Systems.",
    "features.interview.title": "Increase Interview Chances",
    "features.interview.desc":
      "Highlight the exact skills and experiences that recruiters are looking for.",
    "features.easy.title": "Effortless to Use",
    "features.easy.desc":
      "No complicated software to learn. Just upload, paste URL, and download.",
    "features.repository.title": "CV Repository",
    "features.repository.desc":
      "Store and manage all your tailored CVs in one place for future reference.",
    "features.success.title": "Higher Success Rate",
    "features.success.desc":
      "Users report up to 3x more interview invitations after using Nice CV.",

    // How It Works Section
    "howItWorks.title": "How It Works",
    "howItWorks.subtitle":
      "Our advanced AI does all the heavy lifting for you in three simple steps",
    "howItWorks.upload.title": "Upload Your CV",
    "howItWorks.upload.desc":
      "Simply upload your existing CV in any common format (PDF, DOCX, etc.). Our system will analyze your skills, experience, and qualifications.",
    "howItWorks.url.title": "Add Job Description URL",
    "howItWorks.url.desc":
      "Paste the URL of the job listing you're applying for. Our AI scans and analyzes the job requirements, key skills, and qualifications.",
    "howItWorks.get.title": "Get Your Optimized CV",
    "howItWorks.get.desc":
      "Our AI instantly creates a perfectly tailored version of your CV that highlights relevant experience and includes key terms from the job description.",

    // Testimonials Section
    "testimonials.title": "What Our Users ",
    "testimonials.titleBold": "Are Saying",
    "testimonials.subtitle":
      "Join hundreds of successful job seekers who landed interviews faster with Nice CV",
    "testimonials.join":
      "Join hundreds of job seekers who have already improved their job application success",

    // CTA Section
    "cta.title": "Stop Wasting Time on Manual CV Tailoring",
    "cta.subtitle":
      "Get more interviews with less effort. Create your perfect CV in seconds.",
    "cta.feature1": "Save Hours Per Application",
    "cta.feature2": "Beat ATS Filters",
    "cta.feature3": "Land More Interviews",
    "cta.button": "Create Your Perfect CV",
    "cta.free": "No credit card required. Free to get started.",

    // CV template section
    "cv.ready": "Your tailored CV is ready for download",
    "cv.jobOffer": "Job Offer Link",
    "cv.downloadBtn": "Download CV",
    "cv.summary": "Summary",
    "cv.technicalSkills": "Technical Skills",
    "cv.softPowerSkills": "Soft & Power Skills",
    "cv.experience": "Experience",
    "cv.languages": "Languages",
    "cv.education": "Education",
    "cv.present": "Present",
  },
  pl: {
    // Header
    "header.features": "Funkcje",
    "header.howItWorks": "Jak to działa",
    "header.testimonials": "Opinie",
    "header.login": "Logowanie",
    "header.signUp": "Zarejestruj się za darmo",

    // Hero
    "hero.title": "Przestań dopasowywać CV, ",
    "hero.titleBold": "zacznij chodzić na rozmowy!",
    "hero.subtitle":
      "Wrzuć swoje CV i link do oferty pracy. Nasze AI w kilka sekund przygotuje idealnie dopasowane CV, które przejdzie ATS i pomoże Ci zdobyć więcej zaproszeń na rozmowy.",
    "hero.cta": "Stwórz swoje idealne CV",
    "hero.learnMore": "Dowiedz się więcej",
    "hero.pause": "Zatrzymaj audio",

    // Problem Section
    "problem.title": "Szukanie pracy ",
    "problem.titleBold": "nie powinno być aż tak trudne",
    "problem.paragraph1":
      'Pamiętasz godziny spędzone na ręcznym przerabianiu CV pod każdą ofertę? Dobieranie słów kluczowych, niepewność, czy zrobiłeś to dobrze, cisza po kliknięciu „Wyślij"?',
    "problem.paragraph2":
      "Wkładasz w to masę energii, aplikujesz na dziesiątki ogłoszeń… i nic. Jakby Twoje CV trafiało w próżnię.",
    "problem.paragraph3":
      "A przecież to gra na czas i liczby. Zamiast szykować się do rozmów, siedzisz i edytujesz CV. Wiesz, że masz kompetencje — tylko jak się przebić?",
    "problem.question": "A co jeśli da się to zrobić mądrzej?",
    "problem.hoursWasted.title": "Stracone godziny",
    "problem.hoursWasted.desc":
      "Ręczne dostosowywanie zajmuje godziny dla każdej aplikacji",
    "problem.rejected.title": "Odrzucane aplikacje",
    "problem.rejected.desc":
      "Bez optymalizacji ATS, Twoje CV zostaje odfiltrowane",
    "problem.fatigue.title": "Zmęczenie psychiczne",
    "problem.fatigue.desc":
      "Powtarzalny proces wyczerpuje energię i kreatywność",
    "problem.invisible.title": "Niewidoczny dla rekruterów",
    "problem.invisible.desc":
      "Bez odpowiednich słów kluczowych, rekruterzy nie widzą Twojej aplikacji",

    // Solution Section
    "solution.title": "Poznaj ",
    "solution.titleBold": "Nice CV",
    "solution.subtitle":
      "Nasza platforma AI w kilka sekund tworzy perfekcyjnie dopasowane CV do każdej oferty pracy. Więcej rozmów. Mniej roboty.",
    "solution.step1": "1. Wrzuć swoje CV",
    "solution.step1.desc": "w dowolnym formacie",
    "solution.step2": "2. Dodaj link do ogłoszenia",
    "solution.step2.desc": "po prostu wklej URL",
    "solution.step3": "3. Pobierz gotowe CV",
    "solution.step3.desc": "dopasowane pod ofertę w kilka sekund",
    "solution.cta": "Stwórz swoje idealne CV",

    // Features Section
    "features.title": "Dlaczego ludzie, ",
    "features.titleBold": "kochają Nice CV",
    "features.subtitle": "Wszystko, czego potrzebujesz, żeby się wyróżnić",
    "features.time.title": "Oszczędzasz godziny",
    "features.time.desc": "CV w sekundy, nie godziny",
    "features.ats.title": "Przechodzisz ATS",
    "features.ats.desc": "AI dobiera słowa kluczowe pod ofertę",
    "features.interview.title": "Więcej rozmów",
    "features.interview.desc": "pokazujesz to, czego szukają rekruterzy",
    "features.easy.title": "Mega proste",
    "features.easy.desc": "wrzucasz CV, link, pobierasz",
    "features.repository.title": "Repozytorium CV",
    "features.repository.desc": "wszystkie wersje w jednym miejscu",
    "features.success.title": "3x większa skuteczność",
    "features.success.desc":
      "użytkownicy raportują do 3x więcej zaproszeń na rozmowy",

    // How It Works Section
    "howItWorks.title": "Jak to działa",
    "howItWorks.subtitle": "Całą robotę robi za Ciebie AI w 3 krokach",
    "howItWorks.upload.title": "Wrzuć CV",
    "howItWorks.upload.desc": "analizujemy Twoje doświadczenie i umiejętności",
    "howItWorks.url.title": "Dodaj link do oferty",
    "howItWorks.url.desc": "skanujemy wymagania i słowa kluczowe",
    "howItWorks.get.title": "Pobierz gotowe CV",
    "howItWorks.get.desc": "dopasowane pod konkretną ofertę pracy",

    // Testimonials Section
    "testimonials.title": "Zobacz, ",
    "testimonials.titleBold": "co mówią ludzie",
    "testimonials.subtitle":
      "Dołącz do setek zadowolonych osób poszukujących pracy, które szybciej uzyskały rozmowy kwalifikacyjne dzięki Nice CV",
    "testimonials.join":
      "Dołącz do setek osób poszukujących pracy, które już poprawiły swoje szanse na sukces w aplikowaniu",

    // CTA Section
    "cta.title": "Przestań marnować czas na ręczne przerabianie CV",
    "cta.subtitle":
      "Zyskaj więcej rozmów przy mniejszym wysiłku. Stwórz swoje idealne CV w kilka sekund.",
    "cta.feature1": "Oszczędzasz godziny",
    "cta.feature2": "Przechodzisz ATS",
    "cta.feature3": "Zdobywasz więcej rozmów",
    "cta.button": "Stwórz swoje idealne CV",
    "cta.free": "Karta kredytowa nie jest wymagana. Za darmo na start.",

    // CV template section
    "cv.ready": "Twoje idealnie dopasowane CV jest gotowe do pobrania",
    "cv.jobOffer": "Link do oferty pracy",
    "cv.downloadBtn": "Pobierz CV",
    "cv.summary": "Podsumowanie zawodowe",
    "cv.technicalSkills": "Umiejętności techniczne",
    "cv.softPowerSkills": "Kluczowe kompetencje miękkie i strategiczne",
    "cv.experience": "Doświadczenie zawodowe",
    "cv.languages": "Języki obce",
    "cv.education": "Edukacja",
    "cv.present": "Obecnie",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
