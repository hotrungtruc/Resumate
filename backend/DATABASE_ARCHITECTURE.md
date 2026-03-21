# Resume Builder - Database Architecture & Implementation Guide

## 📋 Overview

The Resume Builder system allows users to create, manage, and save multiple CV/Resume documents. Each user has:
- **Master Profile**: A comprehensive repository of all their professional information (experiences, education, skills, etc.)
- **Multiple Resumes**: Individual CV documents created from the master profile or standalone data

## 🗃️ Database Schema

### Collections

#### 1. `users` (Pre-existing)
Stores user account information.

```javascript
{
  _id: ObjectId,
  email: String (unique),
  full_name: String,
  hashed_password: String,
  is_active: Boolean,
  avatar_url: String,
  google_id: String (optional, unique, sparse),
  facebook_id: String (optional, unique, sparse),
  next_career_goal: String,
  target_title: String,
  target_date: String,
  salary_min: Number,
  salary_max: Number,
  currency: String,
  created_at: DateTime
}

// Indexes
- email (unique)
- google_id (unique, sparse)
- facebook_id (unique, sparse)
- created_at
```

#### 2. `master_profiles` (NEW)
Stores comprehensive user profile information - all professional data a user might want to include in any resume.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (unique),  // Reference to users._id
  experiences: [
    {
      title: String,
      company: String,
      location: String,
      start_date: Date,
      end_date: Date,
      description: String,
      technologies: [String]
    }
  ],
  educations: [
    {
      school: String,
      degree: String,
      field_of_study: String,
      start_date: Date,
      end_date: Date,
      gpa: Float
    }
  ],
  skills: [
    {
      name: String,
      level: String,
      keywords: [String]
    }
  ],
  projects: [
    {
      name: String,
      description: String,
      role: String,
      technologies: [String],
      url: String,
      start_date: Date,
      end_date: Date
    }
  ],
  awards: [
    {
      title: String,
      issuer: String,
      date: Date
    }
  ],
  certifications: [
    {
      name: String,
      issuer: String,
      date: Date
    }
  ],
  volunteering_leadership: [
    {
      role: String,
      organization: String,
      description: String
    }
  ],
  publications: [
    {
      title: String,
      publication: String,
      date: Date
    }
  ],
  created_at: DateTime,
  updated_at: DateTime
}

// Indexes
- user_id (unique)
- updated_at
```

#### 3. `resumes` (UPDATED)
Stores individual resume documents with their specific data and metadata.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,  // Reference to users._id
  name: String,  // Resume name (e.g., "Senior Developer CV", "Web Dev Resume")
  data: {
    contact_info: {
      full_name: String,
      email: String,
      phone: String,
      location: String,
      linked_in: String
    },
    target_title: String,
    professional_summary: String,
    work_experience: [...],  // Same structure as master_profiles.experiences
    education: [...],        // Same structure as master_profiles.educations
    skills: [String],        // Array of skill strings
    certifications: [...],   // Same structure as master_profiles.certifications
    awards: [...],          // Same structure as master_profiles.awards
    projects: [...],        // Same structure as master_profiles.projects
    volunteering_leadership: [...],
    publications: [...]
  },
  version: Number,      // Version tracking (default: 1)
  is_active: Boolean,   // Soft delete flag
  created_at: DateTime,
  updated_at: DateTime
}

// Indexes
- user_id
- (user_id, updated_at)  // Composite: for querying user's resumes sorted by date
- (user_id, is_active)   // Composite: for filtering active resumes
- updated_at
```

## 🔗 API Endpoints

### Master Profile Routes (`/master-profile`)

```
GET /master-profile
  Purpose: Get user's master profile
  Auth: Required
  Response: MasterProfile object
  Note: Auto-creates empty profile if doesn't exist

PUT /master-profile
  Purpose: Update master profile
  Auth: Required
  Body: Partial MasterProfile object
  Response: Updated MasterProfile object
```

### Resumes Routes (`/resumes`)

```
GET /resumes
  Purpose: List all user's resumes (sorted by updated_at DESC)
  Auth: Required
  Response: Resume[] array

POST /resumes
  Purpose: Create new resume
  Auth: Required
  Body: { name: String, data?: ResumeData }
  Response: Created Resume object

GET /resumes/{id}
  Purpose: Get specific resume by ID
  Auth: Required
  Response: Resume object

PUT /resumes/{id}
  Purpose: Update resume
  Auth: Required
  Body: { name?: String, data?: ResumeData }
  Response: Updated Resume object

DELETE /resumes/{id}
  Purpose: Delete resume
  Auth: Required
  Response: { message: "Resume deleted successfully" }
```

## 📱 Frontend Integration

### API Service (`src/api/resumeService.ts`)

TypeScript service class with automatic camelCase ↔ snake_case conversion:

