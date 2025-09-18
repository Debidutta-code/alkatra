// src/components/bookingComponents/RebookModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { DatePicker, Input } from "antd";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import dayjs, { Dayjs } from "dayjs";
import { CalendarIcon, X, Check, Users, Calendar, BedDouble, CreditCard, Trash2, Plus, Mail, ArrowLeft } from "lucide-react";
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
import { checkRoomAvailability, getRoomPrice } from "../../api/rebook";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

// Define TypeScript interface for price data
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

interface Guest {
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

  // Extract initial contact from booking or first guest
  const initialContact = {
    email: booking.email || (booking.guestDetails?.[0]?.email || ""),
    phone: booking.phone || (booking.guestDetails?.[0]?.phone || "")
  };

  // State
  const [currentStep, setCurrentStep] = useState<'form' | 'review'>('form');
  const [checkInDate, setLocalCheckInDate] = useState<Dayjs | null>(dayjs().add(1, 'day'));
  const [checkOutDate, setLocalCheckOutDate] = useState<Dayjs | null>(dayjs().add(2, 'day'));
  const [guests, setGuests] = useState<Guest[]>(() => {
    return booking.guestDetails && booking.guestDetails.length > 0
      ? booking.guestDetails.map(g => ({
        id: crypto.randomUUID(),
        firstName: g.firstName || "",
        lastName: g.lastName || "",
        dob: g.dob || null,
        type: g.type || 'adult'
      }))
      : [{
        id: crypto.randomUUID(),
        firstName: "",
        lastName: "",
        dob: null,
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

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('form');
      setLocalCheckInDate(dayjs().add(1, 'day'));
      setLocalCheckOutDate(dayjs().add(2, 'day'));
      setGuests(
        booking.guestDetails && booking.guestDetails.length > 0
          ? booking.guestDetails.map(g => ({
            id: crypto.randomUUID(),
            firstName: g.firstName || "",
            lastName: g.lastName || "",
            dob: g.dob || null,
            type: g.type || 'adult' // ✅ Preserve existing type or default to 'adult'
          }))
          : [{
            id: crypto.randomUUID(),
            firstName: "",
            lastName: "",
            dob: null,
            type: 'adult' // ✅ Default first guest to 'adult'
          }]
      );
      setContactEmail(booking.email || (booking.guestDetails?.[0]?.email || ""));
      setContactPhone(booking.phone || (booking.guestDetails?.[0]?.phone || ""));
      setRooms(booking.numberOfRooms || 1);
      setIsAvailable(null);
      setFinalPrice(null);
      setPriceData(null);
      setMessage(null);
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

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const disabledDateForDOB = (current: Dayjs) => {
    return current && current > dayjs().endOf('day');
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
      dob: null,
      type: 'adult'
    }]);
  };

  // Remove guest
  const removeGuest = (id: string) => {
    if (guests.length > 1) {
      setGuests(guests.filter(g => g.id !== id));
    } else {
      setMessage({
        type: 'error',
        text: t("At least one guest is required")
      });
    }
  };

  // Update guest field
  const updateGuest = (id: string, field: keyof Guest, value: any) => {
    setGuests(guests.map(g =>
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  // Handle Continue → Check Availability → Show Review
  const handleContinueToReview = async () => {
    if (!checkInDate || !checkOutDate) {
      setMessage({
        type: 'error',
        text: t("Please select both check-in and check-out dates")
      });
      return;
    }

    if (checkOutDate.isSame(checkInDate, 'day') || checkOutDate.isBefore(checkInDate, 'day')) {
      setMessage({
        type: 'error',
        text: t("Check-out date must be after check-in date")
      });
      return;
    }

    const hasEmptyGuest = guests.some(g => {
      const missingName = !g.firstName.trim() || !g.lastName.trim();
      const missingDob = (g.type === 'child' || g.type === 'infant') && !g.dob;
      return missingName || missingDob;
    });

    if (hasEmptyGuest) {
      setMessage({
        type: 'error',
        text: t("Please fill in first name, last name, and date of birth (for children/infants) for all guests")
      });
      return;
    }

    if (!contactEmail.trim()) {
      setMessage({
        type: 'error',
        text: t("Please provide a contact email")
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
        checkInDate.format("YYYY-MM-DD"),
        checkOutDate.format("YYYY-MM-DD")
      );

      setIsAvailable(true);

      // 2. Get Final Price
      const data = await getRoomPrice(
        booking.hotelCode,
        booking.roomTypeCode,
        checkInDate.format("YYYY-MM-DD"),
        checkOutDate.format("YYYY-MM-DD"),
        guests.length,
        0,
        0,
        rooms
      );

      let finalPriceAfterTax = data.totalAmount;
      if (data.priceAfterTax && data.priceAfterTax > 0) {
        finalPriceAfterTax = data.priceAfterTax;
      } else if (data.totalTax && data.totalTax > 0) {
        finalPriceAfterTax = data.totalAmount + data.totalTax;
      }

      setFinalPrice(finalPriceAfterTax);
      setLocalCurrency(data.dailyBreakdown?.[0]?.currencyCode || "USD");
      setPriceData(data);

      setCurrentStep('review');
      setMessage({
        type: 'success',
        text: t("Ready to review your booking.")
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

  const handleProceedToPayment = () => {
    if (finalPrice === null || !checkInDate || !checkOutDate) return;
  
    const hasEmptyGuest = guests.some(g => !g.firstName.trim() || !g.lastName.trim());
    if (hasEmptyGuest) {
      setMessage({
        type: 'error',
        text: t("Please complete all guest details before proceeding")
      });
      return;
    }
  
    if (!contactEmail.trim()) {
      setMessage({
        type: 'error',
        text: t("Please provide a contact email")
      });
      return;
    }
  
    // ✅ STEP 1: CLEAR OLD STATE
    dispatch(resetPmsHotelCard());
  
    // ✅ Get roomId and propertyId from original booking
    const roomId = booking.roomId || "";
    const propertyId = booking.propertyId || "";
  
    // ✅ STEP 2: Dispatch ALL required data
    dispatch(setHotelCode(booking.hotelCode));
    dispatch(setHotelName(booking.hotelName));
    dispatch(setRoomType(booking.roomTypeCode));
    dispatch(setCheckInDate(checkInDate.format("YYYY-MM-DD")));
    dispatch(setCheckOutDate(checkOutDate.format("YYYY-MM-DD")));
    dispatch(setAmount(finalPrice));
    dispatch(setCurrency(localCurrency));
    dispatch(setRequestedRooms(rooms.toString()));
    dispatch(setRoomId(roomId));          // ✅ Add this
    dispatch(setPropertyId(propertyId));  // ✅ Add this
  
    const guestDetailsPayload = {
      guests: guests,
      rooms: rooms,
      adults: guests.length,
      children: 0,
      infants: 0,
      email: contactEmail,
      phone: contactPhone,
    };
  
    dispatch(setGuestDetails(guestDetailsPayload));
    dispatch(setRatePlanCode("Non-refundable"));
  
    onClose();
    router.push("/payment");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-noto-sans p-3 sm:p-5">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("Rebook Your Stay")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {booking.hotelName}
            </p>
            {currentStep === 'review' && (
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {t("Review")}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Show Form Step */}
          {currentStep === 'form' && (
            <>
              {/* Date Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    {t("Select New Dates")}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {t("Check-in Date")}
                    </Label>
                    <div className="relative">
                      <div className="flex items-center bg-gray-50 rounded-md border border-gray-200">
                        <CalendarIcon className="h-4 w-4 text-blue-600 absolute left-3" />
                        <DatePicker
                          value={checkInDate}
                          onChange={setLocalCheckInDate}
                          disabledDate={disabledDate}
                          format="DD/MM/YYYY"
                          className="w-full pl-8 bg-transparent border-none focus:ring-0"
                          placeholder={t("Select check-in")}
                          suffixIcon={null}
                          size="large"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {t("Check-out Date")}
                    </Label>
                    <div className="relative">
                      <div className="flex items-center bg-gray-50 rounded-md border border-gray-200">
                        <CalendarIcon className="h-4 w-4 text-blue-600 absolute left-3" />
                        <DatePicker
                          value={checkOutDate}
                          onChange={setLocalCheckOutDate}
                          disabledDate={disabledCheckOutDate}
                          format="DD/MM/YYYY"
                          className="w-full pl-8 bg-transparent border-none focus:ring-0"
                          placeholder={t("Select check-out")}
                          suffixIcon={null}
                          size="large"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t("Number of Rooms")}
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={rooms}
                  onChange={(e) => setRooms(parseInt(e.target.value) || 1)}
                  size="large"
                />
              </div>

              {/* Shared Contact Info */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  {t("Contact Information")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {t("Email")}
                    </Label>
                    <div className="px-3 py-2.5 bg-white border border-gray-300 rounded-md text-gray-800">
                      {contactEmail || t("Not provided")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {t("Phone")}
                    </Label>
                    <div className="px-3 py-2.5 bg-white border border-gray-300 rounded-md text-gray-800">
                      {contactPhone || t("Not provided")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      {t("Guest Details")}
                    </h4>
                  </div>
                  <Button
                    onClick={addGuest}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    {t("Add Guest")}
                  </Button>
                </div>

                <div className="space-y-4">
                  {guests.map((guest, index) => (
                    <div key={guest.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative group">
                      {guests.length > 1 && (
                        <button
                          onClick={() => removeGuest(guest.id)}
                          className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        {t("Guest")} {index + 1}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">
                            {t("First Name")}
                          </Label>
                          <Input
                            value={guest.firstName}
                            onChange={(e) => updateGuest(guest.id, 'firstName', e.target.value)}
                            placeholder={t("Enter first name")}
                            size="large"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">
                            {t("Last Name")}
                          </Label>
                          <Input
                            value={guest.lastName}
                            onChange={(e) => updateGuest(guest.id, 'lastName', e.target.value)}
                            placeholder={t("Enter last name")}
                            size="large"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">
                            {t("Guest Type")}
                          </Label>
                          <select
                            value={guest.type}
                            onChange={(e) => updateGuest(guest.id, 'type', e.target.value as 'adult' | 'child' | 'infant')}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            size={1}
                          >
                            <option value="adult">{t("Adult")}</option>
                            <option value="child">{t("Child")}</option>
                            <option value="infant">{t("Infant")}</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-600">
                            {t("Date of Birth")}
                          </Label>
                          <div className="relative">
                            <div className="flex items-center bg-white rounded-md border border-gray-300">
                              <CalendarIcon className="h-4 w-4 text-blue-600 absolute left-3" />
                              <DatePicker
                                value={guest.dob ? dayjs(guest.dob) : null}
                                onChange={(date) => updateGuest(guest.id, 'dob', date ? date.format("YYYY-MM-DD") : null)}
                                disabledDate={disabledDateForDOB}
                                format="DD/MM/YYYY"
                                className="w-full pl-8 bg-transparent border-none focus:ring-0"
                                placeholder={t("Select DOB")}
                                suffixIcon={null}
                                size="large"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BedDouble className="h-5 w-5 text-blue-600" />
                  <h5 className="font-medium text-gray-900">{t("Room Details")}</h5>
                </div>
                <p className="text-sm text-gray-600">
                  {t("Room Type")}: {booking.roomTypeCode}
                </p>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : message.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'success'
                    ? 'bg-green-100'
                    : message.type === 'error'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                    }`}>
                    {message.type === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isChecking}
                  className="px-6 py-2.5"
                >
                  {t("Cancel")}
                </Button>

                <Button
                  onClick={handleContinueToReview}
                  disabled={isChecking}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700"
                >
                  {isChecking ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>{t("Checking Availability...")}</span>
                    </div>
                  ) : (
                    t("Continue to Review")
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Show Review Step */}
          {currentStep === 'review' && isAvailable && finalPrice !== null && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Check className="h-5 w-5 text-blue-600 mr-2" />
                  {t("Booking Summary")}
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-500">{t("Hotel")}</div>
                      <div className="font-medium">{booking.hotelName}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">{t("Room Type")}</div>
                      <div className="font-medium">{booking.roomTypeCode}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-500">{t("Check-in")}</div>
                      <div className="font-medium">{checkInDate?.format("DD MMM YYYY")}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">{t("Check-out")}</div>
                      <div className="font-medium">{checkOutDate?.format("DD MMM YYYY")}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500">{t("Nights")}</div>
                    <div className="font-medium">
                      {checkInDate && checkOutDate ? checkOutDate.diff(checkInDate, 'day') : 0} {t("nights")}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500">{t("Guests")}</div>
                    <div className="font-medium">{guests.length} {t("Adults")}</div>
                  </div>

                  <div>
                    <div className="text-gray-500">{t("Rooms")}</div>
                    <div className="font-medium">{rooms}</div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-gray-500">{t("Contact Email")}</div>
                    <div className="font-medium">{contactEmail}</div>
                  </div>

                  {contactPhone && (
                    <div>
                      <div className="text-gray-500">{t("Contact Phone")}</div>
                      <div className="font-medium">{contactPhone}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    {t("Price Details")}
                  </h4>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{t("Total Amount (incl. taxes)")}: </span>
                    <span className="text-green-600">
                      {localCurrency} {finalPrice?.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {priceData?.tax && priceData.tax.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                      <div className="font-medium">{t("Taxes & Fees")}:</div>
                      {priceData.tax.map((taxItem, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{taxItem.name} ({taxItem.percentage}%)</span>
                          <span>{localCurrency} {taxItem.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Review Step Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6">
                <Button
                  onClick={() => setCurrentStep('form')}
                  variant="outline"
                  className="px-6 py-2.5 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("Back to Details")}
                </Button>

                <Button
                  onClick={handleProceedToPayment}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  <span>{t("Proceed to Payment")}</span>
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