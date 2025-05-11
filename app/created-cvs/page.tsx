"use client";

import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  SortAsc,
  SortDesc,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Mock data with more fields for a realistic CV preview
const generateMockCVs = (count: number) => {
  const jobTitles = [
    "Software Engineer",
    "Frontend Developer",
    "UX Designer",
    "Product Manager",
    "Data Scientist",
    "DevOps Engineer",
    "Marketing Specialist",
    "Content Writer",
    "Project Manager",
  ];

  const companies = [
    "Google",
    "Meta",
    "Apple",
    "Amazon",
    "Microsoft",
    "Netflix",
    "Spotify",
    "Airbnb",
    "Uber",
    "Twitter",
  ];

  const skills = [
    "JavaScript",
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "UI/UX",
    "Product Strategy",
    "Data Analysis",
    "AWS",
    "Docker",
  ];

  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    const randomSkills = Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => skills[Math.floor(Math.random() * skills.length)],
    );

    return {
      id: i + 1,
      title: `${jobTitles[Math.floor(Math.random() * jobTitles.length)]} - ${companies[Math.floor(Math.random() * companies.length)]}`,
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      favorite: Math.random() > 0.7,
      skills: randomSkills,
      matchScore: Math.floor(Math.random() * 40) + 60, // 60-100% match
      interviews: Math.floor(Math.random() * 5),
      views: Math.floor(Math.random() * 50),
      lastModified: new Date(
        date.getTime() - Math.floor(Math.random() * 1000000000),
      ),
    };
  });
};

// Generate 100 mock CVs for demonstration
const mockCVsData = generateMockCVs(100);

type SortField = "date" | "title" | "matchScore" | "lastModified";
type SortOrder = "asc" | "desc";

