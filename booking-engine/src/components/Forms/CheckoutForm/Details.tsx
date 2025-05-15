"use client";
import { Button } from "@/components/ui/flight-ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { Checkbox } from "@/components/ui/flight-ui/checkbox";
import { Input } from "@/components/ui/flight-ui/input";

import { Label } from "@/components/ui/flight-ui/label";
import { LuLuggage, LuBriefcase } from "react-icons/lu";
import { useState } from "react";
import TravelerInfoModal from "@/components/Modals/TravelerInfoModal";
import { useFlightOffersStore } from "@/components/context/flight-offers-provider";
import { FormState, Traveler } from "@/store";
import { Luggage , Check } from "lucide-react";

export default function Details({
  form,
  setForm,
}: {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  const [openTravelerInfoModal, setOpenTravelerInfoModal] =
    useState<boolean>(false);

  const { selectedFlight, setSelectedFlight, flightOffers , travelers } =
    useFlightOffersStore((state) => state);

    console.log("))))))))))))" , selectedFlight)
  const [selectedTraveler, setSelectedTraveler] = useState({})

  const isDirect = selectedFlight?.itineraries?.at(0)?.segments?.length === 0;
  const isReturnType = selectedFlight?.itineraries.length > 0

  return (
    <div className="container md:mx-auto md:p-4">
      {selectedFlight?.travelerPricings.map((traveler)=>{
       return <Card className="shadow-none mb-4" key={traveler.travelerId}>
        <CardContent>
          
          {/* Use grid with 3 columns */}
          <div className="">
            {/* Left side: Form section */}

            
            <div className="mt-5">
              <h2 className="text-xl font-semibold mb-4">
                Fill in your details
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Add traveller details and review baggage options
              </p>

              {/* Traveler details */}
              <div className="mb-6 relative">
                <h3 className="text-lg font-semibold mb-2">
                {travelers.find((t) => t.id === traveler.travelerId)?.name?.firstName || traveler.travelerType}
                </h3>
                {travelers.find((t) => t.id === traveler.travelerId)?.name?.firstName && <Check className="absolute top-0 right-0 text-green-500"/>}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedTraveler(traveler)
                    setOpenTravelerInfoModal(true)}}
                >
                  Add this traveller&apos;s details
                </Button>
              </div>


              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">
                  Flight to{" "}
                  {
                    selectedFlight?.itineraries.at(0)?.segments?.at(-1)?.arrival
                      ?.iataCode
                  }
                </h3>
                {selectedFlight?.travelerPricings
                ?.at(0)
                ?.fareDetailsBySegment.map((fareSeg: any) => {
                  const baggageAmenities = fareSeg?.amenities?.filter(
                    (amenity: any) => amenity.amenityType === "BAGGAGE"
                  );

                  return baggageAmenities.map((amenity: any, index: number) => (
                    <div className="mt-2 space-y-2" key={index}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Luggage className="h-4 w-4" />
                          <span className="text-sm">{amenity.description}</span>
                        </div>
                        <span className="text-sm text-green-600">Included</span>
                      </div>
                    </div>
                  ));
                })}
              </div>

              <Separator className="my-6" />

              {isReturnType && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Flight to {
                    selectedFlight?.itineraries.at(-1)?.segments?.at(-1)?.arrival
                      ?.iataCode
                  }</h3>
                  {selectedFlight?.travelerPricings
                ?.at(-1)
                ?.fareDetailsBySegment.map((fareSeg: any) => {
                  const baggageAmenities = fareSeg.amenities.filter(
                    (amenity: any) => amenity.amenityType === "BAGGAGE"
                  );

                  return baggageAmenities.map((amenity: any, index: number) => (
                    <div className="mt-2 space-y-2" key={index}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Luggage className="h-4 w-4" />
                          <span className="text-sm">{amenity.description}</span>
                        </div>
                        <span className="text-sm text-green-600">Included</span>
                      </div>
                    </div>
                  ));
                })}
                </div>
              )}

              <Separator className="my-6" />

              {/* Contact details */}
            </div>

            {/* Right side: Ticket details section */}
          </div>
        </CardContent>
      </Card>
      })}
      
      {/* {selectedFlight?.travelerPricings.map((_, index) => (
        
      ))} */}
      <TravelerInfoModal
          selectedTraveler = {selectedTraveler}
          setOpenTravelerInfoModal={setOpenTravelerInfoModal}
          openTravelerInfoModal={openTravelerInfoModal}
          form={form}
          setForm={setForm}
        />
    </div>
  );
}
