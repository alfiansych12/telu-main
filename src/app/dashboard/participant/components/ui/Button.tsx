import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const Button = ({ variant = 'primary', children, className, ...props }: ButtonProps) => (
  <button
    className={clsx(
      'px-4 py-2 rounded-lg font-semibold transition-colors',
      variantClasses[variant],
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export default Button;
