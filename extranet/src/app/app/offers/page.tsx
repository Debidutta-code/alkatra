"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { BookingOffer, OfferFilters } from './types/offer';
import { OfferCard } from './components/OfferCard';
import { OfferModal } from './components/OfferModal';
import { useSelector, useDispatch, RootState } from '../../../redux/store';
import { getUser } from '../../../redux/slices/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

function Offers() {
  const [offers, setOffers] = useState<BookingOffer[]>([]);
  const [filters, setFilters] = useState<OfferFilters>({
    search: '',
    status: '',
    dateRange: { start: '', end: '' }
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create' as 'create' | 'view',
    offer: undefined as BookingOffer | undefined
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  });
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1 // Reset to the first page when limit changes
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Fetch user if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(getUser());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch offers when user is authenticated
  useEffect(() => {
    const fetchOffers = async () => {
      if (!user?.id || !isAuthenticated) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/offer-by-hotel`,
          {
            params: {
              page: pagination.page,
              limit: pagination.limit
            }
          }
        );

        if (response.data?.offers) {
          const fetchedOffers = response.data.offers.map((offer: any) => ({
            id: offer._id,
            title: offer.title,
            description: offer.body,
            discountValue: parseFloat(offer.data.discountPercentage),
            endDate: offer.data.validTill,
            terms: offer.data.terms,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt || offer.createdAt,
            createdBy: `${user.firstName} ${user.lastName}`,
            status: offer.data.status || 'active',
            bookingsCount: offer.data.bookingsCount || 0,
            totalRevenue: offer.data.totalRevenue || 0,
            averageBookingValue: offer.data.averageBookingValue || 0
          }));
          setOffers(fetchedOffers);
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          toast.error('Failed to fetch offers');
          console.error('Error fetching offers:', error);
        }
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [user, isAuthenticated]);

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        offer.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || offer.status === filters.status;
      const matchesDateRange = (!filters.dateRange.start || offer.endDate >= filters.dateRange.start) &&
        (!filters.dateRange.end || offer.endDate <= filters.dateRange.end);

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [offers, filters]);

  const handleCreateOffer = () => {
    setModalState({ isOpen: true, mode: 'create', offer: undefined });
  };

  const handleViewOffer = (offer: BookingOffer) => {
    setModalState({ isOpen: true, mode: 'view', offer });
  };

  const handleSaveOffer = (offerData: Partial<BookingOffer>) => {
    setOffers(prev => [offerData as BookingOffer, ...prev]);
    setModalState(prev => ({ ...prev, isOpen: false }));
    toast.success('Offer created successfully!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen md:mx-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
          <p className="text-gray-600">You need to be logged in to view offers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:mx-8 bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Offers Management</h1>
              <p className="text-gray-600 mt-1">Create and manage booking offers</p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
              <button
                onClick={handleCreateOffer}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors w-full sm:w-auto"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Create Notification
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOffers.map(offer => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onView={handleViewOffer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first booking offer.
            </p>
            <button
              onClick={handleCreateOffer}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              Create Your First Offer
            </button>
          </div>
        )}

        {offers.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                {[5, 10, 20, 50].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {offers.length > 0 ? (
                `Showing ${(pagination.page - 1) * pagination.limit + 1}-${(pagination.page - 1) * pagination.limit + offers.length
                } of ${pagination.total} offers`
              ) : (
                'No offers to display'
              )}
            </div>
          </div>
        )}
      </div>

      <OfferModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveOffer}
        offer={modalState.offer}
        mode={modalState.mode}
      />
    </div>
  );
}

export default Offers;