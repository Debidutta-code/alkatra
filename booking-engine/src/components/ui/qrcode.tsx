'use client';
import QRCode from 'react-qr-code';

export default function QRCodeForAPP() {
  const staticLink = `${process.env.NEXT_PUBLIC_MOBILE_APPLICATION_URL}`;

  return (
    <div className=" bg-tripswift-off-white px-4 py-2 flex flex-col items-center justify-center  lg:py-4  rounded-2xl shadow-lg max-w-xs">
      <div  className=" bg-tripswift-off-white/70  p-4 rounded-md border xl-w-[200px] lg:w-[160px] lg:h-[160px] md:h-[110px] md:w-[110px] h-[80px] w-[80px] shadow-inner">
        <QRCode
          value={staticLink}
          // title="Download Al Hajz App"
          style={{ width: '100%', height: '100%'  , backgroundImage:
                "linear-gradient(90deg, rgba(131,58,180,1) 20%, rgba(253,29,29,1) 57%, rgba(227,131,57,1) 100%)",
             }}
          fgColor="transparent" // a deep sky blue
          bgColor="#ffffff" // white background
        />
      </div>
    </div>
  );
}
