"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/Sidebar"
import { AppSidebar } from "@/components/ui/navigation/AppSidebar"
import { Breadcrumbs } from "@/components/ui/navigation/Breadcrumbs"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ThemeProvider } from "next-themes"
import localFont from "next/font/local"
import "./globals.css"
import { useGetPathname } from "@/lib/getUrl"
import Cookies from "js-cookie"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Provider } from "react-redux"
import { store } from "@/store/store"
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const defaultOpen = true
  const pathname = useGetPathname()
  const router = useRouter()

  useEffect(() => {
    const cookie = Cookies.get("accessToken")
    const includedPaths = [
      "/app/dashboard",
      "/app/users",
      "/app/individualUser",
      "/app/editBundle",
      "/app/editSubScription",
      "/app/subscriptionHistory",
      // "/app/platform",
    ];

    const shouldShowLayout = includedPaths.some((path) =>
      pathname.startsWith(path),
    )
    if (!cookie && shouldShowLayout) {
      router.push("/login")
    }
    if (cookie && !shouldShowLayout) {
      router.push("/app/dashboard")
    }
  }, [pathname])
  // Define paths that should show the sidebar and header
  const includedPaths = [
    "/app/dashboard",
    "/app/users",
    "/app/editBundle",
    "/app/editSubScription",
    "/app/subscriptionHistory",
    // "/app/platform",
  ]
  const shouldShowLayout = includedPaths.some((path) =>
    pathname.startsWith(path),
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          defaultTheme="light"
          disableTransitionOnChange
          attribute="class"
        >
          <Provider store={store}>
            {shouldShowLayout ? (
              <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <div className="w-full">
                  <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
                    <SidebarTrigger className="-ml-1" />
                    <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
                    <Breadcrumbs />
                  </header>
                  <ToastContainer position="bottom-right" autoClose={3000} />
                  <main>{children}</main>
                </div>
              </SidebarProvider>
            ) : (
              <main>{children}</main>
            )}
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
**