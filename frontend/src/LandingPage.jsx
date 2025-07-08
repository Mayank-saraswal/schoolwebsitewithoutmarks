import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import ToppersSection from './components/ToppersSection';
import QuotesSection from './components/QuotesSection';
import Footer from './components/Footer';
import ApplyNowButton from './components/ApplyNowButton';
import AdmissionModal from './components/AdmissionModal';
import AnnouncementPublicSection from './components/AnnouncementPublicSection';

const LandingPage = () => {
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);

  const openAdmissionModal = () => setIsAdmissionModalOpen(true);
  const closeAdmissionModal = () => setIsAdmissionModalOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection onApplyNowClick={openAdmissionModal} />
      
      {/* About Section Placeholder */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            About Saraswati School
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            हमारा मिशन है गुणवत्तापूर्ण शिक्षा प्रदान करना | Our mission is to provide quality education 
            that empowers students to achieve their dreams and contribute meaningfully to society.
          </p>
        </div>
      </section>
      
      {/* Announcements Section */}
      <AnnouncementPublicSection />
      
      {/* Toppers Section */}
      <ToppersSection onApplyNowClick={openAdmissionModal} />
      
      {/* Quotes Section */}
      <QuotesSection />
      
      {/* Admission Section */}
      <section id="admission" className="py-16 md:py-24 bg-gradient-to-br from-yellow-50 to-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-800 rounded-full mb-6">
            <span className="text-2xl text-yellow-400">📝</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            Admission Open
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            दाखिला खुला है | Join Saraswati School and embark on a journey of academic excellence 
            and personal growth. Limited seats available!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ApplyNowButton 
              onClick={openAdmissionModal}
              variant="large"
              className="shadow-xl"
            >
              Start Online Application
            </ApplyNowButton>
            <button className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
              Contact Admission Office
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
      
      {/* Admission Modal */}
      <AdmissionModal 
        isOpen={isAdmissionModalOpen} 
        onClose={closeAdmissionModal} 
      />
    </div>
  );
};

export default LandingPage; 