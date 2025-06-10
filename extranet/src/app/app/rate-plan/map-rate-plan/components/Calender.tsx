import React, { useState } from 'react';

interface CalendarProps {
  mode?: 'single' | 'range';
  selected?: Date | { from: Date; to: Date };
  onSelect?: (date: Date | { from: Date; to: Date } | undefined) => void;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  mode = 'single', 
  selected, 
  onSelect, 
  className = '' 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const isDateSelected = (date: Date) => {
    if (!selected) return false;
    
    if (mode === 'single') {
      return formatDate(date) === formatDate(selected as Date);
    } else {
      const range = selected as { from: Date; to: Date };
      if (!range.from) return false;
      if (!range.to) return formatDate(date) === formatDate(range.from);
      
      return date >= range.from && date <= range.to;
    }
  };
  
  const handleDateClick = (date: Date) => {
    if (mode === 'single') {
      onSelect?.(date);
    } else {
      const range = selected as { from: Date; to: Date } || { from: null, to: null };
      if (!range.from || (range.from && range.to)) {
        onSelect?.({ from: date, to: null as any });
      } else {
        if (date < range.from) {
          onSelect?.({ from: date, to: range.from });
        } else {
          onSelect?.({ from: range.from, to: date });
        }
      }
    }
  };
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isDateSelected(date);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-8 w-8 text-sm rounded hover:bg-blue-100 ${
            isSelected ? 'bg-tripswift-blue text-white' : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
          &lt;
        </button>
        <h3 className="font-medium">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
          &gt;
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="h-8 w-8 text-xs text-gray-500 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};
