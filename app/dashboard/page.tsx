"use client";

import Link from "next/link";
import { ChevronRight, Clock, FileText, Plus, Zap } from "lucide-react";

import { useCurrentUser } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/app/dashboard/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

type RecentCV = {
  id: string;
  lang?: string | null;
  title: string;
  created_at: string;
};

type UserStats = {
  tokens_left: number;
  total_tokens: number;
  total_cvs: number;
  plan: string;
};

const Dashboard = () => {
  const user = useCurrentUser();
  const isMobile = useIsMobile();
  const emptyStats = {
    tokens_left: 0,
    total_cvs: 0,
    total_tokens: 0,
    plan: "",
  };
  const [recentCVs, setRecentCVs] = useState<RecentCV[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(emptyStats);
  const [recentCvsLoading, setRecentCvsLoading] = useState(true);
  const [userStatsLoading, setUserStatsLoading] = useState(true);

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const res = await fetch("/api/recent-generated-cvs");
        const data = await res.json();
        console.log(data);
        setRecentCVs(data.data || []);
      } catch (error) {
        console.error("Failed to fetch recent CVs", error);
        setRecentCVs([]);
      } finally {
        setRecentCvsLoading(false);
      }
    };

    fetchCVs();
  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetch("/api/user-stats");
        const data = await res.json();
        setUserStats(data.data || emptyStats);
      } catch (error) {
        console.error("Failed to fetch recent CVs", error);
        setRecentCVs([]);
      } finally {
        setUserStatsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 md:py-8 md:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Welcome back, {user?.user?.email || "User"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your CVs and create new ones
          </p>
        </div>
        <Link href="/create-cv">
          <Button className="w-full shadow-md transition-all hover:shadow-lg md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New CV
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        <StatCard
          title="Total CVs Created"
          value={userStats.total_cvs.toString()}
          icon={<FileText className="h-5 w-5 text-primary" />}
          isLoading={userStatsLoading}
        />
        {userStatsLoading ? (
          <Card className="shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full mt-2" />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {userStats.tokens_left}/{userStats.total_tokens}
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  <Zap className="mr-1 h-3 w-3" />
                  {userStats.plan}
                </Badge>
              </div>
              <Progress
                value={(userStats.tokens_left / userStats.total_tokens) * 100}
                className="h-2"
              />
              {userStats.tokens_left === 0 && (
                <div className="mt-4">
                  <Link href="/checkout">
                    <Button className="w-full" size="sm">
                      <Zap className="mr-2 h-4 w-4" />
                      Buy More Credits
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <StatCard
          title="Interview Preparation Sessions"
          value="0"
          description="Available soon!"
          isLoading={userStatsLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <Card className="shadow-sm transition-all hover:shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent CVs</CardTitle>
            <CardDescription>
              Your recently created or edited CVs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCvsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 rounded-md" />
                <Skeleton className="h-14 rounded-md" />
                <Skeleton className="h-14 rounded-md" />
              </div>
            ) : recentCVs?.length === 0 ? (
              <div className="text-center text-muted-foreground py-24">
                <p>You haven't created any CVs yet.</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentCVs.map((cv) => (
                  <div
                    key={cv.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{cv.title}</h3>
                        <p className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(cv.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/cv-preview?cvId=${cv.id}&lang=${cv.lang ?? "en"}&path=dashboard`}
                    >
                      <Button variant="ghost" size={isMobile ? "icon" : "sm"}>
                        {!isMobile && <span className="mr-1">View</span>}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {recentCVs?.length === 0 ? null : (
            <CardFooter className="border-t pt-4 flex justify-center">
              <Link href="/created-cvs">
                <Button variant="outline">View All CVs</Button>
              </Link>
            </CardFooter>
          )}
        </Card>

        <Card className="shadow-sm transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Create a New CV</CardTitle>
            <CardDescription>
              Start from scratch or use a template
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4 pb-6 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Ready to stand out?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Our AI-powered CV creator will help you craft the perfect CV
              tailored to your target job.
            </p>
            <Link href="/create-cv" className="w-full">
              <Button className="w-full shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Start Creating
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
