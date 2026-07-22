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
    >
      <body className="min-h-full flex flex-col dark">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <AuthGate>{children}</AuthGate>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
