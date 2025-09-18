// app/rate-plan/create/CreateRatePlanForm.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@src/components/ui/button';
import { Input } from '@src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/components/ui/select';
import { Checkbox } from '@src/components/ui/checkbox';
import { Calendar } from '../../map-rate-plan/components/Calender';
import { Popover, PopoverTrigger, PopoverContent } from '../../map-rate-plan/components/Popover';
import { format } from '../../map-rate-plan/utils/dateUtils';
import { CreateRatePlanPayload } from '../types/index';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useRatePlanCreate } from '../services/createService';
import { createRatePlanSchema } from '../schema';
import toast from 'react-hot-toast';

interface CreateRatePlanFormProps {
    hotelCode: string;
    roomTypes: { invTypeCode: string }[];
    currencies: string[];
    onSuccess?: (data: CreateRatePlanPayload) => void;
}

export const CreateRatePlanForm: React.FC<CreateRatePlanFormProps> = ({
    hotelCode,
    roomTypes,
    currencies,
    onSuccess,
}) => {
    const { createRatePlan, isLoading } = useRatePlanCreate();
    const [formData, setFormData] = useState<CreateRatePlanPayload>({
        hotelCode,
        invTypeCode: '',
        ratePlanCode: '',
        startDate: '',
        endDate: '',
        currencyCode: 'USD',
        days: {
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: true,
            sun: true,
        },
        baseGuestAmounts: [{ numberOfGuests: 1, amountBeforeTax: 0 }],
        additionalGuestAmounts: [{ ageQualifyingCode: 10, amount: 0 }],
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [errors, setErrors] = useState<Partial<Record<keyof CreateRatePlanPayload | 'baseGuestAmounts' | 'additionalGuestAmounts', string>>>({});

    // Age category options with labels
    const ageCategoryOptions = [
        { value: 10, label: 'Adult' },
        { value: 8, label: 'Child' },
        { value: 7, label: 'Infant' }
    ];

    // Get next available age category
    const getNextAvailableAgeCategory = () => {
        const usedCategories = formData.additionalGuestAmounts.map(item => item.ageQualifyingCode);
        const availableCategory = ageCategoryOptions.find(option => !usedCategories.includes(option.value));
        return availableCategory?.value || 10; // Default to Adult if all are used (shouldn't happen with max 3)
    };

    // Check if age category is available for a specific index
    const isAgeCategoryAvailable = (categoryCode: number, currentIndex: number) => {
        const usedCategories = formData.additionalGuestAmounts
            .map((item, index) => index !== currentIndex ? item.ageQualifyingCode : null)
            .filter(code => code !== null);
        return !usedCategories.includes(categoryCode);
    };

    const handleInputChange = (field: keyof CreateRatePlanPayload, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleDayToggle = (day: keyof CreateRatePlanPayload['days']) => {
        setFormData(prev => ({
            ...prev,
            days: { ...prev.days, [day]: !prev.days[day] },
        }));
    };

    const validateAmountOrder = (index: number, newAmount: number) => {
        // Check if new amount is greater than previous guest amount
        if (index > 0) {
            const previousAmount = formData.baseGuestAmounts[index - 1].amountBeforeTax;
            if (newAmount <= previousAmount) {
                return false;
            }
        }

        // Check if new amount is less than next guest amount
        if (index < formData.baseGuestAmounts.length - 1) {
            const nextAmount = formData.baseGuestAmounts[index + 1].amountBeforeTax;
            if (nextAmount > 0 && newAmount >= nextAmount) {
                return false;
            }
        }

        return true;
    };

    const handleBaseGuestChange = (index: number, field: 'numberOfGuests' | 'amountBeforeTax', value: number) => {
        if (value < 0) return;

        const updated = [...formData.baseGuestAmounts];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, baseGuestAmounts: updated }));

        if (field === 'amountBeforeTax' && value > 0 && errors.baseGuestAmounts) {
            setErrors(prev => ({ ...prev, baseGuestAmounts: undefined }));
        }
    };

    const addAdditionalGuest = () => {
        // Don't add if we already have all 3 categories
        if (formData.additionalGuestAmounts.length >= 3) {
            toast.error('Maximum 3 age categories allowed');
            return;
        }

        const nextAvailableCategory = getNextAvailableAgeCategory();
        setFormData(prev => ({
            ...prev,
            additionalGuestAmounts: [...prev.additionalGuestAmounts, { ageQualifyingCode: nextAvailableCategory, amount: 0 }],
        }));
    };

    const removeAdditionalGuest = (index: number) => {
        setFormData(prev => ({
            ...prev,
            additionalGuestAmounts: prev.additionalGuestAmounts.filter((_, i) => i !== index),
        }));
    };

    const handleAdditionalGuestChange = (index: number, field: 'ageQualifyingCode' | 'amount', value: number) => {
        if (field === 'amount' && value < 0) return;

        if (field === 'amount' && value > 0 && errors.additionalGuestAmounts) {
            setErrors(prev => ({ ...prev, additionalGuestAmounts: undefined }));
        }

        const updated = [...formData.additionalGuestAmounts];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, additionalGuestAmounts: updated }));
    };

    const addBaseGuest = () => {
        const nextGuestNumber = Math.max(...formData.baseGuestAmounts.map(item => item.numberOfGuests)) + 1;
        setFormData(prev => ({
            ...prev,
            baseGuestAmounts: [...prev.baseGuestAmounts, { numberOfGuests: nextGuestNumber, amountBeforeTax: 0 }],
        }));
    };

    const removeBaseGuest = (index: number) => {
        if (formData.baseGuestAmounts.length > 1) {
            setFormData(prev => ({
                ...prev,
                baseGuestAmounts: prev.baseGuestAmounts.filter((_, i) => i !== index),
            }));
        }
    };

    const validateForm = () => {
        let customErrors: Partial<Record<keyof CreateRatePlanPayload | 'baseGuestAmounts' | 'additionalGuestAmounts', string>> = {};

        // First run schema validation to get all required field errors
        try {
            createRatePlanSchema.parse(formData);
        } catch (error: any) {
            if (error?.issues) {
                error.issues.forEach((issue: any) => {
                    if (issue.path[0]) {
                        customErrors[issue.path[0] as keyof CreateRatePlanPayload] = issue.message;
                    }
                });
            }
        }

        // Custom validation for base guest amounts
        if (formData.baseGuestAmounts.length === 0) {
            customErrors.baseGuestAmounts = "Base pricing is required";
        } else {
            const hasInvalidBaseAmount = formData.baseGuestAmounts.some(item =>
                !item.amountBeforeTax || item.amountBeforeTax <= 0
            );
            if (hasInvalidBaseAmount) {
                customErrors.baseGuestAmounts = "All base guest amounts must be greater than 0";
            } else {
                // Validate tier ordering - amounts should increase with guest count
                for (let i = 1; i < formData.baseGuestAmounts.length; i++) {
                    const currentAmount = formData.baseGuestAmounts[i].amountBeforeTax;
                    const previousAmount = formData.baseGuestAmounts[i - 1].amountBeforeTax;

                    if (currentAmount <= previousAmount) {
                        customErrors.baseGuestAmounts = `Guest tier ${i + 1} amount (${currentAmount}) must be greater than tier ${i} amount (${previousAmount})`;
                        toast.error(`Guest tier ${i + 1} amount (${currentAmount}) must be greater than tier ${i} amount (${previousAmount})`);
                        break;
                    }
                }
            }
        }

        if (formData.additionalGuestAmounts.length === 0) {
            customErrors.additionalGuestAmounts = "Additional guest charges are required";
        } else {
            const hasInvalidAdditionalAmount = formData.additionalGuestAmounts.some(item =>
                !item.amount || item.amount <= 0
            );
            if (hasInvalidAdditionalAmount) {
                customErrors.additionalGuestAmounts = "All additional guest amounts must be greater than 0";
            }
        }

        if (Object.keys(customErrors).length > 0) {
            setErrors(customErrors);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        try {
            await createRatePlan(formData);
            onSuccess?.(formData);

            setFormData({
                hotelCode,
                invTypeCode: '',
                ratePlanCode: '',
                startDate: '',
                endDate: '',
                currencyCode: 'USD',
                days: {
                    mon: true,
                    tue: true,
                    wed: true,
                    thu: true,
                    fri: true,
                    sat: true,
                    sun: true,
                },
                baseGuestAmounts: [{ numberOfGuests: 1, amountBeforeTax: 0 }],
                additionalGuestAmounts: [{ ageQualifyingCode: 10, amount: 0 }],
            });

        } catch (error: any) {
            console.error('Create failed:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-tripswift-bold text-gray-900 mb-6">Create New Rate Plan</h2>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2" data-error-for="invTypeCode">
                    <label className="text-sm font-tripswift-medium text-gray-700">Room Type <span className="text-red-500">*</span></label>
                    <Select value={formData.invTypeCode} onValueChange={(value) => handleInputChange('invTypeCode', value)}>
                        <SelectTrigger className={errors.invTypeCode ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                            {roomTypes.map(room => (
                                <SelectItem key={room.invTypeCode} value={room.invTypeCode}>
                                    {room.invTypeCode}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.invTypeCode && (
                        <p className="text-xs text-red-500 mt-1">{errors.invTypeCode}</p>
                    )}
                </div>

                <div className="space-y-2" data-error-for="ratePlanCode">
                    <label className="text-sm font-tripswift-medium text-gray-700">Rate Plan Name <span className="text-red-500">*</span></label>
                    <Input
                        type="text"
                        value={formData.ratePlanCode}
                        onChange={(e) => handleInputChange('ratePlanCode', e.target.value)}
                        placeholder="e.g., Early Bird Discount, Non-refundable Rate"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.ratePlanCode ? 'border-red-500' : 'border-gray-300'}`}
                        autoFocus
                    />
                    {errors.ratePlanCode && (
                        <p className="text-xs text-red-500">{errors.ratePlanCode}</p>
                    )}
                </div>

                <div className="space-y-2" data-error-for="startDate">
                    <label className="text-sm font-tripswift-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                type="button"
                                variant="outline"
                                className={`w-full justify-start ${errors.startDate ? 'border-red-500' : ''}`}
                                onClick={(e) => e.preventDefault()}
                            >
                                {formData.startDate ? format(new Date(formData.startDate), 'PPP') : 'Pick start date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={
                                    formData.startDate
                                        ? new Date(`${formData.startDate}T00:00:00`)
                                        : undefined
                                }
                                onSelect={(date) => {
                                    if (!date) return;
                                    const selectedDate = date instanceof Date ? date : date.from;
                                    if (selectedDate) {
                                        handleInputChange('startDate', format(selectedDate, 'yyyy-MM-dd'));
                                    }
                                }}
                                disabled={(date) => date < today}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.startDate && (
                        <p className="text-xs text-red-500">{errors.startDate}</p>
                    )}
                </div>

                <div className="space-y-2" data-error-for="endDate">
                    <label className="text-sm font-tripswift-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                type="button"
                                variant="outline"
                                className={`w-full justify-start ${errors.endDate ? 'border-red-500' : ''}`}
                                onClick={(e) => e.preventDefault()}
                            >
                                {formData.endDate ? format(new Date(formData.endDate), 'PPP') : 'Pick end date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={
                                    formData.endDate
                                        ? new Date(`${formData.endDate}T00:00:00`)
                                        : undefined
                                }
                                onSelect={(date) => {
                                    if (!date) return;
                                    const selectedDate = date instanceof Date ? date : date.from;
                                    if (selectedDate) {
                                        handleInputChange('endDate', format(selectedDate, 'yyyy-MM-dd'));
                                    }
                                }}
                                disabled={(date) => {
                                    if (date < today) return true;
                                    if (formData.startDate) {
                                        const startDate = new Date(formData.startDate);
                                        return date < startDate;
                                    }

                                    return false;
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.endDate && (
                        <p className="text-xs text-red-500">{errors.endDate}</p>
                    )}
                </div>

                <div className="space-y-2" data-error-for="currencyCode">
                    <label className="text-sm font-tripswift-medium text-gray-700">Currency <span className="text-red-500">*</span></label>
                    <Select value={formData.currencyCode} onValueChange={(value) => handleInputChange('currencyCode', value)}>
                        <SelectTrigger className={errors.currencyCode ? 'border-red-500' : ''}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {currencies.map(curr => (
                                <SelectItem key={curr} value={curr}>
                                    {curr}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.currencyCode && (
                        <p className="text-xs text-red-500">{errors.currencyCode}</p>
                    )}
                </div>
            </div>

            {/* Days of Week */}
            <div className="space-y-2">
                <label className="text-sm font-tripswift-medium text-gray-700">Applicable Days</label>
                <div className="flex flex-wrap gap-3">
                    {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map(day => (
                        <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                                id={day}
                                checked={formData.days[day]}
                                onCheckedChange={() => handleDayToggle(day)}
                            />
                            <label htmlFor={day} className="text-sm font-medium capitalize">
                                {day}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Base Guest Amounts */}
            <div className="space-y-2" data-error-for="baseGuestAmounts">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-tripswift-medium text-gray-700">Base Pricing by Guests <span className="text-red-500">*</span></label>
                    <Button type="button" variant="outline" size="sm" onClick={addBaseGuest} className="gap-1">
                        <Plus className="h-4 w-4" /> Add Guest Tier
                    </Button>
                </div>
                {errors.baseGuestAmounts && (
                    <p className="text-xs text-red-500">{errors.baseGuestAmounts}</p>
                )}
                <div className="space-y-3">
                    {formData.baseGuestAmounts.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Guests</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.numberOfGuests}
                                        readOnly
                                        className="w-full bg-gray-100 cursor-not-allowed"
                                        tabIndex={-1}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Price (Before Tax) <span className="text-red-500">*</span></label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.amountBeforeTax === 0 ? '' : item.amountBeforeTax}
                                        onChange={(e) => handleBaseGuestChange(index, 'amountBeforeTax', parseFloat(e.target.value) || 0)}
                                        onInput={(e) => {
                                            const input = e.target as HTMLInputElement;
                                            if (input.value.includes('-')) {
                                                input.value = input.value.replace('-', '');
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                            }
                                            if (e.key === '-' || e.key === 'Minus') {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full"
                                        placeholder={index > 0 ? `Min: ${formData.baseGuestAmounts[index - 1].amountBeforeTax + 0.01}` : 'Enter amount'}
                                    />
                                </div>
                            </div>
                            {/* Only show delete button for the last tier and when there's more than 1 tier */}
                            {formData.baseGuestAmounts.length > 1 && index === formData.baseGuestAmounts.length - 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeBaseGuest(index)}
                                    className="mt-7 text-red-500 hover:text-red-700"
                                    title="Remove last guest tier"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            {/* Show a placeholder div to maintain consistent spacing for non-deletable items */}
                            {!(formData.baseGuestAmounts.length > 1 && index === formData.baseGuestAmounts.length - 1) && (
                                <div className="w-10 h-10 mt-7"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Guest Amounts */}
            <div className="space-y-2" data-error-for="additionalGuestAmounts">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-tripswift-medium text-gray-700">Additional Guest Charges <span className="text-red-500">*</span></label>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addAdditionalGuest} 
                        className="gap-1"
                        disabled={formData.additionalGuestAmounts.length >= 3}
                        title={formData.additionalGuestAmounts.length >= 3 ? 'Maximum 3 age categories allowed' : 'Add Age Category'}
                    >
                        <Plus className="h-4 w-4" /> Add Age Category
                    </Button>
                </div>
                {errors.additionalGuestAmounts && (
                    <p className="text-xs text-red-500">{errors.additionalGuestAmounts}</p>
                )}
                <div className="space-y-3">
                    {formData.additionalGuestAmounts.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Age Category <span className="text-red-500">*</span></label>
                                    <Select
                                        value={item.ageQualifyingCode.toString()}
                                        onValueChange={(value) => handleAdditionalGuestChange(index, 'ageQualifyingCode', parseInt(value))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select age category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ageCategoryOptions.map(option => (
                                                <SelectItem 
                                                    key={option.value} 
                                                    value={option.value.toString()}
                                                    disabled={!isAgeCategoryAvailable(option.value, index)}
                                                    className={!isAgeCategoryAvailable(option.value, index) ? 'opacity-50 cursor-not-allowed' : ''}
                                                >
                                                    {option.label}
                                                    {!isAgeCategoryAvailable(option.value, index) && ' (Already selected)'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Additional Charge <span className="text-red-500">*</span></label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.amount === 0 ? '' : item.amount}
                                        onChange={(e) => handleAdditionalGuestChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                        onInput={(e) => {
                                            const input = e.target as HTMLInputElement;
                                            if (input.value.includes('-')) {
                                                input.value = input.value.replace('-', '');
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                            }
                                            if (e.key === '-' || e.key === 'Minus') {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full"
                                        placeholder="Enter charge amount"
                                    />
                                </div>
                            </div>
                            {formData.additionalGuestAmounts.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeAdditionalGuest(index)}
                                    className="mt-7 text-red-500 hover:text-red-700"
                                    title="Remove age category"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-200">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Rate Plan'
                    )}
                </Button>
            </div>
        </form>
    );
};