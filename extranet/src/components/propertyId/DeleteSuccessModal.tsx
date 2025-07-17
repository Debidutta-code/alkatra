import React, { useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { CheckCircle, Plus, ArrowLeft } from 'lucide-react';

interface DeleteSuccessModalProps {
  isOpen: boolean;
  onCreateProperty: () => void;
  onGoBack: () => void;
}

export const DeleteSuccessModal: React.FC<DeleteSuccessModalProps> = ({
  isOpen,
  onCreateProperty,
  onGoBack,
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scrolling
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Property Deleted Successfully
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Property has been permanently removed from the system.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="default"
                onClick={onCreateProperty}
                className="bg-tripswift-blue hover:bg-tripswift-dark-blue text-white flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Property
              </Button>
              <Button
                variant="outline"
                onClick={onGoBack}
                className="border-gray-300 hover:bg-gray-50 flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};