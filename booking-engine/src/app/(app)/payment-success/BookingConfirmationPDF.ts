import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/dateUtils';
import { t } from 'i18next';

interface BookingData {
  amount: number;
  currency: string;
  guestDetails: any;
  checkInDate: string;
  checkOutDate: string;
  reduxEmail: string;
  reduxPhone: string;
  getGuestName: () => string;
  getBookingNights: () => number;
  getGuestCountDisplay: () => string;
  getBookingId: () => string;
}

export const generateBookingConfirmationPDF = (data: BookingData) => {
  const {
    amount,
    currency,
    guestDetails,
    checkInDate,
    checkOutDate,
    reduxEmail,
    reduxPhone,
    getGuestName,
    getBookingNights,
    getGuestCountDisplay,
    getBookingId,
  } = data;

  try {
    const doc = new jsPDF({ format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 15;
    const rightMargin = pageWidth - 15;
    const centerX = pageWidth / 2;
    let yPosition = 15;

    const smallSpacing = 3;

    // === HEADER ===
    doc.setFillColor(7, 109, 179);
    doc.rect(0, 0, pageWidth, 30, 'F'); // Reduced height from 35 to 30
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16); // Reduced from 18
    doc.text('AlHajz', centerX, 12, { align: 'center' });

    doc.setFontSize(10); // Reduced from 12
    doc.text('BOOKING CONFIRMATION', centerX, 20, { align: 'center' });
    doc.setFontSize(7); // Reduced from 8
    doc.text('Your reservation has been successfully confirmed', centerX, 26, { align: 'center' });

    yPosition = 35;

    // === CONFIRMED STATUS BAR ===
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(7, 109, 179);
    doc.setLineWidth(0.5);
    doc.rect(leftMargin, yPosition, rightMargin - leftMargin, 10, 'FD'); // Reduced height from 12 to 10

    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9); // Reduced from 10
    doc.text('CONFIRMED', leftMargin + 4, yPosition + 7);

    const bookingId = getBookingId();
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Booking ID: ${bookingId}`, rightMargin - 6, yPosition + 7, { align: 'right' });

    yPosition += 15;

    // === GUEST INFORMATION ===
    doc.setTextColor(7, 109, 179);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9); // Reduced from 10
    doc.text('GUEST INFORMATION', leftMargin, yPosition);

    doc.setDrawColor(7, 109, 179);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, yPosition + 1, leftMargin + 40, yPosition + 1);

    yPosition += 8; // Reduced from 10
    doc.setFontSize(7); // Reduced from 8

    const guestInfo = [
      ['Guest Name:', getGuestName()],
      ['Email:', reduxEmail || 'N/A'],
      ['Phone:', reduxPhone ? `+${reduxPhone}` : 'N/A'],
    ];

    guestInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(label, leftMargin + 3, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      // Truncate long values to prevent overflow
      const truncatedValue = value.length > 35 ? value.substring(0, 32) + '...' : value;
      doc.text(truncatedValue, leftMargin + 28, yPosition);
      yPosition += 6; // Reduced from 8
    });

    yPosition += smallSpacing;

    // === ACCOMMODATION DETAILS ===
    doc.setTextColor(7, 109, 179);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('ACCOMMODATION DETAILS', leftMargin, yPosition);

    doc.setDrawColor(7, 109, 179);
    doc.line(leftMargin, yPosition + 1, leftMargin + 45, yPosition + 1);

    yPosition += 6; // Reduced spacing

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8); // Reduced from 10
    doc.setTextColor(0, 0, 0);
    const hotelName = guestDetails?.hotelName || 'Hotel Name Not Available';
    // Limit hotel name to prevent overflow
    const truncatedHotelName = hotelName.length > 50 ? hotelName.substring(0, 47) + '...' : hotelName;
    doc.text(truncatedHotelName, leftMargin + 3, yPosition);
    yPosition += 8;

    // === RESERVATION DETAILS ===
    doc.setTextColor(7, 109, 179);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('RESERVATION DETAILS', leftMargin, yPosition);

    doc.setDrawColor(7, 109, 179);
    doc.line(leftMargin, yPosition + 1, leftMargin + 40, yPosition + 1);

    yPosition += 8;

    const bookingDetails = [
      ['Check-in:', formatDate(checkInDate || guestDetails?.checkInDate)],
      ['Check-out:', formatDate(checkOutDate || guestDetails?.checkOutDate)],
      ['Duration:', `${getBookingNights()} ${getBookingNights() === 1 ? 'night' : 'nights'}`],
      ['Guests:', getGuestCountDisplay()],
      ['Room Type:', guestDetails?.roomType || 'Standard Room'],
    ];

    // Compact table layout
    bookingDetails.forEach(([label, value]) => {
      // Alternating background
      if (bookingDetails.indexOf([label, value]) % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(leftMargin, yPosition - 1, rightMargin - leftMargin, 7, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text(label, leftMargin + 3, yPosition + 3);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const truncatedValue = (value as string).length > 25 ? (value as string).substring(0, 22) + '...' : value as string;
      doc.text(truncatedValue, leftMargin + 40, yPosition + 3);

      yPosition += 7; // Compact row height
    });

    yPosition += smallSpacing;

    // === PAYMENT INFORMATION ===
    doc.setTextColor(7, 109, 179);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PAYMENT INFORMATION', leftMargin, yPosition);

    doc.setDrawColor(7, 109, 179);
    doc.line(leftMargin, yPosition + 1, leftMargin + 40, yPosition + 1);

    yPosition += 8;

    // Compact payment info box
    doc.setFillColor(255, 248, 220);
    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(0.5);
    doc.rect(leftMargin, yPosition, rightMargin - leftMargin, 18, 'FD'); // Reduced height

    doc.setTextColor(120, 53, 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Payment Method: Pay at Hotel', leftMargin + 4, yPosition + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6); // Smaller text
    doc.text('Full payment will be collected during check-in at the hotel.', leftMargin + 4, yPosition + 12);

    yPosition += 22;

    // === TOTAL AMOUNT ===
    doc.setFillColor(7, 109, 179);
    doc.setDrawColor(5, 75, 143);
    doc.setLineWidth(0.5);
    doc.rect(leftMargin, yPosition, rightMargin - leftMargin, 15, 'FD'); // Reduced height

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TOTAL AMOUNT', leftMargin + 4, yPosition + 8);

    const formattedAmount = amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    doc.setFontSize(11); // Reduced from 13
    doc.text(`${currency || '₹'} ${formattedAmount}`, rightMargin - 4, yPosition + 8, { align: 'right' });

    yPosition += 20;

    // === IMPORTANT NOTES ===
    doc.setFillColor(255, 245, 245);
    doc.setDrawColor(239, 68, 68);
    doc.setLineWidth(0.3);
    doc.rect(leftMargin, yPosition, rightMargin - leftMargin, 25, 'FD'); // Reduced height

    doc.setTextColor(7, 109, 179);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('IMPORTANT INFORMATION', leftMargin + 4, yPosition + 6);

    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6); // Smaller text
    const importantNotes = [
      '• Valid photo ID required for check-in verification',
      '• Payment due at hotel reception during arrival',
      '• Contact support immediately for modifications',
    ];

    let noteY = yPosition + 10;
    importantNotes.forEach((note) => {
      doc.text(note, leftMargin + 6, noteY);
      noteY += 5; // Tight spacing
    });

    yPosition += 30;

    // === FOOTER ===
    doc.setDrawColor(7, 109, 179);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, yPosition, rightMargin, yPosition);

    yPosition += 4;
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('AlHajz Support: business.alhajz@gmail.com', centerX, yPosition, { align: 'center' });

    yPosition += 4;
    doc.setTextColor(7, 109, 179);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Thank you for choosing AlHajz - Your journey begins here!', centerX, yPosition, { align: 'center' });

    // Final check - if content exceeds page, show warning but still generate PDF
    if (yPosition > pageHeight - 10) {
      console.warn(`Content height (${yPosition}) exceeds page height (${pageHeight}). Some content may be cut off.`);
    }

    // Save PDF
    const sanitizedBookingId = bookingId.replace(/[^a-zA-Z0-9]/g, '_');
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `AlHajz_Confirmation_${sanitizedBookingId}_${currentDate}.pdf`;
    doc.save(filename);

    toast.success(t('Payment.PaymentSuccess.downloadSuccessToast'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF. Please try again.');
  }
};

export const useBookingPDF = () => {
  return { generateBookingConfirmationPDF };
};