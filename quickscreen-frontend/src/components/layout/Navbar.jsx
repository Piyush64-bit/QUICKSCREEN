import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Logo from '../../assets/LOGO.png';

const NavLink = ({ to, children, external }) => {
  const baseClasses = "relative group px-1 py-1 text-sm font-medium text-gray-400 transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(86,130,177,0.5)]";
  
  // Marvelous Underline Effect
  const underline = (
    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-center shadow-[0_0_10px_rgba(86,130,177,0.8)]" />
  );

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={baseClasses}>
        {children}
        {underline}
      </a>
    );
  }
  return (
    <Link to={to} className={baseClasses}>
      {children}
      {underline}
    </Link>
  );
};

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 w-full mb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <div className="bg-surface/70 backdrop-blur-xl border border-white/5 rounded-2xl px-6 h-16 flex items-center justify-between shadow-lg">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 group-hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden">
               <img src={Logo} alt="Quick Screen" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-sm tracking-wide text-white">QUICK SCREEN</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/about">About</NavLink>
            <NavLink to="/docs">Docs</NavLink>
            <NavLink to="https://github.com/Piyush64-bit/QUICKSCREEN" external>GitHub</NavLink>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/room/new">
                <Button size="sm">Start Sharing</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
