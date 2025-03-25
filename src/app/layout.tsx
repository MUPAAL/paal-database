import { SidebarProvider, SidebarTrigger } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/ui/navigation/Breadcrumbs";
import { AppSidebar } from "@/components/ui/navigation/Sidebar";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { siteConfig } from "./siteConfig";


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



export const metadata: Metadata = {
  metadataBase: new URL("https://yoururl.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: [],
  authors: [
    {
      name: "yourname",
      url: "",
    },
  ],
  creator: "yourname",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}  h-full overflow-y-scroll scroll-auto antialiased selection:bg-indigo-100 selection:text-indigo-700 dark:bg-gray-950`}
        suppressHydrationWarning
      >

        <NuqsAdapter>

          <ThemeProvider defaultTheme="system"
            disableTransitionOnChange
            attribute="class"
          >

            <SidebarProvider defaultOpen={defaultOpen} >
              <AppSidebar className="relative" />
              <div className="w-full">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">                  <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1 " />
                  <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
                  <Breadcrumbs />

                </div>
                </header>
                <div className="mx-auto max-w-screen-2xl relative">

                  <main >{children}</main>
                </div>
              </div>
            </SidebarProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}