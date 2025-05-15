import React from "react";
import DropdownComponents from "../ui/dropdown/DropDown";
import PriceRange from "../ui/priceRange/PriceRange";
import HotelListingBox from "./HotelListingBox";
import { keys } from "@mantine/core";

type Props = {};

const HotelList = (props: Props) => {
  const dynamicDropdownItems = [
    "Popularity",
    "Ratings",
    "Price high to low",
    "Price low to high",
  ];

  const renderHotelList = () => {
    const preview = [];
    for (let i = 0; i < 8; i++) {
      preview.push(<HotelListingBox key={i} />);
    }
    return preview;
  };

  return (
    <div>
      {/* <div></div> */}
      <div className="grid grid-rows-3 grid-flow-col mt-4 gap-4">
        <div className="row-span-1 col-span-1 sticky min-h-min top-[50px]  p-5 ">
          <h1 className="text-2xl font-bold  text-red-600 mb-9">Filters</h1>
          <div>
            <PriceRange />
          </div>
        </div>
        {/* <div className="col-span-1 border">02</div> */}
        <div className="row-span-3 col-span-4 ">
          <div className="border-b  p-3 px-6 flex justify-between">
            <h1 className="text-2xl font-bold mt-2">Hotels in Puri</h1>
            <span className="flex">
              <h1 className="items-center text-sm mt-3 mr-3 ">Sort by</h1>
              <DropdownComponents dropdownItems={dynamicDropdownItems} />
            </span>
          </div>
          <div className="  mt-3 mb-4">{renderHotelList()}</div>
        </div>
      </div>
    </div>
  );
};

export default HotelList;
