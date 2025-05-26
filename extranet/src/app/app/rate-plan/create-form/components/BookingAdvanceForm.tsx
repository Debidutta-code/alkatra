"use client"

import React from 'react';

interface BookingAdvanceFormProps {
  formData: {
    minBookAdvance: number;
    maxBookAdvance: number;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  errors: {
    minBookAdvance?: string;
    maxBookAdvance?: string;
  };
}

export default function BookingAdvanceForm({ formData, handleChange, errors }: BookingAdvanceFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Booking Advance</h3>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Min Book Advance (days)</label>
        <input
          type="number"
          name="minBookAdvance"
          value={formData.minBookAdvance}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.minBookAdvance ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.minBookAdvance && (
          <span className="block text-red-500 text-sm mt-1">{errors.minBookAdvance}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Max Book Advance (days)</label>
        <input
          type="number"
          name="maxBookAdvance"
          value={formData.maxBookAdvance}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.maxBookAdvance ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.maxBookAdvance && (
          <span className="block text-red-500 text-sm mt-1">{errors.maxBookAdvance}</span>
        )}
      </div>
    </div>
  );
}