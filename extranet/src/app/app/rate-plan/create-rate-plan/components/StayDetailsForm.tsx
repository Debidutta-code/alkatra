"use client"

import React from 'react';

interface StayDetailsFormProps {
  formData: {
    minLengthStay: number;
    maxLengthStay: number;
    minReleaseDay: number;
    maxReleaseDay: number;
    cancellationDeadline: {
      days: number;
      hours: number;
    };
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function StayDetailsForm({ formData, handleChange }: StayDetailsFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Stay Details</h3>

      <div>
        <label className="block text-sm font-medium">Min Length of Stay</label>
        <input
          type="number"
          name="minLengthStay"
          value={formData.minLengthStay}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Max Length of Stay</label>
        <input
          type="number"
          name="maxLengthStay"
          value={formData.maxLengthStay}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Min Release Day</label>
        <input
          type="number"
          name="minReleaseDay"
          value={formData.minReleaseDay}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Max Release Day</label>
        <input
          type="number"
          name="maxReleaseDay"
          value={formData.maxReleaseDay}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Cancellation Deadline Days</label>
        <input
          type="number"
          name="cancellationDeadline.days"
          value={formData.cancellationDeadline.days}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Cancellation Deadline Hours</label>
        <input
          type="number"
          name="cancellationDeadline.hours"
          value={formData.cancellationDeadline.hours}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          min="0"
        />
      </div>
    </div>
  );
}