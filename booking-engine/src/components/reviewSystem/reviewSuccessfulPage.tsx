"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ReviewSuccessPage() {

    const router = useRouter();

    const handleGoHome = () => {
        router.push('/');
    };


    return (
        <div 
            className="min-h-screen bg-cover bg-fixed bg-center"
            style={{ 
                backgroundImage: "url('/assets/login3.jpg')",
                backgroundPosition: "center center"
            }}
        >
            {/* Dark overlay with logo */}
            <div className="min-h-screen bg-black/60 flex flex-col">
                
                {/* Logo at top center */}
                <div className="pt-8 px-4 flex justify-start">
                    <img 
                        src="/assets/TRIP-1.png" 
                        alt="Trip Logo"
                        className="h-24 w-auto object-contain" 
                    />
                </div>

                {/* Success content */}
                <div className="max-w-2xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
                    <div className="bg-gray-200 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md p-8 text-center">
                        
                        {/* Success Icon */}
                        <div className="mb-6">
                            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <svg 
                                    className="w-12 h-12 text-green-500" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M5 13l4 4L19 7" 
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Success Message */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Review Submitted Successfully! 🎉
                        </h1>
                        
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Thank you for taking the time to share your experience with us. 
                            Your feedback helps us improve our services and assists other travelers 
                            in making informed decisions.
                        </p>

                        {/* Additional Info */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <p className="text-blue-800 text-sm">
                                <strong>What happens next?</strong><br />
                                Your review will be processed and published within 24-48 hours after moderation.
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleGoHome}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Return to Home
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}