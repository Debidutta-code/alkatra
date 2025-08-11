"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "../../Redux/store";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getHotelsByCity } from "../../api/hotel";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18next from "../../i18n/Index";
import Home from "../../components/assets/popular/Home.jpg";
import CompactSearchBar from "../hotelBox/CompactSearchBar";
import { format, addDays } from "date-fns";
import QRCodeForAPP from "../ui/qrcode";


const HotelCard = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  // Set default dates (tomorrow and day after tomorrow)
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const dayAfterTomorrow = format(addDays(new Date(), 2), "yyyy-MM-dd");
  const isArabic = i18n.language === "ar";
  const isHindi = i18n.language === "hi";
  // Monitor scroll position for subtle parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add animation class after component mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Ensure document direction is set
  useEffect(() => {
    document.documentElement.dir = i18next.language === "ar" ? "rtl" : "ltr";
    const handleLanguageChange = () => {
      document.documentElement.dir = i18next.language === "ar" ? "rtl" : "ltr";
    };
    i18next.on("languageChanged", handleLanguageChange);
    return () => {
      i18next.off("languageChanged", handleLanguageChange);
    };
  }, []);

  // Handle search from CompactSearchBar
  const handleSearch = useCallback(
    async (location: string, checkin: string, checkout: string) => {
      try {
        await getHotelsByCity(location);
        router.push(
          `/destination?location=${encodeURIComponent(
            location
          )}&checkin=${encodeURIComponent(
            checkin
          )}&checkout=${encodeURIComponent(checkout)}`
        );
      } catch (error) {
        toast.error(t("HotelCard.errorNoHotels"));
      }
    },
    [router, t]
  );

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden font-noto-sans">
      {/* Hero Image with Parallax Effect */}
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-1000"
        style={{ transform: `translateY(${isScrolled ? "5%" : "0"})` }}
      >
        <Image
          src="/assets/popular/Home.jpg"
          alt="Luxury Accommodation - TripSwift"
          className="object-cover w-full h-full"
          width={800}
          height={500}
          priority
          quality={95}
          unoptimized
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-tripswift-black/50 via-tripswift-black/30 to-tripswift-black/60" />
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 h-full flex flex-col items-center justify-center px-4 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
      >
        <div
          className={`absolute hidden md:block top-0 
    ${isArabic ? 'left-0 md:left-2 lg:left-4' : 'right-0 md:right-2 lg:right-4'} 
    md:top-16 ${isHindi ? 'lg:top-16' : 'lg:top-14'} 
    xl:w-52 lg:w-48 md:w-32 w-16 h-auto 
    shadow-lg rounded-lg flex-col items-center`}
        >
          <QRCodeForAPP />
          <div
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 57%, rgba(227,131,57,1) 100%)",
            }}
            className="mt-2 w-full bg-gradient-to-r from-red-500 to-orange-600 
    backdrop-blur-sm text-sm font-tripswift-medium md:px-2.5 lg:px-4 py-1.5 rounded-full 
    flex justify-center items-center mb-2 shadow-lg text-center"
          >
            <span className="text-tripswift-off-white text-md lg:text-lg  font-tripswift-medium">
              {t("HotelCard.downloadourapp")}
            </span>
          </div>

        </div>

        {/* Hero Text */}
        <div className="max-w-3xl text-center  sm:mb-10 animate-in slide-in-from-bottom duration-700">
          <div className="bg-tripswift-blue/20 hidden backdrop-blur-sm text-tripswift-off-white/90 text-sm font-tripswift-medium px-4 py-1.5 rounded-full sm:inline-flex items-center mb-6 shadow-lg">
            <span className={`inline-block w-2 h-2 bg-tripswift-blue rounded-full animate-pulse ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}></span>
            <span className="text-[#ffffff]">
              {t("HotelCard.exclusiveOffers")}
            </span>
          </div>
          <h1 className="text-2xl md-text-4xl lg:w-[90%] xl:w-[100%] mt-4 md:mt-10 lg:text-5xl xl:text-6xl font-tripswift-extrabold text-tripswift-off-white mb-5 leading-tight tracking-tight drop-shadow-lg">
            {t("HotelCard.heroTitle")}
          </h1>

          <p className="text-lg md:text-xl mb-2 md:mb-0 leading-tight md:leading-normal  text-tripswift-off-white font-tripswift-regular max-w-2xl mx-auto drop-shadow-md">
            {t("HotelCard.heroSubtitle")}
          </p>
        </div>

        {/* Search Container */}
        <div className="w-[290px] md:w-full max-w-6xl animate-in slide-in-from-bottom duration-700 delay-200">
          {/* Search Box */}
          <CompactSearchBar
            initialLocation="Manama"
            initialCheckin={tomorrow}
            initialCheckout={dayAfterTomorrow}
            onSearch={handleSearch}
          />

          {/* Special Offers Bar */}
          <div className="mt-5 md:flex items-center hidden  justify-center animate-in slide-in-from-bottom duration-700 delay-300">
            <div className="bg-tripswift-off-white/20 backdrop-blur-lg px-5 py-2.5 rounded-full shadow-lg flex items-center gap-4">
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse  ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}></span>
                <span className="text-sm font-tripswift-medium text-tripswift-off-white">
                  {t("HotelCard.freeCancellation")}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse  ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}></span>
                <span className="text-sm font-tripswift-medium text-tripswift-off-white">
                  {t("HotelCard.bestPriceGuarantee")}
                </span>
              </div>
              <div className="hidden sm:flex items-center">
                <span className={`inline-block w-2 h-2 bg-tripswift-blue rounded-full animate-pulse  ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}></span>
                <span className="text-sm font-tripswift-medium text-tripswift-off-white">
                  {t("HotelCard.specialOffer")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
