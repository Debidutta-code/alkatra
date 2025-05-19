"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal/Modal";
import GuestBox from "../HotelBox/GuestBox";
import PhoneInput from 'react-phone-number-input';
import "react-phone-number-input/style.css";
import { useDispatch, useSelector } from "react-redux";
import { setGuestDetails } from "@/Redux/slices/pmsHotelCard.slice";
import { User, Mail, Phone, Calendar, CreditCard, CheckCircle, X } from "lucide-react";

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
  const [activeSection, setActiveSection] = useState<'details' | 'review'>('details');

  const dispatch = useDispatch();

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

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
      setUpdateMessage("Information verified successfully!");
      dispatch(setGuestDetails({ firstName, lastName, email, phone }));
      
      // Auto-advance to review section after successful update
      setTimeout(() => {
        setActiveSection('review');
      }, 800);
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
        amount: selectedRoom.room_size.toString(),
        userId: authUser?._id // Pass user ID if available
      });
    }
  };

  if (!isOpen || !selectedRoom) return null;

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="relative flex flex-col w-full max-h-[90vh] bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8]">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-tripswift-blue text-tripswift-off-white px-6 py-4">
          <h2 className="text-xl font-tripswift-bold">Complete Your Booking</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-tripswift-blue/80 transition-colors"
            aria-label="Close"
          >
            {/* <X size={24} /> */}
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="bg-white px-6 py-3 border-b border-tripswift-black/10">
          <div className="flex justify-between mb-2">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-tripswift-medium ${
                activeSection === 'details' || isFormUpdated
                  ? 'bg-tripswift-blue text-tripswift-off-white'
                  : 'bg-tripswift-black/10 text-tripswift-black/60'
              }`}>
                1
              </div>
              <span className="text-xs mt-1 font-tripswift-medium">Guest Details</span>
            </div>
            <div className="flex-1 flex items-center mx-2">
              <div className={`h-1 w-full ${isFormUpdated ? 'bg-tripswift-blue' : 'bg-tripswift-black/10'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-tripswift-medium ${
                activeSection === 'review' && isFormUpdated
                  ? 'bg-tripswift-blue text-tripswift-off-white'
                  : 'bg-tripswift-black/10 text-tripswift-black/60'
              }`}>
                2
              </div>
              <span className="text-xs mt-1 font-tripswift-medium">Review & Pay</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'details' ? (
            <div className="space-y-6">
              {/* Room Summary */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-tripswift-black/10 mb-6">
                <div className="flex items-start">
                  <div className="bg-tripswift-blue/10 p-3 rounded-lg">
                    <Calendar className="text-tripswift-blue h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-tripswift-medium text-tripswift-black text-lg">{selectedRoom.room_name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-xs bg-tripswift-blue/5 text-tripswift-black/70 px-2 py-1 rounded font-tripswift-medium">
                        {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                      </span>
                      {/* <span className="text-xs bg-tripswift-blue/5 text-tripswift-black/70 px-2 py-1 rounded font-tripswift-medium">
                        {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                      </span> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Information Form */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-tripswift-black/10">
                <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-4">Guest Information</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="firstName" className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center">
                        <User size={16} className="text-tripswift-blue mr-2" />
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        className="w-full px-3 py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-sm font-tripswift-regular"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="lastName" className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center">
                        <User size={16} className="text-tripswift-blue mr-2" />
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        className="w-full px-3 py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-sm font-tripswift-regular"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center">
                      <Mail size={16} className="text-tripswift-blue mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-sm font-tripswift-regular"
                    />
                    <p className="text-xs text-tripswift-black/50 mt-1">Your booking confirmation will be sent to this email address</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center">
                      <Phone size={16} className="text-tripswift-blue mr-2" />
                      Phone Number
                    </label>
                    <PhoneInput
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={setPhone}
                      maxLength={15}
                      defaultCountry="IN"
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-tripswift-black/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-sm font-tripswift-regular"
                      international
                    />
                    <p className="text-xs text-tripswift-black/50 mt-1">For booking-related notifications</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-tripswift-black/10 pt-6">
                  <div className="space-y-1">
                    <label htmlFor="guestDetails" className="text-sm font-tripswift-medium text-tripswift-black/80 flex items-center">
                      <User size={16} className="text-tripswift-blue mr-2" />
                      Guest Details
                    </label>
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
              <div className="bg-white rounded-lg shadow-sm border border-tripswift-black/10 overflow-hidden">
                <div className="bg-tripswift-blue/5 border-b border-tripswift-black/10 p-4">
                  <h3 className="font-tripswift-bold text-tripswift-black text-lg">Booking Summary</h3>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <h4 className="font-tripswift-medium text-tripswift-black mb-3 flex items-center">
                        <Calendar size={18} className="text-tripswift-blue mr-2" />
                        Stay Details
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-tripswift-black/60">Room Type</p>
                          <p className="font-tripswift-medium">{selectedRoom.room_name} ({selectedRoom.room_type})</p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">Check-in</p>
                          <p className="font-tripswift-medium">{formatDate(checkInDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">Check-out</p>
                          <p className="font-tripswift-medium">{formatDate(checkOutDate)}</p>
                        </div>
                        {/* <div>
                          <p className="text-sm text-tripswift-black/60">Duration</p>
                          <p className="font-tripswift-medium">{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</p>
                        </div> */}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-tripswift-medium text-tripswift-black mb-3 flex items-center">
                        <User size={18} className="text-tripswift-blue mr-2" />
                        Guest Information
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-tripswift-black/60">Primary Guest</p>
                          <p className="font-tripswift-medium">{firstName} {lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">Email</p>
                          <p className="font-tripswift-medium">{email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-tripswift-black/60">Phone</p>
                          <p className="font-tripswift-medium">{phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Price Summary Card */}
              <div className="bg-white rounded-lg shadow-sm border border-tripswift-black/10 overflow-hidden">
                <div className="bg-tripswift-blue/5 border-b border-tripswift-black/10 p-4">
                  <h3 className="font-tripswift-bold text-tripswift-black text-lg">Price Details</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-tripswift-black/70">Room Rate</span>
                      <span className="font-tripswift-medium">₹{(selectedRoom.room_price)}</span>
                    </div>
                    <div className="border-t border-tripswift-black/10 my-3 pt-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-tripswift-bold text-lg">Total Amount</span>
                      <span className="font-tripswift-bold text-xl text-tripswift-blue">
                        ₹{(selectedRoom.room_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Notice */}
              <div className="bg-tripswift-blue/5 rounded-lg p-4 border border-tripswift-blue/20">
                <div className="flex items-start">
                  <CreditCard className="text-tripswift-blue flex-shrink-0 mt-1 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-tripswift-black/80 font-tripswift-medium">
                      Payment will be processed securely
                    </p>
                    <p className="text-xs text-tripswift-black/60 mt-1">
                      By proceeding, you agree to our terms and conditions and privacy policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-tripswift-black/10 p-6 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={() => activeSection === 'review' ? setActiveSection('details') : onClose()}
            className="btn-tripswift-secondary px-6 py-2.5 rounded-md transition-all duration-300 font-tripswift-medium flex items-center justify-center"
          >
            {activeSection === 'review' ? 'Back to Details' : 'Cancel'}
          </button>
          
          {activeSection === 'details' ? (
            <button
              onClick={handleUpdate}
              className="btn-tripswift-primary px-6 py-2.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-md font-tripswift-medium flex items-center justify-center"
            >
              Continue to Review
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              disabled={!isFormUpdated}
              className={`btn-tripswift-primary px-6 py-2.5 rounded-md transition-all duration-300 shadow-sm hover:shadow-md font-tripswift-medium flex items-center justify-center ${!isFormUpdated ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              Proceed to Payment
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GuestInformationModal;