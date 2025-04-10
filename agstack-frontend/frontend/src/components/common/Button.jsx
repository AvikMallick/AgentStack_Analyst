import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  title = '',
  ...props
}) => {
  const baseStyles = 'rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 inline-flex items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-300 shadow-sm',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-300 border border-gray-300 shadow-sm',
    outline: 'bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-300 border border-blue-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-300 shadow-sm',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-300 shadow-sm',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300',
  };
  
  const sizeStyles = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-sm',
    lg: 'py-2.5 px-5 text-base',
    xl: 'py-3 px-6 text-lg',
  };
  
  const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default Button; 