import type { Metadata } from "next";
import "./globals.css";
import { ModalProvider } from '@/components/providers/ModalProvider';
import RegistrationModalContainer from '@/components/auth/RegistrationModalContainer';

export const metadata: Metadata = {
  title: "OLLA LMS - Learning Management System",
  description: "A modern Learning Management System built with Next.js, teaching with video lectures platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ModalProvider>
          {children}
          <RegistrationModalContainer />
        </ModalProvider>
      </body>
    </html>
  );
}
