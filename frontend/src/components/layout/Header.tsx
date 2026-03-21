import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          Resumate
        </Link>
        <nav style={styles.nav}>
          <Link to="/login" style={styles.navLink}>
            Login
          </Link>
          <Link
            to="/register"
            style={{ ...styles.navLink, ...styles.registerButton }}
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '16px 0',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  navLink: {
    fontSize: 16,
    color: '#555',
    textDecoration: 'none',
    fontWeight: 500,
  },
  registerButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '4px',
  },
};

export default Header;
