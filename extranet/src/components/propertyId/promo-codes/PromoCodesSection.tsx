// src/components/propertyId/promo-codes/PromoCodesSection.tsx

import React, { useState, useEffect } from 'react';
import { PromoCode, CreatePromoCodePayload, getPromoCodesByProperty, createPromoCode, updatePromoCode, deletePromoCode } from './promoCodeApi';
import { PromoCodeCard } from './PromoCodeCard';
import { PromoCodeForm } from './PromoCodeForm';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import toast from 'react-hot-toast';

interface PromoCodesSectionProps {
    propertyId: string;
    propertyCode: string;
    accessToken: string;
}

export const PromoCodesSection: React.FC<PromoCodesSectionProps> = ({
    propertyId,
    propertyCode,
    accessToken,
}) => {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

    const fetchPromos = async () => {
        try {
            const data = await getPromoCodesByProperty(accessToken, propertyId);
            setPromoCodes(data);
        } catch (error) {
            console.error('Error fetching promo codes:', error);
            toast.error('Failed to load promo codes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, [propertyId, accessToken]);

    const handleCreate = async (data: CreatePromoCodePayload) => {
        try {
            const newPromo = await createPromoCode(accessToken, data);
            setPromoCodes((prev) => [...prev, newPromo]);
            setIsFormOpen(false);
            toast.success('Promo code created!');
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Failed to create promo code');
        }
    };

    const handleUpdate = async (promoId: string, data: Partial<CreatePromoCodePayload>) => {
        try {
            const updated = await updatePromoCode(accessToken, promoId, data);
            setPromoCodes((prev) => prev.map((p) => (p._id === promoId ? updated : p)));
            setEditingPromo(null);
            setIsFormOpen(false);
            toast.success('Promo code updated!');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update promo code');
        }
    };

    const handleDelete = async (promoId: string) => {
        try {
            await deletePromoCode(accessToken, promoId);
            setPromoCodes((prev) => prev.filter((p) => p._id !== promoId));
            toast.success('Promo code deleted!');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete promo code');
        }
    };

    const handleEdit = (promo: PromoCode) => {
        setEditingPromo(promo);
        setIsFormOpen(true);
    };

    return (
        <Card className="border-border bg-card">
            <CardHeader className="border-b border-border">
                <div>
                    <CardTitle className="text-primary font-semibold text-lg sm:text-xl flex items-center">
                        Promo Codes
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                        Create promotional offers to attract more bookings
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground font-tripswift-medium">
                        {promoCodes.length} promo codes
                    </span>
                    <Button
                        onClick={() => {
                            setEditingPromo(null);
                            setIsFormOpen(true);
                        }}
                        className="bg-tripswift-blue hover:bg-[#054B8F] text-tripswift-off-white font-tripswift-semibold transition-colors duration-200 shadow-sm"
                    >
                        + Add Promo Code
                    </Button>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 animate-spin rounded-full border-2 border-tripswift-blue border-r-transparent mb-4"></div>
                        <p className="text-muted-foreground font-tripswift-medium">Loading promo codes...</p>
                    </div>
                ) : promoCodes.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-border rounded-lg bg-muted/10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tripswift-blue/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-tripswift-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        </div>
                        <h3 className="font-tripswift-semibold text-tripswift-black mb-2">No promo codes yet</h3>
                        <p className="text-muted-foreground font-tripswift-regular mb-4">
                            Create your first promotional code to start attracting more bookings
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {promoCodes.map((promo) => (
                            <PromoCodeCard
                                key={promo._id}
                                promo={promo}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </CardContent>

            <PromoCodeForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingPromo(null);
                }}
                onSubmit={editingPromo ? (data) => handleUpdate(editingPromo._id, data) : handleCreate}
                initialData={editingPromo || null}
                propertyId={propertyId}
                propertyCode={propertyCode}
            />
        </Card>
    );
};