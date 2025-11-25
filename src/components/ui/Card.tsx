import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false 
}) => {
  const baseStyles = 'bg-white rounded-xl border border-gray-200';
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverStyles = hover ? 'transition-shadow duration-200 hover:shadow-md' : '';

  return (
    <div className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;