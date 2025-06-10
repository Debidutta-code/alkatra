"use client";

import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useDispatch, useSelector } from "react-redux";
import { setGuestDetails, setAmount } from "@/Redux/slices/pmsHotelCard.slice";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  X,
} from "lucide-react";
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
  dailyBreakdown: DailyBreakDown | null;
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
  const [activeSection, setActiveSection] = useState<"details" | "review">("details");
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
  const { t } = useTranslation();

  const getFinalPrice = async (selectedRoom: any, checkInDate: string, checkOutDate: string, guestData: any) => {
    try {
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
        setPhone(guestData.phone.startsWith("+") ? guestData.phone : `+${guestData.phone}`);
      } else {
        setPhone("");
      }
    } else if (authUser) {
      setEmail(authUser.email);
      if (authUser.phone) {
        setPhone(authUser.phone.startsWith("+") ? authUser.phone : `+${authUser.phone}`);
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

  const handleGuestChange = (index: number, field: keyof Guest, value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleUpdate = () => {
    let valid = true;
    const newErrors: { [key: string]: string } = {};

    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      if (!guest.firstName || !/^[A-Za-z\s]+$/.test(guest.firstName)) {
        newErrors[`firstName-${i}`] = t("BookingComponents.GuestInformationModal.firstNameError");
        valid = false;
      }
      if (!guest.lastName || !/^[A-Za-z\s]+$/.test(guest.lastName)) {
        newErrors[`lastName-${i}`] = t("BookingComponents.GuestInformationModal.lastNameError");
        valid = false;
      }
      if (!guest.dob) {
        newErrors[`dob-${i}`] = t("BookingComponents.GuestInformationModal.dobError");
        valid = false;
      }
    }

    if (!email) {
      newErrors["email"] = t("BookingComponents.GuestInformationModal.emailError");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors["email"] = t("BookingComponents.GuestInformationModal.emailInvalidError");
      valid = false;
    }

    // In your handleUpdate function:
    if (!phone) {
      newErrors["phone"] = t("BookingComponents.GuestInformationModal.phoneError");
      valid = false;
    } else if (phone.startsWith('+91') && phone.replace(/\D/g, '').length !== 12) {
      newErrors["phone"] = "Indian phone number must be 10 digits";
      valid = false;
    } else {
      const numericPhone = phone.replace(/\D/g, '');
      if (phone.startsWith('+91')) { // India specific validation
        if (numericPhone.length !== 12) { // +91 plus 10 digits = 12 total
          newErrors["phone"] = t("BookingComponents.GuestInformationModal.phoneIndiaError");
          valid = false;
        }
      } else {
        // Basic international validation (minimum 8 digits)
        if (numericPhone.length < 8) {
          newErrors["phone"] = t("BookingComponents.GuestInformationModal.phoneInternationalError");
          valid = false;
        }
      }
    }

    setErrors(newErrors);
    if (!valid) return;

    setUpdateMessage(t("BookingComponents.GuestInformationModal.informationVerified"));
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
    getFinalPrice(selectedRoom, checkInDate, checkOutDate, guestData);
    setTimeout(() => {
      setActiveSection("review");
    }, 800);
  };

  const handleConfirmBooking = () => {
    if (isFormUpdated && selectedRoom) {
      const propertyId =
        selectedRoom.propertyInfo_id || selectedRoom.property_id || selectedRoom.propertyId || "";
      if (!propertyId) {
        setErrorMessage(t("BookingComponents.GuestInformationModal.propertyInfoMissing"));
        return;
      }
      if (!finalPrice || !finalPrice.totalAmount) {
        setErrorMessage(t("BookingComponents.GuestInformationModal.priceFetchError"));
        return;
      }
      const totalPrice = finalPrice?.totalAmount ?? 0;
      // Dispatch amount to Redux store
      dispatch(setAmount(totalPrice.toString()));
      // const nightsCount = calculateNights(checkInDate, checkOutDate);
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
        guests,
        hotelName: guestData?.hotelName || "Unknown Hotel",
        ratePlanCode: finalPrice?.dailyBreakdown?.ratePlanCode || "SUT",
        roomType: selectedRoom?.room_type || "SUT",
      });
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

    let display = `${rooms} ${roomText} · ${adults} ${adultText}`;
    if (children > 0) {
      display += ` · ${children} ${childText}`;
    }
    return display;
  };

      const handlePhoneChange = (value: string | undefined) => {
      if (value && value.startsWith('+91')) {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');
        // If more than 12 characters (+91 + 10 digits), truncate
        const formattedValue = digits.length > 12
          ? `+${digits.substring(0, 12)}`
          : value;
        setPhone(formattedValue);
      } else {
        setPhone(value);
      }
    };
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300" onClick={onClose}></div>

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
          <div className="bg-tripswift-off-white px-4 py-3 border-b border-tripswift-black/10">
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
                  {t("BookingComponents.GuestInformationModal.guestDetailsStep")}
                </span>
              </div>
              <div className="flex-1 mx-4">
                <div
                  className={`h-1 rounded-full ${isFormUpdated ? "bg-tripswift-blue" : "bg-tripswift-black/20"
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
                  {t("BookingComponents.GuestInformationModal.reviewAndPayStep")}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-tripswift-medium">
                {errorMessage}
              </div>
            )}
            {updateMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-tripswift-medium">
                {updateMessage}
              </div>
            )}

            {activeSection === "details" ? (
              <div className="space-y-6">
                {/* Room Summary Card */}
                <div className="bg-tripswift-off-white rounded-xl p-4 shadow-sm border border-tripswift-black/10">
                  <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-3">
                    {selectedRoom.room_name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-tripswift-blue h-5 w-5" />
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm bg-tripswift-blue/10 px-3 py-1.5 rounded-full font-tripswift-medium text-tripswift-black/80">
                        {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                      </span>
                      <span className="text-sm bg-tripswift-blue/10 px-3 py-1.5 rounded-full font-tripswift-medium text-tripswift-black/80">
                        {nightsCount} {nightsText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Guest Information Form */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-tripswift-black/10">
                  <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-4">
                    {t("BookingComponents.GuestInformationModal.guestInformation")}
                  </h3>
                  <div className="space-y-6">
                    {guests.map((guest, index) => (
                      <div key={`${guest.type}-${index}`} className="space-y-4">
                        <h4 className="text-base font-tripswift-bold text-tripswift-black capitalize">
                          {guest.type} {index - (guest.type === "child" ? guestData?.guests || 1 : guest.type === "infant" ? (guestData?.guests || 1) + (guestData?.children || 0) : 0) + 1}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label
                              htmlFor={`firstName-${guest.type}-${index}`}
                              className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center mb-1"
                            >
                              <User size={16} className="text-tripswift-blue mr-2" />
                              {t("BookingComponents.GuestInformationModal.firstNameLabel")}
                            </label>
                            <input
                              type="text"
                              id={`firstName-${guest.type}-${index}`}
                              value={guest.firstName}
                              onChange={(e) => handleGuestChange(index, "firstName", e.target.value)}
                              placeholder={t("BookingComponents.GuestInformationModal.firstNamePlaceholder")}
                              className="w-full px-3 py-2 border border-tripswift-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200"
                              required
                            />
                            {errors[`firstName-${index}`] && (
                              <p className="text-xs text-red-600 mt-1">{errors[`firstName-${index}`]}</p>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor={`lastName-${guest.type}-${index}`}
                              className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center mb-1"
                            >
                              <User size={16} className="text-tripswift-blue mr-2" />
                              {t("BookingComponents.GuestInformationModal.lastNameLabel")}
                            </label>
                            <input
                              type="text"
                              id={`lastName-${guest.type}-${index}`}
                              value={guest.lastName}
                              onChange={(e) => handleGuestChange(index, "lastName", e.target.value)}
                              placeholder={t("BookingComponents.GuestInformationModal.lastNamePlaceholder")}
                              className="w-full px-3 py-2 border border-tripswift-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200"
                              required
                            />
                            {errors[`lastName-${index}`] && (
                              <p className="text-xs text-red-600 mt-1">{errors[`lastName-${index}`]}</p>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor={`dob-${guest.type}-${index}`}
                              className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center mb-1"
                            >
                              <Calendar size={16} className="text-tripswift-blue mr-2" />
                              DOB
                            </label>
                            <input
                              type="date"
                              id={`dob-${guest.type}-${index}`}
                              value={guest.dob}
                              onChange={(e) => handleGuestChange(index, "dob", e.target.value)}
                              max={
                                guest.type === "adult"
                                  ? getFormattedDate(new Date(new Date().setFullYear(new Date().getFullYear() - 13)))
                                  : guest.type === "child"
                                    ? getFormattedDate(new Date(new Date().setFullYear(new Date().getFullYear() - 2)))
                                    : getFormattedDate(new Date())
                              }
                              min={
                                guest.type === "child"
                                  ? getFormattedDate(new Date(new Date().setFullYear(new Date().getFullYear() - 13)))
                                  : guest.type === "infant"
                                    ? getFormattedDate(new Date(new Date().setFullYear(new Date().getFullYear() - 2)))
                                    : undefined
                              }
                              className="w-full px-3 py-2 border border-tripswift-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200"
                              required
                            />
                            {errors[`dob-${index}`] && (
                              <p className="text-xs text-red-600 mt-1">{errors[`dob-${index}`]}</p>
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
                        <Mail size={16} className="text-tripswift-blue mr-2" />
                        {t("BookingComponents.GuestInformationModal.emailLabel")}
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("BookingComponents.GuestInformationModal.emailPlaceholder")}
                        className="w-full px-3 py-2 border border-tripswift-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200"
                        required
                      />
                      {errors["email"] && (
                        <p className="text-xs text-red-600 mt-1">{errors["email"]}</p>
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
                        <Phone size={16} className="text-tripswift-blue mr-2" />
                        {t("BookingComponents.GuestInformationModal.phoneLabel")}
                      </label>
                      <PhoneInput
                        id="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        defaultCountry="IN"
                        placeholder={t("BookingComponents.GuestInformationModal.phonePlaceholder")}
                        className="w-full px-3 py-2 border border-tripswift-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 text-sm transition-all duration-200"
                        international
                        limitMaxLength={true}  // This enforces max length based on country
                      />
                      {errors["phone"] && (
                        <p className="text-xs text-red-600 mt-1">{errors["phone"]}</p>
                      )}
                      <p className="text-xs text-tripswift-black/50 mt-1">
                        {t("BookingComponents.GuestInformationModal.phoneInfo")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Booking Summary Card */}
                <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-tripswift-black/10">
                  <div className="bg-tripswift-blue/10 p-4 rounded-t-xl">
                    <h3 className="text-lg font-tripswift-bold text-tripswift-black">
                      {t("BookingComponents.GuestInformationModal.bookingSummary")}
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-base font-tripswift-medium text-tripswift-black mb-3 flex items-center">
                        <Calendar size={16} className="text-tripswift-blue mr-2" />
                        {t("BookingComponents.GuestInformationModal.stayDetails")}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-tripswift-black/60">Room Type</p>
                          <p className="text-sm font-tripswift-medium">
                            {selectedRoom.room_name} ({selectedRoom.room_type})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">Check-In</p>
                          <p className="text-sm font-tripswift-medium">{formatDate(checkInDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">Check-Out</p>
                          <p className="text-sm font-tripswift-medium">{formatDate(checkOutDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">Nights</p>
                          <p className="text-sm font-tripswift-medium">
                            {nightsCount} {nightsText}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">Guests</p>
                          <p className="text-sm font-tripswift-medium">{getGuestCountDisplay()}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-tripswift-medium text-tripswift-black mb-3 flex items-center">
                        <User size={16} className="text-tripswift-blue mr-2" />
                        {t("BookingComponents.GuestInformationModal.guestInformation")}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-tripswift-black/60">Primary Guest</p>
                          <p className="text-sm font-tripswift-medium">
                            {guests[0]?.firstName} {guests[0]?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">Email</p>
                          <p className="text-sm font-tripswift-medium">{email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-tripswift-black/60">Phone</p>
                          <p className="text-sm font-tripswift-medium">{phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Summary Card */}
                <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-tripswift-black/10">
                  <div className="bg-tripswift-blue/10 p-4 rounded-t-xl">
                    <h3 className="text-lg font-tripswift-bold text-tripswift-black">
                      {t("BookingComponents.GuestInformationModal.priceDetails")}
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-tripswift-black/70">
                        Room Rate ({nightsCount} {nightsText})
                      </span>
                      <span className="text-sm font-tripswift-medium">
                        ₹{finalPrice?.baseRatePerNight || selectedRoom.room_price} × {nightsCount}
                      </span>
                    </div>
                    <div className="border-t border-tripswift-black/10 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-tripswift-bold">Total Amount</span>
                        <span className="text-xl font-tripswift-bold text-tripswift-blue">
                          ₹{finalPrice?.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Notice */}
                <div className="bg-tripswift-blue/5 rounded-xl p-4 border border-tripswift-blue/20">
                  <div className="flex items-start gap-3">
                    <CreditCard className="text-tripswift-blue flex-shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-tripswift-medium text-tripswift-black/80">
                        {t("BookingComponents.GuestInformationModal.paymentNoticeTitle")}
                      </p>
                      <p className="text-xs text-tripswift-black/60 mt-1">
                        {t("BookingComponents.GuestInformationModal.paymentNoticeDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-tripswift-off-white border-t border-tripswift-black/10 p-4 flex justify-end gap-3">
            <button
              onClick={() => (activeSection === "review" ? setActiveSection("details") : onClose())}
              className="px-6 py-2.5 bg-tripswift-black/10 text-tripswift-black rounded-lg hover:bg-tripswift-black/20 transition-all duration-200 text-sm font-tripswift-medium"
            >
              {activeSection === "review"
                ? t("BookingComponents.GuestInformationModal.backToDetails")
                : t("BookingComponents.GuestInformationModal.cancel")}
            </button>
            <button
              onClick={activeSection === "details" ? handleUpdate : handleConfirmBooking}
              disabled={activeSection === "review" && !isFormUpdated}
              className={`px-6 py-2.5 rounded-lg text-sm font-tripswift-medium transition-all duration-200 ${activeSection === "review" && !isFormUpdated
                ? "bg-tripswift-blue/50 text-tripswift-off-white cursor-not-allowed"
                : "bg-tripswift-blue text-tripswift-off-white hover:bg-tripswift-blue/90"
                }`}
            >
              {activeSection === "details"
                ? t("BookingComponents.GuestInformationModal.continueToReview")
                : t("BookingComponents.GuestInformationModal.proceedToPayment")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestInformationModal;