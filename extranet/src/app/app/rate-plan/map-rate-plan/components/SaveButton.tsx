import React from 'react';
import { Save, Loader2 } from 'lucide-react';

interface SaveButtonProps {
  isLoading: boolean;
  handleSave: () => void;
  disabled: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  isLoading,
  handleSave,
  disabled
}) => {
  return (
    <button
      onClick={handleSave}
      disabled={disabled || isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
        disabled || isLoading
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
    </button>
  );
};