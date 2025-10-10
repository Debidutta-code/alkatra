// src/components/propertyId/promo-codes/PromoCodeCard.tsx

import React, { useState } from 'react';
import { PromoCode } from './promoCodeApi';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../ui/dialog';
import {
    Edit2,
    Trash2,
    Calendar,
    Percent,
    Users,
    Tag,
    AlertTriangle,
    DollarSign,
    Ticket,
} from 'lucide-react';

interface PromoCodeCardProps {
    promo: PromoCode;
    onEdit: (promo: PromoCode) => void;
    onDelete: (promoId: string) => void;
}

export const PromoCodeCard: React.FC<PromoCodeCardProps> = ({
    promo,
    onEdit,
    onDelete,
}) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const isActive = () => {
        const now = new Date();
        const validFrom = new Date(promo.validFrom);
        const validTo = new Date(promo.validTo);
        return now >= validFrom && now <= validTo && promo.isActive;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDeleteClick = () => setShowDeleteDialog(true);
    const handleConfirmDelete = () => {
        onDelete(promo._id);
        setShowDeleteDialog(false);
    };
    const handleCancelDelete = () => setShowDeleteDialog(false);

    const statusColor = isActive() ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
    const discountIconBg = promo.discountType === 'flat' ? 'bg-emerald-500' : 'bg-violet-500';
    const discountIconColor = 'text-white';

    return (
        <>
            <Card className="border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                            {/* Promo Code Name */}
                            <div className="flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {promo.codeName}
                                </h3>
                            </div>

                            {/* Status & Type Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive() ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    <Badge
                                        variant="secondary"
                                        className={`${statusColor} font-medium px-2 py-1`}
                                    >
                                        {isActive() ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                {promo.discountType === 'flat' && (
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-medium px-2 py-1">
                                        Flat Discount
                                    </Badge>
                                )}
                                {promo.discountType === 'percentage' && (
                                    <Badge variant="secondary" className="bg-violet-50 text-violet-700 font-medium px-2 py-1">
                                        Percentage Off
                                    </Badge>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {promo.description}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(promo)}
                                className="h-8 w-8 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                aria-label="Edit promo code"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDeleteClick}
                                className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                aria-label="Delete promo code"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Discount Value Highlight */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${discountIconBg}`}>
                                    {promo.discountType === 'flat' ? (
                                        <DollarSign className={`h-5 w-5 ${discountIconColor}`} />
                                    ) : (
                                        <Percent className={`h-5 w-5 ${discountIconColor}`} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Discount</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {promo.discountValue}
                                        {promo.discountType === 'percentage' && '%'}
                                    </p>
                                </div>
                            </div>

                            {promo.maxDiscountAmount > 0 && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-600 font-medium">Max Cap</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {promo.maxDiscountAmount}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Valid From', value: formatDate(promo.validFrom), icon: Calendar },
                            { label: 'Valid To', value: formatDate(promo.validTo), icon: Calendar },
                            // { label: 'Total Uses', value: `${promo.useLimit} times`, icon: Users },
                            // { label: 'Per User', value: `${promo.usageLimitPerUser} ${promo.usageLimitPerUser === 1 ? 'time' : 'times'}`, icon: Tag },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                                <div className="flex items-start gap-2">
                                    <item.icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Minimum Booking Amount */}
                    {promo.minBookingAmount > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Minimum booking amount:</span> {promo.minBookingAmount}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-lg font-semibold text-gray-900">
                                Delete Promo Code?
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 pt-2">
                            This action cannot be undone. The promo code will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-gray-50 rounded-lg p-4 my-4 border">
                        <div className="flex items-center gap-2 mb-2">
                            <Ticket className="h-4 w-4 text-blue-600" />
                            <p className="font-semibold text-gray-900">{promo.codeName}</p>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{promo.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Badge variant="secondary" className="font-medium">
                                {promo.discountValue}
                                {promo.discountType === 'percentage' ? '%' : ''} OFF
                            </Badge>
                            {/* <span>•</span> */}
                            {/* <span>{promo.useLimit} total uses</span> */}
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancelDelete}
                            className="font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};