export default function CreatedCVsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCV, setSelectedCV] = useState<any>(null);
  const [deleteConfirmCV, setDeleteConfirmCV] = useState<any>(null);
  const [cvs, setCvs] = useState(mockCVsData);

  const parentRef = useRef<HTMLDivElement>(null);

  // Filter and sort CVs based on user preferences
  const filteredCVs = useMemo(() => {
    let result = [...cvs];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (cv) =>
          cv.title.toLowerCase().includes(query) ||
          cv.skills.some((skill: string) =>
            skill.toLowerCase().includes(query),
          ),
      );
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter((cv) => cv.favorite);
    }

    // Sort by selected field
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "matchScore":
          comparison = a.matchScore - b.matchScore;
          break;
        case "lastModified":
          comparison =
            new Date(a.lastModified).getTime() -
            new Date(b.lastModified).getTime();
          break;
        case "date":
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [cvs, searchQuery, sortField, sortOrder, showFavoritesOnly]);

  // Toggle favorite status
  const toggleFavorite = useCallback((id: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    setCvs((prevCvs) =>
      prevCvs.map((cv) =>
        cv.id === id ? { ...cv, favorite: !cv.favorite } : cv,
      ),
    );
  }, []);

  // Handle CV deletion
  const handleDelete = useCallback(
    (id: number) => {
      setCvs((prevCvs) => prevCvs.filter((cv) => cv.id !== id));
      setDeleteConfirmCV(null);
      if (selectedCV?.id === id) {
        setSelectedCV(null);
      }
    },
    [selectedCV],
  );

  return (
    <TooltipProvider>
      <div className="container py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-primary">Created CVs</h1>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search CVs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[250px] neumorphic-inset bg-background/50"
              />
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="neumorphic"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Sort options</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="font-medium text-xs text-muted-foreground"
                    disabled
                  >
                    SORT BY
                  </DropdownMenuItem>
                  <DropdownMenuCheckboxItem
                    checked={sortField === "date"}
                    onCheckedChange={() => setSortField("date")}
                  >
                    Creation Date
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortField === "lastModified"}
                    onCheckedChange={() => setSortField("lastModified")}
                  >
                    Last Modified
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortField === "title"}
                    onCheckedChange={() => setSortField("title")}
                  >
                    Title
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortField === "matchScore"}
                    onCheckedChange={() => setSortField("matchScore")}
                  >
                    Match Score
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="font-medium text-xs text-muted-foreground"
                    disabled
                  >
                    ORDER
                  </DropdownMenuItem>
                  <DropdownMenuCheckboxItem
                    checked={sortOrder === "desc"}
                    onCheckedChange={() => setSortOrder("desc")}
                  >
                    Descending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortOrder === "asc"}
                    onCheckedChange={() => setSortOrder("asc")}
                  >
                    Ascending
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "neumorphic",
                      sortOrder === "desc" &&
                        sortField === "date" &&
                        "bg-primary/10",
                    )}
                    onClick={() => {
                      setSortField("date");
                      setSortOrder("desc");
                    }}
                  >
                    <SortDesc className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Newest first</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "neumorphic",
                      sortOrder === "asc" &&
                        sortField === "date" &&
                        "bg-primary/10",
                    )}
                    onClick={() => {
                      setSortField("date");
                      setSortOrder("asc");
                    }}
                  >
                    <SortAsc className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Oldest first</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "neumorphic",
                      showFavoritesOnly && "bg-primary/10",
                    )}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        showFavoritesOnly && "fill-yellow-500 text-yellow-500",
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showFavoritesOnly ? "Show all" : "Show favorites only"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* CV count and stats */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredCVs.length} {filteredCVs.length === 1 ? "CV" : "CVs"}
          {showFavoritesOnly && " (favorites only)"}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* CV list without virtualization */}
        <div
          ref={parentRef}
          className="h-[calc(100vh-220px)] overflow-auto pr-2 -mr-2 scrollbar-thin"
        >
          <div className="space-y-4">
            {filteredCVs.map((cv) => (
              <Card
                key={cv.id}
                className={cn(
                  "glass neumorphic overflow-hidden h-[90px] transition-all duration-200 hover:translate-y-[-2px] cursor-pointer",
                  cv.favorite && "border-l-4 border-l-yellow-500",
                )}
                onClick={() => setSelectedCV(cv)}
              >
                <CardContent className="p-0">
                  <div className="flex h-full">
                    {/* CV Preview */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium line-clamp-1">
                              {cv.title}
                            </h3>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(cv.id, e);
                                  }}
                                >
                                  {cv.favorite ? (
                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                                  ) : (
                                    <StarOff className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {cv.favorite
                                  ? "Remove from favorites"
                                  : "Add to favorites"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created: {cv.date}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              {cv.matchScore}% Match
                            </Badge>
                            {cv.skills.map((skill: string, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="bg-secondary/5 hover:bg-secondary/10"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-3 text-xs text-muted-foreground ml-2 hidden md:flex">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Eye className="h-3 w-3 inline mr-1" />{" "}
                                {cv.views}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Views</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="inline mr-1"
                                >
                                  <rect
                                    width="18"
                                    height="18"
                                    x="3"
                                    y="4"
                                    rx="2"
                                    ry="2"
                                  />
                                  <line x1="16" x2="16" y1="2" y2="6" />
                                  <line x1="8" x2="8" y1="2" y2="6" />
                                  <line x1="3" x2="21" y1="10" y2="10" />
                                  <path d="m9 16 2 2 4-4" />
                                </svg>
                                {cv.interviews}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Interviews</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex border-l border-border">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="rounded-none h-full aspect-square hidden sm:flex"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCV(cv);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview</TooltipContent>
                      </Tooltip>
                      <div className="w-px bg-border hidden sm:block" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="rounded-none h-full aspect-square hidden sm:flex"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                      <div className="w-px bg-border" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="rounded-none h-full aspect-square"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="sm:hidden"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCV(cv);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="sm:hidden">
                            <Download className="h-4 w-4 mr-2" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(cv.id);
                            }}
                          >
                            {cv.favorite ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" /> Remove from
                                Favorites
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" /> Add to
                                Favorites
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmCV(cv);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredCVs.length === 0 && (
          <div className="text-center py-12 glass neumorphic rounded-lg">
            <div className="text-4xl mb-4">📄</div>
            <div className="text-xl font-medium mb-2">No CVs found</div>
            <div className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search or filters"
                : showFavoritesOnly
                  ? "You don't have any favorite CVs yet"
                  : "Create your first CV to get started"}
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-2 neumorphic"
              >
                Clear search
              </Button>
            )}
            {showFavoritesOnly && !searchQuery && (
              <Button
                variant="outline"
                onClick={() => setShowFavoritesOnly(false)}
                className="mt-2 neumorphic"
              >
                Show all CVs
              </Button>
            )}
          </div>
        )}

        {/* CV Preview Dialog */}
        {selectedCV && (
          <Dialog
            open={!!selectedCV}
            onOpenChange={(open) => !open && setSelectedCV(null)}
          >
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedCV.title}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(selectedCV.id);
                    }}
                  >
                    {selectedCV.favorite ? (
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ) : (
                      <StarOff className="h-5 w-5" />
                    )}
                  </Button>
                </DialogTitle>
                <DialogDescription>
                  Created: {selectedCV.date} • Match Score:{" "}
                  {selectedCV.matchScore}%
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Mock CV Preview */}
                <div className="aspect-[3/4] bg-card rounded-md border border-border overflow-hidden">
                  <div className="h-full p-6 flex flex-col">
                    <div className="text-2xl font-bold mb-1">John Doe</div>
                    <div className="text-lg text-primary mb-4">
                      {selectedCV.title.split(" - ")[0]}
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">
                      john.doe@example.com • (555) 123-4567 • New York, NY
                    </div>

                    <div className="border-t border-border my-4"></div>

                    <div className="text-lg font-semibold mb-2">Summary</div>
                    <p className="text-sm mb-4">
                      Experienced {selectedCV.title.split(" - ")[0]} with a
                      passion for creating user-friendly applications and
                      solving complex problems.
                    </p>

                    <div className="text-lg font-semibold mb-2">Experience</div>
                    <div className="mb-3">
                      <div className="text-md font-medium">
                        {selectedCV.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Jan 2020 - Present
                      </div>
                      <ul className="text-sm mt-1 list-disc pl-5">
                        <li>
                          Led development of key features resulting in 30% user
                          growth
                        </li>
                        <li>
                          Collaborated with cross-functional teams to improve
                          product quality
                        </li>
                        <li>
                          Mentored junior developers and conducted code reviews
                        </li>
                      </ul>
                    </div>

                    <div className="text-lg font-semibold mb-2 mt-4">
                      Skills
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCV.skills.map((skill: string, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-primary/10"
                        >
                          {skill}
                        </Badge>
                      ))}
                      <Badge variant="secondary" className="bg-primary/10">
                        Problem Solving
                      </Badge>
                      <Badge variant="secondary" className="bg-primary/10">
                        Communication
                      </Badge>
                    </div>

                    <div className="flex-grow"></div>
                    <div className="text-xs text-muted-foreground text-center mt-4">
                      This is a preview of your CV. Download for the full
                      version.
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between">
                <div className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="neumorphic"
                    onClick={() => setDeleteConfirmCV(selectedCV)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-initial neumorphic"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button className="flex-1 sm:flex-initial neumorphic">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirmCV && (
          <Dialog
            open={!!deleteConfirmCV}
            onOpenChange={(open) => !open && setDeleteConfirmCV(null)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete CV</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{deleteConfirmCV.title}"?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmCV(null)}
                  className="neumorphic"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deleteConfirmCV.id)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}
