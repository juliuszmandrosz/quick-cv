"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Database } from "@/database.types";
import { Loader2 } from "lucide-react";

export default function AdditionalDetailsForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [additionalSkills, setAdditionalSkills] = useState("");
  const [languages, setLanguages] = useState([{ languageName: "", level: "" }]);
  const [education, setEducation] = useState([
    {
      schoolName: "",
      fieldOfStudy: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
    },
  ]);
  const [experience, setExperience] = useState([
    {
      companyName: "",
      position: "",
      details: "",
      startYear: "",
      startMonth: "",
      endYear: "",
      endMonth: "",
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalSkills(e.target.value);
  };

  const handleLanguageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [e.target.name]: e.target.value,
    };
    setLanguages(updatedLanguages);
  };

  const addLanguageField = () => {
    setLanguages([...languages, { languageName: "", level: "" }]);
  };

  const removeLanguageField = (index: number) => {
    const updatedLanguages = languages.filter((_, i) => i !== index);
    setLanguages(updatedLanguages);
  };

  const handleEducationChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const updatedEducation = [...education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [e.target.name]: e.target.value,
    };
    setEducation(updatedEducation);
  };

  const addEducationField = () => {
    setEducation([
      ...education,
      {
        schoolName: "",
        fieldOfStudy: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
      },
    ]);
  };

  const removeEducationField = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    setEducation(updatedEducation);
  };

  const handleExperienceChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const updatedExperience = [...experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [e.target.name]: e.target.value,
    };
    setExperience(updatedExperience);
  };

  const addExperienceField = () => {
    setExperience([
      ...experience,
      {
        companyName: "",
        position: "",
        details: "",
        startYear: "",
        startMonth: "",
        endYear: "",
        endMonth: "",
      },
    ]);
  };

  const removeExperienceField = (index: number) => {
    const updatedExperience = experience.filter((_, i) => i !== index);
    setExperience(updatedExperience);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    let profilePhotoFile = null;

    if (photoFile) {
      const reader = new FileReader();
      reader.readAsDataURL(photoFile);
      await new Promise((resolve) => {
        reader.onload = () => {
          const base64Content = reader.result?.toString().split(",")[1];
          profilePhotoFile = {
            name: photoFile.name,
            content: base64Content,
          };
          resolve(null);
        };
      });
    }

    const formData = {
      email,
      full_name: fullName,
      phone,
      city: city || null,
      additional_skills: additionalSkills || null,
      profile_photo_file: profilePhotoFile,
      language_list: languages.map((lang) => ({
        name: lang.languageName,
        level: lang.level,
      })),
      education_list: education.map((edu) => {
        const dateStart =
          edu.startYear && edu.startMonth
            ? `${edu.startYear}-${edu.startMonth}-01`
            : null;
        const dateEnd =
          edu.endYear && edu.endMonth
            ? `${edu.endYear}-${edu.endMonth}-01`
            : null;

        return {
          school_name: edu.schoolName,
          field_of_study: edu.fieldOfStudy,
          start_date: dateStart,
          end_date: dateEnd,
        };
      }),
      experience_list: experience.map((exp) => {
        const dateStart =
          exp.startYear && exp.startMonth
            ? `${exp.startYear}-${exp.startMonth}-01`
            : null;
        const dateEnd =
          exp.endYear && exp.endMonth
            ? `${exp.endYear}-${exp.endMonth}-01`
            : null;

        return {
          company_name: exp.companyName,
          position: exp.position,
          details: exp.details || null,
          start_date: dateStart,
          end_date: dateEnd,
        };
      }),
    } as Database["public"]["Functions"]["insert_cv_user_data"]["Args"];

    try {
      const response = await fetch("/api/additional-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setMessage({
          type: "success",
          text: "Dane zostały pomyślnie zapisane.",
        });
      } else {
        throw new Error(result.error || "Nie udało się zapisać danych.");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Wystąpił nieznany błąd podczas przetwarzania.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Krok 2 – Uzupełnij dane do CV
        </CardTitle>
        <CardDescription>
          Dodaj swoje podstawowe informacje oraz rozbuduj CV.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          {/* Sekcja danych osobowych */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dane osobowe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Imię i nazwisko</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={handleFullNameChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adres e-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Numer telefonu</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Miasto (opcjonalne)</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Np. Warszawa"
                  value={city}
                  onChange={handleCityChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Zdjęcie profilowe (opcjonalne)</Label>
              <Input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
              />
              {photoFile && (
                <p className="text-sm text-muted-foreground">
                  Wybrano plik: {photoFile.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalSkills">Dodatkowe umiejętności</Label>
              <Textarea
                id="additionalSkills"
                name="additionalSkills"
                placeholder="Np. Zarządzanie projektami, Scrum Master..."
                value={additionalSkills}
                onChange={handleSkillsChange}
              />
            </div>
          </div>

          <Separator />

          {/* Sekcja Języki */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Znajomość języków</h3>
            {languages.map((lang, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center gap-4"
              >
                <Input
                  type="text"
                  name="languageName"
                  placeholder="Język (np. Angielski)"
                  value={lang.languageName}
                  onChange={(e) => handleLanguageChange(index, e)}
                  required
                />
                <Input
                  type="text"
                  name="level"
                  placeholder="Poziom (np. B2)"
                  value={lang.level}
                  onChange={(e) => handleLanguageChange(index, e)}
                  required
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeLanguageField(index)}
                >
                  Usuń
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addLanguageField}>
              Dodaj kolejny język
            </Button>
          </div>

          <Separator />

          {/* Sekcja Edukacja */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Edukacja</h3>
            {education.map((edu, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`schoolName-${index}`}>
                      Nazwa szkoły/uczelni
                    </Label>
                    <Input
                      id={`schoolName-${index}`}
                      type="text"
                      name="schoolName"
                      placeholder="Nazwa szkoły"
                      value={edu.schoolName}
                      onChange={(e) => handleEducationChange(index, e)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`fieldOfStudy-${index}`}>Kierunek</Label>
                    <Input
                      id={`fieldOfStudy-${index}`}
                      type="text"
                      name="fieldOfStudy"
                      placeholder="Kierunek studiów"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleEducationChange(index, e)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`startMonth-${index}`}>
                      Miesiąc rozpoczęcia
                    </Label>
                    <select
                      id={`startMonth-${index}`}
                      name="startMonth"
                      value={edu.startMonth}
                      onChange={(e) => handleEducationChange(index, e)}
                      required
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Wybierz</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option
                            key={month}
                            value={month.toString().padStart(2, "0")}
                          >
                            {month.toString().padStart(2, "0")}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`startYear-${index}`}>
                      Rok rozpoczęcia
                    </Label>
                    <Input
                      id={`startYear-${index}`}
                      type="number"
                      name="startYear"
                      placeholder="RRRR"
                      value={edu.startYear}
                      onChange={(e) => handleEducationChange(index, e)}
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`endMonth-${index}`}>
                      Miesiąc zakończenia
                    </Label>
                    <select
                      id={`endMonth-${index}`}
                      name="endMonth"
                      value={edu.endMonth}
                      onChange={(e) => handleEducationChange(index, e)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Wybierz</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option
                            key={month}
                            value={month.toString().padStart(2, "0")}
                          >
                            {month.toString().padStart(2, "0")}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`endYear-${index}`}>Rok zakończenia</Label>
                    <Input
                      id={`endYear-${index}`}
                      type="number"
                      name="endYear"
                      placeholder="RRRR"
                      value={edu.endYear}
                      onChange={(e) => handleEducationChange(index, e)}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeEducationField(index)}
                >
                  Usuń wpis
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addEducationField}>
              Dodaj kolejną szkołę
            </Button>
          </div>

          <Separator />

          {/* Sekcja Doświadczenie */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Doświadczenie zawodowe</h3>
            {experience.map((exp, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`companyName-${index}`}>
                      Nazwa firmy/projektu
                    </Label>
                    <Input
                      id={`companyName-${index}`}
                      type="text"
                      name="companyName"
                      placeholder="Np. ABC Software"
                      value={exp.companyName}
                      onChange={(e) => handleExperienceChange(index, e)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`position-${index}`}>Stanowisko</Label>
                    <Input
                      id={`position-${index}`}
                      type="text"
                      name="position"
                      placeholder="Np. Frontend Developer"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(index, e)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`startMonth-${index}`}>
                      Miesiąc rozpoczęcia
                    </Label>
                    <select
                      id={`startMonth-${index}`}
                      name="startMonth"
                      value={exp.startMonth}
                      onChange={(e) => handleExperienceChange(index, e)}
                      required
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Wybierz</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option
                            key={month}
                            value={month.toString().padStart(2, "0")}
                          >
                            {month.toString().padStart(2, "0")}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`startYear-${index}`}>
                      Rok rozpoczęcia
                    </Label>
                    <Input
                      id={`startYear-${index}`}
                      type="number"
                      name="startYear"
                      placeholder="RRRR"
                      value={exp.startYear}
                      onChange={(e) => handleExperienceChange(index, e)}
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`endMonth-${index}`}>
                      Miesiąc zakończenia
                    </Label>
                    <select
                      id={`endMonth-${index}`}
                      name="endMonth"
                      value={exp.endMonth}
                      onChange={(e) => handleExperienceChange(index, e)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Wybierz</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option
                            key={month}
                            value={month.toString().padStart(2, "0")}
                          >
                            {month.toString().padStart(2, "0")}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`endYear-${index}`}>Rok zakończenia</Label>
                    <Input
                      id={`endYear-${index}`}
                      type="number"
                      name="endYear"
                      placeholder="RRRR"
                      value={exp.endYear}
                      onChange={(e) => handleExperienceChange(index, e)}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`details-${index}`}>
                    Zakres obowiązków / opis (opcjonalne)
                  </Label>
                  <Textarea
                    id={`details-${index}`}
                    name="details"
                    placeholder="Krótki opis, co robiłeś w tym projekcie"
                    value={exp.details}
                    onChange={(e) => handleExperienceChange(index, e)}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeExperienceField(index)}
                >
                  Usuń wpis
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addExperienceField}
            >
              Dodaj kolejne doświadczenie
            </Button>
          </div>
          {message && (
            <p
              className={`mt-2 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {message.text}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Przetwarzanie...
              </>
            ) : (
              "Dalej"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
