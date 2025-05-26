"use client"; // Mark this file as a Client Component

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@src/components/ui/button'; // Adjust path as needed
import Cookies from 'js-cookie';
import { MoreVertical } from 'lucide-react'; // Icon for three-dot menu
import { createPortal } from 'react-dom'; // For rendering dropdown outside the table

// Define the RatePlan type based on the API response
type RatePlan = {
  _id: string;
  ratePlanCode: string;
  ratePlanName: string;
  description: string;
  mealPlan: string;
  currency: string;
  status: string;
  scheduling: {
    type: string;
  };
};

export default function GetRatePlan() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // Track open dropdown
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown to handle click outside
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map()); // Refs for each three-dot button

  // Fetch rate plans when propertyId is available
  useEffect(() => {
    if (propertyId) {
      const fetchRatePlans = async () => {
        try {
          const accessToken = Cookies.get('accessToken');
          if (!accessToken) {
            setError('No access token found. Please log in.');
            setIsLoading(false);
            return;
          }

          const response = await fetch(`http://localhost:8080/api/v1/rate-plan/${propertyId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          const result = await response.json();
          if (result.success) {
            setRatePlans(result.data || []);
          } else {
            setError(result.message || 'Failed to retrieve rate plans.');
          }
        } catch (error) {
          setError('Failed to fetch rate plans. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchRatePlans();
    }
  }, [propertyId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown for a specific rate plan
  const toggleDropdown = (ratePlanId: string) => {
    setOpenDropdownId(openDropdownId === ratePlanId ? null : ratePlanId);
  };

  // Handle edit action
  const handleEdit = (ratePlanId: string) => {
    router.push(`/app/rate-plan/edit-form?propertyId=${propertyId}&ratePlanId=${ratePlanId}`);
    setOpenDropdownId(null);
  };

  // Handle delete action
  const handleDelete = async (ratePlanId: string) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('No access token found. Please log in.');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/v1/rate-plan/${ratePlanId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        // Remove the deleted rate plan from the state
        setRatePlans(ratePlans.filter((plan) => plan._id !== ratePlanId));
      } else {
        setError(result.message || 'Failed to delete rate plan.');
      }
    } catch (error) {
      setError('Failed to delete rate plan. Please try again later.');
    } finally {
      setOpenDropdownId(null);
    }
  };

  // Calculate dropdown position based on the button's position
  const getDropdownPosition = (ratePlanId: string) => {
    const button = buttonRefs.current.get(ratePlanId);
    if (!button) return { top: 0, right: 0 };

    const rect = button.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    return {
      top: rect.bottom + scrollY + 8, // Position below the button with a small offset
      right: window.innerWidth - rect.right + scrollX - 10, // Align right edge with the button
    };
  };

  // Conditional rendering based on state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] bg-gray-50">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">
          Loading Rate Plans...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] bg-gray-50">
        <div className="text-lg font-medium text-red-600 bg-red-50 px-6 py-3 rounded-lg shadow-md">
          {error}
        </div>
      </div>
    );
  }

  if (ratePlans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] bg-gray-50">
        <div className="text-lg font-medium text-gray-600 bg-gray-100 px-6 py-3 rounded-lg shadow-md">
          No rate plans found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] bg-gray-50 p-6 sm:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header Section - Fixed */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rate Plans</h1>
          <Button
            variant="default"
            onClick={() => router.push(`/app/rate-plan/create-rate-plan?propertyId=${propertyId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
          >
            Create New Rate Plan
          </Button>
        </div>

        {/* Table Section - Scrollable */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto max-h-[calc(100vh-200px)]">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Rate Plan Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Rate Plan Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Meal Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Scheduling
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ratePlans.map((ratePlan) => (
                  <tr key={ratePlan._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {ratePlan.ratePlanCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ratePlan.ratePlanName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ratePlan.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ratePlan.mealPlan}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ratePlan.currency}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ratePlan.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ratePlan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ratePlan.scheduling.type}
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <button
                        ref={(el) => {
                          if (el) {
                            buttonRefs.current.set(ratePlan._id, el);
                          } else {
                            buttonRefs.current.delete(ratePlan._id);
                          }
                        }}
                        onClick={() => toggleDropdown(ratePlan._id)}
                        className="text-gray-600 hover:text-gray-900 focus:outline-none"
                        aria-label="More actions"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Render Dropdowns via Portal */}
        {openDropdownId &&
          ratePlans
            .filter((ratePlan) => ratePlan._id === openDropdownId)
            .map((ratePlan) => {
              const { top, right } = getDropdownPosition(ratePlan._id);
              return createPortal(
                <div
                  ref={dropdownRef}
                  className="fixed bg-white shadow-lg rounded-lg z-50 min-w-[150px]"
                  style={{ top: `${top}px`, right: `${right}px` }}
                >
                  <button
                    onClick={() => handleEdit(ratePlan._id)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                  >
                    Edit Rate Plan
                  </button>
                  <button
                    onClick={() => handleDelete(ratePlan._id)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-900 transition-colors duration-150"
                  >
                    Delete Rate Plan
                  </button>
                  <div className="absolute bottom-[-5px] right-3 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45" />
                </div>,
                document.body
              );
            })}
      </div>
    </div>
  );
}