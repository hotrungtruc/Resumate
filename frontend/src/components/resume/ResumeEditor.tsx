import React, { useState } from 'react';

interface ResumeData {
  contactInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
  };
  targetTitle: string;
  professionalSummary: string;
  workExperience: Array<{
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  awards: Array<{
    id: string;
    title: string;
    issuer: string;
    date: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url: string;
  }>;
  volunteeringLeadership: Array<{
    id: string;
    role: string;
    organization: string;
    description: string;
  }>;
  publications: Array<{
    id: string;
    title: string;
    publication: string;
    date: string;
  }>;
}

interface ResumeEditorProps {
  onDataChange: (data: ResumeData) => void;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ onDataChange }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['contactInfo'])
  );
  const [resumeData, setResumeData] = useState<ResumeData>({
    contactInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
    },
    targetTitle: '',
    professionalSummary: '',
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    awards: [],
    projects: [],
    volunteeringLeadership: [],
    publications: [],
  });

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleContactInfoChange = (field: string, value: string) => {
    const newData = {
      ...resumeData,
      contactInfo: {
        ...resumeData.contactInfo,
        [field]: value,
      },
    };
    setResumeData(newData);
    onDataChange(newData);
  };

  const handleSimpleChange = (field: string, value: string) => {
    const newData = { ...resumeData, [field]: value };
    setResumeData(newData);
    onDataChange(newData);
  };

  const addItem = (
    section: string,
    item: any
  ) => {
    const newData = { ...resumeData };
    (newData[section as keyof ResumeData] as any[]).push(item);
    setResumeData(newData);
    onDataChange(newData);
  };

  const updateItem = (section: string, id: string, field: string, value: any) => {
    const newData = { ...resumeData };
    const items = newData[section as keyof ResumeData] as any[];
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], [field]: value };
      setResumeData(newData);
      onDataChange(newData);
    }
  };

  const removeItem = (section: string, id: string) => {
    const newData = { ...resumeData };
    const items = newData[section as keyof ResumeData] as any[];
    newData[section as keyof ResumeData] = items.filter(
      (item) => item.id !== id
    ) as any;
    setResumeData(newData);
    onDataChange(newData);
  };

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <div
      style={styles.sectionHeader}
      onClick={() => toggleSection(section)}
    >
      <h3 style={styles.sectionTitle}>{title}</h3>
      <div style={styles.headerActions}>
        <button
          style={styles.addButton}
          onClick={(e) => {
            e.stopPropagation();
            // Handle add based on section
          }}
        >
          <span className="material-symbols-outlined" style={styles.addIcon}>
            add
          </span>
        </button>
        <span
          className="material-symbols-outlined"
          style={{
            ...styles.expandIcon,
            transform: expandedSections.has(section) ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          expand_more
        </span>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.editorHeader}>
        <h2 style={styles.editorTitle}>Content Editor</h2>
      </div>

      {/* Contact Information Section */}
      <div style={styles.section}>
        <SectionHeader title="Contact Information" section="contactInfo" />
        {expandedSections.has('contactInfo') && (
          <div style={styles.sectionContent}>
            <input
              type="text"
              placeholder="Full Name"
              value={resumeData.contactInfo.fullName}
              onChange={(e) =>
                handleContactInfoChange('fullName', e.target.value)
              }
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={resumeData.contactInfo.email}
              onChange={(e) =>
                handleContactInfoChange('email', e.target.value)
              }
              style={styles.input}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={resumeData.contactInfo.phone}
              onChange={(e) =>
                handleContactInfoChange('phone', e.target.value)
              }
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Location"
              value={resumeData.contactInfo.location}
              onChange={(e) =>
                handleContactInfoChange('location', e.target.value)
              }
              style={styles.input}
            />
            <input
              type="text"
              placeholder="LinkedIn URL"
              value={resumeData.contactInfo.linkedIn}
              onChange={(e) =>
                handleContactInfoChange('linkedIn', e.target.value)
              }
              style={styles.input}
            />
          </div>
        )}
      </div>

      {/* Target Title Section */}
      <div style={styles.section}>
        <SectionHeader title="Target Title" section="targetTitle" />
        {expandedSections.has('targetTitle') && (
          <div style={styles.sectionContent}>
            <input
              type="text"
              placeholder="e.g., Senior Software Engineer"
              value={resumeData.targetTitle}
              onChange={(e) =>
                handleSimpleChange('targetTitle', e.target.value)
              }
              style={styles.input}
            />
          </div>
        )}
      </div>

      {/* Professional Summary Section */}
      <div style={styles.section}>
        <SectionHeader title="Professional Summary" section="professionalSummary" />
        {expandedSections.has('professionalSummary') && (
          <div style={styles.sectionContent}>
            <textarea
              placeholder="Write a brief professional summary..."
              value={resumeData.professionalSummary}
              onChange={(e) =>
                handleSimpleChange('professionalSummary', e.target.value)
              }
              style={{ ...styles.textarea, minHeight: 100 }}
            />
          </div>
        )}
      </div>

      {/* Work Experience Section */}
      <div style={styles.section}>
        <SectionHeader title="Work Experience" section="workExperience" />
        {expandedSections.has('workExperience') && (
          <div style={styles.sectionContent}>
            {resumeData.workExperience.map((exp) => (
              <div key={exp.id} style={styles.itemBlock}>
                <input
                  type="text"
                  placeholder="Job Title"
                  value={exp.jobTitle}
                  onChange={(e) =>
                    updateItem('workExperience', exp.id, 'jobTitle', e.target.value)
                  }
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) =>
                    updateItem('workExperience', exp.id, 'company', e.target.value)
                  }
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={exp.location}
                  onChange={(e) =>
                    updateItem('workExperience', exp.id, 'location', e.target.value)
                  }
                  style={styles.input}
                />
                <div style={styles.dateRow}>
                  <input
                    type="date"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateItem(
                        'workExperience',
                        exp.id,
                        'startDate',
                        e.target.value
                      )
                    }
                    style={{ ...styles.input, flex: 1 }}
                  />
                  <input
                    type="date"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateItem('workExperience', exp.id, 'endDate', e.target.value)
                    }
                    style={{ ...styles.input, flex: 1 }}
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={exp.description}
                  onChange={(e) =>
                    updateItem(
                      'workExperience',
                      exp.id,
                      'description',
                      e.target.value
                    )
                  }
                  style={{ ...styles.textarea, minHeight: 60 }}
                />
                <button
                  onClick={() => removeItem('workExperience', exp.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                addItem('workExperience', {
                  id: Date.now().toString(),
                  jobTitle: '',
                  company: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  description: '',
                })
              }
              style={styles.addNewButton}
            >
              + Add Experience
            </button>
          </div>
        )}
      </div>

      {/* Education Section */}
      <div style={styles.section}>
        <SectionHeader title="Education" section="education" />
        {expandedSections.has('education') && (
          <div style={styles.sectionContent}>
            {resumeData.education.map((edu) => (
              <div key={edu.id} style={styles.itemBlock}>
                <input
                  type="text"
                  placeholder="School/University"
                  value={edu.school}
                  onChange={(e) =>
                    updateItem('education', edu.id, 'school', e.target.value)
                  }
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) =>
                    updateItem('education', edu.id, 'degree', e.target.value)
                  }
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={edu.fieldOfStudy}
                  onChange={(e) =>
                    updateItem('education', edu.id, 'fieldOfStudy', e.target.value)
                  }
                  style={styles.input}
                />
                <div style={styles.dateRow}>
                  <input
                    type="date"
                    value={edu.startDate}
                    onChange={(e) =>
                      updateItem('education', edu.id, 'startDate', e.target.value)
                    }
                    style={{ ...styles.input, flex: 1 }}
                  />
                  <input
                    type="date"
                    value={edu.endDate}
                    onChange={(e) =>
                      updateItem('education', edu.id, 'endDate', e.target.value)
                    }
                    style={{ ...styles.input, flex: 1 }}
                  />
                </div>
                <button
                  onClick={() => removeItem('education', edu.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                addItem('education', {
                  id: Date.now().toString(),
                  school: '',
                  degree: '',
                  fieldOfStudy: '',
                  startDate: '',
                  endDate: '',
                })
              }
              style={styles.addNewButton}
            >
              + Add Education
            </button>
          </div>
        )}
      </div>

      {/* Skills & Interests Section */}
      <div style={styles.section}>
        <SectionHeader title="Skills & Interests" section="skills" />
        {expandedSections.has('skills') && (
          <div style={styles.sectionContent}>
            <textarea
              placeholder="Enter skills separated by comma (e.g., JavaScript, React, Node.js)"
              value={resumeData.skills.join(', ')}
              onChange={(e) => {
                const newData = {
                  ...resumeData,
                  skills: e.target.value.split(',').map((s) => s.trim()),
                };
                setResumeData(newData);
                onDataChange(newData);
              }}
              style={{ ...styles.textarea, minHeight: 60 }}
            />
          </div>
        )}
      </div>

      {/* Certifications Section */}
      <div style={styles.section}>
        <SectionHeader title="Certifications" section="certifications" />
        {expandedSections.has('certifications') && (
          <div style={styles.sectionContent}>
            {resumeData.certifications.map((cert) => (
              <div key={cert.id} style={styles.itemBlock}>
                <input
                  type="text"
                  placeholder="Certification Name"
                  value={cert.name}
                  onChange={(e) =>
                    updateItem('certifications', cert.id, 'name', e.target.value)
                  }
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Issuer"
                  value={cert.issuer}
                  onChange={(e) =>
                    updateItem('certifications', cert.id, 'issuer', e.target.value)
                  }
                  style={styles.input}
                />
                <input
                  type="date"
                  value={cert.date}
                  onChange={(e) =>
                    updateItem('certifications', cert.id, 'date', e.target.value)
                  }
                  style={styles.input}
                />
                <button
                  onClick={() => removeItem('certifications', cert.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                addItem('certifications', {
                  id: Date.now().toString(),
                  name: '',
                  issuer: '',
                  date: '',
                })
              }
              style={styles.addNewButton}
            >
              + Add Certification
            </button>
          </div>
        )}
      </div>

      {/* Awards & Scholarships Section */}
      <div style={styles.section}>
        <SectionHeader title="Awards & Scholarships" section="awards" />
        {expandedSections.has('awards') && (
          <div style={styles.sectionContent}>
            {resumeData.awards.map((award) => (
              <div key={award.id} style={styles.itemBlock}>
                <input
                  type="text"
                  placeholder="Award Title"
                  value={award.title}
                  onChange={(e) =>
                    updateItem('awards', award.id, 'title', e.target.value)
                  }
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Issuer"
                  value={award.issuer}
                  onChange={(e) =>
                    updateItem('awards', award.id, 'issuer', e.target.value)
                  }
                  style={styles.input}
                />
                <input
                  type="date"
                  value={award.date}
                  onChange={(e) =>
                    updateItem('awards', award.id, 'date', e.target.value)
                  }
                  style={styles.input}
                />
                <button
                  onClick={() => removeItem('awards', award.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                addItem('awards', {
                  id: Date.now().toString(),
                  title: '',
                  issuer: '',
                  date: '',
                })
              }
              style={styles.addNewButton}
            >
              + Add Award
            </button>
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div style={styles.section}>
        <SectionHeader title="Projects" section="projects" />
        {expandedSections.has('projects') && (
          <div style={styles.sectionContent}>
            {resumeData.projects.map((project) => (
              <div key={project.id} style={styles.itemBlock}>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={project.name}
                  onChange={(e) =>
                    updateItem('projects', project.id, 'name', e.target.value)
                  }
                  style={styles.input}
                />
                <textarea
                  placeholder="Project Description"
                  value={project.description}
                  onChange={(e) =>
                    updateItem('projects', project.id, 'description', e.target.value)
                  }
                  style={{ ...styles.textarea, minHeight: 60 }}
                />
                <input
                  type="text"
                  placeholder="Technologies (comma-separated)"
                  value={project.technologies.join(', ')}
                  onChange={(e) =>
                    updateItem(
                      'projects',
                      project.id,
                      'technologies',
                      e.target.value.split(',').map((t) => t.trim())
                    )
                  }
                  style={styles.input}
                />
                <input
                  type="url"
                  placeholder="Project URL"
                  value={project.url}
                  onChange={(e) =>
                    updateItem('projects', project.id, 'url', e.target.value)
                  }
                  style={styles.input}
                />
                <button
                  onClick={() => removeItem('projects', project.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                addItem('projects', {
                  id: Date.now().toString(),
                  name: '',
                  description: '',
                  technologies: [],
                  url: '',
                })
              }
              style={styles.addNewButton}
            >
              + Add Project
            </button>
          </div>
        )}
      </div>

      {/* Volunteering & Leadership Section */}
      <div style={styles.section}>
        <SectionHeader title="Volunteering & Leadership" section="volunteeringLeadership" />
        {expandedSections.has('volunteeringLeadership') && (
          <div style={styles.sectionContent}>
            {resumeData.volunteeringLeadership.map((vol) => (
              <div key={vol.id} style={styles.itemBlock}>
                <input
                  type="text"
                  placeholder="Role"
                  value={vol.role}
                  onChange={(e) =>
                    updateItem(
                      'volunteeringLeadership',
                      vol.id,
                      'role',
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Organization"
                  value={vol.organization}
                  onChange={(e) =>
                    updateItem(
                      'volunteeringLeadership',
                      vol.id,
                      'organization',
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
                <textarea
                  placeholder="Description"
                  value={vol.description}
                  onChange={(e) =>
                    updateItem(
                      'volunteeringLeadership',
                      vol.id,
                      'description',
                      e.target.value
                    )
                  }
                  style={{ ...styles.textarea, minHeight: 60 }}
                />
                <button
                  onClick={() =>
                    removeItem('volunteeringLeadership', vol.id)
                  }
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                addItem('volunteeringLeadership', {
                  id: Date.now().toString(),
                  role: '',
                  organization: '',
                  description: '',
                })
              }
              style={styles.addNewButton}
            >
              + Add Entry
            </button>
          </div>
        )}
      </div>

      {/* Publications Section */}
      <div style={styles.section}>
        <SectionHeader title="Publications" section="publications" />
        {expandedSections.has('publications') && (
          <div style={styles.sectionContent}>
            {resumeData.publications.map((pub) => (
              <div key={pub.id} style={styles.itemBlock}>
                <input
                  type="text"
                  placeholder="Publication Title"
                  value={pub.title}
                  onChange={(e) =>
                    updateItem('publications', pub.id, 'title', e.target.value)
                  }
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Publication Name"
                  value={pub.publication}
                  onChange={(e) =>
                    updateItem(
                      'publications',
                      pub.id,
                      'publication',
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
                <input
                  type="date"
                  value={pub.date}
                  onChange={(e) =>
                    updateItem('publications', pub.id, 'date', e.target.value)
                  }
                  style={styles.input}
                />
                <button
                  onClick={() => removeItem('publications', pub.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                addItem('publications', {
                  id: Date.now().toString(),
                  title: '',
                  publication: '',
                  date: '',
                })
              }
              style={styles.addNewButton}
            >
              + Add Publication
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    overflowY: 'auto' as const,
    maxHeight: 'calc(100vh - 120px)',
  },
  editorHeader: {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  editorTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
    margin: 0,
  },
  section: {
    marginBottom: '0px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    backgroundColor: '#f9f9f9',
    borderBottom: '1px solid #e0e0e0',
    userSelect: 'none' as const,
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  addButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: '18px',
    color: '#114a43',
  },
  expandIcon: {
    fontSize: '20px',
    color: '#666',
  },
  sectionContent: {
    padding: '16px',
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
  },
  dateRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  },
  itemBlock: {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    marginBottom: '12px',
    borderLeft: '3px solid #114a43',
  },
  removeButton: {
    padding: '6px 12px',
    backgroundColor: '#ff6b6b',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    width: '100%',
  },
  addNewButton: {
    padding: '10px 12px',
    backgroundColor: '#114a43',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 500,
  },
};

export default ResumeEditor;
export type { ResumeData };
