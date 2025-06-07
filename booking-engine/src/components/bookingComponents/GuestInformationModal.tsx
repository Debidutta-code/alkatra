"use client";

import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useDispatch, useSelector } from "react-redux";
import { setGuestDetails , setAmount } from "@/Redux/slices/pmsHotelCard.slice";
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

export interface Guest {
  firstName: string;
  lastName: string;
  dob?: string;
  type?: "adult" | "child" | "infant";
}
// User type definition
interface UserType {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  _id?: string;
}

// Root state interface
interface RootState {
  auth: {
    user: UserType | null;
    token?: string;
  };
}

// Room interface
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

      // Set default DOBs per type
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
      } else {
        // For adult, defaultDOB could be empty or a reasonable default
        defaultDOB = ""; // or set some default if needed
      }

      return {
        firstName: "",
        lastName: "",
        dob: defaultDOB,
        type,
      };
    });
  });

  console.log("guest data", guestData);

  const [email, setEmail] = useState<string>(authUser?.email || "");
  const [phone, setPhone] = useState<string | undefined>("");

  const [isFormUpdated, setIsFormUpdated] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  const { t } = useTranslation();
  const getFinalPrice = async (selectedRoom: any, checkInDate: string, checkOutDate: string, guestData: any) => {
    console.log("getfinal price called")
    try {
      const finalPriceResponse = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/getRoomRentPrice`, {
        hotelCode: "WINCLOUD",
        invTypeCode: selectedRoom?.room_type,
        startDate: checkInDate,
        endDate: checkOutDate,
        noOfChildrens: guestData?.children,
        noOfAdults: guestData?.guests,
        noOfRooms: guestData?.rooms,
      }, {
        withCredentials: true
      });
      console.log("finalpricedata", finalPriceResponse.data)
      if (finalPriceResponse.data.success) {
        setFinalPrice(finalPriceResponse.data.data);
      } else {
        setErrorMessage(finalPriceResponse.data.message);
      }
    } catch (error: any) {
      console.log("Error occure while getting the final price", error.message);
      setErrorMessage(error.message);
    }
  };
  
  // useEffect(() => {
  //   getFinalPrice();
  // },[checkInDate,checkOutDate,guestData,selectedRoom]);
  const getDefaultDOBByType = (type: "adult" | "child" | "infant") => {
    const today = new Date();

    if (type === "infant") {
      const today = new Date();
      today.setFullYear(today.getFullYear());
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

    return ""; // or default adult DOB if needed
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
            dob: guest?.dob || getDefaultDOBByType(type), // <- 💡 key part
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
        if (authUser.phone.startsWith("+")) {
          setPhone(authUser.phone);
        } else if (!isNaN(Number(authUser.phone))) {
          setPhone(`+${authUser.phone}`);
        } else {
          setPhone("");
        }
      } else {
        setPhone("");
      }
    }
  }, [authUser, guestData]);

  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = "hidden";
  //     document.documentElement.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "";
  //     document.documentElement.style.overflow = "";
  //   }

  //   return () => {
  //     document.body.style.overflow = "";
  //     document.documentElement.style.overflow = "";
  //   };
  // }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedRoom && checkInDate && checkOutDate && guestData) {
      getFinalPrice(selectedRoom, checkInDate, checkOutDate, guestData);
    }
  }, [isOpen, selectedRoom, checkInDate, checkOutDate, guestData]);

  const handleGuestChange = (
    index: number,
    field: keyof Guest,
    value: string
  ) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
  };

  const handleUpdate = () => {
    let valid = true;
    setErrorMessage(null);

    // Validate guests' firstName, lastName, dob
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      if (!guest.firstName || !/^[A-Za-z\s]+$/.test(guest.firstName)) {
        setErrorMessage(
          t("BookingComponents.GuestInformationModal.firstNameError") +
          ` (Guest ${i + 1})`
        );
        valid = false;
        break;
      }
      if (!guest.lastName || !/^[A-Za-z\s]+$/.test(guest.lastName)) {
        setErrorMessage(
          t("BookingComponents.GuestInformationModal.lastNameError") +
          ` (Guest ${i + 1})`
        );
        valid = false;
        break;
      }
      if (!guest.dob) {
        setErrorMessage(
          t("BookingComponents.GuestInformationModal.dobError") +
          ` (Guest ${i + 1})`
        );
        valid = false;
        break;
      }
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(t("BookingComponents.GuestInformationModal.emailError"));
      valid = false;
    }

    // Validate phone (basic check for length and digits)
    if (!phone || phone.length < 10) {
      setErrorMessage(t("BookingComponents.GuestInformationModal.phoneError"));
      valid = false;
    }

    if (!valid) {
      return;
    }

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
    getFinalPrice(selectedRoom, checkInDate, checkOutDate, guestData)
    setTimeout(() => {
      setActiveSection("review");
    }, 800);
  };

  const handleConfirmBooking = () => {
    if (isFormUpdated && selectedRoom) {
      const propertyId =
        selectedRoom.propertyInfo_id ||
        selectedRoom.property_id ||
        selectedRoom.propertyId ||
        "";
      if (!propertyId) {
        setErrorMessage(
          t("BookingComponents.GuestInformationModal.propertyInfoMissing")
        );
        return;
      }
      if (!finalPrice || !finalPrice.totalAmount) {
        setErrorMessage(t("BookingComponents.GuestInformationModal.priceFetchError"));
        return;
      }
      const totalPrice =finalPrice?.totalAmount ?? 0;

      // Dispatch amount to Redux store
      dispatch(setAmount(totalPrice.toString()));
      // console.log("Booking Payload:", {
      //   firstName: guests[0]?.firstName || "",
      //   lastName: guests[0]?.lastName || "",
      //   email,
      //   phone: phone || "",
      //   propertyId,
      //   roomId: selectedRoom._id,
      //   checkIn: checkInDate,
      //   checkOut: checkOutDate,
      //   amount: finalPrice?.totalAmount.toString(),
      //   userId: authUser?._id,
      //   rooms: guestData?.rooms || 1,
      //   adults: guestData?.guests || 1,
      //   children: guestData?.children || 0,
      //   guests,
      // });
  
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

  // Helper function to get guest count display
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Centered Dialog Box */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col w-[95%] sm:w-[90%] md:w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] rounded-lg shadow-lg font-noto-sans">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-tripswift-blue text-tripswift-off-white px-3 sm:px-6 py-3 sm:py-4 rounded-t-lg">
          <h2 className="text-lg sm:text-xl font-tripswift-bold">
            {t("BookingComponents.GuestInformationModal.completeYourBooking")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-tripswift-blue/80 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-tripswift-off-white px-3 sm:px-6 py-2 sm:py-3 border-b border-tripswift-black/10">
          <div className="flex justify-between mb-1 sm:mb-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-tripswift-medium ${activeSection === "details" || isFormUpdated
                  ? "bg-tripswift-blue text-tripswift-off-white"
                  : "bg-tripswift-black/10 text-tripswift-black/60"
                  }`}
              >
                1
              </div>
              <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-tripswift-medium">
                {t("BookingComponents.GuestInformationModal.guestDetailsStep")}
              </span>
            </div>
            <div className="flex-1 flex items-center mx-2">
              <div
                className={`h-1 w-full ${isFormUpdated ? "bg-tripswift-blue" : "bg-tripswift-black/10"
                  }`}
              ></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-tripswift-medium ${activeSection === "review" && isFormUpdated
                  ? "bg-tripswift-blue text-tripswift-off-white"
                  : "bg-tripswift-black/10 text-tripswift-black/60"
                  }`}
              >
                2
              </div>
              <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-tripswift-medium">
                {t("BookingComponents.GuestInformationModal.reviewAndPayStep")}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content with padding-bottom to prevent overlap with fixed footer */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-28 sm:pb-24 md:pb-28 ">
          {activeSection === "details" ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Room Summary */}
              <div className="bg-tripswift-off-white rounded-lg shadow-sm p-2 sm:p-3 border border-tripswift-black/10 mb-4 sm:mb-6">
                <h3 className="font-tripswift-medium text-tripswift-black text-base sm:text-lg mb-1 px-2 sm:px-3">
                  {selectedRoom.room_name}
                </h3>

                <div className="flex items-center gap-2">
                  <div className="bg-tripswift-blue/10 pl-3 rounded-lg">
                    <Calendar className="text-tripswift-blue h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs sm:text-sm bg-tripswift-blue/5 text-tripswift-black/70 py-1 rounded font-tripswift-medium">
                      {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                    </span>
                    <span className="text-xs sm:text-sm bg-tripswift-blue/5 text-tripswift-black/70 px-1 py-1 rounded font-tripswift-medium">
                      {nightsCount} {nightsText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guest Information Form */}
              <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 border border-tripswift-black/10">
                <h3 className="text-base sm:text-lg font-tripswift-bold text-tripswift-black mb-3 sm:mb-4">
                  {t(
                    "BookingComponents.GuestInformationModal.guestInformation"
                  )}
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {/* Render Adults */}
                  {guests
                    .slice(0, guestData?.guests || 1)
                    .map((guest, index) => (
                      <div key={`adult-${index}`} className="mb-4">
                        <h4 className="font-tripswift-bold text-tripswift-black mb-2">
                          {`Adult ${index + 1}`}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                          <div className="space-y-1">
                            <label
                              htmlFor={`firstName-adult-${index}`}
                              className="text-xs sm:text-sm ml-1 font-tripswift-medium text-tripswift-black/80 flex items-center"
                            >
                              <User
                                size={16}
                                className="text-tripswift-blue mr-2"
                              />
                              {t(
                                "BookingComponents.GuestInformationModal.firstNameLabel"
                              )}
                            </label>
                            <input
                              type="text"
                              id={`firstName-adult-${index}`}
                              name={`firstName-adult-${index}`}
                              value={guest.firstName}
                              required
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
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                            />
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor={`lastName-adult-${index}`}
                              className="text-xs sm:text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                            >
                              <User
                                size={16}
                                className="text-tripswift-blue mr-2"
                              />
                              {t(
                                "BookingComponents.GuestInformationModal.lastNameLabel"
                              )}
                            </label>
                            <input
                              type="text"
                              id={`lastName-adult-${index}`}
                              name={`lastName-adult-${index}`}
                              value={guest.lastName}
                              required
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
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                            />
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor={`dob-adult-${index}`}
                              className="text-xs sm:text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                            >
                              <Calendar
                                size={16}
                                className="text-tripswift-blue mr-2"
                              />
                              DOB
                            </label>
                            <input
                              type="date"
                              id={`dob-adult-${index}`}
                              name={`dob-adult-${index}`}
                              value={guest.dob}
                              required
                              onChange={(e) =>
                                handleGuestChange(index, "dob", e.target.value)
                              }
                              max={getFormattedDate(
                                new Date(
                                  new Date().setFullYear(
                                    new Date().getFullYear() - 13
                                  )
                                )
                              )}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Render Children */}
                  {guests
                    .slice(
                      guestData?.guests || 1,
                      (guestData?.guests || 1) + (guestData?.children || 0)
                    )
                    .map((guest, index) => (
                      <div key={`child-${index}`} className="mb-4">
                        <h4 className="font-tripswift-bold text-tripswift-black mb-2">
                          {`Child ${index + 1}`}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                          <div className="space-y-1">
                            <label
                              htmlFor={`firstName-child-${index}`}
                              className="text-xs sm:text-sm ml-1 font-tripswift-medium text-tripswift-black/80 flex items-center"
                            >
                              <User
                                size={16}
                                className="text-tripswift-blue mr-2"
                              />
                              {`First Name`}
                            </label>
                            <input
                              type="text"
                              id={`firstName-child-${index}`}
                              name={`firstName-child-${index}`}
                              value={guest.firstName}
                              required
                              onChange={(e) =>
                                handleGuestChange(
                                  index + (guestData?.guests || 1),
                                  "firstName",
                                  e.target.value
                                )
                              }
                              placeholder={t(
                                "BookingComponents.GuestInformationModal.firstNamePlaceholder"
                              )}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                            />
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor={`lastName-child-${index}`}
                              className="text-xs sm:text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                            >
                              <User
                                size={16}
                                className="text-tripswift-blue mr-2"
                              />
                              {t(
                                "BookingComponents.GuestInformationModal.lastNameLabel"
                              )}
                            </label>
                            <input
                              type="text"
                              id={`lastName-child-${index}`}
                              name={`lastName-child-${index}`}
                              value={guest.lastName}
                              required
                              onChange={(e) =>
                                handleGuestChange(
                                  index + (guestData?.guests || 1),
                                  "lastName",
                                  e.target.value
                                )
                              }
                              placeholder={t(
                                "BookingComponents.GuestInformationModal.lastNamePlaceholder"
                              )}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                            />
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor={`dob-child-${index}`}
                              className="text-xs sm:text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                            >
                              <Calendar
                                size={16}
                                className="text-tripswift-blue mr-2"
                              />
                              DOB{" "}
                            </label>
                            <input
                              type="date"
                              id={`dob-child-${index}`}
                              name={`dob-child-${index}`}
                              value={guest.dob}
                              required
                              max={getFormattedDate(
                                new Date(
                                  new Date().setFullYear(
                                    new Date().getFullYear() - 2
                                  )
                                )
                              )}
                              min={getFormattedDate(
                                new Date(
                                  new Date().setFullYear(
                                    new Date().getFullYear() - 13
                                  )
                                )
                              )}
                              onChange={(e) =>
                                handleGuestChange(
                                  index + (guestData?.guests || 1),
                                  "dob",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Render Infants */}
                  {guests
                    .slice(
                      (guestData?.guests || 1) + (guestData?.children || 0),
                      (guestData?.guests || 1) +
                      (guestData?.children || 0) +
                      (guestData?.infants || 0)
                    )
                    .map((guest, index) => (
                      <div key={`infant-${index}`} className="mb-4">
                        <h4 className="font-tripswift-bold text-tripswift-black mb-2">
                          {`Infant ${index + 1}`}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                          <div className="space-y-1">
                            <label
                              htmlFor={`firstName-infant-${index}`}
                              className="text-xs sm:text-sm ml-1 font-tripswift-medium text-tripswift-black/80 flex items-center"
                            >
                              <User
                                size={16}
                                className="text-tripswift-blue mr-2"
                              />
                              {`First Name`}
                            </label>
                            <input
                              type="text"
                              id={`firstName-infant-${index}`}
                              name={`firstName-infant-${index}`}
                              value={guest.firstName}
                              required
                              onChange={(e) =>
                                handleGuestChange(
                                  index +
                                  (guestData?.guests || 1) +
                                  (guestData?.children || 0),
                                  "firstName",
                                  e.target.value
                                )
                              }
                              placeholder={t(
                                "BookingComponents.GuestInformationModal.firstNamePlaceholder"
                              )}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                            />
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor={`lastName-infant-${index}`}
                              className="text-xs sm:text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                            >
                              <User
                                size={16}
                                className="text-tripswift-blue mr-2"
                              />
                              {t(
                                "BookingComponents.GuestInformationModal.lastNameLabel"
                              )}
                            </label>
                            <input
                              type="text"
                              id={`lastName-infant-${index}`}
                              name={`lastName-infant-${index}`}
                              value={guest.lastName}
                              required
                              onChange={(e) =>
                                handleGuestChange(
                                  index +
                                  (guestData?.guests || 1) +
                                  (guestData?.children || 0),
                                  "lastName",
                                  e.target.value
                                )
                              }
                              placeholder={t(
                                "BookingComponents.GuestInformationModal.lastNamePlaceholder"
                              )}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                            />
                          </div>

                          <div className="space-y-1">
                            <label
                              htmlFor={`dob-infant-${index}`}
                              className="text-xs sm:text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                            >
                              <Calendar
                                size={16}
                                className="text-tripswift-blue mr-2"
                              />
                              DOB
                            </label>
                            <input
                              type="date"
                              id={`dob-infant-${index}`}
                              name={`dob-infant-${index}`}
                              value={guest.dob}
                              required
                              onChange={(e) =>
                                handleGuestChange(
                                  index +
                                  (guestData?.guests || 1) +
                                  (guestData?.children || 0),
                                  "dob",
                                  e.target.value
                                )
                              }
                              max={getFormattedDate(new Date(new Date()))}
                              min={getFormattedDate(
                                new Date(
                                  new Date().setFullYear(
                                    new Date().getFullYear() - 2
                                  )
                                )
                              )}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className="text-xs sm:text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                    >
                      <Mail size={16} className="text-tripswift-blue mr-2" />
                      {t("BookingComponents.GuestInformationModal.emailLabel")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t(
                        "BookingComponents.GuestInformationModal.emailPlaceholder"
                      )}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                    />
                    <p className="text-xs sm:text-sm text-tripswift-black/50 ml-1 mt-1">
                      {t("BookingComponents.GuestInformationModal.emailInfo")}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="phone"
                      className="text-xs sm:text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                    >
                      <Phone size={14} className="text-tripswift-blue mr-2" />
                      {t("BookingComponents.GuestInformationModal.phoneLabel")}
                    </label>
                    <PhoneInput
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={setPhone}
                      maxLength={16}
                      defaultCountry="IN"
                      placeholder={t(
                        "BookingComponents.GuestInformationModal.phonePlaceholder"
                      )}
                      className="w-full px-2 sm:px-3 h-9 sm:h-11 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-xs sm:text-sm font-tripswift-regular"
                      international
                    />
                    <p className="text-xs sm:text-sm text-tripswift-black/50 ml-1 mt-1">
                      {t("BookingComponents.GuestInformationModal.phoneInfo")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Review Booking Section */}
              <div className="bg-tripswift-off-white rounded-lg shadow-sm border border-tripswift-black/10 overflow-hidden">
                <div className="bg-tripswift-blue/5 border-b border-tripswift-black/10 p-3 sm:p-4">
                  <h3 className="font-tripswift-bold text-tripswift-black text-base sm:text-lg">
                    {t(
                      "BookingComponents.GuestInformationModal.bookingSummary"
                    )}
                  </h3>
                </div>

                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                    <div className="flex-1">
                      <h4 className="font-tripswift-medium text-tripswift-black mb-2 sm:mb-3 flex items-center">
                        <Calendar
                          size={16}
                          className="text-tripswift-blue mr-2"
                        />
                        {t(
                          "BookingComponents.GuestInformationModal.stayDetails"
                        )}
                      </h4>
                      <div className="space-y-2 sm:space-y-3 pl-3 sm:pl-6">
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.roomType"
                            )}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {selectedRoom.room_name} ({selectedRoom.room_type})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.checkIn"
                            )}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {formatDate(checkInDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.checkOut"
                            )}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {formatDate(checkOutDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.nights"
                            )}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {nightsCount} {nightsText}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.guestDetailsSection"
                            )}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {getGuestCountDisplay()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-tripswift-medium text-tripswift-black mb-2 sm:mb-3 flex items-center">
                        <User size={16} className="text-tripswift-blue mr-2" />
                        {t(
                          "BookingComponents.GuestInformationModal.guestInformation"
                        )}
                      </h4>
                      <div className="space-y-2 sm:space-y-3 pl-3 sm:pl-6">
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.primaryGuest"
                            )}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {guests[0]?.firstName} {guests[0]?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.emailLabel"
                            )}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {email}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.phoneLabel"
                            )}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Summary Card */}
                <div className="bg-tripswift-off-white rounded-lg shadow-sm border border-tripswift-black/10 overflow-hidden">
                  <div className="bg-tripswift-blue/5 border-b border-tripswift-black/10 p-3 sm:p-4">
                    <h3 className="font-tripswift-bold text-tripswift-black text-base sm:text-lg">
                      {t(
                        "BookingComponents.GuestInformationModal.priceDetails"
                      )}
                    </h3>
                  </div>

                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-tripswift-black/70">
                          {t(
                            "BookingComponents.GuestInformationModal.roomRate"
                          )}{" "}
                          ({nightsCount} {nightsText})
                        </span>
                        <span className="text-sm sm:text-base font-tripswift-medium">
                        ₹{finalPrice?.baseRatePerNight || selectedRoom.room_price} × {nightsCount}                        </span>
                      </div>
                      <div className="border-t border-tripswift-black/10 my-2 sm:my-3 pt-2 sm:pt-3"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base font-tripswift-bold">
                          {t(
                            "BookingComponents.GuestInformationModal.totalAmount"
                          )}
                        </span>
                        <span className="font-tripswift-bold text-lg sm:text-xl text-tripswift-black/70">
                          ₹{finalPrice?.totalAmount}
                          {/* additional Charges {finalPrice?.baseRatePerNight} */}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Notice */}
                <div className="bg-tripswift-blue/5 rounded-lg p-3 sm:p-4 border border-tripswift-blue/20">
                  <div className="flex items-start">
                    <CreditCard
                      className="text-tripswift-blue flex-shrink-0 mt-1 mr-2 sm:mr-3"
                      size={18}
                    />
                    <div>
                      <p className="text-xs sm:text-sm text-tripswift-black/80 font-tripswift-medium">
                        {t(
                          "BookingComponents.GuestInformationModal.paymentNoticeTitle"
                        )}
                      </p>
                      <p className="text-[10px] sm:text-xs text-tripswift-black/60 mt-1">
                        {t(
                          "BookingComponents.GuestInformationModal.paymentNoticeDescription"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-tripswift-off-white border-t border-tripswift-black/10 p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end rounded-b-lg">
          <button
            onClick={() =>
              activeSection === "review"
                ? setActiveSection("details")
                : onClose()
            }
            className="btn-tripswift-secondary px-4 sm:px-6 py-2 sm:py-2.5 rounded-md transition-all duration-300 font-tripswift-medium flex items-center justify-center text-xs sm:text-sm"
          >
            {activeSection === "review"
              ? t("BookingComponents.GuestInformationModal.backToDetails")
              : t("BookingComponents.GuestInformationModal.cancel")}
          </button>

          {activeSection === "details" ? (
            <button
              onClick={handleUpdate}
              className="btn-tripswift-primary px-4 sm:px-6 py-2 sm:py-2.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-md font-tripswift-medium flex items-center justify-center text-xs sm:text-sm"
            >
              {t("BookingComponents.GuestInformationModal.continueToReview")}
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              disabled={!isFormUpdated}
              className={`btn-tripswift-primary px-4 sm:px-6 py-2 sm:py-2.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-md font-tripswift-medium flex items-center justify-center text-xs sm:text-sm ${!isFormUpdated ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {t("BookingComponents.GuestInformationModal.proceedToPayment")}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default GuestInformationModal;
