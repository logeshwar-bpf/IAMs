import './globals.css';
import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/Sidebar';
import { LiveBackground } from '@/components/LiveBackground';

export const metadata = {
  title: 'Google Workspace Access & Provisioning Dashboard',
  description: 'Manage users and service permissions via Directory API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <script
          id="theme-and-sidebar-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('iam-theme');if(t){document.documentElement.dataset.theme=t}var c=localStorage.getItem('iam-sidebar-collapsed');if(c==='true'){document.documentElement.dataset.sidebarCollapsed='true'}}catch(e){}})()`,
          }}
        />
        <ThemeProvider>
          <LiveBackground />
          <div className="app">
            <Sidebar />
            <div className="main">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
