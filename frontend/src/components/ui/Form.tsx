import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary-green-dark text-white hover:bg-primary-green-medium focus:ring-primary-green-dark',
    secondary: 'bg-neutral-background text-text-primary border border-neutral-border hover:bg-neutral-white focus:ring-primary-green-dark',
    outline: 'border border-primary-green-dark text-primary-green-dark hover:bg-primary-green-light focus:ring-primary-green-dark',
    ghost: 'text-text-primary hover:bg-neutral-background focus:ring-primary-green-dark',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <LeftIcon className="w-4 h-4 text-text-secondary" />
          </div>
        )}
        <input
          className={cn(
            'w-full px-3 py-2 border border-neutral-border rounded-lg bg-neutral-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-green-dark focus:border-transparent transition-all duration-200',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            error && 'border-accent-error focus:ring-accent-error',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <RightIcon className="w-4 h-4 text-text-secondary" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-accent-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-text-secondary">{helperText}</p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 border border-neutral-border rounded-lg bg-neutral-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-green-dark focus:border-transparent transition-all duration-200',
          error && 'border-accent-error focus:ring-accent-error',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-accent-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-text-secondary">{helperText}</p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-3 py-2 border border-neutral-border rounded-lg bg-neutral-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-green-dark focus:border-transparent transition-all duration-200 resize-none',
          error && 'border-accent-error focus:ring-accent-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-accent-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-text-secondary">{helperText}</p>
      )}
    </div>
  );
};
