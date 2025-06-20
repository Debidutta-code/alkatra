import { useEffect, useState } from 'react'
import axios from 'axios';

export const useFetchBookingData = () => {
    const [bookData, setBookData] = useState({
        property: "",
        room: "",
        user: "",
        booking_user_name: "",
        booking_user_email: "",
        booking_user_phone: "",
        amount: "",
        payment: "",
        booking_dates: "",
        status: "",
        checkInDate: "",
        checkOutDate: "",
        reviews: ""
    });
    const [bookDataloading, setBookDataloading] = useState(true);
    const [bookDataError, setBookDataError] = useState(null);

    // useEffect(() => {
    //     const fetchBookingData = async () => {
    //         setBookDataloading(true);
    //         try {
    //             const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/getBookingData`);
    //             setBookData(response.data);
    //         } catch (err: any) {
    //             setBookDataError(err.message);
    //         } finally {
    //             setBookDataloading(false);
    //         }
    //     };

    //     fetchBookingData();
    // }, []);

    return { bookData, bookDataloading, bookDataError };
}