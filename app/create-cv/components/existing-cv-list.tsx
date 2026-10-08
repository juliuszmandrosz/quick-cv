"use client";

import { CheckCircle2, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CV } from "@/app/create-cv/types/cv";

type ExistingCvListProps = {
  cvs: CV[];
  selectedCv: CV | null;
  onSelect: (cv: CV) => void;
};

/** Scrollable list of the user's saved CVs; clicking one selects it. */
export default function ExistingCvList({
  cvs,
  selectedCv,
  onSelect,
}: ExistingCvListProps) {
  const { t } = useLanguage();

  if (cvs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground p-4 text-center border rounded-md bg-muted/30">
        {t("create.noExistingCvs")}
      </p>
    );
  }

  return (
    <ScrollArea className="max-h-72 overflow-y-auto rounded-md border bg-background">
      <div className="p-2 space-y-2">
        {cvs.map((cv) => {
          const isSelected = selectedCv?.id === cv.id;
          return (
            <div
              key={cv.id}
              className={`flex items-center p-3 rounded-md border-2 transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-primary/10 border-primary shadow-md"
                  : "bg-background hover:bg-muted/50 border-transparent hover:border-border"
              }`}
              onClick={() => onSelect(cv)}
            >
              <FileText className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
              <div className="flex-grow">
                <p className="text-sm font-semibold text-foreground">
                  {cv.title || `CV Document ${cv.id.substring(0, 6)}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(cv.created_at).toLocaleDateString()}
                </p>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
