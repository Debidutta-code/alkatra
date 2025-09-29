"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookingById } from "../api";
import { Calendar, MapPin, Mail, Phone, BedDouble, ChevronLeft, CreditCard, CheckCircle, Clock, AlertCircle, XCircle, BookOpen, Building2, Users, Baby, User, UserCheck } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Triangle } from "react-loader-spinner";

type Guest = {
    firstName: string;
    lastName: string;
    dob: string;
    _id: string;
    age?: number;
};

type BookingDetailsType = {
    id: string;
    reservationId: string;
    guestName: string;
    guests?: Guest[];
    primaryGuest?: Guest;
    guestCount?: number;
    checkIn: string;
    checkOut: string;
    status: string;
    amount: number;
    totalAmount: number;
    currency: string;
    property: {
        id: string;
        name: string;
        code: string;
    };
    roomDetails: string;
    roomType: string;
    numberOfRooms: number;
    paymentMethod: string;
    userDetails: {
        email: string;
        phone: string;
    };
    email: string;
    phone: string;
};

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-24">
        <Triangle
            visible={true}
            height={80}
            width={80}
            color="#076DB3"
            ariaLabel="triangle-loading"
        />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Loading booking details...
        </p>
    </div>
);

interface BookingDetailsClientProps {
    bookingId: string;
}

