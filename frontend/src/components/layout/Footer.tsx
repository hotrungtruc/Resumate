import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Resumate</h3>
          <p style={styles.text}>Build your perfect resume with AI.</p>
        </div>
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Quick Links</h3>
          <ul style={styles.list}>
            <li>
              <Link to="/about" style={styles.link}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" style={styles.link}>
                Contact
              </Link>
            </li>
            <li>
              <Link to="/privacy" style={styles.link}>
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div style={styles.column}>
          <h3 style={styles.columnTitle}>Connect</h3>
          <ul style={styles.list}>
            <li>
              <a
                href="https://twitter.com/resumate"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/company/resumate"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div style={styles.bottomBar}>
        <p style={styles.bottomText}>
          &copy; {new Date().getFullYear()} Resumate. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#f8f8f8',
    padding: '40px 0 20px',
    borderTop: '1px solid #e0e0e0',
    marginTop: 'auto', // Push footer to the bottom
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '20px',
  },
  column: {
    flex: '1 1 200px',
    minWidth: '180px',
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 1.5,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  link: {
    fontSize: 14,
    color: '#666',
    textDecoration: 'none',
    marginBottom: 10,
    display: 'block',
  },
  bottomBar: {
    borderTop: '1px solid #eee',
    marginTop: 30,
    paddingTop: 20,
    textAlign: 'center',
  },
  bottomText: {
    fontSize: 12,
    color: '#888',
    margin: 0,
  },
};

export default Footer;
