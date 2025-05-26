"use client"

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@src/components/ui/button';
import BasicInfoForm from './components/BasicInfoForm';
import SchedulingForm from './components/SchedulingForm';
import LengthOfStayForm from './components/LengthOfStayForm';
import ReleaseAndCancellationForm from './components/ReleaseAndCancellationForm';
import BookingAdvanceForm from './components/BookingAdvanceForm';
import { createRatePlan } from './api/ratePlanApi';
import { RatePlanFormData, DateRange } from './types/ratePlanTypes';
import { getInitialFormData } from './constants/initialFormData';
import { RatePlanFormSchema, BaseRatePlanFormSchema } from '../validator/ratePlanFormValidator';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Breadcrumbs from '@src/components/ui/breadcrumbs';

export default function RatePlanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';

  const [formData, setFormData] = useState<RatePlanFormData>(getInitialFormData(propertyId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Update form data
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

    // Validate the changed field
    const partialData = name.includes('.')
      ? { [name.split('.')[0]]: { [name.split('.')[1]]: value } }
      : { [name]: value };

    // For minLengthStay and maxLengthStay, validate both fields with RatePlanFormSchema to check refine rules
    if (name === 'minLengthStay' || name === 'maxLengthStay') {
      const result = RatePlanFormSchema.safeParse(formData);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        // Clear errors for minLengthStay and maxLengthStay
        delete newErrors['minLengthStay'];
        delete newErrors['maxLengthStay'];
        // Add new errors if validation fails
        if (!result.success) {
          result.error.issues.forEach((issue: z.ZodIssue) => {
            const path = issue.path.join('.');
            if (path === 'minLengthStay' || path === 'maxLengthStay') {
              newErrors[path] = issue.message;
            }
          });
        }
        return newErrors;
      });
    } else {
      // For other fields, use partial validation with BaseRatePlanFormSchema
      const partialSchema = BaseRatePlanFormSchema.partial();
      const result = partialSchema.safeParse({ ...formData, ...partialData });

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        // Clear error for the changed field
        delete newErrors[name];
        // Add new errors if validation fails
        if (!result.success) {
          result.error.issues.forEach((issue: z.ZodIssue) => {
            const path = issue.path.join('.');
            if (path === name || path.startsWith(name + '.')) {
              newErrors[path] = issue.message;
            }
          });
        }
        return newErrors;
      });
    }
  };

  const handleSchedulingTypeChange = (type: 'weekly' | 'date_range' | 'specific-dates') => {
    setFormData((prev) => ({
      ...prev,
      scheduling: { ...prev.scheduling, type, weeklyDays: [], dateRanges: [], availableSpecificDates: [] },
    }));
    // Clear scheduling-related errors
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith('scheduling.')) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const handleWeeklyDaysChange = (day: string) => {
    const weeklyDays = formData.scheduling.weeklyDays.includes(day)
      ? formData.scheduling.weeklyDays.filter((d) => d !== day)
      : [...formData.scheduling.weeklyDays, day];
    setFormData((prev) => ({
      ...prev,
      scheduling: { ...prev.scheduling, weeklyDays },
    }));
    // Validate scheduling
    const schedulingSchema = BaseRatePlanFormSchema.shape.scheduling;
    const result = schedulingSchema.safeParse(formData.scheduling);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors['scheduling.weeklyDays'];
      if (!result.success) {
        result.error.issues.forEach((issue: z.ZodIssue) => {
          newErrors[`scheduling.${issue.path.join('.')}`] = issue.message;
        });
      }
      return newErrors;
    });
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
    // Validate dateRanges
    const schedulingSchema = BaseRatePlanFormSchema.shape.scheduling;
    const result = schedulingSchema.safeParse(formData.scheduling);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`scheduling.dateRanges.${index}.${field}`];
      if (!result.success) {
        result.error.issues.forEach((issue: z.ZodIssue) => {
          newErrors[`scheduling.${issue.path.join('.')}`] = issue.message;
        });
      }
      return newErrors;
    });
  };

  const removeDateRange = (index: number) => {
    const dateRanges = formData.scheduling.dateRanges.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      scheduling: { ...prev.scheduling, dateRanges },
    }));
    // Clear errors for removed date range
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`scheduling.dateRanges.${index}.start`];
      delete newErrors[`scheduling.dateRanges.${index}.end`];
      return newErrors;
    });
  };

  const handleSpecificDatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dates = e.target.value.split(',').map((date) => date.trim());
    setFormData((prev) => ({
      ...prev,
      scheduling: { ...prev.scheduling, availableSpecificDates: dates },
    }));
    // Validate specific dates
    const schedulingSchema = BaseRatePlanFormSchema.shape.scheduling;
    const result = schedulingSchema.safeParse(formData.scheduling);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors['scheduling.availableSpecificDates'];
      if (!result.success) {
        result.error.issues.forEach((issue: z.ZodIssue) => {
          newErrors[`scheduling.${issue.path.join('.')}`] = issue.message;
        });
      }
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setValidationErrors({});

    // Validate the entire form data with the full schema (including refinements)
    const result = RatePlanFormSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      setValidationErrors(errors);
      setError('Kindly review and correct the highlighted fields to proceed with your submission.');
      setLoading(false);
      return;
    }

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

      const currentTimestamp = new Date().toISOString();

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
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/app/rate-plan/get-rate-plan/?propertyId=${propertyId}`);
  };

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
              <Breadcrumbs />
            </div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Rate Plan</h2>

      {error && (
        <div className="mb-6 text-red-500 text-center">
          {error}
        </div>
      )}

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
          <BasicInfoForm
            formData={formData}
            handleChange={handleChange}
            errors={{
              ratePlanName: validationErrors['ratePlanName'],
              ratePlanCode: validationErrors['ratePlanCode'],
              description: validationErrors['description'],
              mealPlan: validationErrors['mealPlan'],
              currency: validationErrors['currency'],
              status: validationErrors['status'],
            }}
          />
          <LengthOfStayForm
            formData={formData}
            handleChange={handleChange}
            errors={{
              minLengthStay: validationErrors['minLengthStay'],
              maxLengthStay: validationErrors['maxLengthStay'],
            }}
          />
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
            errors={{
              type: validationErrors['scheduling.type'],
              weeklyDays: validationErrors['scheduling.weeklyDays'],
              dateRanges: formData.scheduling.dateRanges.map((_, index) => ({
                start: validationErrors[`scheduling.dateRanges.${index}.start`],
                end: validationErrors[`scheduling.dateRanges.${index}.end`],
              })),
              availableSpecificDates: validationErrors['scheduling.availableSpecificDates'],
            }}
          />
          <ReleaseAndCancellationForm
            formData={formData}
            handleChange={handleChange}
            errors={{
              minReleaseDay: validationErrors['minReleaseDay'],
              maxReleaseDay: validationErrors['maxReleaseDay'],
              cancellationDeadline: {
                days: validationErrors['cancellationDeadline.days'],
                hours: validationErrors['cancellationDeadline.hours'],
              },
            }}
          />
          {/* <BookingAdvanceForm
            formData={formData}
            handleChange={handleChange}
            errors={{
              minBookAdvance: validationErrors['minBookAdvance'],
              maxBookAdvance: validationErrors['maxBookAdvance'],
            }}
          /> */}
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
          {loading ? 'Creating Rate...' : 'Create Rate Plan'}
        </Button>
      </div>
    </div>
  );
}