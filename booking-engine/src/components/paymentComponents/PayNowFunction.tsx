"use client";
import axios from "axios";
import React from "react";

type Props = {};

const PayNowFunction = (props: Props) => {
  const handlePayNowClick = async () => {
    console.log(">>>>>>>>>>>>>>>>>>>");

    try {
      const response = await axios.post(
        "http://localhost:8010/payment/checkout",
        { amount: 20 },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response, ">>>>>>>>>>>>>>>>>>>.");

      var options = {
        key: "rzp_test_mBBfOCZrMx5wNc", // Enter the Key ID generated from the Dashboard
        amount: response.data.data.order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "Tripswift", // your business name
        description: "Test Transaction",
        image: "https://example.com/your_logo",
        order_id: response.data.data.order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: function (response: any) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>start>>>>>>.');
          verifyPayment(response);
        },
        prefill: {
          // We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
          name: "Gaurav Kumar", // your customer's name
          email: "gaurav.kumar@example.com",
          contact: "9437948060", // Provide the customer's phone number for better conversion rates
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      // @ts-ignore
      var rzp1 = new Razorpay(options);
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
    } catch (error) {
      console.error("An error occurred during payment processing:", error);
    }
  };

  async function verifyPayment(response: any) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>start2>>>>>>.');

    try {
      const verify = await axios.post(
        "http://localhost:8010/payment/verify",
        {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(verify, ">>>>>>>>>>>>>>>>>>>>>>>>>>.");
    } catch (error) {
      console.error("An error occurred during payment verification:", error);
    }
  }

  return (
    <div className="flex justify-center items-center mt-2">
      <button className="bg-red-600 text-white p-4" onClick={handlePayNowClick}>
        Pay Now
      </button>
    </div>
  );
};

export default PayNowFunction;


// "use client";
// import axios from "axios";
// import React from "react";
// import { v4 as uuidv4 } from "uuid"; // Add this package via npm install uuid
// import { useRouter } from "next/navigation";

// type Props = {};

// const PayNowFunction = (props: Props) => {
//   const router = useRouter();

//   const handlePayNowClick = async () => {
//     console.log(">>>>>>>>>>>>>>>>>>>");

//     try {
//       const response = await axios.post(
//         "http://localhost:8010/payment/checkout",
//         { amount: 20 },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log(response, ">>>>>>>>>>>>>>>>>>>.");

//       // Generate a unique booking token
//       const bookingToken = uuidv4();
      
//       // Store in sessionStorage for verification later
//       sessionStorage.setItem("pendingBookingToken", bookingToken);

//       var options = {
//         key: "rzp_test_mBBfOCZrMx5wNc", // Enter the Key ID generated from the Dashboard
//         amount: response.data.data.order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
//         currency: "INR",
//         name: "Tripswift", // your business name
//         description: "Test Transaction",
//         image: "https://example.com/your_logo",
//         order_id: response.data.data.order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
//         handler: function (response: any) {
//           console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>start>>>>>>.');
//           verifyPayment(response, bookingToken);
//         },
//         prefill: {
//           // We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
//           name: "Gaurav Kumar", // your customer's name
//           email: "gaurav.kumar@example.com",
//           contact: "9437948060", // Provide the customer's phone number for better conversion rates
//         },
//         notes: {
//           address: "Razorpay Corporate Office",
//         },
//         theme: {
//           color: "#3399cc",
//         },
//       };

//       // @ts-ignore
//       var rzp1 = new Razorpay(options);
//       rzp1.open();

//       rzp1.on("payment.failed", function (response: any) {
//         // Clear the pending token if payment fails
//         sessionStorage.removeItem("pendingBookingToken");
        
//         alert(response.error.code);
//         alert(response.error.description);
//         alert(response.error.source);
//         alert(response.error.step);
//         alert(response.error.reason);
//         alert(response.error.metadata.order_id);
//         alert(response.error.metadata.payment_id);
//       });
//     } catch (error) {
//       console.error("An error occurred during payment processing:", error);
//     }
//   };

//   async function verifyPayment(response: any, bookingToken: string) {
//     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>start2>>>>>>.');

//     try {
//       const verify = await axios.post(
//         "http://localhost:8010/payment/verify",
//         {
//           razorpay_payment_id: response.razorpay_payment_id,
//           razorpay_order_id: response.razorpay_order_id,
//           razorpay_signature: response.razorpay_signature,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log(verify, ">>>>>>>>>>>>>>>>>>>>>>>>>>.");
      
//       // If verification is successful, redirect to success page with token
//       if (verify.data.success) {
//         const searchParams = new URLSearchParams();
        
//         // Add your existing query parameters
//         searchParams.append("firstName", "Gaurav"); // Replace with actual values
//         searchParams.append("lastName", "Kumar");   // Replace with actual values
//         searchParams.append("email", "gaurav.kumar@example.com"); // Replace with actual values
//         searchParams.append("phone", "9437948060"); // Replace with actual values
//         searchParams.append("amount", "20");        // Replace with actual amount
        
//         // Add booking token
//         searchParams.append("bookingToken", bookingToken);
        
//         // Redirect to payment success page with all parameters
//         router.push(`/payment-success?${searchParams.toString()}`);
//       }
//     } catch (error) {
//       // Clear the pending token if verification fails
//       sessionStorage.removeItem("pendingBookingToken");
//       console.error("An error occurred during payment verification:", error);
//     }
//   }

//   return (
//     <div className="flex justify-center items-center mt-2">
//       <button className="bg-red-600 text-white p-4" onClick={handlePayNowClick}>
//         Pay Now
//       </button>
//     </div>
//   );
// };

// export default PayNowFunction;