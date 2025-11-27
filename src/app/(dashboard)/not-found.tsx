import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardNotFound() {
  return (
    <div className="max-w-lg mx-auto py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <FileQuestion
              className="h-12 w-12 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="text-xl">Page Not Found</CardTitle>
          <CardDescription>
            This page doesn&apos;t exist or has been moved.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the sidebar navigation to find what you&apos;re looking for.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