```typescript
class ResumeService {
  // Resumes
  getResumes(): Promise<Resume[]>
  getResume(id: string): Promise<Resume>
  createResume(data: ResumeCreate): Promise<Resume>
  updateResume(id: string, data: ResumeUpdate): Promise<Resume>
  deleteResume(id: string): Promise<{ message: string }>
  
  // Master Profile
  getMasterProfile(): Promise<MasterProfile>
  updateMasterProfile(data: Partial<MasterProfile>): Promise<MasterProfile>
}
```

### Components

1. **ResumeEditor** (`src/components/resume/ResumeEditor.tsx`)
   - Expandable sections for data input
   - Real-time state management
   - Add/remove item functionality
   - Exports data in camelCase

2. **ResumePreview** (`src/components/resume/ResumePreview.tsx`)
   - Real-time CV preview
   - Professional PDF-like formatting
   - Responsive layout

3. **ResumeBuilderPage** (`src/pages/ResumeBuilderPage.tsx`)
   - Main page with two modes: View (action cards) & Edit (split screen)
   - Loads recent resumes from API on page load
   - Displays resume list in grid layout
   - Integrated save functionality

## 🔄 Data Flow

### Creating a Resume

1. User clicks "New Resume" on ResumeBuilderPage
2. Editor mode activated with empty ResumeEditor
3. User fills in data → ResumeEditor state updates
4. User clicks "Export PDF" → `handleSaveResume()` called
5. ResumeData (camelCase) converted to snake_case
6. API POST `/resumes` with { name, data }
7. MongoDB stores document with server-generated timestamps
8. Response converted back to camelCase
9. Resume added to `recentResumes` state (optional refresh)

### Updating a Resume

1. User loads resume (from list or direct access)
2. Updates data in ResumeEditor
3. Clicks "Export PDF"
4. API PUT `/resumes/{id}` called
5. MongoDB updates document with new `updated_at`
6. List refreshes with updated timestamp

### Listing Resumes

1. ResumeBuilderPage mounts
2. `loadRecentResumes()` called
3. API GET `/resumes` executed
4. Returns all user's resumes sorted by `updated_at`
5. Displayed in grid layout with:
   - Resume name
   - Formatted edit date
   - "Match a job" button
   - More options menu

## 🔐 Security

- All endpoints require authentication via JWT token
- All `user_id` queries filtered to current user
- MongoDB unique index on `(user_id)` for master_profiles
- Composite indexes optimize user-specific queries
- No cross-user data leakage possible

## ⚡ Performance Optimizations

### Indexes
- `master_profiles.user_id` (unique) - Fast profile lookup
- `resumes.user_id` - Fast resume list queries
- `resumes.(user_id, updated_at)` - Efficient sorted queries
- `resumes.(user_id, is_active)` - Filter active resumes

### Data Transformation
- Frontend converts camelCase → snake_case on outbound
- Backend converts snake_case → camelCase on return
- Transparent to component logic

## 📝 Type Definitions

### TypeScript Interfaces (Frontend)

```typescript
interface ResumeData {
  contactInfo: ContactInfo
  targetTitle?: string
  professionalSummary?: string
  workExperience: Experience[]
  education: Education[]
  skills: string[]
  certifications: Certification[]
  awards: Award[]
  projects: Project[]
  volunteeringLeadership: VolunteeringLeadership[]
  publications: Publication[]
}

interface Resume {
  id: string
  userId: string
  name: string
  data: ResumeData
  version: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

### Pydantic Models (Backend)

```python
class ResumeData(BaseModel):
    contact_info: ResumeContactInfo
    target_title: Optional[str]
    professional_summary: Optional[str]
    work_experience: List[Experience]
    # ... etc

class Resume(BaseModel):
    id: Optional[PyObjectId]
    user_id: PyObjectId
    name: str
    data: ResumeData
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
```

## 🛠️ Setup & Installation

### Backend
1. Models already defined in `app/models/resume.py`
2. Routes created in `app/api/routes/master_profile.py` and `/resumes.py`
3. Indexes created via `app/core/db_indexes.py`
4. Routes registered in `app/main.py`

### Frontend
1. Service created in `src/api/resumeService.ts`
2. Components already created
3. ResumeBuilderPage integrated with API calls
4. Auto camelCase/snake_case conversion handled

### Running
```bash
# Backend
cd backend
python -m uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

## 🧪 Testing the Feature

1. Navigate to `/resume-builder`
2. Click "New Resume"
3. Fill in your information in the editor
4. Watch real-time preview update
5. Click "Export PDF" to save
6. Return to main page to see resume in "Recent Resumes"
7. Click resume card to edit again

## 📚 Future Enhancements

- [ ] PDF generation and download
- [ ] Resume templates selection
- [ ] AI-powered content suggestions
- [ ] Job description matching
- [ ] Skill gap analysis
- [ ] Resume versioning/history
- [ ] Collaborative resumes (share with recruiters)
- [ ] Resume analytics (views, downloads)
