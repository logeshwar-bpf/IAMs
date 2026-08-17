import type { Metadata } from "next";
import "./globals.css";
import { LiveBackground } from "@/components/LiveBackground";

export const metadata: Metadata = {
  title: "GCP IAM — Security & Access Governance Platform",
  description: "Google Cloud Platform Identity and Access Management Console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <script
          id="theme-and-sidebar-init"
          dangerouslySetInnerHTML={{
            __html: `try{
              var t=localStorage.getItem('iam-theme');if(t)document.documentElement.dataset.theme=t;
              var c=localStorage.getItem('iam-sidebar-collapsed');if(c==='true')document.documentElement.dataset.sidebarCollapsed='true';
            }catch(e){}`,
          }}
        />
        <LiveBackground />
        {children}
      </body>
    </html>
  );
}
