import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Save, PenTool } from "lucide-react";
import { PropertyDetailsProps } from '../../types/property_type';
import { updateProperty } from '../../app/app/property/propertyDetails/api';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
    property_contact: false,
  });
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');

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

  // Phone validation function
  const validatePhone = (phone: string): { isValid: boolean, errorMessage: string } => {
    if (!phone || phone.trim() === '') {
      return { isValid: false, errorMessage: 'Phone number is required' };
    }

    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length < 10) {
      return { isValid: false, errorMessage: 'Please enter a valid phone number' };
    }

    return { isValid: true, errorMessage: '' };
  };

  const validateFields = () => {
    const newErrors = {
      property_name: !editedProperty.property_name || editedProperty.property_name.trim() === '',
      property_email: false,
      property_contact: false,
    };

    // Perform specific email validation
    const emailValidation = validateEmail(editedProperty.property_email);
    if (!emailValidation.isValid) {
      newErrors.property_email = true;
      setEmailErrorMessage(emailValidation.errorMessage);
    } else {
      setEmailErrorMessage('');
    }

    // Perform specific phone validation
    const phoneValidation = validatePhone(editedProperty.property_contact);
    if (!phoneValidation.isValid) {
      newErrors.property_contact = true;
      setPhoneErrorMessage(phoneValidation.errorMessage);
    } else {
      setPhoneErrorMessage('');
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error);
  };

  const handleSaveClick = async () => {
    if (!validateFields()) {
      return;
    }

    try {
      if (!accessToken || !propertyId) {
        console.error('Access token or property ID is missing');
        toast.error('Missing authentication or property ID');
        return;
      }
      const response = await updateProperty(propertyId, accessToken, editedProperty);
      console.log(response.data);

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

  // Handler for textarea changes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: e.target.value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange?.(syntheticEvent);
  };

  // Handler for phone input changes
  const handlePhoneChange = (phone: string) => {
    const syntheticEvent = {
      target: {
        name: 'property_contact',
        value: phone
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange?.(syntheticEvent);
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="text-primary font-semibold text-lg sm:text-xl">
          Property Details
        </CardTitle>
        <div className="flex gap-4 mt-2 sm:mt-0">
          {editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          {property && property.data && (
            <Button
              variant="outline"
              size="sm"
              onClick={editMode ? handleSaveClick : () => setEditMode(true)}
              className="w-full sm:w-auto"
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
            {/* Property Name Field */}
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 sm:gap-12 items-center">
              <label className="text-sm text-gray-500 sm:self-start">
                Property Name <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1">
                <Input
                  name="property_name"
                  value={editedProperty.property_name || ""}
                  onChange={handleInputChange}
                  placeholder="Property Name"
                  className={errors.property_name ? 'border-red-500' : ''}
                />
                {errors.property_name && (
                  <p className="text-red-500 text-xs mt-1">Property Name is required</p>
                )}
              </div>
            </div>

            {/* Property Email Field */}
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 sm:gap-12 items-center">
              <label className="text-sm text-gray-500 sm:self-start">
                Property Email <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1">
                <Input
                  name="property_email"
                  value={editedProperty.property_email || ""}
                  onChange={handleInputChange}
                  placeholder="Property Email"
                  className={errors.property_email ? 'border-red-500' : ''}
                />
                {errors.property_email && (
                  <p className="text-red-500 text-xs mt-1">{emailErrorMessage}</p>
                )}
              </div>
            </div>

            {/* Property Contact Field */}
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 sm:gap-12 items-center">
              <label className="text-sm text-gray-500 sm:self-center whitespace-nowrap">
                Property Contact <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1">
                <PhoneInput
                  country={'in'}
                  value={editedProperty.property_contact || ""}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                  enableSearch={true}
                  searchPlaceholder="Search countries..."
                  searchNotFound="No countries found"
                  inputStyle={{
                    width: '100%',
                    height: '40px',
                    paddingLeft: '48px',
                    fontSize: '14px',
                    border: errors.property_contact ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                  buttonStyle={{
                    borderRadius: '6px 0 0 6px',
                    border: errors.property_contact ? '1px solid #ef4444' : '1px solid #d1d5db',
                    backgroundColor: '#f9fafb'
                  }}
                  dropdownStyle={{
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                  }}
                  containerStyle={{
                    width: '100%',
                  }}
                  specialLabel=""
                />
                {errors.property_contact && (
                  <p className="text-red-500 text-xs mt-1">{phoneErrorMessage}</p>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 sm:gap-12 items-start">
              <label className="text-sm text-gray-500 pt-2">
                Description
              </label>
              <div>
                <textarea
                  name="description"
                  value={editedProperty.description || ""}
                  onChange={handleTextareaChange}
                  placeholder="Enter description"
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0 divide-gray-100">
            {property && property.data ? (
              <>
                <div className="py-2 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 mb-1 sm:mb-0">Name</div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words">
                    {property.data.property_name || 'N/A'}
                  </div>
                </div>
                <div className="py-2 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 mb-1 sm:mb-0">Email</div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words">
                    {property.data.property_email || 'N/A'}
                  </div>
                </div>
                <div className="py-2 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 mb-1 sm:mb-0">Contact</div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words">
                    +{property.data.property_contact || 'N/A'}
                  </div>
                </div>
                <div className="py-2 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 mb-1 sm:mb-0">Description</div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words whitespace-pre-wrap">
                    {property.data.description || 'N/A'}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center mt-4">
                <p className="text-muted-foreground">No property details found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}