"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

type CVData = {
  candidate_description: string;
  personal_data: {
    full_name: string;
    email: string;
    phone: string;
    city: string;
    additional_skills: string[];
  };
  education: {
    school_name: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
  }[];
  experience: {
    position: string;
    company_name: string;
    start_date: string;
    end_date: string;
    responsibilities: string[];
  }[];
  languages: {
    name: string;
    level: string;
  }[];
};

const CVTemplate = ({ data }: { data: CVData }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MM.yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white text-gray-800 border border-gray-200 rounded-lg p-8 shadow-sm">
      {/* Header */}
      <div className="border-b pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {data.personal_data.full_name}
        </h1>
        <p className="mt-2 text-gray-600">{data.candidate_description}</p>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Personal info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Dane kontaktowe
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Email:</span>{" "}
                {data.personal_data.email}
              </p>
              <p>
                <span className="font-medium">Telefon:</span>{" "}
                {data.personal_data.phone}
              </p>
              <p>
                <span className="font-medium">Miasto:</span>{" "}
                {data.personal_data.city}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Umiejętności
            </h2>
            <ul className="list-disc list-inside space-y-1">
              {data.personal_data.additional_skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Języki</h2>
            <ul className="space-y-1">
              {data.languages.map((language, index) => (
                <li key={index}>
                  <span className="font-medium">{language.name}:</span>{" "}
                  {language.level}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column - Experience and Education */}
        <div className="col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Doświadczenie zawodowe
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <h3 className="text-lg font-medium text-gray-900">
                      {exp.position}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(exp.start_date)} -{" "}
                      {exp.end_date ? formatDate(exp.end_date) : "obecnie"}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{exp.company_name}</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Edukacja
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <h3 className="text-lg font-medium text-gray-900">
                      {edu.school_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                    </span>
                  </div>
                  <p className="text-gray-600">{edu.field_of_study}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ cvUserDataId }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json?.error || "Błąd podczas generowania CV");
      }

      setCvData(json.cv);
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">CV Generator</h1>
      <Separator className="my-4" />
      <p className="mb-4">
        Kliknij przycisk poniżej, aby wygenerować CV. Upewnij się, że w adresie
        URL znajduje się parametr <code>cv_user_data_id</code>.
      </p>
      <Button onClick={handleGenerateCV} disabled={isGenerating}>
        {isGenerating ? "Generowanie..." : "Generuj CV"}
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {cvData && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Wygenerowane CV:</h2>
          <CVTemplate data={cvData} />
        </div>
      )}
    </div>
  );
}
