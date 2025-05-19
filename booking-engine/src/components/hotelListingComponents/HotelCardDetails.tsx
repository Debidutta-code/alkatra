import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Star, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Define the Hotel interface
interface Hotel {
  _id: string;
  property_name: string;
  property_email: string;
  property_contact: string;
  star_rating: string;
  property_code: string;
  description: string;
  image: string[];
}

// Define the HotelCardDetailsProps interface
interface HotelCardDetailsProps {
  hotelData: {
    success: boolean;
    message: string;
    data: Hotel[];
  };
  onBookNow?: (hotelId: string) => void;
}

const HotelCardDetails: React.FC<HotelCardDetailsProps> = ({ hotelData, onBookNow }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showFullDescription, setShowFullDescription] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (hotelData?.data) {
      setHotels(hotelData.data);
    }
  }, [hotelData]);

  const fallbackImageUrl = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const toggleDescription = (hotelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFullDescription(prevState => ({
      ...prevState,
      [hotelId]: !prevState[hotelId]
    }));
  };

  const renderDescription = (description: string, hotelId: string) => {
    const words = description.split(' ');
    if (words.length <= 5) {
      return description;
    }

    if (showFullDescription[hotelId]) {
      return (
        <>
          {description}
          <span 
            className="text-tripswift-blue cursor-pointer font-tripswift-medium ml-1" 
            onClick={(e) => toggleDescription(hotelId, e)}
          > See Less</span>
        </>
      );
    }

    return (
      <>
        {words.slice(0, 5).join(' ')}...
        <span 
          className="text-tripswift-blue cursor-pointer font-tripswift-medium ml-1" 
          onClick={(e) => toggleDescription(hotelId, e)}
        > See More</span>
      </>
    );
  };

  const handleBookNowClick = (hotelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.setItem('property_id', hotelId);
    
    if (onBookNow) {
      onBookNow(hotelId);
    }
  };

  return (
    <div className="flex flex-wrap gap-6">
      {hotels.length > 0 ? (
        hotels.map((hotel) => (
          <Card
            key={hotel._id}
            className="w-full max-w-[800px] min-w-[300px] shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden bg-tripswift-off-white"
          >
            <div className="flex flex-col md:flex-row items-start justify-between">
              {/* Image Section */}
              <div className="relative h-64 w-full md:w-1/2">
                {hotel.image && hotel.image.length > 0 ? (
                  <Image
                    src={hotel.image[0]}
                    alt={hotel.property_name}
                    layout="fill"
                    objectFit="cover"
                    priority
                    className="rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                  />
                ) : (
                  <Image
                    src={fallbackImageUrl}
                    alt="Fallback Image"
                    layout="fill"
                    objectFit="cover"
                    priority
                    className="rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                  />
                )}
              </div>

              {/* Content Section */}
              <div className="flex flex-col p-4 w-full md:w-1/2">
                {/* Header */}
                <CardHeader className="p-0 mb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl font-tripswift-bold text-tripswift-black">
                      {hotel.property_name}
                    </CardTitle>
                    <div className="flex items-center bg-tripswift-blue/10 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-tripswift-medium text-tripswift-blue">
                        {hotel.star_rating || "N/A"}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                {/* Description */}
                <CardContent className="p-0 text-gray-600 text-sm space-y-2 font-tripswift-regular">
                  <p>{renderDescription(hotel.description, hotel._id)}</p>
                  <p>
                    <span className="font-tripswift-medium">Email:</span> {hotel.property_email}
                  </p>
                  <p>
                    <span className="font-tripswift-medium">Contact:</span> {hotel.property_contact}
                  </p>
                  <p>
                    <span className="font-tripswift-medium">Property Code:</span> {hotel.property_code}
                  </p>
                </CardContent>

                {/* Footer */}
                <CardFooter className="p-4 mt-auto flex justify-between items-center border-t border-gray-200 bg-tripswift-off-white">
                  {/* Updated Recently Section */}
                  <div className="flex items-center text-xs text-gray-500 font-tripswift-regular">
                    <Clock className="w-4 h-4 mr-1 text-tripswift-blue/60" />
                    <span>Updated Recently</span>
                  </div>

                  {/* Book Now Button */}
                  {onBookNow ? (
                    <button 
                      className="btn-tripswift-primary text-sm font-tripswift-medium px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
                      onClick={(e) => handleBookNowClick(hotel._id, e)}
                    >
                      Book Now
                    </button>
                  ) : (
                    <Link href={`/hotel?id=${hotel._id}`} passHref>
                      <button 
                        className="btn-tripswift-primary text-sm font-tripswift-medium px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
                        onClick={() => {
                          localStorage.setItem('property_id', hotel._id);
                        }}
                      >
                        Book Now
                      </button>
                    </Link>
                  )}
                </CardFooter>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <p className="text-gray-600 text-center w-full font-tripswift-regular">No hotels available.</p>
      )}
    </div>
  );
};

export default HotelCardDetails;