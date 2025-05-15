import React from "react";
import Power from "@/components/assets/car-battery.png";
import Parking from "@/components/assets/car.png";
import Wifi from "@/components/assets/wifi.png";
import Star from "@/components/assets/star-2.png";
import Image from "next/image";
import Link from "next/link";
// import HotelImage from "./HotelImage";

type Props = {};

const HotelListingBox = (props: Props) => {
  return (
    <>
      <div className="flex  mb-3 mt-2">
        <div className="w-[350px] border   border-red-500 h-[280px]">
          {/* <HotelImage /> */}
          image
        </div>
        <div className="flex-1">
          <div className=" p-4">
            <h1 className="text-2xl font-bold">Le-merdin</h1>
            <p className="text-sm ">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis,
              dolorem!
            </p>
          </div>
          <div className="p-5">
            <div className="flex mb-4 items-center">
              <p className="bg-green-500 flex items-center w-12 text-sm text-white mr-3 mb-3">
                4.5
                <span className="ml-1">
                  <Image className="" src={Star} alt={""} />
                </span>
              </p>
              <p className="text-sm  text-gray-400">super good</p>
            </div>
            <div className="flex items-center gap-7 text-sm list-none">
              <li className="flex items-center">
                <Image src={Wifi} alt={""} className="mr-2" /> free wifi
              </li>
              <li className="flex items-center">
                <Image src={Parking} alt={""} className="mr-2" />{" "}
                <span>parking</span>
              </li>
              <li className="flex items-center">
                <Image src={Power} alt={""} className="mr-2" /> power backup
              </li>
            </div>
          </div>

          <div className="flex items-center px-5 mr-11">
            <div className="">
              <h1 className="text-2xl text-red-500 font-bold">₹ 2320</h1>
              <p className="text-xs py-1 text-gray-400">
                + ₹315 taxes & fees · per room per night
              </p>
            </div>
            <div className="flex items-center ml-auto space-x-4">
              <Link href={"/booking"}>
                <button className="bg-red-500 text-white p-3 rounded-md">
                  See Details
                </button>
              </Link>

              <button className="bg-red-500 text-white p-3 rounded-md">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </>
  );
};

export default HotelListingBox;
