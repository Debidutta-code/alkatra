import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Notification } from '../types/offer';
import { useSelector, useDispatch, RootState } from '../../../../redux/store';
import { getUser } from '../../../../redux/slices/authSlice';
import axios from 'axios';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: Partial<Notification>) => void;
  offer?: Notification;
  mode: 'create' | 'view';
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  onSave,
  offer,
  mode
}) => {
  const [formData, setFormData] = useState<Partial<Notification>>({
    title: '',
    body: '',
    data: { type: '', offerCode: '' }
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (offer && mode === 'view') {
      setFormData({
        title: offer.title,
        body: offer.body,
        data: offer.data
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        body: '',
        data: { type: '', offerCode: '' }
      });
    }
  }, [offer, mode, isOpen]);

  useEffect(() => {
    if (!user?.id || !isAuthenticated) dispatch(getUser());
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
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/create-notification`,
        {
          title: formData.title,
          body: formData.body,
          data: {
            type: formData.data?.type || 'Promotional',
            offerCode: formData.data?.offerCode || ''
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.data?.offer?._id) throw new Error('Invalid response from server');

      onSave({
        ...formData,
        id: response.data.offer._id,
        createdAt: response.data.offer.createdAt,
        updatedAt: response.data.offer.createdAt,
        createdBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (axios.isAxiosError(err)) console.error('API Error:', err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Notification, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDataChange = (field: keyof Notification['data'], value: string) => {
    setFormData(prev => ({
      ...prev,
      data: {
        type: '',
        offerCode: '',
        ...prev.data,
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Create New Notification' : 'Notification Details'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Message Body</label>
                  <textarea
                    value={formData.body || ''}
                    onChange={(e) => handleInputChange('body', e.target.value)}
                    disabled={mode === 'view'}
                    rows={3}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.data?.type || ''}
                    onChange={(e) => handleDataChange('type', e.target.value)}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Select type</option>
                    <option value="Promotional">Promotional</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Offer Code</label>
                  <input
                    type="text"
                    value={formData.data?.offerCode || ''}
                    onChange={(e) => handleDataChange('offerCode', e.target.value)}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="e.g., PROMO123"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}

          {mode !== 'view' && (
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:bg-blue-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Create Notification'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};