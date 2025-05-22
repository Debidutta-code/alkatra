"use client"

import React from 'react';

interface BasicInfoFormProps {
  formData: {
    ratePlanName: string;
    ratePlanCode: string;
    description: string;
    mealPlan: 'RO' | 'BB' | 'HB' | 'FB';
    currency: string;
    status: 'active' | 'inactive';
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function BasicInfoForm({ formData, handleChange }: BasicInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>

      <div>
        <label className="block text-sm font-medium">Rate Plan Name</label>
        <input
          type="text"
          name="ratePlanName"
          value={formData.ratePlanName}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Rate Plan Code</label>
        <input
          type="text"
          name="ratePlanCode"
          value={formData.ratePlanCode}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Meal Plan</label>
        <select
          name="mealPlan"
          value={formData.mealPlan}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
        >
          <option value="RO">Room Only</option>
          <option value="BB">Bed & Breakfast</option>
          <option value="HB">Half Board</option>
          <option value="FB">Full Board</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Currency</label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full border rounded p-2"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}