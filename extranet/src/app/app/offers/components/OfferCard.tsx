import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Send, BadgePercent, FileText, User } from 'lucide-react';
import { BookingOffer } from '../types/offer';
import { useSelector, useDispatch, RootState } from '../../../../redux/store';
import { getUser } from '../../../../redux/slices/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface OfferCardProps {
  offer: BookingOffer;
  onView: (offer: BookingOffer) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onView }) => {
  const [offerDetails, setOfferDetails] = useState<BookingOffer>(offer);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        if (!user?.id || !isAuthenticated) {
          await dispatch(getUser());
          return;
        }

        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/offer-by-hotel`
        );

        const fetchedOffer = response.data.offers[0];
        setOfferDetails({
          id: fetchedOffer._id,
          title: fetchedOffer.title,
          description: fetchedOffer.body,
          discountValue: parseFloat(fetchedOffer.data.discountPercentage),
          endDate: fetchedOffer.data.validTill,
          terms: fetchedOffer.data.terms,
          createdAt: fetchedOffer.createdAt,
          createdBy: `${user.firstName} ${user.lastName}`,
          status: fetchedOffer.data.status || 'inactive',
          bookingsCount: fetchedOffer.data.bookingsCount || 0,
          totalRevenue: fetchedOffer.data.totalRevenue || 0,
          averageBookingValue: fetchedOffer.data.averageBookingValue || 0,
          updatedAt: fetchedOffer.updatedAt || fetchedOffer.createdAt
        });
      } catch (error: any) {
        if (error.response?.status !== 404) {
          toast.error('Failed to fetch notification details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offer.id, dispatch, user, isAuthenticated]);

  const handlePublish = async () => {
    if (!user?.id) {
      toast.error('Please log in to publish offers');
      return;
    }

    setPublishing(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/send-notification`,
        {
          title: `🎉 ${offerDetails.title}`,
          body: offerDetails.description,
          data: {
            type: "promotion",
            offerCode: `SAVE${offerDetails.discountValue}`,
            validTill: offerDetails.endDate,
            terms: offerDetails.terms,
            userId: user.id
          }
        }
      );

      if (response.status === 200) {
        toast.success('Offer published successfully!');
      } else {
        throw new Error('Failed to publish offer');
      }
    } catch (error) {
      toast.error('Failed to publish offer');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate">
              {offerDetails.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {offerDetails.description}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {offerDetails.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Offer highlights */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BadgePercent className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-2xl font-bold text-green-600">
              {offerDetails.discountValue}% OFF
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-1" />
            <span>Created by {offerDetails.createdBy}</span>
          </div>
        </div>
      </div>

      {/* Notification details */}
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500">Valid Till</p>
              <p className="text-sm text-gray-900">
                {offerDetails.endDate ? (
                  format(new Date(offerDetails.endDate), 'PPP')
                ) : (
                  'No expiration date'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500">Terms & Conditions</p>
              <p className="text-sm text-gray-900">
                {offerDetails.terms}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <button
            onClick={handlePublish}
            disabled={publishing || loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${publishing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            <Send className="-ml-1 mr-2 h-4 w-4" />
            {publishing ? 'Publishing...' : 'Publish Offer'}
          </button>
          <button
            onClick={() => onView(offerDetails)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="-ml-1 mr-2 h-4 w-4" />
            {loading ? 'Loading...' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};