import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const variants: { [key in ButtonProps['variant']]: string } = {
    primary: 'bg-[var(--color-primary-blue)] text-[var(--color-primary-off-white)] hover:bg-[#054B8F]',
    secondary: 'bg-[var(--color-secondary-off-white)] text-[var(--color-secondary-black)] hover:bg-gray-200',
    outline: 'border border-gray-300 text-[var(--color-secondary-black)] hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-[var(--color-secondary-black)] hover:bg-gray-100',
  };

  const sizes: { [key in ButtonProps['size']]: string } = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      className={`${variants[variant]} ${sizes[size]} rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;