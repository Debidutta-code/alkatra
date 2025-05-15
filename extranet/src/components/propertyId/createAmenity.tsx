"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Edit, Save } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { useForm } from "react-hook-form";
import { EditedAmenity } from '../../app/app/property/[propertyId]/page';

const AmenityData = [
    "wifi", "swimming_pool", "fitness_center", "spa_and_wellness",
    "restaurant", "room_service", "bar_and_lounge", "parking",
    "concierge_services", "pet_friendly", "business_facilities",
    "laundry_services", "child_friendly_facilities"
]

const CreateAmenity = (handleCreateAmenity: any, requestType: any) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EditedAmenity>();

    const onSubmit = async (data: EditedAmenity) => {
        setIsSubmitting(true);
        console.log(data)
        try {
            const selectedAmenities = Object.fromEntries(
                Object.entries(data).filter(([key, value]) => value === true)
            );

            const newData = {
                destination_type: data.destination_type,
                property_type: data.property_type,
                no_of_rooms_available: data.no_of_rooms_available,
                amenities: {
                    ...selectedAmenities
                }
            }

            await handleCreateAmenity(newData);
            setShowModal(false);
            reset(); // Reset the form after successful submission
        } 
        catch (error) {
            console.error('Error creating amenities:', error);
            // TODO: Display error message to user
        } 
        finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div>
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                <div className="bg-black p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{requestType}</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            id='destination_type'
                            {...register("destination_type", { required: true })}
                            placeholder="Destination Type"
                        />
                        <Input
                            {...register("property_type", { required: true })}
                            placeholder="Property Type"
                        />
                        <Input
                            {...register("no_of_rooms_available", { required: true, valueAsNumber: true })}
                            type="number"
                            placeholder="Total No. of Rooms Available"
                        />
                        <Card className="w-[600px]">
                            <CardHeader>
                                <CardTitle>Other Amenities</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-4 flex-wrap">
                                {/* Dynamically generate checkboxes for amenities */}
                                {AmenityData.map((amenity: any) => (
                                    <div key={amenity} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={amenity}
                                            onCheckedChange={(value: boolean) => {
                                                setValue(amenity as any, value)
                                            }}
                                            {...register(amenity as keyof EditedAmenity)}
                                        />
                                        <label htmlFor={amenity} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {amenity.replace(/_/g, " ")}
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" onClick={() => setShowModal(false)} variant="outline" disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateAmenity