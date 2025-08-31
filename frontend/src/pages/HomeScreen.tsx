import AlumniLogos from '@/components/AlumniLogos'
import CompaniesHired from '@/components/CompaniesHired'
import HeroSection from '@/components/HeroSection'
import RecognitionSection from '@/components/RecognitionSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

const HomeScreen = () => {
  return (
    <div>
        <HeroSection />
        <AlumniLogos />
        <CompaniesHired />
        <TestimonialsSection />
        <RecognitionSection />
        <ContactSection />
        <Footer />
    </div>
  )
}

export default HomeScreen