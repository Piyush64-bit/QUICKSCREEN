import React from 'react';

const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full bg-surface/30 border border-white/5 rounded-xl px-5 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/10 focus:ring-1 focus:ring-white/5 transition-all duration-300 ${className}`}
      {...props}
    />
  );
};

export default Input;
