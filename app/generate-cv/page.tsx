"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import CVTemplate from "@/app/generate-cv/components/cv-template";
import { CVData } from "@/app/generate-cv/types/cv-data";

// type CVData = {
//   candidate_description: string;
//   personal_data: {
//     full_name: string;
//     email: string;
//     phone: string;
//     city: string;
//     additional_skills: string[];
//   };
//   education: {
//     school_name: string;
//     field_of_study: string;
//     start_date: string;
//     end_date: string;
//   }[];
//   experience: {
//     position: string;
//     company_name: string;
//     start_date: string;
//     end_date: string;
//     responsibilities: string[];
//   }[];
//   languages: {
//     name: string;
//     level: string;
//   }[];
// };

// const CVTemplate = ({
//   data,
//   language,
// }: {
//   data: CVData;
//   language: "en" | "pl";
// }) => {
//   const formatDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), "MM.yyyy");
//     } catch {
//       return dateString;
//     }
//   };
//
//   // Translations for section headers
//   const translations = {
//     contactInfo: language === "en" ? "Contact Information" : "Dane kontaktowe",
//     skills: language === "en" ? "Skills" : "Umiejętności",
//     languages: language === "en" ? "Languages" : "Języki",
//     experience:
//       language === "en" ? "Work Experience" : "Doświadczenie zawodowe",
//     education: language === "en" ? "Education" : "Edukacja",
//     email: language === "en" ? "Email" : "Email",
//     phone: language === "en" ? "Phone" : "Telefon",
//     city: language === "en" ? "City" : "Miasto",
//     current: language === "en" ? "present" : "obecnie",
//   };
//
//   return (
//     <div className="mx-auto bg-white shadow-lg">
//       {/* A4 container with proper aspect ratio */}
//       <div
//         className="bg-white text-gray-800 mx-auto"
//         style={{
//           width: "210mm",
//           height: "297mm",
//           maxWidth: "100%",
//           margin: "0 auto",
//           padding: "12mm",
//           boxSizing: "border-box",
//           position: "relative",
//           overflow: "hidden",
//           fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
//         }}
//       >
//         {/* Header with accent color and photo */}
//         <div className="flex items-start gap-6 border-b-2 border-slate-700 pb-4 mb-6">
//           {/* Photo placeholder */}
//           <div className="flex-shrink-0 w-[100px] h-[100px] rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
//             <User className="h-12 w-12 text-slate-400" />
//           </div>
//
//           {/* Name and contact info */}
//           <div className="flex-grow">
//             <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
//               {data.personal_data.full_name}
//             </h1>
//             <div className="flex items-center mt-1 text-sm text-slate-600 flex-wrap gap-x-4 gap-y-1">
//               <span>{data.personal_data.email}</span>
//               <span>•</span>
//               <span>{data.personal_data.phone}</span>
//               {data.personal_data.city && <span>•</span>}
//               {data.personal_data.city && (
//                 <span>{data.personal_data.city}</span>
//               )}
//             </div>
//             <p className="mt-3 text-slate-700 text-sm leading-relaxed">
//               {data.candidate_description}
//             </p>
//           </div>
//         </div>
//
//         {/* Main content */}
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Left column - Skills and Languages */}
//           <div className="md:col-span-4 space-y-6">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-1">
//                 {translations.skills}
//               </h2>
//               <div className="flex flex-wrap gap-2">
//                 {data.personal_data.additional_skills.map((skill, index) => (
//                   <span
//                     key={index}
//                     className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded-md"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>
//             </div>
//
//             <div>
//               <h2 className="text-lg font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-1">
//                 {translations.languages}
//               </h2>
//               <ul className="space-y-2">
//                 {data.languages.map((language, index) => (
//                   <li key={index} className="flex justify-between items-center">
//                     <span className="font-medium text-slate-700">
//                       {language.name}
//                     </span>
//                     <span className="text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-600">
//                       {language.level}
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//
//           {/* Right column - Experience and Education */}
//           <div className="md:col-span-8 space-y-6">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-1">
//                 {translations.experience}
//               </h2>
//               <div className="space-y-5">
//                 {data.experience.map((exp, index) => (
//                   <div
//                     key={index}
//                     className="relative pl-4 border-l-2 border-slate-200"
//                   >
//                     <div className="absolute w-2 h-2 bg-slate-400 rounded-full -left-[5px] top-1.5"></div>
//                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
//                       <h3 className="text-base font-semibold text-slate-800">
//                         {exp.position}
//                       </h3>
//                       <span className="text-xs text-slate-500 font-medium mt-1 sm:mt-0">
//                         {formatDate(exp.start_date)} —{" "}
//                         {exp.end_date
//                           ? formatDate(exp.end_date)
//                           : translations.current}
//                       </span>
//                     </div>
//                     <p className="text-sm text-slate-600 mb-2 font-medium">
//                       {exp.company_name}
//                     </p>
//                     <ul className="space-y-1 text-sm text-slate-600">
//                       {exp.responsibilities.map((resp, idx) => (
//                         <li
//                           key={idx}
//                           className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-400"
//                         >
//                           {resp}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             </div>
//
//             <div>
//               <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-1">
//                 {translations.education}
//               </h2>
//               <div className="space-y-4">
//                 {data.education.map((edu, index) => (
//                   <div
//                     key={index}
//                     className="relative pl-4 border-l-2 border-slate-200"
//                   >
//                     <div className="absolute w-2 h-2 bg-slate-400 rounded-full -left-[5px] top-1.5"></div>
//                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
//                       <h3 className="text-base font-semibold text-slate-800">
//                         {edu.school_name}
//                       </h3>
//                       <span className="text-xs text-slate-500 font-medium mt-1 sm:mt-0">
//                         {formatDate(edu.start_date)} —{" "}
//                         {formatDate(edu.end_date)}
//                       </span>
//                     </div>
//                     <p className="text-sm text-slate-600">
//                       {edu.field_of_study}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

