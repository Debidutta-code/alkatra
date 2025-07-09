"use client";
import Image from "next/image";
import React from "react";
import img from "../assets/TRIP-1.png";
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
        <div className="flex flex-col mt-10 bg-gray-100 w-full py-6 px-6 md:px-12 text-tripswift-black font-noto-sans">
          <header className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Logo Section */}
            <div className="flex items-start">
              <Image
                src={img}
                width={170}
                height={20}
                alt="TripSwift - Redefines Hospitality Technology"
                className="object-contain"
              />
            </div>

            {/* Navigation Sections */}
            <div className="flex flex-col md:flex-row md:space-x-10 md:items-start">
              {/* Company Section */}
              <div className="flex flex-col p-2">
                <header className="text-lg font-tripswift-extrabold mb-4">{t('Footer.companyTitle')}</header>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.aboutUs')}
                </span>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.whyChooseUs')}
                </span>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.pricing')}
                </span>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.testimonials')}
                </span>
              </div>

              {/* Resources Section */}
              <div className="flex flex-col p-2">
                <header className="text-lg font-tripswift-extrabold mb-4">{t('Footer.resourcesTitle')}</header>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.privacyPolicy')}
                </span>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.termsAndConditions')}
                </span>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.blog')}
                </span>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.contactUs')}
                </span>
              </div>

              {/* Product Section */}
              <div className="flex flex-col p-2">
                <header className="text-lg font-tripswift-extrabold mb-4">{t('Footer.productTitle')}</header>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.projectManagement')}
                </span>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.timeTracker')}
                </span>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.timeSchedule')}
                </span>
                <span className="text-base mb-2 text-tripswift-off-white/80 font-tripswift-regular pointer-events-none">
                  {t('Footer.leadGeneration')}
                </span>
              </div>
            </div>
          </header>

          {/* Subscription Section */}
          {/* <div className="flex flex-col md:flex-row md:items-center mt-6 md:mt-6 w-full md:w-auto">
            <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-64">
                <input
                  type="email"
                  placeholder={t('Footer.emailPlaceholder')}
                  className="border border-tripswift-off-white/30 bg-tripswift-black/20 rounded-lg px-4 py-2 w-full text-tripswift-off-white placeholder-tripswift-off-white/50 focus:outline-none focus:border-tripswift-blue font-tripswift-regular"
                  disabled // Disable input to make it non-interactive
                />
              </div>
              <button
                className="w-full md:w-auto btn-tripswift-primary py-2 px-4 rounded-lg font-tripswift-medium transition-all duration-300 hover:shadow-md"
                disabled // Disable button to make it non-interactive
              >
                {t('Footer.subscribeButton')}
              </button>
            </div>
          </div> */}
          {/* Subscription Section */}
          <div className="flex flex-col md:flex-row md:items-center mt-6 md:mt-6 w-full md:w-auto">
            <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-64">
                <input
                  type="email"
                  placeholder={t('Footer.emailPlaceholder')}
                  className="border border-tripswift-black/30 bg-gray-100/20 rounded-lg px-4 py-2 w-full text-tripswift-black placeholder-tripswift-black/50 focus:outline-none focus:border-tripswift-blue font-tripswift-regular"
                />
              </div>
              <button className="w-full md:w-auto btn-tripswift-primary py-2 px-4 rounded-lg font-tripswift-medium transition-all duration-300 hover:shadow-md">
                {t('Footer.subscribeButton')}
              </button>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 space-y-4 md:space-y-0">
            <div className="hidden md:block w-full md:w-auto border-t border-tripswift-black/20 flex-grow"></div>
            <div className="text-center text-sm mt-2 md:mt-0 w-full md:w-auto text-tripswift-black/80 font-tripswift-regular">
              © {currentYear} {t('Footer.copyright').replace('{year}', '')}
            </div>
            <div className="hidden md:block w-full md:w-auto border-t border-tripswift-black/20 flex-grow"></div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center mt-4 space-x-4">
            <span className="text-tripswift-black/70 transition-colors duration-300 pointer-events-none">
              <Facebook size={20} />
            </span>
            <span className="text-tripswift-black/70 transition-colors duration-300 pointer-events-none">
              <Twitter size={20} />
            </span>
            <span className="text-tripswift-black/70 transition-colors duration-300 pointer-events-none">
              <Instagram size={20} />
            </span>
            <span className="text-tripswift-black/70 transition-colors duration-300 pointer-events-none">
              <Linkedin size={20} />
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;