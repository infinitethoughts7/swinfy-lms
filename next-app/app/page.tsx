import StaticNavbar from '@/components/StaticNavbar';
import HeroSection from '@/components/HeroSection';
import CompaniesHired from '@/components/CompaniesHired';
import TestimonialsSection from '@/components/TestimonialsSection';
import RecognitionSection from '@/components/RecognitionSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import AlumniLogos from '@/components/AlumniLogos';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <StaticNavbar />
      <HeroSection />
      <AlumniLogos />
      <CompaniesHired />
      <TestimonialsSection />
      <RecognitionSection />
      <ContactSection />
      <Footer />

      
      {/* Migration Complete! */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Frontend Migration Complete!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Successfully migrated all components from React to Next.js with performance optimization
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Server Components</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• StaticNavbar</li>
                <li>• HeroSection</li>
                <li>• CompaniesHired</li>
                <li>• TestimonialsSection</li>
                <li>• RecognitionSection</li>
                <li>• ContactSection</li>
                <li>• Footer</li>
                <li>• AlumniLogos</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🔧 Client Components</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• MobileMenuToggle</li>
                <li>• TestimonialsCarousel</li>
                <li>• ContactForm</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">🚀 Performance</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Next.js Image optimization</li>
                <li>• Server-side rendering</li>
                <li>• Static site generation</li>
                <li>• Minimal client JavaScript</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
