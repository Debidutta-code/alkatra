"use client"

import React from 'react';

interface OccupancyFormProps {
  formData: {
    maxOccupancy: number;
    adultOccupancy: number;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function OccupancyForm({ formData, handleChange }: OccupancyFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Occupancy Details</h3>

      <div>
        <label className="block text-sm font-medium">Max Occupancy</label>
        <input
          type="number"
          name="maxOccupancy"
          value={formData.maxOccupancy}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Adult Occupancy</label>
        <input
          type="number"
          name="adultOccupancy"
          value={formData.adultOccupancy}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="1"
          required
        />
      </div>
    </div>
  );
}