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
}

export default function ReleaseAndCancellationForm({ formData, handleChange }: ReleaseAndCancellationFormProps) {
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
          className="w-full p-2 bg-gray-100 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Max Release Day</label>
        <input
          type="number"
          name="maxReleaseDay"
          value={formData.maxReleaseDay}
          onChange={handleChange}
          className="w-full p-2 bg-gray-100 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Cancellation Deadline Days</label>
        <input
          type="number"
          name="cancellationDeadline.days"
          value={formData.cancellationDeadline.days}
          onChange={handleChange}
          className="w-full p-2 bg-gray-100 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Cancellation Deadline Hours</label>
        <input
          type="number"
          name="cancellationDeadline.hours"
          value={formData.cancellationDeadline.hours}
          onChange={handleChange}
          className="w-full p-2 bg-gray-100 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
          min="0"
          max="23"
          required
        />
      </div>
    </div>
  );
}