import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, helperText, leftIcon, rightIcon, prefixText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const displayedHint = hint || helperText;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          {prefixText && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500 font-medium text-sm">
              {prefixText}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border border-slate-300 py-2.5 px-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fintech-navy-900 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed shadow-sm',
              leftIcon && 'pl-10',
              prefixText && 'pl-9',
              rightIcon && 'pr-10',
              error && 'border-rose-400 focus:ring-rose-500 bg-rose-50/20 text-rose-900',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && displayedHint && <p className="mt-1 text-xs text-slate-500">{displayedHint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
