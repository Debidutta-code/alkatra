"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCheckInDate, setCheckOutDate } from "../../Redux/slices/pmsHotelCard.slice";
import { format, addDays } from "date-fns";

interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
}

export function Destination() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateItemsPerView = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 1280) {
          setItemsPerView(4);
        } else if (window.innerWidth >= 1024) {
          setItemsPerView(3);
        } else if (window.innerWidth >= 768) {
          setItemsPerView(2);
        } else {
          setItemsPerView(1);
        }
      }, 100);
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => {
      window.removeEventListener("resize", updateItemsPerView);
      clearTimeout(timeoutId);
    };
  }, []);

  // Fetch unique cities from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/unique-cities`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = response.data;
        if (data.status !== "success") {
          throw new Error(data.message || t("HomeSections.AllHotelLists.errorMessage", { defaultValue: "API error" }));
        }

        const curatedImages = [
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop&crop=center&q=80"
        ];

        // Map API response to Destination interface with localized descriptions
        const fetchedDestinations: Destination[] = data.data.map((city: string, index: number) => {
          const translatedCityName = t(`HomeSections.ExploreDestinations.destinations.${city.toLowerCase()}.name`, {
            defaultValue: city,
          });
          const description = t("HomeSections.ExploreDestinations.descriptionTemplate", {
            defaultValue: `Explore hotels in ${translatedCityName}`,
            city: translatedCityName,
          });

          const image = curatedImages[index % curatedImages.length];

          return {
            id: `${index + 1}`,
            name: translatedCityName,
            description,
            image,
          };
        });

        setDestinations(fetchedDestinations);
        setLoading(false);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          t("HomeSections.AllHotelLists.errorMessage", {
            defaultValue: "An error occurred while fetching destinations",
          });
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [t]);

  const totalGroups = Math.ceil(destinations.length / itemsPerView);

  useEffect(() => {
    if (currentGroupIndex >= totalGroups && totalGroups > 0) {
      setCurrentGroupIndex(totalGroups - 1);
    }
  }, [currentGroupIndex, totalGroups]);

  const handleNext = () => {
    if (currentGroupIndex < totalGroups - 1) {
      setCurrentGroupIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prevIndex) => prevIndex - 1);
    }
  };

  // Get destinations for current group
  const getCurrentGroupDestinations = () => {
    const startIndex = currentGroupIndex * itemsPerView;
    const endIndex = startIndex + itemsPerView;
    return destinations.slice(startIndex, endIndex);
  };

  // Handle destination click
  const handleLocationClick = (location: string) => {
    const checkin = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const checkout = format(addDays(new Date(), 2), "yyyy-MM-dd");
    dispatch(setCheckInDate(checkin));
    dispatch(setCheckOutDate(checkout));
    const guestParams = "&rooms=1&adults=1&children=0&infant=0";
    router.push(
      `/destination?location=${encodeURIComponent(location)}&checkin=${encodeURIComponent(
        checkin
      )}&checkout=${encodeURIComponent(checkout)}${guestParams}`
    );
  };

  const visibleDestinations = getCurrentGroupDestinations();
  const canShowPrevious = currentGroupIndex > 0;
  const canShowNext = currentGroupIndex < totalGroups - 1;
  const canShowNavigation = totalGroups > 1;

  return (
    <section className="py-8 md:py-12 bg-tripswift-off-white font-noto-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-tripswift-bold text-tripswift-black mb-4 sm:mb-0">
            {t("HomeSections.ExploreDestinations.title", { defaultValue: "Explore Destinations" })}
          </h2>

          {canShowNavigation && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={!canShowPrevious}
                className={`p-2 rounded-full transition-all duration-200 focus:outline-none ${canShowPrevious
                  ? "bg-tripswift-off-white hover:bg-gray-50 text-tripswift-black shadow-sm border border-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  }`}
                aria-label={t("HomeSections.ExploreDestinations.previous", { defaultValue: "Previous Destination" })}
              >
                <ChevronLeft className={`w-5 h-5 ${i18n.language === "ar" ? "rotate-180" : ""}`} />
              </button>
              <button
                onClick={handleNext}
                disabled={!canShowNext}
                className={`p-2 rounded-full transition-all duration-200 focus:outline-none ${canShowNext
                  ? "bg-tripswift-off-white hover:bg-gray-50 text-tripswift-black shadow-sm border border-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  }`}
                aria-label={t("HomeSections.ExploreDestinations.next", { defaultValue: "Next Destination" })}
              >
                <ChevronRight className={`w-5 h-5 ${i18n.language === "ar" ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(itemsPerView)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-48"></div>
                <div className="mt-3 bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="mt-2 bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-tripswift-black/70">
              {t("HomeSections.AllHotelLists.errorMessage", { defaultValue: error })}
            </p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-tripswift-black/70">
              {t("HomeSections.AllHotelLists.noHotels", { defaultValue: "No destinations available." })}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visibleDestinations.map((destination) => (
                  <Card
                    key={destination.id}
                    className="h-full overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-200 rounded-xl cursor-pointer bg-tripswift-off-white"
                    onClick={() => handleLocationClick(destination.name)}
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={destination.image}
                        alt={t("HomeSections.ExploreDestinations.imageAlt", { defaultValue: destination.name })}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-lg font-tripswift-semibold text-white drop-shadow-md">
                          {destination.name}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-4 bg-white">
                      <p className="text-sm text-tripswift-black/70 mt-1 line-clamp-2">
                        {destination.description}
                      </p>
                      <div className="mt-3 flex items-center text-sm font-medium text-tripswift-blue">
                        <MapPin className={`w-4 h-4 ${i18n.language === "ar" ? "ml-1" : "mr-1"}`} />
                        <span>{t("HomeSections.ExploreDestinations.exploreNow", { defaultValue: "Explore Now" })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Dots Navigation */}
            {canShowNavigation && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalGroups }, (_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentGroupIndex
                      ? "bg-tripswift-blue w-6 shadow-md"
                      : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    onClick={() => setCurrentGroupIndex(index)}
                    aria-label={t("HomeSections.ExploreDestinations.goToGroup", {
                      defaultValue: `Go to group ${index + 1}`,
                    })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}