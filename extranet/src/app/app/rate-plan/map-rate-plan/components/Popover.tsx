import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover: React.FC<PopoverProps> = ({ 
  children, 
  content, 
  open: controlledOpen, 
  onOpenChange 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setOpen]);
  
  return (
    <div className="relative" ref={popoverRef}>
      <div onClick={() => setOpen(!isOpen)}>
        {children}
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border rounded-lg shadow-lg">
          {content}
        </div>
      )}
    </div>
  );
};

export const PopoverTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const PopoverContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);