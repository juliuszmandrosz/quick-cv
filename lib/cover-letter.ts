/**
 * Cover letter is generated right after the CV (same model, see lib/ai-model.ts)
 * and kept in localStorage until the user downloads the CV, so both files can be
 * saved together without an extra table or any UI of its own.
 */
export type GeneratedCoverLetter = {
  fileName: string;
  coverLetter: string;
};

const storageKey = (cvId: string) => `cover-letter:${cvId}`;

export async function generateCoverLetter(
  cvId: string,
  language: string,
): Promise<GeneratedCoverLetter | null> {
  try {
    const response = await fetch("/api/generate-cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvId, language }),
    });

    const result = await response.json();

    if (!result.success || !result.coverLetter) {
      console.error("Cover letter generation failed:", result.error);
      return null;
    }

    const coverLetter: GeneratedCoverLetter = {
      fileName: result.fileName,
      coverLetter: result.coverLetter,
    };

    storeCoverLetter(cvId, coverLetter);
    return coverLetter;
  } catch (error) {
    // The cover letter is a bonus file - never block the CV flow on it.
    console.error("Cover letter generation error:", error);
    return null;
  }
}

export function storeCoverLetter(cvId: string, letter: GeneratedCoverLetter) {
  try {
    localStorage.setItem(storageKey(cvId), JSON.stringify(letter));
  } catch {
    // Private mode / full storage - the download path regenerates it instead.
  }
}

export function readCoverLetter(cvId: string): GeneratedCoverLetter | null {
  try {
    const raw = localStorage.getItem(storageKey(cvId));
    return raw ? (JSON.parse(raw) as GeneratedCoverLetter) : null;
  } catch {
    return null;
  }
}

export function clearCoverLetter(cvId: string) {
  try {
    localStorage.removeItem(storageKey(cvId));
  } catch {
    // Nothing to clean up.
  }
}

export async function downloadCoverLetterPdf(
  cvId: string,
  language: string,
  letter: GeneratedCoverLetter | null,
): Promise<boolean> {
  try {
    const response = await fetch("/api/generate-cover-letter-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cvId,
        language,
        coverLetter: letter?.coverLetter,
        fileName: letter?.fileName,
      }),
    });

    if (!response.ok) {
      console.error("Cover letter PDF failed:", response.status);
      return false;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(letter?.fileName ?? "cover-letter").replace(/\.(pdf|txt)$/i, "")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Cover letter PDF download error:", error);
    return false;
  }
}
