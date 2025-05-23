"use client"

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@src/components/ui/button';
import BasicInfoForm from './components/BasicInfoForm';
import SchedulingForm from './components/SchedulingForm';
import LengthOfStayForm from './components/LengthOfStayForm';
import ReleaseAndCancellationForm from './components/ReleaseAndCancellationForm';
import { createRatePlan } from './api/ratePlanApi';
import { RatePlanFormData, DateRange } from './types/ratePlanTypes';
import { getInitialFormData } from './constants/initialFormData';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

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
      const token = Cookies.get('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const scheduling = {
        type: formData.scheduling.type,
        weeklyDays: formData.scheduling.type === 'weekly' ? formData.scheduling.weeklyDays : [],
        dateRanges: formData.scheduling.type === 'date_range'
          ? formData.scheduling.dateRanges.map(range => ({
              start: new Date(range.start).toISOString(),
              end: new Date(range.end).toISOString(),
            }))
          : [],
        availableSpecificDates: formData.scheduling.type === 'specific-dates' ? formData.scheduling.availableSpecificDates : [],
      };

      const currentTimestamp = new Date().toISOString(); // Current timestamp: 2025-05-23T09:52:00.000Z

      const payload = {
        propertyId: formData.propertyId,
        ratePlanName: formData.ratePlanName,
        ratePlanCode: formData.ratePlanCode,
        description: formData.description || '',
        mealPlan: formData.mealPlan,
        minLengthStay: Number(formData.minLengthStay),
        maxLengthStay: Number(formData.maxLengthStay),
        minReleaseDay: Number(formData.minReleaseDay),
        maxReleaseDay: Number(formData.maxReleaseDay),
        cancellationDeadline: {
          days: Number(formData.cancellationDeadline.days),
          hours: Number(formData.cancellationDeadline.hours),
        },
        currency: formData.currency,
        status: formData.status,
        createdBy: currentTimestamp,
        updatedBy: currentTimestamp,
        type: scheduling.type,
        weeklyDays: scheduling.weeklyDays,
        dateRanges: scheduling.dateRanges,
        availableSpecificDates: scheduling.availableSpecificDates,
        scheduling: scheduling,
        maxOccupancy: Number(formData.maxOccupancy),
        adultOccupancy: Number(formData.adultOccupancy),
        minBookAdvance: Number(formData.minBookAdvance),
        maxBookAdvance: Number(formData.maxBookAdvance),
      };

      const response = await createRatePlan(payload, token);

      if (response.success) {
        toast.success('Rate plan created successfully!');
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

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Rate Plan</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-1">Property ID</label>
        <input
          type="text"
          name="propertyId"
          value={formData.propertyId}
          onChange={handleChange}
          className="w-full p-2 bg-gray-100 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
          readOnly
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <BasicInfoForm formData={formData} handleChange={handleChange} />
          <LengthOfStayForm formData={formData} handleChange={handleChange} />
        </div>
        <div className="space-y-8">
          <SchedulingForm
            scheduling={formData.scheduling}
            handleSchedulingTypeChange={handleSchedulingTypeChange}
            handleWeeklyDaysChange={handleWeeklyDaysChange}
            addDateRange={addDateRange}
            updateDateRange={updateDateRange}
            removeDateRange={removeDateRange}
            handleSpecificDatesChange={handleSpecificDatesChange}
          />
          <ReleaseAndCancellationForm formData={formData} handleChange={handleChange} />
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button
          type="button"
          onClick={handleCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded transition-colors duration-200"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors duration-200"
          disabled={loading}
        >
          {loading ? 'Creating Rate Plan...' : 'Create Rate Plan'}
        </Button>
      </div>
    </div>
  );
}