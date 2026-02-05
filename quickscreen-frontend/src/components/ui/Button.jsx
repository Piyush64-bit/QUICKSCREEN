import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  disabled,
  ...props 
}) => {
  const baseStyles = "group relative inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ease-out active:scale-[0.98] overflow-hidden isolate";
  
  const variants = {
    primary: `
      bg-primary text-white rounded-xl border border-white/10
      shadow-[0_0_15px_rgba(86,130,177,0.3)] 
      hover:shadow-[0_0_35px_rgba(86,130,177,0.6)] 
      hover:-translate-y-0.5
      font-bold
    `,
    secondary: `
      bg-surface text-white rounded-xl border border-white/5 
      hover:bg-surfaceHighlight hover:border-white/20 
      hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]
    `,
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs uppercase tracking-wider font-semibold",
    md: "px-6 py-3 text-sm font-medium",
    lg: "px-8 py-4 text-base font-medium",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Premium Shine Effect for Primary Variant */}
      {variant === 'primary' && !disabled && !isLoading && (
        <div className="absolute inset-0 -z-10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
      )}
      
      {/* Background Gradient Animation for Primary */}
      {variant === 'primary' && !disabled && (
        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-primary to-primary/80 opacity-100 group-hover:opacity-90 transition-opacity" />
      )}

      {/* Button Content */}
      <div className="relative flex items-center gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </div>
    </button>
  );
};

export default Button;
