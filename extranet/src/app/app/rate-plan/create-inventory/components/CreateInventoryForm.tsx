// app/rate-plan/create-inventory/components/CreateInventoryForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@src/components/ui/input';
import { Button } from '@src/components/ui/button';
import { Calendar } from '../components/Calender';
import { Popover, PopoverTrigger, PopoverContent } from '../components/Popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/components/ui/select';
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [availability, setAvailability] = useState({
    startDate: '',
    endDate: '',
    count: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleDateSelect = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;

      setAvailability(prev => ({
        ...prev,
        [field]: localDateString,
      }));
    }
  };
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
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
      toast.success(`Inventory created for ${selectedRoomType}!`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create inventory');
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ⚠️ You can set up inventory now, but we recommend creating a rate plan first for best results.
        </p>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room Type Dropdown */}
        <div>
          <label className="block text-sm font-tripswift-medium text-gray-700 mb-1">
            Room Type <span className="text-red-500">*</span>
          </label>
          <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
            <SelectTrigger className={errors.selectedRoomType ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.map((roomType) => (
                <SelectItem key={roomType} value={roomType}>
                  {roomType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.selectedRoomType && (
            <p className="text-xs text-red-500 mt-1">{errors.selectedRoomType}</p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-tripswift-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger>
                <input
                  type="text"
                  readOnly
                  placeholder="Pick start date"
                  value={availability.startDate ? format(new Date(availability.startDate), 'PPP') : ''}
                  onFocus={() => setStartDateOpen(true)}
                  className={`w-full px-3 py-2 text-left border rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                />
              </PopoverTrigger>
              {startDateOpen && (
                <PopoverContent className="mt-2 w-auto p-0 z-[9999] bg-white border shadow-lg rounded-lg">
                  <Calendar
                    mode="single"
                    selected={
                      availability.startDate
                        ? new Date(`${availability.startDate}T00:00:00`)
                        : undefined
                    }
                    onSelect={(date) => {
                      handleDateSelect('startDate', date as Date);
                      setStartDateOpen(false); // Close after selection
                    }}
                    disabled={(date) => date < today}
                  />
                </PopoverContent>
              )}
            </Popover>
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-tripswift-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger>
                <input
                  type="text"
                  readOnly
                  placeholder="Pick end date"
                  value={availability.endDate ? format(new Date(availability.endDate), 'PPP') : ''}
                  onFocus={() => setEndDateOpen(true)}
                  className={`w-full px-3 py-2 text-left border rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                />
              </PopoverTrigger>
              {endDateOpen && (
                <PopoverContent className="mt-2 w-auto p-0 z-[9999] bg-white border shadow-lg rounded-lg">
                  <Calendar
                    mode="single"
                    selected={
                      availability.endDate
                        ? new Date(`${availability.endDate}T00:00:00`)
                        : undefined
                    }
                    onSelect={(date) => {
                      handleDateSelect('endDate', date as Date);
                      setEndDateOpen(false); // Close after selection
                    }}
                    disabled={(date) => {
                      if (date < today) return true;
                      if (availability.startDate) {
                        const startDate = new Date(availability.startDate);
                        return date < startDate;
                      }
                      return false;
                    }}
                  />
                </PopoverContent>
              )}
            </Popover>
            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Count */}
        <div>
          <label className="block text-sm font-tripswift-medium text-gray-700 mb-1">
            Inventory Count <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="0"
            value={availability.count}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
                setAvailability(prev => ({
                  ...prev,
                  count: value
                }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                e.preventDefault();
              }
            }}
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
              'Complete Setup'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};