import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => (
  <div
    className={`bg-[var(--color-primary-off-white)] rounded-2xl shadow-sm border border-gray-100 ${
      hover ? 'hover:shadow-md transition-shadow duration-200' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export default Card;