import RoomsPage from '@/components/AppComponent/RoomsPage'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div>Loading rooms...</div>}>
      <RoomsPage />
    </Suspense>

  )
}

export default page;