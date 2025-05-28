"use client"

import React from 'react';

interface DateRange {
  start: string;
  end: string;
}

interface SchedulingFormProps {
  scheduling: {
    type: 'weekly' | 'date_range' | 'specific-dates';
    weeklyDays: string[];
    dateRanges: DateRange[];
    availableSpecificDates: string[];
  };
  handleSchedulingTypeChange: (type: 'weekly' | 'date_range' | 'specific-dates') => void;
  handleWeeklyDaysChange: (day: string) => void;
  addDateRange: () => void;
  updateDateRange: (index: number, field: 'start' | 'end', value: string) => void;
  removeDateRange: (index: number) => void;
  handleSpecificDatesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: {
    type?: string;
    weeklyDays?: string;
    dateRanges: Array<{ start?: string; end?: string }>;
    availableSpecificDates?: string;
  };
}

export default function SchedulingForm({
  scheduling,
  handleSchedulingTypeChange,
  handleWeeklyDaysChange,
  addDateRange,
  updateDateRange,
  removeDateRange,
  handleSpecificDatesChange,
  errors,
}: SchedulingFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Scheduling Details</h3>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Scheduling Type</label>
        <select
          value={scheduling.type}
          onChange={(e) => handleSchedulingTypeChange(e.target.value as 'weekly' | 'date_range' | 'specific-dates')}
          className={`w-full p-2 pr-8 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
            errors.type ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          <option value="weekly">Weekly</option>
          <option value="date_range">Date Range</option>
          <option value="specific-dates">Specific Dates</option>
        </select>
        {errors.type && (
          <span className="block text-red-500 text-sm mt-1">{errors.type}</span>
        )}
      </div>

      {scheduling.type === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Weekly Days</label>
          <div className={`space-y-2 ${errors.weeklyDays ? 'border border-red-500 rounded p-2' : ''}`}>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <label key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={scheduling.weeklyDays.includes(day)}
                  onChange={() => handleWeeklyDaysChange(day)}
                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-300"
                />
                <span className="text-gray-700">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
              </label>
            ))}
          </div>
          {errors.weeklyDays && (
            <span className="block text-red-500 text-sm mt-1">{errors.weeklyDays}</span>
          )}
        </div>
      )}

      {scheduling.type === 'date_range' && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Date Ranges</label>
          {scheduling.dateRanges.map((range, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <div className="flex-1">
                <input
                  type="date"
                  value={range.start}
                  onChange={(e) => updateDateRange(index, 'start', e.target.value)}
                  className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
                    errors.dateRanges[index]?.start ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.dateRanges[index]?.start && (
                  <span className="block text-red-500 text-sm mt-1">{errors.dateRanges[index].start}</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={range.end}
                  onChange={(e) => updateDateRange(index, 'end', e.target.value)}
                  className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
                    errors.dateRanges[index]?.end ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.dateRanges[index]?.end && (
                  <span className="block text-red-500 text-sm mt-1">{errors.dateRanges[index].end}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeDateRange(index)}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDateRange}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors duration-200"
          >
            Add Date Range
          </button>
        </div>
      )}

      {scheduling.type === 'specific-dates' && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Specific Dates (comma-separated)</label>
          <input
            type="text"
            value={scheduling.availableSpecificDates.join(', ')}
            onChange={handleSpecificDatesChange}
            className={`w-full p-2 bg-gray-100 border rounded focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-700 ${
              errors.availableSpecificDates ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="YYYY-MM-DD, YYYY-MM-DD, ..."
          />
          {errors.availableSpecificDates && (
            <span className="block text-red-500 text-sm mt-1">{errors.availableSpecificDates}</span>
          )}
        </div>
      )}
    </div>
  );
}