'use client';

import QRCode from 'react-qr-code';

export default function QRCodeForAPP() {
  const staticLink = `${process.env.NEXT_PUBLIC_BASE_URL}/download/app-release.apk`;

  return (
    <div className="p-2 bg-white border rounded shadow-md">
      <QRCode value={staticLink} size={200} />
    </div>
  );
}
