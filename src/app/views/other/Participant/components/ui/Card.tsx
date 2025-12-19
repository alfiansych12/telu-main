// src/app/views/other/Participant/components/ui/Card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, style, className, ...rest }) => (
  <div
    className={
      'bg-white rounded-lg shadow-md p-4 ' + (className ? className : '')
    }
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
