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
                backgroundImage: "url('/assets/login3.jpg')",
                backgroundPosition: "center center"
            }}
        >
            {/* Dark overlay for better readability */}
            <div className="min-h-screen bg-black bg-opacity-60">

                {/* Logo at top center */}
                <div className="pt-8 px-4 flex justify-start">
                    <img
                        src="/assets/TRIP-1.png"
                        alt="Trip Logo"
                        className="h-24 w-auto object-contain"
                    />
                </div>

                {/* Review Form Section */}
                <div className="max-w-4xl mx-auto px-4 py-13">
                    <div className="bg-white bg-opacity-90 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">

                        {/* Form Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                            <h2 className="text-2xl font-bold">Leave Your Review</h2>
                            <p className="text-blue-100">We value your feedback</p>
                        </div>

                        {/* Form Content - keep this part exactly the same */}
                        <div className="p-6 md:p-6">
                            {message && (
                                <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Hotel Info */}
                                <div className="space-y-2">
                                    <label className="block text-gray-700 font-medium">Hotel</label>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="font-semibold">{formData.hotelName}</p>
                                    </div>
                                </div>

                                {/* Guest Email */}
                                <div className="space-y-2">
                                    <label className="block text-gray-700 font-medium">Your Email</label>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="font-medium text-gray-800">{formData.guestEmail}</p>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="space-y-2">
                                    <label className="block text-gray-700 font-medium">Your Rating</label>

                                    {/* Add rating error display */}
                                    {ratingError && (
                                        <div className="p-3 bg-red-100 text-red-800 rounded-lg mb-2">
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
                                                    setRatingError(""); // Clear error when user selects a rating
                                                }}
                                                className={`text-4xl ${formData.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                                                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {formData.rating ? `You rated ${formData.rating} star${formData.rating !== 1 ? 's' : ''}` : 'Select your rating'}
                                    </p>
                                </div>

                                {/* Comments */}
                                {commentError && (
                                    <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
                                        {commentError}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label htmlFor="comment" className="block text-gray-700 font-medium">
                                        Your Review
                                    </label>
                                    <textarea
                                        id="comment"
                                        name="comment"
                                        placeholder="Share your experience with this hotel..."
                                        value={formData.comment}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={5}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
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
                    <div className="mt-8 text-center text-white">
                        <p>Your feedback helps us improve our services.</p>
                        <p className="mt-1">Thank you for taking the time to share your experience!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
