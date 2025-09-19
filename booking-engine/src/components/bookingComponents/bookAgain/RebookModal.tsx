// src/components/bookingComponents/bookAgain/RebookModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import dayjs, { Dayjs } from "dayjs";
import {
  X,
  Check,
  Calendar,
  CreditCard,
  ArrowLeft,
  MapPin,
  ChevronRight,
  Info
} from "lucide-react";
import DateSelectionCard from "./DateSelectionCard";
import ContactInfoCard from "./ContactInfoCard";
import GuestManagementCard from "./GuestManagementCard";
import RoomInfoCard from "./RoomInfoCard";
import { useDispatch } from "@/Redux/store";
import {
  setHotelCode,
  setHotelName,
  setRoomType,
  setCheckInDate,
  setCheckOutDate,
  setAmount,
  setCurrency,
  setRequestedRooms,
  setGuestDetails,
  setRatePlanCode,
  resetPmsHotelCard,
  setRoomId,
  setPropertyId
} from "@/Redux/slices/pmsHotelCard.slice";
import { checkRoomAvailability, getRoomPrice } from "../../../api/rebook";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import ReviewSummaryCard from "./ReviewSummaryCard";

const getGuestType = (dob: string | null): 'adult' | 'child' | 'infant' => {
  if (!dob) return 'adult';
  const age = dayjs().diff(dayjs(dob), 'year');
  if (age < 2) return 'infant';
  if (age < 12) return 'child';
  return 'adult';
};

const getDefaultDOBByType = (type: 'adult' | 'child' | 'infant'): string => {
  switch (type) {
    case 'adult': return dayjs().subtract(25, 'year').format('YYYY-MM-DD');
    case 'child': return dayjs().subtract(8, 'year').format('YYYY-MM-DD');
    case 'infant': return dayjs().subtract(1, 'year').format('YYYY-MM-DD');
    default: return dayjs().subtract(25, 'year').format('YYYY-MM-DD');
  }
};

const validateGuestDOB = (dob: string, type: 'adult' | 'child' | 'infant'): boolean => {
  if (!dob) return false;
  const age = dayjs().diff(dayjs(dob), 'year');

  switch (type) {
    case 'adult': return age >= 12;
    case 'child': return age >= 2 && age < 12;
    case 'infant': return age < 2;
    default: return false;
  }
};

interface PriceData {
  totalAmount: number;
  numberOfNights: number;
  baseRatePerNight: number;
  additionalGuestCharges: number;
  breakdown: {
    totalBaseAmount: number;
    totalAdditionalCharges: number;
    totalAmount: number;
    numberOfNights: number;
    averagePerNight: number;
  };
  dailyBreakdown: Array<{
    date: string;
    dayOfWeek: string;
    ratePlanCode: string;
    baseRate: number;
    additionalCharges: number;
    totalPerRoom: number;
    totalForAllRooms: number;
    currencyCode: string;
    childrenChargesBreakdown: any[];
  }>;
  availableRooms: number;
  requestedRooms: number;
  tax: Array<{
    name: string;
    percentage: number;
    amount: number;
  }>;
  totalTax: number;
  priceAfterTax: number;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  type: 'adult' | 'child' | 'infant';
}

interface RebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    hotelCode: string;
    hotelName: string;
    roomTypeCode: string;
    numberOfRooms: number;
    guestDetails: any[];
    email?: string;
    phone?: string;
    roomId?: string;
    propertyId?: string;
  };
}

