import Image from 'next/image';

const RecognitionSection = () => {
  const recognitionData = [
    {
      name: "Startup India",
      logo: "/assets/recognised/logo_startup_india.png"
    },
    {
      name: "NSDC",
      logo: "/assets/recognised/logo_nsdc.svg"
    },
    {
      name: "MSME",
      logo: "/assets/recognised/logo_msme.svg"
    }
  ];

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-sora font-bold text-2xl sm:text-3xl lg:text-4xl text-text-primary mb-4">
            Recognised By
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary font-inter max-w-3xl mx-auto">
            Our platform has been recognized and endorsed by leading government organizations and initiatives that support innovation, skill development, and entrepreneurship in India.
          </p>
        </div>

        {/* Recognition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {recognitionData.map((org, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 lg:w-28 lg:h-28 bg-white rounded-lg flex items-center justify-center p-4">
                  <Image 
                    src={org.logo} 
                    alt={`${org.name} Logo`} 
                    width={112}
                    height={112}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Organization Name */}
              <h3 className="font-sora font-bold text-xl lg:text-2xl text-text-primary text-center">
                {org.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <p className="text-sm lg:text-base text-text-secondary font-inter">
            Join thousands of learners who trust our government-recognized platform for quality education and skill development.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RecognitionSection;
