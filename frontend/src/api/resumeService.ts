import api from './axios';

export interface ContactInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
}

export interface Experience {
  id?: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  id?: string;
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id?: string;
  name: string;
  issuer?: string;
  date?: string;
}

export interface Award {
  id?: string;
  title: string;
  issuer?: string;
  date?: string;
}

export interface Project {
  id?: string;
  name: string;
  description?: string;
  technologies: string[];
  url?: string;
}

export interface VolunteeringLeadership {
  id?: string;
  role: string;
  organization?: string;
  description?: string;
}

export interface Publication {
  id?: string;
  title: string;
  publication?: string;
  date?: string;
}

export interface ResumeData {
  contactInfo: ContactInfo;
  targetTitle?: string;
  professionalSummary?: string;
  workExperience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  awards: Award[];
  projects: Project[];
  volunteeringLeadership: VolunteeringLeadership[];
  publications: Publication[];
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  data: ResumeData;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeCreate {
  name: string;
  data?: ResumeData;
}

export interface ResumeUpdate {
  name?: string;
  data?: ResumeData;
}

/**
 * Get all resumes for the current user
 */
export async function getResumes(): Promise<Resume[]> {
  try {
    const res = await api.get<Resume[]>('/resumes');
    return res.data;
  } catch (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }
}

/**
 * Get a specific resume by ID
 */
export async function getResume(resumeId: string): Promise<Resume> {
  try {
    const res = await api.get<Resume>(`/resumes/${resumeId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching resume ${resumeId}:`, error);
    throw error;
  }
}

/**
 * Create a new resume
 */
export async function createResume(data: ResumeCreate): Promise<Resume> {
  try {
    const res = await api.post<Resume>('/resumes', data);
    return res.data;
  } catch (error) {
    console.error('Error creating resume:', error);
    throw error;
  }
}

/**
 * Update an existing resume
 */
export async function updateResume(resumeId: string, data: ResumeUpdate): Promise<Resume> {
  try {
    const res = await api.put<Resume>(`/resumes/${resumeId}`, data);
    return res.data;
  } catch (error) {
    console.error(`Error updating resume ${resumeId}:`, error);
    throw error;
  }
}

/**
 * Delete a resume (soft delete)
 */
export async function deleteResume(resumeId: string): Promise<{ message: string }> {
  try {
    const res = await api.delete<{ message: string }>(`/resumes/${resumeId}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting resume ${resumeId}:`, error);
    throw error;
  }
}

export interface MasterProfile {
  id: string;
  userId: string;
  experiences: Experience[];
  educations: Education[];
  skills: string[];
  projects: Project[];
  awards: Award[];
  certifications: Certification[];
  volunteeringLeadership: VolunteeringLeadership[];
  publications: Publication[];
  createdAt: string;
  updatedAt: string;
}

class ResumeService {
  // Helper to convert camelCase keys to snake_case
  private toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.toSnakeCase(item));
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((result, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = this.toSnakeCase(obj[key]);
        return result;
      }, {} as any);
    }
    return obj;
  }

  // Helper to convert snake_case keys to camelCase
  private toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.toCamelCase(item));
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_[a-z]/g, letter => letter.substring(1).toUpperCase());
        result[camelKey] = this.toCamelCase(obj[key]);
        return result;
      }, {} as any);
    }
    return obj;
  }

  // Resumes API
  async getResumes(): Promise<Resume[]> {
    const response = await api.get('/resumes');
    return (response.data as any[]).map(resume => this.toCamelCase(resume) as Resume);
  }

  async getResume(resumeId: string): Promise<Resume> {
    const response = await api.get(`/resumes/${resumeId}`);
    return this.toCamelCase(response.data) as Resume;
  }

  async createResume(resumeData: ResumeCreate): Promise<Resume> {
    const snakeCaseData = this.toSnakeCase(resumeData);
    const response = await api.post('/resumes', snakeCaseData);
    return this.toCamelCase(response.data) as Resume;
  }

  async updateResume(resumeId: string, resumeData: ResumeUpdate): Promise<Resume> {
    const snakeCaseData = this.toSnakeCase(resumeData);
    const response = await api.put(`/resumes/${resumeId}`, snakeCaseData);
    return this.toCamelCase(response.data) as Resume;
  }

  async deleteResume(resumeId: string): Promise<{ message: string }> {
    const response = await api.delete(`/resumes/${resumeId}`);
    return response.data;
  }

  // Master Profile API
  async getMasterProfile(): Promise<MasterProfile> {
    const response = await api.get('/master-profile');
    return this.toCamelCase(response.data) as MasterProfile;
  }

  async updateMasterProfile(profileData: Partial<MasterProfile>): Promise<MasterProfile> {
    const snakeCaseData = this.toSnakeCase(profileData);
    const response = await api.put('/master-profile', snakeCaseData);
    return this.toCamelCase(response.data) as MasterProfile;
  }
}

export default new ResumeService();
