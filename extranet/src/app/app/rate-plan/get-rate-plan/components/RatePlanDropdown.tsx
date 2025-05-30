import { createPortal } from 'react-dom';
import { RatePlanInterFace } from '../types';

interface RatePlanDropdownProps {
  ratePlan: RatePlanInterFace;
  top: number;
  right: number;
  onEdit: (ratePlanId: string) => void;
  onDelete: (ratePlanId: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export default function RatePlanDropdown({
  ratePlan,
  top,
  right,
  onEdit,
  onDelete,
  dropdownRef,
}: RatePlanDropdownProps) {
  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-white shadow-lg rounded-lg z-50 min-w-[150px]"
      style={{ top: `${top}px`, right: `${right}px` }}
    >
      <button
        onClick={() => onEdit(ratePlan._id)}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
      >
        Edit Rate Plan
      </button>
      <button
        onClick={() => onDelete(ratePlan._id)}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-900 transition-colors duration-150"
      >
        Delete Rate Plan
      </button>
      <div className="absolute bottom-[-5px] right-3 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45" />
    </div>,
    document.body
  );
}