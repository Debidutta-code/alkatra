"use client";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {};

const Footer = (props: Props) => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isFooterVisible = pathname !== "/my-trip" && pathname !== "/login" && pathname !== "/register";

  const currentYear = new Date().getFullYear();

  return (
    <>
      {isFooterVisible && (
        <div className="flex flex-col bg-gray-100 w-full border-t border-tripswift-black/10 font-noto-sans">
          {/* Main Footer Content */}
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
            {/* Top Section: Logo & Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Logo & Description Section */}
              <div className="lg:col-span-1">
                <div className="flex items-start mb-4">
                  <Image
                    src="/assets/Alhajz.png"
                    width={120}
                    height={20}
                    alt="Alhajz"
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-sm text-tripswift-black/70 leading-relaxed max-w-xs font-tripswift-regular">
                  {t('Footer.description') || 'Your trusted travel companion for seamless bookings and unforgettable experiences.'}
                </p>
              </div>

              {/* Navigation Sections */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {/* Company Section */}
                <div className="flex flex-col">
                  <h3 className="text-base font-tripswift-bold mb-3 sm:mb-4 text-tripswift-black">
                    {t('Footer.companyTitle')}
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.aboutUs')}
                    </span>
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.whyChooseUs')}
                    </span>
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.pricing')}
                    </span>
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.testimonials')}
                    </span>
                  </div>
                </div>

                {/* Resources Section */}
                <div className="flex flex-col">
                  <h3 className="text-base font-tripswift-bold mb-3 sm:mb-4 text-tripswift-black">
                    {t('Footer.resourcesTitle')}
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.privacyPolicy')}
                    </span>
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.termsAndConditions')}
                    </span>
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.blog')}
                    </span>
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.contactUs')}
                    </span>
                  </div>
                </div>

                {/* Product Section */}
                <div className="flex flex-col">
                  <h3 className="text-base font-tripswift-bold mb-3 sm:mb-4 text-tripswift-black">
                    {t('Footer.productTitle')}
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.projectManagement')}
                    </span>
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.timeTracker')}
                    </span>
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.timeSchedule')}
                    </span>
                    <span className="text-sm text-tripswift-black/80 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 font-tripswift-regular">
                      {t('Footer.leadGeneration')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription Section */}
            {/* <div className="mt-8 sm:mt-10 lg:mt-12 pt-8 border-t border-tripswift-black/10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="lg:w-[400px] lg:flex-shrink-0">
                  <h3 className="text-base font-tripswift-bold text-tripswift-black mb-2 leading-tight">
                    {t('Footer.newsletterTitle') || 'Stay Updated'}
                  </h3>
                  <p className="text-xs sm:text-sm text-tripswift-black/70 leading-relaxed font-tripswift-regular">
                    {t('Footer.newsletterDescription') || 'Subscribe to get special offers and updates'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                  <input
                    type="email"
                    placeholder={t('Footer.emailPlaceholder')}
                    className="w-full sm:w-[240px] lg:w-[260px] h-[42px] border border-tripswift-black/30 bg-tripswift-off-white rounded-lg px-4 text-sm text-tripswift-black placeholder-tripswift-black/50 focus:outline-none focus:border-tripswift-blue focus:ring-1 focus:ring-tripswift-blue transition-colors duration-200 font-tripswift-regular"
                  />
                  <button className="w-full sm:w-auto h-[42px] bg-gradient-to-r from-tripswift-blue to-[#054B8F] text-tripswift-off-white px-6 rounded-lg text-sm font-tripswift-medium transition-all duration-300 hover:shadow-md hover:from-[#054B8F] hover:to-tripswift-blue whitespace-nowrap flex-shrink-0">
                    {t('Footer.subscribeButton')}
                  </button>
                </div>
              </div>
            </div> */}
          </div>

          {/* Bottom Bar: Copyright & Social */}
          <div className="border-t border-tripswift-black/10 bg-tripswift-off-white/30">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Copyright */}
                <div className="text-xs sm:text-sm text-tripswift-black/70 text-center sm:text-left order-2 sm:order-1 font-tripswift-regular">
                  © {currentYear} {t('Footer.copyright').replace('{year}', '')}
                </div>

                {/* Social Media Icons */}
                <div className="flex items-center gap-4 order-1 sm:order-2">
                  <span className="text-tripswift-black/60 hover:text-tripswift-blue transition-colors duration-300 cursor-pointer hover:scale-110 transform">
                    <Facebook size={18} />
                  </span>
                  <span className="text-tripswift-black/60 hover:text-tripswift-blue transition-colors duration-300 cursor-pointer hover:scale-110 transform">
                    <Twitter size={18} />
                  </span>
                  <span className="text-tripswift-black/60 hover:text-tripswift-blue transition-colors duration-300 cursor-pointer hover:scale-110 transform">
                    <Instagram size={18} />
                  </span>
                  <span className="text-tripswift-black/60 hover:text-tripswift-blue transition-colors duration-300 cursor-pointer hover:scale-110 transform">
                    <Linkedin size={18} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;