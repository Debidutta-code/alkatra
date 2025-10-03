import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

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
    <div className="relative" ref={popoverRef} role="dialog" aria-hidden={!isOpen}>
      <div onClick={() => setOpen(!isOpen)} role="button" aria-label="Toggle popover">
        {children}
      </div>

      {isOpen && (
        <div
          className="absolute z-50 mt-2 bg-white border rounded-lg shadow-lg"
          role="menu"
          aria-label="Popover content"
        >
          {content}
        </div>
      )}
    </div>
  );
};

interface PopoverTriggerProps {
  children: React.ReactNode;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children }) => (
  <>{children}</>
);

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({
  children,
  className = '',
}) => (
  <div className={`p-4 ${className}`} role="menuitem">
    {children}
  </div>
);