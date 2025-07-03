// import React from 'react';
// import { Search, Filter, Calendar, Building, Tag, Bed } from 'lucide-react';
// import { OfferFilters } from '../types/offer';

// interface FilterBarProps {
//   filters: OfferFilters;
//   onFiltersChange: (filters: OfferFilters) => void;
//   roomTypes: string[];
//   properties: string[];
// }

// export const FilterBar: React.FC<FilterBarProps> = ({ 
//   filters, 
//   onFiltersChange, 
//   roomTypes, 
//   properties 
// }) => {
//   const handleInputChange = (field: keyof OfferFilters, value: string) => {
//     onFiltersChange({ ...filters, [field]: value });
//   };

//   const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
//     onFiltersChange({
//       ...filters,
//       dateRange: { ...filters.dateRange, [field]: value }
//     });
//   };

//   const offerTypes = [
//     { value: '', label: 'All Types' },
//     { value: 'room_discount', label: 'Room Discount' },
//     { value: 'seasonal', label: 'Seasonal' },
//     { value: 'early_bird', label: 'Early Bird' },
//     { value: 'last_minute', label: 'Last Minute' },
//     { value: 'group_booking', label: 'Group Booking' },
//     { value: 'extended_stay', label: 'Extended Stay' }
//   ];

//   const statusOptions = [
//     { value: '', label: 'All Status' },
//     { value: 'active', label: 'Active' },
//     { value: 'inactive', label: 'Inactive' },
//     { value: 'scheduled', label: 'Scheduled' },
//     { value: 'expired', label: 'Expired' }
//   ];

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//       <div className="flex items-center gap-2 mb-4">
//         <Filter className="w-5 h-5 text-gray-500" />
//         <h3 className="font-semibold text-gray-900">Filters</h3>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//         {/* Search */}
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search offers..."
//             value={filters.search}
//             onChange={(e) => handleInputChange('search', e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>

//         {/* Status */}
//         <div className="relative">
//           <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <select
//             value={filters.status}
//             onChange={(e) => handleInputChange('status', e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//           >
//             {statusOptions.map(option => (
//               <option key={option.value} value={option.value}>{option.label}</option>
//             ))}
//           </select>
//         </div>

//         {/* Offer Type */}
//         <div className="relative">
//           <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <select
//             value={filters.offerType}
//             onChange={(e) => handleInputChange('offerType', e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//           >
//             {offerTypes.map(option => (
//               <option key={option.value} value={option.value}>{option.label}</option>
//             ))}
//           </select>
//         </div>

//         {/* Property */}
//         <div className="relative">
//           <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <select
//             value={filters.property}
//             onChange={(e) => handleInputChange('property', e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//           >
//             <option value="">All Properties</option>
//             {properties.map(property => (
//               <option key={property} value={property}>{property}</option>
//             ))}
//           </select>
//         </div>

//         {/* Room Type */}
//         <div className="relative">
//           <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <select
//             value={filters.roomType}
//             onChange={(e) => handleInputChange('roomType', e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//           >
//             <option value="">All Room Types</option>
//             {roomTypes.map(roomType => (
//               <option key={roomType} value={roomType}>{roomType}</option>
//             ))}
//           </select>
//         </div>

//         {/* Date Range */}
//         <div className="flex gap-2 ">
//           <input
//             type="date"
//             placeholder="Start Date"
//             value={filters.dateRange.start}
//             onChange={(e) => handleDateRangeChange('start', e.target.value)}
//             className="flex-1 w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//           <input
//             type="date"
//             placeholder="End Date"
//             value={filters.dateRange.end}
//             onChange={(e) => handleDateRangeChange('end', e.target.value)}
//             className="flex-1 w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };