import { Metadata } from "next";
import { BugReportForm } from "@/components/bug-report/bug-report-form";

export const metadata: Metadata = {
  title: "Report a Bug | Southville 8B NHS Edge",
  description: "Report bugs and issues to help us improve the Southville 8B NHS Edge portal",
};

export default function BugReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bug Report
          </h1>
          <p className="text-muted-foreground">
            Help us improve by reporting any issues you encounter
          </p>
        </div>

        <BugReportForm />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Your report will be sent directly to our development team.
            <br />
            We appreciate your feedback in making the portal better for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
