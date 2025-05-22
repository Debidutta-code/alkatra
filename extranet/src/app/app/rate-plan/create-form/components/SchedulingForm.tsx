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
}

export default function SchedulingForm({
  scheduling,
  handleSchedulingTypeChange,
  handleWeeklyDaysChange,
  addDateRange,
  updateDateRange,
  removeDateRange,
  handleSpecificDatesChange,
}: SchedulingFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Scheduling Details</h3>

      <div>
        <label className="block text-sm font-medium">Scheduling Type</label>
        <select
          value={scheduling.type}
          onChange={(e) => handleSchedulingTypeChange(e.target.value as any)}
          className="mt-1 block w-full border rounded p-2"
        >
          <option value="weekly">Weekly</option>
          <option value="date_range">Date Range</option>
          <option value="specific-dates">Specific Dates</option>
        </select>
      </div>

      {scheduling.type === 'weekly' && (
        <div>
          <label className="block text-sm font-medium">Weekly Days</label>
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <label key={day} className="block">
              <input
                type="checkbox"
                checked={scheduling.weeklyDays.includes(day)}
                onChange={() => handleWeeklyDaysChange(day)}
              />
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </label>
          ))}
        </div>
      )}

      {scheduling.type === 'date_range' && (
        <div>
          <label className="block text-sm font-medium">Date Ranges</label>
          {scheduling.dateRanges.map((range, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="date"
                value={range.start}
                onChange={(e) => updateDateRange(index, 'start', e.target.value)}
                className="border rounded p-2"
              />
              <input
                type="date"
                value={range.end}
                onChange={(e) => updateDateRange(index, 'end', e.target.value)}
                className="border rounded p-2"
              />
              <button
                type="button"
                onClick={() => removeDateRange(index)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDateRange}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Add Date Range
          </button>
        </div>
      )}

      {scheduling.type === 'specific-dates' && (
        <div>
          <label className="block text-sm font-medium">Specific Dates (comma-separated)</label>
          <input
            type="text"
            value={scheduling.availableSpecificDates.join(', ')}
            onChange={handleSpecificDatesChange}
            className="mt-1 block w-full border rounded p-2"
            placeholder="YYYY-MM-DD, YYYY-MM-DD, ..."
          />
        </div>
      )}
    </div>
  );
}