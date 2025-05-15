// import React, { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import { LatLngExpression } from 'leaflet';

// interface HotelMapProps {
//   city: string;
// }

// const HotelMap: React.FC<HotelMapProps> = ({ city }) => {
//   const [coords, setCoords] = useState<LatLngExpression | null>(null);

//   useEffect(() => {
//     // Use a geocoding service to get the coordinates for the city
//     const fetchCoords = async () => {
//       try {
//         const response = await fetch(
//           `https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`
//         );
//         const data = await response.json();
//         if (data.length > 0) {
//           const { lat, lon } = data[0];
//           setCoords([parseFloat(lat), parseFloat(lon)]);
//         }
//       } catch (error) {
//         console.error('Error fetching coordinates:', error);
//       }
//     };

//     fetchCoords();
//   }, [city]);

//   return coords ? (
//     <MapContainer
//       className="h-full w-full rounded-lg"
//     >
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//       <Marker position={coords}>
//         <Popup>{city}</Popup>
//       </Marker>
//     </MapContainer>
//   ) : (
//     <div className="flex items-center justify-center h-full">
//       <p>Loading map...</p>
//     </div>
//   );
// };

// export default HotelMap;
