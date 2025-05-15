import React, { useState, useEffect } from "react";
import { format, parseISO, differenceInDays, differenceInHours } from "date-fns";
import { FaInfoCircle } from "react-icons/fa";
import { 
  PolicyType, 
  getPolicyType, 
  getPolicyStyling, 
  getPolicyBulletPoints,
  calculateRefund
} from "@/utils/cancellationPolicies";

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
  };
  booking_user_name: string;
  booking_user_phone: string;
  amount: number;
  booking_dates: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  cancellationPolicyType?: string;
}

interface CancellationModalProps {
  booking: Booking;
  onClose: () => void;
  onCancellationComplete: (bookingId: string) => void;
}

const CancellationModal: React.FC<CancellationModalProps> = ({
  booking,
  onClose,
  onCancellationComplete
}) => {
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationFee, setCancellationFee] = useState<number | null>(null);
  const [refundInfo, setRefundInfo] = useState<{ eligible: boolean, amount: number } | null>(null);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [policyType, setPolicyType] = useState<PolicyType>("Moderate");
  const [refundPercentage, setRefundPercentage] = useState(0);

  useEffect(() => {
    checkCancellationPolicy();
  }, []);

  const formatDateString = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const checkCancellationPolicy = async () => {
    try {
      setPolicyLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Determine policy type using the utility function
      let selectedPolicyType: PolicyType;
      
      if (booking.cancellationPolicyType) {
        // Use the utility function to get a valid policy type with fallback
        selectedPolicyType = getPolicyType(booking.cancellationPolicyType);
      } else {
        // Randomly assign for demo based on booking ID
        const bookingIdLastChar = booking._id.slice(-1);
        if (parseInt(bookingIdLastChar, 16) % 4 === 0) {
          selectedPolicyType = "Flexible";
        } else if (parseInt(bookingIdLastChar, 16) % 4 === 1) {
          selectedPolicyType = "Moderate";
        } else if (parseInt(bookingIdLastChar, 16) % 4 === 2) {
          selectedPolicyType = "Strict";
        } else {
          selectedPolicyType = "NonRefundable";
        }
      }

      setPolicyType(selectedPolicyType);

      // Calculate days/hours until check-in
      const checkInDate = parseISO(booking.checkInDate);
      const now = new Date();
      const daysUntilCheckIn = differenceInDays(checkInDate, now);
      const hoursUntilCheckIn = differenceInHours(checkInDate, now);

      // Use the utility function to calculate refund
      const { refundPercentage, refundAmount, cancellationFee } = calculateRefund(
        selectedPolicyType,
        booking.amount,
        daysUntilCheckIn,
        hoursUntilCheckIn
      );

      setRefundPercentage(refundPercentage);
      setCancellationFee(cancellationFee);
      setRefundInfo({
        eligible: refundAmount > 0,
        amount: refundAmount
      });

    } catch (error) {
      console.error("Error checking cancellation policy:", error);
      setCancellationMessage({
        type: 'error',
        text: 'Unable to retrieve cancellation policy information. You may continue, but fee information might not be accurate.'
      });
    } finally {
      setPolicyLoading(false);
    }
  };

  const confirmCancelBooking = async () => {
    setCancellationLoading(true);
    setCancellationMessage(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful cancellation
      setCancellationMessage({
        type: 'success',
        text: refundInfo && refundInfo.amount > 0
          ? `Your booking has been successfully cancelled. A refund of $${refundInfo.amount.toFixed(2)} will be processed.`
          : 'Your booking has been successfully cancelled. No refund will be issued based on the cancellation policy.'
      });

      // Notify parent component of cancellation (UI only for now)
      setTimeout(() => {
        onCancellationComplete(booking._id);
      }, 2000);

    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      setCancellationMessage({
        type: 'error',
        text: 'Unable to cancel booking. Please try again or contact support.'
      });
    } finally {
      setCancellationLoading(false);
    }
  };

  // Get styling for the policy type
  const policyStyling = getPolicyStyling(policyType);
  
  // Get bullet points for the policy
  const policyBulletPoints = getPolicyBulletPoints(policyType);

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Cancellation</h3>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          Are you sure you want to cancel your reservation at <span className="font-semibold">{booking.property.property_name}</span>?
        </p>
        <div className="mt-3 text-sm text-gray-700">
          <p className="mb-1">• Check-in: {formatDateString(booking.checkInDate)}</p>
          <p className="mb-1">• Check-out: {formatDateString(booking.checkOutDate)}</p>
          <p className="mb-1">• Room: {booking.room.room_name}</p>
          <p className="mb-1">• Total Amount: ${booking.amount.toFixed(2)}</p>
        </div>

        {/* Cancellation policy information section */}
        {!policyLoading && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <h4 className="font-semibold text-gray-800">
                <span className={`inline-block px-2 py-1 text-xs rounded mr-2 ${policyStyling.bgColor} ${policyStyling.textColor}`}>
                  {policyType}
                </span>
                Cancellation Policy
              </h4>
            </div>

            {/* Policy details in bullet points */}
            <div className="mb-4">
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {policyBulletPoints.map((point, index) => (
                  <li key={index}>
                    <span className={`font-medium ${point.color}`}>{point.text.split(':')[0]}:</span>
                    {point.text.split(':')[1]}
                  </li>
                ))}
              </ul>
            </div>

            {/* Your booking's refund calculation */}
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <div className="flex items-start mb-2">
                <FaInfoCircle className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium block mb-1">Your Refund Calculation</span>
                  <p className="text-sm text-gray-700">
                    Based on your check-in date and the {policyType.toLowerCase()} policy,
                    you will receive a <span className="font-medium">{refundPercentage}% refund</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="border-t border-gray-200 pt-3 mt-2">
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Amount:</span>
                  <span className="font-medium">${booking.amount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Cancellation Fee:</span>
                  <span className={`font-medium ${cancellationFee && cancellationFee > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${cancellationFee !== null ? cancellationFee.toFixed(2) : '0.00'}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2 mt-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Refund Amount:</span>
                    <span className="font-medium text-green-600">
                      ${refundInfo ? refundInfo.amount.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation reason input */}
      <div className="mb-6">
        <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-2">
          Reason for cancellation (optional)
        </label>
        <textarea
          id="cancellationReason"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Please tell us why you're cancelling..."
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
        ></textarea>
      </div>

      {/* Success/Error message */}
      {cancellationMessage && (
        <div className={`p-3 rounded-md mb-4 ${cancellationMessage.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {cancellationMessage.text}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
          onClick={confirmCancelBooking}
          disabled={cancellationLoading}
        >
          {cancellationLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : "Confirm Cancellation"}
        </button>
        <button
          className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          onClick={onClose}
          disabled={cancellationLoading}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default CancellationModal;