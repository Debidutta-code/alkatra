'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import BookingsList from './Components/BookingsList'
import BookingDetailsClient from './Components/BookingDetailsClient'
import { Triangle } from "react-loader-spinner"

function BookingsContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')

  // If bookingId exists in query params, show details
  if (bookingId) {
    return <BookingDetailsClient bookingId={bookingId} />
  }

  // Otherwise show the bookings list
  return <BookingsList />
}

function LoadingFallback() {
  return (
    <div className="min-h-screen md:mx-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container px-4 py-4 mx-auto sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center py-24">
          <Triangle
            visible={true}
            height={80}
            width={80}
            color="#076DB3"
            ariaLabel="triangle-loading"
          />
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookingsContent />
    </Suspense>
  )
}