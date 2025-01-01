"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkIcon, Loader2 } from "lucide-react";

export default function JobOfferForm() {
  const [jobUrl, setJobUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/job-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: "Dane z oferty pracy zostały pomyślnie zapisane.",
        });
        setJobUrl("");
      } else {
        throw new Error(result.error || "Nie udało się przetworzyć linku.");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Wystąpił nieznany błąd podczas przetwarzania.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Dodaj ofertę pracy
        </CardTitle>
        <CardDescription className="text-center">
          Wklej link do oferty pracy, aby ją zapisać w systemie
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex items-center space-x-2">
            <LinkIcon className="text-gray-400" />
            <Input
              type="url"
              placeholder="https://example.com/job-offer"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              required
              className="flex-grow"
            />
          </div>
          {message && (
            <p
              className={`mt-2 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {message.text}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Przetwarzanie...
              </>
            ) : (
              "Zapisz ofertę"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
