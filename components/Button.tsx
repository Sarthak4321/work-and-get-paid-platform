import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 btn-shimmer shadow-md hover:shadow-lg';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 disabled:bg-gray-300 disabled:hover:scale-100',
    secondary: 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 disabled:bg-gray-300 disabled:hover:scale-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 disabled:bg-gray-300 disabled:hover:scale-100',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:scale-105 disabled:border-gray-300 disabled:text-gray-300 disabled:hover:scale-100',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}
