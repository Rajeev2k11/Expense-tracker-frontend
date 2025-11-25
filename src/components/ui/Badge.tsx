import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  status?: 'Approved' | 'Pending' | 'Rejected' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  status = 'default', 
  size = 'sm', 
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center rounded-full font-medium';
  
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const statusStyles = {
    Approved: 'bg-green-100 text-green-800 border border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    Rejected: 'bg-red-100 text-red-800 border border-red-200',
    default: 'bg-gray-100 text-gray-800 border border-gray-200'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${statusStyles[status]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;