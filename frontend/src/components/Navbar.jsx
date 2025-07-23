import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onApplyNowClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`w-full bg-white shadow-md relative z-10 transition-all duration-300 ${
      isScrolled 
        ? 'shadow-lg backdrop-blur-md bg-opacity-95' 
        : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="https://allpngfree.com/apf-prod-storage-api/storage/thumbnails/saraswati-png-image-download-thumbnail-1643211966.jpg" 
                  alt="Saraswati School Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h2 className="font-bold text-xl text-gray-800">
                  Saraswati Shiksha
                </h2>
                <p className="text-xs text-gray-600">
                  Niketan Sr. Sec  School , Bandikui
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {[
                { name: 'Home', id: 'home' },
                { name: 'About', id: 'about' },
                { name: 'Toppers', id: 'toppers' },
                { name: 'Admission', id: 'admission' },
                { name: 'Contact', id: 'contact' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="px-3 py-2 text-sm font-medium transition-colors duration-200 text-gray-700 hover:text-blue-800"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* CTA and Login Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={onApplyNowClick}
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Apply Now
            </button>
            <button 
              onClick={() => navigate('/parent/login')}
              className="px-4 py-2 text-sm font-medium rounded-lg border text-blue-800 border-blue-800 hover:bg-blue-800 hover:text-white transition-all duration-200">
              Parents Login
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md transition-colors text-gray-700 hover:text-blue-800"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-1' : ''
                }`}></span>
                <span className={`block w-5 h-0.5 bg-current mt-1 transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`block w-5 h-0.5 bg-current mt-1 transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1' : ''
                }`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden bg-white shadow-lg backdrop-blur-md bg-opacity-95`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {[
            { name: 'Home', id: 'home' },
            { name: 'About', id: 'about' },
            { name: 'Toppers', id: 'toppers' },
            { name: 'Admission', id: 'admission' },
            { name: 'Contact', id: 'contact' }
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.id)}
              className="text-gray-700 hover:text-blue-800 block px-3 py-2 text-base font-medium transition-colors duration-200 w-full text-left"
            >
              {item.name}
            </button>
          ))}
          <div className="px-3 py-2 space-y-3">
            <button
              onClick={() => {
                onApplyNowClick();
                setIsMenuOpen(false);
              }}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
            >
              Apply Now
            </button>
            <button 
              onClick={() => {
                navigate('/parent/login');
                setIsMenuOpen(false);
              }}
              className="w-full text-blue-800 border border-blue-800 hover:bg-blue-800 hover:text-white px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200">
              Parents Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 