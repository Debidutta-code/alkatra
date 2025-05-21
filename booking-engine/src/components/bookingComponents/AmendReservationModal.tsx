// components/bookingComponents/AmendReservationModal.tsx

import React, { useState, useEffect } from "react";
import { DatePicker, Select, Input, Button, Alert, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";
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
  // States for form fields
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [roomTypeCode, setRoomTypeCode] = useState(booking.room.room_type_code || "STD");
  const [roomType, setRoomType] = useState(booking.room.room_type);
  const [adultCount, setAdultCount] = useState(booking.adultCount || 2);
  const [childCount, setChildCount] = useState(booking.childCount || 0);
  const [specialRequests, setSpecialRequests] = useState(booking.specialRequests || "");
  const [ratePlanCode, setRatePlanCode] = useState(booking.ratePlanCode || "BAR");
  const [ratePlanName, setRatePlanName] = useState(booking.ratePlanName || "Best Available Rate");
  
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
    { code: "STD", name: "Standard Room" },
    { code: "DLX", name: "Deluxe Room" },
    { code: "SUI", name: "Suite Room" },
    { code: "EXE", name: "Executive Suite" },
    { code: "FAM", name: "Family Room" }
  ];
  
  // Available rate plans (mock data - would come from API)
  const availableRatePlans = [
    { code: "BAR", name: "Best Available Rate" },
    { code: "AAA", name: "AAA Member Rate" },
    { code: "PKG", name: "Package Rate" },
    { code: "WKD", name: "Weekend Special" }
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
        text: 'Please select valid check-in and check-out dates.'
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
          currency: "USD"
        },
        
        // Comments
        comments: specialRequests,
        
        // Modification info
        modificationReason: getModificationReason(),
        modificationDate: new Date().toISOString()
      };
      
      // Show success message
      setAmendmentMessage({
        type: 'success',
        text: `Your reservation has been successfully amended. ${
          priceDifference.type === "increase" 
            ? `An additional payment of $${priceDifference.amount.toFixed(2)} will be processed.` 
            : priceDifference.type === "decrease" 
              ? `A refund of $${priceDifference.amount.toFixed(2)} will be processed.`
              : 'There is no change in the total price.'
        }`
      });
      
      // Notify parent component
      setTimeout(() => {
        onAmendComplete(booking._id, amendedData);
      }, 2000);
      
    } catch (error) {
      console.error('Error amending booking:', error);
      setAmendmentMessage({
        type: 'error',
        text: 'Unable to amend booking. Please try again or contact support.'
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
        reasons.push("Changed check-in date");
      }
      
      if (!dateRange[1].isSame(originalCheckOut, 'day')) {
        reasons.push("Changed check-out date");
      }
    }
    
    if (roomTypeCode !== (booking.room.room_type_code || "STD")) {
      reasons.push(`Changed room type to ${roomType}`);
    }
    
    if (adultCount !== (booking.adultCount || 2) || childCount !== (booking.childCount || 0)) {
      reasons.push("Changed guest count");
    }
    
    if (ratePlanCode !== (booking.ratePlanCode || "BAR")) {
      reasons.push(`Changed rate plan to ${ratePlanName}`);
    }
    
    return reasons.join(", ");
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-tripswift-bold text-tripswift-black">Amend Your Reservation</h3>
        <p className="text-tripswift-black/60 mt-2 max-w-lg mx-auto">
          Make changes to your upcoming stay at {booking.property.property_name}
        </p>
      </div>
      
      {/* Original booking details */}
      <div className="bg-gradient-to-r from-tripswift-blue/10 to-tripswift-blue/5 rounded-xl p-5 mb-6">
        <h4 className="text-lg font-tripswift-bold text-tripswift-blue mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Current Booking Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                <Calendar className="h-5 w-5 text-tripswift-blue" />
              </div>
              <div>
                <p className="text-sm text-tripswift-black/60 font-tripswift-medium">Stay Dates</p>
                <p className="text-tripswift-black font-tripswift-medium">
                  {dayjs(booking.checkInDate).format('MMM D, YYYY')} - {dayjs(booking.checkOutDate).format('MMM D, YYYY')}
                </p>
                <p className="text-xs text-tripswift-black/50 mt-1">
                  {dayjs(booking.checkOutDate).diff(dayjs(booking.checkInDate), 'day')} nights
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                <Users className="h-5 w-5 text-tripswift-blue" />
              </div>
              <div>
                <p className="text-sm text-tripswift-black/60 font-tripswift-medium">Guests</p>
                <p className="text-tripswift-black font-tripswift-medium">
                  {booking.adultCount || 2} Adults, {booking.childCount || 0} Children
                </p>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                <BedIcon className="h-5 w-5 text-tripswift-blue" />
              </div>
              <div>
                <p className="text-sm text-tripswift-black/60 font-tripswift-medium">Room Details</p>
                <p className="text-tripswift-black font-tripswift-medium">
                  {booking.room.room_name}
                </p>
                <p className="text-xs text-tripswift-black/50 mt-1">
                  {booking.room.room_type}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                <CreditCard className="h-5 w-5 text-tripswift-blue" />
              </div>
              <div>
                <p className="text-sm text-tripswift-black/60 font-tripswift-medium">Rate Plan</p>
                <p className="text-tripswift-black font-tripswift-medium">
                  {booking.ratePlanName || "Best Available Rate"}
                </p>
                <p className="text-xs text-tripswift-black/50 mt-1">
                  ${booking.amount.toFixed(2)} total
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Amendment type selector */}
      <div className="mb-6">
        <h4 className="font-tripswift-medium text-tripswift-black mb-3">What would you like to change?</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setAmendmentType("dates")}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all
              ${amendmentType === "dates" 
                ? "bg-tripswift-blue text-white border-tripswift-blue" 
                : "bg-white text-tripswift-black/70 border-gray-200 hover:border-tripswift-blue/50 hover:bg-tripswift-blue/5"}
            `}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="font-tripswift-medium">Dates</span>
          </button>
          
          <button
            onClick={() => setAmendmentType("guests")}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all
              ${amendmentType === "guests" 
                ? "bg-tripswift-blue text-white border-tripswift-blue" 
                : "bg-white text-tripswift-black/70 border-gray-200 hover:border-tripswift-blue/50 hover:bg-tripswift-blue/5"}
            `}
          >
            <Users className="h-4 w-4" />
            <span className="font-tripswift-medium">Guests</span>
          </button>
          
          <button
            onClick={() => setAmendmentType("room")}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all
              ${amendmentType === "room" 
                ? "bg-tripswift-blue text-white border-tripswift-blue" 
                : "bg-white text-tripswift-black/70 border-gray-200 hover:border-tripswift-blue/50 hover:bg-tripswift-blue/5"}
            `}
          >
            <BedDouble className="h-4 w-4" />
            <span className="font-tripswift-medium">Room Type</span>
          </button>
          
          <button
            onClick={() => setAmendmentType("requests")}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all
              ${amendmentType === "requests" 
                ? "bg-tripswift-blue text-white border-tripswift-blue" 
                : "bg-white text-tripswift-black/70 border-gray-200 hover:border-tripswift-blue/50 hover:bg-tripswift-blue/5"}
            `}
          >
            <ClipboardEdit className="h-4 w-4" />
            <span className="font-tripswift-medium">Special Requests</span>
          </button>
        </div>
      </div>
      
      {/* Amendment form fields */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6 transition duration-300">
        {/* Dates Amendment Form */}
        {amendmentType === "dates" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-tripswift-blue" />
              <h4 className="text-lg font-tripswift-bold text-tripswift-black">Change Dates</h4>
            </div>
            
            <div>
              <label className="block text-sm font-tripswift-medium text-tripswift-black/70 mb-2">
                Select New Stay Dates
              </label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
                className="w-full rounded-lg border-gray-200 py-2 hover:border-tripswift-blue focus:border-tripswift-blue focus:ring focus:ring-tripswift-blue/20"
                style={{ height: '48px' }}
                placeholder={['Check-in Date', 'Check-out Date']}
              />
            </div>
            
            {dateRange && dateRange[0] && dateRange[1] && (
              <div className="px-4 py-3 bg-tripswift-blue/5 rounded-lg text-sm text-tripswift-blue/90 font-tripswift-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Stay duration: {dateRange[1].diff(dateRange[0], 'day')} nights
                {dateRange[1].diff(dayjs(booking.checkOutDate), 'day') > 0 && (
                  <span className="ml-2 text-tripswift-blue/70">
                    (+{dateRange[1].diff(dayjs(booking.checkOutDate), 'day')} {dateRange[1].diff(dayjs(booking.checkOutDate), 'day') === 1 ? 'night' : 'nights'})
                  </span>
                )}
                {dateRange[1].diff(dayjs(booking.checkOutDate), 'day') < 0 && (
                  <span className="ml-2 text-tripswift-blue/70">
                    (-{Math.abs(dateRange[1].diff(dayjs(booking.checkOutDate), 'day'))} {Math.abs(dateRange[1].diff(dayjs(booking.checkOutDate), 'day')) === 1 ? 'night' : 'nights'})
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Guests Amendment Form */}
        {amendmentType === "guests" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-tripswift-blue" />
              <h4 className="text-lg font-tripswift-bold text-tripswift-black">Change Guests</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-tripswift-medium text-tripswift-black/70 mb-2">
                  Number of Adults
                </label>
                <Select
                  value={adultCount}
                  onChange={value => setAdultCount(value)}
                  className="w-full rounded-lg"
                  size="large"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <Option key={`adult-${num}`} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-tripswift-medium text-tripswift-black/70 mb-2">
                  Number of Children
                </label>
                <Select
                  value={childCount}
                  onChange={value => setChildCount(value)}
                  className="w-full rounded-lg"
                  size="large"
                >
                  {[0, 1, 2, 3, 4].map(num => (
                    <Option key={`child-${num}`} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</Option>
                  ))}
                </Select>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-tripswift-blue/5 rounded-lg text-sm text-tripswift-blue/90 font-tripswift-medium flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Additional fees may apply for extra guests. Maximum occupancy varies by room type.
            </div>
          </div>
        )}
        
        {/* Room Type Amendment Form */}
        {amendmentType === "room" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <BedDouble className="h-5 w-5 text-tripswift-blue" />
              <h4 className="text-lg font-tripswift-bold text-tripswift-black">Change Room Type</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-tripswift-medium text-tripswift-black/70 mb-2">
                  Room Type
                </label>
                <Select
                  value={roomTypeCode}
                  onChange={value => {
                    setRoomTypeCode(value);
                    const selectedRoom = availableRoomTypes.find(r => r.code === value);
                    if (selectedRoom) setRoomType(selectedRoom.name);
                  }}
                  className="w-full rounded-lg"
                  size="large"
                >
                  {availableRoomTypes.map(type => (
                    <Option key={type.code} value={type.code}>{type.name}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-tripswift-medium text-tripswift-black/70 mb-2">
                  Rate Plan
                </label>
                <Select
                  value={ratePlanCode}
                  onChange={value => {
                    setRatePlanCode(value);
                    const selectedPlan = availableRatePlans.find(p => p.code === value);
                    if (selectedPlan) setRatePlanName(selectedPlan.name);
                  }}
                  className="w-full rounded-lg"
                  size="large"
                >
                  {availableRatePlans.map(plan => (
                    <Option key={plan.code} value={plan.code}>{plan.name}</Option>
                  ))}
                </Select>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-tripswift-blue/5 rounded-lg text-sm text-tripswift-blue/90 font-tripswift-medium flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Room type changes are subject to availability and may affect the total price.
            </div>
          </div>
        )}
        
        {/* Special Requests Amendment Form */}
        {amendmentType === "requests" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardEdit className="h-5 w-5 text-tripswift-blue" />
              <h4 className="text-lg font-tripswift-bold text-tripswift-black">Update Special Requests</h4>
            </div>
            
            <div>
              <label className="block text-sm font-tripswift-medium text-tripswift-black/70 mb-2">
                Special Requests or Preferences
              </label>
              <TextArea
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                rows={4}
                placeholder="Enter any special requests or preferences such as high floor, early check-in, etc."
                className="w-full rounded-lg border-gray-200 hover:border-tripswift-blue focus:border-tripswift-blue focus:ring focus:ring-tripswift-blue/20"
              />
            </div>
            
            <div className="px-4 py-3 bg-tripswift-blue/5 rounded-lg text-sm text-tripswift-blue/90 font-tripswift-medium flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Special requests are subject to availability and cannot be guaranteed.
            </div>
          </div>
        )}
      </div>
      
      {/* Price difference */}
      {priceDifference.type !== "none" && (
        <div className={`rounded-xl shadow-sm overflow-hidden mb-6`}>
          <div className={`py-3 px-4 ${
            priceDifference.type === "increase" 
              ? "bg-amber-500 text-white" 
              : "bg-green-500 text-white"
          }`}>
            <h4 className="font-tripswift-bold text-base">Price Adjustment</h4>
          </div>
          
          <div className={`p-5 border border-t-0 ${
            priceDifference.type === "increase"
              ? "border-amber-200 bg-amber-50" 
              : "border-green-200 bg-green-50"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                priceDifference.type === "increase"
                  ? "bg-amber-100 text-amber-700" 
                  : "bg-green-100 text-green-700"
              }`}>
                <BadgeDollarSign className="h-6 w-6" />
              </div>
              
              <div>
                {priceDifference.type === "increase" ? (
                  <>
                    <p className="text-tripswift-black font-tripswift-medium text-base mb-1">
                      Additional payment required
                    </p>
                    <p className="text-tripswift-black/70">
                      Your changes will result in an additional charge of <span className="font-tripswift-bold text-amber-700">${priceDifference.amount.toFixed(2)}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-tripswift-black font-tripswift-medium text-base mb-1">
                      Refund to be processed
                    </p>
                    <p className="text-tripswift-black/70">
                      Your changes will result in a refund of <span className="font-tripswift-bold text-green-700">${priceDifference.amount.toFixed(2)}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Amendment policies */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="py-3 px-4 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center gap-2"> 
            <ShieldAlert className="h-4 w-4 text-tripswift-black/60" />
            <h4 className="font-tripswift-bold text-tripswift-black/80">Amendment Policies</h4>
          </div>
        </div>
        
        <div className="p-5">
          <ul className="space-y-2.5 text-sm text-tripswift-black/70">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-tripswift-blue/70 flex-shrink-0 mt-1"></div>
              <span>Date changes are subject to availability</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-tripswift-blue/70 flex-shrink-0 mt-1"></div>
              <span>Changes within 72 hours of check-in may incur additional fees</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-tripswift-blue/70 flex-shrink-0 mt-1"></div>
              <span>Room upgrades are subject to availability and additional charges</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-tripswift-blue/70 flex-shrink-0 mt-1"></div>
              <span>Reducing the length of stay may be subject to the original booking's cancellation policy</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Message display area */}
      {amendmentMessage && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-4 ${
          amendmentMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : amendmentMessage.type === 'warning' 
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            amendmentMessage.type === 'success' 
              ? 'bg-green-100' 
              : amendmentMessage.type === 'warning' 
                ? 'bg-amber-100'
                : 'bg-red-100'
          }`}>
            {amendmentMessage.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </div>
          <p className="font-tripswift-medium">{amendmentMessage.text}</p>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button 
          onClick={onClose}
          disabled={loading}
          className="px-6 py-3 border border-gray-200 rounded-xl text-tripswift-black/80 hover:bg-gray-50 font-tripswift-medium transition-colors"
        >
          Cancel
        </button>
        
        <button 
          onClick={handleSubmitAmendment}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-tripswift-blue to-[#054B8F] hover:from-[#054B8F] hover:to-tripswift-blue text-white rounded-xl font-tripswift-medium shadow-sm hover:shadow-md transition-all relative overflow-hidden flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Confirm Amendment</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default AmendReservationModal;