import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Save, PenTool } from "lucide-react";
import { PropertyData, EditedProperty, PropertyDetailsProps } from '../../types/property_type';
import { updateProperty } from '../../app/app/property/[propertyId]/api';
import toast from 'react-hot-toast';

export function PropertyDetails({
  property,
  editedProperty,
  accessToken,
  propertyId,
  setProperty,
  handleInputChange,
}: PropertyDetailsProps) {
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({
    property_name: false,
    property_email: false,
    property_contact: false
  });
  const [emailErrorMessage, setEmailErrorMessage] = useState('');

  // Email validation function
  const validateEmail = (email: string): { isValid: boolean, errorMessage: string } => {
    if (!email || email.trim() === '') {
      return { isValid: false, errorMessage: 'Email is required' };
    }

    // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, errorMessage: 'Please enter a valid email address' };
    }

    return { isValid: true, errorMessage: '' };
  };

  const validateFields = () => {
    const newErrors = {
      property_name: !editedProperty.property_name || editedProperty.property_name.trim() === '',
      property_email: false, // Reset email error
      property_contact:
      !editedProperty.property_contact ||
      editedProperty.property_contact.trim().length !== 10 ||
      !/^\d{10}$/.test(editedProperty.property_contact.trim())    };

    // Perform specific email validation
    const emailValidation = validateEmail(editedProperty.property_email);
    if (!emailValidation.isValid) {
      newErrors.property_email = true;
      setEmailErrorMessage(emailValidation.errorMessage);
    } else {
      setEmailErrorMessage('');
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error);
  };

  const handleSaveClick = async () => {
    if (!validateFields()) {
      return;
    }

    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      const response = await updateProperty(propertyId, accessToken, editedProperty);
      console.log(response.data)

      if (response.data) {
        setProperty({ data: { ...editedProperty } });
        setEditMode(false);
        toast.success('Property updated successfully!');
      }
    } catch (error) {
      console.error('Error updating property data:', error);
      toast.error('Failed to update property');
    }
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="text-primary font-semibold">Property Details</CardTitle>
        <div className="flex gap-2">
          {editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          )}
          {property && property.data && (
            <Button
              variant="outline"
              size="sm"
              onClick={editMode ? handleSaveClick : () => setEditMode(true)}
            >
              {editMode ? <Save className="mr-2 h-4 w-4" /> : <PenTool className="mr-2 h-4 w-4" />}
              {editMode ? 'Update' : 'Edit'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {editMode ? (
          <div className="pt-4 space-y-6">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-sm text-gray-500">
                Property Name<span className="text-red-500">*</span>
              </label>
              <div>
                <Input
                  name="property_name"
                  value={editedProperty.property_name || ""}
                  onChange={handleInputChange}
                  placeholder="Property Name"
                  className={`w-full ${errors.property_name ? 'border-red-500' : ''}`}
                />
                {errors.property_name && (
                  <p className="text-red-500 text-xs mt-1">Property Name is required</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-sm text-gray-500">
                Property Email<span className="text-red-500">*</span>
              </label>
              <div>
                <Input
                  name="property_email"
                  value={editedProperty.property_email || ""}
                  onChange={handleInputChange}
                  placeholder="Property Email"
                  className={`w-full ${errors.property_email ? 'border-red-500' : ''}`}
                />
                {errors.property_email && (
                  <p className="text-red-500 text-xs mt-1">{emailErrorMessage}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-sm text-gray-500">
                Property Contact<span className="text-red-500">*</span>
              </label>
              <div>
                <Input
                  name="property_contact"
                  value={editedProperty.property_contact || ""}
                  maxLength={10}
                  onChange={handleInputChange}
                  placeholder="Property Contact"
                  className={`w-full ${errors.property_contact ? 'border-red-500' : ''}`}
                />
                {errors.property_contact && (
                  <p className="text-red-500 text-xs mt-1">Contact must be a valid 10-digit number</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {property && property.data ? (
              <div>
                <div className="py-2 flex items-start">
                  <div className="w-1/4 text-sm text-gray-500">Name:</div>
                  <div className="w-3/4 text-sm font-medium break-words overflow-hidden">
                    {property.data.property_name || 'N/A'}
                  </div>
                </div>
                <div className="py-2 flex items-start">
                  <div className="w-1/4 text-sm text-gray-500">Email:</div>
                  <div className="w-3/4 text-sm font-medium break-words overflow-hidden">
                    {property.data.property_email || 'N/A'}
                  </div>
                </div>
                <div className="py-2 flex items-start">
                  <div className="w-1/4 text-sm text-gray-500">Contact:</div>
                  <div className="w-3/4 text-sm font-medium break-words overflow-hidden">
                    {property.data.property_contact || 'N/A'}
                  </div>
                </div>
                {/* <div className="py-2 flex items-start">
                  <div className="w-1/4 text-sm text-gray-500">Property Type</div>
                  <div className="w-3/4 text-sm font-medium break-words overflow-hidden">
                    {property.data. || 'N/A'}
                //   </div> */}
                {/* // </div> */}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">No property details found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}