import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
