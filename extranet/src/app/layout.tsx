import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans",
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFDFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: "TripSwift - Property Management System",
  description: "Complete solution for managing your property bookings, rates, and revenue",
  keywords: [
    "property management",
    "booking system",
    "rate plans",
    "revenue management"
  ],
  authors: [
    { name: "TripSwift Team" }
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#076DB3" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          notoSans.variable,
          "text-foreground bg-tripsyift-off-white"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            <div className="flex flex-col min-h-screen">
              {children}
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'font-sans',
                style: {
                  background: 'var(--color-primary-blue)',
                  color: 'var(--color-primary-off-white)',
                },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}