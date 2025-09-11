// components/BulkSellModal.tsx
'use client';

import React, { useState } from 'react';
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
import { XCircle, CheckCircle, CalendarIcon } from 'lucide-react';

interface BulkSellModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        action: 'start' | 'stop';
        dateRange: { from: Date; to: Date };
        applyTo: 'all' | 'holidays' | 'selected';
        roomRatePlans: string[];
    }) => void;
    initialData?: {
        dateRange: { from: Date; to: Date };
        roomRatePlans: string[];
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
    const [action, setAction] = useState<'start' | 'stop'>('stop');
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(
        initialData?.dateRange || { from: new Date(), to: new Date() }
    );
    const [applyTo, setApplyTo] = useState<'all' | 'holidays' | 'selected'>('all');
    const [roomRatePlans, setRoomRatePlans] = useState<string[]>(
        initialData?.roomRatePlans || []
    );

    const handleConfirm = () => {
        onConfirm({
            action,
            dateRange,
            applyTo,
            roomRatePlans,
        });
        onClose(); // Close modal after confirm
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto px-6 py-4">
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
                            Action
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
                            Date Range
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
                                                    : format(dateRange.from, 'PPP')
                                                : 'Select date range'}
                                        </span>
                                    </div>
                                    <span className="text-gray-400">▼</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range: any) => setDateRange(range)}
                                    className="p-3"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    {/* === APPLY TO === */}
                    <div className="space-y-2">
                        <label className="block text-sm font-tripswift-medium text-gray-700">
                            Apply To
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { value: 'all', label: 'All Days', desc: 'Apply to every day in selected range' },
                                { value: 'selected', label: 'Selected Days', desc: 'Manually pick specific days (calendar coming soon)' },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${applyTo === option.value
                                        ? 'border-blue-500 bg-blue-50'
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
                                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* === ROOM & RATE PLAN === */}
                    <div className="space-y-2">
                        <label className="block text-sm font-tripswift-medium text-gray-700">
                            Room & Rate Plan
                        </label>
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            {/* Header with Select All / Clear All */}
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                <p className="text-xs text-gray-600 font-medium">
                                    {roomRatePlans.length > 0
                                        ? `${roomRatePlans.length} selected`
                                        : 'Click below to add combinations'}
                                </p>
                                <div className="flex items-center space-x-3">
                                    {availableCombinations && availableCombinations.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setRoomRatePlans([...availableCombinations])}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                            aria-label="Select all combinations"
                                        >
                                            Select All
                                        </button>
                                    )}
                                    {roomRatePlans.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setRoomRatePlans([])}
                                            className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                                            aria-label="Clear all selections"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Selected Tags */}
                            {roomRatePlans.length > 0 && (
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex flex-wrap gap-2">
                                        {roomRatePlans.map((item, i) => (
                                            <div
                                                key={i}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-200 group hover:bg-blue-100 transition-colors"
                                            >
                                                <span>{item}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRoomRatePlans(roomRatePlans.filter((_, idx) => idx !== i))
                                                    }
                                                    className="ml-1 text-blue-500 hover:text-blue-700 opacity-70 group-hover:opacity-100 transition-all"
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
                                                    if (!roomRatePlans.includes(item)) {
                                                        setRoomRatePlans([...roomRatePlans, item]);
                                                    }
                                                }}
                                                disabled={roomRatePlans.includes(item)}
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
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={roomRatePlans.length === 0 || !dateRange.from || !dateRange.to}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                        Apply Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};