import React, { useState, useEffect } from 'react';
import { X, Calendar, Building, Bed, Users, Clock, DollarSign } from 'lucide-react';
import { BookingOffer } from '../types/offer';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: Partial<BookingOffer>) => void;
  offer?: BookingOffer;
  mode: 'create' | 'edit' | 'view';
  roomTypes: string[];
  properties: string[];
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  onSave,
  offer,
  mode,
  roomTypes,
  properties
}) => {
  const [formData, setFormData] = useState<Partial<BookingOffer>>({
    title: '',
    description: '',
    offerType: 'room_discount',
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: '',
    status: 'active',
    applicableRoomTypes: [],
    properties: [],
    conditions: [],
    minStayNights: 1,
    usageLimit: 100
  });

  useEffect(() => {
    if (offer && (mode === 'edit' || mode === 'view')) {
      setFormData(offer);
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        offerType: 'room_discount',
        discountType: 'percentage',
        discountValue: 0,
        startDate: '',
        endDate: '',
        status: 'active',
        applicableRoomTypes: [],
        properties: [],
        conditions: [],
        minStayNights: 1,
        usageLimit: 100
      });
    }
  }, [offer, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof BookingOffer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'applicableRoomTypes' | 'properties' | 'conditions', value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const offerTypes = [
    { value: 'room_discount', label: 'Room Discount' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'early_bird', label: 'Early Bird' },
    { value: 'last_minute', label: 'Last Minute' },
    { value: 'group_booking', label: 'Group Booking' },
    { value: 'extended_stay', label: 'Extended Stay' }
  ];

  const discountTypes = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount ($)' },
    { value: 'per_night', label: 'Per Night ($)' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'scheduled', label: 'Scheduled' }
  ];

  const conditionOptions = [
    'Non-refundable',
    'Refundable',
    'Free cancellation',
    'Includes breakfast',
    'Includes spa credit',
    'Weekends only',
    'Weekdays only',
    'Subject to availability',
    'Must book in advance',
    'Group contact required'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' && 'Create New Offer'}
            {mode === 'edit' && 'Edit Offer'}
            {mode === 'view' && 'Offer Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={mode === 'view'}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
                      <select
                        value={formData.offerType}
                        onChange={(e) => handleInputChange('offerType', e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        {offerTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Discount Settings
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => handleInputChange('discountType', e.target.value)}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      {discountTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => handleInputChange('discountValue', Number(e.target.value))}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Restrictions */}
            <div className="space-y-6">
              {/* Date Range */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date Range
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Booking Restrictions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Booking Restrictions
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Stay (nights)</label>
                    <input
                      type="number"
                      value={formData.minStayNights || ''}
                      onChange={(e) => handleInputChange('minStayNights', Number(e.target.value))}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                    <input
                      type="number"
                      value={formData.usageLimit || ''}
                      onChange={(e) => handleInputChange('usageLimit', Number(e.target.value))}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      min="1"
                    />
                  </div>
                </div>

                {formData.offerType === 'early_bird' || formData.offerType === 'last_minute' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.offerType === 'early_bird' ? 'Advance Booking (days)' : 'Book Within (days)'}
                    </label>
                    <input
                      type="number"
                      value={formData.advanceBookingDays || ''}
                      onChange={(e) => handleInputChange('advanceBookingDays', Number(e.target.value))}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      min="1"
                    />
                  </div>
                ) : null}

                {formData.offerType === 'group_booking' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Group Size</label>
                    <input
                      type="number"
                      value={formData.groupSize || ''}
                      onChange={(e) => handleInputChange('groupSize', Number(e.target.value))}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      min="2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Properties & Room Types */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Applicable Properties
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {properties.map(property => (
                  <label key={property} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(formData.properties || []).includes(property)}
                      onChange={() => handleArrayChange('properties', property)}
                      disabled={mode === 'view'}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{property}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Bed className="w-5 h-5" />
                Applicable Room Types
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {roomTypes.map(roomType => (
                  <label key={roomType} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(formData.applicableRoomTypes || []).includes(roomType)}
                      onChange={() => handleArrayChange('applicableRoomTypes', roomType)}
                      disabled={mode === 'view'}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{roomType}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {conditionOptions.map(condition => (
                <label key={condition} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(formData.conditions || []).includes(condition)}
                    onChange={() => handleArrayChange('conditions', condition)}
                    disabled={mode === 'view'}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          {mode !== 'view' && (
            <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                {mode === 'create' ? 'Create Offer' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};