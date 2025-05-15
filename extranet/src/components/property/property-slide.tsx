"use client";
import React from "react";
import Image from "next/image";

import {
  Card as NextUICard,
  CardFooter as NextUICardFooter,
  Button as NextUIButton,
  Tooltip,
} from "@nextui-org/react";
import { Property } from "../../redux/slices/propertySlice";
import { useRouter } from "next/navigation";

type ActionFunction = () => void;
type Props = {
  sliderContentCount?: number;
  properties: Property[];
};

export default function PropertySlide({
  sliderContentCount = 4,
  properties,
}: Props) {
  const router = useRouter();

  const handleViewProperty = (propertyId: string) => {
    // console.log("Navigating to property details page:", propertyId);
    router.push(`/app/property/${propertyId}`);
  };

  return (
    <>
      {properties?.map((property: Property, index: number) => (
        <PropertyCard
          key={`${property.property_email + index}`}
          property={property}
          action={() => handleViewProperty(property._id)}
        />
      ))}
    </>
  );
}

function PropertyCard({
  property,
  action,
}: {
  property: Property;
  action: ActionFunction;
}) {
  // console.log("Property object:", property);

  return (
    <NextUICard isFooterBlurred radius="lg" className="border-none min-w-max ">
      <Image
        src={property?.image[0] ? property?.image[0] : '/assets/Dummy-prop-img.jpg'}
        height={300}
        width={300}
        className="object-cover"
        alt="Property"
      />

      <NextUICardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
        <div>
          <p className="text-tiny text-white/100">{property?.property_name}</p>
          <p></p>
        </div>
        <NextUIButton
          className="text-tiny text-white bg-black/20 "
          variant="flat"
          color="default"
          radius="lg"
          size="sm"
          onClick={action}
        >
          View
        </NextUIButton>
      </NextUICardFooter>
    </NextUICard>
  );
}
