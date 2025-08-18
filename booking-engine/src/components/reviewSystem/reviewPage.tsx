"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CustomerReviewForm() {
    const [formData, setFormData] = useState({
        reservationId: "",
        hotelCode: "",
        hotelName: "",
        userId: "",
        guestEmail: "",
        comment: "",
        rating: 0,
    });
    const { reservationId } = useParams();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleStarClick = (rating: number) => {
        // if user clicks the same star again → clear selection
        setFormData({ ...formData, rating: formData.rating === rating ? 0 : rating });
    };

    const handleCancel = () => {
        setFormData({
            reservationId: "",
            hotelCode: "",
            hotelName: "",
            userId: "",
            guestEmail: "",
            comment: "",
            rating: 0,
        });
        setMessage("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
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
            } else {
                setMessage(`❌ ${data.error || "Failed to submit review"}`);
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Something went wrong, please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!reservationId) return;
        const fetchReservation = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/review/get/reservation?reservationId=${reservationId}`
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch reservation data");
                }

                const data = await res.json();

                setFormData((prev) => ({
                    ...prev,
                    reservationId: data.reservationId,
                    hotelCode: data.hotelCode,
                    hotelName: data.hotelName,
                    userId: data.userId,
                    guestEmail: data.guestEmail,
                }));
            } catch (err) {
                console.error(err);
                setMessage("❌ Could not load reservation details.");
            }
        };

        fetchReservation();
    }, [reservationId]);

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-2xl mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-black">Leave Your Review</h2>

            {message && <div className="mb-4 text-center font-medium">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    type="text"
                    name="hotelName"
                    placeholder="Hotel Name"
                    value={formData.hotelName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />



                <input
                    type="email"
                    name="guestEmail"
                    placeholder="Guest Email"
                    value={formData.guestEmail}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />

                <textarea
                    name="comment"
                    placeholder="Your comments..."
                    value={formData.comment}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />

                {/* ⭐ Star Rating */}
                <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            type="button"
                            key={star}
                            onClick={() => handleStarClick(star)}
                            className={`text-3xl ${formData.rating >= star ? "text-yellow-400" : "text-gray-300"
                                }`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-gray-300 text-black py-2 rounded hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
