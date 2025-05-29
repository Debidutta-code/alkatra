'use client';

import React, { useState, useEffect } from "react";
import { DatePicker, Select, Input, Button, Alert, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from 'react-i18next';
import { 
  CalendarDays, 
  Users, 
  BedDouble, 
  ClipboardEdit, 
  ArrowRight, 
  Check, 
  X, 
  Info,
  BadgeDollarSign,
  Calendar,
  BedIcon,
  Clock,
  ShieldAlert,
  CreditCard
} from "lucide-react";

interface Booking {
  _id: string;
  property: {
    _id: string;
    property_name: string;
  };
  room: {
    _id: string;
    room_name: string;
    room_type: string;
    room_type_code?: string;
  };
  booking_user_name: string;
  booking_user_phone: string;
  amount: number;
  booking_dates: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  adultCount?: number;
  childCount?: number;
  specialRequests?: string;
  ratePlanCode?: string;
  ratePlanName?: string;
}

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
  const { t } = useTranslation();
  
  // States for form fields
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [roomTypeCode, setRoomTypeCode] = useState(booking.room.room_type_code || "STD");
  const [roomType, setRoomType] = useState(booking.room.room_type);
  const [adultCount, setAdultCount] = useState(booking.adultCount || 2);
  const [childCount, setChildCount] = useState(booking.childCount || 0);
  const [specialRequests, setSpecialRequests] = useState(booking.specialRequests || "");
  const [ratePlanCode, setRatePlanCode] = useState(booking.ratePlanCode || "BAR");
  const [ratePlanName, setRatePlanName] = useState(booking.ratePlanName || t('BookingTabs.AmendReservationModal.bestAvailableRate'));
  
  // UI control states
  const [amendmentType, setAmendmentType] = useState<"dates" | "room" | "guests" | "requests">("dates");
  const [loading, setLoading] = useState(false);
  const [priceDifference, setPriceDifference] = useState<{amount: number, type: "increase" | "decrease" | "none"}>({
    amount: 0,
    type: "none"
  });
  const [amendmentMessage, setAmendmentMessage] = useState<{type: 'success' | 'error' | 'warning', text: string} | null>(null);
  
  // Available room types (mock data - would come from API)
  const availableRoomTypes = [
    { code: "STD", name: t('BookingTabs.AmendReservationModal.roomTypes.standard') },
    { code: "DLX", name: t('BookingTabs.AmendReservationModal.roomTypes.deluxe') },
    { code: "SUI", name: t('BookingTabs.AmendReservationModal.roomTypes.suite') },
    { code: "EXE", name: t('BookingTabs.AmendReservationModal.roomTypes.executive') },
    { code: "FAM", name: t('BookingTabs.AmendReservationModal.roomTypes.family') }
  ];
  
  // Available rate plans (mock data - would come from API)
  const availableRatePlans = [
    { code: "BAR", name: t('BookingTabs.AmendReservationModal.ratePlans.bestAvailable') },
    { code: "AAA", name: t('BookingTabs.AmendReservationModal.ratePlans.aaaMember') },
    { code: "PKG", name: t('BookingTabs.AmendReservationModal.ratePlans.package') },
    { code: "WKD", name: t('BookingTabs.AmendReservationModal.ratePlans.weekend') }
  ];
  
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
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Calculate price difference when inputs change
  useEffect(() => {
    calculatePriceDifference();
  }, [dateRange, roomTypeCode, adultCount, childCount, ratePlanCode]);
  
  // Disable dates before today for the date picker
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };
  
  // Mock function to calculate price difference
  const calculatePriceDifference = () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return;
    
    // Calculate original stay duration
    const originalCheckIn = dayjs(booking.checkInDate);
    const originalCheckOut = dayjs(booking.checkOutDate);
    const originalDuration = originalCheckOut.diff(originalCheckIn, 'day');
    
    // Calculate new stay duration
    const newDuration = dateRange[1].diff(dateRange[0], 'day');
    
    // Mock room rates
    const getRoomRate = (typeCode: string) => {
      switch (typeCode) {
        case 'DLX': return 220;
        case 'SUI': return 280;
        case 'EXE': return 350;
        case 'FAM': return 250;
        default: return 180; // STD
      }
    };
    
    // Apply rate plan modifier
    const getRatePlanModifier = (planCode: string) => {
      switch (planCode) {
        case 'AAA': return 0.9; // 10% discount
        case 'PKG': return 1.1; // 10% premium
        case 'WKD': return 1.2; // 20% premium
        default: return 1.0; // BAR
      }
    };
    
    // Calculate costs
    const originalRoomRate = getRoomRate(booking.room.room_type_code || "STD") * 
                            getRatePlanModifier(booking.ratePlanCode || "BAR");
    const newRoomRate = getRoomRate(roomTypeCode) * getRatePlanModifier(ratePlanCode);
    
    const originalCost = originalRoomRate * originalDuration;
    const newCost = newRoomRate * newDuration;
    
    // Additional guest fee 
    const originalGuestFee = (booking.adultCount || 2) > 2 ? ((booking.adultCount || 2) - 2) * 25 * originalDuration : 0;
    const originalChildFee = (booking.childCount || 0) * 15 * originalDuration;
    
    const newGuestFee = adultCount > 2 ? (adultCount - 2) * 25 * newDuration : 0;
    const newChildFee = childCount * 15 * newDuration;
    
    // Calculate final costs
    const totalOriginalCost = originalCost + originalGuestFee + originalChildFee;
    const totalNewCost = newCost + newGuestFee + newChildFee;
    
    // Calculate difference
    const difference = totalNewCost - totalOriginalCost;
    
    // Set price difference state
    setPriceDifference({
      amount: Math.abs(difference),
      type: difference > 0 ? "increase" : difference < 0 ? "decrease" : "none"
    });
  };
  
  // Handle form submission
  const handleSubmitAmendment = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      setAmendmentMessage({
        type: 'error',
        text: t('BookingTabs.AmendReservationModal.errors.selectValidDates')
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create amendment data in a format similar to your XML structure
      const amendedData = {
        // Reservation info
        reservationId: booking._id,
        status: "Modify",
        
        // Room stay info
        propertyInfo: {
          hotelCode: booking.property._id,
          hotelName: booking.property.property_name
        },
        
        // Plan info
        ratePlan: {
          ratePlanCode: ratePlanCode,
          ratePlanName: ratePlanName
        },
        
        // Room info
        roomType: {
          roomTypeCode: roomTypeCode,
          roomTypeName: roomType,
          numberOfUnits: 1
        },
        
        // Guest counts
        guestCounts: {
          adultCount: adultCount,
          childCount: childCount
        },
        
        // Dates
        timeSpan: {
          start: dateRange[0].format('YYYY-MM-DD'),
          end: dateRange[1].format('YYYY-MM-DD')
        },
        
        // Rate info
        rateInfo: {
          totalBeforeTax: booking.amount + (priceDifference.type === "increase" ? priceDifference.amount : -priceDifference.amount),
          currency: "INR"
        },
        
        // Comments
        comments: specialRequests,
        
        // Modification info
        modificationReason: getModificationReason(),
        modificationDate: new Date().toISOString()
      };
      
      // Show success message
      let successMsg = '';
      if (priceDifference.type === "increase") {
        successMsg = t('BookingTabs.AmendReservationModal.success.additionalPayment', {
          amount: priceDifference.amount.toFixed(2)
        });
      } else if (priceDifference.type === "decrease") {
        successMsg = t('BookingTabs.AmendReservationModal.success.refundProcessed', {
          amount: priceDifference.amount.toFixed(2)
        });
      } else {
        successMsg = t('BookingTabs.AmendReservationModal.success.noChange');
      }
      
      setAmendmentMessage({
        type: 'success',
        text: t('BookingTabs.AmendReservationModal.success.reservationAmended') + ' ' + successMsg
      });
      
      // Notify parent component
      setTimeout(() => {
        onAmendComplete(booking._id, amendedData);
      }, 2000);
      
    } catch (error) {
      console.error('Error amending booking:', error);
      setAmendmentMessage({
        type: 'error',
        text: t('BookingTabs.AmendReservationModal.errors.unableToAmend')
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Generate modification reason based on changes
  const getModificationReason = () => {
    const reasons = [];
    
    if (dateRange) {
      const originalCheckIn = dayjs(booking.checkInDate);
      const originalCheckOut = dayjs(booking.checkOutDate);
      
      if (!dateRange[0].isSame(originalCheckIn, 'day')) {
        reasons.push(t('BookingTabs.AmendReservationModal.modifications.changedCheckIn'));
      }
      
      if (!dateRange[1].isSame(originalCheckOut, 'day')) {
        reasons.push(t('BookingTabs.AmendReservationModal.modifications.changedCheckOut'));
      }
    }
    
    if (roomTypeCode !== (booking.room.room_type_code || "STD")) {
      reasons.push(t('BookingTabs.AmendReservationModal.modifications.changedRoomType', { roomType }));
    }
    
    if (adultCount !== (booking.adultCount || 2) || childCount !== (booking.childCount || 0)) {
      reasons.push(t('BookingTabs.AmendReservationModal.modifications.changedGuestCount'));
    }
    
    if (ratePlanCode !== (booking.ratePlanCode || "BAR")) {
      reasons.push(t('BookingTabs.AmendReservationModal.modifications.changedRatePlan', { ratePlanName }));
    }
    
    return reasons.join(", ");
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-noto-sans p-3 sm:p-5">
      <div className="bg-tripswift-off-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h3 className="text-xl sm:text-2xl font-tripswift-bold text-tripswift-black">
            {t('BookingTabs.AmendReservationModal.title')}
          </h3>
          <p className="text-sm sm:text-base text-tripswift-black/60 mt-1 sm:mt-2 max-w-lg mx-auto">
            {t('BookingTabs.AmendReservationModal.subtitle', { propertyName: booking.property.property_name })}
          </p>
        </div>
        
        {/* Original booking details */}
        <div className="bg-gradient-to-r from-tripswift-blue/10 to-tripswift-blue/5 rounded-xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
          <h4 className="text-base sm:text-lg font-tripswift-bold text-tripswift-blue mb-3 sm:mb-4 flex items-center">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
            {t('BookingTabs.AmendReservationModal.currentBookingDetails')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Left column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tripswift-off-white flex items-center justify-center mr-2 sm:mr-3 shadow-sm flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.stayDates')}
                  </p>
                  <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                    {dayjs(booking.checkInDate).format('MMM D, YYYY')} - {dayjs(booking.checkOutDate).format('MMM D, YYYY')}
                  </p>
                  <p className="text-[10px] sm:text-xs text-tripswift-black/50 mt-0.5 sm:mt-1">
                    {t('BookingTabs.AmendReservationModal.nightsCount', {
                      count: dayjs(booking.checkOutDate).diff(dayjs(booking.checkInDate), 'day')
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tripswift-off-white flex items-center justify-center mr-2 sm:mr-3 shadow-sm flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.guests')}
                  </p>
                  <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.guestsCount', {
                      adults: booking.adultCount || 2, 
                      children: booking.childCount || 0
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tripswift-off-white flex items-center justify-center mr-2 sm:mr-3 shadow-sm flex-shrink-0">
                  <BedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.roomDetails')}
                  </p>
                  <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                    {booking.room.room_name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-tripswift-black/50 mt-0.5 sm:mt-1">
                    {booking.room.room_type}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tripswift-off-white flex items-center justify-center mr-2 sm:mr-3 shadow-sm flex-shrink-0">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                    {t('BookingTabs.AmendReservationModal.ratePlan')}
                  </p>
                  <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                    {booking.ratePlanName || t('BookingTabs.AmendReservationModal.bestAvailableRate')}
                  </p>
                  <p className="text-[10px] sm:text-xs text-tripswift-black/50 mt-0.5 sm:mt-1">
                    ₹{booking.amount.toFixed(2)} {t('BookingTabs.AmendReservationModal.total')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Amendment type selector */}
        <div className="mb-4 sm:mb-6">
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
                  :"bg-tripswift-off-white text-tripswift-black/70 border-gray-200 hover:border-tripswift-blue/50 hover:bg-tripswift-blue/5"}
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
            
            <button
              onClick={() => setAmendmentType("room")}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all text-xs sm:text-sm
                ${amendmentType === "room" 
                  ? "bg-tripswift-blue text-white border-tripswift-blue" 
                  : "bg-white text-tripswift-black/70 border-gray-200 hover:border-tripswift-blue/50 hover:bg-tripswift-blue/5"}
              `}
            >
              <BedDouble className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-tripswift-medium">{t('BookingTabs.AmendReservationModal.amendmentTypes.roomType')}</span>
            </button>
            
            <button
              onClick={() => setAmendmentType("requests")}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all text-xs sm:text-sm
                ${amendmentType === "requests" 
                  ? "bg-tripswift-blue text-white border-tripswift-blue" 
                  : "bg-white text-tripswift-black/70 border-gray-200 hover:border-tripswift-blue/50 hover:bg-tripswift-blue/5"}
              `}
            >
              <ClipboardEdit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-tripswift-medium">{t('BookingTabs.AmendReservationModal.amendmentTypes.specialRequests')}</span>
            </button>
          </div>
        </div>
        
        {/* Amendment form fields */}
        <div className="bg-tripswift-off-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 transition duration-300">
          {/* Dates Amendment Form */}
          {amendmentType === "dates" && (
            <div className="space-y-3 sm:space-y-5">
              <div className="flex items-center gap-2 mb-2 sm:mb-4">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                <h4 className="text-base sm:text-lg font-tripswift-bold text-tripswift-black">
                  {t('BookingTabs.AmendReservationModal.changeDates')}
                </h4>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-tripswift-medium text-tripswift-black/70 mb-1 sm:mb-2">
                  {t('BookingTabs.AmendReservationModal.selectNewDates')}
                </label>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                  disabledDate={disabledDate}
                  format="YYYY-MM-DD"
                  className="w-full rounded-lg border-gray-200 py-1.5 sm:py-2 hover:border-tripswift-blue focus:border-tripswift-blue focus:ring focus:ring-tripswift-blue/20"
                  style={{ height: '40px', fontSize: 'inherit' }}
                  placeholder={[
                    t('BookingTabs.AmendReservationModal.checkInDate'),
                    t('BookingTabs.AmendReservationModal.checkOutDate')
                  ]}
                />
              </div>
              
              {dateRange && dateRange[0] && dateRange[1] && (
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-tripswift-blue/5 rounded-lg text-xs sm:text-sm text-tripswift-blue/90 font-tripswift-medium flex items-start sm:items-center">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                  <div>
                    {t('BookingTabs.AmendReservationModal.stayDuration', {
                      count: dateRange[1].diff(dateRange[0], 'day')
                    })}
                    {dateRange[1].diff(dayjs(booking.checkOutDate), 'day') > 0 && (
                      <span className="block sm:inline sm:ml-2 text-tripswift-blue/70">
                        {t('BookingTabs.AmendReservationModal.nightsAdded', {
                          count: dateRange[1].diff(dayjs(booking.checkOutDate), 'day')
                        })}
                      </span>
                    )}
                    {dateRange[1].diff(dayjs(booking.checkOutDate), 'day') < 0 && (
                      <span className="block sm:inline sm:ml-2 text-tripswift-blue/70">
                        {t('BookingTabs.AmendReservationModal.nightsReduced', {
                          count: Math.abs(dateRange[1].diff(dayjs(booking.checkOutDate), 'day'))
                        })}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Guests Amendment Form */}
          {amendmentType === "guests" && (
            <div className="space-y-3 sm:space-y-5">
              <div className="flex items-center gap-2 mb-2 sm:mb-4">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                <h4 className="text-base sm:text-lg font-tripswift-bold text-tripswift-black">
                  {t('BookingTabs.AmendReservationModal.changeGuests')}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-tripswift-medium text-tripswift-black/70 mb-1 sm:mb-2">
                    {t('BookingTabs.AmendReservationModal.numberOfAdults')}
                  </label>
                  <Select
                    value={adultCount}
                    onChange={value => setAdultCount(value)}
                    className="w-full rounded-lg"
                    size={window.innerWidth < 640 ? "middle" : "large"}
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <Option key={`adult-${num}`} value={num}>
                        {num} {t('BookingTabs.AmendReservationModal.adult', { count: num })}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-tripswift-medium text-tripswift-black/70 mb-1 sm:mb-2">
                    {t('BookingTabs.AmendReservationModal.numberOfChildren')}
                  </label>
                  <Select
                    value={childCount}
                    onChange={value => setChildCount(value)}
                    className="w-full rounded-lg"
                    size={window.innerWidth < 640 ? "middle" : "large"}
                  >
                    {[0, 1, 2, 3, 4].map(num => (
                      <Option key={`child-${num}`} value={num}>
                        {num} {t('BookingTabs.AmendReservationModal.child', { count: num })}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-tripswift-blue/5 rounded-lg text-xs sm:text-sm text-tripswift-blue/90 font-tripswift-medium flex items-start">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                <span>{t('BookingTabs.AmendReservationModal.guestsNote')}</span>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-tripswift-medium text-tripswift-black/70 mb-1 sm:mb-2">
                    {t('BookingTabs.AmendReservationModal.roomType')}
                  </label>
                  <Select
                    value={roomTypeCode}
                    onChange={value => {
                      setRoomTypeCode(value);
                      const selectedRoom = availableRoomTypes.find(r => r.code === value);
                      if (selectedRoom) setRoomType(selectedRoom.name);
                    }}
                    className="w-full rounded-lg"
                    size={window.innerWidth < 640 ? "middle" : "large"}
                  >
                    {availableRoomTypes.map(type => (
                      <Option key={type.code} value={type.code}>{type.name}</Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-tripswift-medium text-tripswift-black/70 mb-1 sm:mb-2">
                    {t('BookingTabs.AmendReservationModal.ratePlan')}
                  </label>
                  <Select
                    value={ratePlanCode}
                    onChange={value => {
                      setRatePlanCode(value);
                      const selectedPlan = availableRatePlans.find(p => p.code === value);
                      if (selectedPlan) setRatePlanName(selectedPlan.name);
                    }}
                    className="w-full rounded-lg"
                    size={window.innerWidth < 640 ? "middle" : "large"}
                  >
                    {availableRatePlans.map(plan => (
                      <Option key={plan.code} value={plan.code}>{plan.name}</Option>
                    ))}
                  </Select>
                </div>
              </div>
              
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-tripswift-blue/5 rounded-lg text-xs sm:text-sm text-tripswift-blue/90 font-tripswift-medium flex items-start">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                <span>{t('BookingTabs.AmendReservationModal.roomTypeNote')}</span>
              </div>
            </div>
          )}
          
          {/* Special Requests Amendment Form */}
          {amendmentType === "requests" && (
            <div className="space-y-3 sm:space-y-5">
              <div className="flex items-center gap-2 mb-2 sm:mb-4">
                <ClipboardEdit className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue" />
                <h4 className="text-base sm:text-lg font-tripswift-bold text-tripswift-black">
                  {t('BookingTabs.AmendReservationModal.updateSpecialRequests')}
                </h4>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-tripswift-medium text-tripswift-black/70 mb-1 sm:mb-2">
                  {t('BookingTabs.AmendReservationModal.specialRequestsLabel')}
                </label>
                <TextArea
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  rows={4}
                  placeholder={t('BookingTabs.AmendReservationModal.specialRequestsPlaceholder')}
                  className="w-full rounded-lg border-gray-200 hover:border-tripswift-blue focus:border-tripswift-blue focus:ring focus:ring-tripswift-blue/20 text-sm"
                />
              </div>
              
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-tripswift-blue/5 rounded-lg text-xs sm:text-sm text-tripswift-blue/90 font-tripswift-medium flex items-start">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                <span>{t('BookingTabs.AmendReservationModal.specialRequestsNote')}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Price difference */}
        {priceDifference.type !== "none" && (
          <div className={`rounded-xl shadow-sm overflow-hidden mb-4 sm:mb-6`}>
            <div className={`py-2 sm:py-3 px-3 sm:px-4 ${
              priceDifference.type === "increase" 
                ? "bg-amber-500 text-white" 
                : "bg-green-500 text-white"
            }`}>
              <h4 className="font-tripswift-bold text-sm sm:text-base">
                {t('BookingTabs.AmendReservationModal.priceAdjustment')}
              </h4>
            </div>
            
            <div className={`p-3 sm:p-5 border border-t-0 ${
              priceDifference.type === "increase"
                ? "border-amber-200 bg-amber-50" 
                : "border-green-200 bg-green-50"
            }`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                  priceDifference.type === "increase"
                    ? "bg-amber-100 text-amber-700" 
                    : "bg-green-100 text-green-700"
                }`}>
                  <BadgeDollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                
                <div>
                  {priceDifference.type === "increase" ? (
                    <>
                      <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium mb-0.5 sm:mb-1">
                        {t('BookingTabs.AmendReservationModal.additionalPayment')}
                      </p>
                      <p className="text-xs sm:text-sm text-tripswift-black/70">
                        {t('BookingTabs.AmendReservationModal.additionalChargeExplanation', {
                          amount: priceDifference.amount.toFixed(2)
                        })}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium mb-0.5 sm:mb-1">
                        {t('BookingTabs.AmendReservationModal.refundToBeProcessed')}
                      </p>
                      <p className="text-xs sm:text-sm text-tripswift-black/70">
                        {t('BookingTabs.AmendReservationModal.refundExplanation', {
                          amount: priceDifference.amount.toFixed(2)
                        })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Amendment policies */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
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
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border flex items-start sm:items-center gap-3 sm:gap-4 ${
            amendmentMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : amendmentMessage.type === 'warning' 
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              amendmentMessage.type === 'success' 
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
            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl text-tripswift-black/80 hover:bg-gray-50 font-tripswift-medium transition-colors text-sm sm:text-base mt-2 sm:mt-0"
          >
            {t('BookingTabs.AmendReservationModal.cancel')}
          </button>
          
          <button 
            onClick={handleSubmitAmendment}
            disabled={loading}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-tripswift-blue to-[#054B8F] hover:from-[#054B8F] hover:to-tripswift-blue text-tripswift-off-white rounded-lg sm:rounded-xl font-tripswift-medium shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex items-center justify-center text-sm sm:text-base"
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