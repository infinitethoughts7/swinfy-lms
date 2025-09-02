import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'LinkedIn', href: '/linkedin', icon: 'linkedin' },
    { name: 'Twitter', href: '/twitter', icon: 'twitter' },
    { name: 'Facebook', href: '/facebook', icon: 'facebook' },
    { name: 'Instagram', href: '/instagram', icon: 'instagram' },
    { name: 'YouTube', href: '/youtube', icon: 'youtube' }
  ];

  const renderSocialIcon = (icon: string) => {
    switch (icon) {
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.665 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
      {/* Overlay for depth - similar to course page hero */}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Description */}
          <div className="flex items-center mb-6 md:mb-0">
            <div className="w-8 h-6 relative mr-3">
              {/* Blue dot - top left */}
              <div className="absolute top-1 left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              
              {/* Green dot - top right */}
              <div className="absolute top-1 left-5 w-2 h-2 bg-green-500 rounded-full"></div>
              
              {/* Yellow dot - bottom left */}
              <div className="absolute top-3 left-2 w-2 h-2 bg-yellow-500 rounded-full"></div>
              
              {/* Red dot - bottom right */}
              <div className="absolute top-3 left-6 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <div>
              <h2 className="text-xl font-sora font-black text-white">OLLA</h2>
              <p className="text-white/80 text-sm">Empowering learners worldwide</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
            <Link href="/courses" className="text-white/90 hover:text-white transition-colors text-sm">
              Courses
            </Link>
            <Link href="/team" className="text-white/90 hover:text-white transition-colors text-sm">
              Team
            </Link>
            <Link href="/pricing" className="text-white/90 hover:text-white transition-colors text-sm">
              Pricing
            </Link>
            <Link href="/contact" className="text-white/90 hover:text-white transition-colors text-sm">
              Contact
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex space-x-3">
            {socialLinks.slice(0, 4).map((social, index) => (
              <Link
                key={index}
                href={social.href}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-200"
                aria-label={social.name}
              >
                {renderSocialIcon(social.icon)}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/70">
            <div>
              © {currentYear} OLLA. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
