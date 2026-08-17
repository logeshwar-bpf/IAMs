import type { Metadata } from 'next';
import './globals.css';
import LiveBackground from '../components/LiveBackground';

export const metadata: Metadata = {
  title: 'Claude Plan Provisioning — Anthropic Internal',
  description: 'Enterprise admin console for managing Claude plan grants across the organization.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Restore saved theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('iam-theme');if(t){document.documentElement.dataset.theme=t}var c=localStorage.getItem('iam-sidebar-collapsed');if(c==='true'){document.documentElement.dataset.sidebarCollapsed='true'}}catch(e){}})()`,
          }}
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <LiveBackground />
        {children}
      </body>
    </html>
  );
}
