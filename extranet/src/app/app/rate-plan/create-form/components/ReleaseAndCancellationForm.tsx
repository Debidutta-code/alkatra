"use client"

import React from 'react';

interface ReleaseAndCancellationFormProps {
  formData: {
    minReleaseDay: number | string;
    maxReleaseDay: number | string;
    cancellationDeadline: {
      days: number | string;
      hours: number | string;
    };
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: {
    minReleaseDay?: string;
    maxReleaseDay?: string;
    cancellationDeadline: {
      days?: string;
      hours?: string;
    };
  };
}

export default function ReleaseAndCancellationForm({ formData, handleChange, errors }: ReleaseAndCancellationFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Release and Cancellation Details</h3>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Min Release Day</label>
        <input
          type="number"
          name="minReleaseDay"
          value={formData.minReleaseDay}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.minReleaseDay ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.minReleaseDay && (
          <span className="block text-red-500 text-sm mt-1">{errors.minReleaseDay}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Max Release Day</label>
        <input
          type="number"
          name="maxReleaseDay"
          value={formData.maxReleaseDay}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.maxReleaseDay ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.maxReleaseDay && (
          <span className="block text-red-500 text-sm mt-1">{errors.maxReleaseDay}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Cancellation Deadline Days</label>
        <input
          type="number"
          name="cancellationDeadline.days"
          value={formData.cancellationDeadline.days}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.cancellationDeadline.days ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.cancellationDeadline.days && (
          <span className="block text-red-500 text-sm mt-1">{errors.cancellationDeadline.days}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Cancellation Deadline Hours</label>
        <input
          type="number"
          name="cancellationDeadline.hours"
          value={formData.cancellationDeadline.hours}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.cancellationDeadline.hours ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.cancellationDeadline.hours && (
          <span className="block text-red-500 text-sm mt-1">{errors.cancellationDeadline.hours}</span>
        )}
      </div>
    </div>
  );
}