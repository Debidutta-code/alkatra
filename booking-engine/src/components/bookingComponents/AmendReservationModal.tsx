'use client';
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { Booking } from './bookingTabs/types';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Cookies from "js-cookie";
import { getDefaultDOBByType, getGuestType } from '../../utils/guestDobHelpers';
import { checkRoomAvailability } from '../../api/rebook';
import {
  CalendarDays,
  Users,
  Clock,
  BedDouble,
  X,
  Check,
  Info,
  Calendar,
  BedIcon,
  ShieldAlert,
  CreditCard,
  AlertCircle
} from "lucide-react";

// ✅ Import shared components
import DateSelectionCard from "../bookingComponents/bookAgain/DateSelectionCard";
import GuestManagementCard from "../bookingComponents/bookAgain/GuestManagementCard";

// Define Guest type compatible with GuestManagementCard
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  type: 'adult' | 'child' | 'infant';
}

interface AmendReservationModalProps {
  booking: Booking;
  onClose: () => void;
  onAmendComplete: (bookingId: string, amendedData: any) => void;
}

const AmendReservationModal: React.FC<AmendReservationModalProps> = ({
  booking,
  onClose,
  onAmendComplete
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Form states
  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(booking.checkInDate ? dayjs(booking.checkInDate) : null);
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(booking.checkOutDate ? dayjs(booking.checkOutDate) : null);
  const [roomTypeCode] = useState(booking.roomTypeCode || "");
  const [ratePlanCode] = useState(booking.ratePlanCode || "");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<number>(booking.numberOfRooms || 1);

  // UI states
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [priceStatus, setPriceStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [finalPrice, setFinalPrice] = useState<{
    totalAmount: number;
    currencyCode: string;
    tax?: Array<{ name: string; percentage?: number; amount: number }>;
    totalTax?: number;
    priceAfterTax?: number;
    breakdown?: {
      totalBaseAmount: number;
      totalAdditionalCharges: number;
      totalAmount: number;
      numberOfNights: number;
      averagePerNight: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [amendmentMessage, setAmendmentMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize guests with unique IDs
  useEffect(() => {
    if (booking.guestDetails && Array.isArray(booking.guestDetails) && booking.guestDetails.length > 0) {
      setGuests(booking.guestDetails.map(g => ({
        id: crypto.randomUUID(),
        firstName: g.firstName || "",
        lastName: g.lastName || "",
        dob: g.dob || getDefaultDOBByType(g.type as any),
        type: g.type || getGuestType(g.dob ?? undefined)
      })));
    } else {
      setGuests([{
        id: crypto.randomUUID(),
        firstName: "",
        lastName: "",
        dob: getDefaultDOBByType("adult"),
        type: "adult"
      }]);
    }
  }, [booking.guestDetails]);

  // Lock body scroll
  useEffect(() => {
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
  }, []);

  // Reset price if user changes inputs after checking
  useEffect(() => {
    if (availabilityStatus === 'available' || priceStatus === 'loaded') {
      setAvailabilityStatus('idle');
      setPriceStatus('idle');
      setFinalPrice(null);
    }
  }, [checkInDate, checkOutDate, rooms, guests]);

  // Handlers
  const handleGuestsChange = (newGuests: Guest[]) => setGuests(newGuests);
  const handleRoomsChange = (newRooms: number) => setRooms(newRooms);

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().add(1, 'day').startOf('day');
  };

  const disabledCheckOutDate = (current: Dayjs) => {
    return current && current <= (checkInDate || dayjs()).startOf('day');
  };

  const disabledDateForDOB = (current: Dayjs, guestType: 'adult' | 'child' | 'infant') => {
    const today = dayjs();
    switch (guestType) {
      case 'adult': return current && (current > today.subtract(12, 'year') || current < today.subtract(120, 'year'));
      case 'child': return current && (current > today.subtract(2, 'year') || current < today.subtract(12, 'year'));
      case 'infant': return current && (current > today || current < today.subtract(2, 'year'));
      default: return false;
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let valid = true;

    if (!checkInDate) {
      newErrors["checkInDate"] = t('BookingTabs.AmendReservationModal.errors.selectValidDates');
      valid = false;
    }
    if (!checkOutDate) {
      newErrors["checkOutDate"] = t('BookingTabs.AmendReservationModal.errors.selectValidDates');
      valid = false;
    }
    if (checkInDate && checkOutDate && !checkOutDate.isAfter(checkInDate)) {
      newErrors["dates"] = t('BookingTabs.AmendReservationModal.errors.invalidDateRange');
      valid = false;
    }
    if (rooms < 1) {
      newErrors["rooms"] = t('At least 1 room is required');
      valid = false;
    }

    const maxGuests = rooms * 4;
    if (guests.length > maxGuests) {
      newErrors["guests"] = t('Maximum {{max}} guests allowed for {{rooms}} {{roomText}}', {
        max: maxGuests,
        rooms,
        roomText: rooms === 1 ? t('room') : t('rooms')
      });
      valid = false;
    }

    guests.forEach(guest => {
      if (!guest.firstName.trim() || !/^[A-Za-z\s]+$/.test(guest.firstName.trim())) {
        newErrors[`${guest.id}-firstName`] = t('BookingTabs.AmendReservationModal.errors.invalidFirstName');
        valid = false;
      }
      if (!guest.lastName.trim() || !/^[A-Za-z\s]+$/.test(guest.lastName.trim())) {
        newErrors[`${guest.id}-lastName`] = t('BookingTabs.AmendReservationModal.errors.invalidLastName');
        valid = false;
      }
      if (!guest.dob) {
        newErrors[`${guest.id}-dob`] = t('BookingTabs.AmendReservationModal.errors.dobRequired');
        valid = false;
      } else if (!validateGuestDOB(guest.dob, guest.type)) {
        newErrors[`${guest.id}-dob`] = t('Date of birth doesn\'t match guest type');
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
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

  // ✅ NEW: Manual "Check Availability & Price" handler
  const handleCheckAvailability = async () => {
    if (!validateForm()) {
      setAmendmentMessage({ type: 'error', text: t('BookingTabs.AmendReservationModal.errors.correctFormErrors') });
      return;
    }

    setIsCheckingAvailability(true);
    setAmendmentMessage(null);
    setFinalPrice(null);

    try {
      await checkRoomAvailability(
        booking.hotelCode,
        roomTypeCode,
        checkInDate!.format('YYYY-MM-DD'),
        checkOutDate!.format('YYYY-MM-DD')
      );

      setAvailabilityStatus('available');

      const adults = guests.filter(g => getGuestType(g.dob ?? undefined) === 'adult').length;
      const children = guests.filter(g => getGuestType(g.dob ?? undefined) === 'child').length;
      const infants = guests.filter(g => getGuestType(g.dob ?? undefined) === 'infant').length;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/getRoomRentPrice?reservationId=${booking.reservationId}`,
        {
          hotelCode: booking.hotelCode,
          invTypeCode: roomTypeCode,
          startDate: checkInDate!.format('YYYY-MM-DD'),
          endDate: checkOutDate!.format('YYYY-MM-DD'),
          noOfChildrens: children,
          noOfAdults: adults,
          noOfRooms: rooms,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        const data = response.data.data;
        let finalPriceAfterTax = data.totalAmount;
        if (data.priceAfterTax && data.priceAfterTax > 0) {
          finalPriceAfterTax = data.priceAfterTax;
        } else if (data.totalTax && data.totalTax > 0) {
          finalPriceAfterTax = data.totalAmount + data.totalTax;
        }
        setFinalPrice({
          totalAmount: data.totalAmount,
          currencyCode: data.dailyBreakdown?.[0]?.currencyCode || "USD",
          tax: Array.isArray(data.tax) ? data.tax : [],
          totalTax: data.totalTax || 0,
          priceAfterTax: finalPriceAfterTax,
          breakdown: data.breakdown
        });
        setPriceStatus('loaded');
      } else {
        throw new Error(response.data.message || 'Failed to fetch price');
      }
    } catch (error: any) {
      setAvailabilityStatus('unavailable');
      setPriceStatus('error');
      const msg = error.response?.data?.message || t('BookingTabs.AmendReservationModal.errors.roomNotAvailable');
      setAmendmentMessage({ type: 'error', text: msg });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Submit
  const handleSubmitAmendment = async () => {
    if (!validateForm()) {
      setAmendmentMessage({ type: 'error', text: t('BookingTabs.AmendReservationModal.errors.correctFormErrors') });
      return;
    }

    if (availabilityStatus !== 'available' || priceStatus !== 'loaded' || !finalPrice) {
      setAmendmentMessage({ type: 'error', text: t('Please check availability first') });
      return;
    }

    setLoading(true);
    try {
      const finalPriceValue = finalPrice.priceAfterTax || finalPrice.totalAmount || 0;

      const amendedData = {
        reservationId: booking.reservationId,
        hotelCode: booking.hotelCode,
        hotelName: booking.hotelName,
        ratePlanCode,
        numberOfRooms: rooms,
        roomTypeCode,
        roomTotalPrice: finalPriceValue,
        currencyCode: finalPrice.currencyCode || booking.currencyCode,
        email: booking.email,
        phone: booking.phone,
        checkInDate: checkInDate!.format('YYYY-MM-DD'),
        checkOutDate: checkOutDate!.format('YYYY-MM-DD'),
        guests: guests.map(g => ({
          firstName: g.firstName,
          lastName: g.lastName,
          dob: g.dob || "",
          category: getGuestType(g.dob ?? undefined),
        })),
      };

      const token = Cookies.get("accessToken");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/update-reservation/${booking.reservationId}`,
        amendedData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAmendmentMessage({ type: 'success', text: t('BookingTabs.AmendReservationModal.success.reservationAmended') });
      setTimeout(() => onAmendComplete(booking._id, amendedData), 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || t('BookingTabs.AmendReservationModal.errors.unableToAmend');
      setAmendmentMessage({ type: 'error', text: msg });
      console.error("Amendment error:", msg);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = availabilityStatus === 'available' && priceStatus === 'loaded' && finalPrice;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-noto-sans p-3 sm:p-5">
      <div ref={modalContentRef} className="bg-tripswift-off-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">        {/* Header */}
        <div className="text-center mb-2 sm:mb-4 relative">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            aria-label={t('close')}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          <h3 className="text-xl sm:text-2xl font-tripswift-bold text-tripswift-black">
            {t('BookingTabs.AmendReservationModal.title')}
          </h3>
          <p className="text-sm sm:text-base text-tripswift-black/60 mt-1 sm:mt-2 max-w-lg mx-auto">
            {booking.hotelName}
          </p>
        </div>

        {/* Original booking details */}
        <div className="bg-gradient-to-r from-tripswift-blue/10 to-tripswift-blue/5 rounded-xl p-3 sm:p-4 mb-2 sm:mb-4">
          <h4 className="text-base sm:text-lg font-tripswift-bold text-tripswift-blue mb-3 sm:mb-4 flex items-center">
            <Info className={`h-4 w-4 sm:h-5 sm:w-5 ${i18n.language === "ar" ? "ml-1.5 sm:ml-2" : "mr-1.5 sm:mr-2"}`} />
            {t('BookingTabs.AmendReservationModal.currentBookingDetails')}
          </h4>
          <div className="flex flex-row flex-wrap gap-3 sm:gap-4">
            {/* Stay Dates */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <div className="w-8 sm:w-10 rounded-full bg-tripswift-off-white flex items-center justify-center mr-2 ml-2 sm:mr-3 shadow-sm flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.stayDates')}
                  </p>
                  <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                    {i18n.language === 'ar'
                      ? `${dayjs(booking.checkOutDate).format('MMM D, YYYY')} - ${dayjs(booking.checkInDate).format('MMM D, YYYY')}`
                      : `${dayjs(booking.checkInDate).format('MMM D, YYYY')} - ${dayjs(booking.checkOutDate).format('MMM D, YYYY')}`
                    }
                  </p>
                  <p className="text-[10px] sm:text-xs text-tripswift-black/50 mt-0.5 sm:mt-1">
                    {t('BookingTabs.AmendReservationModal.nightsCount', {
                      count: dayjs(booking.checkOutDate).diff(dayjs(booking.checkInDate), 'day')
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <div className="w-8 sm:w-10 rounded-full bg-tripswift-off-white flex items-center justify-center mr-2 ml-2 sm:mr-3 shadow-sm flex-shrink-0">
                  <BedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.roomDetails')}
                  </p>
                  <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                    {roomTypeCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Rate Plan */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <div className="w-8  sm:w-10 rounded-full bg-tripswift-off-white flex items-center justify-center mr-2 ml-2 sm:mr-3 shadow-sm flex-shrink-0">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.ratePlan')}
                  </p>
                  <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                    {ratePlanCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Reused Components */}
        <DateSelectionCard
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          rooms={rooms}
          guestsCount={guests.length}
          onCheckInChange={(date) => {
            setCheckInDate(date);
            setErrors(prev => ({ ...prev, checkInDate: '', dates: '' }));
          }}
          onCheckOutChange={(date) => {
            setCheckOutDate(date);
            setErrors(prev => ({ ...prev, checkOutDate: '', dates: '' }));
          }}
          onRoomsChange={handleRoomsChange}
          disabledDate={disabledDate}
          disabledCheckOutDate={disabledCheckOutDate}
          errors={errors}
        />

        <GuestManagementCard
          guests={guests}
          onAddGuest={() => {
            setGuests(prev => [...prev, {
              id: crypto.randomUUID(),
              firstName: "",
              lastName: "",
              dob: getDefaultDOBByType('adult'),
              type: 'adult'
            }]);
          }}
          onUpdateGuest={(id, field, value) => {
            setGuests(prev =>
              prev.map(g => g.id === id ? { ...g, [field]: value } : g)
            );
            setErrors(prev => ({ ...prev, [`${id}-${String(field)}`]: '' }));
          }}
          onRemoveGuest={(id) => {
            if (guests.length > 1) {
              setGuests(prev => prev.filter(g => g.id !== id));
              setErrors(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(key => {
                  if (key.startsWith(id)) delete updated[key];
                });
                return updated;
              });
            }
          }}
          errors={errors}
          disabledDateForDOB={disabledDateForDOB}
        />

        {/* ✅ Check Availability Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCheckAvailability}
            disabled={isCheckingAvailability}
            className="px-6 py-2.5 bg-tripswift-blue text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isCheckingAvailability ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('Checking...')}
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                {t('Check Availability & Price')}
              </>
            )}
          </button>
        </div>

        {/* Price Display */}
        {finalPrice && availabilityStatus === 'available' && priceStatus === 'loaded' && (
          <div className="mt-4 space-y-3">
            <div className="bg-gradient-to-r from-tripswift-burgundy/5 to-tripswift-burgundy/10 rounded-xl border border-tripswift-burgundy/20 overflow-hidden">
              <div className="px-4 py-3 bg-tripswift-burgundy/10 border-b border-tripswift-burgundy/20">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-tripswift-burgundy" />
                  <h4 className="font-tripswift-bold text-base text-tripswift-black">
                    {t('BookingTabs.AmendReservationModal.priceBreakdown')}
                  </h4>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-tripswift-black/70 font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.baseAmount')}
                  </span>
                  <span className="font-tripswift-medium text-tripswift-black">
                    {finalPrice.currencyCode} {(finalPrice.breakdown?.totalBaseAmount || finalPrice.totalAmount).toFixed(2)}
                  </span>
                </div>
                {(finalPrice.breakdown?.totalAdditionalCharges ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-tripswift-black/70 font-tripswift-medium">
                      {t('BookingTabs.AmendReservationModal.additionalCharges')}
                    </span>
                    <span className="font-tripswift-medium text-tripswift-black">
                      {finalPrice.currencyCode} {finalPrice.breakdown?.totalAdditionalCharges?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}
                {finalPrice.tax && finalPrice.tax.length > 0 && (
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                    <span className="text-tripswift-black/80 font-tripswift-medium">
                      {t('BookingTabs.AmendReservationModal.subtotal')}
                    </span>
                    <span className="font-tripswift-bold text-tripswift-black">
                      {finalPrice.currencyCode} {finalPrice.totalAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {finalPrice.tax && finalPrice.tax.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-tripswift-bold text-tripswift-black/80 flex items-center gap-1.5">
                      <Info className="h-4 w-4" />
                      {t('BookingTabs.AmendReservationModal.taxes')}
                    </h5>
                    {finalPrice.tax.map((taxItem, index) => (
                      <div key={index} className="flex justify-between items-center text-sm pl-4">
                        <span className="text-tripswift-black/70 font-tripswift-medium">
                          {taxItem.name} {taxItem.percentage ? `(${taxItem.percentage}%)` : '(Fixed)'}
                        </span>
                        <span className="font-tripswift-medium text-tripswift-black">
                          {finalPrice.currencyCode} {taxItem.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm pl-4 pt-1 border-t border-gray-100">
                      <span className="text-tripswift-black/80 font-tripswift-bold">
                        {t('BookingTabs.AmendReservationModal.totalTax')}
                      </span>
                      <span className="font-tripswift-bold text-tripswift-black">
                        {finalPrice.currencyCode} {(finalPrice.totalTax || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t-2 border-tripswift-burgundy/30">
                  <span className="text-md font-tripswift-bold text-tripswift-black">
                    {t('BookingTabs.AmendReservationModal.grandTotal')}
                  </span>
                  <span className="text-md font-tripswift-bold text-tripswift-burgundy">
                    {finalPrice.currencyCode} {(finalPrice.priceAfterTax || finalPrice.totalAmount).toFixed(2)}
                  </span>
                </div>
                {finalPrice.breakdown?.averagePerNight && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-tripswift-black/60">
                      {t('BookingTabs.AmendReservationModal.averagePerNight')}: {finalPrice.currencyCode} {finalPrice.breakdown.averagePerNight.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {finalPrice.tax && finalPrice.tax.length > 0 && (
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="font-tripswift-medium">
                  {t('BookingTabs.AmendReservationModal.taxInclusiveNote')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Amendment policies */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 mt-2 mb-2 sm:mb-4 sm:mt-4 overflow-hidden">
          <div className="py-2 sm:py-3 px-3 sm:px-4 bg-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tripswift-black/60" />
              <h4 className="font-tripswift-bold text-sm sm:text-base text-tripswift-black/80">
                {t('BookingTabs.AmendReservationModal.amendmentPolicies')}
              </h4>
            </div>
          </div>
          <div className="p-3 sm:p-5">
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-tripswift-black/70">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-tripswift-blue/70 flex-shrink-0 mt-1.5"></div>
                <span>{t('BookingTabs.AmendReservationModal.policies.dateChanges')}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-tripswift-blue/70 flex-shrink-0 mt-1.5"></div>
                <span>{t('BookingTabs.AmendReservationModal.policies.changes72Hours')}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-tripswift-blue/70 flex-shrink-0 mt-1.5"></div>
                <span>{t('BookingTabs.AmendReservationModal.policies.roomUpgrades')}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-tripswift-blue/70 flex-shrink-0 mt-1.5"></div>
                <span>{t('BookingTabs.AmendReservationModal.policies.reducingStay')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Message display area */}
        {amendmentMessage && (
          <div className={`mb-2 sm:mb-4 p-3 sm:p-4 rounded-xl border flex items-start sm:items-center gap-3 sm:gap-4 ${amendmentMessage.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : amendmentMessage.type === 'warning'
              ? 'bg-amber-50 border--200 text-amber-700'
              : 'bg-red-50 border-red-20amber0 text-red-700'
            }`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${amendmentMessage.type === 'success'
              ? 'bg-green-100'
              : amendmentMessage.type === 'warning'
                ? 'bg-amber-100'
                : 'bg-red-100'
              }`}>
              {amendmentMessage.type === 'success' ? (
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </div>
            <p className="text-xs sm:text-sm font-tripswift-medium">{amendmentMessage.text}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl text-tripswift-black/80 hover:bg-gray-50 font-tripswift-medium transition-colors text-sm sm:text-base mt-1 sm:mt-0"
          >
            {t('BookingTabs.AmendReservationModal.cancel')}
          </button>
          <button
            onClick={handleSubmitAmendment}
            disabled={loading || !canSubmit}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-tripswift-medium transition-all duration-300 ${loading || !canSubmit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-tripswift-blue to-[#054B8F] hover:from-[#054B8F] hover:to-tripswift-blue text-tripswift-off-white'
              }`}
          >
            {loading ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-tripswift-off-white/20 border-t-tripswift-off-white rounded-full animate-spin"></div>
                <span>{t('BookingTabs.AmendReservationModal.processing')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{t('BookingTabs.AmendReservationModal.confirmAmendment')}</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmendReservationModal;