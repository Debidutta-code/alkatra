'use client';

import React, { useState, useEffect } from 'react';
import i18next from '../../internationalization/i18n'; // Import i18n configuration
import countryLanguages from '../../internationalization/country-language/country.language.json'; // Import country language data

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

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    setSelectedLanguage(newLang);
    i18next.changeLanguage(newLang); // Update language
  };

  return (
    <div className="language-switcher">
      <select
        value={selectedLanguage}
        onChange={handleLanguageChange}
        className="border rounded-md px-2 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 text-sm"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1rem',
        }}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.flag} {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;