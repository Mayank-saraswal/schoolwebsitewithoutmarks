import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: '📘', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'Instagram', icon: '📷', href: '#' },
    { name: 'YouTube', icon: '📺', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' }
  ];

  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Our Toppers', href: '#toppers' },
    { name: 'Admission Process', href: '#admission' },
    { name: 'Academic Programs', href: '#programs' },
    { name: 'Faculty', href: '#faculty' },
    { name: 'Events', href: '#events' }
  ];

  const importantLinks = [
    { name: 'Admission Form', href: '#admission' },
    { name: 'Fee Structure', href: '#fees' },
    { name: 'Academic Calendar', href: '#calendar' },
    { name: 'Results', href: '#results' },
    { name: 'Scholarships', href: '#scholarships' },
    { name: 'Career', href: '#career' }
  ];

  return (
    <footer id="contact" className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* School Information */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                  src="https://allpngfree.com/apf-prod-storage-api/storage/thumbnails/saraswati-png-image-download-thumbnail-1643211966.jpg" 
                  alt="Saraswati School Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                        <h3 className="text-2xl font-bold text-white">Saraswati School</h3>
        <p className="text-blue-200 text-sm">ज्ञान की देवी | Goddess of Knowledge</p>
              </div>
            </div>
            
            <p className="text-blue-200 mb-6 leading-relaxed">
              हमारा लक्ष्य है प्रत्येक छात्र को सर्वोत्तम शिक्षा प्रदान करना और उन्हें भविष्य के लिए तैयार करना। 
              We are committed to providing quality education that nurtures young minds and prepares them for a successful future.
            </p>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-400 text-xl">📍</span>
                <div>
                  <p className="font-semibold">Address | पता</p>
                  <p className="text-blue-200 text-sm">
                    123 Education Street, Knowledge City<br />
                    New Delhi - 110001, India
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-yellow-400 text-xl">📞</span>
                <div>
                  <p className="font-semibold">Phone | फोन</p>
                  <p className="text-blue-200 text-sm">+91 11 2345 6789</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-yellow-400 text-xl">📧</span>
                <div>
                  <p className="font-semibold">Email | ईमेल</p>
                  <p className="text-blue-200 text-sm">info@saraswatischool.edu.in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-yellow-400">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-blue-200 hover:text-yellow-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-yellow-400">Important Links</h4>
            <ul className="space-y-3">
              {importantLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-blue-200 hover:text-yellow-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* School Timing */}
        <div className="mt-12 pt-8 border-t border-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-400 mb-2">School Timing</h5>
              <p className="text-blue-200 text-sm">Monday - Friday: 7:30 AM - 2:30 PM</p>
              <p className="text-blue-200 text-sm">Saturday: 7:30 AM - 12:30 PM</p>
            </div>
            
            <div className="bg-blue-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-400 mb-2">Office Hours</h5>
              <p className="text-blue-200 text-sm">Monday - Friday: 8:00 AM - 4:00 PM</p>
              <p className="text-blue-200 text-sm">Saturday: 8:00 AM - 1:00 PM</p>
            </div>
            
            <div className="bg-blue-800/50 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-400 mb-2">Emergency Contact</h5>
              <p className="text-blue-200 text-sm">24/7 Helpline: +91 98765 43210</p>
              <p className="text-blue-200 text-sm">Principal: +91 98765 43211</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media & Bottom Bar */}
      <div className="border-t border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <span className="text-blue-200 text-sm">Follow us:</span>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="bg-blue-800 hover:bg-yellow-500 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                    aria-label={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="flex items-center space-x-3">
              <span className="text-blue-200 text-sm">Get Updates:</span>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-blue-800 text-white placeholder-blue-300 px-4 py-2 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

                {/* Copyright Bar */}
          <div className="bg-blue-900 border-t border-blue-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                <p className="text-blue-200 text-sm">
                  © {currentYear} Saraswati School. All rights reserved. | सभी अधिकार सुरक्षित।
                </p>
                <div className="flex space-x-4 mt-2 md:mt-0">
                  <a href="#privacy" className="text-blue-200 hover:text-yellow-400 text-sm transition-colors duration-200">
                    Privacy Policy
                  </a>
                  <a href="#terms" className="text-blue-200 hover:text-yellow-400 text-sm transition-colors duration-200">
                    Terms of Service
                  </a>
                  <a href="/admin" className="text-blue-200 hover:text-yellow-400 text-sm transition-colors duration-200">
                    Admin Login
                  </a>
                  <a href="#sitemap" className="text-blue-200 hover:text-yellow-400 text-sm transition-colors duration-200">
                    Sitemap
                  </a>
                </div>
              </div>
            </div>
          </div>
    </footer>
  );
};

export default Footer; 