// app/rate-plan/create-inventory/components/CreateInventoryForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@src/components/ui/input';
import { Button } from '@src/components/ui/button';
import { Calendar } from '../../map-rate-plan/components/Calender';
import { Popover, PopoverTrigger, PopoverContent } from '../../map-rate-plan/components/Popover';
import { format } from '../../map-rate-plan/utils/dateUtils';
import { Loader2 } from 'lucide-react';
import { useInventoryCreate } from '../hooks/useInventoryCreate';
import toast from 'react-hot-toast';

interface CreateInventoryFormProps {
  hotelCode: string;
  invTypeCode: string;
  roomTypes: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateInventoryForm: React.FC<CreateInventoryFormProps> = ({
  hotelCode,
  invTypeCode,
  roomTypes,
  onSuccess,
  onCancel,
}) => {
  const { createInventory, isLoading } = useInventoryCreate();
  const [selectedRoomType, setSelectedRoomType] = useState<string>(invTypeCode);

  const [availability, setAvailability] = useState({
    startDate: '',
    endDate: '',
    count: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDateSelect = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      setAvailability(prev => ({
        ...prev,
        [field]: format(date, 'yyyy-MM-dd'),
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedRoomType) newErrors.selectedRoomType = 'Room type is required';
    if (!availability.startDate) newErrors.startDate = 'Start date is required';
    if (!availability.endDate) newErrors.endDate = 'End date is required';
    if (!availability.count || Number(availability.count) < 0) {
      newErrors.count = 'Count must be 0 or greater';
    }

    if (availability.startDate && availability.endDate) {
      const start = new Date(availability.startDate);
      const end = new Date(availability.endDate);
      if (start > end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createInventory({
        hotelCode,
        invTypeCode: selectedRoomType,
        availability: {
          startDate: availability.startDate,
          endDate: availability.endDate,
          count: Number(availability.count),
        },
      });
      toast.success(`✅ Inventory created for ${selectedRoomType}!`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create inventory');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ⚠️ You must complete this step to finish creating your rate plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room Type Dropdown */}
        <div>
          <label className="block text-sm font-tripswift-medium text-gray-700 mb-1">
            Room Type *
          </label>
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select room type</option>
            {roomTypes.map((roomType) => (
              <option key={roomType} value={roomType}>
                {roomType}
              </option>
            ))}
          </select>
          {errors.selectedRoomType && (
            <p className="text-xs text-red-500 mt-1">{errors.selectedRoomType}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-tripswift-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <Popover>
            <PopoverTrigger>
              <Button
                variant="outline"
                className={`w-full justify-start ${errors.startDate ? 'border-red-500' : ''}`}
              >
                {availability.startDate ? format(new Date(availability.startDate), 'PPP') : 'Pick start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={availability.startDate ? new Date(availability.startDate) : undefined}
                onSelect={(date) => handleDateSelect('startDate', date as Date)}
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-tripswift-medium text-gray-700 mb-1">
            End Date *
          </label>
          <Popover>
            <PopoverTrigger>
              <Button
                variant="outline"
                className={`w-full justify-start ${errors.endDate ? 'border-red-500' : ''}`}
              >
                {availability.endDate ? format(new Date(availability.endDate), 'PPP') : 'Pick end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={availability.endDate ? new Date(availability.endDate) : undefined}
                onSelect={(date) => handleDateSelect('endDate', date as Date)}
              />
            </PopoverContent>
          </Popover>
          {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
        </div>

        {/* Count */}
        <div>
          <label className="block text-sm font-tripswift-medium text-gray-700 mb-1">
            Inventory Count *
          </label>
          <Input
            type="number"
            min="0"
            value={availability.count}
            onChange={(e) => setAvailability(prev => ({
              ...prev,
              count: e.target.value
            }))}
            placeholder="e.g., 25"
            className={`w-full ${errors.count ? 'border-red-500' : ''}`}
          />
          {errors.count && <p className="text-xs text-red-500 mt-1">{errors.count}</p>}
        </div>

        {/* Buttons */}
        <div className="pt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            ← Back to Rate Plan
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Inventory...
              </>
            ) : (
              '✅ Complete Setup'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};