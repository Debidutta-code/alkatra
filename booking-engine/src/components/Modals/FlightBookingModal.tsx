'use client'
import { Button } from "@/components/ui/flight-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/flight-ui/dialog";
import { ScrollArea } from "@/components/ui/flight-ui/scroll-area";
import { Share2, Luggage, Info } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Data } from "@/store";
import { useFlightOffersStore } from "../context/flight-offers-provider";

interface Amenity {
  amenityType: string;
  description: string;
}

interface FareSegment {
  amenities?: Amenity[];
}

interface TravelerPricing {
  fareDetailsBySegment: FareSegment[];
}

interface FlightBookingModalProps {
  isOpen: boolean;
  setOpenViewDetailModal: React.Dispatch<React.SetStateAction<boolean>>;
  flight: Data;
  dictionaries: Record<string, any>;
  isReturnType: boolean;
}

export default function FlightBookingModal({
  isOpen,
  setOpenViewDetailModal,
  flight,
  dictionaries,
  isReturnType,
}: FlightBookingModalProps) {
  const router = useRouter();
  const { setSelectedFlight } = useFlightOffersStore((state) => state);

  const handleSelectFlight = (flight: Data) => {
    setSelectedFlight(flight);
    router.push("/checkout");
  };

  const isDirect = flight.itineraries?.at(0)?.segments.length === 1;

  const formatDuration = (duration: string) => {
    return duration.replace(
      /PT(\d+)H(\d+)M/,
      (_: string, h: string, m: string) => `${h}h ${m}m`
    );
  };

  const renderSegment = (seg: any) => (
    <div className="mt-8 space-y-2" key={seg.id}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">
            {format(new Date(seg?.departure?.at), "dd MMM")} ·{" "}
            {format(new Date(seg?.departure?.at), "HH:mm")}
          </p>
          <p className="text-sm">{seg?.departure?.iataCode}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {dictionaries.carriers[seg.carrierCode]}
          </p>
          <p className="text-sm text-gray-500">
            {seg?.aircraft?.code} · Economy
          </p>
          <p className="text-sm text-gray-500">
            Flight time{" "}
            {formatDuration(seg.duration)}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">
            {format(new Date(seg?.arrival?.at), "dd MMM")} ·{" "}
            {format(new Date(seg?.arrival?.at), "HH:mm")}
          </p>
          <p className="text-sm">{seg?.arrival?.iataCode}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setOpenViewDetailModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Your flight to{" "}
            {flight.itineraries?.at(0)?.segments?.at(-1)?.arrival?.iataCode}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[80vh] pr-4">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-blue-600 cursor-pointer">
              <Share2 className="h-4 w-4" />
              <span>Share this flight</span>
            </div>

            {/* Outbound Flight */}
            <div>
              <h3 className="font-semibold">
                Flight to{" "}
                {flight.itineraries?.at(0)?.segments?.at(-1)?.arrival?.iataCode}
              </h3>
              <p className="text-sm text-gray-500">
                {isDirect
                  ? "Direct Flight"
                  : formatDuration(flight?.itineraries?.at(0)?.duration || "")}
              </p>

              {flight.itineraries?.at(0)?.segments?.map((seg: any) => 
                renderSegment(seg)
              )}
            </div>

            {/* Return Flight */}
            {isReturnType && (
              <div>
                <h3 className="font-semibold">
                  Flight to{" "}
                  {flight.itineraries?.at(-1)?.segments?.at(-1)?.arrival?.iataCode}
                </h3>
                <p className="text-sm text-gray-500">
                  {isDirect
                    ? "Direct Flight"
                    : formatDuration(flight?.itineraries?.at(-1)?.duration || "")}
                </p>

                {flight.itineraries?.at(-1)?.segments?.map((seg: any) => 
                  renderSegment(seg)
                )}
              </div>
            )}

            {/* Baggage */}
            <div>
              <h3 className="font-semibold">Included baggage</h3>
              <p className="text-sm text-gray-500">
                The total baggage included in the price
              </p>
              {flight?.travelerPricings?.at(0)?.fareDetailsBySegment?.map((fareSeg: FareSegment, fareSegIndex: number) => {
                const baggageAmenities = fareSeg?.amenities?.filter(
                  (amenity) => amenity?.amenityType === "BAGGAGE"
                ) || [];

                return baggageAmenities.map((amenity: Amenity, amenityIndex: number) => (
                  <div className="mt-2 space-y-2" key={`${fareSegIndex}-${amenityIndex}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Luggage className="h-4 w-4" />
                        <span className="text-sm">{amenity?.description}</span>
                      </div>
                      <span className="text-sm text-green-600">Included</span>
                    </div>
                  </div>
                ));
              })}
            </div>

            {/* CO2 emissions */}
            <div>
              <h3 className="font-semibold flex items-center space-x-1">
                <span>CO2e emissions estimate</span>
                <Info className="h-4 w-4" />
              </h3>
              <p className="text-sm">Typical for this route</p>
            </div>

            {/* Price and Select */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold">
                  {flight.price?.currency} {flight.price?.total}
                </span>
                <Info className="h-4 w-4" />
              </div>
              <Button onClick={() => handleSelectFlight(flight)}>
                Select
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}