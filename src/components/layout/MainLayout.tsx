import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, Utensils, Home, User, Settings } from 'lucide-react';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <Home size={24} />, label: 'ראשי' },
    { path: '/meals', icon: <Utensils size={24} />, label: 'תפריט' },
    { path: '/workouts', icon: <Activity size={24} />, label: 'אימון' },
    { path: '/progress', icon: <User size={24} />, label: 'מעקב' },
    { path: '/settings', icon: <Settings size={24} />, label: 'הגדרות' },
  ];

  return (
    <div className="layout-container">
      {/* Top Header for Mobile/Tablet */}
      <header className="mobile-header">
        <div className="logo">
          <Activity color="var(--color-primary)" size={28} />
          <span>NutriGenius</span>
        </div>
        <Link to="/settings" className="settings-btn">
          <Settings size={24} color="var(--color-text-muted)" />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile / Side Navigation for Desktop */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MainLayout;
