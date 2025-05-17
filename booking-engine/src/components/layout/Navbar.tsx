'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
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
interface RootState {
  auth: {
    user: UserType | null;
  };
}

// Define UserType
interface UserType {
  firstName: string;
  lastName: string;
  email: string;
}

// Define AppDispatch type
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

const Navbar: React.FC = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = Cookies.get('accessToken');

  // Set document direction based on language (RTL for Arabic)
  useEffect(() => {
    document.documentElement.dir = i18next.language === 'ar' ? 'rtl' : 'ltr';
    // Sync language change to update direction
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

  const closeMenu = () => {
    setIsMenuOpen(false);
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
      className={`bg-white shadow sticky top-0 z-20 ${
        pathname === '/login' || pathname === '/register' ? 'hidden' : ''
      }`}
    >
      <div className="flex z-50 items-center justify-between px-6 py-4">
        <Link href="/">
          <Image src={Logo} width={70} height={35} alt="Logo" />
        </Link>

        {/* Hamburger Icon for Mobile */}
        <div className="lg:hidden cursor-pointer z-10" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} className="text-black" /> : <Menu size={24} />}
        </div>

        <div className={`lg:flex items-center ${isMenuOpen ? 'block' : 'hidden'} lg:block`}>
          <ul className="lg:flex items-center gap-4 mt-4 lg:mt-0">
            <LanguageSwitcher />
            <li
              className="flex items-center gap-2 p-2 border rounded-lg hover:border-gray-500 transition cursor-pointer"
              onClick={() => (window.location.href = process.env.NEXT_PUBLIC_PMS_URL || '')}
            >
              <Image src={Globe} width={24} height={24} alt={t('Navbar.becomeHost')} />
              <span className="text-black text-sm font-medium">{t('Navbar.becomeHost')}</span>
            </li>

            <li
              className="flex items-center gap-2 p-2 border rounded-lg hover:border-gray-500 transition cursor-pointer"
              onClick={handleMyTripClick}
            >
              <Image src={MTrip} width={24} height={24} alt={t('Navbar.myTrip')} />
              <span className="text-black text-sm font-medium">{t('Navbar.myTrip')}</span>
            </li>

            {user ? (
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <User
                    as="button"
                    avatarProps={{ isBordered: true, src: '' }}
                    className="transition-transform"
                    description={`${user.email}`}
                    name={`${user.firstName} ${user.lastName}`}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions" variant="flat">
                  <DropdownItem key="profile-settings" onClick={() => router.push('/profile')}>
                    {t('Navbar.profileSettings')}
                  </DropdownItem>
                  <DropdownItem key="help-feedback">{t('Navbar.helpFeedback')}</DropdownItem>
                  <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                    {t('Navbar.logout')}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="lg:block transition-transform sm:hidden"
                    src=""
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="sign-up" onClick={handleSignup}>
                    {t('Navbar.signUp')}
                  </DropdownItem>
                  <DropdownItem key="login" onClick={handleLogin}>
                    {t('Navbar.login')}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </ul>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-100 h-full mt-[-8px] w-full absolute top-2 z-10">
          <ul className="flex flex-col gap-3 items-center">
            <div onClick={closeMenu} className="absolute top-4 right-4 cursor-pointer">
              <X size={24} />
            </div>

            <ul className="flex flex-col mt-5 space-y-4">
              <LanguageSwitcher />
              <li className="flex items-center p-3 border-2 rounded-lg hover:border-gray-500 transition">
                <Link href="/become-host">
                  <Image src={Globe} width={24} height={24} alt={t('Navbar.becomeHost')} />
                </Link>
                <Link
                  href={`${process.env.NEXT_PUBLIC_PMS_URL}`}
                  className="text-black ml-2 text-sm font-medium"
                >
                  {t('Navbar.becomeHost')}
                </Link>
              </li>

              <li className="flex items-center gap-2 p-2 border rounded-lg hover:border-gray-500 transition">
                <Image src={MTrip} width={24} height={24} alt={t('Navbar.myTrip')} />
                <button onClick={handleMyTripClick} className="text-black text-sm font-medium">
                  {t('Navbar.myTrip')}
                </button>
              </li>
            </ul>

            {user ? (
              <Dropdown placement="bottom-start">
                <DropdownTrigger>
                  <User
                    as="button"
                    avatarProps={{ isBordered: true, src: '' }}
                    className="transition-transform"
                    description={`${user.email}`}
                    name={`${user.firstName} ${user.lastName}`}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions" variant="flat">
                  <DropdownItem key="profile-settings">{t('Navbar.profileSettings')}</DropdownItem>
                  <DropdownItem key="help-feedback">{t('Navbar.helpFeedback')}</DropdownItem>
                  <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                    {t('Navbar.logout')}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar isBordered as="button" className="transition-transform" src="" />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="sign-up" onClick={handleSignup}>
                    {t('Navbar.signUp')}
                  </DropdownItem>
                  <DropdownItem key="login" onClick={handleLogin}>
                    {t('Navbar.login')}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;