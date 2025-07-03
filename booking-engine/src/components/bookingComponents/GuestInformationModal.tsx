"use client";

import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useDispatch, useSelector } from "react-redux";
import { setGuestDetails, setAmount } from "@/Redux/slices/pmsHotelCard.slice";
import { User, Mail, Phone, Calendar, CreditCard, X, Loader2 } from "lucide-react";
import { formatDate, calculateNights } from "@/utils/dateUtils";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Interfaces remain unchanged
export interface Guest {
  firstName: string;
  lastName: string;
  dob?: string;
  type?: "adult" | "child" | "infant";
}

interface UserType {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  _id?: string;
}

interface RootState {
  auth: {
    user: UserType | null;
    token?: string;
  };
}

interface Room {
  _id: string;
  room_name: string;
  room_type: string;
  room_price: number;
  propertyInfo_id?: string;
  property_id?: string;
  [key: string]: any;
}

interface GuestInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: Room | null;
  checkInDate: string;
  checkOutDate: string;
  onConfirmBooking: (formData: {
    email: string;
    phone: string;
    propertyId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    amount: string;
    userId?: string;
    rooms?: number;
    adults?: number;
    children?: number;
    infants?: number;
    guests?: Guest[];
    hotelName: string;
    ratePlanCode: string;
    roomType: string;
    currency?: string;
  }) => void;
  guestData?: {
    rooms?: number;
    guests?: number;
    children?: number;
    infants?: number;
    childAges?: number[];
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    hotelName?: string;
  };
}

interface DailyBreakDown {
  date: string;
  dayOfWeek: string;
  ratePlanCode: string;
  baseRate: number;
  additionalCharges: number;
  totalPerRoom: number;
  totalForAllRooms: number;
  currencyCode: string;
  childrenChargesBreakdown: number[];
}

interface FinalPrice {
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
  dailyBreakdown: DailyBreakDown[] | null;
  availableRooms: number;
  requestedRooms: number;
}

