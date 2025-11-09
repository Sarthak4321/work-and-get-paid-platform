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
  const baseStyles = 'px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 btn-shimmer shadow-lg hover:shadow-2xl text-base';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 disabled:cursor-not-allowed',
    secondary: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 disabled:cursor-not-allowed',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:hover:scale-100 disabled:cursor-not-allowed',
    outline: 'border-2 border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-50 hover:border-indigo-700 hover:scale-105 disabled:border-gray-300 disabled:text-gray-300 disabled:hover:scale-100 disabled:cursor-not-allowed',
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
