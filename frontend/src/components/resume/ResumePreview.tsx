import React from 'react';
import type { ResumeData } from './ResumeEditor';

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
  };

  const RenderSection = ({
    title,
    items,
    renderItem,
    show,
  }: {
    title: string;
    items: any[];
    renderItem: (item: any) => React.ReactNode;
    show: boolean;
  }) => {
    if (!show || !items || items.length === 0) return null;
    return (
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        {items.map((item, index) => (
          <div key={index} style={styles.sectionItem}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.previewWrapper}>
        {/* Header */}
        {(data.contactInfo.fullName ||
          data.contactInfo.email ||
          data.contactInfo.phone) && (
          <div style={styles.header}>
            {data.contactInfo.fullName && (
              <h1 style={styles.name}>{data.contactInfo.fullName}</h1>
            )}
            {data.targetTitle && (
              <div style={styles.jobTitle}>{data.targetTitle}</div>
            )}
            <div style={styles.contactInfo}>
              {data.contactInfo.email && (
                <>
                  <span style={styles.contactItem}>
                    {data.contactInfo.email}
                  </span>
                  <span style={styles.separator}>•</span>
                </>
              )}
              {data.contactInfo.phone && (
                <>
                  <span style={styles.contactItem}>
                    {data.contactInfo.phone}
                  </span>
                  <span style={styles.separator}>•</span>
                </>
              )}
              {data.contactInfo.location && (
                <span style={styles.contactItem}>{data.contactInfo.location}</span>
              )}
            </div>
            {data.contactInfo.linkedIn && (
              <div style={styles.contactInfo}>
                <a
                  href={data.contactInfo.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        )}

        {/* Professional Summary */}
        {data.professionalSummary && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Professional Summary</h3>
            <p style={styles.summaryText}>{data.professionalSummary}</p>
          </div>
        )}

        {/* Work Experience */}
        <RenderSection
          title="Work Experience"
          items={data.workExperience}
          show={data.workExperience.length > 0}
          renderItem={(exp) => (
            <div>
              <div style={styles.itemHeader}>
                <h4 style={styles.itemTitle}>{exp.jobTitle}</h4>
                {exp.startDate && (
                  <span style={styles.itemDate}>
                    {formatDate(exp.startDate)} -{' '}
                    {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                  </span>
                )}
              </div>
              <div style={styles.itemSubtitle}>{exp.company}</div>
              {exp.location && (
                <div style={styles.itemLocation}>{exp.location}</div>
              )}
              {exp.description && (
                <p style={styles.itemDescription}>{exp.description}</p>
              )}
            </div>
          )}
        />

        {/* Education */}
        <RenderSection
          title="Education"
          items={data.education}
          show={data.education.length > 0}
          renderItem={(edu) => (
            <div>
              <div style={styles.itemHeader}>
                <h4 style={styles.itemTitle}>{edu.school}</h4>
                {edu.startDate && (
                  <span style={styles.itemDate}>
                    {formatDate(edu.startDate)} -{' '}
                    {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                  </span>
                )}
              </div>
              {edu.degree && (
                <div style={styles.itemSubtitle}>
                  {edu.degree}
                  {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                </div>
              )}
            </div>
          )}
        />

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Skills & Interests</h3>
            <div style={styles.skillsContainer}>
              {data.skills.map((skill, index) => (
                <span key={index} style={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        <RenderSection
          title="Certifications"
          items={data.certifications}
          show={data.certifications.length > 0}
          renderItem={(cert) => (
            <div>
              <div style={styles.itemHeader}>
                <h4 style={styles.itemTitle}>{cert.name}</h4>
                {cert.date && <span style={styles.itemDate}>{formatDate(cert.date)}</span>}
              </div>
              {cert.issuer && (
                <div style={styles.itemSubtitle}>{cert.issuer}</div>
              )}
            </div>
          )}
        />

        {/* Awards & Scholarships */}
        <RenderSection
          title="Awards & Scholarships"
          items={data.awards}
          show={data.awards.length > 0}
          renderItem={(award) => (
            <div>
              <div style={styles.itemHeader}>
                <h4 style={styles.itemTitle}>{award.title}</h4>
                {award.date && (
                  <span style={styles.itemDate}>{formatDate(award.date)}</span>
                )}
              </div>
              {award.issuer && (
                <div style={styles.itemSubtitle}>{award.issuer}</div>
              )}
            </div>
          )}
        />

        {/* Projects */}
        <RenderSection
          title="Projects"
          items={data.projects}
          show={data.projects.length > 0}
          renderItem={(project) => (
            <div>
              <div style={styles.itemHeader}>
                <h4 style={styles.itemTitle}>{project.name}</h4>
              </div>
              {project.description && (
                <p style={styles.itemDescription}>{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div style={styles.skillsContainer}>
                  {project.technologies.map((tech: string, idx: number) => (
                    <span key={idx} style={styles.skillTag}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  {project.url}
                </a>
              )}
            </div>
          )}
        />

        {/* Volunteering & Leadership */}
        <RenderSection
          title="Volunteering & Leadership"
          items={data.volunteeringLeadership}
          show={data.volunteeringLeadership.length > 0}
          renderItem={(vol) => (
            <div>
              <div style={styles.itemHeader}>
                <h4 style={styles.itemTitle}>{vol.role}</h4>
              </div>
              {vol.organization && (
                <div style={styles.itemSubtitle}>{vol.organization}</div>
              )}
              {vol.description && (
                <p style={styles.itemDescription}>{vol.description}</p>
              )}
            </div>
          )}
        />

        {/* Publications */}
        <RenderSection
          title="Publications"
          items={data.publications}
          show={data.publications.length > 0}
          renderItem={(pub) => (
            <div>
              <div style={styles.itemHeader}>
                <h4 style={styles.itemTitle}>{pub.title}</h4>
                {pub.date && (
                  <span style={styles.itemDate}>{formatDate(pub.date)}</span>
                )}
              </div>
              {pub.publication && (
                <div style={styles.itemSubtitle}>{pub.publication}</div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 32px',
    overflowY: 'auto' as const,
    maxHeight: 'calc(100vh - 120px)',
    backgroundColor: '#f5f5f5',
  },
  previewWrapper: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '4px',
    maxWidth: '8.5in',
    margin: '0 auto',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '11px',
    lineHeight: 1.6,
    color: '#333',
  },
  header: {
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #114a43',
  },
  name: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#114a43',
    margin: '0 0 4px 0',
  },
  jobTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#555',
    marginBottom: '8px',
  },
  contactInfo: {
    fontSize: '11px',
    color: '#666',
  },
  contactItem: {
    marginRight: '4px',
  },
  separator: {
    marginRight: '6px',
    color: '#999',
  },
  link: {
    color: '#114a43',
    textDecoration: 'none',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#114a43',
    margin: '12px 0 8px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: '1px solid #ddd',
    paddingBottom: '4px',
  },
  sectionItem: {
    marginBottom: '12px',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  itemTitle: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#333',
    margin: 0,
  },
  itemDate: {
    fontSize: '10px',
    color: '#888',
    whiteSpace: 'nowrap' as const,
  },
  itemSubtitle: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#666',
    marginTop: '2px',
  },
  itemLocation: {
    fontSize: '10px',
    color: '#888',
    marginTop: '1px',
  },
  itemDescription: {
    fontSize: '11px',
    color: '#555',
    margin: '6px 0 0 0',
    lineHeight: 1.4,
  },
  summaryText: {
    fontSize: '11px',
    color: '#555',
    margin: 0,
    lineHeight: 1.5,
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  skillTag: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    fontSize: '10px',
    color: '#555',
    border: '1px solid #ddd',
  },
};

export default ResumePreview;
