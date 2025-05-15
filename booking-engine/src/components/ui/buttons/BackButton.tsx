"use client"

// Import necessary dependencies
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Component for the page
const BackButton = () => {
  const router = useRouter();

  // Function to handle going back
  const handleGoBack = () => {
    router.back();
  };

  return (
    <div>
      {/* Back Arrow and Label */}
      <div className="flex items-center mb-4">
        <button onClick={handleGoBack} className="mr-2 flex items-center">
          {/* Back Arrow Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        <span className="text-lg ml-2  text-red-500 font-semibold">Modify My Booking</span>
        </button>
        {/* Label */}
      </div>

      
    </div>
  );
};

export default BackButton;
