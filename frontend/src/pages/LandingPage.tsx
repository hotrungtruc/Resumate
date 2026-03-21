import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={styles.pageContainer}>
      <Header />
      <main style={styles.mainContent}>
        {/* Hero Section */}
        <section style={styles.heroSection}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>Build Your Perfect Resume with AI</h1>
            <p style={styles.heroSubtitle}>
              Leverage the power of artificial intelligence to create a
              professional, job-winning resume in minutes.
            </p>
            <Link to="/register" style={styles.callToAction}>
              Get Started for Free
            </Link>
          </div>
          <div style={styles.heroImageContainer}>
            <img
              src="https://via.placeholder.com/600x400?text=AI+Resume+Builder"
              alt="AI Resume Builder"
              style={styles.heroImage}
            />
          </div>
        </section>

        {/* Features Section */}
        <section style={styles.featuresSection}>
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Why Choose Resumate?</h2>
            <div style={styles.featureGrid}>
              <div style={styles.featureItem}>
                <h3 style={styles.featureTitle}>AI-Powered Suggestions</h3>
                <p style={styles.featureDescription}>
                  Get intelligent recommendations for keywords, phrases, and
                  formats to optimize your resume for any job.
                </p>
              </div>
              <div style={styles.featureItem}>
                <h3 style={styles.featureTitle}>Professional Templates</h3>
                <p style={styles.featureDescription}>
                  Choose from a wide range of modern and industry-specific
                  templates designed to make your application stand out.
                </p>
              </div>
              <div style={styles.featureItem}>
                <h3 style={styles.featureTitle}>Easy Customization</h3>
                <p style={styles.featureDescription}>
                  Intuitive drag-and-drop interface allows you to personalize
                  every aspect of your resume with ease.
                </p>
              </div>
              <div style={styles.featureItem}>
                <h3 style={styles.featureTitle}>ATS Friendly</h3>
                <p style={styles.featureDescription}>
                  Our resumes are optimized to pass Applicant Tracking Systems,
                  increasing your chances of getting noticed by recruiters.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  mainContent: {
    flex: 1,
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
  },
  heroSection: {
    backgroundColor: '#f0f8ff',
    padding: '80px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '40px',
  },
  heroContent: {
    maxWidth: 500,
    textAlign: 'left',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 30,
    lineHeight: 1.6,
  },
  callToAction: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '14px 28px',
    fontSize: 18,
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block',
    transition: 'background-color 0.3s ease',
  },
  heroImageContainer: {
    maxWidth: 600,
  },
  heroImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  },
  featuresSection: {
    padding: '80px 0',
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 60,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '40px',
  },
  featureItem: {
    backgroundColor: '#f9f9f9',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 1.6,
  },
};

export default LandingPage;
