import Image from 'next/image';
import TestimonialsCarousel from '../TestimonialsCarousel';

const TestimonialsSection = () => {
  const clients = [
    {
      name: "Google",
      logo: "/assets/client/google.svg"
    },
    {
      name: "Microsoft",
      logo: "/assets/client/microsoft.svg"
    },
    {
      name: "Netflix",
      logo: "/assets/client/netflix.svg"
    },
    {
      name: "LinkedIn",
      logo: "/assets/client/linkedin.svg"
    },
    {
      name: "Coca-Cola",
      logo: "/assets/client/coca-cola.svg"
    },
    {
      name: "Envato",
      logo: "/assets/client/envato.svg"
    },
    {
      name: "Yamaha",
      logo: "/assets/client/yamaha.svg"
    },
    {
      name: "Mastercard",
      logo: "/assets/client/mastercard.svg"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="font-sora font-bold text-3xl sm:text-4xl lg:text-5xl text-text-primary mb-6">
            What Our Community Says
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary font-inter max-w-3xl mx-auto">
            Discover how OLLA has transformed careers and empowered learners worldwide
          </p>
        </div>

        {/* Student Testimonials Carousel */}
        <div className="mb-20 lg:mb-24">
          <TestimonialsCarousel />
        </div>

        {/* Our Clients Section */}
        <div>
          <h3 className="font-sora font-bold text-2xl sm:text-3xl text-text-primary text-center mb-12">
            Our Clients
          </h3>
          <p className="text-center text-text-secondary font-inter mb-12">
            Trusted by leading companies worldwide
          </p>
          
          {/* Client Logos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
            {clients.map((client, index) => (
              <div 
                key={index}
                className="flex items-center justify-center p-6 transition-all duration-300 hover:scale-110"
              >
                <div className="relative w-full h-16">
                  <Image 
                    src={client.logo} 
                    alt={`${client.name} Logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
