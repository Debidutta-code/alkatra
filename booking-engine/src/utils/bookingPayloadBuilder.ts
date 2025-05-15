interface GuestInfo {
    firstName: string;
    lastName: string;
    email: string;
}

interface PayloadInput {
    guestInfo: GuestInfo;
    amount: number;
    propertyId: string | null;
    roomId: string | null;
    checkInDate: string | null;
    checkOutDate: string | null;
    userId: string | null;
    guestDetails: Record<string, any>;
}

export const buildHotelBookingPayload = ({
    guestInfo,
    amount,
    propertyId,
    roomId,
    checkInDate,
    checkOutDate,
    userId,
    guestDetails,
}: PayloadInput) => {
    const { firstName, lastName, email } = guestInfo;

    const payload = {
        data: {
            type: "hotel-order",
            guests: [
                {
                    tid: 1,
                    title: "MR",
                    firstName,
                    lastName,
                    phone: guestDetails.phone || "+33679278416",
                    email,
                },
            ],
            travelAgent: {
                contact: {
                    email: "support@ota.com",
                },
            },
            roomAssociations: [
                {
                    guestReferences: [{ guestReference: "1" }],
                    roomId, // Include the room ID here
                },
            ],
            payment: {
                method: "CREDIT_CARD",
                amount, // Include the amount here
                paymentCard: {
                    paymentCardInfo: {
                        vendorCode: "VI",
                        cardNumber: "4151289722471370",
                        expiryDate: "2026-08",
                        holderName: `${firstName} ${lastName}`, 
                    },
                },
            },
            bookingDetails: {
                propertyId,
                checkInDate,
                checkOutDate,
                userId,
            },
        },
    };

    console.log("Payload:", JSON.stringify(payload, null, 2)); // Print the payload

    return payload;
};