import "./globals.css";
import { Noto_Kufi_Arabic } from "next/font/google";
import { Toaster } from "sonner";
import { ClientThemeProvider } from "@/components/ClientThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import { ArtifactProvider } from "@/lib/artifact-store";
import { IncrementalityExperimentProvider } from "@/lib/incrementality-store";
import { KnowledgeGraphInstanceProvider } from "@/lib/knowledge-graph-instances";
import { WorkflowEventProvider } from "@/lib/workflow-event-context";
import { ActionEffectsProvider } from "@/lib/action-effects-store";
import { ResizeObserverErrorHandler } from "@/components/resize-observer-error-handler";

const notoKufi = Noto_Kufi_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-kufi",
});

export const metadata = {
  title: "CDP Workflow Platform",
  description: "Multi-Agent Customer Data Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${notoKufi.variable} font-sans`}>
        <ResizeObserverErrorHandler />
        <ClientThemeProvider clientId="cdp">
          <AuthProvider>
            <IncrementalityExperimentProvider>
              <KnowledgeGraphInstanceProvider>
                <ArtifactProvider>
                  <ActionEffectsProvider>
                    <WorkflowEventProvider>
                      {children}
                      <Toaster position="top-right" />
                    </WorkflowEventProvider>
                  </ActionEffectsProvider>
                </ArtifactProvider>
              </KnowledgeGraphInstanceProvider>
            </IncrementalityExperimentProvider>
          </AuthProvider>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