export default function BookingDetailsClient({ bookingId }: BookingDetailsClientProps) {
    const router = useRouter();
    const [booking, setBooking] = useState<BookingDetailsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    // Navigation handler
    const handleBackToList = () => {
        router.push('/app/bookings');
    };

    // Helper function to calculate age from date of birth
    const calculateAge = (dob: string): number => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // Helper function to get age category icon
    const getAgeIcon = (age: number | null) => {
        if (age === null) return <User className="w-4 h-4 text-gray-500" />;
        if (age <= 2) return <Baby className="w-4 h-4 text-pink-500" />;
        if (age <= 12) return <User className="w-4 h-4 text-blue-500" />;
        return <UserCheck className="w-4 h-4 text-green-500" />;
    };

    // Helper function to get age category label
    const getAgeCategory = (age: number | null): string => {
        if (age === null) return "Unknown";
        if (age <= 2) return "Infant";
        if (age <= 12) return "Child";
        return "Adult";
    };

    useEffect(() => {
        async function fetchBookingDetails() {
            if (!bookingId) {
                setError("No booking ID provided.");
                setLoading(false);
                return;
            }

            try {
                setError("");
                setLoading(true);

                const data = await getBookingById(bookingId);
                console.log("^^^^^^^^^^^^^^^^^^^^^^^^\n", bookingId);
                console.log("Booking data received:", data);

                if (data) {
                    setBooking(data as BookingDetailsType);
                } else {
                    console.error("Booking not found!");
                    setError("Booking not found or does not exist.");
                    setBooking(null);
                }
            } catch (error) {
                console.error("Error fetching booking details:", error);
                setError("Failed to fetch booking details. Please try again.");
                setBooking(null);
            } finally {
                setLoading(false);
            }
        }

        fetchBookingDetails();
    }, [bookingId]);

    // Status configuration with icons
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        Confirmed: {
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            text: "text-emerald-700 dark:text-emerald-400",
            icon: <CheckCircle className="w-3 h-3" />,
            variant: "secondary",
        },
        Pending: {
            bg: "bg-amber-50 dark:bg-amber-900/20",
            text: "text-amber-700 dark:text-amber-400",
            icon: <Clock className="w-3 h-3" />,
            variant: "outline",
        },
        Modified: {
            bg: "bg-blue-50 dark:bg-blue-900/20",
            text: "text-blue-700 dark:text-blue-400",
            icon: <AlertCircle className="w-3 h-3" />,
            variant: "default",
        },
        Cancelled: {
            bg: "bg-red-50 dark:bg-red-900/20",
            text: "text-red-700 dark:text-red-400",
            icon: <XCircle className="w-3 h-3" />,
            variant: "destructive",
        },
    };

    // Payment method display helper
    const getPaymentMethodDisplay = (method: string): string => {
        switch (method) {
            case 'payAtHotel':
                return 'Pay at Hotel';
            case 'crypto':
                return 'Cryptocurrency';
            default:
                return method.charAt(0).toUpperCase() + method.slice(1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen md:mx-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container px-4 py-4 mx-auto sm:px-6 lg:px-8 max-w-6xl">
                    <LoadingState />
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen md:mx-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container px-4 py-4 mx-auto sm:px-6 lg:px-8 max-w-6xl">
                    <div className="mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToList}
                            className="text-slate-600 dark:text-slate-400 hover:text-tripswift-blue dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 p-2"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Bookings
                        </Button>
                    </div>

                    <div className="flex justify-center items-center min-h-[50vh]">
                        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg max-w-md mx-auto">
                            <CardHeader>
                                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2 justify-center">
                                    <XCircle className="w-5 h-5" />
                                    Booking Not Found
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-red-500 dark:text-red-500 text-sm mb-4 text-center">
                                    {error || "The booking you're looking for is either invalid or does not exist."}
                                </p>
                                <div className="text-center">
                                    <Button
                                        onClick={handleBackToList}
                                        className="bg-tripswift-blue hover:bg-tripswift-dark-blue text-white"
                                    >
                                        Back to Bookings
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen md:mx-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container px-4 py-4 mx-auto sm:px-6 lg:px-8 max-w-6xl">
                <div className="mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToList}
                        className="text-slate-600 dark:text-slate-400 hover:text-tripswift-blue dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 p-2"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Bookings
                    </Button>
                </div>

                <div className="mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-tripswift-blue dark:text-blue-400" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    Booking Details
                                </h1>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 ml-9 sm:ml-11">
                                <Badge
                                    variant={statusConfig[booking.status]?.variant || "outline"}
                                    className="flex items-center gap-1 text-xs sm:text-sm"
                                >
                                    {statusConfig[booking.status]?.icon}
                                    <span className="capitalize">{booking.status}</span>
                                </Badge>
                                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                    ID: <span className="font-mono font-medium">{booking.reservationId}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Users className="w-4 h-4 text-tripswift-blue dark:text-blue-400" />
                                </div>
                                Guest Information
                                {booking.guestCount && booking.guestCount > 1 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {booking.guestCount} Guests
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        <div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Check-in</div>
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{booking.checkIn}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        <div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Check-out</div>
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{booking.checkOut}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Guest Details
                                    </h3>
                                    {booking.guests && booking.guests.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {booking.guests.map((guest, index) => {
                                                const isValidDob = guest.dob &&
                                                    guest.dob !== 'invalid' &&
                                                    guest.dob !== '' &&
                                                    !isNaN(new Date(guest.dob).getTime());

                                                const age = isValidDob ? calculateAge(guest.dob) : null;
                                                const isPrimary = index === 0;
                                                const hasValidDob = isValidDob && age !== null;

                                                return (
                                                    <div
                                                        key={guest._id}
                                                        className={`p-3 rounded-lg border-2 transition-all ${isPrimary
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium ${isPrimary
                                                                ? 'bg-gradient-to-br from-tripswift-blue to-purple-600'
                                                                : 'bg-gradient-to-br from-slate-400 to-slate-600'
                                                                }`}>
                                                                {guest.firstName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-base font-medium text-slate-900 dark:text-slate-100">
                                                                        {guest.firstName} {guest.lastName}
                                                                    </div>
                                                                    {isPrimary && (
                                                                        <Badge variant="default" className="text-xs">
                                                                            Primary
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {/* Only show age section if valid DOB exists */}
                                                                {hasValidDob && (
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        {getAgeIcon(age)}
                                                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                            {age} years old • {getAgeCategory(age)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Only show DOB section if valid date exists */}
                                                        {hasValidDob && guest.dob && guest.dob !== 'invalid' && (
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded">
                                                                <span className="font-medium">Date of Birth:</span> {new Date(guest.dob).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 bg-gradient-to-br from-tripswift-blue to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                    {booking.guestName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-base font-medium text-slate-900 dark:text-slate-100">
                                                        {booking.guestName}
                                                    </div>
                                                    <Badge variant="default" className="text-xs mt-0.5">
                                                        Primary Guest
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                Property Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="space-y-3">
                                <div>
                                    <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 mb-1.5">
                                        {booking.property.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin className="w-4 h-4" />
                                        <span>Code: {booking.property.code}</span>
                                    </div>
                                </div>
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <BedDouble className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Room Details</span>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{booking.roomDetails}</div>
                                    <div className="text-xs text-slate-500">
                                        {booking.numberOfRooms} {booking.numberOfRooms === 1 ? 'Room' : 'Rooms'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {booking.userDetails?.email || booking.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Phone</div>
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            +{booking.userDetails?.phone || booking.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                    <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Amount</div>
                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {(booking.totalAmount || booking.amount).toFixed(2)} {booking.currency}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <CreditCard className="w-4 h-4 text-slate-500" />
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Payment Method</div>
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {getPaymentMethodDisplay(booking.paymentMethod)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}