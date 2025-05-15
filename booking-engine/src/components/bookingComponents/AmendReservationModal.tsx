// components/bookingComponents/AmendReservationModal.tsx

import React, { useState, useEffect } from "react";
import { DatePicker, Select, Input, Button, Alert, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { FaCalendarAlt, FaUser, FaBed, FaStickyNote, FaArrowRight } from "react-icons/fa";

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
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Amend Reservation</h3>
      
      {/* Original booking details for reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-800 mb-2">Current Booking Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Check-in:</span> {dayjs(booking.checkInDate).format('DD/MM/YYYY')}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Check-out:</span> {dayjs(booking.checkOutDate).format('DD/MM/YYYY')}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Guests:</span> {booking.adultCount || 2} Adults, {booking.childCount || 0} Children
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Property:</span> {booking.property.property_name}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Room:</span> {booking.room.room_name}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Room Type:</span> {booking.room.room_type}
            </p>
          </div>
        </div>
      </div>
      
      {/* Amendment type selector */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">What would you like to change?</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            type={amendmentType === "dates" ? "primary" : "default"}
            onClick={() => setAmendmentType("dates")}
            icon={<FaCalendarAlt />}
          >
            Dates
          </Button>
          <Button
            type={amendmentType === "guests" ? "primary" : "default"}
            onClick={() => setAmendmentType("guests")}
            icon={<FaUser />}
          >
            Guests
          </Button>
          <Button
            type={amendmentType === "room" ? "primary" : "default"}
            onClick={() => setAmendmentType("room")}
            icon={<FaBed />}
          >
            Room Type
          </Button>
          <Button
            type={amendmentType === "requests" ? "primary" : "default"}
            onClick={() => setAmendmentType("requests")}
            icon={<FaStickyNote />}
          >
            Special Requests
          </Button>
        </div>
      </div>
      
      {/* Amendment form fields */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        {/* Dates Amendment Form */}
        {amendmentType === "dates" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 mb-3">Change Dates</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Stay Dates
              </label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                placeholder={['Check-in Date', 'Check-out Date']}
              />
            </div>
            
            {dateRange && dateRange[0] && dateRange[1] && (
              <div className="text-sm text-gray-600">
                Stay duration: {dateRange[1].diff(dateRange[0], 'day')} nights
              </div>
            )}
          </div>
        )}
        
        {/* Guests Amendment Form */}
        {amendmentType === "guests" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 mb-3">Change Guests</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Adults
                </label>
                <Select
                  value={adultCount}
                  onChange={value => setAdultCount(value)}
                  style={{ width: '100%' }}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <Option key={`adult-${num}`} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Children
                </label>
                <Select
                  value={childCount}
                  onChange={value => setChildCount(value)}
                  style={{ width: '100%' }}
                >
                  {[0, 1, 2, 3, 4].map(num => (
                    <Option key={`child-${num}`} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</Option>
                  ))}
                </Select>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Additional fees may apply for extra guests. Maximum occupancy varies by room type.
            </p>
          </div>
        )}
        
        {/* Room Type Amendment Form */}
        {amendmentType === "room" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 mb-3">Change Room Type</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <Select
                  value={roomTypeCode}
                  onChange={value => {
                    setRoomTypeCode(value);
                    const selectedRoom = availableRoomTypes.find(r => r.code === value);
                    if (selectedRoom) setRoomType(selectedRoom.name);
                  }}
                  style={{ width: '100%' }}
                >
                  {availableRoomTypes.map(type => (
                    <Option key={type.code} value={type.code}>{type.name}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Plan
                </label>
                <Select
                  value={ratePlanCode}
                  onChange={value => {
                    setRatePlanCode(value);
                    const selectedPlan = availableRatePlans.find(p => p.code === value);
                    if (selectedPlan) setRatePlanName(selectedPlan.name);
                  }}
                  style={{ width: '100%' }}
                >
                  {availableRatePlans.map(plan => (
                    <Option key={plan.code} value={plan.code}>{plan.name}</Option>
                  ))}
                </Select>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Room type changes are subject to availability and may affect the total price.
            </p>
          </div>
        )}
        
        {/* Special Requests Amendment Form */}
        {amendmentType === "requests" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 mb-3">Update Special Requests</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <TextArea
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                rows={4}
                placeholder="Enter any special requests or preferences..."
              />
            </div>
            <p className="text-sm text-gray-500">
              Special requests are subject to availability and cannot be guaranteed.
            </p>
          </div>
        )}
      </div>
      
      {/* Price difference */}
      {priceDifference.type !== "none" && (
        <div className={`p-4 rounded-lg border ${
          priceDifference.type === "increase" 
            ? "bg-yellow-50 border-yellow-200" 
            : "bg-green-50 border-green-200"
        } mb-6`}>
          <h4 className="font-medium text-gray-800 mb-2">Price Difference</h4>
          <div className="flex items-center">
            <div className="mr-3">
              {priceDifference.type === "increase" ? (
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FaArrowRight className="text-yellow-600" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FaArrowRight className="text-green-600" />
                </div>
              )}
            </div>
            <div>
              {priceDifference.type === "increase" && (
                <p className="text-gray-700">
                  Your changes will result in an additional charge of <span className="font-medium text-yellow-800">${priceDifference.amount.toFixed(2)}</span>
                </p>
              )}
              {priceDifference.type === "decrease" && (
                <p className="text-gray-700">
                  Your changes will result in a refund of <span className="font-medium text-green-800">${priceDifference.amount.toFixed(2)}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Amendment policies */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h4 className="font-medium text-gray-800 mb-2">Amendment Policies</h4>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Date changes are subject to availability</li>
          <li>Changes within 72 hours of check-in may incur additional fees</li>
          <li>Room upgrades are subject to availability and additional charges</li>
          <li>Reducing the length of stay may be subject to the original booking's cancellation policy</li>
        </ul>
      </div>
      
      {/* Message display area */}
      {amendmentMessage && (
        <Alert
          message={amendmentMessage.text}
          type={amendmentMessage.type === 'success' ? 'success' : amendmentMessage.type === 'warning' ? 'warning' : 'error'}
          showIcon
          className="mb-4"
        />
      )}
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          type="primary"
          onClick={handleSubmitAmendment}
          loading={loading}
          size="large"
          block={window.innerWidth < 640}
        >
          Amend Reservation
        </Button>
        <Button 
          onClick={onClose}
          disabled={loading}
          size="large"
          block={window.innerWidth < 640}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AmendReservationModal;