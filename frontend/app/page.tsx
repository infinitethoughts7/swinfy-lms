import StaticNavbar from '@/components/layout/StaticNavbar';
import HeroSection from '@/components/sections/HeroSection';
import CompaniesHired from '@/components/sections/CompaniesHired';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import RecognitionSection from '@/components/sections/RecognitionSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/layout/Footer';
import AlumniLogos from '@/components/sections/AlumniLogos';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavbar />
      <div className="pt-20">
        <HeroSection />
        <AlumniLogos />
        <CompaniesHired />
        <TestimonialsSection />
        <RecognitionSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
