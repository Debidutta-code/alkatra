import React, { useState, useEffect } from 'react';
import i18next from '../../i18n/Index';
import flags from '../../i18n/flags.json';
import { ChevronDown } from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const languageOptions: LanguageOption[] = Object.values(flags).map((lang) => ({
  code: lang.code,
  name: lang.name,
  flag: lang.flag,
}));

const LanguageSwitcher: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const initialLang = i18next.language || 'en';

    // Ensure fallback is also reflected in state
    const fallbackLang =
      languageOptions.find((l) => l.code === initialLang) ? initialLang : 'en';

    setSelectedLanguage(fallbackLang);
    document.documentElement.dir = fallbackLang === 'ar' ? 'rtl' : 'ltr';

    const handleLanguageChange = () => {
      const newLang = i18next.language;
      setSelectedLanguage(newLang);
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    i18next.on('languageChanged', handleLanguageChange);
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);


  const selectedOption = languageOptions.find((l) => l.code === selectedLanguage);
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 border rounded-lg hover:border-gray-500 transition cursor-pointer h-[40px]"
      >
        {selectedOption && (
          <img
            src={selectedOption.flag}
            alt={`${selectedOption.name} flag`}
            className="w-5 h-5 rounded-sm"
          />
        )}
        <span className="text-black text-sm font-medium">
          {selectedOption?.name || 'English'}
        </span>
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
          {languageOptions.map((option) => (
            <li
              key={option.code}
              onClick={() => handleLanguageChange(option.code)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
            >
              <img
                src={option.flag}
                alt={`${option.name} flag`}
                className="w-5 h-5 rounded-sm"
              />
              <span className="text-black text-sm font-medium">{option.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;