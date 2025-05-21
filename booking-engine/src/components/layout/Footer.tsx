"use client";
import Image from "next/image";
import React from "react";
import img from "../assets/TRIP-1.png"; // Make sure this path is correct
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next"; // Import useTranslation

type Props = {};

const Footer = (props: Props) => {
  const pathname = usePathname();
  const { t } = useTranslation(); // Initialize useTranslation hook

  const isFooterVisible = pathname !== "/my-trip" && pathname !== "/login" && pathname !== "/register";

  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <>
      {isFooterVisible && (
        <div className="flex flex-col mt-10 bg-tripswift-black w-full py-6 px-6 md:px-12 text-tripswift-off-white">
          <header className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Logo Section */}
            <div className="flex items-start">
              <Image
                src={img}
                width={170}
                height={20}
                alt="TripSwift - Redefines Hospitality Technology" // Consider adding translation for alt text if needed
                className="object-contain"
              />
            </div>
  
            {/* Navigation Sections */}
            <div className="flex flex-col md:flex-row md:space-x-10 md:items-start">
              {/* Company Section */}
              <div className="flex flex-col p-2 cursor-pointer">
                <header className="text-lg font-tripswift-extrabold mb-4">{t('Footer.companyTitle')}</header>
                <Link
                  href="/about-us"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.aboutUs')}
                </Link>
                <Link
                  href="/why-choose-us"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.whyChooseUs')}
                </Link>
                <Link
                  href="/pricing"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.pricing')}
                </Link>
                <Link
                  href="/testimonials"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.testimonials')}
                </Link>
              </div>
  
              {/* Resources Section */}
              <div className="flex flex-col p-2 cursor-pointer">
                <header className="text-lg font-tripswift-extrabold mb-4">{t('Footer.resourcesTitle')}</header>
                <Link
                  href="/privacy"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.privacyPolicy')}
                </Link>
                <Link
                  href="/terms"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.termsAndConditions')}
                </Link>
                <Link
                  href="/blog"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.blog')}
                </Link>
                <Link
                  href="/contact"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.contactUs')}
                </Link>
              </div>
  
              {/* Product Section */}
              <div className="flex flex-col p-2 cursor-pointer">
                <header className="text-lg font-tripswift-extrabold mb-4">{t('Footer.productTitle')}</header>
                <Link
                  href="/project-management"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.projectManagement')}
                </Link>
                <Link
                  href="/time-tracker"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.timeTracker')}
                </Link>
                <Link
                  href="/time-schedule"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.timeSchedule')}
                </Link>
                <Link
                  href="/lead-generation"
                  className="text-base mb-2 hover:underline text-tripswift-off-white/80 hover:text-tripswift-blue font-tripswift-regular"
                >
                  {t('Footer.leadGeneration')}
                </Link>
              </div>
            </div>
          </header>
  
          {/* Subscription Section */}
          <div className="flex flex-col md:flex-row md:items-center mt-6 md:mt-6 w-full md:w-auto">
            <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-64">
                <input
                  type="email"
                  placeholder={t('Footer.emailPlaceholder')}
                  className="border border-tripswift-off-white/30 bg-tripswift-black/20 rounded px-4 py-2 w-full text-tripswift-off-white placeholder-tripswift-off-white/50 focus:outline-none focus:border-tripswift-blue font-tripswift-regular"
                />
              </div>
              <button className="w-full md:w-auto btn-tripswift-primary">
                {t('Footer.subscribeButton')}
              </button>
            </div>
          </div>
  
          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 space-y-4 md:space-y-0">
            <div className="hidden md:block w-full md:w-auto border-t border-tripswift-off-white/20 flex-grow"></div>
            <div className="text-center text-sm mt-2 md:mt-0 w-full md:w-auto text-tripswift-off-white/80 font-tripswift-regular">
              {t('Footer.copyright', { year: currentYear })}
            </div>
            <div className="hidden md:block w-full md:w-auto border-t border-tripswift-off-white/20 flex-grow"></div>
          </div>
  
          {/* Social Media Icons */}
          <div className="flex justify-center mt-4 space-x-4">
            <a href="#" className="text-tripswift-off-white/70 hover:text-tripswift-blue transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-tripswift-off-white/70 hover:text-tripswift-blue transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-tripswift-off-white/70 hover:text-tripswift-blue transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-tripswift-off-white/70 hover:text-tripswift-blue transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;