"use client";
import React from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TestimonialsSection = () => {
  const { t } = useLanguage();

  // For now, using placeholder testimonials that can be replaced with real ones later
  const testimonials = [
    {
      quote:
        "I was applying to jobs for months with barely any responses. After using Nice CV, I got 3 interview calls in my first week!",
      name: "Sarah J.",
      role: "Marketing Specialist",
      rating: 5,
    },
    {
      quote:
        "The time saved is incredible. What used to take me hours now takes seconds, and my CV is even better than when I did it manually.",
      name: "Michael T.",
      role: "Software Engineer",
      rating: 5,
    },
    {
      quote:
        "As a career changer, I was struggling to highlight my transferable skills. Nice CV helped me present my experience in a way that resonated with recruiters.",
      name: "Elena C.",
      role: "Project Manager",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="section-padding bg-white">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("testimonials.title")}{" "}
            <span className="gradient-text">{t("testimonials.titleBold")}</span>
          </h2>
          <p className="text-xl text-gray-700">{t("testimonials.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700 mb-6">
                &quot;{testimonial.quote}&quot;
              </p>

              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-nicecv-soft-gray rounded-full px-6 py-3">
            <p className="text-nicecv-dark-purple font-medium">
              {t("testimonials.join")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
