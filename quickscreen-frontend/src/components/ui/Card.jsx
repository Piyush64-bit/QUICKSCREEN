import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-gradient-to-b from-surface/50 to-surface/30 backdrop-blur-sm border border-white/5 rounded-2xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;
