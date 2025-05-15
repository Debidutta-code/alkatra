'use client'
import React, { useEffect } from 'react'

import { useFlightOffersStore } from "@/components/context/flight-offers-provider";
import { Button } from './button';
import axios, { isAxiosError } from 'axios';
import { FlightOffersResponseRoot } from '@/store';

const Filters = () => {
    const { setFlightOffers, flightOffers, setLoading, setSearched, searched, searchForm, filterState, updateFilterStateField } =
        useFlightOffersStore((state) => state);

    const [loading, setLoadingState] = React.useState(false);

    useEffect(() => {
        updateFilterStateField("directFlight", searchForm.directFlight);
    }, []);

    useEffect(() => {
        console.log("filter state", filterState);
    }, [filterState]);

    const handleAirlines = (airline: string) => {
        const airlineArray = [...filterState.includedAirlines];
        const index = airlineArray.indexOf(airline);

        if (index > -1) {
            airlineArray.splice(index, 1);
        } else {
            airlineArray.push(airline);
        }
        updateFilterStateField("includedAirlines", airlineArray);
    }

    const handleApply = async () => {
        setLoadingState(true); // Start loading

        try {
            const response = (await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL_AIRLINE}/flights/flight-offers`, {
                params: {
                    originLocationCode: searchForm.origin.value,
                    destinationLocationCode: searchForm.destination.value,
                    departureDate: searchForm.departureDate,
                    adults: searchForm.adult,
                    children: searchForm.child,
                    returnDate: searchForm.returnDate,
                    travelClass: searchForm.travelClass,
                    nonStop: filterState.directFlight,
                    includedAirlineCodes: filterState.includedAirlines.join(",")
                },
            })) as { data: FlightOffersResponseRoot };
            setFlightOffers(response.data);

            if (!searched) setSearched(true);
        } catch (error) {
            console.error("Error submitting form:", error);
            if (isAxiosError(error)) {
                console.error("Error message:", error.response?.data?.message);
            }
        } finally {
            setLoadingState(false); 
        }
    }

    return (
        <div className='w-full rounded-md border p-2'>
            <p className='text-lg font-semibold tracking-wider'>Filters</p>
            <p className='text-tiny tracking-wide font-light'>Showing {flightOffers?.data?.data?.length} results</p>

            <div className="mt-10">
                <h2 className='text-lg font-semibold tracking-wider'>Stops</h2>
                <div className="pl-2 mt-3 flex flex-col gap-2">
                    <div className="">
                        <input type="radio" name="stops" id="any" checked={!filterState.directFlight} className='scale-200 mr-3' onChange={(e) => e.target.checked === true ? updateFilterStateField("directFlight", false) : null} />
                        <label htmlFor="any">Any</label>
                    </div>
                    <div className="">
                        <input type="radio" name="stops" id="nonStop" className='scale-200 mr-3' checked={filterState.directFlight} onChange={(e) => e.target.checked === true ? updateFilterStateField("directFlight", true) : null} />
                        <label htmlFor="nonStop">1 Stop Max</label>
                    </div>
                </div>
            </div>

            <div className="my-10">
                <h2 className='text-lg font-semibold tracking-wider'>Airlines</h2>
                <div className="pl-2 mt-3 flex flex-col gap-2">
                    <div className="">
                        <input type="checkbox" name="indigo" value="6E" id="indigo" className='scale-200 mr-4' onChange={(e) => handleAirlines(e.target.value)} />
                        <label htmlFor="indigo">Indigo</label>
                    </div>
                    <div className="">
                        <input type="checkbox" name="airIndia" value="AI" id="airIndia" className='scale-200 mr-4' onChange={(e) => handleAirlines(e.target.value)} />
                        <label htmlFor="airIndia">Air India</label>
                    </div>
                    <div className="">
                        <input type="checkbox" name="akasaAir" value="QP" id="akasaAir" className='scale-200 mr-4' onChange={(e) => handleAirlines(e.target.value)} />
                        <label htmlFor="akasaAir">Akasa Air</label>
                    </div>
                    <div className="">
                        <input type="checkbox" name="vistara" value="UK" id="vistara" className='scale-200 mr-4' onChange={(e) => handleAirlines(e.target.value)} />
                        <label htmlFor="vistara">Vistara</label>
                    </div>
                    <div className="">
                        <input type="checkbox" name="airAsiax" value="D7" id="airAsiax" className='scale-200 mr-4' onChange={(e) => handleAirlines(e.target.value)} />
                        <label htmlFor="airAsiax">Air Asiax</label>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <Button onClick={handleApply} disabled={loading}>
                    {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 1116 0A8 8 0 014 12z" />
                            </svg>
                            Loading...
                        </span>
                    ) : (
                        "Apply"
                    )}
                </Button>
            </div>
        </div>
    )
}

export default Filters;
