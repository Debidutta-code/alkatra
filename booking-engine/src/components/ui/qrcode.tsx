'use client';

import QRCode from 'react-qr-code';

export default function QRCodeForAPP() {
  const staticLink = `${process.env.NEXT_PUBLIC_BASE_URL}/download/app-release.apk`;

  return (
    <div className=" bg-tripswift-off-white px-4 py-2 flex flex-col items-center justify-center  lg:py-4  rounded-2xl shadow-lg max-w-xs">
      {/* <h2 className="text-xl font-semibold text-gray-800">Download Our App</h2> */}
      <div  className=" bg-tripswift-off-white/70  p-4 rounded-md border xl-w-[200px] lg:w-[160px] lg:h-[160px] md:h-[110px] md:w-[110px] h-[80px] w-[80px] shadow-inner">
        <QRCode
          value={staticLink}
          style={{ width: '100%', height: '100%'  , backgroundImage:
                "linear-gradient(90deg, rgba(131,58,180,1) 20%, rgba(253,29,29,1) 57%, rgba(227,131,57,1) 100%)",
             }}
          fgColor="transparent" // a deep sky blue
          bgColor="#ffffff" // white background
        />
      </div>

      {/* <a
        href={staticLink}
        download
        className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
      >
        Download APK
      </a> */}
    </div>
  );
}
