import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, ArrowRightLeft, User } from 'lucide-react';

const BottomNav = () => {
  return (
    <div className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/trade" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BarChart2 size={20} />
        <span>Trade</span>
      </NavLink>
      <NavLink to="/exchange" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <ArrowRightLeft size={20} />
        <span>Exchange</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
