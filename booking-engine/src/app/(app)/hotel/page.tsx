import RoomsPage from '@/components/AppComponent/RoomsPage'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense>
      <RoomsPage/>
    </Suspense>
  )
}

export default page;