'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Globe, ChevronDown, Settings, HelpCircle, LogOut, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@nextui-org/react';
import { logout, getUser } from '@/Redux/slices/auth.slice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18next from '../../i18n/Index';

import Home from '@/components/assets/modern-house.png';
import Globe from '@/components/assets/globe.png';
import MTrip from '@/components/assets/traveling.png';
import Logo from '../assets/TRIP-1-Copy.png';
import LanguageSwitcher from '../Language-Switcher/LanguageSwitcher';

// Define RootState type based on your store's state shape
import i18next from '../../internationalization/i18n';

// Define types
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

interface RootState {
  auth: {
    user: UserType | null;
  };
}

interface UserType {
  firstName: string;
  lastName: string;
  email: string;
}

type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

import MTrip from '@/components/assets/traveling.png';
import Logo from '../assets/TRIP-1.png';
import LanguageSwitcher from '../Language-Switcher/LanguageSwitcher';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = Cookies.get('accessToken');

  // Define handleScroll at the component top level
  const handleScroll = useCallback(() => {
    if (window.scrollY > 10) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  }, []);
  
  // Handle scroll effect for shadow
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // RTL handling
  useEffect(() => {
    document.documentElement.dir = i18next.language === 'ar' ? 'rtl' : 'ltr';
    const handleLanguageChange = () => {
      document.documentElement.dir = i18next.language === 'ar' ? 'rtl' : 'ltr';
    };
    i18next.on('languageChanged', handleLanguageChange);
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleMyTripClick = () => {
    if (accessToken) {
      router.push('/my-trip');
    } else {
      toast.error(t('Navbar.pleaseLogin'));
    }
  };

  useEffect(() => {
    if (accessToken) {
      dispatch(getUser() as any);
    }
  }, [dispatch, accessToken]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    toast.success(t('Navbar.logoutSuccess'));
    dispatch(logout() as any);
    router.push('/');
  };

  const handleSignup = () => {
    router.push('/register');
  };

  const handleLogin = () => {
    Cookies.set('redirectAfterLogin', window.location.href);
    router.push('/login');
  };

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-tripswift-off-white/85 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)]' 
          : 'bg-tripswift-off-white border-b border-tripswift-black/5'
      } ${pathname === '/login' || pathname === '/register' ? 'hidden' : ''}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center relative z-10 group"
        >
          <div className="overflow-hidden">
            <Image
              src={Logo}
              width={224}
              height={56}
              alt="TripSwift - Redifines Hospitality Technology"
              className="h-14 w-auto transform transition-transform group-hover:scale-105 duration-300"
              priority
              style={{
                maxHeight: '56px',
                objectFit: 'contain',
                objectPosition: 'left center',
              }}
            />
          </div>
        </Link>

        {/* Hamburger Icon for Mobile */}
        <div
          role="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="lg:hidden cursor-pointer z-50 relative"
          onClick={toggleMenu}
        >          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-tripswift-off-white ${isMenuOpen ? 'shadow-inner' : 'shadow-sm'} transition-all duration-300`}>
            {isMenuOpen ? (
              <X size={20} className="text-tripswift-blue" />
            ) : (
              <Menu size={20} className="text-tripswift-black" />
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Language Switcher */}
          <div className="w-auto">
            <LanguageSwitcher />
          </div>

          {/* Become a Host */}
          <div
            onClick={() => (window.location.href = process.env.NEXT_PUBLIC_EXTRANET_URL || '')}
            className="flex items-center cursor-pointer px-3 py-2 rounded-full text-tripswift-black hover:text-tripswift-blue hover:bg-tripswift-blue/5 text-[15px] leading-[20px] tracking-tight font-tripswift-medium transition-all duration-300"
          >
            <Globe size={16} className="mr-2 text-tripswift-blue" />
            <span>{t('Navbar.becomeHost')}</span>
          </div>

          {/* My Trip */}
          <div
            onClick={handleMyTripClick}
            className="flex items-center cursor-pointer px-3 py-2 rounded-full text-tripswift-black hover:text-tripswift-blue hover:bg-tripswift-blue/5 text-[15px] leading-[20px] tracking-tight font-tripswift-medium transition-all duration-300"          
          >
            <Image src={MTrip} width={16} height={16} alt={t('Navbar.myTrip')} className="mr-2" />
            <span>{t('Navbar.myTrip')}</span>
          </div>

          {/* User Profile */}
          {user ? (
            <Dropdown placement="bottom-end" classNames={{
              content: "p-0 shadow-xl border border-tripswift-black/5 rounded-xl overflow-hidden",
            }}>
              <DropdownTrigger>
                <div className="flex items-center gap-2 cursor-pointer bg-tripswift-black/5 hover:bg-tripswift-blue/10 transition-colors duration-300 px-2 py-1.5 rounded-full">
                  <Avatar
                    isBordered
                    size="sm"
                    color="primary"
                    className="transition-transform"
                    src={user.firstName.charAt(0) + user.lastName.charAt(0)}
                    fallback={
                      <p className="text-lg font-tripswift-bold text-tripswift-off-white">
                        {user.firstName.charAt(0)}
                      </p>
                    }
                  />
                  <span className="text-[15px] leading-[20px] tracking-tight text-tripswift-black font-tripswift-medium">
                    {`${user.firstName}`}
                  </span>
                  <ChevronDown size={16} className="text-tripswift-black/60" />
                </div>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="User Actions" 
                variant="flat"
                className="p-2 min-w-[240px]"
              >
                <DropdownItem 
                  key="profile-header" 
                  className="h-auto py-3 opacity-100 cursor-default"
                  textValue="Profile header"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-[16px] font-tripswift-bold text-tripswift-black leading-tight">
                      {`${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-xs text-tripswift-black/60 font-tripswift-medium">
                      {user.email}
                    </p>
                  </div>
                </DropdownItem>
                <DropdownItem key="separator" className="h-px bg-tripswift-black/10 my-1" />
                <DropdownItem 
                  key="profile-settings" 
                  onClick={() => router.push('/profile')}
                  startContent={<User size={16} className="text-tripswift-blue" />}
                  className="py-2.5 text-[14px] font-tripswift-medium"
                >
                  {t('Navbar.profileSettings')}
                </DropdownItem>
                <DropdownItem 
                  key="help-feedback"
                  startContent={<HelpCircle size={16} className="text-tripswift-blue" />}
                  className="py-2.5 text-[14px] font-tripswift-medium"
                >
                  {t('Navbar.helpFeedback')}
                </DropdownItem>
                <DropdownItem 
                  key="logout" 
                  onClick={handleLogout}
                  startContent={<LogOut size={16} className="text-red-500" />}
                  className="py-2.5 text-[14px] font-tripswift-medium text-red-600"
                >
                  {t('Navbar.logout')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogin}
                className="cursor-pointer text-tripswift-black hover:text-tripswift-blue text-[15px] leading-[20px] tracking-tight font-tripswift-medium px-4 py-2 rounded-full hover:bg-tripswift-blue/5 transition-all duration-300"
              >
                {t('Navbar.login')}
              </button>
              <button
                onClick={handleSignup}
                className="cursor-pointer relative overflow-hidden group text-[15px] leading-[20px] tracking-tight font-tripswift-medium px-5 py-2.5 rounded-full text-white shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-tripswift-blue to-[#054B8F]"
              >
                <span className="relative z-10">{t('Navbar.signUp')}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#054B8F] to-tripswift-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-tripswift-off-white border-t border-tripswift-black/10 py-4 px-4 shadow-md absolute w-full left-0 top-20 z-10 transition-all duration-300 animate-in slide-in-from-top-5">
          <div className="flex flex-col space-y-4">
            {/* Language Switcher */}
            <div className="py-2">
              <LanguageSwitcher />
            </div>

            {/* Become a Host */}
            <Link
              href={process.env.NEXT_PUBLIC_EXTRANET_URL || ''}
              className="flex items-center gap-2 py-2 px-1 hover:bg-tripswift-blue hover:bg-opacity-10 rounded"
            >
              <Globe size={18} className="text-tripswift-blue" />
              <span className="text-tripswift-black font-tripswift-medium text-[14px] leading-[18px] tracking-[0px]">
                {t('Navbar.becomeHost')}
              </span>
            </Link>

            {/* My Trip */}
            <div
              onClick={handleMyTripClick}
              className="flex items-center gap-2 py-2 px-1 hover:bg-tripswift-blue hover:bg-opacity-10 rounded cursor-pointer"
            >
              <Image src={MTrip} width={18} height={18} alt={t('Navbar.myTrip')} />
              <span className="text-tripswift-black font-tripswift-medium text-[14px] leading-[18px] tracking-[0px]">
                {t('Navbar.myTrip')}
              </span>
            </div>

            {/* Auth Options */}
            {!user ? (
              <div className="pt-2 border-t border-tripswift-black/10 flex flex-col gap-3 mt-2">
                <div
                  onClick={handleLogin}
                  className="cursor-pointer py-2 text-tripswift-black hover:text-tripswift-blue font-tripswift-medium text-[14px] leading-[18px] tracking-[0px]"
                >
                  {t('Navbar.login')}
                </div>
                <div
                  onClick={handleSignup}
                  className="cursor-pointer btn-tripswift-primary text-[16px] leading-[20px] tracking-[2px] font-tripswift-medium px-4 py-2 rounded-md hover:shadow-md transition-all duration-300"
                >
                  {t('Navbar.signUp')}
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-tripswift-black/10 flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-3 py-2">
                  <Avatar
                    size="sm"
                    className="bg-tripswift-blue text-tripswift-off-white"
                    src=""
                  />
                  <div>
                    <p className="text-[18px] leading-[23px] tracking-[0px] text-tripswift-black font-tripswift-medium">
                      {`${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-[14px] leading-[18px] tracking-[2px] text-tripswift-black/70 font-tripswift-medium">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => router.push('/profile')}
                  className="cursor-pointer py-2 px-1 text-tripswift-black hover:bg-tripswift-blue hover:bg-opacity-10 rounded font-tripswift-medium text-[14px] leading-[18px] tracking-[0px]"
                >
                  {t('Navbar.profileSettings')}
                </div>
                <div
                  className="cursor-pointer py-2 px-1 text-tripswift-black hover:bg-tripswift-blue hover:bg-opacity-10 rounded font-tripswift-medium text-[14px] leading-[18px] tracking-[0px]"
                >
                  {t('Navbar.helpFeedback')}
                </div>
                <div
                  onClick={handleLogout}
                  className="cursor-pointer py-2 px-1 text-[#EF4444] hover:bg-tripswift-blue hover:bg-opacity-10 rounded font-tripswift-medium text-[14px] leading-[18px] tracking-[0px]"
                >
                  {t('Navbar.logout')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;