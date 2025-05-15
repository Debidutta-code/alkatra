import React from 'react'
import { ExploreDestinations } from '../Sections/ExploreDestinations'
import { PopularHotels } from '../Sections/PopularHotels'
import { FeaturedOffers } from '../Sections/FeaturedOffers'

const HomeSection = () => {
  return (
    <div>
      <div className="mt-8">
        <FeaturedOffers />
        <PopularHotels />
        <ExploreDestinations />
      </div>
    </div>
  )
}

export default HomeSection