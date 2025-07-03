"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { format, differenceInYears } from "date-fns";
import Cookies from "js-cookie";
import { onMessage } from 'firebase/messaging';
import { messaging } from '../../../utils/firebase.config';
import toast from "react-hot-toast";
import {
    CheckCircle,
    Clock,
    Copy,
    ArrowLeft,
    QrCode,
    Wallet,
    AlertCircle,
    Shield,
    ExternalLink,
    Loader2
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const PaymentProgressPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [paymentData, setPaymentData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const successTimeoutRef = useRef<NodeJS.Timeout>();

    // Payment notification via FCM
    useEffect(() => {
        console.log('🔔 useFCM hook initialized----------pppppp-------------------');
        if (messaging) {
            onMessage(messaging, (payload) => {
                const data = payload.data;
                if (data?.type === 'CRYPTO_PAYMENT_CONFIRMED') {
                    toast.success(`💸 ${data.message}`, { duration: 8000 });
                    console.log('✅ Payment data:', data);
                    setPaymentData((prev: any) => prev ? { ...prev, status: "completed" } : prev);
                    setShowSuccessModal(true);

                    // Clear any existing timeout
                    if (successTimeoutRef.current) {
                        clearTimeout(successTimeoutRef.current);
                    }

                    // Set redirect timeout
                    successTimeoutRef.current = setTimeout(() => {
                        console.log("Executing redirect to /my-trip");
                        localStorage.removeItem("paymentData");
                        router.replace("/my-trip");
                    }, 3000);
                } else {
                    toast(`🔔 ${payload.notification?.title}`);
                }
            });
        }

        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, [router]);

    // Timer for tracking payment time
    useEffect(() => {
        const initialDuration = 2400; // 40 minutes in seconds
        setTimeElapsed(initialDuration);
        const timer = setInterval(() => {
            setTimeElapsed((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Retrieve payment data from localStorage
    useEffect(() => {
        console.log("Retrieving payment data from localStorage...");
        const timer = setTimeout(() => {
            const storedData = localStorage.getItem("paymentData");
            if (storedData) {
                try {
                    const parsedData = JSON.parse(storedData);
                    if (
                        parsedData.payment_id &&
                        parsedData.token &&
                        parsedData.blockchain &&
                        parsedData.amount &&
                        parsedData.status
                    ) {
                        setPaymentData(parsedData);
                    } else {
                        setError(t("PayWithCryptoQR.errors.invalidPaymentData"));
                    }
                } catch (err) {
                    setError(t("PayWithCryptoQR.errors.invalidPaymentData"));
                }
            } else {
                setError(t("PayWithCryptoQR.errors.noPaymentData"));
            }
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [t]);

    // Handle copy address
    const handleCopyAddress = async () => {
        if (!paymentData?.address) return;
        try {
            await navigator.clipboard.writeText(paymentData.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy address");
        }
    };

    // Handle navigation
    const handleViewBookings = () => {
        localStorage.removeItem("paymentData");
        router.replace("/my-trip");
    };

    const handleViewHome = () => {
        router.replace("/");
    };

    // Get status configuration
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return {
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    icon: <Clock className="w-5 h-5" />,
                    text: 'Waiting for Payment'
                };
            case 'completed':
                return {
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    icon: <CheckCircle className="w-5 h-5" />,
                    text: 'Payment Confirmed'
                };
            case 'processing':
                return {
                    color: 'text-tripswift-blue',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    icon: <Loader2 className="w-5 h-5 animate-spin" />,
                    text: 'Processing Payment'
                };
            default:
                return {
                    color: 'text-tripswift-blue',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    icon: <Clock className="w-5 h-5" />,
                    text: 'Pending'
                };
        }
    };

    // Format time elapsed
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] flex items-center justify-center p-4 font-noto-sans">
                <div className="bg-tripswift-off-white rounded-xl shadow-lg p-6 flex flex-col items-center space-y-4 max-w-sm w-full">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-tripswift-blue animate-spin" />
                        <div className="absolute inset-1.5 w-13 h-13 border-[3px] border-transparent border-r-tripswift-blue/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-1">Loading Payment Details</h3>
                        <p className="text-sm text-tripswift-black/60">Preparing crypto payment...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] font-noto-sans">
            <div className="container mx-auto px-4 py-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-tripswift-bold text-tripswift-black mb-1">
                            Crypto Payment Gateway
                        </h1>
                        <p className="text-tripswift-black/70 text-base">
                            Complete your hotel booking payment using cryptocurrency
                        </p>
                    </div>

                    {error ? (
                        <div className="bg-tripswift-off-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
                            <div className="flex items-start gap-4 p-6 bg-red-50 border border-red-200 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-tripswift-bold text-red-800 mb-2">Payment Error</h3>
                                    <p className="text-red-600 mb-4">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : paymentData ? (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left Column - Payment & Guest Details */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Payment Details Card */}
                                <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden">
                                    <div className="bg-tripswift-blue p-4 text-tripswift-off-white">
                                        <h2 className="font-tripswift-medium text-lg flex items-center gap-2">
                                            <Wallet className="w-5 h-5" />
                                            Payment Information
                                        </h2>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-tripswift-black/70 font-tripswift-medium">Token</span>
                                            <span className="text-sm font-tripswift-bold text-tripswift-black bg-tripswift-blue/10 py-1 rounded-md">
                                                {paymentData.token}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-tripswift-black/70 font-tripswift-medium">Network</span>
                                            <span className="text-sm font-tripswift-bold text-tripswift-black">{paymentData.blockchain}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                            <span className="text-sm text-tripswift-black/70 font-tripswift-medium">Amount</span>
                                            <span className="font-tripswift-bold text-lg text-green-700">
                                                ${paymentData.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Guest Details Card */}
                                <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden">
                                    <div className="bg-tripswift-blue p-4 text-tripswift-off-white">
                                        <h2 className="font-tripswift-medium text-lg flex items-center gap-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                            Guest Information
                                        </h2>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 text-tripswift-blue mt-0.5 flex-shrink-0"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-xs font-tripswift-medium text-tripswift-black/70 mb-1">Hotel</p>
                                                <p className="text-sm font-tripswift-bold text-tripswift-black">{paymentData.hotelName || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-5 h-5 text-tripswift-blue mt-0.5 flex-shrink-0"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                <div>
                                                    <p className="text-xs font-tripswift-medium text-tripswift-black/70 mb-1">Check-In</p>
                                                    <p className="text-sm font-tripswift-bold text-tripswift-black">{paymentData.checkInDate || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-5 h-5 text-tripswift-blue mt-0.5 flex-shrink-0"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                <div>
                                                    <p className="text-xs font-tripswift-medium text-tripswift-black/70 mb-1">Check-Out</p>
                                                    <p className="text-sm font-tripswift-bold text-tripswift-black">{paymentData.checkOutDate || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 text-tripswift-blue mt-0.5 flex-shrink-0"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-xs font-tripswift-medium text-tripswift-black/70 mb-1">Email</p>
                                                <p className="text-sm font-tripswift-bold text-tripswift-black break-all">{paymentData.email || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 text-tripswift-blue mt-0.5 flex-shrink-0"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-xs font-tripswift-medium text-tripswift-black/70 mb-1">Phone</p>
                                                <p className="text-sm font-tripswift-bold text-tripswift-black">{paymentData.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-5 h-5 text-tripswift-blue"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="9" cy="7" r="4"></circle>
                                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                </svg>
                                                <span className="text-sm font-tripswift-medium text-tripswift-black/70">Guests</span>
                                            </div>
                                            {paymentData.guests && Array.isArray(paymentData.guests) ? (
                                                <ul className="space-y-2">
                                                    {paymentData.guests.map((guest: any, index: number) => (
                                                        <li key={index} className="flex items-start gap-3 p-2 bg-tripswift-off-white rounded-md">
                                                            <div className="flex items-center justify-center w-6 h-6 bg-tripswift-blue/10 text-tripswift-blue rounded-full text-xs font-tripswift-bold">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-tripswift-bold text-tripswift-black">
                                                                    {`${guest.firstName} ${guest.lastName}`}
                                                                    {guest.type && <span className="text-xs text-tripswift-black/60 ml-1">({guest.type})</span>}
                                                                </p>
                                                                {guest.dob && (
                                                                    <p className="text-xs text-tripswift-black/60 mt-0.5">
                                                                        Age: {differenceInYears(new Date(), new Date(guest.dob))} years
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm font-tripswift-bold text-tripswift-black">N/A</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - QR Code */}
                            <div className="lg:col-span-2">
                                <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden">
                                    <div className="bg-tripswift-blue p-4 text-tripswift-off-white">
                                        <h2 className="font-tripswift-medium text-lg flex items-center gap-2">
                                            <QrCode className="w-5 h-5" />
                                            Scan & Pay
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="text-center">
                                                <div className="from-gray-50 to-gray-100 rounded-xl p-2">
                                                    <div className="inline-block bg-tripswift-off-white p-3 rounded-xl shadow-md">
                                                        <QRCodeCanvas
                                                            value={paymentData?.address || ""}
                                                            size={140}
                                                            style={{ width: "100%", height: "100%" }}
                                                            bgColor="#ffffff"
                                                            fgColor="#1e293b"
                                                            level="H"
                                                            includeMargin={true}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-tripswift-black/60 mt-2">Scan with your crypto wallet</p>
                                                </div>

                                                <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden sticky top-6">
                                                    <div className="p-4 space-y-4">
                                                        <div className="text-center">
                                                            <div
                                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${timeElapsed <= 0 ? "bg-red-50 border-red-200 text-red-600" : getStatusConfig(paymentData.status).bgColor} ${timeElapsed <= 0 ? "border-red-200" : getStatusConfig(paymentData.status).borderColor} border-2`}
                                                            >
                                                                {timeElapsed <= 0 ? (
                                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                                ) : (
                                                                    getStatusConfig(paymentData.status).icon
                                                                )}
                                                                <span
                                                                    className={`font-tripswift-bold ${timeElapsed <= 0 ? "text-red-600" : getStatusConfig(paymentData.status).color}`}
                                                                >
                                                                    {timeElapsed <= 0 ? "Payment Expired" : getStatusConfig(paymentData.status).text}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className={`text-xl font-tripswift-bold ${timeElapsed <= 0 ? "text-red-600" : "text-tripswift-black"}`}>
                                                                {formatTime(timeElapsed)}
                                                                {timeElapsed <= 0 && <span className="text-xs block mt-1">(Session expired)</span>}
                                                                {timeElapsed <= 100 && timeElapsed > 0 && (
                                                                    <span className="text-xs block mt-1 text-yellow-600">(Expiring soon)</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-tripswift-black/60">
                                                                {timeElapsed <= 0 ? "Maximum time reached" : "Time remaining"}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-1 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                                                                <Shield className="w-3 h-3 text-green-600" />
                                                                <span className="text-green-700 font-tripswift-medium">
                                                                    {timeElapsed <= 0 ? "Session expired" : "Secure Payment"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <label className="text-tripswift-black/70 font-tripswift-medium block mb-2">Wallet Address</label>
                                                    <div className="flex items-center gap-2">
                                                        <code className="flex-1 text-sm text-tripswift-black/80 bg-tripswift-off-white px-3 py-2 rounded-lg font-mono break-all border">
                                                            {paymentData?.address || "Loading address..."}
                                                        </code>
                                                        <button
                                                            onClick={handleCopyAddress}
                                                            className={`p-2 rounded-lg transition-all ${copied ? "bg-green-100 text-green-600" : "bg-gray-200 text-tripswift-black/60 hover:bg-gray-300"}`}
                                                            title="Copy address"
                                                        >
                                                            {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                    {copied && (
                                                        <p className="text-green-600 text-sm mt-2 font-tripswift-medium">✓ Address copied to clipboard!</p>
                                                    )}
                                                </div>
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                                    <h3 className="font-tripswift-bold text-blue-800 mb-3 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Payment Instructions
                                                    </h3>
                                                    <ul className="text-blue-7text-blue-700 text-sm space-y-2">
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-tripswift-bold">1.</span>
                                                            <span>Send exactly <strong>${paymentData.amount}</strong> worth of <strong>{paymentData.token}</strong></span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-tripswift-bold">2.</span>
                                                            <span>Use the <strong>{paymentData.blockchain}</strong> network only</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-tripswift-bold">3.</span>
                                                            <span>Double-check the wallet address before sending</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-tripswift-bold">4.</span>
                                                            <span>Payment confirmation is automatic (5-15 minutes)</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <p className="text-yellow-800 text-sm">
                                                        <strong>Important:</strong> Only send {paymentData.token} on {paymentData.blockchain} network. Sending other tokens or using wrong network will result in loss of funds.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <button
                                                onClick={handleViewBookings}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-tripswift-blue text-tripswift-off-white rounded-lg hover:bg-tripswift-blue/90 transition-all duration-300 font-tripswift-medium shadow-sm hover:shadow-md"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View My Bookings
                                            </button>
                                            <button
                                                onClick={handleViewHome}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-tripswift-off-white text-tripswift-black/80 rounded-lg hover:bg-gray-100 transition-all duration-300 font-tripswift-medium border border-gray-200 shadow-sm hover:shadow-md"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Return Home
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="mt-12 text-center">
                        <div className="bg-tripswift-off-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
                            <h3 className="font-tripswift-bold text-tripswift-black mb-2">Need Help?</h3>
                            <p className="text-tripswift-black/70 mb-4">
                                Our support team is available 24/7 to assist with your crypto payment
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button className="inline-flex items-center gap-2 py-2 px-4 bg-tripswift-blue/10 text-tripswift-blue rounded-lg hover:bg-tripswift-blue/20 transition-all duration-300 font-tripswift-medium">
                                    <ExternalLink className="w-4 h-4" />
                                    Contact Support
                                </button>
                                <button className="inline-flex items-center gap-2 py-2 px-4 bg-gray-100 text-tripswift-black/70 rounded-lg hover:bg-gray-200 transition-all duration-300 font-tripswift-medium">
                                    <Shield className="w-4 h-4" />
                                    Security Info
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <div className="bg-tripswift-off-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <CheckCircle className="w-16 h-16 text-green-600" />
                                <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75"></div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-tripswift-bold text-tripswift-black mb-2">
                            Payment Successful!
                        </h3>
                        <p className="text-tripswift-black/70 mb-6">
                            Your payment has been confirmed.
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem("paymentData");
                                router.replace("/my-trip");
                            }}
                            className="w-full py-3 px-4 bg-tripswift-blue text-tripswift-off-white rounded-lg hover:bg-tripswift-blue/90 transition-all duration-300 font-tripswift-medium"
                        >
                            Take me to My Bookings
                        </button>
                        <style jsx>{`
                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                            .animate-fade-in {
                                animation: fadeIn 0.3s ease-out forwards;
                            }
                        `}</style>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentProgressPage;