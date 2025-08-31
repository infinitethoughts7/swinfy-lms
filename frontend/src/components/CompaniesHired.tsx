import React from 'react';

const CompaniesHired = () => {
  const companyLogos = [
    { name: "Google", logo: "/src/assets/client/google.svg" },
    { name: "Microsoft", logo: "/src/assets/client/microsoft.svg" },
    { name: "Netflix", logo: "/src/assets/client/netflix.svg" },
    { name: "LinkedIn", logo: "/src/assets/client/linkedin.svg" },
    { name: "Mastercard", logo: "/src/assets/client/mastercard.svg" },
    { name: "Visa", logo: "/src/assets/client/visa.svg" },
    { name: "Yamaha", logo: "/src/assets/client/yamaha.svg" },
    { name: "Coca-Cola", logo: "/src/assets/client/coca-cola.svg" },
    { name: "Envato", logo: "/src/assets/client/envato.svg" },
    { name: "Adobe After Effects", logo: "/src/assets/client/aftereffect.svg" },
    { name: "Adobe Card", logo: "/src/assets/client/ae-card.svg" },
    { name: "Graduated", logo: "/src/assets/client/graduated.svg" }
  ];

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-sora font-bold text-2xl sm:text-3xl lg:text-4xl text-text-primary mb-4">
            Companies have hired
          </h2>
          <h3 className="font-sora font-bold text-xl sm:text-2xl lg:text-3xl text-text-secondary mb-4">
            OLLA Learners
          </h3>
          <p className="text-base sm:text-lg text-text-secondary font-inter max-w-2xl mx-auto">
            Our graduates are making waves at leading companies worldwide
          </p>
        </div>

        {/* Company Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 lg:gap-12 items-center justify-items-center">
          {companyLogos.map((company, index) => (
            <div 
              key={index} 
              className="group flex flex-col items-center space-y-3 hover:scale-110 transition-all duration-300"
            >
              {/* Company Logo */}
              <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center p-2">
                <img 
                  src={company.logo} 
                  alt={`${company.name} Logo`} 
                  className="w-full h-full object-contain transition-all duration-300"
                />
              </div>
              
              {/* Company Name */}
              <span className="text-xs lg:text-sm text-text-secondary text-center font-inter font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {company.name}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <p className="text-sm lg:text-base text-text-secondary font-inter">
            Join thousands of learners who have transformed their careers with OLLA
          </p>
        </div>
      </div>
    </section>
  );
};

export default CompaniesHired;