const GuestInformationModal: React.FC<GuestInformationModalProps> = ({
  isOpen,
  onClose,
  selectedRoom,
  checkInDate,
  checkOutDate,
  onConfirmBooking,
  guestData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const totalGuests =
    (guestData?.guests || 1) +
    (guestData?.children || 0) +
    (guestData?.infants || 0);
  const getFormattedDate = (date: Date) => date.toISOString().split("T")[0];

  const [guests, setGuests] = useState<Guest[]>(() => {
    return Array.from({ length: totalGuests }, (_, i) => {
      let type: Guest["type"] =
        i < (guestData?.guests || 1)
          ? "adult"
          : i < (guestData?.guests || 1) + (guestData?.children || 0)
            ? "child"
            : "infant";

      const today = new Date();
      let defaultDOB = "";
      if (type === "child") {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(today.getFullYear() - 2);
        defaultDOB = getFormattedDate(twoYearsAgo);
      } else if (type === "adult") {
        const thirteenYearsAgo = new Date();
        thirteenYearsAgo.setFullYear(today.getFullYear() - 13);
        defaultDOB = getFormattedDate(thirteenYearsAgo);
      }

      return {
        firstName: "",
        lastName: "",
        dob: defaultDOB,
        type,
      };
    });
  });

  const [email, setEmail] = useState<string>(authUser?.email || "");
  const [phone, setPhone] = useState<string | undefined>("");
  const [isFormUpdated, setIsFormUpdated] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);


  const [activeSection, setActiveSection] = useState<"details" | "review">(
    "details"
  );
  const [finalPrice, setFinalPrice] = useState<FinalPrice | null>({
    totalAmount: 0,
    numberOfNights: 0,
    baseRatePerNight: 0,
    additionalGuestCharges: 0,
    breakdown: {
      totalBaseAmount: 0,
      totalAdditionalCharges: 0,
      totalAmount: 0,
      numberOfNights: 0,
      averagePerNight: 0,
    },
    dailyBreakdown: null,
    availableRooms: 0,
    requestedRooms: 0,
  });

  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const getFinalPrice = async (
    selectedRoom: any,
    checkInDate: string,
    checkOutDate: string,
    guestData: any
  ) => {
    try {
      console.log("gust data", guestData);
      const finalPriceResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/getRoomRentPrice`,
        {
          hotelCode: "WINCLOUD",
          invTypeCode: selectedRoom?.room_type,
          startDate: checkInDate,
          endDate: checkOutDate,
          noOfChildrens: guestData?.children,
          noOfAdults: guestData?.guests,
          noOfRooms: guestData?.rooms,
          noOfInfants: guestData?.infants,
        },
        { withCredentials: true }
      );
      if (finalPriceResponse.data.success) {
        setFinalPrice(finalPriceResponse.data.data);
      } else {
        setErrorMessage(finalPriceResponse.data.message);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const getDefaultDOBByType = (type: "adult" | "child" | "infant") => {
    const today = new Date();
    if (type === "infant") {
      return getFormattedDate(today);
    }
    if (type === "child") {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(today.getFullYear() - 2);
      return getFormattedDate(twoYearsAgo);
    }
    if (type === "adult") {
      const thirteenYearsAgo = new Date();
      thirteenYearsAgo.setFullYear(today.getFullYear() - 13);
      return getFormattedDate(thirteenYearsAgo);
    }
    return "";
  };

  useEffect(() => {
    if (guestData) {
      const newTotalGuests =
        (guestData.guests || 1) +
        (guestData.children || 0) +
        (guestData.infants || 0);
      setGuests(
        Array.from({ length: newTotalGuests }, (_, i) => {
          const type: Guest["type"] =
            i < (guestData?.guests || 1)
              ? "adult"
              : i < (guestData?.guests || 1) + (guestData?.children || 0)
                ? "child"
                : "infant";
          const guest = guests[i];
          return {
            firstName: guestData.firstName || guest?.firstName || "",
            lastName: guestData.lastName || guest?.lastName || "",
            dob: guest?.dob || getDefaultDOBByType(type),
            type,
          };
        })
      );
      setEmail(guestData.email || "");
      if (guestData.phone) {
        setPhone(
          guestData.phone.startsWith("+")
            ? guestData.phone
            : `+${guestData.phone}`
        );
      } else {
        setPhone("");
      }
    } else if (authUser) {
      setEmail(authUser.email);
      if (authUser.phone) {
        setPhone(
          authUser.phone.startsWith("+") ? authUser.phone : `+${authUser.phone}`
        );
      } else {
        setPhone("");
      }
    }
  }, [authUser, guestData]);

  useEffect(() => {
    if (isOpen && selectedRoom && checkInDate && checkOutDate && guestData) {
      getFinalPrice(selectedRoom, checkInDate, checkOutDate, guestData);
    }
  }, [isOpen, selectedRoom, checkInDate, checkOutDate, guestData]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  useEffect(() => {
    if (emailOtpSent && emailCountdown > 0) {
      const interval = setInterval(() => {
        setEmailCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [emailOtpSent, emailCountdown]);

  useEffect(() => {
    if (phoneOtpSent && phoneCountdown > 0) {
      const interval = setInterval(() => {
        setPhoneCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phoneOtpSent, phoneCountdown]);

  useEffect(() => {
    if (updateMessage) {
      const timer = setTimeout(() => {
        setUpdateMessage(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [updateMessage]);

  const handleGuestChange = (
    index: number,
    field: keyof Guest,
    value: string
  ) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const validateGuestNames = () => {
    return guests.every(guest =>
      guest.firstName.trim() &&
      guest.lastName.trim() &&
      /^[A-Za-z\s]+$/.test(guest.firstName) &&
      /^[A-Za-z\s]+$/.test(guest.lastName)
    );
  };
  const handleVerifyEmail = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: t("BookingComponents.GuestInformationModal.emailInvalidError"),
      }));
      return;
    }
    setIsEmailVerifying(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/send-otp`,
        {
          identifier: email,
          type: "mail_verification",
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUpdateMessage(
          response.data.message ||
          t("BookingComponents.GuestInformationModal.otpSent")
        );
        setEmailOtpSent(true);
        setEmailCountdown(300); // 5 minutes
        setEmailVerified(false);
      } else {
        setErrorMessage(
          response.data.message ||
          t("BookingComponents.GuestInformationModal.otpSendFailed")
        );
      }
    } catch (err: any) {
      console.error("Email OTP Request Error:", err);
      setErrorMessage(
        t("BookingComponents.GuestInformationModal.otpSendError")
      );
    }
    finally {
      setIsEmailVerifying(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp.trim()) {
      setErrorMessage(
        t("BookingComponents.GuestInformationModal.otpEmptyError")
      );
      return;
    }

    try {
      setErrorMessage(null);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/verify-otp`,
        {
          identifier: email,
          otp: emailOtp,
          type: "mail_verification",
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUpdateMessage(
          t("BookingComponents.GuestInformationModal.emailVerified")
        );
        setEmailVerified(true);
        setEmailOtpSent(false);
        setEmailCountdown(0);
        setEmailOtp("");
        setErrorMessage(null);
      } else {
        setErrorMessage(
          response.data.message ||
          t("BookingComponents.GuestInformationModal.otpInvalidError")
        );
      }
    } catch (err: any) {
      console.error("Email OTP Verify Error:", err);
      setErrorMessage(
        t("BookingComponents.GuestInformationModal.otpVerifyError")
      );
    }
  };

  const handleVerifyPhone = async () => {
    if (!phone || !/^\+\d{8,}$/.test(phone)) {
      setErrors(prev => ({
        ...prev,
        phone: t("BookingComponents.GuestInformationModal.phoneInvalidError"),
      }));
      return;
    }
    setIsPhoneVerifying(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/send-otp`,
        {
          identifier: phone,
          type: "number_verification",
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUpdateMessage(
          response.data.message ||
          t("BookingComponents.GuestInformationModal.otpSent")
        );
        setPhoneOtpSent(true);
        setPhoneCountdown(300);
        setPhoneVerified(false);
        // Clear any existing phone errors
        setErrors(prev => ({ ...prev, phone: '' }));
      } else {
        setErrorMessage(
          response.data.message ||
          t("BookingComponents.GuestInformationModal.otpSendFailed")
        );
      }
    } catch (err: any) {
      console.error("Phone OTP Request Error:", err);
      setErrorMessage(
        t("BookingComponents.GuestInformationModal.otpSendError")
      );
    }
    finally {
      setIsPhoneVerifying(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp.trim()) {
      setErrorMessage(
        t("BookingComponents.GuestInformationModal.otpEmptyError")
      );
      return;
    }

    try {
      setErrorMessage(null); // Clear any existing error
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/verify-otp`,
        {
          identifier: phone,
          otp: phoneOtp,
          type: "number_verification",
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUpdateMessage(
          t("BookingComponents.GuestInformationModal.phoneVerified")
        );
        setPhoneVerified(true);
        setPhoneOtpSent(false);
        setPhoneCountdown(0);
        setPhoneOtp("");
        setErrorMessage(null);
      } else {
        setErrorMessage(
          response.data.message ||
          t("BookingComponents.GuestInformationModal.otpInvalidError")
        );
      }
    } catch (err: any) {
      console.error("Phone OTP Verify Error:", err);
      setErrorMessage(
        err.response?.data?.message ||
        t("BookingComponents.GuestInformationModal.otpVerifyError")
      );
    }
  };

  const handleUpdate = async () => {
    let valid = true;
    const newErrors: { [key: string]: string } = {};

    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      if (!guest.firstName || !/^[A-Za-z\s]+$/.test(guest.firstName)) {
        newErrors[`firstName-${i}`] = t(
          "BookingComponents.GuestInformationModal.firstNameError"
        );
        valid = false;
      }
      if (!guest.lastName || !/^[A-Za-z\s]+$/.test(guest.lastName)) {
        newErrors[`lastName-${i}`] = t(
          "BookingComponents.GuestInformationModal.lastNameError"
        );
        valid = false;
      }
      if (!guest.dob) {
        newErrors[`dob-${i}`] = t(
          "BookingComponents.GuestInformationModal.dobError"
        );
        valid = false;
      }
    }

    if (!email) {
      newErrors["email"] = t(
        "BookingComponents.GuestInformationModal.emailError"
      );
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors["email"] = t(
        "BookingComponents.GuestInformationModal.emailInvalidError"
      );
      valid = false;
    }

    if (!emailVerified) {
      newErrors["email"] = t(
        "BookingComponents.GuestInformationModal.emailNotVerified"
      );
      valid = false;
    }

    if (!phone) {
      newErrors["phone"] = t("BookingComponents.GuestInformationModal.phoneError");
      valid = false;
    } else {
      const numericPhone = phone.replace(/\D/g, '');
      if (numericPhone.length < 8 || (phone.startsWith('+91') && numericPhone.length !== 12)) {
        newErrors["phone"] = t("BookingComponents.GuestInformationModal.phoneLengthError");
        valid = false;
      }
    }
    if (!phoneVerified) {
      newErrors["phone"] = t(
        "BookingComponents.GuestInformationModal.phoneNotVerified"
      );
      valid = false;
    }
    setErrors(newErrors);
    if (!valid) return;

    setIsLoading(true); // Set loading state to show loader
    try {
      setUpdateMessage(
        t("BookingComponents.GuestInformationModal.informationVerified")
      );
      dispatch(
        setGuestDetails({
          guests,
          email,
          phone,
          rooms: guestData?.rooms || 1,
          adults: guestData?.guests || 1,
          children: guestData?.children || 0,
          infants: guestData?.infants || 0,
          childAges: guestData?.childAges || [],
        })
      );
      setIsFormUpdated(true);
      await getFinalPrice(selectedRoom, checkInDate, checkOutDate, guestData); // Await async call
      setActiveSection("review");
    } catch (error) {
      setErrorMessage(t("BookingComponents.GuestInformationModal.updateError"));
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };
  const handleConfirmBooking = async () => {
    if (isFormUpdated && selectedRoom) {
      const propertyId =
        selectedRoom.propertyInfo_id ||
        selectedRoom.property_id ||
        selectedRoom.propertyId ||
        "";
      if (!propertyId) {
        console.log("Missing propertyId");
        setErrorMessage(
          t("BookingComponents.GuestInformationModal.propertyInfoMissing")
        );
        return;
      }
      if (!finalPrice || !finalPrice.totalAmount) {
        console.log("Missing finalPrice or totalAmount");
        setErrorMessage(
          t("BookingComponents.GuestInformationModal.priceFetchError")
        );
        return;
      }
      const totalPrice = finalPrice?.totalAmount ?? 0;
      dispatch(setAmount(totalPrice.toString()));
      console.log("Booking Payload:", {
        firstName: guests[0]?.firstName || "",
        lastName: guests[0]?.lastName || "",
        email,
        phone: phone || "",
        propertyId,
        roomId: selectedRoom._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        amount: finalPrice?.totalAmount.toString(),
        userId: authUser?._id,
        rooms: guestData?.rooms || 1,
        adults: guestData?.guests || 1,
        children: guestData?.children || 0,
        guests,
      });

      console.log("Setting isLoading to true for handleConfirmBooking");
      setIsLoading(true);
      try {
        const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 500));
        await Promise.all([
          onConfirmBooking({
            email,
            phone: phone || "",
            propertyId,
            roomId: selectedRoom._id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            amount: totalPrice.toString(),
            userId: authUser?._id,
            rooms: guestData?.rooms || 1,
            adults: guestData?.guests || 1,
            children: guestData?.children || 0,
            infants: guestData?.infants || 0,
            guests,
            hotelName: guestData?.hotelName || "",
            ratePlanCode: finalPrice?.dailyBreakdown && finalPrice.dailyBreakdown.length > 0
              ? finalPrice.dailyBreakdown[0].ratePlanCode
              : "",
            roomType: selectedRoom?.room_type || "",
            currency: finalPrice?.dailyBreakdown && finalPrice.dailyBreakdown.length > 0
              ? finalPrice.dailyBreakdown[0].currencyCode
              : "",
          }),
          minLoadingTime,
        ]);
        console.log("onConfirmBooking completed successfully");
      } catch (error) {
        console.error("Error in handleConfirmBooking:", error);
        setErrorMessage(
          t("BookingComponents.GuestInformationModal.bookingError")
        );
      } finally {
        console.log("Setting isLoading to false for handleConfirmBooking");
        setIsLoading(false);
      }
    } else {
      console.log("isFormUpdated or selectedRoom is missing", { isFormUpdated, selectedRoom });
    }
  };

  if (!isOpen || !selectedRoom) return null;

  const nightsCount = calculateNights(checkInDate, checkOutDate);
  const nightsText =
    nightsCount === 1
      ? t("BookingComponents.GuestInformationModal.nights")
      : t("BookingComponents.GuestInformationModal.nightsPlural");

  const getGuestCountDisplay = () => {
    const rooms = guestData?.rooms || 1;
    const adults = guestData?.guests || 1;
    const children = guestData?.children || 0;
    const infants = guestData?.infants || 0;
    const roomText =
      rooms === 1
        ? t("BookingComponents.GuestInformationModal.roomSingular")
        : t("BookingComponents.GuestInformationModal.roomsPlural");
    const adultText =
      adults === 1
        ? t("BookingComponents.GuestInformationModal.adultSingular")
        : t("BookingComponents.GuestInformationModal.adultsPlural");
    const childText =
      children === 1
        ? t("BookingComponents.GuestInformationModal.childSingular")
        : t("BookingComponents.GuestInformationModal.childrenPlural");
    const infantText =
      infants === 1
        ? t("BookingComponents.GuestInformationModal.infantSingular")
        : t("BookingComponents.GuestInformationModal.infantsPlural");

    let display = `${rooms} ${roomText} · ${adults} ${adultText}`;
    if (children > 0) {
      display += ` · ${children} ${childText}`;
    }
    if (infants > 0) {
      display += ` · ${infants} ${infantText}`;
    }
    return display;
  };

  const handlePhoneChange = (value: string | undefined) => {
    if (value && value.startsWith("+91")) {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, "");
      // If more than 12 characters (+91 + 10 digits), truncate
      const formattedValue =
        digits.length > 12 ? `+${digits.substring(0, 12)}` : value;
      setPhone(formattedValue);
    } else {
      setPhone(value);
    }
  };
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-tripswift-blue text-tripswift-off-white px-4 py-3">
            <h2 className="text-xl font-tripswift-bold tracking-tight">
              {t("BookingComponents.GuestInformationModal.completeYourBooking")}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-tripswift-off-white px-4 py-2 border-b border-tripswift-black/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-tripswift-bold ${activeSection === "details" || isFormUpdated
                    ? "bg-tripswift-blue text-tripswift-off-white"
                    : "bg-tripswift-black/10 text-tripswift-black/60"
                    }`}
                >
                  1
                </div>
                <span className="text-xs mt-1 font-tripswift-medium text-tripswift-black/80">
                  {t(
                    "BookingComponents.GuestInformationModal.guestDetailsStep"
                  )}
                </span>
              </div>
              <div className="flex-1 mx-4">
                <div
                  className={`h-1 rounded-full ${isFormUpdated
                    ? "bg-tripswift-blue"
                    : "bg-tripswift-black/20"
                    } transition-all duration-300`}
                ></div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-tripswift-bold ${activeSection === "review" && isFormUpdated
                    ? "bg-tripswift-blue text-tripswift-off-white"
                    : "bg-tripswift-black/10 text-tripswift-black/60"
                    }`}
                >
                  2
                </div>
                <span className="text-xs mt-1 font-tripswift-medium text-tripswift-black/80">
                  {t(
                    "BookingComponents.GuestInformationModal.reviewAndPayStep"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-2 rounded-lg text-sm font-tripswift-medium">
                {errorMessage}
              </div>
            )}
            {updateMessage && (
              <div className="bg-green-50 text-green-600 p-2 rounded-lg text-sm font-tripswift-medium">
                {updateMessage}
              </div>
            )}

            {activeSection === "details" ? (
              <div className="space-y-3">
                {/* Room Summary Card */}
                <div className="bg-tripswift-off-white rounded-xl px-4 py-2 shadow-sm border border-tripswift-black/10">
                  <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-2">
                    {selectedRoom.room_name}
                  </h3>
                  <div className="flex items-center py-1">
                    <Calendar className="text-tripswift-blue h-5 w-5" />
                    <div className="flex flex-wrap">
                      <span className="text-sm bg-tripswift-blue/10 px-3 rounded-full font-tripswift-medium text-tripswift-black/80">
                        {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                      </span>
                      <span className="text-sm bg-tripswift-blue/10 px-3 rounded-full font-tripswift-medium text-tripswift-black/80">
                        {nightsCount} {nightsText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Guest Information Form */}
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-tripswift-black/10">
                  <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-2">
                    {t(
                      "BookingComponents.GuestInformationModal.guestInformation"
                    )}
                  </h3>
                  <div className="space-y-3">
                    {guests.map((guest, index) => (
                      <div key={`${guest.type}-${index}`} className="space-y-2">
                        <h4 className="text-base font-tripswift-bold text-tripswift-black capitalize">
                          {guest.type}{" "}
                          {index -
                            (guest.type === "child"
                              ? guestData?.guests || 1
                              : guest.type === "infant"
                                ? (guestData?.guests || 1) +
                                (guestData?.children || 0)
                                : 0) +
                            1}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label
                              htmlFor={`firstName-${guest.type}-${index}`}
                              className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center mb-1"
                            >
                              <User
                                size={16}
                                className={`text-tripswift-blue  ${i18n.language === "ar" ? "ml-2" : "mr-2"
                                  }`}
                              />
                              {t(
                                "BookingComponents.GuestInformationModal.firstNameLabel"
                              )}
                            </label>
                            <input
                              type="text"
                              id={`firstName-${guest.type}-${index}`}
                              value={guest.firstName}
                              onChange={(e) =>
                                handleGuestChange(
                                  index,
                                  "firstName",
                                  e.target.value
                                )
                              }
                              placeholder={t(
                                "BookingComponents.GuestInformationModal.firstNamePlaceholder"
                              )}
                              className="w-full px-3 py-2 border border-tripswift-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200"
                              required
                            />
                            {errors[`firstName-${index}`] && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors[`firstName-${index}`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor={`lastName-${guest.type}-${index}`}
                              className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center mb-1"
                            >
                              <User
                                size={16}
                                className={`text-tripswift-blue  ${i18n.language === "ar" ? "ml-2" : "mr-2"
                                  }`}
                              />
                              {t(
                                "BookingComponents.GuestInformationModal.lastNameLabel"
                              )}
                            </label>
                            <input
                              type="text"
                              id={`lastName-${guest.type}-${index}`}
                              value={guest.lastName}
                              onChange={(e) =>
                                handleGuestChange(
                                  index,
                                  "lastName",
                                  e.target.value
                                )
                              }
                              placeholder={t(
                                "BookingComponents.GuestInformationModal.lastNamePlaceholder"
                              )}
                              className="w-full px-3 py-2 border border-tripswift-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200"
                              required
                            />
                            {errors[`lastName-${index}`] && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors[`lastName-${index}`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor={`dob-${guest.type}-${index}`}
                              className="text-sm font-tripswift-medium text-tripswift-black/80 flex  items-center mb-1"
                            >
                              <Calendar
                                size={16}
                                className={`text-tripswift-blue  ${i18n.language === "ar" ? "ml-2" : "mr-2"
                                  }`}
                              />
                              {t(
                                "BookingComponents.GuestInformationModal.dob"
                              )}
                            </label>
                            <input
                              type="date"
                              id={`dob-${guest.type}-${index}`}
                              value={guest.dob}
                              onChange={(e) =>
                                handleGuestChange(index, "dob", e.target.value)
                              }
                              max={
                                guest.type === "adult"
                                  ? getFormattedDate(
                                    new Date(
                                      new Date().setFullYear(
                                        new Date().getFullYear() - 13
                                      )
                                    )
                                  )
                                  : guest.type === "child"
                                    ? getFormattedDate(
                                      new Date(
                                        new Date().setFullYear(
                                          new Date().getFullYear() - 2
                                        )
                                      )
                                    )
                                    : getFormattedDate(new Date())
                              }
                              min={
                                guest.type === "child"
                                  ? getFormattedDate(
                                    new Date(
                                      new Date().setFullYear(
                                        new Date().getFullYear() - 13
                                      )
                                    )
                                  )
                                  : guest.type === "infant"
                                    ? getFormattedDate(
                                      new Date(
                                        new Date().setFullYear(
                                          new Date().getFullYear() - 2
                                        )
                                      )
                                    )
                                    : undefined
                              }
                              className={`w-full px-3 py-2 border border-tripswift-black/20 rounded-lg focus:outline-none 
      focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200 
      ${i18n.language === "ar" ? "text-right" : ""}`}
                              required
                            />
                            {errors[`dob-${index}`] && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors[`dob-${index}`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div>
                      <label
                        htmlFor="email"
                        className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center mb-1"
                      >
                        <Mail
                          size={16}
                          className={`text-tripswift-blue ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}
                        />
                        {t("BookingComponents.GuestInformationModal.emailLabel")}
                      </label>
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => {
                            const newEmail = e.target.value;
                            // Clear email error when typing
                            if (errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                              setErrors(prev => ({ ...prev, email: '' }));
                            }
                            if (emailVerified && newEmail !== email) {
                              setEmailVerified(false);
                              setEmailOtpSent(false);
                              setEmailOtp("");
                              setEmailCountdown(0);
                            }
                            setEmail(newEmail);
                          }}
                          placeholder={t("BookingComponents.GuestInformationModal.emailPlaceholder")}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200 ${errors.email ? "border-red-600" : "border-tripswift-black/20"
                            }`}
                          required
                        />
                        {!emailVerified && (
                          <button
                            onClick={() => {
                              if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                setErrors(prev => ({ ...prev, email: '' }));
                              }
                              handleVerifyEmail();
                            }}
                            type="button"
                            disabled={isEmailVerifying}
                            className="bg-tripswift-blue text-tripswift-off-white px-4 py-2 rounded-lg text-sm hover:bg-tripswift-blue/90 transition whitespace-nowrap"
                          >
                            {isEmailVerifying ? (
                              <>
                                {/* <Loader2 className="w-4 h-4 animate-spin text-tripswift-off-white" /> */}
                                <span>{t("BookingComponents.GuestInformationModal.verifying")}</span>
                              </>
                            ) : (
                              t("BookingComponents.GuestInformationModal.verifyEmail")
                            )}
                          </button>
                        )}
                      </div>
                      {emailOtpSent && emailCountdown > 0 && !emailVerified && (
                        <div className="mt-3 flex flex-col md:flex-row md:items-center gap-2">
                          <input
                            type="text"
                            placeholder={t("BookingComponents.GuestInformationModal.otpPlaceholder")}
                            value={emailOtp}
                            maxLength={6}
                            onChange={(e) => {
                              setEmailOtp(e.target.value);
                              setErrorMessage(null);
                            }}
                            className="w-full px-3 py-2 border border-tripswift-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200"
                          />
                          <button
                            onClick={handleVerifyEmailOtp}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition whitespace-nowrap"
                          >
                            {t("BookingComponents.GuestInformationModal.verifyOtp")}
                          </button>
                          <p className="text-xs text-tripswift-black/60 sm:ml-2 mt-1 sm:mt-0">
                            {t("BookingComponents.GuestInformationModal.otpExpiresIn")}{" "}
                            {Math.floor(emailCountdown / 60)}:{String(emailCountdown % 60).padStart(2, "0")}
                          </p>
                        </div>
                      )}
                      {emailVerified && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ {t("BookingComponents.GuestInformationModal.emailVerified")}
                        </p>
                      )}
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                      )}
                      <p className="text-xs text-tripswift-black/50 mt-1">
                        {t("BookingComponents.GuestInformationModal.emailInfo")}
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center mb-1"
                      >
                        <Phone
                          size={16}
                          className={`text-tripswift-blue ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}
                        />
                        {t("BookingComponents.GuestInformationModal.phoneLabel")}
                      </label>
                      <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="flex flex-col md:flex-row md:items-center gap-2">
                        <PhoneInput
                          id="phone"
                          name="phone"
                          value={phone}
                          onChange={(value) => {
                            // Clear phone error when typing a valid number
                            if (errors.phone && value && /^\+\d{8,}$/.test(value)) {
                              setErrors(prev => ({ ...prev, phone: '' }));
                            }
                            if (phoneVerified && value !== phone) {
                              setPhoneVerified(false);
                              setPhoneOtpSent(false);
                              setPhoneOtp("");
                              setPhoneCountdown(0);
                            }
                            handlePhoneChange(value);
                          }}
                          maxLength={16}
                          defaultCountry="IN"
                          placeholder={t("BookingComponents.GuestInformationModal.phonePlaceholder")}
                          className={`w-full px-2 sm:px-3 h-9 sm:h-11 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular ${errors.phone ? "border-red-600" : "border-tripswift-black/20"
                            }`}
                          international
                        />
                        {!phoneVerified && (
                          <button
                            onClick={() => {
                              if (phone && /^\+\d{8,}$/.test(phone)) {
                                setErrors(prev => ({ ...prev, phone: '' }));
                              }
                              handleVerifyPhone();
                            }}
                            type="button"
                            disabled={isPhoneVerifying}
                            className="bg-tripswift-blue text-tripswift-off-white px-4 py-2 rounded-lg text-sm hover:bg-tripswift-blue/90 transition whitespace-nowrap"
                          >
                            {isPhoneVerifying ? (
                              <>
                                {/* <Loader2 className="w-4 h-4 animate-spin text-tripswift-off-white" /> */}
                                <span>{t("BookingComponents.GuestInformationModal.verifying")}</span>
                              </>
                            ) : (
                              t("BookingComponents.GuestInformationModal.verifyPhone")
                            )}
                          </button>
                        )}
                      </div>
                      {phoneOtpSent && phoneCountdown > 0 && !phoneVerified && (
                        <div className="mt-3 flex flex-col md:flex-row md:items-center gap-2">
                          <input
                            type="text"
                            placeholder={t("BookingComponents.GuestInformationModal.otpPlaceholder")}
                            value={phoneOtp}
                            maxLength={6}
                            onChange={(e) => {
                              setPhoneOtp(e.target.value);
                              // Clear error when user starts typing
                              if (errorMessage && errorMessage.includes("OTP")) {
                                setErrorMessage(null);
                              }
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200 ${errorMessage && errorMessage.includes("OTP") ? "border-red-600" : "border-tripswift-black/20"
                              }`}
                          />
                          <button
                            onClick={async () => {
                              try {
                                await handleVerifyPhoneOtp();
                                // Error will be cleared in handleVerifyPhoneOtp on success
                              } catch (error) {
                                // Error is already handled in handleVerifyPhoneOtp
                              }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition whitespace-nowrap"
                          >
                            {t("BookingComponents.GuestInformationModal.verifyOtp")}
                          </button>
                          <p className="text-xs text-tripswift-black/60 sm:ml-2 mt-1 sm:mt-0">
                            {t("BookingComponents.GuestInformationModal.otpExpiresIn")}{" "}
                            {Math.floor(phoneCountdown / 60)}:{String(phoneCountdown % 60).padStart(2, "0")}
                          </p>
                        </div>
                      )}
                      {phoneVerified && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ {t("BookingComponents.GuestInformationModal.phoneVerified")}
                        </p>
                      )}
                      {errors.phone && (
                        <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                      )}
                      <p className="text-xs text-tripswift-black/50 mt-1">
                        {t("BookingComponents.GuestInformationModal.phoneInfo")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Booking Summary Card */}
                <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-tripswift-black/10">
                  <div className="bg-tripswift-blue/10 px-4 py-2 rounded-t-xl">
                    <h3 className="text-lg font-tripswift-bold text-tripswift-black">
                      {t(
                        "BookingComponents.GuestInformationModal.bookingSummary"
                      )}
                    </h3>
                  </div>
                  <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2">
                    <div>
                      <h4 className="text-base font-tripswift-medium text-tripswift-black mb-1 flex items-center">
                        <Calendar
                          size={16}
                          className={`text-tripswift-blue  ${i18n.language === "ar" ? "ml-2" : "mr-2"
                            }`}
                        />
                        {t(
                          "BookingComponents.GuestInformationModal.stayDetails"
                        )}
                      </h4>
                      <div className="space-y-3 ml-6">
                        <div>
                          <p className="text-xs text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.roomType"
                            )}
                          </p>
                          <p className="text-sm font-tripswift-medium">
                            {selectedRoom.room_name} ({selectedRoom.room_type})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.checkIn"
                            )}
                          </p>
                          <p className="text-sm font-tripswift-medium">
                            {formatDate(checkInDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.checkOut"
                            )}
                          </p>
                          <p className="text-sm font-tripswift-medium">
                            {formatDate(checkOutDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.nightsPlural"
                            )}
                          </p>
                          <p className="text-sm font-tripswift-medium">
                            {nightsCount} {nightsText}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.guests"
                            )}
                          </p>
                          <p className="text-sm font-tripswift-medium">
                            {getGuestCountDisplay()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-tripswift-medium text-tripswift-black mb-1 flex items-center">
                        <User
                          size={16}
                          className={`text-tripswift-blue  ${i18n.language === "ar" ? "ml-2" : "mr-2"
                            }`}
                        />
                        {t(
                          "BookingComponents.GuestInformationModal.guestInformation"
                        )}
                      </h4>
                      <div className="space-y-3 ml-6">
                        <div>
                          <p className="text-xs text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.primaryGuest"
                            )}
                          </p>
                          <p className="text-sm font-tripswift-medium">
                            {guests[0]?.firstName} {guests[0]?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.email"
                            )}
                          </p>
                          <p className="text-sm font-tripswift-medium">
                            {email}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.phone"
                            )}
                          </p>
                          <p
                            className={`text-sm font-tripswift-medium  ${i18n.language === "ar" ? "text-right" : ""}`}
                            dir="ltr"
                          >
                            {"\u200E" + phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Summary Card */}
                {finalPrice && finalPrice.totalAmount ? (
                  <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-tripswift-black/10">
                    <div className="bg-tripswift-blue/10 px-4 py-2 rounded-t-xl">
                      <h3 className="text-lg font-tripswift-bold text-tripswift-black">
                        {t("BookingComponents.GuestInformationModal.priceDetails")}
                      </h3>
                    </div>
                    <div className="px-4 pb-2 space-y-1">
                      {/* Total Base Amount */}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-tripswift-black/70">
                          Total Base Amount:
                        </span>
                        <span className="text-sm font-tripswift-medium">
                          ₹{finalPrice.breakdown.totalBaseAmount.toLocaleString()}
                        </span>
                      </div>

                      {/* Total Additional Charges */}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-tripswift-black/70">
                          Total Additional Charges:
                        </span>
                        <span className="text-sm font-tripswift-medium">
                          ₹{finalPrice.breakdown.totalAdditionalCharges.toLocaleString()}
                        </span>
                      </div>

                      {/* Total Amount */}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-tripswift-bold text-tripswift-black">
                          Total Amount:
                        </span>
                        <span className="text-sm font-tripswift-bold">
                          ₹{finalPrice.breakdown.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      {/* Number of Nights */}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-tripswift-black/70">
                          Number of Nights:
                        </span>
                        <span className="text-sm font-tripswift-medium">
                          {finalPrice.numberOfNights}
                        </span>
                      </div>

                      {/* Daily Breakdown */}
                      {finalPrice.dailyBreakdown && finalPrice.dailyBreakdown.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-tripswift-medium text-tripswift-black mb-1">
                            Daily Breakdown:
                          </div>
                          <div className="space-y-0.5">
                            {finalPrice.dailyBreakdown.map((day, index) => (
                              <div key={index} className="flex justify-between items-center py-0.5 pl-4">
                                <span className="text-sm text-tripswift-black/70">
                                  {day.date}
                                </span>
                                <span className="text-sm font-tripswift-medium">
                                  ₹{day.totalForAllRooms.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Final Total Amount - Highlighted */}
                      <div className="border-t border-tripswift-black/10 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-tripswift-bold text-tripswift-black">
                            Total Amount
                          </span>
                          <span className="text-xl font-tripswift-bold text-tripswift-blue">
                            ₹{finalPrice.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <p className="text-xs text-tripswift-black/60 mt-1">
                        {t("BookingComponents.GuestInformationModal.priceIncludes", {
                          rooms: finalPrice.requestedRooms || guestData?.rooms || 1,
                          guests: (guestData?.guests || 1) + (guestData?.children || 0) + (guestData?.infants || 0),
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-tripswift-black/10 p-4 text-center">
                    <p className="text-sm text-tripswift-black/60">
                      {t("BookingComponents.GuestInformationModal.priceLoading")}
                    </p>
                  </div>
                )}

                {/* Payment Notice */}
                <div className="bg-tripswift-blue/5 rounded-xl px-4 py-3 border border-tripswift-blue/20">
                  <div className="flex items-start gap-3">
                    <CreditCard
                      className="text-tripswift-blue flex-shrink-0 mt-1"
                      size={18}
                    />
                    <div>
                      <p className="text-sm font-tripswift-medium text-tripswift-black/80">
                        {t(
                          "BookingComponents.GuestInformationModal.paymentNoticeTitle"
                        )}
                      </p>
                      <p className="text-xs text-tripswift-black/60 mt-1">
                        {t(
                          "BookingComponents.GuestInformationModal.paymentNoticeDescription"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-tripswift-off-white flex-col sm:flex-row border-t border-tripswift-black/10 px-4 py-2 flex justify-end gap-3">
            <button
              onClick={() =>
                activeSection === "review"
                  ? setActiveSection("details")
                  : onClose()
              }
              className="px-6 py-2.5 border bg-tripswift-black/10 text-tripswift-black rounded-lg hover:bg-tripswift-black/20 transition-all duration-200 text-sm font-tripswift-medium"
            >
              {activeSection === "review"
                ? t("BookingComponents.GuestInformationModal.backToDetails")
                : t("BookingComponents.GuestInformationModal.cancel")}
            </button>
            <button
              onClick={(e) => {
                // Trigger the appropriate handler based on activeSection
                activeSection === "details" ? handleUpdate() : handleConfirmBooking();
              }}
              disabled={
                (activeSection === "details" &&
                  (!emailVerified || !phoneVerified || !validateGuestNames())) ||
                (activeSection === "review" && !isFormUpdated) ||
                isLoading
              }
              className={`px-6 py-2.5 rounded-lg text-sm font-tripswift-medium transition-all duration-200 flex items-center justify-center gap-2 ${(activeSection === "details" &&
                (!emailVerified || !phoneVerified || !validateGuestNames())) ||
                (activeSection === "review" && !isFormUpdated) ||
                isLoading
                ? "bg-gray-300 text-black cursor-not-allowed"
                : "bg-tripswift-blue text-tripswift-off-white hover:bg-tripswift-blue/90 active:scale-95 active:opacity-80"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-tripswift-off-white" />
                  <span>
                    {activeSection === "details"
                      ? t("BookingComponents.GuestInformationModal.processing")
                      : t("BookingComponents.GuestInformationModal.processing")}
                  </span>
                </>
              ) : (
                activeSection === "details"
                  ? t("BookingComponents.GuestInformationModal.continueToReview")
                  : t("BookingComponents.GuestInformationModal.proceedToPayment")
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestInformationModal;
