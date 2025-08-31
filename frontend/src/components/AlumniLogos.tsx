const AlumniLogos = () => {
  const alumniData = [
    {
      name: "UT Austin",
      logo: "/src/assets/alumni/University_of_Texas_at_Austin_seal.svg.png",
      alt: "University of Texas at Austin"
    },
    {
      name: "IIT Madras",
      logo: "/src/assets/alumni/IIT_Madras_Logo.svg.png",
      alt: "IIT Madras"
    },
    {
      name: "NITT",
      logo: "/src/assets/alumni/NITT_logo.png",
      alt: "NITT"
    },
    {
      name: "Twitter",
      logo: "/src/assets/alumni/twitter.png",
      alt: "Twitter"
    },
    {
      name: "Amazon",
      logo: "/src/assets/alumni/amazon.png",
      alt: "Amazon"
    },
    {
      name: "Google",
      logo: "/src/assets/alumni/google.svg",
      alt: "Google"
    },
    {
      name: "Uber",
      logo: "/src/assets/alumni/uber.png",
      alt: "Uber"
    }
  ];

  return (
    <section className="bg-white py-2 lg:py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-4 lg:mb-6">
          <h2 className="font-sora font-bold text-xl sm:text-2xl lg:text-3xl text-text-primary mb-2">
            Learn from the alumni of
          </h2>
        </div>

        {/* Alumni Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-6 items-center justify-items-center">
          {alumniData.map((alumni, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 group">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 rounded-lg flex items-center justify-center p-2 transition-all duration-300 group-hover:bg-gray-100 group-hover:scale-105">
                <img 
                  src={alumni.logo} 
                  alt={alumni.alt} 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs text-text-secondary text-center font-inter font-medium">
                {alumni.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlumniLogos;
