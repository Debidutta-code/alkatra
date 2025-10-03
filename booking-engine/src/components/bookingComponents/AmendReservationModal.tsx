'use client';

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DatePicker, Select, Input } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { Booking, GuestDetails } from './bookingTabs/types';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setGuestDetails } from '../../Redux/slices/hotelcard.slice';
import GuestBox from "../hotelBox/GuestBox";
import Cookies from "js-cookie";
import { getDefaultDOBByType, getGuestType } from '../../utils/guestDobHelpers';
import { useSelector } from "../../Redux/store";
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

interface AmendReservationModalProps {
  booking: Booking;
  onClose: () => void;
  onAmendComplete: (bookingId: string, amendedData: any) => void;
}

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const AmendReservationModal: React.FC<AmendReservationModalProps> = ({
  booking,
  onClose,
  onAmendComplete
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // States for form fields
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [roomTypeCode, setRoomTypeCode] = useState(booking.roomTypeCode || "");
  const [ratePlanCode, setRatePlanCode] = useState(booking.ratePlanCode || "");
  const [guests, setGuests] = useState<GuestDetails[]>([]);
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [priceStatus, setPriceStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [finalPrice, setFinalPrice] = useState<{
    totalAmount: number;
    currencyCode: string;
    tax?: Array<{
      name: string;
      percentage?: number;
      type?: string;
      amount: number
    }>;
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
  const { guestDetails } = useSelector((state) => state.hotel);
  // UI control states
  const [amendmentType, setAmendmentType] = useState<"dates" | "room" | "guests" | "requests">("dates");
  const [loading, setLoading] = useState(false);
  const [amendmentMessage, setAmendmentMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  // Initialize guestBreakdown based on booking.guestDetails
  const [guestBreakdown, setGuestBreakdown] = useState(() => {
    const adults = booking.guestDetails?.filter(g => g.type === "adult" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') >= 12))?.length || 1;
    const children = booking.guestDetails?.filter(g => g.type === "child" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 12 && dayjs().diff(dayjs(g.dob), 'year') >= 2))?.length || 0;
    const infants = booking.guestDetails?.filter(g => g.type === "infant" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 2))?.length || 0;

    return {
      rooms: guestDetails?.rooms || booking.numberOfRooms || 1,
      guests: adults,
      children: children,
      childAges: booking.guestDetails
        ?.filter(g => g.type === "child" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 12 && dayjs().diff(dayjs(g.dob), 'year') >= 2))
        .map(g => dayjs().diff(dayjs(g.dob), 'year')) || [],
      infants: infants,
      infantAges: booking.guestDetails
        ?.filter(g => g.type === "infant" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 2))
        .map(g => dayjs().diff(dayjs(g.dob), 'year')) || [],
      childDOBs: booking.guestDetails
        ?.filter(g => g.type === "child" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 12 && dayjs().diff(dayjs(g.dob), 'year') >= 2))
        .map(g => g.dob) || [],
      infantDOBs: booking.guestDetails
        ?.filter(g => g.type === "infant" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 2))
        .map(g => g.dob) || []
    };
  });

  // Update useEffect to sync guests with DOBs from GuestBox
  useEffect(() => {
    if (booking.guestDetails && Array.isArray(booking.guestDetails) && booking.guestDetails.length > 0) {
      dispatch(setGuestDetails({
        rooms: guestDetails?.rooms || booking.numberOfRooms || 1,
        guests: guestBreakdown.guests,
        children: guestBreakdown.children,
        childAges: guestBreakdown.childAges,
        infants: guestBreakdown.infants,
        infantAges: guestBreakdown.infantAges,
        childDOBs: guestBreakdown.childDOBs,
        infantDOBs: guestBreakdown.infantDOBs
      }));
    }
  }, [booking.guestDetails, guestBreakdown, dispatch]);

  // Initialize Redux guestDetails with booking.guestDetails
  useEffect(() => {
    if (booking.guestDetails && Array.isArray(booking.guestDetails) && booking.guestDetails.length > 0) {
      const adults = booking.guestDetails.filter(g => g.type === "adult" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') >= 12)).length;
      const children = booking.guestDetails.filter(g => g.type === "child" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 12 && dayjs().diff(dayjs(g.dob), 'year') >= 2)).length;
      const infants = booking.guestDetails.filter(g => g.type === "infant" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 2)).length;

      dispatch(setGuestDetails({
        rooms: guestDetails?.rooms || booking.numberOfRooms || 1,
        guests: adults,
        children: children,
        childAges: booking.guestDetails
          .filter(g => g.type === "child" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 12 && dayjs().diff(dayjs(g.dob), 'year') >= 2))
          .map(g => dayjs().diff(dayjs(g.dob), 'year')),
        infants: infants,
        infantAges: booking.guestDetails
          .filter(g => g.type === "infant" || (g.dob && dayjs().diff(dayjs(g.dob), 'year') < 2))
          .map(g => dayjs().diff(dayjs(g.dob), 'year'))
      }));
    }
  }, [booking.guestDetails, dispatch]);

  // Populate guests state from booking on mount
  useEffect(() => {
    if (booking.guestDetails && Array.isArray(booking.guestDetails) && booking.guestDetails.length > 0) {
      setGuests(booking.guestDetails.map(g => ({
        firstName: g.firstName || "",
        lastName: g.lastName || "",
        dob: g.dob || getDefaultDOBByType(g.type as "adult" | "child" | "infant"),
        type: g.type || getGuestType(g.dob)
      })));
    } else {
      setGuests([{
        firstName: "",
        lastName: "",
        dob: getDefaultDOBByType("adult"),
        type: "adult"
      }]);
    }
  }, [booking.guestDetails]);

  // Sync guests state with guestBreakdown changes
  useEffect(() => {
    // Helper function to filter guests by type
    const filterGuestsByType = (type: "adult" | "child" | "infant") => {
      return (booking.guestDetails || []).filter(g => (g.type || getGuestType(g.dob)) === type);
    };

    // Get existing guests by type
    const existingAdults = filterGuestsByType("adult");
    const existingChildren = filterGuestsByType("child");
    const existingInfants = filterGuestsByType("infant");

    let newGuests: GuestDetails[] = [];
    console.log("new guest data", newGuests)

    // Add adults preserving existing data or adding new default guests
    for (let i = 0; i < guestBreakdown.guests; i++) {
      const guest = existingAdults[i] || {
        firstName: "",
        lastName: "",
        dob: getDefaultDOBByType("adult"),
        type: "adult"
      };
      newGuests.push(guest);
    }

    // Add children preserving existing data or adding new default guests
    for (let i = 0; i < guestBreakdown.children; i++) {
      const guest = existingChildren[i] || {
        firstName: "",
        lastName: "",
        dob: guestBreakdown.childDOBs[i] || getDefaultDOBByType("child"),
        type: "child"
      };
      newGuests.push(guest);
    }

    // Add infants preserving existing data or adding new default guests
    for (let i = 0; i < guestBreakdown.infants; i++) {
      const guest = existingInfants[i] || {
        firstName: "",
        lastName: "",
        dob: guestBreakdown.infantDOBs[i] || getDefaultDOBByType("infant"),
        type: "infant"
      };
      newGuests.push(guest);
    }

    setGuests(newGuests);
  }, [guestBreakdown, booking.guestDetails]);
  // Guest count derived

  // Initialize with current booking values
  useEffect(() => {
    if (booking.checkInDate && booking.checkOutDate) {
      setDateRange([
        dayjs(booking.checkInDate),
        dayjs(booking.checkOutDate)
      ]);
    }
  }, [booking]);

  // Lock body scroll when modal opens, restore when closes
  useEffect(() => {
    // Store the original styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyWidth = document.body.style.width;
    const originalBodyTop = document.body.style.top;

    // Get the current scroll position to prevent jumping
    const scrollPosition = window.scrollY;

    // Lock the body and html scroll
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollPosition}px`;

    return () => {
      // Restore the original styles
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.width = originalBodyWidth;
      document.body.style.top = originalBodyTop;

      // Restore the scroll position
      window.scrollTo(0, scrollPosition);
    };
  }, []);

  useEffect(() => {
    const checkAvailabilityAndPrice = async () => {
      // Reset states
      setAvailabilityStatus('idle');
      setPriceStatus('idle');
      setFinalPrice(null);
      setAmendmentMessage(null);

      // Validate required fields
      if (!dateRange?.[0] || !dateRange?.[1] || !roomTypeCode) {
        return;
      }

      // Step 1: Check Availability First
      setAvailabilityStatus('checking');

      try {
        await checkRoomAvailability(
          booking.hotelCode,
          roomTypeCode,
          dateRange[0].format('YYYY-MM-DD'),
          dateRange[1].format('YYYY-MM-DD')
        );

        setAvailabilityStatus('available');

        // Step 2: Only fetch price if room is available
        setPriceStatus('loading');

        const guestData = {
          rooms: guestBreakdown.rooms,
          guests: guestBreakdown.guests,
          children: guestBreakdown.children,
          infants: guestBreakdown.infants,
        };

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/getRoomRentPrice`,
          {
            hotelCode: booking.hotelCode,
            invTypeCode: roomTypeCode,
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD'),
            noOfChildrens: guestData.children,
            noOfAdults: guestData.guests,
            noOfRooms: guestData.rooms,
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
            currencyCode: data.dailyBreakdown[0]?.currencyCode || "USD",
            tax: data.tax && Array.isArray(data.tax) && data.tax.length > 0 ? data.tax : [],
            totalTax: data.totalTax || 0,
            priceAfterTax: finalPriceAfterTax,
            breakdown: data.breakdown
          });

          setPriceStatus('loaded');
        } else {
          setPriceStatus('error');
          setAmendmentMessage({
            type: 'error',
            text: response.data.message || t('BookingTabs.AmendReservationModal.errors.unableToFetchPrice')
          });
        }

      } catch (error: any) {
        // Always reset loading states on error
        setAvailabilityStatus('unavailable');
        setPriceStatus('idle');
        setFinalPrice(null);

        // Parse error message to show user-friendly text
        let userMessage = '';

        if (error.response?.status === 500 || error.response?.data?.message?.includes('closed') || error.response?.data?.message?.includes('not available')) {
          userMessage = t('BookingTabs.AmendReservationModal.errors.roomNotAvailable');
        } else if (error.response?.status === 404) {
          userMessage = t('BookingTabs.AmendReservationModal.errors.roomNotFound');
        } else if (error.message?.toLowerCase().includes('network')) {
          userMessage = t('BookingTabs.AmendReservationModal.errors.networkError');
        } else {
          userMessage = t('BookingTabs.AmendReservationModal.errors.roomNotAvailable');
        }

        setAmendmentMessage({
          type: 'error',
          text: userMessage
        });

        console.error('Availability/Price check error:', error.response?.data || error.message);
      }
    };

    // Debounce the API calls to avoid excessive requests
    const timeoutId = setTimeout(checkAvailabilityAndPrice, 500);
    return () => clearTimeout(timeoutId);

  }, [dateRange, roomTypeCode, guestBreakdown, booking.hotelCode, t]);

  // Add loading states to your UI
  const isCheckingAvailability = availabilityStatus === 'checking';
  const isLoadingPrice = priceStatus === 'loading';
  const canSubmit = availabilityStatus === 'available' && priceStatus === 'loaded' && finalPrice;
  // --- Guests UI handlers ---
  const handleGuestChange = (idx: number, field: keyof GuestDetails, value: string) => {
    console.log("handleGuestChange called with:", { idx, field, value });
    setGuests(gs => {
      const updatedGuests = gs.map((g, i) => i === idx ? { ...g, [field]: value } : g);
      console.log("updated guests:", updatedGuests);
      return updatedGuests;
    });
  };
  console.log("guests", guests)
  const getFinalPrice = async (
    selectedRoom: any,
    checkInDate: string,
    checkOutDate: string,
    guestData: any
  ) => {
    try {
      const finalPriceResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/getRoomRentPrice`,
        {
          hotelCode: booking.hotelCode,
          invTypeCode: selectedRoom?.room_type,
          startDate: checkInDate,
          endDate: checkOutDate,
          noOfChildrens: guestData?.children,
          noOfAdults: guestData?.guests,
          noOfRooms: guestData?.rooms,
        },
        { withCredentials: true }
      );

      if (finalPriceResponse.data.success) {
        const data = finalPriceResponse.data.data;

        // Calculate final price based on whether taxes exist
        if (data.priceAfterTax && data.priceAfterTax > 0) {
          // If priceAfterTax exists and is greater than 0, use it
          return data.priceAfterTax;
        } else if (data.totalTax && data.totalTax > 0) {
          // If totalTax exists, add it to totalAmount
          return data.totalAmount + data.totalTax;
        } else {
          // No taxes, use totalAmount
          return data.totalAmount;
        }
      } else {
        throw new Error(finalPriceResponse.data.message);
      }
    } catch (error: any) {
      throw new Error(error.message || "Error while getting final price");
    }
  };
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // --- Submit logic ---
  const handleSubmitAmendment = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      setAmendmentMessage({
        type: 'error',
        text: t('BookingTabs.AmendReservationModal.errors.selectValidDates')
      });
      return;
    }
    let valid = true;
    const newErrors: { [key: string]: string } = {};

    // Validate Date Range
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      newErrors["dateRange"] = t('BookingTabs.AmendReservationModal.errors.selectValidDates');
      valid = false;
    } else if (dateRange[0].isSame(dateRange[1], 'day') || dateRange[0].isAfter(dateRange[1], 'day')) {
      newErrors["dateRange"] = t('BookingTabs.AmendReservationModal.errors.invalidDateRange');
      valid = false;
    }

    // Validate Guests
    guests.forEach((guest, idx) => {
      if (!guest.firstName || !/^[A-Za-z\s]+$/.test(guest.firstName)) {
        newErrors[`firstName-${idx}`] = t('BookingTabs.AmendReservationModal.errors.invalidFirstName');
        valid = false;
      }
      if (!guest.lastName || !/^[A-Za-z\s]+$/.test(guest.lastName)) {
        newErrors[`lastName-${idx}`] = t('BookingTabs.AmendReservationModal.errors.invalidLastName');
        valid = false;
      }
      if (!guest.dob) {
        newErrors[`dob-${idx}`] = t('BookingTabs.AmendReservationModal.errors.dobRequired');
        valid = false;
      }
    });

    // Validate Room Type and Rate Plan (optional, assuming they are required)
    if (!roomTypeCode) {
      newErrors["roomTypeCode"] = t('BookingTabs.AmendReservationModal.errors.selectRoomType');
      valid = false;
    }
    if (!ratePlanCode) {
      newErrors["ratePlanCode"] = t('BookingTabs.AmendReservationModal.errors.selectRatePlan');
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      setAmendmentMessage({
        type: 'error',
        text: t('BookingTabs.AmendReservationModal.errors.correctFormErrors'),
      });
      return;
    }

    setLoading(true);

    try {
      const guestData = {
        rooms: guestBreakdown.rooms,
        guests: guestBreakdown.guests,
        children: guestBreakdown.children,
        infants: guestBreakdown.infants,
      };

      // Get the actual final price value
      const finalPriceValue = await getFinalPrice(
        { room_type: roomTypeCode },
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        guestData
      );

      const amendedData = {
        reservationId: booking.reservationId,
        hotelCode: booking.hotelCode,
        hotelName: booking.hotelName,
        ratePlanCode: ratePlanCode,
        numberOfRooms: guestBreakdown.rooms,
        roomTypeCode: roomTypeCode,
        roomTotalPrice: finalPriceValue,
        currencyCode: finalPrice?.currencyCode || booking.currencyCode,
        email: booking.email,
        phone: booking.phone,
        checkInDate: dateRange[0].format('YYYY-MM-DD'),
        checkOutDate: dateRange[1].format('YYYY-MM-DD'),
        guests: guests.map(g => ({
          firstName: g.firstName,
          lastName: g.lastName,
          dob: g.dob || "",
          category: getGuestType(g.dob),
        })),
      };

      const token = Cookies.get("accessToken");

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/update-reservation/${booking.reservationId}`,
        amendedData,
        {
          withCredentials: true,
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        }
      );

      setAmendmentMessage({
        type: 'success',
        text: t('BookingTabs.AmendReservationModal.success.reservationAmended'),
      });

      setTimeout(() => {
        onAmendComplete(booking._id, amendedData);
      }, 2000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t('BookingTabs.AmendReservationModal.errors.unableToAmend');
      setAmendmentMessage({
        type: 'error',
        text: errorMessage,
      });
      // Optionally, you can also log the error or handle specific error codes here
      console.error("Amendment submission error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Existing reason logic - not used in backend payload, kept for UI

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-noto-sans p-3 sm:p-5">
      <div ref={modalContentRef} className="bg-tripswift-off-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">        {/* Header */}
        <div className="text-center mb-2 sm:mb-4">
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

        {/* Amendment type selector */}
        <div className="mb-2 sm:mb-4">
          <h4 className="font-tripswift-medium text-tripswift-black mb-2 sm:mb-3 text-sm sm:text-base">
            {t('BookingTabs.AmendReservationModal.whatToChange')}
          </h4>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setAmendmentType("dates")}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all duration-300 text-xs sm:text-sm
                ${amendmentType === "dates"
                  ? "bg-tripswift-blue text-tripswift-off-white border-tripswift-blue"
                  : "bg-tripswift-off-white text-tripswift-black/70 border-gray-200 hover:border-tripswift-blue/50 hover:bg-tripswift-blue/5"}
              `}
            >
              <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-tripswift-medium">{t('BookingTabs.AmendReservationModal.amendmentTypes.dates')}</span>
            </button>
            <button
              onClick={() => setAmendmentType("guests")}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all text-xs sm:text-sm
                ${amendmentType === "guests"
                  ? "bg-tripswift-blue text-white border-tripswift-blue"
                  : "bg-white text-tripswift-black/70 border-gray-200 hover:border-tripswift-blue/50 hover:bg-tripswift-blue/5"}
              `}
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-tripswift-medium">{t('BookingTabs.AmendReservationModal.amendmentTypes.guests')}</span>
            </button>
          </div>
        </div>

        {/* Amendment form fields */}
        <div className="bg-tripswift-off-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 md:p-6 mb-2 sm:mb-4 transition duration-300">
          {/* Dates Amendment Form */}
          {amendmentType === "dates" && (
            <div className="space-y-2 bg-white p-3 sm:p-4 rounded-lg border border-tripswift-blue/20">
              {/* Add availability status messages */}
              {availabilityStatus === 'checking' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md text-sm text-blue-700 mb-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  {t('BookingTabs.AmendReservationModal.checkingAvailability')}
                </div>
              )}

              {availabilityStatus === 'unavailable' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-md text-sm text-red-700 mb-2">
                  <X className="h-4 w-4" />
                  {t('BookingTabs.AmendReservationModal.errors.roomNotAvailable')}
                </div>
              )}

              {priceStatus === 'loading' && availabilityStatus === 'available' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md text-sm text-blue-700 mb-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  {t('BookingTabs.AmendReservationModal.loadingPrice')}
                </div>
              )}
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-tripswift-blue mr-2 ml-2" />
                <h4 className="text-base sm:text-lg font-tripswift-bold text-tripswift-black">
                  {t('BookingTabs.AmendReservationModal.changeDates')}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                {/* Check-in Date */}
                <div>
                  <label className="block text-xs font-tripswift-medium text-tripswift-black/70">
                    {t('BookingTabs.AmendReservationModal.checkInDate')}
                  </label>
                  <div className="relative mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-tripswift-blue/70 absolute left-2.5 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none" />
                    <DatePicker
                      value={dateRange?.[0]}
                      onChange={(date) => {
                        const newRange = [date, dateRange?.[1]];
                        setDateRange(newRange as [Dayjs, Dayjs]);
                        setErrors((prev) => ({ ...prev, dateRange: '' }));
                      }}
                      disabledDate={(current) => {
                        return current && current < dayjs().add(1, 'day').startOf('day');
                      }}
                      format="DD/MM/YYYY"
                      className="w-full pl-8 bg-tripswift-off-white rounded-md border border-tripswift-blue/20"
                      style={{ height: '40px' }}
                      placeholder={t('BookingTabs.AmendReservationModal.selectCheckIn')}
                      suffixIcon={null}
                    />
                  </div>
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-xs font-tripswift-medium text-tripswift-black/70">
                    {t('BookingTabs.AmendReservationModal.checkOutDate')}
                  </label>
                  <div className="relative mt-0.5">
                    <div className="flex items-center bg-tripswift-off-white rounded-md border border-tripswift-blue/20 overflow-hidden">
                      <div className="absolute left-2.5 z-10 pointer-events-none">
                        <Calendar className="h-3.5 w-3.5 text-tripswift-blue/70" />
                      </div>
                      <DatePicker
                        value={dateRange?.[1]}
                        onChange={(date) => {
                          const newRange = [dateRange?.[0], date];
                          setDateRange(newRange as [Dayjs, Dayjs]);
                          setErrors((prev) => ({ ...prev, dateRange: '' }));
                        }}
                        disabledDate={current => {
                          if (!dateRange?.[0]) return current && current <= dayjs();
                          return current && current <= dateRange[0];
                        }}
                        format="DD/MM/YYYY"
                        className="w-full pl-8 bg-transparent border-none focus:ring-0 text-sm"
                        style={{
                          height: '40px',
                          backgroundColor: 'transparent'
                        }}
                        placeholder={t('BookingTabs.AmendReservationModal.selectCheckOut')}
                        suffixIcon={null}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {errors["dateRange"] && (
                <div className="px-2 py-1 bg-red-50 border border-red-200 rounded-md text-xs">
                  <p className="text-red-600 flex items-center">
                    <AlertCircle className="h-3.5 w-3.5 mr-2 ml-2" />
                    {errors["dateRange"]}
                  </p>
                </div>
              )}

              {dateRange && dateRange[0] && dateRange[1] && (
                <div className="px-2 py-1.5 bg-tripswift-blue/10 rounded-md text-xs">
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 text-tripswift-blue mr-2 ml-2" />
                    <span>
                      {t('BookingTabs.AmendReservationModal.stayDuration', {
                        count: dateRange[1].diff(dateRange[0], 'day')
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guests Amendment Form */}
          {amendmentType === "guests" && (
            <div className="space-y-2 sm:space-y-3">
              <GuestBox
                onChange={(breakdown) => setGuestBreakdown((prev) => ({ ...prev, ...breakdown }))}
              />
              <div className="flex flex-col gap-2 mt-2">
                {guests.map((guest, idx) => {
                  const guestType: "adult" | "child" | "infant" = guest.type || getGuestType(guest.dob);
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row gap-1 sm:gap-2 border border-gray-200 rounded-md p-2 bg-white relative">
                      <div className="flex-1 flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <div className="flex-1">
                          <Input
                            className="flex-1"
                            placeholder={
                              guestType === "adult"
                                ? t('BookingTabs.AmendReservationModal.adultFirstName', { defaultValue: "Adult First Name" })
                                : guestType === "child"
                                  ? t('BookingTabs.AmendReservationModal.childFirstName', { defaultValue: "Child First Name" })
                                  : t('BookingTabs.AmendReservationModal.infantFirstName', { defaultValue: "Infant First Name" })
                            }
                            value={guest.firstName}
                            onChange={e => {
                              handleGuestChange(idx, 'firstName', e.target.value);
                              setErrors(prev => ({ ...prev, [`firstName-${idx}`]: '' }));
                            }}
                            size="large"
                          />
                          {errors[`firstName-${idx}`] && (
                            <p className="text-xs text-red-600 mt-0.5">{errors[`firstName-${idx}`]}</p>
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            className="flex-1"
                            placeholder={
                              guestType === "adult"
                                ? t('BookingTabs.AmendReservationModal.adultLastName', { defaultValue: "Adult Last Name" })
                                : guestType === "child"
                                  ? t('BookingTabs.AmendReservationModal.childLastName', { defaultValue: "Child Last Name" })
                                  : t('BookingTabs.AmendReservationModal.infantLastName', { defaultValue: "Infant Last Name" })
                            }
                            value={guest.lastName}
                            onChange={e => {
                              handleGuestChange(idx, 'lastName', e.target.value);
                              setErrors(prev => ({ ...prev, [`lastName-${idx}`]: '' }));
                            }}
                            size="large"
                          />
                          {errors[`lastName-${idx}`] && (
                            <p className="text-xs text-red-600 mt-0.5">{errors[`lastName-${idx}`]}</p>
                          )}
                        </div>
                        <div className="flex-1">
                          <DatePicker
                            className="flex-1 w-full"
                            placeholder={t('BookingTabs.AmendReservationModal.dateOfBirth', { defaultValue: "Date of Birth" })}
                            value={guest.dob ? dayjs(guest.dob) : null}
                            onChange={date => {
                              handleGuestChange(idx, 'dob', date?.format('YYYY-MM-DD') || "");
                              setErrors(prev => ({ ...prev, [`dob-${idx}`]: '' }));
                            }}
                            disabledDate={current => {
                              if (!current) return false;
                              if (guestType === "infant") {
                                return current.isBefore(dayjs().subtract(2, "year"), "day") || current.isAfter(dayjs(), "day");
                              } else if (guestType === "child") {
                                return current.isBefore(dayjs().subtract(13, "year"), "day") || current.isAfter(dayjs().subtract(2, "year"), "day");
                              } else {
                                return current.isAfter(dayjs().subtract(13, "year"), "day");
                              }
                            }}
                            format="DD/MM/YYYY"
                            size="large"
                          />
                          {errors[`dob-${idx}`] && (
                            <p className="text-xs text-red-600 mt-0.5">{errors[`dob-${idx}`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Room Type Amendment Form */}
          {amendmentType === "room" && (
            <div className="space-y-3 sm:space-y-5">
              <div className="flex items-center gap-2 mb-2 sm:mb-4">
                <BedDouble className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                <h4 className="text-base sm:text-lg font-tripswift-bold text-tripswift-black">
                  {t('BookingTabs.AmendReservationModal.changeRoomType')}
                </h4>
              </div>
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-tripswift-blue/5 rounded-lg text-xs sm:text-sm text-tripswift-blue/90 font-tripswift-medium flex items-start">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                <span>{t('BookingTabs.AmendReservationModal.roomTypeNote')}</span>
              </div>
            </div>
          )}

          {/* Display Final Price */}
          {finalPrice && availabilityStatus === 'available' && priceStatus === 'loaded' && (
            <div className="mt-4 space-y-3">
              {/* Price Breakdown Section */}
              <div className="bg-gradient-to-r from-tripswift-blue/5 to-tripswift-blue/10 rounded-xl border border-tripswift-blue/20 overflow-hidden">
                <div className="px-4 py-3 bg-tripswift-blue/10 border-b border-tripswift-blue/20">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-tripswift-blue" />
                    <h4 className="font-tripswift-bold text-base text-tripswift-black">
                      {t('BookingTabs.AmendReservationModal.priceBreakdown')}
                    </h4>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Base Amount */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-tripswift-black/70 font-tripswift-medium">
                      {t('BookingTabs.AmendReservationModal.baseAmount')}
                    </span>
                    <span className="font-tripswift-medium text-tripswift-black">
                      {finalPrice.currencyCode} {(finalPrice.breakdown?.totalBaseAmount || finalPrice.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  {/* Additional Charges (if any) */}
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

                  {/* Subtotal - only show if there are taxes */}
                  {finalPrice.tax && Array.isArray(finalPrice.tax) && finalPrice.tax.length > 0 && (
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                      <span className="text-tripswift-black/80 font-tripswift-medium">
                        {t('BookingTabs.AmendReservationModal.subtotal')}
                      </span>
                      <span className="font-tripswift-bold text-tripswift-black">
                        {finalPrice.currencyCode} {finalPrice.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Tax Breakdown - only show if taxes exist */}
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

                      {/* Total Tax */}
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

                  {/* Final Total */}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-tripswift-blue/30">
                    <span className="text-md font-tripswift-bold text-tripswift-black">
                      {t('BookingTabs.AmendReservationModal.grandTotal')}
                    </span>
                    <span className="text-md font-tripswift-bold text-tripswift-blue">
                      {finalPrice.currencyCode} {(finalPrice.priceAfterTax || finalPrice.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  {/* Per Night Average */}
                  {finalPrice.breakdown?.averagePerNight && (
                    <div className="text-center pt-2">
                      <p className="text-xs text-tripswift-black/60">
                        {t('BookingTabs.AmendReservationModal.averagePerNight')}: {finalPrice.currencyCode} {finalPrice.breakdown.averagePerNight.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tax Information Notice - only show if taxes exist */}
              {finalPrice.tax && Array.isArray(finalPrice.tax) && finalPrice.tax.length > 0 && (
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.taxInclusiveNote')}
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Amendment policies */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 mb-2 sm:mb-4 overflow-hidden">
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