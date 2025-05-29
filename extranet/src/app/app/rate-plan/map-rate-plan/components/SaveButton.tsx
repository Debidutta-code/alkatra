import React from 'react';

interface SaveButtonProps {
  isLoading: boolean;
  editingRows: Set<number>;
  handleSave: () => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  isLoading,
  editingRows,
  handleSave,
}) => {
  return (
    <button
      onClick={handleSave}
      disabled={isLoading || editingRows.size === 0}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {isLoading ? 'Saving...' : 'Save Changes'}
    </button>
  );
};