// import React from 'react';

// const Loader: React.FC = () => {
//   return (
//     <div className="flex justify-center items-center h-screen">
//       <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-gray-900"></div>
//     </div>
//   );
// };

// export default Loader;
import React from "react";
import { Triangle } from "react-loader-spinner";

const Loader: React.FC = () => {
  return (
    <div className="h-screen w-screen flex justify-center items-center overflow-hidden">
      <Triangle
        visible={true}
        height={100}
        width={100}
        color="#076DB3"
        ariaLabel="triangle-loading"
      />
    </div>
  );
};

export default Loader;
