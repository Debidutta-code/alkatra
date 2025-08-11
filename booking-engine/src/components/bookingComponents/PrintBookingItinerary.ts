import { Booking, GuestDetails } from "./bookingTabs/types";
import { formatDateString } from "./bookingTabs/utils";
import { TFunction } from "i18next";

export const generatePrintContent = (
  booking: Booking,
  t: TFunction,
  formatDOB: (dob: string) => string
) => {
  const roomType = booking.roomTypeCode;
  const currency = booking.currencyCode?.toUpperCase();
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  // Detect Arabic language (supports 'ar' or 'ar-SA', etc.)
  const isArabic = t("lang").startsWith("ar");

  return `
    <!DOCTYPE html>
    <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${t("lang")}">
      <head>
        <meta charset="UTF-8">
        <title>${t("BookingTabs.BookingDetailsModal.printTitle")} - ${booking.hotelName}</title>
        <style>
          @page { 
            size: auto; 
            margin: 10mm; 
          }
          body { 
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.4;
            max-width: 800px;
            margin: 0 auto;
            padding: 15px;
            direction: ${isArabic ? 'rtl' : 'ltr'};
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px;
            border-bottom: 2px solid #054B8F;
            padding-bottom: 15px;
          }
          .hotel-name { 
            font-size: 22px; 
            font-weight: bold;
            color: #054B8F;
            margin-bottom: 5px;
          }
          .booking-id { 
            color: #666; 
            margin-bottom: 10px;
            font-size: 14px;
          }
          .status {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            margin-top: 5px;
          }
          .section { 
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .section-title { 
            font-weight: bold; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 5px;
            color: #054B8F;
            margin-bottom: 10px;
            font-size: 18px;
          }
          .date-row {
            display: flex;
            ${isArabic ? 'flex-direction: row-reverse;' : 'flex-direction: row;'}
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 15px;
          }
          .detail-item {
            margin-bottom: 10px;
            page-break-inside: avoid;
          }
          .label { 
            font-weight: bold; 
            color: #555;
            font-size: 14px;
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .value {
            font-size: 15px;
            text-align: ${isArabic ? 'right' : 'left'};
            margin-top: 4px;
          }
          .details-grid, .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .payment-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .total-amount {
            font-size: 18px;
            font-weight: bold;
            color: #054B8F;
            text-align: right;
            margin-top: 20px;
            padding: 10px;
            border: 2px solid #054B8F;
            border-radius: 5px;
            background-color: #f8f9fa;
          }
          .guest-item {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #eee;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          @media print {
            .no-print { display: none; }
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hotel-name">${booking.hotelName}</div>
          <div class="booking-id">${t("BookingTabs.BookingDetailsModal.bookingId")}: ${booking._id?.slice(-8).toUpperCase()}</div>
          <div class="status" style="background-color: ${
            booking.status === "Confirmed"
              ? "#d4edda"
              : booking.status === "Pending"
              ? "#fff3cd"
              : "#f8d7da"
          }; color: ${
    booking.status === "Confirmed"
      ? "#155724"
      : booking.status === "Pending"
      ? "#856404"
      : "#721c24"
  }">
            ${booking.status}
          </div>
        </div>

        <!-- Stay Details -->
        <div class="section">
          <div class="section-title">${t("BookingTabs.BookingDetailsModal.stayDetails")}</div>

          <!-- Check-in / Check-out in correct RTL order -->
          <div class="date-row">
            <div class="detail-item" style="flex: 1;">
              <div class="label">${t("BookingTabs.BookingDetailsModal.checkOut")}</div>
              <div class="value">${formatDateString(booking.checkOutDate)}</div>
            </div>
            <div class="detail-item" style="flex: 1;">
              <div class="label">${t("BookingTabs.BookingDetailsModal.checkIn")}</div>
              <div class="value">${formatDateString(booking.checkInDate)}</div>
            </div>
          </div>

          <!-- Other details in grid -->
          <div class="details-grid">
            <div class="detail-item">
              <div class="label">${t("BookingTabs.BookingDetailsModal.roomType")}</div>
              <div class="value">${roomType}</div>
            </div>
            <div class="detail-item">
              <div class="label">${t("BookingTabs.BookingDetailsModal.rooms")}</div>
              <div class="value">${t("BookingTabs.BookingDetailsModal.roomsCount", { count: booking.numberOfRooms })}</div>
            </div>
            <div class="detail-item">
              <div class="label">${t("BookingTabs.BookingDetailsModal.duration")}</div>
              <div class="value">${t("BookingTabs.BookingDetailsModal.nightsStay_one", { count: nights })}</div>
            </div>
          </div>
        </div>

        <!-- Guest Details -->
        <div class="section">
          <div class="section-title">${t("BookingTabs.BookingDetailsModal.guestDetails")}</div>
          ${booking.guestDetails && booking.guestDetails.length > 0
            ? booking.guestDetails
                .map(
                  (guest: GuestDetails, idx: number) => `
              <div class="guest-item">
                <div class="label">${t("BookingTabs.BookingDetailsModal.guest")} ${idx + 1}</div>
                <div class="value">${guest.firstName} ${guest.lastName}</div>
                ${guest.dob ? `
                  <div style="margin-top: 5px;">
                    <div class="label">${t("BookingTabs.BookingDetailsModal.dob")}</div>
                    <div class="value">${formatDOB(guest.dob)}</div>
                  </div>
                ` : ''}
              </div>
            `
                )
                .join("")
            : `<div class="value">${booking.email}</div>`}

          <div class="contact-grid">
            ${booking.email
              ? `
              <div class="detail-item">
                <div class="label">${t("BookingTabs.BookingDetailsModal.email")}</div>
                <div class="value">${booking.email}</div>
              </div>
            `
              : ""}
            ${booking.phone
              ? `
              <div class="detail-item">
                <div class="label">${t("BookingTabs.BookingDetailsModal.contactNumber")}</div>
                <div class="value" dir="ltr">${booking.phone}</div>
              </div>
            `
              : ""}
          </div>
        </div>

        <!-- Payment Details -->
        ${booking.paymentMethod || booking.totalAmount
          ? `
          <div class="section">
            <div class="section-title">${t("BookingTabs.BookingDetailsModal.paymentDetails")}</div>
            <div class="payment-grid">
              ${booking.createdAt
                ? `
                <div class="detail-item">
                  <div class="label">${t("BookingTabs.BookingDetailsModal.bookingDate")}</div>
                  <div class="value">${formatDateString(booking.createdAt)}</div>
                </div>
              `
                : ""}
              ${booking.paymentMethod
                ? `
                <div class="detail-item">
                  <div class="label">${t("BookingTabs.BookingDetailsModal.paymentMethod")}</div>
                  <div class="value">${booking.paymentMethod
                    .charAt(0)
                    .toUpperCase()}${booking.paymentMethod
                    .slice(1)
                    .replace(/([A-Z])/g, " $1")
                    .trim()}</div>
                </div>
              `
                : ""}
              ${booking.totalAmount
                ? `
                <div class="detail-item">
                  <div class="label">${t("BookingTabs.BookingDetailsModal.totalAmount")}</div>
                  <div class="value" dir="ltr">${currency} ${booking.totalAmount.toLocaleString()}</div>
                </div>
              `
                : ""}
            </div>
            ${booking.totalAmount
              ? `
              <div class="total-amount">
                ${t("BookingTabs.BookingDetailsModal.totalAmount")}: <span dir="ltr">${currency} ${booking.totalAmount.toLocaleString()}</span>
              </div>
            `
              : ""}
          </div>
        `
          : ""}

        <!-- Footer -->
        <div class="footer">
          ${t("BookingTabs.BookingDetailsModal.printFooter")}
        </div>
      </body>
    </html>
  `;
};
// Utility to calculate number of nights
const calculateNights = (checkInDate: string, checkOutDate: string): number => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
};

// Print function
export const printBookingItinerary = (
  booking: Booking,
  t: TFunction,
  formatDOB: (dob: string) => string
) => {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    const printContent = generatePrintContent(booking, t, formatDOB);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
};