"use client"
import React, { useState, useMemo } from 'react';
import { Plus, Download, Upload, MoreVertical } from 'lucide-react';
import { BookingOffer, OfferFilters } from './types/offer';
import { mockOffers, mockStats, roomTypes, properties } from './data/mockOffers';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { OfferCard } from './components/OfferCard';
import { OfferModal } from './components/OfferModal';
import { Calendar } from '../rate-plan/map-rate-plan/components/Calender';

function Offers() {
  const [offers, setOffers] = useState<BookingOffer[]>(mockOffers);
  const [filters, setFilters] = useState<OfferFilters>({
    search: '',
    status: '',
    offerType: '',
    property: '',
    roomType: '',
    dateRange: { start: '', end: '' }
  });
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    offer?: BookingOffer;
  }>({
    isOpen: false,
    mode: 'create'
  });

  // Filter offers based on current filters
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                           offer.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || offer.status === filters.status;
      const matchesOfferType = !filters.offerType || offer.offerType === filters.offerType;
      const matchesProperty = !filters.property || offer.properties.includes(filters.property);
      const matchesRoomType = !filters.roomType || offer.applicableRoomTypes.includes(filters.roomType);
      
      const matchesDateRange = (!filters.dateRange.start || offer.startDate >= filters.dateRange.start) &&
                              (!filters.dateRange.end || offer.endDate <= filters.dateRange.end);

      return matchesSearch && matchesStatus && matchesOfferType && matchesProperty && matchesRoomType && matchesDateRange;
    });
  }, [offers, filters]);

  const handleCreateOffer = () => {
    setModalState({ isOpen: true, mode: 'create' });
  };

  const handleEditOffer = (offer: BookingOffer) => {
    setModalState({ isOpen: true, mode: 'edit', offer });
  };

  const handleViewOffer = (offer: BookingOffer) => {
    setModalState({ isOpen: true, mode: 'view', offer });
  };

  const handleDeleteOffer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      setOffers(offers.filter(offer => offer.id !== id));
    }
  };

  const handleDuplicateOffer = (offer: BookingOffer) => {
    const newOffer: BookingOffer = {
      ...offer,
      id: Date.now().toString(),
      title: `${offer.title} (Copy)`,
      status: 'inactive',
      bookingsCount: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    setOffers([newOffer, ...offers]);
  };

  const handleSaveOffer = (offerData: Partial<BookingOffer>) => {
    if (modalState.mode === 'create') {
      const newOffer: BookingOffer = {
        ...offerData,
        id: Date.now().toString(),
        bookingsCount: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User'
      } as BookingOffer;
      setOffers([newOffer, ...offers]);
    } else if (modalState.mode === 'edit' && modalState.offer) {
      setOffers(offers.map(offer => 
        offer.id === modalState.offer!.id 
          ? { ...offer, ...offerData, updatedAt: new Date().toISOString() }
          : offer
      ));
    }
    setModalState({ isOpen: false, mode: 'create' });
  };

  const handleBulkAction = (action: string) => {
    if (selectedOffers.length === 0) return;

    switch (action) {
      case 'activate':
        setOffers(offers.map(offer => 
          selectedOffers.includes(offer.id) ? { ...offer, status: 'active' as const } : offer
        ));
        break;
      case 'deactivate':
        setOffers(offers.map(offer => 
          selectedOffers.includes(offer.id) ? { ...offer, status: 'inactive' as const } : offer
        ));
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedOffers.length} offers?`)) {
          setOffers(offers.filter(offer => !selectedOffers.includes(offer.id)));
        }
        break;
    }
    setSelectedOffers([]);
  };

  const toggleOfferSelection = (offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedOffers(
      selectedOffers.length === filteredOffers.length 
        ? [] 
        : filteredOffers.map(offer => offer.id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row items-start justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Offers Management</h1>
              <p className="text-gray-600 mt-1">Create and manage booking offers for your properties</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleCreateOffer}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Offer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <StatsCards stats={mockStats} />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          roomTypes={roomTypes}
          properties={properties}
        />

        {/* Bulk Actions */}
        {selectedOffers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedOffers.length} offers selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="px-3 py-1 text-sm bg-gray-600 text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedOffers([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {/* Offers List Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedOffers.length === filteredOffers.length && filteredOffers.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Select all</span>
            </label>
            <span className="text-sm text-gray-500">
              Showing {filteredOffers.length} of {offers.length} offers
            </span>
          </div>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 max-cols-3 gap-6">
            {filteredOffers.map(offer => (
              <div key={offer.id} className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedOffers.includes(offer.id)}
                    onChange={() => toggleOfferSelection(offer.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <OfferCard
                  offer={offer}
                  onEdit={handleEditOffer}
                  onDelete={handleDeleteOffer}
                  onDuplicate={handleDuplicateOffer}
                  onView={handleViewOffer}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {/* <div className="text-gray-400 mb-4">
              <Calendar className="w-8 h-8 mx-auto" />
            </div> */}
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status || filters.offerType 
                ? 'Try adjusting your filters to see more offers.'
                : 'Get started by creating your first booking offer.'
              }
            </p>
            {!filters.search && !filters.status && !filters.offerType && (
              <button
                onClick={handleCreateOffer}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Offer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <OfferModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create' })}
        onSave={handleSaveOffer}
        offer={modalState.offer}
        mode={modalState.mode}
        roomTypes={roomTypes}
        properties={properties}
      />
    </div>
  );
}

export default Offers;