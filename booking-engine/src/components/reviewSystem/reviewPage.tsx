"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CustomerReviewApi } from "../../api";

interface CustomerReviewFormProps {
    id: string;
}

export default function CustomerReviewForm({ id }: CustomerReviewFormProps) {

    const reservationId = id;
    const [, setLoader] = useState(true);

    useEffect(() => {
        if (!reservationId) return;

        /**
         * API for fetch review details
         */
        const fetchReviewDetails = async () => {
            try {
                setLoader(true);
                const getReviewDetails = await customerReviewApi.getReviewById(reservationId);
                console.log(`The reservation details we get ${JSON.stringify(getReviewDetails)}`);
                if (!getReviewDetails) {
                    setLoader(false)
                    router.push('/review-success');
                    return;
                }
                else return
            } catch (error: any) {

            }
            finally {
                setLoader(false);
            }
        };

        fetchReviewDetails();
    }, [reservationId]);

    const customerReviewApi = new CustomerReviewApi();
    const router = useRouter();


    const [formData, setFormData] = useState({
        reservationId: "",
        hotelCode: "",
        hotelName: "",
        userId: "",
        guestEmail: "",
        comment: "",
        rating: 0,
    });


    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [commentError, setCommentError] = useState("");
    const [ratingError, setRatingError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    /**
     * Star input handle here
     */
    const handleStarClick = (rating: number) => {
        setFormData({ ...formData, rating: formData.rating === rating ? 0 : rating });
    };

    /**
     * Handle submit button
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setCommentError("");
        setRatingError("");

        /**
         * Rating field validation 
         */
        if (formData.rating === 0) {
            setRatingError("Please select a star rating");
            setLoading(false);
            return;
        }

        /**
         * Comment field validation 
         */
        if (!formData.comment.trim()) {
            setCommentError("Please share your experience in the comment field");
            setLoading(false);
            return;
        }

        try {
            const formDataSubmit = await customerReviewApi.submitReview(formData);

            if (formDataSubmit.status === 201) {
                setMessage("✅ Review submitted successfully!");
                setFormData({
                    reservationId: "",
                    hotelCode: "",
                    hotelName: "",
                    userId: "",
                    guestEmail: "",
                    comment: "",
                    rating: 0,
                });
                router.push('/review-success');
            } else {
                setMessage(`❌ "Failed to submit review"}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Something went wrong, please try again.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * UseEffect used here
     */
    useEffect(() => {
        if (!reservationId) return;

        /**
         * API for fetch reservation 
        */
        const fetchReservation = async () => {
            try {
                const reservationData = await customerReviewApi.getReservationForReview(reservationId as string);


                setFormData((prev) => ({
                    ...prev,
                    reservationId: reservationData.reservationId,
                    hotelCode: reservationData.hotelCode,
                    hotelName: reservationData.hotelName,
                    userId: reservationData.userId,
                    guestEmail: reservationData.email,
                }));


            } catch (err) {
                console.error(err);
                setMessage("❌ Can not display your details.");
            }
        };

        fetchReservation();
    }, [reservationId]);



    return (
        <div
            className="min-h-screen bg-cover bg-fixed bg-center"
            style={{
                backgroundImage: "url('/assets/login.jpg')",
                backgroundPosition: "center center"
            }}
        >
            {/* Dark overlay for better readability */}
            <div className="min-h-screen bg-white/40">

                {/* Logo at top left corner */}
                <div className="pt-4 px-4 flex justify-start">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md border border-gray-100">
                        <img
                            src="/assets/Alhajz.png"
                            alt="Al-Hajz Logo"
                            className="h-20 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* Review Form Section */}
                <div className="max-w-4xl mx-auto px-4 py-13">
                    <div className="bg-tripswift-off-white rounded-xl shadow-lg overflow-hidden border border-gray-200">

                        {/* Form Header */}
                        <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] p-4 text-tripswift-off-white">
                            <h2 className="text-2xl font-tripswift-bold">Leave Your Review</h2>
                            <p className="text-blue-100 mt-1">We value your feedback</p>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 md:p-6">
                            {message && (
                                <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Hotel Info */}
                                <div className="space-y-2">
                                    <label className="block text-tripswift-black font-tripswift-medium text-xs uppercase tracking-normal">
                                        Hotel
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="font-tripswift-semibold text-tripswift-black">{formData.hotelName}</p>
                                    </div>
                                </div>

                                {/* Guest Email */}
                                <div className="space-y-2">
                                    <label className="block text-tripswift-black font-tripswift-medium text-xs uppercase tracking-normal">
                                        Your Email
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="font-tripswift-medium text-tripswift-black">{formData.guestEmail}</p>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="space-y-2">
                                    <label className="block text-tripswift-black font-tripswift-medium text-xs uppercase tracking-normal">
                                        Your Rating
                                    </label>

                                    {ratingError && (
                                        <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm font-tripswift-medium">
                                            {ratingError}
                                        </div>
                                    )}

                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => {
                                                    handleStarClick(star);
                                                    setRatingError("");
                                                }}
                                                className={`text-3xl md:text-4xl ${formData.rating >= star ? "text-yellow-400" : "text-gray-300"} transition-colors`}
                                                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 font-tripswift-regular">
                                        {formData.rating
                                            ? `You rated ${formData.rating} star${formData.rating !== 1 ? 's' : ''}`
                                            : 'Select your rating'}
                                    </p>
                                </div>

                                {/* Comments */}
                                {commentError && (
                                    <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm font-tripswift-medium">
                                        {commentError}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label htmlFor="comment" className="block text-tripswift-black font-tripswift-medium text-xs uppercase tracking-normal">
                                        Your Review
                                    </label>
                                    <textarea
                                        id="comment"
                                        name="comment"
                                        placeholder="Share your experience with this hotel..."
                                        value={formData.comment}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tripswift-blue focus:border-tripswift-blue font-noto-sans text-sm"
                                        rows={5}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-tripswift-blue to-[#054B8F] hover:from-[#054B8F] hover:to-tripswift-blue text-tripswift-off-white font-tripswift-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Review"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    {/* Additional Info */}
                    <div className="mt-4 pb-4 text-center text-white">
                        <p>Your feedback helps us improve our services.</p>
                        <p className="mt-1">Thank you for taking the time to share your experience!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}