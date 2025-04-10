import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title,
  titleIcon,
  titleClassName = '',
  bodyClassName = '',
  noPadding = false,
  hoverEffect = true,
  borderRadius = 'xl',
  shadow = 'sm',
  footer,
  footerClassName = '',
  onClick,
}) => {
  const shadowVariants = {
    none: '',
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  const radiusVariants = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };
  
  const selectedShadow = shadowVariants[shadow] || shadowVariants.sm;
  const selectedRadius = radiusVariants[borderRadius] || radiusVariants.xl;
  const hoverStyles = hoverEffect ? 'hover:shadow-md transition-shadow duration-200' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`bg-white ${selectedShadow} ${hoverStyles} ${selectedRadius} border border-gray-200 overflow-hidden ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className={`px-6 py-4 border-b border-gray-200 flex items-center ${titleClassName}`}>
          {titleIcon && <div className="mr-3">{titleIcon}</div>}
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-6'} ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 