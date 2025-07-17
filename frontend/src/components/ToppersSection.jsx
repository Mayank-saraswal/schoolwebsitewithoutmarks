import React, { useState } from 'react';

const ToppersSection = ({ onApplyNowClick }) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedStream, setSelectedStream] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const toppers = [
    {
      id: 1,
      name: "",
      score: "",
      subject: "",
      image: "images/topper1.jpg",
      achievement: "",
      year: "2024"
    },
    {
      id: 2,
      name: "l",
      score: "97.8%",
      subject: "",
      image: "images/topper2.jpg",
      achievement: "",
      year: "2024"
    },
    {
      id: 3,
      name: "",
      score: "96.9%",
      subject: "",
      image: "images/topper3.jpg",
      achievement: "School Topper",
      year: "2024"
    },
    {
      id: 4,
      name: "",
      score: "",
      subject: "",
      image: "images/topper4.jpg",
      achievement: "",
      year: "2024"
    },
    {
      id: 5,
      name: "",
      score: "97.5%",
      subject: "",
      image: "images/topper5.jpg",
      achievement: "",
      year: "2024"
    },
    {
      id: 6,
      name: "",
      score: "96.7%",
      subject: " ",
      image: "images/topper6.jpg",
      achievement: "",
      year: "2023"
    },
    {
      id: 7,
      name: "",
      score: "98.1%",
      subject: "",
      image: "images/topper7.jpg",
      achievement: "",
      year: "2024"
    },
    {
      id: 8,
      name: "",
      score: "97.3%",
      subject: "",
      image: "images/topper8.jpg",
      achievement: "",
      year: "2024"
    },
    {
      id: 9,
      name: "",
      score: "96.5%",
      subject: "Arts Stream",
      image: "images/topper9.jpg",
      achievement: "Creative Arts",
      year: "2023"
    },
    {
      id: 10,
      name: "",
      score: "97.9%",
      subject: "Science Stream",
      image: "images/topper10.jpg",
      achievement: "Physics Olympiad",
      year: "2024"
    },
    {
      id: 11,
      name: "",
      score: "96.8%",
      subject: "",
      image: "images/topper11.jpg",
      achievement: "",
      year: "2024"
    },
    {
      id: 12,
      name: "",
      score: "97.6%",
      subject: "",
      image: "images/topper12.jpg",
      achievement: "",
      year: "2023"
    },
    {
      id: 13,
      name: "",
      score: "96.4%",
      subject: "",
      image: "images/topper13.jpg",
      achievement: "",
      year: "2024"
    },
    {
      id: 14,
      name: "",
      score: "97.1%",
      subject: "",
      image: "images/topper14.jpg",
      achievement: "",
      year: "2024"
    },
    {
      id: 15,
      name: "",
      score: "98.0%",
      subject: "",
      image: "images/topper15.jpg",
      achievement: "",
      year: "2024"
    },
    
  
  ];

  return (
    <section id="toppers" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-6">
            <span className="text-2xl">🏆</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Our School Toppers
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            हमारे गर्व के छात्र | Celebrating our outstanding achievers who have made us proud with their exceptional performance
          </p>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-900 mb-2">20</div>
            <div className="text-sm text-blue-700">Total Toppers</div>
          </div>
          <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-900 mb-2">98.5%</div>
            <div className="text-sm text-green-700">Highest Score</div>
          </div>
          <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-900 mb-2">5</div>
            <div className="text-sm text-yellow-700">State/National</div>
          </div>
          <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-900 mb-2">3</div>
            <div className="text-sm text-purple-700">Different Streams</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">Stream:</span>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Streams</option>
              <option value="Science Stream">Science</option>
              <option value="Commerce Stream">Commerce</option>
              <option value="Arts Stream">Arts</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSelectedStream('All');
              setSelectedYear('All');
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>

        {/* Toppers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {(() => {
            // Filter toppers based on selected stream and year
            let filteredToppers = toppers.filter(topper => {
              const streamMatch = selectedStream === 'All' || topper.subject === selectedStream;
              const yearMatch = selectedYear === 'All' || topper.year === selectedYear;
              return streamMatch && yearMatch;
            });
            
            // Apply show all/limited display
            const displayToppers = showAll ? filteredToppers : filteredToppers.slice(0, 8);
            
            return displayToppers.map((topper, index) => (
            <div
              key={topper.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Card Header with Achievement Badge */}
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-yellow-500 text-blue-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {topper.achievement}
                  </span>
                </div>
                
                {/* Profile Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={topper.image}
                    alt={topper.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {topper.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {topper.subject}
                  </p>
                  
                  {/* Score Display */}
                  <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-4 mb-4">
                    <div className="text-3xl font-bold mb-1">
                      {topper.score}
                    </div>
                    <div className="text-sm text-blue-200">
                      Class XII - {topper.year}
                    </div>
                  </div>
                  
                  {/* Achievement Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-xs text-gray-600">Saraswati</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl mb-1">⭐</div>
                      <div className="text-xs text-gray-600">Leadership</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-400 rounded-2xl transition-colors duration-300"></div>
            </div>
            ));
          })()}
        </div>

        {/* Show More Button */}
        <div className="text-center mt-12">
          {(() => {
            // Calculate filtered count for button text
            let filteredToppers = toppers.filter(topper => {
              const streamMatch = selectedStream === 'All' || topper.subject === selectedStream;
              const yearMatch = selectedYear === 'All' || topper.year === selectedYear;
              return streamMatch && yearMatch;
            });
            
            return (
              <>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mr-4"
                >
                  {showAll ? 'Show Less Toppers' : `View All ${filteredToppers.length} Toppers`}
                </button>
                <span className="text-gray-500 text-sm">
                  {showAll 
                    ? `Showing all ${filteredToppers.length} achievers` 
                    : `Showing ${Math.min(8, filteredToppers.length)} of ${filteredToppers.length} toppers`
                  }
                </span>
              </>
            );
          })()}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Ready to join our success story?
          </p>
          <button
            onClick={onApplyNowClick}
            className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Apply for Admission
          </button>
        </div>
      </div>
    </section>
  );
};

export default ToppersSection; 