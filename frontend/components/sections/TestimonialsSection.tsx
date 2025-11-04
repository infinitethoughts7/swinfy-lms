import Image from 'next/image';
import TestimonialsCarousel from '../TestimonialsCarousel';

const TestimonialsSection = () => {
  const clients = [
    {
      name: "TGCHE",
      logo: "/assets/client/tgche-logo1.png"
    },
    {
      name: "UWH",
      logo: "/assets/client/UWH1.png"
    },
    {
      name: "NSDC",
      logo: "/assets/client/NSDC1.png"
    },
    {
      name: "Padma Hanumaiah",
      logo: "/assets/client/padma_hanumaiah1.png"
    },
    {
      name: "Swinfy",
      logo: "/assets/client/swinfy_logo1.png"
    },
    {
      name: "TSMC",
      logo: "/assets/client/tsmc1.png"
    },
    {
      name: "TTWD",
      logo: "/assets/client/ttwd1.png"
    },
    {
      name: "Unnamed",
      logo: "/assets/client/unnamed.png"
    },
    {
      name: "Unnamed 1",
      logo: "/assets/client/unnamed (1).png"
    },
    {
      name: "Unnamed 2",
      logo: "/assets/client/unnamed (2).png"
    },
    {
      name: "Unnamed 3",
      logo: "/assets/client/unnamed (3).png"
    },
    {
      name: "Bharat Dekho",
      logo: "/assets/client/bharat_dekho1.png"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
            {clients.map((client, index) => (
              <div 
                key={index}
                className="flex items-center justify-center p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:scale-110"
              >
                <div className="relative w-full h-24 sm:h-28 md:h-32 lg:h-36">
                  <Image 
                    src={client.logo} 
                    alt={`${client.name} Logo`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
