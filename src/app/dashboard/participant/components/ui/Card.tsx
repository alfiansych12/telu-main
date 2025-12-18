import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className, style, ...props }: CardProps & { style?: React.CSSProperties }) => (
  <div
    className={clsx(
      'bg-white shadow-lg',
      className
    )}
    style={{ borderRadius: 12, padding: 24, ...style }}
    {...props}
  >
    {children}
  </div>
);

export default Card;
