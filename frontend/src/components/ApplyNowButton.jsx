import React from 'react';

const ApplyNowButton = ({ onClick, className = "", children = "Apply Now", variant = "primary" }) => {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-yellow-500 hover:bg-yellow-600 text-blue-900 focus:ring-yellow-500",
    secondary: "border-2 border-white text-white hover:bg-white hover:text-blue-900 focus:ring-white",
    large: "bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-8 py-4 text-lg font-bold focus:ring-yellow-500"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      type="button"
    >
      <span className="flex items-center space-x-2">
        <span>{children}</span>
        <svg 
          className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </span>
    </button>
  );
};

export default ApplyNowButton; 