import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

interface PopoverContextType {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const toggleOpen = () => setOpen(!isOpen);

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
  }, [isOpen]);

  const contextValue: PopoverContextType = {
    isOpen,
    setOpen,
    toggleOpen
  };

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative" ref={popoverRef}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps {
  children: React.ReactNode;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children }) => {
  const context = useContext(PopoverContext);
  
  if (!context) {
    throw new Error('PopoverTrigger must be used within a Popover');
  }

  const { toggleOpen } = context;

  // Clone the child element and add onClick handler
  return React.cloneElement(children as React.ReactElement, {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleOpen();
      // Call original onClick if it exists
      const originalOnClick = (children as React.ReactElement).props.onClick;
      if (originalOnClick) {
        originalOnClick(e);
      }
    }
  });
};

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({
  children,
  className = '',
}) => {
  const context = useContext(PopoverContext);
  
  if (!context) {
    throw new Error('PopoverContent must be used within a Popover');
  }

  const { isOpen } = context;

  if (!isOpen) return null;

  return (
    <div className={`absolute z-50 mt-2 bg-white border rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  );
};