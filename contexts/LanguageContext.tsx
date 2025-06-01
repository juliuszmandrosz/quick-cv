"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

export type Language = "en" | "pl" | "es";

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
    "header.signUp": "Sign Up",

    // Hero
    "hero.title": "Stop Tailoring, ",
    "hero.titleBold": "Start Interviewing.",
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
    "cta.free":
      "No credit card required. No subscription. Free to get started.",

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

    // Footer section
    "footer.title":
      "The smartest way to optimize your CV for any job application.",
    "footer.product": "Product",
    "footer.features": "Features",
    "footer.howItWorks": "How It Works",
    "footer.pricing": "Pricing",
    "footer.legal": "Legal",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.termsOfService": "Terms of Service",
    "footer.allRightsReserved": "All rights reserved",

    // Login form section
    "login.login": "Login",
    "login.signUp": "Sign Up",
    "login.recover": "Recover",
    "login.email": "Email",
    "login.password": "Password",
    "login.forgotPassword": "Forgot password?",
    "login.passwordLength": "Password must be at least 8 characters",
    "login.confirmPassword": "Confirm Password",
    "login.emailInstructions":
      "We'll send you instructions on how to reset your password.",
    "login.sendEmail": "Send Recovery Email",
    "login.checkInbox": "Check your inbox",
    "login.emailSent": "We've sent recovery instructions to:",
    "login.backToLogin": "Back to Login",
    "login.orContinueWith": "or continue with",
    "login.noAccount": "Don't have an account?",
    "login.hasAccount": "Already have an account?",
    "login.byContinuing": "By continuing, you agree to NICE CV's",
    "login.and": "and",

    // Create cv
    "create.title": "Create New CV",
    "create.titleDesc": "Create a perfectly tailored CV for your dream job",
    "create.step": "Step",
    "create.of": "of",
    "create.upload": "Upload your CV",
    "create.uploadCv": "Upload CV",
    "create.useExistingCv": "Use Existing CV",
    "create.dropCv": "Click here to choose your CV",
    "create.supportedFormats": "Supported formats",
    "create.selectCv": "Select an existing CV from your repository",
    "create.language": "CV Language",
    "create.english": "English",
    "create.polish": "Polish",
    "create.spanish": "Spanish",
    "create.back": "Back",
    "create.generateCv": "Generate CV",
    "create.next": "Next: Upload your CV",
    "create.complete": "complete",
    "create.processing": "Processing job offer",
    "create.analyzing": "Analyzing job offer and extracting data...",
    "create.missingTitle": "Missing Information",
    "create.missingDesc": "Please provide a job description URL or text",
    "create.errorUrl": "Error processing job URL",
    "create.errorCv": "Error creating CV",
    "create.error": "Error",
    "create.processedTitle": "Job Offer Processed",
    "create.processedDesc": "Job offer details saved successfully.",
    "create.cvGeneratedTitle": "CV Generated",
    "create.cvGeneratedDesc": "Your tailored CV has been created.",
    "create.cvPleaseUploadOrSelect":
      "Please upload your CV or select an existing one",
    "create.cvPleaseUpload": "Please upload your CV",
    "create.chooseInput": "Choose input method:",
    "create.pasteJobLink": "Paste a job link",
    "create.pasteJobLinkDesc":
      "Quick and easy - just paste the URL from job boards",
    "create.pasteJobDesc": "Paste full job description",
    "create.pasteJobDescExplanation":
      "Copy and paste the complete job posting text",
    "create.jobUrl": "Job URL",
    "create.jobDescription": "Job Description",
    "create.jobDescriptionPlaceholder":
      "We're hiring a Frontend Developer to join our team in Warsaw. You'll work with React, TypeScript, and modern web technologies...",
    "create.supportedPlatforms":
      "Supported platforms: justjoin.it, nofluffjobs.com, and more coming soon!",
    "create.optimizedCvs": "100+ CVs optimized this week",
    "create.tip": "Tip:",
    "create.tipText":
      "Include requirements, responsibilities, and company info for best results",
    "create.step1title": "Step 1: Paste job offer",
    "create.step1desc":
      "Paste the job offer below, our AI will tailor your resume to it.",
    "create.step1next": "Next: Upload your CV",

    // Loader Section
    "loader.building": "Building something special just for you...",
    "loader.grabCoffee": "Grab a coffee while we craft your perfect CV...",
    "loader.addingTouch": "Adding that professional touch to your resume...",
    "loader.almost": "Almost there! Your CV is going to be a BOMB!",
    "loader.polishing": "Polishing the final details...",
    "loader.justSeconds": "Just a few more seconds for perfection...",
    "loader.magic": "NICE CV Magic in Progress",
    "loader.creating":
      "We're creating something extraordinary that will make your CV stand out!",
  },
  pl: {
    // Header
    "header.features": "Funkcje",
    "header.howItWorks": "Jak to działa",
    "header.testimonials": "Opinie",
    "header.login": "Logowanie",
    "header.signUp": "Zarejestruj się",

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

    // Footer section
    "footer.title":
      "Najinteligentniejszy sposób na zoptymalizowanie CV do każdej aplikacji o pracę.",
    "footer.product": "Produkt",
    "footer.features": "Funkcje",
    "footer.howItWorks": "Jak to działa",
    "footer.pricing": "Cennik",
    "footer.legal": "Informacje prawne",
    "footer.privacyPolicy": "Polityka prywatności",
    "footer.termsOfService": "Regulamin",
    "footer.allRightsReserved": "Wszelkie prawa zastrzeżone",

    // Login form section
    "login.login": "Zaloguj się",
    "login.signUp": "Zarejestruj się",
    "login.recover": "Odzyskaj",
    "login.email": "E-mail",
    "login.password": "Hasło",
    "login.forgotPassword": "Nie pamiętasz hasła?",
    "login.passwordLength": "Hasło musi mieć co najmniej 8 znaków",
    "login.confirmPassword": "Potwierdź hasło",
    "login.emailInstructions":
      "Wyślemy Ci instrukcje dotyczące resetowania hasła.",
    "login.sendEmail": "Wyślij e-mail odzyskujący",
    "login.checkInbox": "Sprawdź skrzynkę odbiorczą",
    "login.emailSent": "Wysłaliśmy instrukcje odzyskiwania na:",
    "login.backToLogin": "Powrót do logowania",
    "login.orContinueWith": "lub kontynuuj z",
    "login.noAccount": "Nie masz jeszcze konta?",
    "login.hasAccount": "Masz już konto?",
    "login.byContinuing": "Kontynuując, akceptujesz regulamin NICE CV",
    "login.and": "oraz",

    // Create cv
    "create.title": "Stwórz nowe CV",
    "create.titleDesc":
      "Stwórz idealnie dopasowane CV do swojej wymarzonej pracy",
    "create.desc":
      "Paste the job offer below, our AI will tailor your resume to it.",
    "create.step": "Krok",
    "create.of": "z",
    "create.upload": "Załaduj swoje CV",
    "create.uploadCv": "Wyślij CV",
    "create.useExistingCv": "Użyj istniejącego CV",
    "create.dropCv": "Kliknij tutaj, aby wybrać swoje CV",
    "create.supportedFormats": "Obsługiwane formaty",
    "create.selectCv": "Wybierz istniejące CV z repozytorium",
    "create.language": "Język CV",
    "create.english": "Angielski",
    "create.polish": "Polski",
    "create.spanish": "Hiszpański",
    "create.back": "Wstecz",
    "create.generateCv": "Wygeneruj CV",
    "create.next": "Dalej: wyślij CV",
    "create.complete": "ukończono",
    "create.processing": "Przetwarzanie oferty pracy",
    "create.analyzing": "Analizowanie oferty pracy i wyodrębnianie danych...",
    "create.missingTitle": "Brakujące dane",
    "create.missingDesc": "Podaj link lub opis oferty pracy",
    "create.errorUrl": "Błąd podczas przetwarzania URL oferty",
    "create.errorCv": "Błąd podczas tworzenia CV",
    "create.error": "Błąd",
    "create.processedTitle": "Oferta przetworzona",
    "create.processedDesc": "Szczegóły oferty zostały zapisane.",
    "create.cvGeneratedTitle": "CV wygenerowane",
    "create.cvGeneratedDesc": "Twoje CV zostało pomyślnie wygenerowane.",
    "create.cvPleaseUploadOrSelect": "Prześlij swoje CV lub wybierz istniejące",
    "create.cvPleaseUpload": "Prześlij swoje CV",
    "create.chooseInput": "Wybierz sposób wprowadzenia:",
    "create.pasteJobLink": "Wklej link do oferty",
    "create.pasteJobLinkDesc": "Szybko i łatwo – po prostu wklej URL z portalu",
    "create.pasteJobDesc": "Wklej pełen opis oferty",
    "create.pasteJobDescExplanation":
      "Skopiuj i wklej cały tekst ogłoszenia o pracę",
    "create.jobUrl": "URL oferty pracy",
    "create.jobDescription": "Opis oferty",
    "create.jobDescriptionPlaceholder":
      "Szukamy Frontend Developera do zespołu w Warszawie. Praca z React, TypeScript i nowoczesnymi technologiami webowymi...",
    "create.supportedPlatforms":
      "Obsługiwane platformy: justjoin.it, nofluffjobs.com i inne wkrótce!",
    "create.optimizedCvs": "100+ CV zoptymalizowanych w tym tygodniu",
    "create.tip": "Wskazówka:",
    "create.tipText":
      "Podaj wymagania, obowiązki i informacje o firmie dla najlepszych wyników",
    "create.step1title": "Krok 1: Wklej ofertę pracy",
    "create.step1desc":
      "Wklej poniżej ofertę pracy – nasza AI dopasuje do niej Twoje CV.",
    "create.step1next": "Dalej: dodaj swoje CV",

    // Loader Section
    "loader.building": "Tworzymy coś wyjątkowego specjalnie dla Ciebie...",
    "loader.grabCoffee": "Zaparz kawę, a my stworzymy idealne CV...",
    "loader.addingTouch": "Dodajemy profesjonalne szlify do Twojego CV...",
    "loader.almost": "Prawie gotowe! Twoje CV będzie PETARDĄ!",
    "loader.polishing": "Szlifujemy ostatnie szczegóły...",
    "loader.justSeconds": "Jeszcze tylko kilka sekund do perfekcji...",
    "loader.magic": "Trwa magia NICE CV",
    "loader.creating": "Tworzymy coś niezwykłego, co wyróżni Twoje CV z tłumu!",
  },
  es: {
    // Header
    "header.features": "Características",
    "header.howItWorks": "Cómo funciona",
    "header.testimonials": "Testimonios",
    "header.login": "Acceso",
    "header.signUp": "Regístrate",

    // Hero
    "hero.title": "Basta de modificar a mano, ",
    "hero.titleBold": "ve directo a las entrevistas.",
    "hero.subtitle":
      "Sube tu CV y el link de la oferta. Nuestra IA optimiza tu currículum a la perfección en segundos para que superes los ATS y consigas más entrevistas.",
    "hero.cta": "Crea tu CV perfecto",
    "hero.learnMore": "Escuchar más",
    "hero.pause": "Detener el audio",

    // Problem Section
    "problem.title": "La búsqueda de empleo",
    "problem.titleBold": "No debería ser tan difícil",
    "problem.paragraph1":
      "¿Te acuerdas de todas esas horas dedicadas a pulir tu CV para una sola oferta? La frustración de buscar las palabras clave, la duda de si era suficiente, el silencio después de hacer clic en enviar?",
    "problem.paragraph2":
      "Viertes tu energía en personalizar, postulando a docenas de puestos, solo para no recibir respuesta. Se siente como gritar en el vacío.",
    "problem.paragraph3":
      "Buscar trabajo se vuelve un juego de azar extenuante, que te roba tiempo que podrías estar usando para prepararte para entrevistas de verdad. Sabes que tienes las cualificaciones, pero que te vean parece una misión imposible",
    "problem.question": "¿Y si existiera una manera más inteligente?",
    "problem.hoursWasted.title": "Horas desperdiciadas",
    "problem.hoursWasted.desc":
      "La adaptación manual requiere horas para cada aplicación.",
    "problem.rejected.title": "Destinado al rechazo",
    "problem.rejected.desc":
      "Si tu CV no está optimizado para ATS, será descartado",
    "problem.fatigue.title": "Fatiga mental",
    "problem.fatigue.desc":
      "El proceso repetitivo drena tu energía y creatividad",
    "problem.invisible.title": "Invisible para los Reclutadores",
    "problem.invisible.desc":
      "Sin las palabras clave adecuadas, los reclutadores no verán su solicitud",

    // Solution Section
    "solution.title": "Presentamos",
    "solution.titleBold": "Nice CV",
    "solution.subtitle":
      "Nuestra plataforma potenciada con IA crea al instante currículums perfectamente adaptados a cada solicitud de empleo, ayudándote a conseguir más entrevistas con menos esfuerzo.",
    "solution.step1": "1. Sube tu CV",
    "solution.step1.desc": "Sube tu CV existente en cualquier formato común",
    "solution.step2": "2. Añade el Enlace de la Oferta",
    "solution.step2.desc": "Pega el link de la oferta de trabajo",
    "solution.step3": "3. Descarga tu CV Optimizado",
    "solution.step3.desc":
      "Descarga tu CV perfectamente personalizado en segundos",
    "solution.cta": "Crea tu CV perfecto",

    // Features Section
    "features.title": "Por qué los que Buscan Trabajo ",
    "features.titleBold": "Eligen Nice CV",
    "features.subtitle":
      "Nuestra plataforma ofrece todo lo que necesitas para destacar en el competitivo mercado laboral",
    "features.time.title": "Ahorra horas de tiempo",
    "features.time.desc":
      "Obtén un CV a tu medida en segundos, no en horas. Postula a más empleos en menos tiempo.",
    "features.ats.title": "Vence los sistemas ATS",
    "features.ats.desc":
      "Nuestra IA detecta y ajusta las palabras clave de la descripción de la oferta para que tu CV pase sin problemas los ATS.",
    "features.interview.title": "Aumentar las posibilidades de entrevista",
    "features.interview.desc":
      "Resalta las habilidades y experiencias exactas que buscan los reclutadores.",
    "features.easy.title": "Fácil de usar",
    "features.easy.desc":
      "Olvídate de programas complejos. Simplemente sube tu CV, pega el enlace de la oferta o su descripción, y descarga.",
    "features.repository.title": "Repositorio de CV",
    "features.repository.desc":
      "Almacena y gestiona todos tus CV personalizados en un solo lugar para futuras referencias.",
    "features.success.title": "Más Probabilidades de Éxito",
    "features.success.desc":
      "Nuestros usuarios informan haber recibido hasta el triple de invitaciones a entrevistas tras usar Nice CV.",

    // How It Works Section
    "howItWorks.title": "Cómo funciona",
    "howItWorks.subtitle":
      "Nuestra IA avanzada hace todo el trabajo pesado por ti en tres simples pasos",
    "howItWorks.upload.title": "Sube tu CV",
    "howItWorks.upload.desc":
      "Solo tienes que subir tu CV en un formato estándar (PDF, DOCX, etc.). Nuestro sistema se encargará de analizar tus habilidades, experiencia y cualificaciones.",
    "howItWorks.url.title":
      "Pega el enlace de la oferta de empleo o su descripción",
    "howItWorks.url.desc":
      "Introduce el enlace o la descripción de la vacante a la que te postulas. Nuestra IA escaneará y analizará los requisitos del puesto, las habilidades principales y las cualificaciones",
    "howItWorks.get.title": "Consigue tu CV optimizado",
    "howItWorks.get.desc":
      "Nuestra IA crea al instante una versión de tu CV perfectamente adaptada que resalta la experiencia relevante e incluye los términos clave de la descripción del puesto.",

    // Testimonials Section
    "testimonials.title": "Lo que nuestros usuarios ",
    "testimonials.titleBold": "Están diciendo",
    "testimonials.subtitle":
      "Únete a cientos de candidatos exitosos que consiguieron entrevistas más rápido con Nice CV",
    "testimonials.join":
      "Descubre cómo cientos de personas que buscan trabajo ya han tenido más éxito en sus candidaturas",

    // CTA Section
    "cta.title": "Basta de Gastar Horas Editando tu CV uno por uno",
    "cta.subtitle":
      "Más entrevistas con menos esfuerzo. Crea tu CV impecable en segundos.",
    "cta.feature1": "Ahorre horas por aplicación",
    "cta.feature2": "Superar los filtros ATS",
    "cta.feature3": "Consigue Más Entrevistas",
    "cta.button": "Crea tu CV perfecto",
    "cta.free":
      "No requiere tarjeta de crédito. Sin suscripción. Empezar es gratis.",

    // CV template section
    "cv.ready": "Tu CV personalizado está listo para descargar",
    "cv.jobOffer": "Enlace de oferta de trabajo",
    "cv.downloadBtn": "Descargar CV",
    "cv.summary": "Resumen",
    "cv.technicalSkills": "Habilidades técnicas",
    "cv.softPowerSkills": "Habilidades blandas y de poder",
    "cv.experience": "Experiencia",
    "cv.languages": "Idiomas",
    "cv.education": "Educación",
    "cv.present": "Presente",

    // Footer section
    "footer.title":
      "La forma más inteligente de optimizar tu CV para cualquier postulación de empleo.",
    "footer.product": "Producto",
    "footer.features": "Características",
    "footer.howItWorks": "Cómo funciona",
    "footer.pricing": "Precios",
    "footer.legal": "Legal",
    "footer.privacyPolicy": "Política de privacidad",
    "footer.termsOfService": "Condiciones de servicio",
    "footer.allRightsReserved": "Reservados todos los derechos",

    // Login form section
    "login.login": "Acceso",
    "login.signUp": "Inscribirse",
    "login.recover": "Recuperar",
    "login.email": "Email",
    "login.password": "Contraseña",
    "login.forgotPassword": "¿Has olvidado tu contraseña?",
    "login.passwordLength": "La contraseña debe tener al menos 8 caracteres",
    "login.confirmPassword": "Confirmar Contraseña",
    "login.emailInstructions":
      "Le enviaremos instrucciones sobre cómo restablecer su contraseña.",
    "login.sendEmail": "Enviar correo electrónico de recuperación",
    "login.checkInbox": "Revisa tu bandeja de entrada",
    "login.emailSent": "Hemos enviado instrucciones de recuperación a:",
    "login.backToLogin": "Volver al inicio de sesión",
    "login.orContinueWith": "o continuar con",
    "login.noAccount": "¿No tienes una cuenta?",
    "login.hasAccount": "¿Ya tienes una cuenta?",
    "login.byContinuing":
      "Al continuar, acepta los términos y condiciones de NICE CV",
    "login.and": "y",

    // Create cv
    "create.title": "Crear nuevo CV",
    "create.titleDesc":
      "Crea un CV perfectamente adaptado para tu trabajo ideal",
    "create.step": "Paso",
    "create.of": "de",
    "create.upload": "Sube tu CV",
    "create.uploadCv": "Subir CV",
    "create.useExistingCv": "Usar CV existente",
    "create.dropCv": "Haz clic aquí para elegir tu CV",
    "create.supportedFormats": "Formatos compatibles",
    "create.selectCv": "Selecciona un CV existente de tu repositorio",
    "create.language": "Idioma del CV",
    "create.english": "Inglés",
    "create.polish": "Polaco",
    "create.spanish": "Español",
    "create.back": "Atrás",
    "create.generateCv": "Generar CV",
    "create.next": "Siguiente: subir tu CV",
    "create.complete": "completado",
    "create.processing": "Procesando la oferta de trabajo",
    "create.analyzing": "Analizando la oferta de trabajo y extrayendo datos...",
    "create.missingTitle": "Información faltante",
    "create.missingDesc":
      "Por favor proporciona un enlace o texto de la oferta",
    "create.errorUrl": "Error al procesar la URL de la oferta",
    "create.errorCv": "Error al generar el CV",
    "create.error": "Error",
    "create.processedTitle": "Oferta procesada",
    "create.processedDesc": "Detalles de la oferta guardados correctamente.",
    "create.cvGeneratedTitle": "CV generado",
    "create.cvGeneratedDesc": "Tu CV ha sido creado con éxito.",
    "create.cvPleaseUploadOrSelect": "Sube tu CV o selecciona uno existente",
    "create.cvPleaseUpload": "Por favor sube tu CV",
    "create.chooseInput": "Elige el método de entrada:",
    "create.pasteJobLink": "Pegar enlace de la oferta",
    "create.pasteJobLinkDesc":
      "Rápido y fácil: solo pega la URL de un portal de empleo",
    "create.pasteJobDesc": "Pegar descripción completa",
    "create.pasteJobDescExplanation":
      "Copia y pega todo el texto de la oferta de trabajo",
    "create.jobUrl": "URL de la oferta",
    "create.jobDescription": "Descripción del puesto",
    "create.jobDescriptionPlaceholder":
      "Buscamos un Desarrollador Frontend para nuestro equipo en Varsovia. Trabajarás con React, TypeScript y tecnologías web modernas...",
    "create.supportedPlatforms":
      "Plataformas compatibles: justjoin.it, nofluffjobs.com y más pronto!",
    "create.optimizedCvs": "Más de 100 CVs optimizados esta semana",
    "create.tip": "Consejo:",
    "create.tipText":
      "Incluye requisitos, responsabilidades e información de la empresa para mejores resultados",
    "create.step1title": "Paso 1: Pega la oferta de trabajo",
    "create.step1desc":
      "Pega la oferta de trabajo a continuación; nuestra IA adaptará tu CV.",
    "create.step1next": "Siguiente: subir tu CV",

    // Loader Section
    "loader.building": "Preparando algo especial, hecho a tu medida...",
    "loader.grabCoffee":
      "Prepara un café mientras preparamos tu CV impecable...",
    "loader.addingTouch":
      "Puliendo tu CV para darle un aspecto más profesional...",
    "loader.almost": "¡Ya casi! Tu currículum va a quedar impresionante.",
    "loader.polishing": "Puliendo los últimos detalles...",
    "loader.justSeconds": "Sólo unos segundos más para la perfección...",
    "loader.magic": "NICE CV Realizando nuestra magia",
    "loader.creating":
      "¡Estamos creando algo extraordinario que hará que tu CV destaque!",
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
