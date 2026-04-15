import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "likelihood | Contemporary Fashion",
    template: "%s | likelihood",
  },
  description: "likelihood - 컨템포러리 패션 브랜드. 미니멀하고 세련된 의류를 만나보세요.",
  keywords: ["likelihood", "fashion", "clothing", "의류", "패션", "컨템포러리"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "likelihood",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased min-h-screen bg-white text-foreground">
        <NextTopLoader color="#000000" height={2} showSpinner={false} />
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
