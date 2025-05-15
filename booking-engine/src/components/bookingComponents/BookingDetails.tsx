export default function BookingDetails({ booking, amount }: any) {
    return (
        <div className="bg-white/20 backdrop-blur-lg p-6 rounded-lg shadow-lg mx-4">
            <h2 className="text-2xl font-bold text-gray-100 text-left mb-4">Booking Details</h2>
            <p className="text-lg text-gray-200">Amount Paid: <span className="font-semibold">${amount}</span></p>
            <p className="text-lg text-gray-200">Booking Status: <span className="font-semibold">{booking?.data?.bookingStatus}</span></p>
            <p className="text-lg text-gray-200">Hotel Name: <span className="font-semibold">{booking?.data?.hotel?.name}</span></p>
        </div>
    );
}