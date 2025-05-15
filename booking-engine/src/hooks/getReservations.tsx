import axios from 'axios'
import React, { useEffect, useState } from 'react'

// export interface Booking {
//     _id: string,
//     room: string,
//     user: string,
//     property: string,
//     amount: number,
//     booking_dates: Date,
//     payment: string,
//     status: string,
//     checkInDate: string,
//     checkOutDate: string,
//     createdAt: string,
//     updatedAt: string,
//     __v?: number
// }

export const GetReservationsOfUser = (reservation_id: string) => {
    const [reservation, setReservation] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const getReservations = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/getUserReservations/${reservation_id}`)
            setReservation(response.data.bookings)
        } catch (error: any) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getReservations()
    }, [reservation_id])

    return { reservation, error, loading }
}