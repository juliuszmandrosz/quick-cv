import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  BarChart2,
  FileText,
  Plus,
  User,
} from "lucide-react";
import Link from "next/link";

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="dark:glass-dark glass neumorphic">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total CVs Created
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-primary" />
            <span className="text-2xl font-bold">12</span>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:glass-dark glass neumorphic">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Application Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <BarChart2 className="h-6 w-6 mr-2 text-primary" />
            <span className="text-2xl font-bold">68%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:glass-dark glass neumorphic">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <User className="h-6 w-6 mr-2 text-primary" />
            <span className="text-2xl font-bold">75%</span>
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
            <Award className="h-6 w-6 mr-2 text-secondary" />
            <span className="text-2xl font-bold">5</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  // const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {"User"}! Let's create your next perfect CV.
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 dark:glass-dark glass neumorphic">
          <CardHeader>
            <CardTitle>Create New CV</CardTitle>
            <CardDescription>
              Tailor your CV for a specific job opportunity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative flex flex-col space-y-2 p-6 rounded-lg bg-primary/5 border border-primary/20">
              <div className="absolute top-4 right-4 bg-primary/10 rounded-full p-2">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Start from scratch</h3>
              <p className="text-muted-foreground">
                Create a new CV by filling out your professional information
              </p>
              <div className="mt-4">
                <Link href="/create-cv" passHref>
                  <Button variant="default" className="neumorphic-button">
                    Start Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative flex flex-col space-y-2 p-6 rounded-lg bg-secondary/5 border border-secondary/20">
              <div className="absolute top-4 right-4 bg-secondary/10 rounded-full p-2">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Upload existing CV</h3>
              <p className="text-muted-foreground">
                Optimize your existing CV for a specific job
              </p>
              <div className="mt-4">
                <Link href="/upload-cv" passHref>
                  <Button variant="secondary" className="neumorphic-button">
                    Upload CV <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:glass-dark glass neumorphic">
          <CardHeader>
            <CardTitle>Recent CVs</CardTitle>
            <CardDescription>Your recently created CVs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Software Developer CV
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {i} day{i > 1 ? "s" : ""} ago
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Link href="/cv-repository" passHref>
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
