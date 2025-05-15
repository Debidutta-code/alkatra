import React from "react";
import Image from "next/image";
import Img from "@/components/assets/hotel-1.jpg";
import Battery from "@/components/assets/battery.png";
import AC from "@/components/assets/air-conditioner.png";
import TV from "@/components/assets/smart-tv.png";
import Wifi from "@/components/assets/wifi.png";

type Props = {};

const ReviewBooking = (props: Props) => {
  return (
    <>
      <div className="bg-[#EF0107] ">
        <h1 className="mx-44 text-white font-bold text-3xl py-4 ">
          Booking status
        </h1>
      </div>
      <div className="mx-44 ">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2  mt-1 ">
            <div className="border shadow-xl rounded-md">
              <div className="border-b-2 p-4 flex items-start">
                <div className="">
                  <h1 className="text-3xl font-bold mt-4">Hotel Le-Merdian</h1>
                  <p className="mt-6 text-gray-400">
                    Near Bankimuhan, C.T. Road, Puri, Odisha- 752002, Puri,
                    India
                  </p>
                </div>
                <div className="flex flex-col items-end ml-56">
                  <Image src={Img} width={200} height={100} alt="hotel image" />
                </div>
              </div>
              <div className="bg-[#FAFAFA] border-b-2   p-6 ">
                <div className=" flex">
                  <div className="flex-1 ">
                    <h1 className="text-gray-400">CHECK-IN</h1>
                    <h2 className="text-gray-400">
                      Tue <b className="text-2xl text-black">28 NOV</b> 2023
                      <span className="ml-9 border bg-white rounded-2xl px-2 ">
                        2 nights
                      </span>
                    </h2>

                    <h1>9AM</h1>
                  </div>
                  <div className="flex-1 ml-3">
                    <h1 className="text-gray-400">CHECK-OUT</h1>

                    <h2 className="text-gray-400">
                      Tue <b className="text-2xl text-black">29 NOV</b> 2023
                    </h2>
                    <h1>9PM</h1>
                  </div>
                  <div className="flex-1 mt-7 text-xl">
                    <h2>
                      <b>1 </b>Room <b>2 </b>Guests
                    </h2>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-6 ">
                <h1 className="font-bold text-2xl">Description</h1>
                <p className="mt-3 text-gray-400">
                  Hotel Le-Merdian is located in Puri, 3 km from Sri Jagannatha
                  Temple Puri and 2 km from Golden Beach. The hotel offers a car
                  parking facility, kitchen as well as dining area.
                </p>
              </div>
              {/* amenities */}
              <div className="p-6">
                <h1 className="text-2xl  font-bold">Amenities</h1>
                <div className="flex gap-32 mt-6 ">
                  <p className="flex gap-2">
                    <span className="mt-1 w-5">
                      <Image src={AC} alt={""} />
                    </span>
                    Ac
                  </p>
                  <p className="flex gap-2">
                    <span className="mt-1 w-5">
                      <Image src={TV} alt={""} />
                    </span>
                    TV
                  </p>
                  <p className="flex gap-2">
                    <span className="mt-1 w-5">
                      <Image src={Wifi} alt={""} />
                    </span>
                    Free Wifi
                  </p>
                  <p className="flex gap-2">
                    <span className="mt-1 w-5">
                      <Image src={Battery} alt={""} />
                    </span>
                    Power Backup
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h1 className="text-2xl  font-bold">Hotel policies</h1>
                <div className="mt-3 text-gray-400 ">
                  <ul className="list-disc p-2 pl-4 ml-4">
                    <li>
                      Guests can check in using any local or outstation ID proof
                      (PAN card not accepted).
                    </li>
                    <li>
                      This hotel is serviced under the trade name of MSM as per
                      quality standards of Yoo.
                    </li>
                  </ul>
                  <p></p>
                  <p></p>
                </div>
              </div>
            </div>
            {/* <div className="border-2 mt-9 border-green-600"></div> */}
          </div>
          <div className="col-span-1 ml-8  ">
            <div className="border flex shadow-xl rounded-md mt-1 sticky top-14 justify-between p-6 ">
              <div className="flex flex-col gap-4">
                <h1 className="font-bold text-2xl">Price </h1>
                <h1>1 Room 2 Guests</h1>

                <h1 className="text-green-400">Total discount</h1>

                <h1>Taxes & Service Fees</h1>

                <h1>Total Amount</h1>
              </div>
              <div className="flex flex-col text-right gap-4 ">
                {/* <h1></h1>
                <h1></h1> */}
                <br />
                <h1>
                  <span>₹2000</span>
                </h1>
                {/* discount price */}
                <h1>
                  <span className="text-green-400">₹600</span>
                </h1>
                <h1>
                  <span>₹400</span>
                </h1>
                <h1>
                  <span>₹1800</span>
                </h1>
              </div>
            </div>
            <div className="border p-4  flex rounded-md shadow-md justify-center transition hover:bg-red-600  bg-[#EF0107]  sticky top-80 mt-4">
              <button className="text-2xl text-white font-bold">Pay Now</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewBooking;
