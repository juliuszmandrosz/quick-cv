"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Download, FileText } from "lucide-react";

export default function CVPreview() {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your tailored CV is being downloaded",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-primary flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CV Preview</h1>
          <p className="text-muted-foreground mt-2">
            Your tailored CV is ready for download
          </p>
        </div>

        <Button
          onClick={handleDownload}
          className="neumorphic-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          <Download className="mr-2 h-4 w-4" /> Download CV
        </Button>
      </div>

      <Card className="dark:glass-dark glass neumorphic p-4">
        <div className="aspect-[1/1.414] bg-white rounded-lg overflow-hidden shadow-xl flex items-center justify-center">
          {/* Mock CV preview - W realnej aplikacji tutaj znajdowałby się PDF viewer */}
          <div className="p-10 w-full h-full overflow-y-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Jane Doe</h2>
              <p className="text-gray-600">Frontend Developer</p>
              <div className="mt-2 text-sm text-gray-600">
                <p>contact@janedoe.com | (123) 456-7890</p>
                <p>New York, NY | linkedin.com/in/janedoe</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">
                Summary
              </h3>
              <p className="text-gray-700">
                Experienced Frontend Developer with 5+ years of expertise in
                building responsive web applications. Proficient in React,
                TypeScript, and modern CSS frameworks.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">
                Experience
              </h3>

              <div className="mb-4">
                <div className="flex justify-between">
                  <h4 className="font-bold text-gray-800">
                    Senior Frontend Developer
                  </h4>
                  <span className="text-gray-600">2020 - Present</span>
                </div>
                <p className="text-gray-700 font-medium">
                  Tech Innovations Inc.
                </p>
                <ul className="list-disc pl-5 mt-1 text-gray-700">
                  <li>
                    Led development of the company's flagship web application
                  </li>
                  <li>
                    Implemented responsive design principles, improving mobile
                    conversions by 40%
                  </li>
                  <li>Mentored junior developers and conducted code reviews</li>
                </ul>
              </div>

              <div className="mb-4">
                <div className="flex justify-between">
                  <h4 className="font-bold text-gray-800">
                    Frontend Developer
                  </h4>
                  <span className="text-gray-600">2017 - 2020</span>
                </div>
                <p className="text-gray-700 font-medium">WebSolutions Co.</p>
                <ul className="list-disc pl-5 mt-1 text-gray-700">
                  <li>Developed and maintained multiple client websites</li>
                  <li>
                    Collaborated with designers to implement pixel-perfect UI
                  </li>
                  <li>
                    Improved page load times by 35% through optimization
                    techniques
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                  React
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                  TypeScript
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                  Tailwind CSS
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                  Redux
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                  Jest
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                  CI/CD
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                  Webpack
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                  GraphQL
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">
                Education
              </h3>
              <div className="flex justify-between">
                <h4 className="font-bold text-gray-800">
                  Bachelor of Science in Computer Science
                </h4>
                <span className="text-gray-600">2013 - 2017</span>
              </div>
              <p className="text-gray-700">University of Technology</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-start">
          <FileText className="h-6 w-6 mr-3 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium">Optimization Recommendations</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <span className="font-medium">Skills: </span>
                <span className="text-muted-foreground">
                  Add specific frontend technologies mentioned in the job
                  description (e.g., Next.js, Vue)
                </span>
              </li>
              <li>
                <span className="font-medium">Experience: </span>
                <span className="text-muted-foreground">
                  Highlight more quantifiable achievements to showcase your
                  impact
                </span>
              </li>
              <li>
                <span className="font-medium">Summary: </span>
                <span className="text-muted-foreground">
                  Mention experience with React Native to match job requirements
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
