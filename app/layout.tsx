import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import "./typography.css";

const appFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-app",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quản lý chi tiêu cá nhân",
  description: "Ghi thu chi, xem biểu đồ tháng, cảnh báo vượt ngân sách",
  applicationName: "Finance Manager",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finance",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={appFont.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }

                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.getRegistrations()
                      .then(function(registrations) {
                        registrations.forEach(function(registration) {
                          registration.unregister().catch(function() {});
                        });
                      })
                      .catch(function() {});
                  });
                }

                if ('caches' in window) {
                  caches.keys()
                    .then(function(keys) {
                      keys
                        .filter(function(key) { return key.indexOf('finance-shell') === 0; })
                        .forEach(function(key) { caches.delete(key).catch(function() {}); });
                    })
                    .catch(function() {});
                }
              })()
            `,
          }}
        />
      </head>
      <body className={`${appFont.className} bg-[#f4f7fb] text-slate-950 transition-colors duration-200 dark:bg-[#0a0f1d] dark:text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
