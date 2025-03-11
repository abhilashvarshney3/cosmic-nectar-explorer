
import React from 'react';
import { cn } from '@/lib/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  error?: string;
  type?: string;
  options?: { value: string; label: string }[];
}

const InputField = ({ 
  label, 
  error, 
  type = 'text', 
  options, 
  className, 
  ...props 
}: InputFieldProps) => {
  const isSelect = type === 'dropdown' || type === 'select';
  
  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {isSelect ? (
        <select
          className={cn(
            "input-field",
            error ? "border-vedic-error focus:ring-vedic-error/30" : "",
            className
          )}
          {...props}
        >
          <option value="">Select an option</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={cn(
            "input-field",
            error ? "border-vedic-error focus:ring-vedic-error/30" : "",
            className
          )}
          {...props}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-vedic-error animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
