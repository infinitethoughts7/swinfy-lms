import Image from 'next/image';
import TestimonialsCarousel from './TestimonialsCarousel';

const TestimonialsSection = () => {
  const clientTestimonials = [
    {
      company: "Google",
      logo: "/assets/client/google.svg",
      feedback: "OLLA graduates consistently demonstrate exceptional technical skills and innovative thinking. They're our go-to source for top AI and ML talent."
    },
    {
      company: "Microsoft",
      logo: "/assets/client/microsoft.svg",
      feedback: "The quality of OLLA learners is outstanding. They bring both technical expertise and strong problem-solving abilities to our teams."
    },
    {
      company: "Netflix",
      logo: "/assets/client/netflix.svg",
      feedback: "OLLA's focus on practical skills and real-world applications produces candidates who can hit the ground running."
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

        {/* Main Testimonials Carousel - Client Component for interactivity */}
        <div className="mb-20 lg:mb-24">
          <TestimonialsCarousel />
        </div>

        {/* Client Testimonials - Static content, Server Component */}
        <div>
          <h3 className="font-sora font-bold text-2xl sm:text-3xl text-text-primary text-center mb-12">
            What Our Clients Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {clientTestimonials.map((client, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="flex justify-center mb-6">
                  <Image 
                    src={client.logo} 
                    alt={`${client.company} Logo`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <h4 className="font-sora font-bold text-xl text-text-primary mb-4">
                  {client.company}
                </h4>
                <p className="text-text-secondary font-inter leading-relaxed">
                  &ldquo;{client.feedback}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* View All Reviews CTA - Static button, Server Component */}
        <div className="text-center mt-16 lg:mt-20">
          <a 
            href="/reviews"
            className="inline-block bg-text-primary text-white px-8 py-4 rounded-lg font-inter font-semibold text-lg hover:bg-text-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            View All Reviews & Testimonials
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
