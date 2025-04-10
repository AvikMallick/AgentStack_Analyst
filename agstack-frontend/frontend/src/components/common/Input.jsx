import React from 'react';

const Input = ({
  type = 'text',
  label,
  id,
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  className = '',
  icon = null,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${icon ? 'pl-10' : 'px-3'} py-2.5 border rounded-lg focus:outline-none focus:ring-2 shadow-sm ${
            error 
              ? 'border-red-300 focus:border-red-300 focus:ring-red-200 bg-red-50' 
              : 'border-gray-300 focus:border-blue-300 focus:ring-blue-100'
          }`}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default Input; 