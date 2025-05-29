"use client"; // Mark this file as a Client Component

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@src/components/ui/button'; // Adjust path as needed
import RatePlanTable from './components/RatePlanTable';
import RatePlanDropdown from './components/RatePlanDropdown';
import { getRatePlansService, deleteRatePlanService } from './services';
import { RatePlan } from './types';
import Breadcrumbs from '@src/components/ui/breadcrumbs';

export default function GetRatePlan() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Fetch rate plans
  useEffect(() => {
    if (propertyId) {
      const fetchData = async () => {
        try {
          const data = await getRatePlansService(propertyId);
          setRatePlans(data);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch rate plans.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
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

  // Toggle dropdown
  const toggleDropdown = (ratePlanId: string) => {
    setOpenDropdownId(openDropdownId === ratePlanId ? null : ratePlanId);
  };

  // Handle edit action
  const handleEdit = (ratePlanId: string) => {
    router.push(`/app/rate-plan/map-rate-plan?propertyId=${propertyId}&ratePlanId=${ratePlanId}`);
    setOpenDropdownId(null);
  };

  // Handle delete action
  const handleDelete = async (ratePlanId: string) => {
    try {
      await deleteRatePlanService(ratePlanId);
      setRatePlans(ratePlans.filter((plan) => plan._id !== ratePlanId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete rate plan.');
    } finally {
      setOpenDropdownId(null);
    }
  };

  // Calculate dropdown position
  const getDropdownPosition = (ratePlanId: string) => {
    const button = buttonRefs.current.get(ratePlanId);
    if (!button) return { top: 0, right: 0 };

    const rect = button.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    return {
      top: rect.bottom + scrollY + 8,
      right: window.innerWidth - rect.right + scrollX - 10,
    };
  };

  // Conditional rendering
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
      <Breadcrumbs />
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
        <RatePlanTable ratePlans={ratePlans} toggleDropdown={toggleDropdown} buttonRefs={buttonRefs} />
        {openDropdownId &&
          ratePlans
            .filter((ratePlan) => ratePlan._id === openDropdownId)
            .map((ratePlan) => {
              const { top, right } = getDropdownPosition(ratePlan._id);
              return (
                <RatePlanDropdown
                  key={ratePlan._id}
                  ratePlan={ratePlan}
                  top={top}
                  right={right}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  dropdownRef={dropdownRef}
                />
              );
            })}
      </div>
    </div>
  );
}