'use client';

import React, { useState, useEffect } from 'react';
import i18next from '../../internationalization/i18n';
import countryLanguages from '../../internationalization/country-language/country.language.json';
import { ChevronDown } from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

// Transform JSON data into LanguageOption array
const languageOptions: LanguageOption[] = Object.values(countryLanguages).map((lang) => ({
  code: lang.code,
  name: lang.name,
  flag: lang.flag,
}));

const LanguageSwitcher: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18next.language || 'en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Sync state with i18next language on mount
    setSelectedLanguage(i18next.language);
    // Set initial document direction for RTL support
    document.documentElement.dir = i18next.language === 'ar' ? 'rtl' : 'ltr';
    // Update direction on language change
    const handleLanguageChange = () => {
      document.documentElement.dir = i18next.language === 'ar' ? 'rtl' : 'ltr';
    };
    i18next.on('languageChanged', handleLanguageChange);
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18next.changeLanguage(langCode); // Update language
    setIsOpen(false);
  };

  // Get current language option
  const currentLanguage = languageOptions.find(lang => lang.code === selectedLanguage) || languageOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-tripswift-blue text-sm p-2 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span>{currentLanguage.flag} {currentLanguage.name}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white shadow-md rounded-md overflow-hidden z-50 min-w-[150px]">
          {languageOptions.map((option) => (
            <div
              key={option.code}
              onClick={() => handleLanguageChange(option.code)}
              className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${
                option.code === selectedLanguage 
                  ? 'bg-gray-100 text-tripswift-blue' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span>{option.flag}</span>
              <span>{option.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;