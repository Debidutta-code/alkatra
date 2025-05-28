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
  errors: {
    ratePlanName?: string;
    ratePlanCode?: string;
    description?: string;
    mealPlan?: string;
    currency?: string;
    status?: string;
  };
}

export default function BasicInfoForm({ formData, handleChange, errors }: BasicInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Rate Plan Name</label>
        <input
          type="text"
          name="ratePlanName"
          value={formData.ratePlanName}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.ratePlanName ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.ratePlanName && (
          <span className="block text-red-500 text-sm mt-1">{errors.ratePlanName}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Rate Plan Code</label>
        <input
          type="text"
          name="ratePlanCode"
          value={formData.ratePlanCode}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.ratePlanCode ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.ratePlanCode && (
          <span className="block text-red-500 text-sm mt-1">{errors.ratePlanCode}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.description ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.description && (
          <span className="block text-red-500 text-sm mt-1">{errors.description}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Meal Plan</label>
        <select
          name="mealPlan"
          value={formData.mealPlan}
          onChange={handleChange}
          className={`w-full p-2 pr-10 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px_16px] ${
            errors.mealPlan ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          <option value="RO">Room Only</option>
          <option value="BB">Bed & Breakfast</option>
          <option value="HB">Half Board</option>
          <option value="FB">Full Board</option>
        </select>
        {errors.mealPlan && (
          <span className="block text-red-500 text-sm mt-1">{errors.mealPlan}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Currency</label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className={`w-full p-2 pr-10 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px_16px] ${
            errors.currency ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
        {errors.currency && (
          <span className="block text-red-500 text-sm mt-1">{errors.currency}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`w-full p-2 pr-10 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px_16px] ${
            errors.status ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {errors.status && (
          <span className="block text-red-500 text-sm mt-1">{errors.status}</span>
        )}
      </div>
    </div>
  );
}