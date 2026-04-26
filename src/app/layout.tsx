import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContentFlow — Gestão de Conteúdo",
  description: "Plataforma SaaS para gestão e publicação de conteúdo em redes sociais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
