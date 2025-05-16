"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal/Modal";
import GuestBox from "../HotelBox/GuestBox";
import PhoneInput from 'react-phone-number-input';
import "react-phone-number-input/style.css";
import { useDispatch, useSelector } from "react-redux";
import { setGuestDetails } from "@/Redux/slices/pmsHotelCard.slice";

// User type definition
interface UserType {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  _id?: string; // Add user ID if available
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
  propertyInfo_id?: string; // Property ID field
  property_id?: string; // Alternative property ID field
  [key: string]: any; // For other properties
}

interface GuestInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: Room | null;
  checkInDate: string; // Add check-in date
  checkOutDate: string; // Add check-out date
  onConfirmBooking: (formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    propertyId: string; // Add property ID
    roomId: string; // Add room ID
    checkIn: string; // Add check-in date
    checkOut: string; // Add check-out date
    amount: string; // Add amount
    userId?: string; // Add user ID if available
  }) => void;
}

const GuestInformationModal: React.FC<GuestInformationModalProps> = ({
  isOpen,
  onClose,
  selectedRoom,
  checkInDate,
  checkOutDate,
  onConfirmBooking
}) => {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [firstName, setFirstName] = useState<string>(authUser?.firstName || "");
  const [lastName, setLastName] = useState<string>(authUser?.lastName || "");
  const [email, setEmail] = useState<string>(authUser?.email || "");
  const [phone, setPhone] = useState<string | undefined>("");
  const [isFormUpdated, setIsFormUpdated] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (authUser) {
      setFirstName(authUser.firstName);
      setLastName(authUser.lastName);
      setEmail(authUser.email);
      if (authUser.phone) {
        if (authUser.phone.startsWith('+')) {
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
  }, [authUser]);

  const handleUpdate = () => {
    let valid = true;
    setErrorMessage(null);

    if (!firstName || !/^[A-Za-z\s]+$/.test(firstName)) {
      setErrorMessage("First Name is required and should only contain letters and spaces.");
      valid = false;
    }

    if (!lastName || !/^[A-Za-z\s]+$/.test(lastName)) {
      setErrorMessage("Last Name is required and should only contain letters and spaces.");
      valid = false;
    }

    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      valid = false;
    }

    if (!phone) {
      setErrorMessage("Phone number is required");
      valid = false;
    }

    if (valid) {
      setIsFormUpdated(true);
      setUpdateMessage("Form updated successfully!");
      dispatch(setGuestDetails({ firstName, lastName, email, phone }));
    }
  };

  const handleConfirmBooking = () => {
    if (isFormUpdated && selectedRoom) {
      // Determine property ID from the room object
      const propertyId = selectedRoom.propertyInfo_id || 
                         selectedRoom.property_id || 
                         selectedRoom.propertyId || 
                         "";
      
      // If propertyId is missing, show an error
      if (!propertyId) {
        setErrorMessage("Property information is missing. Please try again.");
        return;
      }
      
      onConfirmBooking({
        firstName,
        lastName,
        email,
        phone: phone || '',
        propertyId,
        roomId: selectedRoom._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        amount: selectedRoom.room_price.toString(),
        userId: authUser?._id // Pass user ID if available
      });
    }
  };

  if (!isOpen || !selectedRoom) return null;

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="flex flex-col items-center justify-between gap-6 w-full max-h-[90vh] overflow-y-auto p-4">
        {/* Guest Information Form Section */}
        <div className="flex flex-col items-start pt-2 w-full">
          <h2 className="text-xl font-semibold p-4 text-gray-700">Your Information</h2>
          <div className="flex flex-col md:flex-row items-start justify-between gap-2 w-full">
            <div className="pb-2 w-full md:w-1/3">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="pb-2 w-full md:w-1/3">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="pb-2 w-full md:w-1/3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start justify-between gap-2 w-full pt-4">
            <div className="pb-2 w-full md:w-1/2">
              <label htmlFor="guestDetails" className="block text-sm font-medium text-gray-700">
                Guest Details
              </label>
              <GuestBox />
            </div>
            <div className="pb-2 w-full md:w-1/2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <PhoneInput
                id="phone"
                name="phone"
                value={phone}
                onChange={setPhone}
                maxLength={15}
                defaultCountry="IN"
                className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-full"
                international
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleUpdate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 mt-4"
          >
            Update
          </button>
          {updateMessage && (
            <p className="text-green-500 text-sm mt-2">{updateMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
        </div>

        {/* Booking Confirmation Section */}
        <div className="flex flex-col items-start p-4 w-full">
          <h2 className="text-xl font-semibold pb-4 text-gray-700">Confirm Booking</h2>

          <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:border-r border-gray-300 pr-4">
                <h3 className="text-lg font-semibold text-gray-600 pb-2">Guest Details</h3>
                <p className="text-gray-700"><span className="font-medium">Name:</span> {firstName} {lastName}</p>
                <p className="text-gray-700"><span className="font-medium">Phone:</span> {phone || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-600 pb-2">Booking Details</h3>
                <p className="text-gray-700"><span className="font-medium">Room:</span> {selectedRoom.room_name}</p>
                <p className="text-gray-700"><span className="font-medium">Type:</span> {selectedRoom.room_type}</p>
                <p className="text-gray-700"><span className="font-medium">Amount:</span> ₹{selectedRoom.room_price}</p>
                <p className="text-gray-700"><span className="font-medium">Check-in:</span> {checkInDate}</p>
                <p className="text-gray-700"><span className="font-medium">Check-out:</span> {checkOutDate}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 w-full">
            <button
              onClick={handleConfirmBooking}
              className={`w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition mb-2 sm:mb-0 ${!isFormUpdated ? 'opacity-70' : ''}`}
              disabled={!isFormUpdated}
            >
              Pay
            </button>
            <button
              onClick={onClose}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GuestInformationModal;