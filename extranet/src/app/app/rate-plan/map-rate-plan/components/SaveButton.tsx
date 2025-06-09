import React from 'react';

interface SaveButtonProps {
  isLoading: boolean;
  editingRows: Set<number>;
  handleSave: () => void;
  disabled: any;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  isLoading,
  editingRows,
  handleSave,
  disabled
}) => {
  return (
    <button
      onClick={handleSave}
      disabled={isLoading || editingRows.size === 0 || disabled}
      className="px-4 py-2 bg-tripswift-blue text-tripswift-off-white rounded-lg hover:bg-[#054B8F] disabled:opacity-50 font-tripswift-semibold transition-colors duration-200"
    >
      {isLoading ? 'Saving...' : 'Save Changes'}
    </button>
  );
};