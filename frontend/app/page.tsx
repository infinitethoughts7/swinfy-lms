import StaticNavbar from '@/components/layout/StaticNavbar';
import HeroSection from '@/components/sections/HeroSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import RecognitionSection from '@/components/sections/RecognitionSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/layout/Footer';
import AlumniLogos from '@/components/sections/AlumniLogos';
import FeaturedCoursesSlider from '@/components/sections/FeaturedCoursesSlider';
import KnowledgePartnerSection from '@/components/sections/KnowledgePartnerSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavbar />
      <div className="pt-12">
        <HeroSection />
        <AlumniLogos />
        <FeaturedCoursesSlider />
        <KnowledgePartnerSection />
        <TestimonialsSection />
        <RecognitionSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
