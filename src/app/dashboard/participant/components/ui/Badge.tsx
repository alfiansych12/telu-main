import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'red' | 'yellow' | 'gray' | 'blue';
  className?: string;
}

const colorClasses = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
};

const Badge = ({ children, color = 'gray', className }: BadgeProps) => (
  <span
    className={clsx(
      'inline-block px-3 py-1 text-xs font-medium rounded-full',
      colorClasses[color],
      className
    )}
  >
    {children}
  </span>
);

export default Badge;