export default function Page() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"pl" | "en">("pl");

  const searchParams = useSearchParams();
  const cvUserDataId = searchParams.get("cv_user_data_id");

  const handleGenerateCV = async () => {
    if (!cvUserDataId) {
      setError("Brak parametru cv_user_data_id w URL!");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvUserDataId, language }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.error || "Błąd podczas generowania CV");
      }

      setCvData(json.cvData);
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvData) return;

    setIsGeneratingPDF(true);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: cvData.id, language }),
      });

      if (!response.ok) throw new Error("Błąd podczas generowania PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Wystąpił błąd podczas generowania PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!cvData && (
        <>
          <h1 className="text-2xl font-bold mb-4">CV Generator</h1>
          <Separator className="my-4" />
          <p className="mb-4">Kliknij przycisk poniżej, aby wygenerować CV.</p>
          <div className="mb-4">
            <p className="mb-2">Wybierz język CV:</p>
            <div className="flex space-x-2">
              <Button
                variant={language === "pl" ? "default" : "outline"}
                onClick={() => setLanguage("pl")}
              >
                Polski
              </Button>
              <Button
                variant={language === "en" ? "default" : "outline"}
                onClick={() => setLanguage("en")}
              >
                English
              </Button>
            </div>
          </div>
          <Button onClick={handleGenerateCV} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generowanie...
              </>
            ) : (
              "Generuj CV"
            )}
          </Button>
        </>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {cvData && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Wygenerowane CV:</h2>
            <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generowanie PDF...
                </>
              ) : (
                "Pobierz jako PDF"
              )}
            </Button>
          </div>
          <div
            id="cv-content"
            className="border border-slate-200 rounded-lg overflow-hidden"
          >
            <CVTemplate data={cvData} language={language} />
          </div>
        </div>
      )}
    </div>
  );
}
