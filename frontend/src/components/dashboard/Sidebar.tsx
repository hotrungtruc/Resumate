import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: 'home' },
    { label: 'Resume Builder', path: '/resume-builder', icon: 'description' },
    { label: 'Trackers', path: '/trackers', icon: 'monitoring' },
    { label: 'AI Job Search', path: '/ai-job-search', icon: 'auto_awesome' },
  ];

  const bottomItems = [
    { label: 'Support Center', path: '/support', icon: 'support_agent' },
  ];

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'TH';

  return (
    <aside style={{ ...styles.sidebar, width: isCollapsed ? 72 : 240 }}>
      <div
        style={{
          ...styles.logoContainer,
          cursor: isCollapsed ? 'pointer' : 'default',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
        onClick={isCollapsed ? toggleCollapse : undefined}
        title={isCollapsed ? 'Mở rộng' : ''}
      >
        <div style={styles.logoWrapper}>
          <span
            className="material-symbols-outlined"
            style={{
              ...styles.logoIcon,
              marginRight: isCollapsed ? 0 : 4,
            }}
          >
            category
          </span>
          {!isCollapsed && <span style={styles.logoText}>teal</span>}
        </div>
        {!isCollapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
            style={{
              ...styles.toggleBtn,
              right: 8,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              keyboard_double_arrow_left
            </span>
          </button>
        )}
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              title={isCollapsed ? item.label : ''}
              style={{
                ...styles.navLink,
                ...(isActive ? styles.activeLink : {}),
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '10px 0' : '10px 12px',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ ...styles.icon, marginRight: isCollapsed ? 0 : 12 }}
              >
                {item.icon}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={styles.bottomNav}>
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            title={isCollapsed ? item.label : ''}
            style={{
              ...styles.navLink,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: isCollapsed ? '10px 0' : '10px 12px',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ ...styles.icon, marginRight: isCollapsed ? 0 : 12 }}
            >
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
        <div
          style={{
            ...styles.accountSettings,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '10px 0' : '10px 12px',
          }}
        >
          <div
            style={{
              ...styles.userAvatar,
              marginRight: isCollapsed ? 0 : 10,
            }}
          >
            {userInitials}
          </div>
          {!isCollapsed && (
            <>
              <span style={styles.navLinkText}>Account Settings</span>
              <button onClick={handleLogout} style={styles.logoutSmall}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  logout
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    backgroundColor: '#f6f7f8',
    borderRight: '1px solid #e1e4e8',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    transition: 'width 0.3s ease',
    overflowX: 'hidden',
  },
  logoContainer: {
    padding: '20px 16px',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  toggleBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #e1e4e8',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#4b5563',
    padding: '2px 6px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#114a43',
    letterSpacing: '-0.5px',
  },
  logoIcon: {
    fontSize: 20,
    color: '#114a43',
  },
  nav: {
    flex: 1,
    padding: '0 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navLink: {
    padding: '10px 12px',
    color: '#4b5563',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 6,
    transition: 'background-color 0.2s',
  },
  activeLink: {
    backgroundColor: '#e5e7eb',
    color: '#111827',
  },
  icon: {
    marginRight: 12,
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  bottomNav: {
    padding: '16px 8px',
    borderTop: '1px solid #e1e4e8',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  accountSettings: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    marginTop: 8,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    border: '1px solid #d1d5db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4b5563',
    marginRight: 10,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#4b5563',
    flex: 1,
  },
  logoutSmall: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    fontSize: 16,
    opacity: 0.6,
  },
};

export default Sidebar;
