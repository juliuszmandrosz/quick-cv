"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

type CV = {
  id: number;
  title: string;
  created_at: Date;
  lang: string;
};

export default function CreatedCVsPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCVs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/generated-cvs");
        if (!res.ok) {
          throw new Error("Failed to fetch CVs");
        }
        const data = await res.json();
        setCvs(data.data);
      } catch (error) {
        console.error("Error fetching CVs:", error);
        setCvs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, []);

  return (
    <TooltipProvider>
      <div className="container mx-auto max-w-6xl py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Created CVs</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all your created CVs
            </p>
          </div>

          <Link href="/create-cv">
            <Button className="shadow-md transition-all hover:shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Create New CV
            </Button>
          </Link>
        </div>

        {/* CV count */}
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            `Showing ${cvs.length} ${cvs.length === 1 ? "CV" : "CVs"}`
          )}
        </div>

        <div className="h-[calc(100vh-220px)] overflow-auto pr-2 -mr-2 scrollbar-thin">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="overflow-hidden h-[50px]">
                  <CardContent className="p-0">
                    <div className="flex h-full items-center">
                      <div className="flex-1 p-3">
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex border-l border-border">
                        <Skeleton className="h-full w-10" />
                        <div className="w-px bg-border" />
                        <Skeleton className="h-full w-10" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cvs.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
              <div className="text-4xl mb-4">📄</div>
              <div className="text-xl font-medium mb-2">No CVs found</div>
              <div className="text-muted-foreground mb-6">
                Create your first CV to get started
              </div>
              <Link href="/create-cv">
                <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New CV
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {cvs.map((cv) => (
                <Card
                  key={cv.id}
                  className="overflow-hidden h-[50px] transition-all duration-200 hover:bg-muted/10 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `cv-preview?cvId=${cv.id}&lang=${cv.lang}&path=created-cvs`,
                    );
                  }}
                >
                  <CardContent className="p-0">
                    <div className="flex h-full items-center">
                      {/* CV Title and Date */}
                      <div className="flex-1 p-3 flex justify-between items-center">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {cv.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(cv.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex border-l border-border h-full">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="rounded-none h-full aspect-square"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `cv-preview?cvId=${cv.id}&lang=${cv.lang}&path=created-cvs`,
                                );
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Preview</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
