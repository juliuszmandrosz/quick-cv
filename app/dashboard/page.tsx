"use client";
import Link from "next/link";
import { ArrowRight, Award, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <Card className="dark:glass-dark glass neumorphic">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total CVs Created
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <FileText className="h-5 w-5 md:h-6 md:w-6 mr-2 text-primary" />
            <span className="text-xl md:text-2xl font-bold">12</span>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:glass-dark glass neumorphic">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Credits Remaining
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Award className="h-5 w-5 md:h-6 md:w-6 mr-2 text-secondary" />
            <span className="text-xl md:text-2xl font-bold">5</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Welcome back, User!</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="col-span-1 lg:col-span-2 dark:glass-dark glass neumorphic">
          <CardHeader>
            <CardTitle>Create Your Next CV</CardTitle>
            <CardDescription>
              Paste a job offer link and generate a ready-to-send CV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 rounded-lg bg-primary/5 border border-primary/20">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg md:text-xl font-semibold">
                  Get started now
                </h3>
                <p className="text-muted-foreground text-sm">
                  It takes less than a minute.
                </p>
              </div>
              <Link href="/create-cv">
                <Button
                  variant="default"
                  className="neumorphic-button w-full sm:w-auto"
                >
                  Generate CV <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:glass-dark glass neumorphic">
          <CardHeader>
            <CardTitle>Recent CVs</CardTitle>
            <CardDescription>Your latest CVs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Software Developer CV</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {i} day{i > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Link href="/cv-repository">
              <Button variant="outline" className="w-full neumorphic-button">
                View All CVs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
