import { describe, expect, it, vi } from "vitest";
import {
  parseExtractedCv,
  parseGeneratedCv,
  parsePromptPlan,
} from "@/lib/cv-schemas";

// Validation failures are logged on purpose; keep the test output clean.
vi.spyOn(console, "error").mockImplementation(() => {});

const generatedCv = {
  generated_personal_data: {
    full_name: "John Doe",
    email: "john@example.com",
    phone: "",
    linkedin: null,
  },
  file_name: "john-doe-cv",
  title: "Senior React Engineer",
  candidate_description: "Frontend developer with a focus on performance.",
  generated_experience: [
    {
      position: "Frontend Developer",
      company_name: "TechNova",
      location: "Berlin",
      start_date: "2023-06",
      end_date: null,
      responsibilities: ["Cut bundle size by 35%"],
    },
  ],
  generated_education: [
    { school_name: "TU Berlin", field_of_study: "Computer Science" },
  ],
  generated_language: [{ name: "English", level: "C1" }],
  generated_skills: {
    technical_skills: ["React"],
    soft_skills: ["Collaboration"],
  },
};

describe("parseGeneratedCv", () => {
  it("accepts a complete response and normalises optional fields", () => {
    const cv = parseGeneratedCv(JSON.stringify(generatedCv));

    expect(cv).not.toBeNull();
    expect(cv!.generated_personal_data.phone).toBeNull();
    expect(cv!.generated_skills.power_skills).toEqual([]);
    expect(cv!.generated_experience[0].end_date).toBeNull();
  });

  it("rejects invalid JSON", () => {
    expect(parseGeneratedCv("{not json")).toBeNull();
  });

  it("rejects a response missing a required section", () => {
    const withoutExperience = {
      ...generatedCv,
      generated_experience: undefined,
    };
    expect(parseGeneratedCv(JSON.stringify(withoutExperience))).toBeNull();
  });

  it("does not log the CV content when validation fails", () => {
    const log = vi.mocked(console.error);
    log.mockClear();
    parseGeneratedCv(JSON.stringify({ ...generatedCv, title: 42 }));

    const logged = log.mock.calls.flat().join(" ");
    expect(logged).toContain("title");
    expect(logged).not.toContain("John Doe");
  });
});

describe("parseExtractedCv", () => {
  it("turns missing NOT NULL text columns into empty strings", () => {
    const cv = parseExtractedCv(JSON.stringify({ full_name: "Jane" }));

    expect(cv).toMatchObject({
      full_name: "Jane",
      email: "",
      phone: "",
      title: "",
      linkedin: null,
      skills: [],
      experience_list: [],
    });
  });
});

describe("parsePromptPlan", () => {
  const plan = {
    technical_skills: ["React"],
    soft_skills: [],
    power_skills: [],
    ats_keywords: ["TypeScript"],
    tone: "confident",
    summary_focus: "performance work",
  };

  it("defaults missing rewrite instructions to an empty list", () => {
    expect(
      parsePromptPlan(JSON.stringify(plan))?.experience_rewrite_instructions,
    ).toEqual([]);
  });

  it("rejects a plan without a tone", () => {
    expect(parsePromptPlan(JSON.stringify({ ...plan, tone: "" }))).toBeNull();
  });
});
