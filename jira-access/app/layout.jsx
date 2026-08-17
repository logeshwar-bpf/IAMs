import "./globals.css";
import LiveBackground from "../components/LiveBackground";

export const metadata = {
  title: "Jira Access — Bipolar Factory",
  description: "Single Admin Provisioning Controller for Task Projects, User Access Matrices, and Real-time Audit Logs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <script
          id="theme-and-sidebar-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('iam-theme')||localStorage.getItem('jira:theme');if(t){document.documentElement.dataset.theme=t}var c=localStorage.getItem('iam-sidebar-collapsed');if(c==='true'){document.documentElement.dataset.sidebarCollapsed='true'}}catch(e){}})()`,
          }}
        />
        <LiveBackground />
        {children}
      </body>
    </html>
  );
}
