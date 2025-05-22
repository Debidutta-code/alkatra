"use client"

import React from 'react';

interface BookingAdvanceFormProps {
  formData: {
    minBookAdvance: number;
    maxBookAdvance: number;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function BookingAdvanceForm({ formData, handleChange }: BookingAdvanceFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Booking Advance</h3>

      <div>
        <label className="block text-sm font-medium">Min Book Advance (days)</label>
        <input
          type="number"
          name="minBookAdvance"
          value={formData.minBookAdvance}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Max Book Advance (days)</label>
        <input
          type="number"
          name="maxBookAdvance"
          value={formData.maxBookAdvance}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="0"
          required
        />
      </div>
    </div>
  );
}