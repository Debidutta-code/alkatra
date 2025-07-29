import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function useBookingNavigation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentBookingId = searchParams.get('id')
  
  const navigateToBooking = useCallback((bookingId: string) => {
    router.push(`/app/bookings?id=${bookingId}`)
  }, [router])
  
  const navigateToList = useCallback(() => {
    router.push('/app/bookings')
  }, [router])
  
  return {
    currentBookingId,
    navigateToBooking,
    navigateToList,
    isDetailView: !!currentBookingId
  }
}