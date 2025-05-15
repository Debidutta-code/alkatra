/* eslint-disable react/jsx-key */
"use client";
import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useMemo } from "react";
import { CalenderIcon } from "../ui/CalenderIcon";
import { GuestIcon } from "../ui/GuestIcon";
import { Star } from "../ui/Star";
import Image from "next/image";
import { useDispatch, useSelector } from "@/Redux/store";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import { CiMicrophoneOn } from "react-icons/ci";

declare global {
  interface Window {
    Razorpay: any;
    webkitSpeechRecognition: any;
  }
}

const HotelDetailsCard = ({ data }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const query = useSearchParams();
  const propertyId = query.get("id");

  const router = useRouter();
  const dispatch = useDispatch();
  const authUser = useSelector((state: any) => state.authReducer.user);
  const accessToken = Cookies.get("accessToken");

  const roomPrice = Number(data?.map((item: any) => item.room_price))
  const roomID = String(data?.map((item: any) => item._id))

  const rating = 4.5;
  const bookingDateFrom = "2025-9-04";
  const bookingDateTo = "2025-09-24";
  const price = data.map((item: any) => item.room_price) || 0;
  const buttonText = "Book Now";

  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(<Star key={i} filled={rating > i} />);
  }

  const handlePayNowClick = async (payableAmount: any) => {
    const response = await axios.post(
      "http://localhost:8020/api/v1/payment/checkout",
      { amount },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    var options = {
      key: "rzp_test_mBBfOCZrMx5wNc",
      amount: response.data.data.order.amount,
      currency: "INR",
      name: "Trip Swift",
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: response.data.data.order.id,
      handler: function (response: any) {
        verifyPayment(response);
      },
      prefill: {
        name: "Gaurav Kumar",
        email: "gaurav.kumar@example.com",
        contact: "9437948060",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      }
    };
    var rzp1 = new window.Razorpay(options);
    rzp1.open();

    rzp1.on("payment.failed", function (response: any) {
      alert(response.error.code);
      alert(response.error.description);
      alert(response.error.source);
      alert(response.error.step);
      alert(response.error.reason);
      alert(response.error.metadata.order_id);
      alert(response.error.metadata.payment_id);
    });
  };

  async function verifyPayment(response: any) {
    const verify = await axios.post(
      "http://localhost:8020/api/v1/payment/verify",
      {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        roomData: data?.data?.roomData
      },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (verify.data.status === "success") {
      reserved_room("success");
    }
  }

  async function reserved_room(paymentStatus: string) {
    if (paymentStatus === "success") {
      let currentDate = new Date().toJSON().slice(0, 10);
      try {
        const requestData = {
          room: roomID,
          user: authUser._id,
          property: propertyId,
          amount: amount ? amount : roomPrice,
          booking_dates: currentDate,
          payment: "65804086a9317c837f044290",
          status: "pending",
          checkInDate: bookingDateFrom,
          checkOutDate: bookingDateTo,
        };

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/createreservation`, requestData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            }
          }
        );
        if (response.data.success) {
          console.log("Reservation created successfully");
          toast.success("Reservation created successfully");
          router.push("/my-trip");
        } else {
          console.error("Failed to create reservation:", response.data.error || "Unknown error");
        }
      } catch (error: any) {
        console.error("An error occurred:", error.message || "Unknown error");
      }
    } else {
      console.error("Payment failed. Please try again.");
    }
  }

  const handleMicClick = () => setIsListening((prev) => !prev);

  useEffect(() => {
    let recognition: any;
  
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
  
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setTranscript(transcript);
        console.log("Current transcript:", transcript);
      };
  
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };
    }
  
    if (isListening && recognition) {
      recognition.start();
    } else if (recognition) {
      recognition.stop();
      if (transcript.trim()) {
        console.log("Final transcript:", transcript);
        processCommand(transcript);
      }
    }
  
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, transcript]);
  
  const processCommand = async (content: string) => {
    try {
      console.log("Processing command:", content);
  
      // Initialize a JSON object to store the extracted command
      const commandData: { action?: string; originalText: string } = { originalText: content };
  
      // Check for keywords and set the action accordingly
      if (content.toLowerCase().includes('book')) {
        commandData.action = 'book';
      } else if (content.toLowerCase().includes('confirm') || content.toLowerCase().includes('final')) {
        commandData.action = 'confirm';
      }
  
      // Log the extracted command data
      console.log("Extracted command data:", commandData);
  
      // If no valid action found, use ChatGPT for interpretation
      if (!commandData.action) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `
                  Analyze the following user command and determine the intended action:
                  "${content}"
  
                  Respond with one of these actions:
                  - 'book': If the user wants to book or reserve a room
                  - 'confirm': If the user wants to finalize or confirm a booking
  
                  Only respond with one of the above words, nothing else.
                `,
              },
            ],
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const responseData = await response.json();
  
        // Log the full OpenAI response
        console.log("OpenAI response:", responseData);
  
        if (responseData.choices && responseData.choices.length > 0) {
          commandData.action = responseData.choices[0].message?.content?.trim().toLowerCase();
        }
      }
  
      // Proceed based on the final action determined
      if (commandData.action === 'book' || commandData.action === 'confirm') {
        try {
          await reserved_room("success");
          toast.success("Booking initiated based on your voice command.");
        } catch (error) {
          console.error("Error in reserving room:", error);
          toast.error("An error occurred while booking. Please try again.");
        }
      } else {
        console.warn("Unknown command or unable to process.");
        toast.error("Sorry, I couldn't understand that command. Please try again or use the on-screen options.");
      }
    } catch (error) {
      console.error("Error processing command:", error);
    }
  };
  
  

  return (
    <>
      <button
        onClick={handleMicClick}
        className={`mic-button text-xl text-black rounded-md flex items-center justify-center ${
          isListening ? "listening" : ""
        }`}
      >
        <CiMicrophoneOn size={44} color={"black"} style={{ backgroundColor: "white" }} />
        <div className="wave"></div>
        <div className="wave" style={{ animationDelay: '0.5s' }}></div>
        <div className="wave" style={{ animationDelay: '1s' }}></div>
      </button>
      
      <div className="prompt mt-2 text-s m-4">
        {isListening ? "Listening... Click again to stop." : "Speak to book your room"}
      </div>
      <div className="justify-between m-4">
        <div className="flex-1">
          {data?.map((item: any) => (
            <div key={item.id} className="flex flex-col justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.room_name}</h2>
              <p>{item.description}</p>
            </div>
          ))}
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-600 mr-2">{rating}</span>
            {stars}
            <span className="text-xs text-gray-600 ml-2">(251 ratings)</span>
          </div>
        </div>
        {data?.map((item: any, index: number) => (
          <div
            key={index}
            className="w-60 h-60 my-2 rounded-lg overflow-hidden"
          >
            <Image
              src={item.image[0]}
              alt="hotel image"
              height={800}
              width={400}
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        ))}
      </div>
      <div className="px-6 py-4 max-w-none md:w-full">
        <div className="flex items-center mb-6">
          <span className="text-gray-700 flex items-center">
            {
              data?.map((item: any) => (
                <div className="flex flex-col gap-4">
                  <div key={item.id} className="flex items-center font-semibold text-gray-700">
                    <p className=" mr-2 gap-2">Room Size: <span>{item.room_size}</span></p>
                    <p>{item.room_unit}</p>
                  </div>

                  <div className="font-semibold text-gray-700">
                    <p>Room View: <span>{item.room_view}</span></p>
                    <p>{item?.meal_plan}</p>
                  </div>
                  <p className="font-semibold text-gray-700">Smoking Policy: {item?.smoking_policy}</p>

                  <p className="font-semibold text-gray-700">Max Occupancy: <span>{item?.max_occupancy}</span></p>
                  <p className="font-semibold text-gray-700">Total Room: <span>{item?.total_room}</span></p>
                </div>
              ))
            }
          </span>
        </div>
        <div className="flex items-center mb-6">
          <span className="text-gray-700 font-bold flex items-center">
            <span className="mr-1">
              <GuestIcon />
            </span>
            {
              data?.map((item: any) => (
                <p key={item.id}>{item?.room_type}</p>
              ))
            }
          </span>
        </div>
        <div className="flex items-center mb-6">
          <span className="text-gray-700 font-bold flex items-center">
            <span className="mr-1">
              <CalenderIcon />
            </span>
            {bookingDateFrom} - {bookingDateTo}
          </span>
        </div>
      </div>

      <div className="px-6 py-1 md:flex md:items-center md:justify-around md:max-w-full md:space-x-6 space-y-4">
        <div className=" md:items-center md:space-x-8"> 
          <span className="text-gray-600 mr-2">
            Room Price:
          </span>
          <span className="text-lg text-gray-800 whitespace-nowrap">
            {
              data?.map((item: any, index: number) => (
                <p key={item.id}>Rs. {item?.room_price}</p>
              ))
            }
          </span>
        </div>
        
        <div className=" md:items-center md:space-x-8"> 
          <span className="text-gray-600 mr-2">
            Includes:
          </span>
          <span className="text-lg text-gray-800">
            {
              data?.map((item: any, index: number) => (
                <p key={item.id}>{item?.meal_plan}</p>
        ))
      }
    </span>
  </div>
  
  <div className=" md:items-center md:space-x-8"> 
    <span className="text-gray-600 mr-2 font-bold">Payable Amount:</span>
    <span className="text-lg font-bold text-gray-800 whitespace-nowrap"> {/* Prevents text from wrapping */}
      {
        data?.map((item: any, index: number) => (
          <p key={item.id}>Rs. {item?.room_price}</p>
        ))
      }
    </span>
  </div>
  
  <button
    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4 mt-4 md:mt-0"
    onClick={() => reserved_room("success")}
  >
    {buttonText}
  </button>
</div>




        {/* </div> */}
      {/* </div> */}

      {/* <div className="flex items-center justify-between mb-6">
            <span className="text-gray-600 mr-2">Instant discount:</span>
            <span className="text-sm text-gray-500">-{instantDiscount}</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-600 mr-2">Coupon discount:</span>
            <span className="text-sm text-gray-500">-{couponDiscount}</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-600 mr-2 font-bold">Payable Amount:</span>
            <span className="text-lg font-bold text-gray-800">{amount ? amount : roomPrice}</span>
          </div> */}

      <style jsx>{`
        .mic-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          width: 50px;
          height: 50px;
          cursor: pointer;
        }
        .mic-button:hover {
          transform: scale(1.1);
        }
        .wave {
          position: absolute;
          border: 2px solid gray;
          width: 100%;
          height: 100%;
          opacity: 0;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.1);
        }
        .listening .wave {
          animation: wave 2s linear infinite;
        }
        @keyframes wave {
          0% {
            transform: translate(-50%, -50%) scale(0.1);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    {/* </div> */}
    </>
  );
};

export default HotelDetailsCard;