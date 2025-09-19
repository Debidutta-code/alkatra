// components/BulkSellModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@src/components/ui/dialog';
import { Button } from '@src/components/ui/button';
import { Calendar } from './Calender';
import { format } from '../utils/dateUtils';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { XCircle, CheckCircle, CalendarIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkSellModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        action: 'start' | 'stop';
        dateRange: { from: Date; to: Date };
        applyTo: 'all' | 'holidays' | 'selected';
        roomRatePlans: string[];
        selectedWeekdays: number[];
        dateStatusList: { date: string; status: 'open' | 'close' }[];
    }) => void;
    initialData?: {
        dateRange: { from: Date; to: Date };
        roomRatePlans: string[];
        selectedWeekdays?: number[];
        availableCombinations?: string[];
    };
    availableCombinations: string[];
}

export const BulkSellModal: React.FC<BulkSellModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialData,
    availableCombinations,
}) => {
    const getDefaultDateRange = () => ({ from: new Date(), to: new Date() });

    const [action, setAction] = useState<'start' | 'stop' | undefined>(undefined);
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(getDefaultDateRange());
    const [applyTo, setApplyTo] = useState<'all' | 'holidays' | 'selected' | undefined>(undefined);
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
    const [roomRatePlans, setRoomRatePlans] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const resetFormData = () => {
        setAction(undefined);
        setDateRange(getDefaultDateRange());
        setApplyTo(undefined);
        setSelectedWeekdays([]);
        setRoomRatePlans([]);
    };

    const getUniqueRoomRatePlans = (plans: string[]): string[] => {
        return [...new Set(plans)];
    };

    useEffect(() => {
        if (isOpen && initialData) {
            setDateRange(initialData.dateRange || getDefaultDateRange());
            setSelectedWeekdays(initialData.selectedWeekdays || []);
        } else if (isOpen) {
            resetFormData();
        }
    }, [isOpen, initialData]);

    const handleClose = () => {
        resetFormData();
        onClose();
    };

    const handleConfirm = async () => {
        if (!action) {
            toast.error('Please select an action (Start Sell or Stop Sell)');
            return;
        }

        if (!applyTo) {
            toast.error('Please select when to apply the changes');
            return;
        }

        if (applyTo === 'selected' && selectedWeekdays.length === 0) {
            toast.error('Please select at least one weekday');
            return;
        }

        if (roomRatePlans.length === 0) {
            toast.error('Please select at least one room type and rate plan combination');
            return;
        }

        setIsLoading(true);

        const dateStatusList: { date: string; status: 'open' | 'close' }[] = [];

        if (dateRange?.from && dateRange?.to) {
            const start = new Date(dateRange.from);
            const end = new Date(dateRange.to);
            let currentDate = new Date(start);

            while (currentDate <= end) {
                const dayOfWeek = currentDate.getDay();

                if (applyTo === 'all' || (applyTo === 'selected' && selectedWeekdays.includes(dayOfWeek))) {
                    const status: 'open' | 'close' = action === 'start' ? 'open' : 'close';

                    dateStatusList.push({
                        date: format(currentDate, 'yyyy-MM-dd'),
                        status: status,
                    });
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        try {
            await onConfirm({
                action,
                dateRange,
                applyTo,
                roomRatePlans,
                selectedWeekdays,
                dateStatusList,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto px-6 py-4">
                <DialogHeader className="border-b pb-4 mb-2">
                    <DialogTitle className="text-xl font-tripswift-bold text-gray-900">
                        Bulk Update Sell Status
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        Apply Start/Stop Sell to selected room types and rate plans over a date range.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* === ACTION TYPE === */}
                    <div className="space-y-2">
                        <label className="block text-sm font-tripswift-medium text-gray-700">
                            Action <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => setAction('start')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-all ${action === 'start'
                                    ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">Start Sell</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAction('stop')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${action === 'stop'
                                    ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <XCircle className="h-5 w-5" />
                                <span className="font-medium">Stop Sell</span>
                            </button>
                        </div>
                    </div>

                    {/* === DATE RANGE === */}
                    <div className="space-y-2">
                        <label className="block text-sm font-tripswift-medium text-gray-700">
                            Date Range <span className="text-red-500">*</span>
                        </label>
                        <Popover>
                            <PopoverTrigger>
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between px-4 py-3 text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                                        <span className="font-medium">
                                            {dateRange?.from
                                                ? dateRange.to
                                                    ? `${format(dateRange.from, 'PPP')} – ${format(dateRange.to, 'PPP')}`
                                                    : `${format(dateRange.from, 'PPP')} – Select end date`
                                                : 'Select start and end date'}
                                        </span>
                                    </div>
                                    <span className="text-gray-400">▼</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range: any) => {
                                        setDateRange(range);
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date < today;
                                    }}
                                    className="p-3"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* === APPLY TO === */}
                    <div className="space-y-2">
                        <label className="block text-sm font-tripswift-medium text-gray-700">
                            Apply To <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { value: 'all', label: 'All Days', desc: 'Apply to every day in selected range' },
                                { value: 'selected', label: 'Selected Days', desc: 'Choose specific weekdays to apply changes' },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${applyTo === option.value
                                        ? 'border-tripswift-blue bg-blue-50'
                                        : 'border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="applyTo"
                                        value={option.value}
                                        checked={applyTo === option.value}
                                        onChange={() => setApplyTo(option.value as any)}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">{option.label}</div>
                                            <div className="text-xs text-gray-500">{option.desc}</div>
                                        </div>
                                        {applyTo === option.value && (
                                            <div className="w-4 h-4 rounded-full bg-tripswift-blue"></div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Weekday Selection */}
                        {applyTo === 'selected' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="block text-sm font-tripswift-medium text-gray-700 mb-3">
                                    Select Specific Weekdays <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {[
                                        { short: 'Sun', full: 'Sunday', value: 0 },
                                        { short: 'Mon', full: 'Monday', value: 1 },
                                        { short: 'Tue', full: 'Tuesday', value: 2 },
                                        { short: 'Wed', full: 'Wednesday', value: 3 },
                                        { short: 'Thu', full: 'Thursday', value: 4 },
                                        { short: 'Fri', full: 'Friday', value: 5 },
                                        { short: 'Sat', full: 'Saturday', value: 6 },
                                    ].map(day => (
                                        <label
                                            key={day.value}
                                            className="flex flex-col items-center p-2 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedWeekdays.includes(day.value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedWeekdays([...selectedWeekdays, day.value]);
                                                    } else {
                                                        setSelectedWeekdays(selectedWeekdays.filter(d => d !== day.value));
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${selectedWeekdays.includes(day.value)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-gray-700 border border-gray-300'
                                                }`}>
                                                {day.short}
                                            </div>
                                            <span className="text-xs text-gray-600 mt-1">{day.full}</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedWeekdays.length === 0 && (
                                    <p className="text-xs text-red-500 mt-2">Please select at least one weekday</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* === ROOM & RATE PLAN === */}
                    <div className="space-y-2">
                        <label className="block text-sm font-tripswift-medium text-gray-700">
                            Room Type <span className="text-red-500">*</span>
                        </label>
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            {/* Header with Select All / Clear All */}
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                <p className="text-xs text-gray-600 font-medium">
                                    {roomRatePlans.length > 0
                                        ? `${roomRatePlans.length} selected`
                                        : 'Click below to add combinations'}
                                </p>
                            </div>

                            {/* Selected Tags */}
                            {roomRatePlans.length > 0 && (
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex flex-wrap gap-2">
                                        {roomRatePlans.map((item, i) => (
                                            <div
                                                key={i}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-tripswift-dark-blue text-xs font-medium rounded-full border border-blue-200 group hover:bg-blue-100 transition-colors"
                                            >
                                                <span>{item}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setRoomRatePlans([])}
                                                    className="ml-1 text-tripswift-blue hover:text-tripswift-dark-blue opacity-70 group-hover:opacity-100 transition-all"
                                                    aria-label="Remove"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Options Grid */}
                            <div className="p-4 max-h-60 overflow-y-auto">
                                {(!availableCombinations || availableCombinations.length === 0) ? (
                                    <p className="text-sm text-gray-500 italic text-center py-6">
                                        No room and rate plan combinations available
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {availableCombinations.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => {
                                                    if (roomRatePlans.includes(item)) {
                                                        setRoomRatePlans([]);
                                                    } else {
                                                        setRoomRatePlans([item]);
                                                    }
                                                }}
                                                className={`
                                                flex items-center justify-between px-3 py-2.5 text-left text-xs font-medium rounded-lg border transition-all
                                                ${roomRatePlans.includes(item)
                                                        ? 'bg-green-50 border-green-300 text-green-800 cursor-default'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-98'
                                                    }
                                            `}
                                            >
                                                <span className="truncate">{item}</span>
                                                {roomRatePlans.includes(item) && (
                                                    <span className="ml-2 flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6 pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="px-6 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!action || !applyTo || roomRatePlans.length === 0 || !dateRange.from || !dateRange.to || isLoading}
                        className="px-6 py-2 bg-tripswift-blue hover:bg-tripswift-dark-blue text-white font-medium"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Apply Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};