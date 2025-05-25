"use client";

import React, { useState, useEffect } from "react";
import GuestBox from "../HotelBox/GuestBox";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useDispatch, useSelector } from "react-redux";
import { setGuestDetails } from "@/Redux/slices/pmsHotelCard.slice";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  CheckCircle,
  Users,
  X,
} from "lucide-react";
import { formatDate, calculateNights } from "@/utils/dateUtils";
import { useTranslation } from "react-i18next";

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
    firstName: string;
    lastName: string;
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
  }) => void;
  guestData?: {
    rooms?: number;
    guests?: number;
    children?: number;
    childAges?: number[];
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
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
  const [firstName, setFirstName] = useState<string>(authUser?.firstName || "");
  const [lastName, setLastName] = useState<string>(authUser?.lastName || "");
  const [email, setEmail] = useState<string>(authUser?.email || "");
  const [phone, setPhone] = useState<string | undefined>("");
  const [isFormUpdated, setIsFormUpdated] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"details" | "review">(
    "details"
  );

  const dispatch = useDispatch();
  const { t } = useTranslation();

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

  useEffect(() => {
    if (guestData) {
      setFirstName(guestData.firstName || "");
      setLastName(guestData.lastName || "");
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
      setFirstName(authUser.firstName);
      setLastName(authUser.lastName);
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

  const handleUpdate = () => {
    let valid = true;
    setErrorMessage(null);

    if (!firstName || !/^[A-Za-z\s]+$/.test(firstName)) {
      setErrorMessage(
        t("BookingComponents.GuestInformationModal.firstNameError")
      );
      valid = false;
    }

    if (!lastName || !/^[A-Za-z\s]+$/.test(lastName)) {
      setErrorMessage(
        t("BookingComponents.GuestInformationModal.lastNameError")
      );
      valid = false;
    }

    if (
      !email ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      setErrorMessage(t("BookingComponents.GuestInformationModal.emailError"));
      valid = false;
    }

    if (!phone) {
      setErrorMessage(t("BookingComponents.GuestInformationModal.phoneError"));
      valid = false;
    }

    if (valid) {
      setIsFormUpdated(true);
      setUpdateMessage(
        t("BookingComponents.GuestInformationModal.informationVerified")
      );

      dispatch(
        setGuestDetails({
          firstName,
          lastName,
          email,
          phone,
          rooms: guestData?.rooms || 1,
          guests: guestData?.guests || 1,
          children: guestData?.children || 0,
          childAges: guestData?.childAges || [],
        })
      );

      setTimeout(() => {
        setActiveSection("review");
      }, 800);
    }
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

      const nightsCount = calculateNights(checkInDate, checkOutDate);
      const totalPrice = selectedRoom.room_price * nightsCount;

      onConfirmBooking({
        firstName,
        lastName,
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
      });
    }
  };

  if (!isOpen || !selectedRoom) return null;

  const nightsCount = calculateNights(checkInDate, checkOutDate);
  const nightsText =
    nightsCount === 1
      ? t("BookingComponents.GuestInformationModal.nights")
      : t("BookingComponents.GuestInformationModal.nightsPlural");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Centered Dialog Box */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] rounded-lg shadow-lg font-noto-sans">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-tripswift-blue text-tripswift-off-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-tripswift-bold">
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
        <div className="bg-tripswift-off-white px-6 py-3 border-b border-tripswift-black/10">
          <div className="flex justify-between mb-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-tripswift-medium ${activeSection === "details" || isFormUpdated
                    ? "bg-tripswift-blue text-tripswift-off-white"
                    : "bg-tripswift-black/10 text-tripswift-black/60"
                  }`}
              >
                1
              </div>
              <span className="text-xs mt-1 font-tripswift-medium">
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-tripswift-medium ${activeSection === "review" && isFormUpdated
                    ? "bg-tripswift-blue text-tripswift-off-white"
                    : "bg-tripswift-black/10 text-tripswift-black/60"
                  }`}
              >
                2
              </div>
              <span className="text-xs mt-1 font-tripswift-medium">
                {t("BookingComponents.GuestInformationModal.reviewAndPayStep")}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content with padding-bottom to prevent overlap with fixed footer */}
        <div className="flex-1 overflow-y-auto p-6 pb-24">
          {activeSection === "details" ? (
            <div className="space-y-6">
              {/* Room Summary */}
              <div className="bg-tripswift-off-white rounded-lg shadow-sm p-3 border border-tripswift-black/10 mb-6">
                <h3 className="font-tripswift-medium text-tripswift-black text-lg mb-1 px-3">
                  {selectedRoom.room_name}
                </h3>

                <div className="flex items-center gap-2">
                  <div className="bg-tripswift-blue/10 pl-3 rounded-lg">
                    <Calendar className="text-tripswift-blue h-5 w-5" />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="text-sm bg-tripswift-blue/5 text-tripswift-black/70  py-1 rounded font-tripswift-medium">
                      {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                    </span>
                    <span className="text-sm bg-tripswift-blue/5 text-tripswift-black/70 px-1 py-1 rounded font-tripswift-medium">
                      {nightsCount} {nightsText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guest Information Form */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-tripswift-black/10">
                <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-4">
                  {t(
                    "BookingComponents.GuestInformationModal.guestInformation"
                  )}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="firstName"
                        className="text-sm ml-1 font-tripswift-medium text-tripswift-black/80 flex items-center"
                      >
                        <User size={16} className="text-tripswift-blue mr-2" />
                        {t(
                          "BookingComponents.GuestInformationModal.firstNameLabel"
                        )}
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t(
                          "BookingComponents.GuestInformationModal.firstNamePlaceholder"
                        )}
                        className="w-full px-3 py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-sm font-tripswift-regular"
                      />
                    </div>

                    <div className="space-y-1 ">
                      <label
                        htmlFor="lastName"
                        className="text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                      >
                        <User size={16} className="text-tripswift-blue mr-2" />
                        {t(
                          "BookingComponents.GuestInformationModal.lastNameLabel"
                        )}
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t(
                          "BookingComponents.GuestInformationModal.lastNamePlaceholder"
                        )}
                        className="w-full px-3 py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-sm font-tripswift-regular"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className="text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                    >
                      <Mail size={16} className="text-tripswift-blue mr-2" />
                      {t("BookingComponents.GuestInformationModal.emailLabel")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t(
                        "BookingComponents.GuestInformationModal.emailPlaceholder"
                      )}
                      className="w-full px-3 py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-sm font-tripswift-regular"
                    />
                    <p className="text-sm text-tripswift-black/50 ml-1 mt-1">
                      {t("BookingComponents.GuestInformationModal.emailInfo")}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="phone"
                      className="text-sm font-tripswift-medium ml-1 text-tripswift-black/80 flex items-center"
                    >
                      <Phone size={16} className="text-tripswift-blue mr-2" />
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
                      className="w-full px-3 h-11 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-sm font-tripswift-regular"
                      international
                    />
                    <p className="text-sm text-tripswift-black/50 ml-1 mt-1">
                      {t("BookingComponents.GuestInformationModal.phoneInfo")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-tripswift-black/10 pt-6">
                  <div className="space-y-3">
                    <label
                      htmlFor="guestDetails"
                      className="text-sm ml-1 font-tripswift-medium text-tripswift-black/80 flex items-center"
                    >
                      <Users size={16} className="text-tripswift-blue mr-2" />
                      {t(
                        "BookingComponents.GuestInformationModal.guestDetailsSection"
                      )}
                    </label>

                    {/* <div className="bg-tripswift-blue/5 border border-tripswift-blue/10 rounded-lg p-3 mb-3">
                      <p className="text-sm font-tripswift-medium text-tripswift-blue/80">
                        {getGuestCountDisplay()}
                      </p>
                    </div> */}

                    <GuestBox />
                  </div>
                </div>

                {errorMessage && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm font-tripswift-regular">
                    {errorMessage}
                  </div>
                )}

                {updateMessage && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm font-tripswift-regular flex items-center">
                    <CheckCircle size={16} className="mr-2" />
                    {updateMessage}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Review Booking Section */}
              <div className="bg-tripswift-off-white rounded-lg shadow-sm border border-tripswift-black/10 overflow-hidden">
                <div className="bg-tripswift-blue/5 border-b border-tripswift-black/10 p-4">
                  <h3 className="font-tripswift-bold text-tripswift-black text-lg">
                    {t(
                      "BookingComponents.GuestInformationModal.bookingSummary"
                    )}
                  </h3>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <h4 className="font-tripswift-medium text-tripswift-black mb-3 flex items-center">
                        <Calendar
                          size={18}
                          className="text-tripswift-blue mr-2"
                        />
                        {t(
                          "BookingComponents.GuestInformationModal.stayDetails"
                        )}
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.roomType"
                            )}
                          </p>
                          <p className="font-tripswift-medium">
                            {selectedRoom.room_name} ({selectedRoom.room_type})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.checkIn"
                            )}
                          </p>
                          <p className="font-tripswift-medium">
                            {formatDate(checkInDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.checkOut"
                            )}
                          </p>
                          <p className="font-tripswift-medium">
                            {formatDate(checkOutDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.nights"
                            )}
                          </p>
                          <p className="font-tripswift-medium">
                            {nightsCount} {nightsText}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.guestDetailsSection"
                            )}
                          </p>
                          <p className="font-tripswift-medium">
                            {getGuestCountDisplay()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-tripswift-medium text-tripswift-black mb-3 flex items-center">
                        <User size={18} className="text-tripswift-blue mr-2" />
                        {t(
                          "BookingComponents.GuestInformationModal.guestInformation"
                        )}
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.primaryGuest"
                            )}
                          </p>
                          <p className="font-tripswift-medium">
                            {firstName} {lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.emailLabel"
                            )}
                          </p>
                          <p className="font-tripswift-medium">{email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">
                            {t(
                              "BookingComponents.GuestInformationModal.phoneLabel"
                            )}
                          </p>
                          <p className="font-tripswift-medium">{phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary Card */}
              <div className="bg-tripswift-off-white rounded-lg shadow-sm border border-tripswift-black/10 overflow-hidden">
                <div className="bg-tripswift-blue/5 border-b border-tripswift-black/10 p-4">
                  <h3 className="font-tripswift-bold text-tripswift-black text-lg">
                    {t("BookingComponents.GuestInformationModal.priceDetails")}
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-tripswift-black/70">
                        {t("BookingComponents.GuestInformationModal.roomRate")}{" "}
                        ({nightsCount} {nightsText})
                      </span>
                      <span className="font-tripswift-medium">
                        ₹{selectedRoom.room_price} × {nightsCount}
                      </span>
                    </div>
                    <div className="border-t border-tripswift-black/10 my-3 pt-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-tripswift-bold text-lg">
                        {t(
                          "BookingComponents.GuestInformationModal.totalAmount"
                        )}
                      </span>
                      <span className="font-tripswift-bold text-xl text-tripswift-blue">
                        ₹{selectedRoom.room_price * nightsCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Notice */}
              <div className="bg-tripswift-blue/5 rounded-lg p-4 border border-tripswift-blue/20">
                <div className="flex items-start">
                  <CreditCard
                    className="text-tripswift-blue flex-shrink-0 mt-1 mr-3"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-tripswift-black/80 font-tripswift-medium">
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

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-tripswift-off-white border-t border-tripswift-black/10 p-6 flex flex-col sm:flex-row gap-3 justify-end rounded-b-lg">
          <button
            onClick={() =>
              activeSection === "review"
                ? setActiveSection("details")
                : onClose()
            }
            className="btn-tripswift-secondary px-6 py-2.5 rounded-md transition-all duration-300 font-tripswift-medium flex items-center justify-center"
          >
            {activeSection === "review"
              ? t("BookingComponents.GuestInformationModal.backToDetails")
              : t("BookingComponents.GuestInformationModal.cancel")}
          </button>

          {activeSection === "details" ? (
            <button
              onClick={handleUpdate}
              className="btn-tripswift-primary px-6 py-2.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-md font-tripswift-medium flex items-center justify-center"
            >
              {t("BookingComponents.GuestInformationModal.continueToReview")}
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              disabled={!isFormUpdated}
              className={`btn-tripswift-primary px-6 py-2.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-md font-tripswift-medium flex items-center justify-center ${!isFormUpdated ? "opacity-70 cursor-not-allowed" : ""
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
