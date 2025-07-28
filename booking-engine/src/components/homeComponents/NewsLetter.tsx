// "use client";
// import React, { useState } from "react";

// const Newsletter = () => {
//   const [email, setEmail] = useState("");

//   const handleSubscribe = () => {
//     // You can add your subscription logic here
//     console.log(`Subscribed with email: ${email}`);
//     // Reset the email input after subscription
//     setEmail("");
//   };

//   return (
//     <div className="flex justify-between items-center w-[80%] mx-auto mt-14 border p-6 bg-white rounded-md shadow-md">
//       <h2 className="text-2xl font-semibold mb-4">
//         Get access to exclusive deals
//       </h2>
//       {/* <p className="text-gray-600 mb-6">
//         Only the best deals reach your inbox{" "}
//       </p> */}
//       <div className="flex items-center justify-end">
//         <input
//           type="email"
//           placeholder="Your Email"
//           className="px-4 py-2 mr-2 border rounded-md focus:outline-none"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <button
//           onClick={handleSubscribe}
//           className="bg-[#D80032] text-white px-6 py-2 rounded-md hover:bg-red-500 focus:outline-none"
//         >
//           Notify Me
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Newsletter;
