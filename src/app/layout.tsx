import { AuthProvider } from "@/components/AuthProvider";
import { ClientOnly } from "@/components/ClientOnly";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { SidebarProvider } from "@/components/Sidebar";
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

            <ClientOnly fallback={<div className="w-full">{children}</div>}>
              <AuthProvider>
                <SidebarProvider defaultOpen={defaultOpen}>
                  <ConditionalLayout defaultSidebarOpen={defaultOpen}>
                    {children}
                  </ConditionalLayout>
                </SidebarProvider>
              </AuthProvider>
            </ClientOnly>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}