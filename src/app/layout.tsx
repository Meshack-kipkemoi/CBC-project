import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Roboto, Public_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/tanstack-query";

const publicSansHeading = Public_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CBC AI | Learning, understood",
  description:
    "A learner-centred CBC progress portal for families and schools in Kenya.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-background",
        "font-sans",
        roboto.variable,
        publicSansHeading.variable,
      )}
    >
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
