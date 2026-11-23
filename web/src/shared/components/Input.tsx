import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...rest }, ref) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={`h-13 rounded-xl border px-4 text-base font-sans box-border
          focus:outline-2 focus:outline-primary focus:outline-offset-1 focus:border-primary
          ${error ? 'border-danger' : 'border-border'} ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  ),
);

Input.displayName = 'Input';
export default Input;
