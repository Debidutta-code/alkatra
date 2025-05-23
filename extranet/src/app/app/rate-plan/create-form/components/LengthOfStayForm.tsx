"use client"

import React from 'react';

interface LengthOfStayFormProps {
  formData: {
    minLengthStay: number | string;
    maxLengthStay: number | string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LengthOfStayForm({ formData, handleChange }: LengthOfStayFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Length of Stay</h3>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Min Length of Stay</label>
        <input
          type="number"
          name="minLengthStay"
          value={formData.minLengthStay}
          onChange={handleChange}
          className="w-full p-2 bg-gray-100 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Max Length of Stay</label>
        <input
          type="number"
          name="maxLengthStay"
          value={formData.maxLengthStay}
          onChange={handleChange}
          className="w-full p-2 bg-gray-100 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700"
          min="1"
          required
        />
      </div>
    </div>
  );
}