"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

/** Static sample of a generated CV shown next to the CV inputs. */
export default function CvSamplePreview() {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden shadow-lg border-border/30 sticky top-28">
      <CardHeader className="p-4 bg-muted/20 border-b text-left">
        <CardTitle className="text-xs sm:text-sm text-foreground">
          {t("create.cvPreviewTitle")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("create.cvPreviewDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <div className="aspect-auto w-full max-w-[280px] mx-auto rounded-lg overflow-hidden border-2 border-dashed border-primary/20 bg-muted/30 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static illustration with a query string; next/image would need images.localPatterns config and fixed dimensions */}
          <img
            src="/cv-sample.png?width=280"
            alt={t("create.sampleCvAlt")}
            className="w-full h-full object-contain"
          />
        </div>
      </CardContent>
      <CardFooter className="p-3 text-left text-xs text-muted-foreground bg-muted/20 border-t">
        {t("create.cvPreviewCaption")}
      </CardFooter>
    </Card>
  );
}
