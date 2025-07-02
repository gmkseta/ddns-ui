import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloudflare DDNS Manager",
  description: "Cloudflare DNS API를 활용한 DDNS 관리 웹 UI",
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params
}: Props) {
  // Next.js 15에서 params는 Promise입니다
  const { locale } = await params;
  
  // 지원하지 않는 로케일 체크
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 메시지 로드
  const messages = await getMessages({ locale });
  
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              {children}
              <Toaster 
                position="top-center"
                gutter={12}
                containerStyle={{
                  top: '20px',
                }}
                toastOptions={{
                  duration: 4000,
                  className: 'dark:!bg-gray-800 dark:!text-gray-100 dark:!border-gray-600',
                  style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '14px',
                    fontWeight: '500',
                    maxWidth: '420px',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                  },
                  success: {
                    style: {
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      color: '#065f46',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
                    },
                    iconTheme: {
                      primary: '#10b981',
                      secondary: 'rgba(16, 185, 129, 0.1)',
                    },
                  },
                  error: {
                    style: {
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                      color: '#7f1d1d',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)',
                    },
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: 'rgba(239, 68, 68, 0.1)',
                    },
                  },
                  loading: {
                    style: {
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                      color: '#1e3a8a',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)',
                    },
                    iconTheme: {
                      primary: '#3b82f6',
                      secondary: 'rgba(59, 130, 246, 0.1)',
                    },
                  },
                }}
              />
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
