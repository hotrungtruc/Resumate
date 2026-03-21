import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ResumeEditor from '../components/resume/ResumeEditor';
import ResumePreview from '../components/resume/ResumePreview';
import type { ResumeData } from '../components/resume/ResumeEditor';
import resumeService, { type Resume } from '../api/resumeService';

const ResumeBuilderPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [resumeName, setResumeName] = useState('Untitled Resume');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [recentResumes, setRecentResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);

  // Load recent resumes on page load
  useEffect(() => {
    loadRecentResumes();
  }, []);

  const loadRecentResumes = async () => {
    try {
      setIsLoading(true);
      const resumes = await resumeService.getResumes();
      setRecentResumes(resumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMasterProfile = async () => {
    try {
      const masterProfile = await resumeService.getMasterProfile();
      // Convert master profile to ResumeData format
      const resumeDataFromMaster: ResumeData = {
        contactInfo: {
          fullName: masterProfile.experiences?.[0]?.jobTitle ? '' : '',
          email: '',
          phone: '',
          location: '',
          linkedIn: '',
        },
        targetTitle: '',
        professionalSummary: '',
        workExperience: masterProfile.experiences || [],
        education: masterProfile.educations || [],
        skills: masterProfile.skills || [],
        certifications: masterProfile.certifications || [],
        awards: masterProfile.awards || [],
        projects: masterProfile.projects || [],
        volunteeringLeadership: masterProfile.volunteeringLeadership || [],
        publications: masterProfile.publications || [],
      };
      setResumeData(resumeDataFromMaster);
    } catch (error) {
      console.error('Failed to load master profile:', error);
    }
  };

  const loadResume = async (resumeId: string) => {
    try {
      const resume = await resumeService.getResume(resumeId);
      setCurrentResumeId(resume.id);
      setResumeName(resume.name);
      setResumeData(resume.data);
    } catch (error) {
      console.error('Failed to load resume:', error);
    }
  };

  const actionCards = [
    { label: 'New Resume', icon: 'add', color: '#eefcf8' },
    { label: 'Start from job description', icon: 'work', color: '#f0f3ff' },
    { label: 'Start from template', icon: 'architecture', color: '#fff0f3' },
    { label: 'New Cover Letter', icon: 'description', color: '#fff9e6' },
  ];

  const handleNewResume = () => {
    setCurrentResumeId(null);
    setResumeName('Untitled Resume');
    loadMasterProfile(); // Load master profile data for new resume
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    setCurrentResumeId(null);
  };

  const handleDataChange = (data: ResumeData) => {
    setResumeData(data);
  };

  const handleSaveResume = async () => {
    if (!resumeData) return;
    try {
      const resumeCreate = {
        name: resumeName,
        data: resumeData,
      };
      
      // Save to Resume collection
      if (currentResumeId) {
        // Update existing resume
        await resumeService.updateResume(currentResumeId, resumeCreate);
      } else {
        // Create new resume
        await resumeService.createResume(resumeCreate);
      }
      
      // Also save to Master Profile (update all reusable data)
      const masterProfileUpdate = {
        experiences: resumeData.workExperience,
        educations: resumeData.education,
        skills: resumeData.skills,
        certifications: resumeData.certifications,
        awards: resumeData.awards,
        projects: resumeData.projects,
        volunteeringLeadership: resumeData.volunteeringLeadership,
        publications: resumeData.publications,
      };
      
      await resumeService.updateMasterProfile(masterProfileUpdate);
      
      console.log('Resume and Master Profile saved!');
      // Reload recent resumes to show new/updated resume
      loadRecentResumes();
    } catch (error) {
      console.error('Failed to save resume:', error);
    }
  };

  if (isEditing) {
    return (
      <DashboardLayout>
        <div style={styles.editorContainer}>
          <div style={styles.editorTopBar}>
            <button style={styles.backButton} onClick={handleBack}>
              <span className="material-symbols-outlined" style={styles.backIcon}>
                arrow_back
              </span>
              Back
            </button>
            {isEditingTitle ? (
              <input
                type="text"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                style={styles.editableTitleInput}
              />
            ) : (
              <h1
                style={styles.editorTitle}
                onClick={() => setIsEditingTitle(true)}
              >
                {resumeName}
              </h1>
            )}
            <div style={styles.editorActions}>
              <button style={styles.exportButton} onClick={handleSaveResume}>
                <span className="material-symbols-outlined" style={styles.exportIcon}>
                  download
                </span>
                Export PDF
              </button>
              <button style={styles.menuButton}>
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
          <div style={styles.editorContent}>
            <div style={styles.editorSidebar}>
              <ResumeEditor onDataChange={handleDataChange} />
            </div>
            <div style={styles.previewSidebar}>
              {resumeData && <ResumePreview data={resumeData} />}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Resume Builder</h1>
          <button style={styles.menuButton}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, marginRight: 8, verticalAlign: 'middle' }}
            >
              menu
            </span>
            Menu
          </button>
        </div>

        <div style={styles.actionGrid}>
          {actionCards.map((card) => (
            <div
              key={card.label}
              style={styles.actionCard}
              onClick={() => card.label === 'New Resume' && handleNewResume()}
            >
              <div style={{ ...styles.iconWrapper, backgroundColor: card.color }}>
                <span
                  className="material-symbols-outlined"
                  style={{ ...styles.actionIcon, color: '#114a43' }}
                >
                  {card.icon}
                </span>
              </div>
              <span style={styles.actionLabel}>{card.label}</span>
            </div>
          ))}
        </div>

        <div style={styles.recentSection}>
          <div style={styles.recentHeader}>
            <h2 style={styles.sectionTitle}>Recent Resumes</h2>
            <div style={styles.filterBar}>
              <div style={styles.searchWrapper}>
                <input
                  type="text"
                  placeholder="Search Resumes"
                  style={styles.searchInput}
                />
                <span
                  className="material-symbols-outlined"
                  style={styles.searchIcon}
                >
                  search
                </span>
              </div>
              <button style={styles.iconBtn}>
                <span className="material-symbols-outlined">view_list</span>
              </button>
              <button style={styles.iconBtn}>
                <span className="material-symbols-outlined">swap_vert</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
              Loading resumes...
            </div>
          ) : recentResumes.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
              No resumes yet. Create your first resume!
            </div>
          ) : (
            <div style={styles.resumesGrid}>
              {recentResumes.map((resume) => (
                <div
                  key={resume.id}
                  style={styles.resumeCard}
                  onClick={() => {
                    loadResume(resume.id);
                    setIsEditing(true);
                  }}
                >
                  <div style={styles.resumeHeader}>
                    <h3 style={styles.resumeTitle}>{resume.name}</h3>
                    <span
                      className="material-symbols-outlined"
                      style={styles.moreIcon}
                      onClick={(e) => e.stopPropagation()}
                    >
                      more_horiz
                    </span>
                  </div>
                  <div style={styles.resumeMeta}>
                    <div style={styles.matchJob}>
                      <span
                        className="material-symbols-outlined"
                        style={styles.briefcaseIcon}
                      >
                        work_outline
                      </span>
                      <span style={styles.matchText}>Match a job</span>
                    </div>
                    <div style={styles.editedDate}>
                      <span
                        className="material-symbols-outlined"
                        style={styles.clockIcon}
                      >
                        schedule
                      </span>
                      <span>
                        Edited: {new Date(resume.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const styles = {
  container: {
    padding: '0 40px 40px 40px',
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  editorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    backgroundColor: '#fff',
  },
  editorTopBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fff',
    gap: '16px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    color: '#333',
    minWidth: 'auto',
  },
  backIcon: {
    fontSize: 18,
  },
  editorTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#333',
    margin: '0 auto 0 16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '6px 8px',
    borderRadius: '4px',
  },
  editableTitleInput: {
    fontSize: 20,
    fontWeight: 600,
    color: '#333',
    margin: '0 auto 0 16px',
    padding: '6px 8px',
    border: '2px solid #114a43',
    borderRadius: '4px',
    fontFamily: 'inherit',
    minWidth: '200px',
  },
  editorActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#114a43',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  },
  exportIcon: {
    fontSize: 18,
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  editorContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  editorSidebar: {
    flex: '0 0 40%',
    borderRight: '1px solid #eee',
    overflow: 'auto',
    backgroundColor: '#fff',
  },
  previewSidebar: {
    flex: '0 0 60%',
    overflow: 'auto',
    backgroundColor: '#f5f5f5',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #eee',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: '#333',
    margin: 0,
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginBottom: 48,
  },
  actionCard: {
    border: '1px solid #eee',
    borderRadius: 12,
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    backgroundColor: '#fff',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center' as const,
    fontWeight: 500,
  },
  recentSection: {
    marginTop: 20,
  },
  resumesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#333',
    margin: 0,
  },
  filterBar: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  searchWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    padding: '8px 32px 8px 12px',
    border: '1px solid #ddd',
    borderRadius: 4,
    fontSize: 14,
    width: 200,
  },
  searchIcon: {
    position: 'absolute' as const,
    right: 10,
    fontSize: 14,
    color: '#888',
  },
  iconBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
    cursor: 'pointer',
    color: '#114a43',
  },
  resumeCard: {
    width: 320,
    border: '1px solid #eee',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  resumeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#333',
    margin: 0,
  },
  moreIcon: {
    color: '#888',
    cursor: 'pointer',
  },
  resumeMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  matchJob: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#114a43',
    fontSize: 13,
    fontWeight: 500,
  },
  briefcaseIcon: {
    fontSize: 14,
  },
  matchText: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  editedDate: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#888',
    fontSize: 12,
  },
  clockIcon: {
    fontSize: 12,
  },
};

export default ResumeBuilderPage;
