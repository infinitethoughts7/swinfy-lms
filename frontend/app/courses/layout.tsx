import type { Metadata } from "next";
import StaticNavbar from '@/components/layout/StaticNavbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: "Courses - OLLA LMS",
  description: "Explore our comprehensive course catalog covering Technical Skills, Life Skills, Interview Preparation, and Webinars",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavbar />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
