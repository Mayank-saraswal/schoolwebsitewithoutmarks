import React, { useState, useEffect } from 'react';

const QuotesSection = () => {
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    {
      id: 1,
      hindi: "शिक्षा मनुष्य में निहित पूर्णता की अभिव्यक्ति है।",
      english: "Education is the manifestation of the perfection already in man.",
      author: "Swami Vivekananda",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      icon: "🧘‍♂️"
    },
    {
      id: 2,
      hindi: "सपने वो नहीं जो आप सोते समय देखते हैं, सपने वो हैं जो आपको सोने नहीं देते।",
      english: "Dreams are not what you see in sleep, dreams are the things that don't let you sleep.",
      author: "Dr. APJ Abdul Kalam",
      authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      icon: "🚀"
    },
    {
      id: 3,
      hindi: "शिक्षा सबसे शक्तिशाली हथियार है जिससे आप दुनिया को बदल सकते हैं।",
      english: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
      authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      icon: "✊"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  const goToQuote = (index) => {
    setCurrentQuote(index);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-yellow-400 rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 border border-yellow-400 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 border border-yellow-400 rounded-full"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 border border-yellow-400 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-6">
            <span className="text-2xl">💡</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Inspiring Quotes
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
            प्रेरणादायक विचार | Words of wisdom from great minds that continue to inspire generations
          </p>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Quote Display */}
        <div className="relative">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
            <div className="text-center">
              {/* Quote Icon */}
              <div className="text-6xl mb-8 opacity-80">
                {quotes[currentQuote].icon}
              </div>

              {/* Hindi Quote */}
              <blockquote className="text-xl sm:text-2xl md:text-3xl font-light text-white leading-relaxed mb-6">
                "{quotes[currentQuote].hindi}"
              </blockquote>

              {/* English Quote */}
              <blockquote className="text-lg sm:text-xl md:text-2xl font-light text-blue-200 leading-relaxed mb-8 italic">
                "{quotes[currentQuote].english}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400">
                  <img
                    src={quotes[currentQuote].authorImage}
                    alt={quotes[currentQuote].author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <cite className="text-yellow-400 text-lg sm:text-xl font-semibold not-italic">
                  - {quotes[currentQuote].author}
                </cite>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-3 mt-8">
            {quotes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuote(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentQuote
                    ? 'bg-yellow-400 w-8'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to quote ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => goToQuote(currentQuote === 0 ? quotes.length - 1 : currentQuote - 1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
            aria-label="Previous quote"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => goToQuote((currentQuote + 1) % quotes.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
            aria-label="Next quote"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Quote Counter */}
        <div className="text-center mt-8">
          <span className="text-blue-200 text-sm">
            {currentQuote + 1} of {quotes.length}
          </span>
        </div>
      </div>
    </section>
  );
};

export default QuotesSection; 