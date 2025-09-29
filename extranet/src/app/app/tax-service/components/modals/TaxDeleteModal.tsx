import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../../../../components/ui/button';

interface TaxDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: 'rule' | 'group';
  isLoading?: boolean;
  groupRuleCount?: number;
}

export const TaxDeleteModal: React.FC<TaxDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'rule',
  isLoading = false,
  groupRuleCount = 0
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  const isGroup = itemType === 'group';
  const itemDisplayName = isGroup ? 'Tax Group' : 'Tax Rule';

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col mx-auto animate-fadeIn">
        {/* Header */}
        <div className="bg-red-500 px-6 py-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-white">{itemDisplayName}</h3>
              <p className="text-red-100 text-sm">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Question and Item Name */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isGroup ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                )}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-medium text-base mb-2">
                Are you sure you want to delete this {itemType}?
              </p>
              <p className="text-gray-900 font-semibold text-lg break-words">
                "{itemName}"
              </p>
              {isGroup && groupRuleCount > 0 && (
                <p className="text-gray-600 text-sm mt-2">
                  Contains {groupRuleCount} tax rule{groupRuleCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Warning Section */}
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800 mb-2">Warning</h4>
                <div className="text-sm text-red-700 space-y-1">
                  {isGroup ? (
                    <>
                      <div>• This tax group will be permanently removed</div>
                      <div>• Individual tax rules will remain available</div>
                      <div>• Existing bookings will not be affected</div>
                      <div>• This action cannot be reversed</div>
                    </>
                  ) : (
                    <>
                      <div>• This tax rule will be permanently removed</div>
                      <div>• Existing bookings will not be affected</div>
                      <div>• Rule will be removed from all tax groups</div>
                      <div>• This action cannot be reversed</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-50 text-sm order-2 sm:order-1"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Yes, Delete {itemDisplayName}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal in portal if available, otherwise render normally
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};