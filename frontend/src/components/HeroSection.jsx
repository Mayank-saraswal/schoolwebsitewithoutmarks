import React from 'react';

const HeroSection = ({ onApplyNowClick }) => {
  const scrollToAdmission = () => {
    const admissionSection = document.getElementById('admission');
    if (admissionSection) {
      admissionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-900/90"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-8">
          {/* School Name */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Saraswati School
            </h1>
            <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
          </div>
          
          {/* Motto */}
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl md:text-3xl text-yellow-400 font-semibold">
              शिक्षा से सफलता
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 font-medium">
              ज्ञान की देवी | Goddess of Knowledge
            </p>
          </div>
          
          {/* Motivational Quote */}
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-lg sm:text-xl md:text-2xl text-white font-light leading-relaxed italic">
              "शिक्षा का अर्थ है व्यक्ति में निहित पूर्णता का विकास करना"
            </blockquote>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-2 font-light italic">
              "Education means bringing out the perfection already in man"
            </p>
            <cite className="text-yellow-400 text-sm sm:text-base font-medium mt-4 block">
              - Swami Vivekananda
            </cite>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button
              onClick={onApplyNowClick}
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Start Admission
            </button>
            <button
              onClick={() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Learn More
            </button>
          </div>
          
          {/* Scroll Indicator */}
          <div className="pt-12">
            <div className="animate-bounce">
              <svg 
                className="w-6 h-6 text-white mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </div>
            <p className="text-gray-300 text-sm mt-2">Scroll to explore</p>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-8 animate-pulse">
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
      </div>
      <div className="absolute top-1/3 right-12 animate-pulse delay-1000">
        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
      </div>
      <div className="absolute bottom-1/4 left-16 animate-pulse delay-500">
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
      </div>
    </section>
  );
};

export default HeroSection; 