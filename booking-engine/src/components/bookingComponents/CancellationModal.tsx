'use client';

import React, { useState, useEffect } from "react";
import { format, parseISO, differenceInDays, differenceInHours } from "date-fns";
import { Booking } from '../bookingComponents/BookingTabs/types';
import Cookies from "js-cookie";
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

interface GuestDetails {
  firstName: string;
  lastName: string;
  dob?: string;
  _id?: string;
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

      await new Promise(resolve => setTimeout(resolve, 800));

      let selectedPolicyType: PolicyType;
      // For demo: fallback to "Moderate"
      selectedPolicyType = "Moderate";

      setPolicyType(selectedPolicyType);

      const checkInDate = parseISO(booking.checkInDate);
      const now = new Date();
      const daysUntilCheckIn = differenceInDays(checkInDate, now);
      const hoursUntilCheckIn = differenceInHours(checkInDate, now);

      const { refundPercentage, refundAmount, cancellationFee, message } = calculateRefund(
        selectedPolicyType,
        booking.totalAmount,
        daysUntilCheckIn,
        hoursUntilCheckIn,
        t
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
      // Use the first guest in guestDetails for cancellation
      const firstGuest = booking.guestDetails && booking.guestDetails.length > 0
        ? booking.guestDetails[0]
        : { firstName: "", lastName: "" };

      // Prepare the payload as per your backend spec
      const payload = {
        firstName: firstGuest.firstName,
        lastName: firstGuest.lastName,
        email: booking.email || "",
        hotelCode: booking.hotelCode,
        hotelName: booking.hotelName,
        checkInDate: booking.checkInDate.slice(0, 10),
        checkOutDate: booking.checkOutDate.slice(0, 10),
      };
      const token = Cookies.get("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/cancel-reservation/${booking.reservationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancellation failed");

      setCancellationMessage({
        type: "success",
        text: data.message || "Reservation cancellation processed successfully",
      });

      setTimeout(() => {
        onCancellationComplete(booking._id);
      }, 2000);
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      setCancellationMessage({
        type: "error",
        text: "Unable to cancel reservation. Please try again.",
      });
    } finally {
      setCancellationLoading(false);
    }
  };

  const policyStyling = getPolicyStyling(policyType);
  const policyBulletPoints = getPolicyBulletPoints(policyType, t);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-noto-sans p-3 sm:p-5">
      <div className="bg-tripswift-off-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-100 mb-3 sm:mb-4">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-tripswift-bold text-tripswift-black">
            {t('BookingTabs.CancellationModal.confirmCancellation')}
          </h3>
          <p className="text-sm sm:text-base text-tripswift-black/60 mt-1 sm:mt-2 max-w-lg mx-auto">
            {t('BookingTabs.CancellationModal.reviewBeforeProceeding')}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-tripswift-off-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-4 sm:mb-6">
          <div className="bg-tripswift-blue/10 p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-blue mr-1.5 sm:mr-2" />
              <h4 className="text-sm sm:text-base font-tripswift-bold text-tripswift-black/80">
                {t('BookingTabs.CancellationModal.bookingDetails')}
              </h4>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                      {t('BookingTabs.CancellationModal.property')}
                    </p>
                    <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                      {booking.hotelName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    <BedDouble className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                      {t('BookingTabs.CancellationModal.room')}
                    </p>
                    <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                      {booking.roomTypeCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                      {t('BookingTabs.CancellationModal.stayDates')}
                    </p>
                    <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                      {formatDateString(booking.checkInDate)} - {formatDateString(booking.checkOutDate)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-tripswift-black/50 mt-0.5">
                      {t('BookingTabs.CancellationModal.nightStay', {
                        count: differenceInDays(parseISO(booking.checkOutDate), parseISO(booking.checkInDate))
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-tripswift-black/60 font-tripswift-medium">
                      {t('BookingTabs.CancellationModal.totalAmount')}
                    </p>
                    <p className="text-sm sm:text-base text-tripswift-black font-tripswift-medium">
                      ₹{booking.totalAmount != null ? Number(booking.totalAmount).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Policy Card */}
        {policyLoading ? (
          <div className="bg-tripswift-off-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-tripswift-blue animate-spin" />
            <span className="ml-2 sm:ml-3 text-sm sm:text-base text-tripswift-black/70 font-tripswift-medium">
              {t('BookingTabs.CancellationModal.calculatingDetails')}
            </span>
          </div>
        ) : (
          <div className="bg-tripswift-off-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-4 sm:mb-6">
            <div className={`${policyStyling.headerBgColor} p-3 sm:p-4 flex items-center justify-between`}>
              <div className="flex items-center">
                <Shield className={`h-4 w-4 sm:h-5 sm:w-5 ${policyStyling.textColor} mr-1.5 sm:mr-2`} />
                <h4 className={`text-sm sm:text-base font-tripswift-bold ${policyStyling.textColor}`}>
                  {t(`BookingTabs.CancellationModal.policyTypes.${policyType.toLowerCase()}`)}
                </h4>
              </div>
              <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full ${policyStyling.bgColor} ${policyStyling.textColor} font-tripswift-medium`}>
                {t('BookingTabs.CancellationModal.refundEligible', { percentage: refundPercentage })}
              </span>
            </div>

            <div className="p-3 sm:p-5">
              <div className="mb-3 sm:mb-5">
                <h5 className="text-xs sm:text-sm font-tripswift-bold text-tripswift-black/80 mb-2 sm:mb-3">
                  {t('BookingTabs.CancellationModal.policyTerms')}
                </h5>
                <ul className="space-y-2 sm:space-y-2.5">
                  {policyBulletPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0 bg-gray-100">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-tripswift-blue"></div>
                      </div>
                      <span className="text-xs sm:text-sm text-tripswift-black/70">
                        <span className={`font-tripswift-bold ${point.color}`}>{point.text.split(':')[0]}:</span>
                        {point.text.split(':')[1]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-tripswift-blue/5 rounded-xl p-3 sm:p-4 mb-3 sm:mb-5">
                <div className="flex items-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-tripswift-bold text-tripswift-black mb-0.5 sm:mb-1">
                      {t('BookingTabs.CancellationModal.yourRefundStatus')}
                    </h5>
                    <p className="text-xs sm:text-sm text-tripswift-black/70">
                      {t('BookingTabs.CancellationModal.refundExplanation', {
                        policyType: policyType.toLowerCase(),
                        percentage: refundPercentage
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <h5 className="text-xs sm:text-sm font-tripswift-bold text-tripswift-black/80 mb-2 sm:mb-3">
                  {t('BookingTabs.CancellationModal.financialBreakdown')}
                </h5>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-tripswift-black/70">
                      {t('BookingTabs.CancellationModal.originalPayment')}
                    </span>
                    <span className="text-sm sm:text-base font-tripswift-bold text-tripswift-black"> ₹{booking.totalAmount != null ? Number(booking.totalAmount).toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-tripswift-black/70">
                      {t('BookingTabs.CancellationModal.cancellationFee')}
                    </span>
                    <span className={`text-sm sm:text-base font-tripswift-bold ${cancellationFee && cancellationFee > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{booking.totalAmount != null ? Number(booking.totalAmount).toFixed(2) : '0.00'}
                    </span>
                  </div>

                  {/* <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-tripswift-bold text-tripswift-black">
                        {t('BookingTabs.CancellationModal.refundAmount')}
                      </span>
                      <span className="font-tripswift-bold text-green-600 text-base sm:text-lg">
                      ₹{booking.totalAmount != null ? Number(booking.totalAmount).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation reason input */}
        <div className="bg-tripswift-off-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-4 sm:mb-6">
          <div className="bg-gray-50 p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center">
              <FileQuestion className="h-4 w-4 sm:h-5 sm:w-5 text-tripswift-black/60 mr-1.5 sm:mr-2" />
              <h4 className="text-sm sm:text-base font-tripswift-bold text-tripswift-black/80">
                {t('BookingTabs.CancellationModal.reasonForCancellation')}
              </h4>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <textarea
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue transition-colors duration-300 bg-tripswift-off-white text-sm"
              placeholder={t('BookingTabs.CancellationModal.reasonPlaceholder')}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            ></textarea>
            <p className="text-[10px] sm:text-xs text-tripswift-black/50 mt-1 sm:mt-2">
              {t('BookingTabs.CancellationModal.feedbackHelpsImprove')}
            </p>
          </div>
        </div>

        {/* Success/Error message */}
        {cancellationMessage && (
          <div className={`rounded-xl shadow-sm overflow-hidden mb-4 sm:mb-6 ${cancellationMessage.type === 'success' ? 'border border-green-200' : 'border border-red-200'
            }`}>
            <div className={`p-2 sm:p-3 ${cancellationMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
              <div className="flex items-center">
                {cancellationMessage.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white mr-1.5 sm:mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white mr-1.5 sm:mr-2" />
                )}
                <h4 className="text-sm sm:text-base font-tripswift-bold text-white">
                  {cancellationMessage.type === 'success'
                    ? t('BookingTabs.CancellationModal.success')
                    : t('BookingTabs.CancellationModal.error')}
                </h4>
              </div>
            </div>

            <div className={`p-3 sm:p-4 ${cancellationMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}>
              <p className={`text-sm ${cancellationMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                } font-tripswift-medium`}>
                {cancellationMessage.text}
              </p>
            </div>
          </div>
        )}

        {/* Final Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-start">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <AlertCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-amber-800 font-tripswift-medium mb-0.5 sm:mb-1">
              {t('BookingTabs.CancellationModal.actionCannotBeUndone')}
            </p>
            <p className="text-xs sm:text-sm text-amber-700">
              {t('BookingTabs.CancellationModal.cancellationWarning')}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse md:flex-row justify-end gap-2 sm:gap-3">
          <button
            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-tripswift-black/80 hover:bg-gray-50 font-tripswift-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={cancellationLoading}
          >
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{t('BookingTabs.CancellationModal.keepMyReservation')}</span>
            </span>
          </button>

          <button
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-sm sm:text-base text-tripswift-off-white rounded-lg sm:rounded-xl font-tripswift-medium shadow-sm hover:shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
            onClick={confirmCancelBooking}
            disabled={cancellationLoading || policyLoading}
          >
            {cancellationLoading ? (
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span>{t('BookingTabs.CancellationModal.processing')}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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