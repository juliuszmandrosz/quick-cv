// @ts-nocheck

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { CVData } from "@/app/create-cv/types/cv-data";
import { format } from "date-fns";
import { translations } from "@/contexts/LanguageContext";

export default function CvTemplate({
  cvData,
  lang,
}: {
  cvData: CVData;
  lang: string;
}) {
  const formatDate = (date: string | undefined | null) =>
    date ? format(new Date(date), "yyyy.MM") : "";

  return (
    <Card
      className="
        ps-8 pe-8 pt-4 pb-4 bg-white
        print:border-none
        print:shadow-none
        print:rounded-none
      "
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {cvData.generated_personal_data.full_name}
        </h2>
        <p className="text-gray-600 text-lg mb-1">{cvData.title}</p>
        {cvData.generated_personal_data.email ||
          cvData.generated_personal_data.phone ||
          (cvData.generated_personal_data.linkedin && (
            <div className="text-sm text-gray-600">
              {cvData.generated_personal_data.linkedin ? (
                <p>
                  {cvData.generated_personal_data.email} |{" "}
                  {cvData.generated_personal_data.phone} |{" "}
                  {cvData.generated_personal_data.linkedin}
                </p>
              ) : (
                <p>
                  {cvData.generated_personal_data.email} |{" "}
                  {cvData.generated_personal_data.phone}
                </p>
              )}
            </div>
          ))}
      </div>
      <Section title={(translations[lang] as any)["cv.summary"]}>
        <p className="text-gray-700 leading-relaxed">
          {cvData.candidate_description}
        </p>
      </Section>
      <Section title={(translations[lang] as any)["cv.technicalSkills"]}>
        <div className="flex flex-wrap gap-2">
          {cvData.generated_skills.technical_skills.map((skill, i) => (
            <span
              key={i}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800 border border-gray-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>
      <Section title={(translations[lang] as any)["cv.softPowerSkills"]!}>
        <div className="flex flex-wrap gap-2">
          {cvData.generated_skills.soft_skills.map((skill, i) => (
            <span
              key={i}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800 border border-gray-200"
            >
              {skill}
            </span>
          ))}

          {cvData.generated_skills.power_skills.map((skill, i) => (
            <span
              key={i}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800 border border-gray-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>
      <Section title={(translations[lang] as any)["cv.experience"]!}>
        {cvData.generated_experience.map((exp, idx) => (
          <div
            key={idx}
            className={`mb-6 last:mb-0 experience-item ${idx > 0 && !cvData.token_consumed ? "blur-sm opacity-70 pointer-events-none" : ""}`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
              <h5 className="font-bold text-gray-800">
                {exp.location
                  ? `${exp.position}, ${exp.location}`
                  : exp.position}
              </h5>
              {exp.start_date && (
                <span className="text-gray-600 text-sm mt-1 sm:mt-0">
                  {formatDate(exp.start_date)} -{" "}
                  {exp.end_date
                    ? formatDate(exp.end_date)
                    : (translations[lang] as any)["cv.present"]!}
                </span>
              )}
            </div>
            <p className="text-gray-700 font-medium mb-2">{exp.company_name}</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {exp.responsibilities.map((r, i) => (
                <li key={i} className="leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>
      <Section title={(translations[lang] as any)["cv.languages"]!}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cvData.generated_language.map((lang, i) => (
            <div
              key={i}
              className="flex justify-between items-center border border-gray-100 px-3 py-1 rounded-md bg-gray-50"
            >
              <span className="text-gray-600 text-sm">{lang.name}</span>
              <span className="text-gray-600 text-sm">{lang.level}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title={(translations[lang] as any)["cv.education"]!}>
        {cvData.generated_education.map((edu, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h5 className="font-bold text-gray-800">
                  {edu.field_of_study}
                </h5>
                <p className="text-gray-700">{edu.school_name}</p>
              </div>
              <span className="text-gray-600 text-sm mt-1 sm:mt-0">
                {formatDate(edu.start_date)} -{" "}
                {edu.end_date
                  ? formatDate(edu.end_date)
                  : (translations[lang] as any)["cv.present"]!}
              </span>
            </div>
          </div>
        ))}
      </Section>
    </Card>
  );
}

const Section = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className="mb-6 last:mb-0">
    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-2">
      {title}
    </h3>
    {children}
  </div>
);
