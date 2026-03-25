import { useState, useEffect, CSSProperties } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import OnboardingModal from '../components/OnboardingModal';
import api from '../api/axios';
import EditGoalsModal from '../components/dashboard/EditGoalsModal';

const DashboardPage = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/users/me');
        setUserData(res.data);

        // Show onboarding modal if user hasn't completed it
        if (!res.data.has_completed_onboarding) {
          setIsOnboardingOpen(true);
        }
      } catch (err: any) {
        const errorMessage = err?.response?.data?.detail || 'Failed to load dashboard';
        setError(errorMessage);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleOnboardingComplete = async (method: 'linkedin' | 'cv' | 'skip') => {
    try {
      // Re-fetch user data to confirm onboarding flag was set on backend
      const res = await api.get('/users/me');
      setUserData(res.data);
      setIsOnboardingOpen(false);
      console.log(`Onboarding completed via: ${method}`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Failed to confirm onboarding';
      setError(errorMessage);
      console.error('Error confirming onboarding:', err);
      // Still close the modal even if re-fetch fails, since onboarding was already updated
      setIsOnboardingOpen(false);
    }
  };

  const handleSaveGoals = async (formData: any) => {
    try {
      setError(null);
      const res = await api.patch('/users/me', formData);
      setUserData(res.data);
      setIsModalOpen(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Failed to save goals';
      setError(errorMessage);
      console.error('Error saving goals:', err);
      throw err;
    }
  };

  const safeUserData = userData || {};

  const targetDate = (() => {
    if (!safeUserData.target_date || safeUserData.target_date.trim() === '') {
      return 'Not set';
    }
    const d = new Date(safeUserData.target_date);
    return isNaN(d.getTime())
      ? 'Not set'
      : d.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
  })();

  const min = safeUserData.salary_min?.toLocaleString() || '0';
  const max = safeUserData.salary_max?.toLocaleString() || '0';
  const currencyTrimmed = (safeUserData.currency || '').trim() || 'US Dollar';
  const symbol = currencyTrimmed === 'US Dollar' ? 'US$' : currencyTrimmed;
  const targetSalaryRange = `${symbol}${min} to ${symbol}${max}`;

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: 18,
          color: '#666'
        }}>
          <div>
            <div style={{ marginBottom: 16 }}>Loading dashboard...</div>
            <div style={{ fontSize: 12, color: '#999' }}>Please wait</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !userData) {
    return (
      <DashboardLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: 8,
            padding: 24,
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#d32f2f' }}>Failed to Load Dashboard</h3>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: 14 }}>
              {error || 'Unable to fetch your dashboard data'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={styles.dashboardGrid}>
        {/* Error message if modal save failed */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: 4,
            padding: 12,
            color: '#d32f2f',
            fontSize: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                color: '#d32f2f'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Row 1: Next Career Goal */}
        <div style={styles.headerCard}>
          <div style={styles.headerTitleRow}>
            <h2 style={styles.headerTitle}>
              Next Career Goal: {(userData.next_career_goal || '').trim() || 'A fresh start'}{' '}
              <span
                className="material-symbols-outlined"
                style={{ ...styles.editIcon, cursor: 'pointer' }}
                onClick={() => setIsModalOpen(true)}
              >
                edit
              </span>{' '}
              <span
                style={{ ...styles.editGoals, cursor: 'pointer' }}
                onClick={() => setIsModalOpen(true)}
              >
                Edit Goals
              </span>
            </h2>
          </div>
          <div style={styles.goalDetails}>
            <div style={styles.goalItem}>
              <span style={styles.goalLabel}>Target Title</span>
              <span style={styles.goalValue}>
                {(userData.target_title || '').trim() || 'Data Science'}
              </span>
            </div>
            <div style={styles.goalItem}>
              <span style={styles.goalLabel}>Target Date</span>
              <span style={styles.goalValue}>{targetDate}</span>
            </div>
            <div style={styles.goalItem}>
              <span style={styles.goalLabel}>Target Salary Range</span>
              <span style={styles.goalValue}>{targetSalaryRange}</span>
            </div>
          </div>
        </div>

        <EditGoalsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveGoals}
          initialData={{
            next_career_goal: (userData.next_career_goal || '').trim() || 'A fresh start',
            target_title: (userData.target_title || '').trim() || 'Data Science',
            target_date: (userData.target_date || '').trim() || '2026-04-29',
            salary_min: userData.salary_min || 0,
            salary_max: userData.salary_max || 0,
            currency: (userData.currency || '').trim() || 'US Dollar',
          }}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleOnboardingComplete}
        />

        {/* Row 2 & 3: Main Widgets */}
        <div style={styles.mainContentGrid}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            {/* Job Applications */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  Job Applications{' '}
                  <span
                    className="material-symbols-outlined"
                    style={{ ...styles.infoIcon, verticalAlign: 'middle' }}
                  >
                    info
                  </span>
                </h3>
                <span className="material-symbols-outlined" style={styles.editIcon}>
                  edit
                </span>
              </div>
              <div style={styles.chartContainer}>
                <div style={styles.circularChart}>
                  <div style={styles.circularInner}>
                    <span style={styles.chartNumber}>0</span>
                    <span style={styles.chartText}>applications sent</span>
                  </div>
                </div>
                <div style={styles.goalBadge}>Goal: 5</div>
                <p style={styles.chartHint}>
                  Make sure to move jobs to "Applied" in your Job Tracker to see
                  your weekly goal progress ✅
                </p>
              </div>
            </div>

            {/* Priorities */}
            <div style={{ ...styles.card, marginTop: 20 }}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Priorities</h3>
              </div>
              <div style={styles.emptyContent}>{/* Empty in image */}</div>
            </div>
          </div>

          {/* Center Column */}
          <div style={styles.centerColumn}>
            {/* Job Search Pipeline */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Job Search Pipeline</h3>
              </div>
              <p style={styles.subtitle}>
                Displaying results: 12/30/2025 - 03/11/2026
              </p>
              <div style={styles.pipelineContainer}>
                <div style={styles.pipelineItem}>
                  <span style={styles.pipelineLabel}>Bookmarked</span>
                  <div style={styles.pipelineBarWrapper}>
                    <div
                      style={{
                        ...styles.pipelineBar,
                        width: '60%',
                        backgroundColor: '#94b9b5',
                      }}
                    ></div>
                    <span style={styles.pipelineValue}>1</span>
                  </div>
                </div>
                <div style={styles.pipelineItem}>
                  <div style={styles.pipelineLabelRow}>
                    <span style={styles.percentBadge}>0%</span>
                    <span style={styles.pipelineLabel}>Applied</span>
                  </div>
                  <div style={styles.pipelineBarWrapper}>
                    <div style={{ ...styles.pipelineBar, width: '0%' }}></div>
                    <span style={styles.pipelineValue}>0</span>
                  </div>
                </div>
                <div style={styles.pipelineItem}>
                  <div style={styles.pipelineLabelRow}>
                    <span style={styles.percentBadge}>0%</span>
                    <span style={styles.pipelineLabel}>Interviewing</span>
                  </div>
                  <div style={styles.pipelineBarWrapper}>
                    <div style={{ ...styles.pipelineBar, width: '0%' }}></div>
                    <span style={styles.pipelineValue}>0</span>
                  </div>
                </div>
                <div style={styles.pipelineItem}>
                  <div style={styles.pipelineLabelRow}>
                    <span style={styles.percentBadge}>0%</span>
                    <span style={styles.pipelineLabel}>Negotiating</span>
                  </div>
                  <div style={styles.pipelineBarWrapper}>
                    <div style={{ ...styles.pipelineBar, width: '0%' }}></div>
                    <span style={styles.pipelineValue}>0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            {/* Teal+ Promo */}
            <div style={styles.promoCard}>
              <div style={styles.promoHeader}>
                <h2 style={styles.promoLogo}>teal +</h2>
                <p style={styles.promoSubtitle}>What's included:</p>
              </div>
              <ul style={styles.promoList}>
                <li style={styles.promoItem}>
                  <div style={styles.promoIcon}>📊</div>
                  <div>
                    <div style={styles.promoItemTitle}>Unlimited Analysis</div>
                    <div style={styles.promoItemDesc}>
                      Real-time feedback and expert tips
                    </div>
                  </div>
                </li>
                <li style={styles.promoItem}>
                  <div style={styles.promoIcon}>⭐</div>
                  <div>
                    <div style={styles.promoItemTitle}>Unlimited Keywords</div>
                    <div style={styles.promoItemDesc}>
                      Strengthen your resume with keywords
                    </div>
                  </div>
                </li>
                <li style={styles.promoItem}>
                  <div style={styles.promoIcon}>🪄</div>
                  <div>
                    <div style={styles.promoItemTitle}>Unlimited AI</div>
                    <div style={styles.promoItemDesc}>
                      Customize and Enhance with AI
                    </div>
                  </div>
                </li>
              </ul>
              <button style={styles.upgradeButton}>Upgrade to Teal+</button>
            </div>

            {/* Dates / Calendar */}
            <div style={{ ...styles.card, marginTop: 20 }}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Dates</h3>
              </div>
              <div style={styles.calendarLock}>
                <div style={styles.lockIcon}>🔒</div>
                <p style={styles.lockText}>
                  Set a date on a job or contact to unlock this module
                </p>
              </div>
              <div style={styles.miniCalendar}>
                <div style={styles.calendarDays}>
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                  <span>S</span>
                </div>
                <div style={styles.calendarDates}>
                  <span>09</span>
                  <span>10</span>
                  <span style={styles.today}>11</span>
                  <span>12</span>
                  <span>13</span>
                  <span>14</span>
                  <span>15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const styles: Record<string, CSSProperties> = {
  dashboardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth: 1200,
    margin: '0 auto',
  },
  headerCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: 8,
    border: '1px solid #e1e4e8',
  },
  headerTitleRow: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    margin: 0,
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  editIcon: {
    fontSize: 16,
    color: '#6b7280',
    cursor: 'pointer',
  },
  editGoals: {
    fontSize: 14,
    color: '#b59a5d',
    cursor: 'pointer',
    fontWeight: 500,
  },
  goalDetails: {
    display: 'flex',
    gap: 64,
  },
  goalItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  goalLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  goalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  mainContentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 20,
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: 8,
    border: '1px solid #e1e4e8',
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    margin: 0,
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 0',
  },
  circularChart: {
    width: 140,
    height: 140,
    borderRadius: '50%',
    border: '12px solid #e5e7eb',
    borderTopColor: '#9333ea', // Circular progress color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  circularInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  chartNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  chartText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  goalBadge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '4px 16px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartHint: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 20,
  },
  pipelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  pipelineItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  pipelineLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  percentBadge: {
    fontSize: 10,
    backgroundColor: '#ffedd5',
    color: '#9a3412',
    padding: '2px 6px',
    borderRadius: 4,
    fontWeight: 'bold',
  },
  pipelineLabel: {
    fontSize: 13,
    color: '#4b5563',
  },
  pipelineBarWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  pipelineBar: {
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    flex: 1,
  },
  pipelineValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#114a43',
    width: 20,
  },
  promoCard: {
    backgroundColor: '#114a43',
    color: 'white',
    padding: '24px',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  promoHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  promoLogo: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 0,
  },
  promoSubtitle: {
    fontSize: 16,
    margin: 0,
    opacity: 0.9,
  },
  promoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  promoItem: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  promoIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  promoItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  promoItemDesc: {
    fontSize: 12,
    opacity: 0.8,
  },
  upgradeButton: {
    backgroundColor: '#eab308',
    color: '#114a43',
    border: 'none',
    padding: '12px',
    borderRadius: 20,
    fontWeight: 'bold',
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 8,
  },
  calendarLock: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 18,
    color: '#9ca3af',
  },
  lockText: {
    fontSize: 12,
    color: '#4b5563',
    margin: 0,
    lineHeight: 1.4,
  },
  miniCalendar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  calendarDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  calendarDates: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
  },
  today: {
    backgroundColor: '#114a43',
    color: 'white',
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  emptyContent: {
    height: 100,
  },
};

export default DashboardPage;
