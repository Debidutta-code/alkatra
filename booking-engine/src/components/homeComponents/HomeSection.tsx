import React from 'react'
// import { ExploreDestinations } from '../Sections/ExploreDestinations'
// import { PopularHotels } from '../Sections/PopularHotels'
// import { FeaturedOffers } from '../Sections/FeaturedOffers'
import { Destination } from '../Sections/Destination'


const HomeSection = () => {
  return (
    <div>
      <div className="mt-8">
      <Destination/>
        {/* <FeaturedOffers />
        <PopularHotels />
        <ExploreDestinations /> */}
      </div>
    </div>
  )
}

export default HomeSection