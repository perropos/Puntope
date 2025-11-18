import React, { useState } from 'react';
import { NewsCategory } from '../types';

interface HeaderProps {
  currentCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
}

const Header: React.FC<HeaderProps> = ({ currentCategory, onCategoryChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 py-4 transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-soft border border-white/50">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onCategoryChange(NewsCategory.PORTADA)}
          >
             <div className="w-10 h-10 bg-theme-dark rounded-full flex items-center justify-center text-white shadow-lg">
               <span className="font-heading font-black text-lg">PP</span>
             </div>
             <span className="font-heading font-bold text-lg text-theme-dark tracking-tight hidden lg:block">
               PUNTO PE
             </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {Object.values(NewsCategory).map((category) => {
                const isActive = currentCategory === category;
                // Shorten names for menu if needed
                let label: string = category;
                if (category === NewsCategory.SEGURIDAD) label = "Seguridad";
                if (category === NewsCategory.ELECCIONES) label = "Elecciones";

                return (
                  <li key={category}>
                    <button
                      onClick={() => onCategoryChange(category)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                        isActive
                          ? 'bg-theme-dark text-white shadow-md transform scale-105'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-theme-dark'
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-theme-dark bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
                {isMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
            <div className="lg:hidden mt-4 bg-white rounded-3xl shadow-2xl p-4 border border-gray-100 animate-fade-in">
                <ul className="grid grid-cols-1 gap-2">
                {Object.values(NewsCategory).map((category) => (
                    <li key={category}>
                        <button
                        onClick={() => {
                            onCategoryChange(category);
                            setIsMenuOpen(false);
                        }}
                        className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold uppercase ${
                            currentCategory === category ? 'bg-theme-dark text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        >
                        {category}
                        </button>
                    </li>
                ))}
                </ul>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;