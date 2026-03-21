import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.mainContent}>{children}</main>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f6f7f8',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    overflowY: 'auto',
  },
};

export default DashboardLayout;
