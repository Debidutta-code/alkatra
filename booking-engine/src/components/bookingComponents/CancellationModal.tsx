'use client';

import React, { useState, useEffect } from "react";
import { format, parseISO, differenceInDays, differenceInHours } from "date-fns";
import {
  AlertTriangle,
  Info,
  Calendar,
  Home,
  BedDouble,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertCircle,
  Clock,
  Shield,
  Loader2,
  X,
  FileQuestion
} from "lucide-react";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  // Lock body scroll when modal opens, restore when closes
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const formatDateString = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return t('BookingTabs.CancellationModal.invalidDate');
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
        text: t('BookingTabs.CancellationModal.errorRetrievingPolicy')
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
          ? t('BookingTabs.CancellationModal.successWithRefund', { amount: refundInfo.amount.toFixed(2) })
          : t('BookingTabs.CancellationModal.successNoRefund')
      });

      // Notify parent component of cancellation (UI only for now)
      setTimeout(() => {
        onCancellationComplete(booking._id);
      }, 2000);

    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      setCancellationMessage({
        type: 'error',
        text: t('BookingTabs.CancellationModal.errorCancelling')
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-noto-sans">
      <div className="bg-tripswift-off-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-2xl font-tripswift-bold text-tripswift-black">
            {t('BookingTabs.CancellationModal.confirmCancellation')}
          </h3>
          <p className="text-tripswift-black/60 mt-2 max-w-lg mx-auto">
            {t('BookingTabs.CancellationModal.reviewBeforeProceeding')}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-tripswift-off-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-6">
          <div className="bg-tripswift-blue/10 p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-tripswift-blue mr-2" />
              <h4 className="font-tripswift-bold text-tripswift-black/80">
                {t('BookingTabs.CancellationModal.bookingDetails')}
              </h4>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <Home className="h-4 w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-tripswift-black/60 font-tripswift-medium">
                      {t('BookingTabs.CancellationModal.property')}
                    </p>
                    <p className="text-tripswift-black font-tripswift-medium">
                      {booking.property.property_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <BedDouble className="h-4 w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-tripswift-black/60 font-tripswift-medium">
                      {t('BookingTabs.CancellationModal.room')}
                    </p>
                    <p className="text-tripswift-black font-tripswift-medium">
                      {booking.room.room_name}
                    </p>
                    <p className="text-xs text-tripswift-black/50 mt-0.5">
                      {booking.room.room_type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <Calendar className="h-4 w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-tripswift-black/60 font-tripswift-medium">
                      {t('BookingTabs.CancellationModal.stayDates')}
                    </p>
                    <p className="text-tripswift-black font-tripswift-medium">
                      {formatDateString(booking.checkInDate)} - {formatDateString(booking.checkOutDate)}
                    </p>
                    <p className="text-xs text-tripswift-black/50 mt-0.5">
                      {t('BookingTabs.CancellationModal.nightStay', {
                        count: differenceInDays(parseISO(booking.checkOutDate), parseISO(booking.checkInDate))
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <CreditCard className="h-4 w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-tripswift-black/60 font-tripswift-medium">
                      {t('BookingTabs.CancellationModal.totalAmount')}
                    </p>
                    <p className="text-tripswift-black font-tripswift-medium">
                      ₹{booking.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Policy Card */}
        {policyLoading ? (
          <div className="bg-tripswift-off-white border border-gray-200 shadow-sm rounded-xl p-6 mb-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-tripswift-blue animate-spin" />
            <span className="ml-3 text-tripswift-black/70 font-tripswift-medium">
              {t('BookingTabs.CancellationModal.calculatingDetails')}
            </span>
          </div>
        ) : (
          <div className="bg-tripswift-off-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-6">
            <div className={`${policyStyling.headerBgColor} p-4 flex items-center justify-between`}>
              <div className="flex items-center">
                <Shield className={`h-5 w-5 ${policyStyling.textColor} mr-2`} />
                <h4 className={`font-tripswift-bold ${policyStyling.textColor}`}>
                  {t(`BookingTabs.CancellationModal.policyTypes.${policyType.toLowerCase()}`)}
                </h4>
              </div>
              <span className={`inline-block px-3 py-1 text-xs rounded-full ${policyStyling.bgColor} ${policyStyling.textColor} font-tripswift-medium`}>
                {t('BookingTabs.CancellationModal.refundEligible', { percentage: refundPercentage })}
              </span>
            </div>

            <div className="p-5">
              {/* Policy details in bullet points */}
              <div className="mb-5">
                <h5 className="text-sm font-tripswift-bold text-tripswift-black/80 mb-3">
                  {t('BookingTabs.CancellationModal.policyTerms')}
                </h5>
                <ul className="space-y-2.5">
                  {policyBulletPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 bg-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-tripswift-blue"></div>
                      </div>
                      <span className="text-sm text-tripswift-black/70">
                        <span className={`font-tripswift-bold ${point.color}`}>{point.text.split(':')[0]}:</span>
                        {point.text.split(':')[1]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Your booking's refund calculation */}
              <div className="bg-tripswift-blue/5 rounded-xl p-4 mb-5">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <Clock className="h-4 w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <h5 className="text-sm font-tripswift-bold text-tripswift-black mb-1">
                      {t('BookingTabs.CancellationModal.yourRefundStatus')}
                    </h5>
                    <p className="text-sm text-tripswift-black/70">
                      {t('BookingTabs.CancellationModal.refundExplanation', {
                        policyType: policyType.toLowerCase(),
                        percentage: refundPercentage
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial breakdown */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="text-sm font-tripswift-bold text-tripswift-black/80 mb-3">
                  {t('BookingTabs.CancellationModal.financialBreakdown')}
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-tripswift-black/70">
                      {t('BookingTabs.CancellationModal.originalPayment')}
                    </span>
                    <span className="font-tripswift-bold text-tripswift-black">₹{booking.amount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-tripswift-black/70">
                      {t('BookingTabs.CancellationModal.cancellationFee')}
                    </span>
                    <span className={`font-tripswift-bold ${cancellationFee && cancellationFee > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{cancellationFee !== null ? cancellationFee.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-tripswift-bold text-tripswift-black">
                        {t('BookingTabs.CancellationModal.refundAmount')}
                      </span>
                      <span className="font-tripswift-bold text-green-600 text-lg">
                        ₹{refundInfo ? refundInfo.amount.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation reason input */}
        <div className="bg-tripswift-off-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-6">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex items-center">
              <FileQuestion className="h-5 w-5 text-tripswift-black/60 mr-2" />
              <h4 className="font-tripswift-bold text-tripswift-black/80">
                {t('BookingTabs.CancellationModal.reasonForCancellation')}
              </h4>
            </div>
          </div>

          <div className="p-5">
            <textarea
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue transition-colors duration-300 bg-tripswift-off-white"
              placeholder={t('BookingTabs.CancellationModal.reasonPlaceholder')}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            ></textarea>
            <p className="text-xs text-tripswift-black/50 mt-2">
              {t('BookingTabs.CancellationModal.feedbackHelpsImprove')}
            </p>
          </div>
        </div>

        {/* Success/Error message */}
        {cancellationMessage && (
          <div className={`rounded-xl shadow-sm overflow-hidden mb-6 ${cancellationMessage.type === 'success' ? 'border border-green-200' : 'border border-red-200'
            }`}>
            <div className={`p-3 ${cancellationMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
              <div className="flex items-center">
                {cancellationMessage.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-white mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-white mr-2" />
                )}
                <h4 className="font-tripswift-bold text-white">
                  {cancellationMessage.type === 'success' 
                    ? t('BookingTabs.CancellationModal.success') 
                    : t('BookingTabs.CancellationModal.error')}
                </h4>
              </div>
            </div>

            <div className={`p-4 ${cancellationMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}>
              <p className={`${cancellationMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                } font-tripswift-medium`}>
                {cancellationMessage.text}
              </p>
            </div>
          </div>
        )}

        {/* Final Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3 flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-amber-800 font-tripswift-medium mb-1">
              {t('BookingTabs.CancellationModal.actionCannotBeUndone')}
            </p>
            <p className="text-sm text-amber-700">
              {t('BookingTabs.CancellationModal.cancellationWarning')}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            className="px-6 py-3 border border-gray-200 rounded-xl text-tripswift-black/80 hover:bg-gray-50 font-tripswift-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={cancellationLoading}
          >
            <span className="flex items-center justify-center gap-2">
              <X className="h-4 w-4" />
              <span>{t('BookingTabs.CancellationModal.keepMyReservation')}</span>
            </span>
          </button>

          <button
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-tripswift-off-white rounded-xl font-tripswift-medium shadow-sm hover:shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
            onClick={confirmCancelBooking}
            disabled={cancellationLoading || policyLoading}
          >
            {cancellationLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('BookingTabs.CancellationModal.processing')}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{t('BookingTabs.CancellationModal.confirmCancellationButton')}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;