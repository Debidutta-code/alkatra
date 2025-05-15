"use client";
import Image from "next/image";
import React from "react";
import img from "../assets/TRIP-2.png";
import { usePathname } from "next/navigation";

type Props = {};

const Footer = (props: Props) => {
  const pathname = usePathname();
  
  const isFooterVisible = pathname !== "/my-trip" && pathname !== "/login" && pathname !== "/register";

  return (
    <>
      {isFooterVisible && (
        <div className="flex flex-col mt-10 bg-zinc-800 w-full py-6 px-6 md:px-12 text-white">
          <header className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Logo Section */}
            <div className="flex items-start">
              <Image src={img} width={170} height={20} alt="Logo" />
            </div>
  
            {/* Navigation Sections */}
            <div className="flex flex-col md:flex-row md:space-x-6 md:items-start"> 
              {/* Company Section */}
              <div className="flex flex-col p-2 cursor-pointer">
                <header className="text-lg font-semibold mb-4">Company</header>
                <div className="text-base mb-2 hover:underline">About Us</div>
                <div className="text-base mb-2 hover:underline">Why Choose Us</div>
                <div className="text-base mb-2 hover:underline">Pricing</div>
                <div className="text-base mb-2 hover:underline">Testimonial</div>
              </div>
  
              {/* Resources Section */}
              <div className="flex flex-col p-2 cursor-pointer">
                <header className="text-lg font-semibold mb-4">Resources</header>
                <div className="text-base mb-2 hover:underline">Privacy Policy</div>
                <div className="text-base mb-2 hover:underline">Terms and Conditions</div>
                <div className="text-base mb-2 hover:underline">Blog</div>
                <div className="text-base mb-2 hover:underline">Contact Us</div>
              </div>
  
              {/* Product Section */}
              <div className="flex flex-col p-2 cursor-pointer">
                <header className="text-lg font-semibold mb-4">Product</header>
                <div className="text-base mb-2 hover:underline">Project Management</div>
                <div className="text-base mb-2 hover:underline">Time Tracker</div>
                <div className="text-base mb-2 hover:underline">Time Schedule</div>
                <div className="text-base mb-2 hover:underline">Lead Generation</div>
              </div>
            </div>
          </header>
  
          {/* Subscription Section */}
          <div className="flex flex-col md:flex-row md:items-center mt-6 md:mt-0 w-full md:w-auto">
            <div className="flex flex-col md:flex-row w-full md:w-auto items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="border border-white rounded px-4 py-2 w-full md:w-64"
              />
              <button className="w-full md:w-auto bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition">
                Subscribe
              </button>
            </div>
          </div>
  
          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 space-y-4 md:space-y-0">
            <div className="hidden md:block w-full md:w-auto border-t border-white flex-grow"></div>
            <div className="text-center text-sm mt-2 md:mt-0 w-full md:w-auto">
              &copy; {new Date().getFullYear()} Trip-Swift
            </div>
            <div className="hidden md:block w-full md:w-auto border-t border-white flex-grow"></div>
          </div>
  
          {/* Centered Logo */}
          <div className="flex justify-center mt-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/4294504958fcd2d8667252c8fa1d77a75982cb6fde0890516d1d06b021368e47?apiKey=06bef42c624743a9888f5d8e0d15a6ad&"
              width={120}
              height={40}
              alt="Logo"
              className="object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;