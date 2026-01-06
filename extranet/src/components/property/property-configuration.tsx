"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

type Props = {
  onNext: () => void;
  onPrevious?: () => void;
};

interface DataSourceProvider {
  _id: string;
  name: string;
  type: 'PMS' | 'CM' | 'Internal';
  isActive: boolean;
  apiEndpoint?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConfigGroup {
  type: 'pms' | 'cm' | 'internal';
  label: string;
  description: string;
  icon: string;
}

const configGroups: ConfigGroup[] = [
  { 
    type: 'pms', 
    label: 'PMS (Property Management System)', 
    description: 'Connect with external PMS like WinCloud',
    icon: '🏨'
  },
  { 
    type: 'cm', 
    label: 'CM (Channel Manager)', 
    description: 'Manage distributions across booking platforms',
    icon: '📡'
  },
  { 
    type: 'internal', 
    label: 'Internal', 
    description: 'Properties managed only within our system',
    icon: '🔒'
  },
];

export default function PropertyConfiguration({ onNext }: Props) {
  const [selectedType, setSelectedType] = useState<'pms' | 'cm' | 'internal'>('pms');
  const [pmsConfigs, setPmsConfigs] = useState<DataSourceProvider[]>([]);
  const [cmConfigs, setCmConfigs] = useState<DataSourceProvider[]>([]);
  const [internalConfigs, setInternalConfigs] = useState<DataSourceProvider[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [configsLoading, setConfigsLoading] = useState(false);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Fetch all configurations on mount
  useEffect(() => {
    const fetchAllConfigs = async () => {
      setLoading(true);
      try {
        // Fetch PMS providers
        const pmsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/data-sources/providers?type=PMS`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setPmsConfigs(pmsResponse.data.data || []);

        // Fetch CM providers
        const cmResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/data-sources/providers?type=CM`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setCmConfigs(cmResponse.data.data || []);

        // Fetch Internal providers
        const internalResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/data-sources/providers?type=Internal`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setInternalConfigs(internalResponse.data.data || []);

        // Auto-select first available provider for each type
        if (pmsResponse.data.data && pmsResponse.data.data.length > 0) {
          setSelectedType('pms');
          setSelectedConfigId(pmsResponse.data.data[0]._id);
        } else if (cmResponse.data.data && cmResponse.data.data.length > 0) {
          setSelectedType('cm');
          setSelectedConfigId(cmResponse.data.data[0]._id);
        } else if (internalResponse.data.data && internalResponse.data.data.length > 0) {
          setSelectedType('internal');
          setSelectedConfigId(internalResponse.data.data[0]._id);
        }

      } catch (error) {
        console.error('Error fetching configurations:', error);
        toast.error('Failed to fetch data source providers');
      } finally {
        setLoading(false);
      }
    };

    fetchAllConfigs();
  }, [accessToken]);

  const getCurrentConfigs = (): DataSourceProvider[] => {
    switch (selectedType) {
      case 'pms': return pmsConfigs;
      case 'cm': return cmConfigs;
      case 'internal': return internalConfigs;
      default: return [];
    }
  };

  const getConfigById = (id: string): DataSourceProvider | undefined => {
    if (selectedType === 'pms') return pmsConfigs.find(c => c._id === id);
    if (selectedType === 'cm') return cmConfigs.find(c => c._id === id);
    if (selectedType === 'internal') return internalConfigs.find(c => c._id === id);
    return undefined;
  };

  const canProceed = (): boolean => {
    // For internal, always proceed
    if (selectedType === 'internal') return true;
    // For PMS/CM, need to select a config
    return !!selectedConfigId;
  };

  const handleNext = () => {
    const selectedConfig = getConfigById(selectedConfigId);

    // Store selected config in localStorage
    localStorage.setItem('selectedPropertyDataSource', JSON.stringify({
      type: selectedType,
      providerId: selectedConfigId,
      providerName: selectedConfig?.name || 'Internal',
      providerType: selectedConfig?.type || 'Internal',
      apiEndpoint: selectedConfig?.apiEndpoint,
      description: selectedConfig?.description,
    }));
    onNext();
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as 'pms' | 'cm' | 'internal');

    // Auto-select first available config for the new type
    const configs = value === 'pms' ? pmsConfigs :
                   value === 'cm' ? cmConfigs :
                   internalConfigs;

    if (configs.length > 0) {
      setSelectedConfigId(configs[0]._id);
    } else {
      setSelectedConfigId('');
    }
  };

  const currentConfigs = getCurrentConfigs();
  const hasConfigs = currentConfigs.length > 0;
  const selectedConfig = getConfigById(selectedConfigId);

  return (
    <div className="space-y-6 p-6 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Select Property Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Type Selection */}
          <div>
            <Label className="text-base font-medium">Configuration Type</Label>
            <RadioGroup value={selectedType} onValueChange={handleTypeChange} className="mt-3 space-y-3">
              {configGroups.map((group) => (
                <div
                  key={group.type}
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedType === group.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTypeChange(group.type)}
                >
                  <RadioGroupItem
                    value={group.type}
                    id={group.type}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={group.type}
                      className="font-medium cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-lg">{group.icon}</span>
                      {group.label}
                    </Label>
                    <p className="text-sm text-gray-500 mt-1 ml-7">
                      {group.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Configurations Selection */}
          {selectedType !== 'internal' && (
            <div>
              <Label className="text-base font-medium">
                Available {selectedType === 'pms' ? 'PMS' : 'Channel Manager'} Configurations
              </Label>
              
              {loading ? (
                <div className="mt-3 flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-500">Loading configurations...</span>
                </div>
              ) : hasConfigs ? (
                <RadioGroup value={selectedConfigId} onValueChange={setSelectedConfigId} className="mt-3 space-y-2">
                  {currentConfigs.map((config) => (
                    <div
                      key={config._id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedConfigId === config._id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedConfigId(config._id)}
                    >
                      <RadioGroupItem
                        value={config._id}
                        id={config._id}
                      />
                      <Label
                        htmlFor={config._id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{config.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                            {config.type}
                          </span>
                          {config.description && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {config.description}
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <p className="text-gray-500">No {selectedType === 'pms' ? 'PMS' : 'CM'} configurations available.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Please create a configuration first or contact your administrator.
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedType === 'internal' && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Internal Configuration Selected
                </p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1 ml-7">
                Properties created as Internal will be managed only within our server system without external integrations.
              </p>
            </div>
          )}

          {/* Selected Config Summary */}
          {selectedConfigId && selectedType !== 'internal' && selectedConfig && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Selected:</span> {selectedConfig.name}
                {selectedConfig.type && ` (${selectedConfig.type})`}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleNext} 
              disabled={!canProceed()}
              className="w-[120px]"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
