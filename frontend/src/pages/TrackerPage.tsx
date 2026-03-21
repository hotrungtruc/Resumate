import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const TrackerPage = () => {
  const stages = [
    { label: 'BOOKMARKED', count: '2', active: false },
    { label: 'APPLYING', count: '1', active: true },
    { label: 'APPLIED', count: '--', active: false },
    { label: 'INTERVIEWING', count: '--', active: false },
    { label: 'NEGOTIATING', count: '--', active: false },
    { label: 'ACCEPTED', count: '--', active: false },
  ];

  const jobs = [
    {
      position: 'Product Designer - Sample Job',
      company: 'Acme Corp',
      salary: 'US$0',
      location: 'Anywhere, USA',
      status: 'Applying',
      dateSaved: '12/30/2025',
      deadline: 'N/A',
      dateApplied: '12/30/2025',
      followUp: '01/02/2026',
      excitement: 2,
    },
    {
      position: 'Customer Service Representative',
      company: 'Hajoca Corporation',
      salary: 'US$0',
      location: 'Stroudsburg, PA',
      status: 'Bookmarked',
      dateSaved: '03/12/2026',
      deadline: 'N/A',
      dateApplied: 'N/A',
      followUp: 'Add date',
      excitement: 0,
    },
    {
      position: 'HO - Data Quality/ Data Governance Specialist',
      company: 'Ngân Hàng Á Châu | ACB',
      salary: 'US$0',
      location: 'Add location',
      status: 'Bookmarked',
      dateSaved: '01/23/2026',
      deadline: 'N/A',
      dateApplied: 'N/A',
      followUp: 'Add date',
      excitement: 4,
    },
  ];

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Top Tabs */}
        <div style={styles.tabsRow}>
          <button style={{ ...styles.tab, ...styles.activeTab }}>
            <span className="material-symbols-outlined" style={styles.tabIcon}>keyboard_double_arrow_right</span>
            Jobs
          </button>
          <button style={styles.tab}>
            <span className="material-symbols-outlined" style={styles.tabIcon}>person_outline</span>
            People
          </button>
          <button style={styles.tab}>
            <span className="material-symbols-outlined" style={styles.tabIcon}>cloud_queue</span>
            Companies
          </button>
        </div>

        {/* Pipeline Stages */}
        <div style={styles.pipeline}>
          {stages.map((stage, index) => (
            <div
              key={stage.label}
              style={{
                ...styles.stage,
                ...(stage.active ? styles.activeStage : {}),
                ...(index === stages.length - 1 ? { borderRight: 'none' } : {}),
              }}
            >
              <div style={styles.stageCount}>{stage.count}</div>
              <div style={styles.stageLabel}>{stage.label}</div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div style={styles.actionBar}>
          <div style={styles.leftActions}>
            <div style={styles.selectBox}>
              <input type="checkbox" />
              <span style={styles.selectedText}>0 selected</span>
            </div>
          </div>
          <div style={styles.rightActions}>
            <div style={styles.dropdown}>
              <span>Group by: None</span>
              <span className="material-symbols-outlined" style={styles.dropdownIcon}>expand_more</span>
            </div>
            <button style={styles.secondaryBtn}>Columns</button>
            <button style={styles.secondaryBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 4 }}>menu</span>
              Menu
            </button>
            <button style={styles.primaryBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 4 }}>add_circle</span>
              Add a New Job
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}><input type="checkbox" /></th>
                <th style={styles.th}>Job Position <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
                <th style={styles.th}>Company <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
                <th style={styles.th}>Max. Salary <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
                <th style={styles.th}>Location <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
                <th style={styles.th}>Status <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
                <th style={styles.th}>Date Saved <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
                <th style={styles.th}>Deadline <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
                <th style={styles.th}>Date Applied <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
                <th style={styles.th}>Follow up <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
                <th style={styles.th}>Excitement <span className="material-symbols-outlined" style={styles.sortIcon}>expand_less</span></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, idx) => (
                <tr key={idx} style={styles.tr}>
                  <td style={styles.td}><input type="checkbox" /></td>
                  <td style={styles.td}>{job.position}</td>
                  <td style={styles.td}>{job.company}</td>
                  <td style={styles.td}>{job.salary}</td>
                  <td style={{ ...styles.td, color: job.location === 'Add location' ? '#888' : '#333' }}>{job.location}</td>
                  <td style={styles.td}>{job.status}</td>
                  <td style={styles.td}>{job.dateSaved}</td>
                  <td style={styles.td}>{job.deadline}</td>
                  <td style={styles.td}>{job.dateApplied}</td>
                  <td style={{ ...styles.td, color: job.followUp === 'Add date' ? '#888' : '#333' }}>{job.followUp}</td>
                  <td style={styles.td}>
                    <div style={styles.stars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 16,
                            color: star <= job.excitement ? '#b49b6a' : '#ddd',
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px 40px',
    backgroundColor: '#fff',
  },
  tabsRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  activeTab: {
    color: '#114a43',
    fontWeight: '600',
    backgroundColor: '#eefcf8',
    borderRadius: '4px',
  },
  tabIcon: {
    fontSize: '18px',
    marginRight: '6px',
  },
  pipeline: {
    display: 'flex',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '30px',
    overflow: 'hidden',
  },
  stage: {
    flex: 1,
    padding: '15px 10px',
    textAlign: 'center',
    borderRight: '1px solid #ddd',
    backgroundColor: '#fff',
    position: 'relative',
  },
  activeStage: {
    backgroundColor: '#fff',
    boxShadow: 'inset 0 -4px 0 0 #ffb800',
  },
  stageCount: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '4px',
    color: '#333',
  },
  stageLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#666',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  selectBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#666',
  },
  selectedText: {
    color: '#666',
  },
  rightActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  dropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#333',
    cursor: 'pointer',
    backgroundColor: '#fff',
  },
  dropdownIcon: {
    fontSize: '18px',
    color: '#888',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 16px',
    border: '1px solid #114a43',
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: '#114a43',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#114a43',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableContainer: {
    border: '1px solid #eee',
    borderRadius: '4px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f9f9f9',
    color: '#666',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px',
    color: '#333',
    whiteSpace: 'nowrap',
  },
  sortIcon: {
    fontSize: '14px',
    verticalAlign: 'middle',
    marginLeft: '2px',
    color: '#ccc',
  },
  stars: {
    display: 'flex',
    gap: '2px',
  },
};

export default TrackerPage;
