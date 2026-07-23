import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Public_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/Sidebar";
import { AuthGate } from "./components/auth-gate";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";

const jetbrainsMonoHeading = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
});

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixl",
  description: "Dashboard for Pixl!!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        publicSans.variable,
        jetbrainsMonoHeading.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem("pixl_theme");
                  if (t === "light") document.documentElement.classList.remove("dark");
                  else document.documentElement.classList.add("dark");
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <SidebarProvider side="right" className="h-full">
            <ScrollArea className="flex-1 min-w-0 h-dvh">
              <main>
                <div className="flex items-center justify-end p-2">
                  <SidebarTrigger />
                </div>
                <AuthGate>{children}</AuthGate>
              </main>
            </ScrollArea>
            <AppSidebar />
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
