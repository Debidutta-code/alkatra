// src/components/propertyId/promo-codes/PromoCodeForm.tsx

import React, { useState, useEffect } from 'react';
import { PromoCode, CreatePromoCodePayload } from './promoCodeApi';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';

interface PromoCodeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreatePromoCodePayload) => void;
    initialData: PromoCode | null;
    propertyId: string;
    propertyCode: string;
}

export const PromoCodeForm: React.FC<PromoCodeFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    propertyId,
    propertyCode,
}) => {
    const [formData, setFormData] = useState<CreatePromoCodePayload>({
        propertyId,
        propertyCode,
        codeName: '',
        description: '',
        discountType: 'flat',
        discountValue: 0,
        validFrom: '',
        validTo: '',
        minBookingAmount: 0,
        maxDiscountAmount: 0,
        useLimit: 1,
        usageLimitPerUser: 1,
        isActive: true,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreatePromoCodePayload, string>>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                propertyId: initialData.propertyId,
                propertyCode: initialData.propertyCode,
                codeName: initialData.codeName,
                description: initialData.description,
                discountType: initialData.discountType,
                discountValue: initialData.discountValue,
                validFrom: initialData.validFrom.split('T')[0],
                validTo: initialData.validTo.split('T')[0],
                minBookingAmount: initialData.minBookingAmount,
                maxDiscountAmount: initialData.maxDiscountAmount,
                useLimit: initialData.useLimit,
                usageLimitPerUser: initialData.usageLimitPerUser,
                isActive: initialData.isActive ?? true,
            });
        } else {
            // Set default dates for new promo codes
            const today = new Date().toISOString().split('T')[0];
            const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            setFormData({
                propertyId,
                propertyCode,
                codeName: '',
                description: '',
                discountType: 'flat',
                discountValue: 0,
                validFrom: today,
                validTo: oneMonthLater,
                minBookingAmount: 0,
                maxDiscountAmount: 0,
                useLimit: 100,
                usageLimitPerUser: 1,
                isActive: true,
            });
        }
        setErrors({});
    }, [initialData, propertyId, propertyCode, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CreatePromoCodePayload, string>> = {};

        // Code Name validation - NEW
        if (!formData.codeName.trim()) {
            newErrors.codeName = 'Code name is required';
        } else if (formData.codeName.length < 3) {
            newErrors.codeName = 'Code name must be at least 3 characters';
        } else if (formData.codeName.length > 20) {
            newErrors.codeName = 'Code name must not exceed 20 characters';
        } else if (!/^[A-Z0-9_-]+$/.test(formData.codeName)) {
            newErrors.codeName = 'Code name must contain only uppercase letters, numbers, hyphens, and underscores';
        }

        // Description validation
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        } else if (formData.description.length > 200) {
            newErrors.description = 'Description must not exceed 200 characters';
        }

        // Discount value validation
        if (formData.discountValue <= 0) {
            newErrors.discountValue = 'Discount value must be greater than 0';
        }
        if (formData.discountType === 'percentage' && formData.discountValue > 100) {
            newErrors.discountValue = 'Percentage cannot exceed 100%';
        }

        // Date validation
        const today = new Date().toISOString().split('T')[0];

        const formatDate = (dateStr: string) => {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        };

        if (!formData.validFrom) {
            newErrors.validFrom = 'Start date is required';
        } else if (formData.validFrom < today) {
            newErrors.validFrom = `Value must be ${formatDate(today)} or later`;
        }

        if (!formData.validTo) {
            newErrors.validTo = 'End date is required';
        } else if (formData.validTo < (formData.validFrom || today)) {
            const minDate = formData.validFrom || today;
            newErrors.validTo = `Value must be ${formatDate(minDate)} or later`;
        } else if (formData.validFrom && formData.validTo && formData.validFrom >= formData.validTo) {
            newErrors.validTo = 'End date must be after start date';
        }

        // Min booking amount validation
        if (formData.minBookingAmount < 0) {
            newErrors.minBookingAmount = 'Cannot be negative';
        }

        // Max discount validation - only required for percentage discounts
        if (formData.discountType === 'percentage' && formData.maxDiscountAmount <= 0) {
            newErrors.maxDiscountAmount = 'Max discount is required for percentage discounts';
        }

        // Usage limits validation
        if (formData.useLimit < 1) {
            newErrors.useLimit = 'Must be at least 1';
        }
        if (formData.usageLimitPerUser < 1) {
            newErrors.usageLimitPerUser = 'Must be at least 1';
        }
        if (formData.usageLimitPerUser > formData.useLimit) {
            newErrors.usageLimitPerUser = 'Cannot exceed total usage limit';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ['discountValue', 'minBookingAmount', 'maxDiscountAmount', 'useLimit', 'usageLimitPerUser'].includes(name)
                ? parseFloat(value) || 0
                : name === 'codeName' ? value.toUpperCase() : value, // Auto-uppercase codeName
        }));
        // Clear error for this field when user starts typing
        if (errors[name as keyof CreatePromoCodePayload]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            discountType: value as 'flat' | 'percentage',
            maxDiscountAmount: value === 'flat' ? 0 : prev.maxDiscountAmount,
        }));
        if (errors.discountType) {
            setErrors(prev => ({ ...prev, discountType: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-tripswift-off-white">
                <DialogHeader className="border-b border-border pb-4">
                    <DialogTitle className="text-tripswift-black font-tripswift-semibold text-xl">
                        {initialData ? 'Edit Promo Code' : 'Create New Promo Code'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-tripswift-regular">
                        Set up promotional discounts for your property. Fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Code Name */}
                        <div className="space-y-2">
                            <Label htmlFor="codeName" className="text-tripswift-black font-tripswift-medium">
                                Promo Code Name <span className="text-red-500">*</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    ({formData.codeName.length}/20)
                                </span>
                            </Label>
                            <Input
                                id="codeName"
                                name="codeName"
                                type="text"
                                value={formData.codeName}
                                onChange={handleChange}
                                className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue uppercase ${errors.codeName ? 'border-red-500' : ''}`}
                                placeholder="e.g., SUMMER2025, WELCOME50"
                                maxLength={20}
                            />
                            {errors.codeName && (
                                <p className="text-xs text-red-500">{errors.codeName}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Use only uppercase letters, numbers, hyphens (-), and underscores (_)
                            </p>
                        </div>

                        {/* Discount Type */}
                        <div className="space-y-2">
                            <Label htmlFor="discountType" className="text-tripswift-black font-tripswift-medium">
                                Discount Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.discountType}
                                onValueChange={(value) => handleSelectChange(value)}
                            >
                                <SelectTrigger className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue ${errors.discountType ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flat">
                                        <div className="flex items-center gap-2">
                                            <span className="font-tripswift-medium">Flat Amount</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="percentage">
                                        <div className="flex items-center gap-2">
                                            <span className="font-tripswift-medium">Percentage (%)</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.discountType && (
                                <p className="text-xs text-red-500">{errors.discountType}</p>
                            )}
                        </div>

                        {/* Discount Value */}
                        <div className="space-y-2">
                            <Label htmlFor="discountValue" className="text-tripswift-black font-tripswift-medium">
                                Discount Value <span className="text-red-500">*</span>
                                {formData.discountType === 'percentage' && (
                                    <span className="text-xs text-muted-foreground ml-1">(%)</span>
                                )}
                            </Label>
                            <Input
                                id="discountValue"
                                name="discountValue"
                                type="number"
                                min="0"
                                step={formData.discountType === 'percentage' ? '0.01' : '1'}
                                max={formData.discountType === 'percentage' ? '100' : undefined}
                                value={formData.discountValue || ''}
                                onChange={handleChange}
                                className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue ${errors.discountValue ? 'border-red-500' : ''}`}
                                placeholder={formData.discountType === 'percentage' ? '10' : '200'}
                            />
                            {errors.discountValue && (
                                <p className="text-xs text-red-500">{errors.discountValue}</p>
                            )}
                        </div>

                        {/* Min Booking Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="minBookingAmount" className="text-tripswift-black font-tripswift-medium">
                                Min Booking Amount
                                <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                            </Label>
                            <Input
                                id="minBookingAmount"
                                name="minBookingAmount"
                                type="number"
                                min="0"
                                step="1"
                                value={formData.minBookingAmount || ''}
                                onChange={handleChange}
                                className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue ${errors.minBookingAmount ? 'border-red-500' : ''}`}
                                placeholder="0"
                            />
                            {errors.minBookingAmount && (
                                <p className="text-xs text-red-500">{errors.minBookingAmount}</p>
                            )}
                        </div>

                        {/* Max Discount Amount - Only show for percentage discounts */}
                        {formData.discountType === 'percentage' && (
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="maxDiscountAmount" className="text-tripswift-black font-tripswift-medium">
                                    Max Discount Amount <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="maxDiscountAmount"
                                    name="maxDiscountAmount"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formData.maxDiscountAmount || ''}
                                    onChange={handleChange}
                                    className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue ${errors.maxDiscountAmount ? 'border-red-500' : ''}`}
                                    placeholder="500"
                                />
                                {errors.maxDiscountAmount && (
                                    <p className="text-xs text-red-500">{errors.maxDiscountAmount}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Required to cap the maximum discount amount
                                </p>
                            </div>
                        )}

                        {/* Valid From */}
                        <div className="space-y-2">
                            <Label htmlFor="validFrom" className="text-tripswift-black font-tripswift-medium">
                                Valid From <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="validFrom"
                                name="validFrom"
                                type="date"
                                value={formData.validFrom}
                                onChange={handleChange}
                                className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${errors.validFrom ? 'border-red-500' : ''}`}
                            />
                            {errors.validFrom && (
                                <p className="text-xs text-red-500">{errors.validFrom}</p>
                            )}
                        </div>

                        {/* Valid To */}
                        <div className="space-y-2">
                            <Label htmlFor="validTo" className="text-tripswift-black font-tripswift-medium">
                                Valid To <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="validTo"
                                name="validTo"
                                type="date"
                                value={formData.validTo}
                                onChange={handleChange}
                                className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${errors.validTo ? 'border-red-500' : ''}`}
                            />
                            {errors.validTo && (
                                <p className="text-xs text-red-500">{errors.validTo}</p>
                            )}
                        </div>

                        {/* Total Usage Limit */}
                        <div className="space-y-2">
                            <Label htmlFor="useLimit" className="text-tripswift-black font-tripswift-medium">
                                Total Usage Limit <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="useLimit"
                                name="useLimit"
                                type="number"
                                min="1"
                                step="1"
                                value={formData.useLimit || ''}
                                onChange={handleChange}
                                className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue ${errors.useLimit ? 'border-red-500' : ''}`}
                                placeholder="100"
                            />
                            {errors.useLimit && (
                                <p className="text-xs text-red-500">{errors.useLimit}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Maximum number of times this promo code can be used in total
                            </p>
                        </div>

                        {/* Usage Limit Per User */}
                        <div className="space-y-2">
                            <Label htmlFor="usageLimitPerUser" className="text-tripswift-black font-tripswift-medium">
                                Usage Limit Per User <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="usageLimitPerUser"
                                name="usageLimitPerUser"
                                type="number"
                                min="1"
                                step="1"
                                value={formData.usageLimitPerUser || ''}
                                onChange={handleChange}
                                className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue ${errors.usageLimitPerUser ? 'border-red-500' : ''}`}
                                placeholder="1"
                            />
                            {errors.usageLimitPerUser && (
                                <p className="text-xs text-red-500">{errors.usageLimitPerUser}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                How many times each user can use this promo code
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description" className="text-tripswift-black font-tripswift-medium">
                                Description <span className="text-red-500">*</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    ({formData.description.length}/200)
                                </span>
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="e.g., Flat 200 off on all bookings - Limited time offer!"
                                className={`border-border focus:border-tripswift-blue focus:ring-tripswift-blue ${errors.description ? 'border-red-500' : ''}`}
                                rows={3}
                                maxLength={200}
                            />
                            {errors.description && (
                                <p className="text-xs text-red-500">{errors.description}</p>
                            )}
                        </div>

                        {/* Status - isActive Field - Only show when editing */}
                        {initialData && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="h-4 w-4 rounded border-border text-tripswift-blue focus:ring-tripswift-blue focus:ring-offset-0"
                                    />
                                    <Label
                                        htmlFor="isActive"
                                        className="text-tripswift-black font-tripswift-medium cursor-pointer"
                                    >
                                        Active Status
                                    </Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formData.isActive ? 'Promo code is currently available for use' : 'Promo code is disabled and cannot be used'}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-3 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="border-tripswift-blue text-tripswift-blue"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-tripswift-blue hover:bg-[#054B8F] text-tripswift-off-white font-tripswift-semibold"
                        >
                            {initialData ? 'Update' : 'Create'} Promo Code
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};