"use client"

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@src/components/ui/button';
import BasicInfoForm from './components/BasicInfoForm';
import SchedulingForm from './components/SchedulingForm';
import OccupancyForm from './components/OccupancyForm';
import StayDetailsForm from './components/StayDetailsForm';
import BookingAdvanceForm from './components/BookingAdvanceForm';
import { createRatePlan } from './api/ratePlanApi';
import { RatePlanFormData, DateRange } from './types/ratePlanTypes';
import { getInitialFormData } from './constants/initialFormData';

export default function RatePlanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';

  const [formData, setFormData] = useState<RatePlanFormData>(getInitialFormData(propertyId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => {
        const parentValue = prev[parent as keyof RatePlanFormData];
        if (typeof parentValue === 'object' && parentValue !== null) {
          return {
            ...prev,
            [parent]: { ...parentValue, [child]: value },
          };
        }
        return prev;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSchedulingTypeChange = (type: 'weekly' | 'date_range' | 'specific-dates') => {
    setFormData((prev) => ({
      ...prev,
      scheduling: { ...prev.scheduling, type, weeklyDays: [], dateRanges: [], availableSpecificDates: [] },
    }));
  };

  const handleWeeklyDaysChange = (day: string) => {
    const weeklyDays = formData.scheduling.weeklyDays.includes(day)
      ? formData.scheduling.weeklyDays.filter((d) => d !== day)
      : [...formData.scheduling.weeklyDays, day];
    setFormData((prev) => ({
      ...prev,
      scheduling: { ...prev.scheduling, weeklyDays },
    }));
  };

  const addDateRange = () => {
    setFormData((prev) => ({
      ...prev,
      scheduling: {
        ...prev.scheduling,
        dateRanges: [...prev.scheduling.dateRanges, { start: '', end: '' }],
      },
    }));
  };

  const updateDateRange = (index: number, field: 'start' | 'end', value: string) => {
    const dateRanges = [...formData.scheduling.dateRanges];
    dateRanges[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      scheduling: { ...prev.scheduling, dateRanges },
    }));
  };

  const removeDateRange = (index: number) => {
    const dateRanges = formData.scheduling.dateRanges.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      scheduling: { ...prev.scheduling, dateRanges },
    }));
  };

  const handleSpecificDatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dates = e.target.value.split(',').map((date) => date.trim());
    setFormData((prev) => ({
      ...prev,
      scheduling: { ...prev.scheduling, availableSpecificDates: dates },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No access token found');
      }

      const payload: RatePlanFormData = {
        ...formData,
        description: formData.description || '',
        scheduling: {
          type: formData.scheduling.type,
          weeklyDays: formData.scheduling.type === 'weekly' ? formData.scheduling.weeklyDays : [],
          dateRanges: formData.scheduling.type === 'date_range'
            ? formData.scheduling.dateRanges.map(range => ({
                start: new Date(range.start).toISOString(),
                end: new Date(range.end).toISOString(),
              }))
            : [],
          availableSpecificDates: formData.scheduling.type === 'specific-dates' ? formData.scheduling.availableSpecificDates : [],
        },
        maxOccupancy: Number(formData.maxOccupancy),
        adultOccupancy: Number(formData.adultOccupancy),
        minLengthStay: Number(formData.minLengthStay),
        maxLengthStay: Number(formData.maxLengthStay),
        minReleaseDay: Number(formData.minReleaseDay),
        maxReleaseDay: Number(formData.maxReleaseDay),
        cancellationDeadline: {
          days: Number(formData.cancellationDeadline.days),
          hours: Number(formData.cancellationDeadline.hours),
        },
        minBookAdvance: Number(formData.minBookAdvance),
        maxBookAdvance: Number(formData.maxBookAdvance),
        createdBy: new Date(formData.createdBy).toISOString(),
        updatedBy: new Date(formData.updatedBy).toISOString(),
      };

      const response = await createRatePlan(payload, token);

      if (response.success) {
        alert('Rate plan created successfully');
        router.push(`/app/property/${propertyId}`);
      } else {
        throw new Error('Failed to create rate plan');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create rate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/app/property/${propertyId}`);
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Create Rate Plan</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Property ID</label>
        <input
          type="text"
          name="propertyId"
          value={formData.propertyId}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          readOnly
        />
      </div>

      <div className="space-y-6">
        <BasicInfoForm formData={formData} handleChange={handleChange} />
        <SchedulingForm
          scheduling={formData.scheduling}
          handleSchedulingTypeChange={handleSchedulingTypeChange}
          handleWeeklyDaysChange={handleWeeklyDaysChange}
          addDateRange={addDateRange}
          updateDateRange={updateDateRange}
          removeDateRange={removeDateRange}
          handleSpecificDatesChange={handleSpecificDatesChange}
        />
        <OccupancyForm formData={formData} handleChange={handleChange} />
        <StayDetailsForm formData={formData} handleChange={handleChange} />
        <BookingAdvanceForm formData={formData} handleChange={handleChange} />
      </div>

      <div className="flex space-x-2 mt-6">
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-green-500 text-white p-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 text-white p-2 rounded w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}