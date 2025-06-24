import React from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Copy,
  Eye,
  MapPin,
  Bed,
  Clock,
  UserCheck
} from 'lucide-react';
import { BookingOffer } from '../types/offer';

interface OfferCardProps {
  offer: BookingOffer;
  onEdit: (offer: BookingOffer) => void;
  onDelete: (id: string) => void;
  onDuplicate: (offer: BookingOffer) => void;
  onView: (offer: BookingOffer) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ 
  offer, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onView 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOfferTypeColor = (type: string) => {
    switch (type) {
      case 'early_bird': return 'bg-purple-100 text-purple-800';
      case 'last_minute': return 'bg-orange-100 text-orange-800';
      case 'group_booking': return 'bg-cyan-100 text-cyan-800';
      case 'extended_stay': return 'bg-indigo-100 text-indigo-800';
      case 'seasonal': return 'bg-emerald-100 text-emerald-800';
      case 'room_discount': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatOfferType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDiscountValue = () => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    } else if (offer.discountType === 'fixed') {
      return `$${offer.discountValue} OFF`;
    } else {
      return `$${offer.discountValue} per night`;
    }
  };

  const progressPercentage = offer.usageLimit 
    ? Math.min((offer.bookingsCount / offer.usageLimit) * 100, 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{offer.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(offer.status)}`}>
              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOfferTypeColor(offer.offerType)}`}>
              {formatOfferType(offer.offerType)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600">
            {formatDiscountValue()}
          </div>
          <div className="text-sm text-gray-500">
            Created by {offer.createdBy}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Bookings</p>
              <p className="font-semibold text-gray-900">{offer.bookingsCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="font-semibold text-gray-900">${offer.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {offer.usageLimit && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Usage Progress</span>
              <span>{offer.bookingsCount} / {offer.usageLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Valid:</span>
            <span className="font-medium">{new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}</span>
          </div>
          
          {offer.minStayNights && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Min Stay:</span>
              <span className="font-medium">{offer.minStayNights} nights</span>
            </div>
          )}

          {offer.advanceBookingDays && (
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Advance Booking:</span>
              <span className="font-medium">{offer.advanceBookingDays} days</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Properties:</span>
            <span className="font-medium">{offer.properties.length} selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Room Types:</span>
            <span className="font-medium">{offer.applicableRoomTypes.length} types</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onView(offer)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicate(offer)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(offer)}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(offer.id)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};