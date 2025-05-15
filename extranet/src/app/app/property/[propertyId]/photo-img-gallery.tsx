"use client";

import Image from "next/image";
import React from "react";
import { useState } from "react";

export function PropertyImageGallery({ image }: { image: string[] }) {
  const [currentImage, setCurrentImage] = useState(0);
if (!image || image.length === 0) {
  return <div>No images available</div>;
}
  return (
<div>
<div className="pb-2 rounded-md overflow-hidden border-white">
  <Image
    src={image[currentImage]}
    alt="Property image"
    height={350} // Fixed height
    width={990} // Set a width that you want
    style={{
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%', // Set width to 100% to fill the container
      maxWidth: 'none', // Allow it to overflow
      height: '350px', // Fixed height
      objectFit: 'cover', // Maintain aspect ratio
      borderRadius: '12px'
    }}
  />
</div>

      <div className="flex items-center gap-2 mt-4">
        {image?.map((img, i) => (
          <div
            key={`${img + i}`}
            onClick={() => setCurrentImage(i)}
            className={`rounded-md overflow-hidden ${
              currentImage === i ? "ring ring-primary-50 ring-offset-2" : null
            }`}
          >
            <Image src={img} alt="Property image" height={200} width={200} />
          </div>
        ))}
      </div>
    </div>
  );
}



















// export function PropertyImageGallery({ image }: { image: string[] }) {
//   const [currentImage, setCurrentImage] = useState(0);


//   if (!image || image.length === 0) {
//     return <div>No images available</div>;
//   }

//   return (
//     <div>
//       <div className="rounded-md overflow-hidden">
   
//         {image[currentImage] && (
//           <img
//             src={image[currentImage]}
//             alt="Property image"
//             height={500}
//             width={500}
//           />
//         )}
//       </div>
//       <div className="flex items-center gap-2 mt-4">
//         {image.map((img, i) => (
//           <div
//             key={`${img + i}`}
//             onClick={() => setCurrentImage(i)}
//             className={`rounded-md overflow-hidden ${
//               currentImage === i ? "ring ring-primary-50 ring-offset-2" : null
//             }`}
//           >
//             <img src={img} alt="Property image" height={200} width={200} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