const RebookModal: React.FC<RebookModalProps> = ({ isOpen, onClose, booking }) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const initialContact = {
    email: booking.email || (booking.guestDetails?.[0]?.email || ""),
    phone: booking.phone || (booking.guestDetails?.[0]?.phone || "")
  };
  const [currentStep, setCurrentStep] = useState<'form' | 'review'>('form');
  const [checkInDate, setLocalCheckInDate] = useState<Dayjs | null>(dayjs().add(1, 'day'));
  const [checkOutDate, setLocalCheckOutDate] = useState<Dayjs | null>(dayjs().add(2, 'day'));
  const [guests, setGuests] = useState<Guest[]>(() => {
    if (booking.guestDetails && booking.guestDetails.length > 0) {
      return booking.guestDetails.map(g => ({
        id: crypto.randomUUID(),
        firstName: g.firstName || "",
        lastName: g.lastName || "",
        dob: g.dob || getDefaultDOBByType(g.type || getGuestType(g.dob)),
        type: g.type || getGuestType(g.dob)
      }));
    }
    return [{
      id: crypto.randomUUID(),
      firstName: "",
      lastName: "",
      dob: getDefaultDOBByType('adult'),
      type: 'adult'
    }];
  });
  const [contactEmail, setContactEmail] = useState<string>(initialContact.email);
  const [contactPhone, setContactPhone] = useState<string>(initialContact.phone);
  const [rooms, setRooms] = useState<number>(booking.numberOfRooms || 1);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [localCurrency, setLocalCurrency] = useState<string>("USD");
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [ratePlanCodeFromApi, setRatePlanCodeFromApi] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isNavigatingToPayment, setIsNavigatingToPayment] = useState(false);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('form');
      setLocalCheckInDate(dayjs().add(1, 'day'));
      setLocalCheckOutDate(dayjs().add(2, 'day'));

      // Enhanced guest initialization
      const initializedGuests = booking.guestDetails && booking.guestDetails.length > 0
        ? booking.guestDetails.map(g => ({
          id: crypto.randomUUID(),
          firstName: g.firstName || "",
          lastName: g.lastName || "",
          dob: g.dob || getDefaultDOBByType(g.type || getGuestType(g.dob)),
          type: g.type || getGuestType(g.dob)
        }))
        : [{
          id: crypto.randomUUID(),
          firstName: "",
          lastName: "",
          dob: getDefaultDOBByType('adult'),
          type: 'adult'
        }];

      setGuests(initializedGuests);
      setContactEmail(booking.email || (booking.guestDetails?.[0]?.email || ""));
      setContactPhone(booking.phone || (booking.guestDetails?.[0]?.phone || ""));
      setRooms(booking.numberOfRooms || 1);
      setIsAvailable(null);
      setFinalPrice(null);
      setPriceData(null);
      setMessage(null);
      setErrors({});
    }
  }, [isOpen, booking]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const scrollPosition = window.scrollY;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollPosition}px`;

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        window.scrollTo(0, scrollPosition);
      };
    }
  }, [isOpen]);

  // Calculate guest breakdown for API calls
  const getGuestBreakdown = () => {
    const adults = guests.filter(g => getGuestType(g.dob) === 'adult').length;
    const children = guests.filter(g => getGuestType(g.dob) === 'child').length;
    const infants = guests.filter(g => getGuestType(g.dob) === 'infant').length;

    return { adults, children, infants };
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const disabledDateForDOB = (current: Dayjs, guestType: 'adult' | 'child' | 'infant') => {
    const today = dayjs();

    switch (guestType) {
      case 'adult':
        // Adults should be at least 12 years old, max 120 years old
        return current && (current > today.subtract(12, 'year') || current < today.subtract(120, 'year'));
      case 'child':
        // Children should be 2-11 years old
        return current && (current > today.subtract(2, 'year') || current < today.subtract(12, 'year'));
      case 'infant':
        // Infants should be 0-1 years old
        return current && (current > today || current < today.subtract(2, 'year'));
      default:
        return current && current > today.endOf('day');
    }
  };

  const disabledCheckOutDate = (current: Dayjs) => {
    return current && current <= (checkInDate || dayjs()).startOf('day');
  };

  // Add new guest
  const addGuest = () => {
    setGuests([...guests, {
      id: crypto.randomUUID(),
      firstName: "",
      lastName: "",
      dob: getDefaultDOBByType('adult'),
      type: 'adult'
    }]);
  };

  // Remove guest
  const removeGuest = (id: string) => {
    if (guests.length > 1) {
      setGuests(guests.filter(g => g.id !== id));
      // Clear any errors for removed guest
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.includes(id)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    } else {
      setMessage({
        type: 'error',
        text: t("At least one guest is required")
      });
    }
  };

  // Enhanced update guest with validation
  const updateGuest = (id: string, field: keyof Guest, value: any) => {
    setGuests(guests.map(g => {
      if (g.id === id) {
        const updatedGuest = { ...g, [field]: value };

        // If changing type, update DOB to match and clear errors
        if (field === 'type') {
          updatedGuest.dob = getDefaultDOBByType(value as 'adult' | 'child' | 'infant');
          setErrors(prev => ({
            ...prev,
            [`${id}-dob`]: '',
            [`${id}-type`]: ''
          }));
        }

        // If changing DOB, validate against current type
        if (field === 'dob' && value) {
          if (!validateGuestDOB(value, g.type)) {
            // Auto-correct type based on DOB
            updatedGuest.type = getGuestType(value);
          }
          setErrors(prev => ({ ...prev, [`${id}-dob`]: '' }));
        }

        // Clear field-specific errors
        if (field === 'firstName' || field === 'lastName') {
          setErrors(prev => ({ ...prev, [`${id}-${field}`]: '' }));
        }

        return updatedGuest;
      }
      return g;
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    // Check-in Date validation
    if (!checkInDate) {
      newErrors["checkInDate"] = t("Please select a check-in date");
      isValid = false;
    }

    // Check-out Date validation
    if (!checkOutDate) {
      newErrors["checkOutDate"] = t("Please select a check-out date");
      isValid = false;
    }

    // Date range validation (only if both dates exist)
    if (checkInDate && checkOutDate) {
      if (checkOutDate.isSame(checkInDate, 'day') || checkOutDate.isBefore(checkInDate, 'day')) {
        newErrors["dates"] = t("Check-out date must be after check-in date");
        isValid = false;
      }
    }

    // Rooms validation
    if (!rooms || rooms < 1) {
      newErrors["rooms"] = t("At least 1 room is required");
      isValid = false;
    } else if (rooms > 4) {
      newErrors["rooms"] = t("Maximum 4 rooms allowed");
      isValid = false;
    }

    // Guest-to-room ratio validation
    const maxGuestsPerRoom = 4;
    const maxAllowedGuests = rooms * maxGuestsPerRoom;
    if (guests.length > maxAllowedGuests) {
      newErrors["guests"] = t("Maximum {{maxGuests}} guests allowed for {{rooms}} {{roomText}}", {
        maxGuests: maxAllowedGuests,
        rooms: rooms,
        roomText: rooms === 1 ? t("room") : t("rooms")
      });
      isValid = false;
    }

    // Contact validation
    if (!contactEmail.trim()) {
      newErrors["email"] = t("Please provide a contact email");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      newErrors["email"] = t("Please provide a valid email address");
      isValid = false;
    }

    // Guest validation
    guests.forEach((guest) => {
      if (!guest.firstName.trim()) {
        newErrors[`${guest.id}-firstName`] = t("First name is required");
        isValid = false;
      } else if (!/^[A-Za-z\s]+$/.test(guest.firstName.trim())) {
        newErrors[`${guest.id}-firstName`] = t("First name should only contain letters");
        isValid = false;
      }

      if (!guest.lastName.trim()) {
        newErrors[`${guest.id}-lastName`] = t("Last name is required");
        isValid = false;
      } else if (!/^[A-Za-z\s]+$/.test(guest.lastName.trim())) {
        newErrors[`${guest.id}-lastName`] = t("Last name should only contain letters");
        isValid = false;
      }

      if (!guest.dob) {
        newErrors[`${guest.id}-dob`] = t("Date of birth is required");
        isValid = false;
      } else if (!validateGuestDOB(guest.dob, guest.type)) {
        newErrors[`${guest.id}-dob`] = t("Date of birth doesn't match guest type");
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle Continue → Check Availability → Show Review
  const handleContinueToReview = async () => {
    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: t("Please correct the errors above")
      });
      return;
    }

    setIsChecking(true);
    setMessage(null);

    try {
      // 1. Check Availability
      await checkRoomAvailability(
        booking.hotelCode,
        booking.roomTypeCode,
        checkInDate!.format("YYYY-MM-DD"),
        checkOutDate!.format("YYYY-MM-DD")
      );

      setIsAvailable(true);

      // 2. Get price with proper guest breakdown
      const { adults, children, infants } = getGuestBreakdown();

      const data = await getRoomPrice(
        booking.hotelCode,
        booking.roomTypeCode,
        checkInDate!.format("YYYY-MM-DD"),
        checkOutDate!.format("YYYY-MM-DD"),
        adults,
        children,
        infants,
        rooms
      );

      let finalPriceAfterTax = data.totalAmount;
      if (data.priceAfterTax && data.priceAfterTax > 0) {
        finalPriceAfterTax = data.priceAfterTax;
      } else if (data.totalTax && data.totalTax > 0) {
        finalPriceAfterTax = data.totalAmount + data.totalTax;
      }

      const ratePlanCode = data.dailyBreakdown?.[0]?.ratePlanCode || "";
      setRatePlanCodeFromApi(ratePlanCode);

      setFinalPrice(finalPriceAfterTax);
      setLocalCurrency(data.dailyBreakdown?.[0]?.currencyCode || "");
      setPriceData(data);

      setCurrentStep('review');
      setMessage({
        type: 'success',
        text: t("Great! Your new dates are available.")
      });

    } catch (error: any) {
      console.error("Error during rebooking:", error);
      setMessage({
        type: 'error',
        text: error.message || t("Something went wrong. Please try again.")
      });
      setIsAvailable(false);
      setFinalPrice(null);
      setPriceData(null);
    } finally {
      setIsChecking(false);
    }
  };


  const handleProceedToPayment = async () => {
    if (finalPrice === null || !checkInDate || !checkOutDate) return;

    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: t("Please complete all required fields before proceeding")
      });
      return;
    }

    setIsNavigatingToPayment(true);

    try {
      dispatch(resetPmsHotelCard());

      const roomId = booking.roomId || "";
      const propertyId = booking.propertyId || "";

      dispatch(setHotelCode(booking.hotelCode));
      dispatch(setHotelName(booking.hotelName));
      dispatch(setRoomType(booking.roomTypeCode));
      dispatch(setCheckInDate(checkInDate.format("YYYY-MM-DD")));
      dispatch(setCheckOutDate(checkOutDate.format("YYYY-MM-DD")));
      dispatch(setAmount(finalPrice));
      dispatch(setCurrency(localCurrency));
      dispatch(setRequestedRooms(rooms.toString()));
      dispatch(setRoomId(roomId));
      dispatch(setPropertyId(propertyId));

      const { adults, children, infants } = getGuestBreakdown();
      const guestDetailsPayload = {
        guests: guests,
        rooms: rooms,
        adults: adults,
        children: children,
        infants: infants,
        email: contactEmail,
        phone: contactPhone,
      };

      dispatch(setGuestDetails(guestDetailsPayload));
      dispatch(setRatePlanCode(ratePlanCodeFromApi));

      // Wait for state to be updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to payment page
      router.push("/payment");

    } catch (error) {
      console.error("Error proceeding to payment:", error);
      setMessage({
        type: 'error',
        text: t("Something went wrong. Please try again.")
      });
      setIsNavigatingToPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 font-noto-sans p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">

        {/* Enhanced Header with Progress Indicator */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tripswift-blue rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t("Book Again")}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {booking.hotelName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'form' ? 'bg-tripswift-blue text-white' : 'bg-green-500 text-white'
                }`}>
                {currentStep === 'review' ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium text-gray-700">{t("Update Details")}</span>
            </div>
            <div className={`flex-1 h-0.5 ${currentStep === 'review' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'review' ? 'bg-tripswift-blue text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                2
              </div>
              <span className={`text-sm font-medium ${currentStep === 'review' ? 'text-gray-700' : 'text-gray-400'}`}>
                {t("Review & Book")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Show Form Step */}
          {currentStep === 'form' && (
            <>
              <DateSelectionCard
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                rooms={rooms}
                guestsCount={guests.length}
                onCheckInChange={setLocalCheckInDate}
                onCheckOutChange={setLocalCheckOutDate}
                onRoomsChange={setRooms}
                disabledDate={disabledDate}
                disabledCheckOutDate={disabledCheckOutDate}
                errors={errors}
              />

              <ContactInfoCard
                email={contactEmail}
                phone={contactPhone}
              />

              <GuestManagementCard
                guests={guests}
                onAddGuest={addGuest}
                onUpdateGuest={updateGuest}
                onRemoveGuest={removeGuest}
                errors={errors}
                disabledDateForDOB={disabledDateForDOB}
              />

              <RoomInfoCard
                roomTypeCode={booking.roomTypeCode}
              />

              {/* Message Display */}
              {message && (
                <div className={`rounded-2xl border-2 flex items-start gap-2 p-2 ${message.type === 'success'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                  : message.type === 'error'
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                  }`}>
                  <div className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${message.type === 'success'
                    ? 'bg-green-500'
                    : message.type === 'error'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                    }`}>
                    {message.type === 'success' ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : message.type === 'error' ? (
                      <X className="h-5 w-5 text-white" />
                    ) : (
                      <Info className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="p-2 placeholder:text-sm font-semibold text-gray-900">{message.text}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isChecking}
                  className="px-8 py-3 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold"
                >
                  {t("Cancel")}
                </Button>

                <Button
                  onClick={handleContinueToReview}
                  disabled={isChecking}
                  className="px-8 py-3 h-12 bg-gradient-to-r from-tripswift-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {isChecking ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t("Checking Availability...")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{t("Continue to Review")}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Show Review Step */}
          {currentStep === 'review' && isAvailable && finalPrice !== null && (
            <>
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-2 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{t("Great News!")}</h3>
                    <p className="text-green-100">{t("Your selected dates are available for booking")}</p>
                  </div>
                </div>
              </div>
              <ReviewSummaryCard
                hotelName={booking.hotelName}
                roomTypeCode={booking.roomTypeCode}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                guests={guests}
                rooms={rooms}
                contactEmail={contactEmail}
                contactPhone={contactPhone}
              />
              {/* Price Breakdown Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <h4 className="text-lg font-bold">{t("Price Details")}</h4>
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-4">
                    {/* Tax Breakdown */}
                    {priceData?.tax && priceData.tax.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-green-200">
                        <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          {t("Tax & Fee Breakdown")}
                        </div>
                        <div className="space-y-2">
                          {priceData.tax.map((taxItem, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                {taxItem.name} ({taxItem.percentage}%)
                              </span>
                              <span className="font-semibold text-gray-800">
                                {localCurrency} {taxItem.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Main Price Display */}
                    <div className="bg-white rounded-xl p-2 border-2 border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-md font-semibold text-gray-600 mb-1">
                            {t("Total Amount")}
                          </p>
                          <p className="text-sm text-gray-500">{t("(includes all taxes & fees)")}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-md font-bold text-green-600">
                            {localCurrency} {finalPrice?.toLocaleString(i18n.language, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                          {priceData?.breakdown?.averagePerNight && (
                            <p className="text-sm text-gray-500 mt-1">
                              {localCurrency} {priceData.breakdown.averagePerNight.toFixed(2)} {t("per night")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Step Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => setCurrentStep('form')}
                  variant="outline"
                  className="px-8 py-3 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("Back to Details")}
                </Button>

                <Button
                  onClick={handleProceedToPayment}
                  disabled={isNavigatingToPayment}
                  className="px-8 py-3 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                >
                  {isNavigatingToPayment ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t("Redirecting to Payment...")}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      <span>{t("Proceed to Payment")}</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RebookModal;