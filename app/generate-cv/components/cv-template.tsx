"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { CVData } from "@/app/generate-cv/types/cv-data";
import { format } from "date-fns";

export default function CvTemplate({ cvData }: { cvData: CVData }) {
  const formatDate = (date: string | undefined | null) =>
    date ? format(new Date(date), "yyyy.MM") : "";

  return (
    <Card className="p-8 bg-white shadow-md border-gray-200">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-1">
          {cvData.generated_personal_data.full_name}
        </h2>
        <p className="text-gray-600 text-lg mb-3">Software Engineer</p>
        <div className="text-sm text-gray-600">
          <p>
            {cvData.generated_personal_data.email} |{" "}
            {cvData.generated_personal_data.phone}
          </p>
          {cvData.generated_personal_data.city && (
            <p className="mt-1">{cvData.generated_personal_data.city}</p>
          )}
          {/*{cvData.generated_personal_data.linkedin && (*/}
          {/*  <p className="mt-1">{cvData.generated_personal_data.linkedin}</p>*/}
          {/*)}*/}
        </div>
      </div>

      <Section title="Summary">
        <p className="text-gray-700 leading-relaxed">
          {cvData.candidate_description}
        </p>
      </Section>

      <Section title="Skills">
        <div className="flex flex-wrap gap-2">
          {cvData.generated_personal_data.additional_skills.map((skill, i) => (
            <span
              key={i}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-800 border border-gray-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Experience">
        {cvData.generated_experience.map((exp, idx) => (
          <div
            key={idx}
            className={`mb-6 last:mb-0 ${idx > 0 && false ? "blur-sm opacity-70 pointer-events-none" : ""}`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
              <h4 className="font-bold text-gray-800 text-lg">
                {exp.position}
              </h4>
              <span className="text-gray-600 text-sm mt-1 sm:mt-0">
                {formatDate(exp.start_date)} -{" "}
                {exp.end_date ? formatDate(exp.end_date) : "Present"}
              </span>
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

      <Section title="Languages">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cvData.generated_language.map((lang, i) => (
            <div
              key={i}
              className="flex justify-between items-center border border-gray-100 px-3 py-1 rounded-md bg-gray-50"
            >
              <span className="font-medium text-gray-800">{lang.name}</span>
              <span className="text-gray-600 text-sm">{lang.level}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Education">
        {cvData.generated_education.map((edu, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h4 className="font-bold text-gray-800 text-lg">
                  {edu.field_of_study}
                </h4>
                <p className="text-gray-700">{edu.school_name}</p>
              </div>
              <span className="text-gray-600 text-sm mt-1 sm:mt-0">
                {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
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
  <div className="mb-8 last:mb-0">
    <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
      {title}
    </h3>
    {children}
  </div>
);
