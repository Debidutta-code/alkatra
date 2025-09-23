// app/rate-plan/create-rate-plan/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { CreateRatePlanForm } from './components/CreateRatePlanForm';
import { CreateInventoryForm } from '../create-inventory/components/CreateInventoryForm';
import { getAllRatePlanServices } from '../map-rate-plan/services/dataService';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SUPPORTED_CURRENCIES } from './constants/index';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@src/components/ui/tabs';
import { Button } from '@src/components/ui/button';

const CreateRatePlanPage = () => {
  const [roomTypes, setRoomTypes] = useState<{ invTypeCode: string; ratePlanCodes?: string[] }[]>([]);
  const [currencies, setCurrencies] = useState<string[]>(SUPPORTED_CURRENCIES);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ratePlan' | 'inventory'>('ratePlan');
  const [isRatePlanCreated, setIsRatePlanCreated] = useState(false);
  const [createdRatePlanData, setCreatedRatePlanData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const data = await getAllRatePlanServices();
        if (data?.roomTypes) {
          setRoomTypes(data.roomTypes);
        }
      } catch (error) {
        toast.error('Failed to load room types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const handleRatePlanSuccess = (formData: any) => {
    setCreatedRatePlanData(formData);
    setIsRatePlanCreated(true);
    setActiveTab('inventory');

    // Ensure session has latest hotelCode
    if (formData.hotelCode) {
      sessionStorage.setItem('hotelCode', formData.hotelCode);
    }
  };

  const handleInventorySuccess = () => {
    sessionStorage.setItem('ratePlanCreateSuccess', 'true');

    // Get propertyCode — from created rate plan or fallback to session
    const propertyCode = createdRatePlanData?.hotelCode || sessionStorage.getItem('hotelCode') || '';

    if (propertyCode) {
      router.push(`/app/rate-plan/map-rate-plan?propertyCode=${encodeURIComponent(propertyCode)}`);
    } else {
      router.push('/app/rate-plan/map-rate-plan');
    }
  };

  const hotelCode = sessionStorage.getItem('hotelCode') || '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* ← Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </Button>
        </div>

        <h1 className="text-2xl font-tripswift-bold text-gray-900 mb-6">
          Create Rate Plan & Inventory
        </h1>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ratePlan' | 'inventory')} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ratePlan" className="text-sm font-medium">
              Step 1: Create Rate Plan
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-sm font-medium">
              Step 2: Create Inventory
            </TabsTrigger>
          </TabsList>

          {/* Tab Content: Rate Plan */}
          <TabsContent value="ratePlan">
            <CreateRatePlanForm
              hotelCode={hotelCode}
              roomTypes={roomTypes}
              currencies={currencies}
              onSuccess={handleRatePlanSuccess}
            />
          </TabsContent>

          {/* Tab Content: Inventory */}
          <TabsContent value="inventory">
            {createdRatePlanData ? (
              <CreateInventoryForm
                hotelCode={createdRatePlanData.hotelCode}
                invTypeCode={createdRatePlanData.invTypeCode}
                roomTypes={roomTypes.map(rt => rt.invTypeCode)}
                onSuccess={handleInventorySuccess}
                onCancel={() => setActiveTab('ratePlan')}
              />
            ) : (
              <div className="p-6 border border-gray-100 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <CreateInventoryForm
                      hotelCode={hotelCode}
                      invTypeCode=""
                      roomTypes={roomTypes.map(rt => rt.invTypeCode)}
                      onSuccess={handleInventorySuccess}
                      onCancel={() => setActiveTab('ratePlan')}
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateRatePlanPage;