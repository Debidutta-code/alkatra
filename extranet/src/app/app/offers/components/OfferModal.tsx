import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign } from 'lucide-react';
import { BookingOffer } from '../types/offer';
import { useSelector, useDispatch, RootState } from '../../../../redux/store';
import { getUser } from '../../../../redux/slices/authSlice';
import axios from 'axios';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: Partial<BookingOffer>) => void;
  offer?: BookingOffer;
  mode: 'create' | 'view';
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  onSave,
  offer,
  mode
}) => {
  const [formData, setFormData] = useState<Partial<BookingOffer>>({
    title: '',
    description: '',
    discountValue: 0,
    endDate: '',
    terms: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (offer && mode === 'view') {
      setFormData({
        title: offer.title,
        description: offer.description,
        discountValue: offer.discountValue,
        endDate: offer.endDate,
        terms: offer.terms
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        discountValue: 0,
        endDate: '',
        terms: ''
      });
    }
  }, [offer, mode, isOpen]);

  useEffect(() => {
    if (!user?.id || !isAuthenticated) {
      dispatch(getUser());
    }
  }, [dispatch, user?.id, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (mode === 'view') {
      onClose();
      return;
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/offer-by-hotel`;
      const payload = {
        title: formData.title,
        body: formData.description,
        data: {
          discountPercentage: formData.discountValue,
          validTill: formData.endDate,
          terms: formData.terms
        }
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Fixed: Check for response.data.offer instead of response.data.offers[0]
      if (!response.data || !response.data.offer?._id) {
        throw new Error('Invalid response from server');
      }

      onSave({
        ...formData,
        id: response.data.offer._id || Date.now().toString(),
        createdAt: response.data.offer.createdAt || new Date().toISOString(),
        updatedAt: response.data.offer.createdAt || new Date().toISOString(),
        createdBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        status: 'active', // Set default status
        bookingsCount: 0,
        totalRevenue: 0,
        averageBookingValue: 0
      });

      // Close the modal after successful creation
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (axios.isAxiosError(err)) {
        console.error('API Error:', err.response?.data || err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BookingOffer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' && 'Create New Offer'}
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={mode === 'view'}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Discount Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
                  <input
                    type="number"
                    value={formData.discountValue || ''}
                    onChange={(e) => handleInputChange('discountValue', Number(e.target.value))}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Valid Till
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
              <textarea
                value={formData.terms || ''}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                disabled={mode === 'view'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter terms and conditions (e.g., Applicable only on deluxe rooms)"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-600 text-sm">{error}</div>
          )}

          {mode !== 'view' && (
            <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:bg-blue-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Create Offer'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};