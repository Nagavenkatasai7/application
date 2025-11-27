# API Reference

Complete documentation for all Resume Tailor API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints use cookie-based session authentication. The system automatically creates a local user on first request.

## Response Format

All endpoints return JSON responses with a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Resume Endpoints

### List Resumes

```http
GET /api/resumes
```

Returns all resumes for the current user.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Maximum resumes to return |
| `offset` | number | 0 | Number of resumes to skip |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "resume-123",
      "userId": "user-456",
      "name": "Software Engineer Resume",
      "content": { ... },
      "templateId": "modern",
      "isMaster": true,
      "originalFileName": "resume.pdf",
      "fileSize": 102400,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Create Resume

```http
POST /api/resumes
```

Creates a new resume.

**Request Body:**
```json
{
  "name": "My Resume",
  "content": {
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/johndoe",
      "website": "johndoe.dev"
    },
    "summary": "Experienced software engineer...",
    "experience": [
      {
        "company": "Tech Corp",
        "title": "Senior Engineer",
        "location": "San Francisco, CA",
        "startDate": "2020-01",
        "endDate": "present",
        "bullets": [
          "Led team of 5 engineers...",
          "Reduced latency by 40%..."
        ]
      }
    ],
    "education": [...],
    "skills": ["JavaScript", "TypeScript", "React"]
  },
  "templateId": "modern",
  "isMaster": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "resume-789",
    "name": "My Resume",
    ...
  }
}
```

---

### Get Resume

```http
GET /api/resumes/:id
```

Returns a specific resume by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "resume-123",
    "name": "Software Engineer Resume",
    "content": { ... },
    ...
  }
}
```

**Error Codes:**
| Code | Status | Description |
|------|--------|-------------|
| `RESUME_NOT_FOUND` | 404 | Resume with given ID doesn't exist |

---

### Update Resume

```http
PATCH /api/resumes/:id
```

Updates an existing resume.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Resume Name",
  "content": { ... },
  "templateId": "professional",
  "isMaster": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "resume-123",
    "name": "Updated Resume Name",
    ...
  }
}
```

---

### Delete Resume

```http
DELETE /api/resumes/:id
```

Permanently deletes a resume.

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

### Upload Resume PDF

```http
POST /api/resumes/upload
```

Uploads a PDF resume and extracts text content.

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | PDF file (max 10MB) |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "resume-456",
    "name": "Uploaded Resume",
    "originalFileName": "john_doe_resume.pdf",
    "fileSize": 102400,
    "extractedText": "John Doe\nSoftware Engineer...",
    ...
  }
}
```

**Error Codes:**
| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | No file uploaded or invalid file type |
| `FILE_TOO_LARGE` | 400 | File exceeds 10MB limit |
| `PARSE_ERROR` | 400 | Failed to extract text from PDF |

---

### Generate Resume PDF

```http
GET /api/resumes/:id/pdf
```

Generates and downloads the resume as a PDF.

**Response:** Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="resume.pdf"
```

**Error Codes:**
| Code | Status | Description |
|------|--------|-------------|
| `RESUME_NOT_FOUND` | 404 | Resume doesn't exist |
| `INVALID_RESUME` | 400 | Resume content is missing or invalid |
| `GENERATION_ERROR` | 500 | PDF generation failed |

---

### Tailor Resume for Job

```http
POST /api/resumes/:id/tailor
```

Uses AI to tailor a resume for a specific job posting.

**Request Body:**
```json
{
  "jobId": "job-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tailoredResume": {
      "id": "resume-789",
      "name": "Tailored for Software Engineer at Google",
      "content": { ... },
      "parentResumeId": "resume-123",
      "jobId": "job-123"
    },
    "changes": {
      "summary": "Updated to emphasize distributed systems experience",
      "skills": ["Added: Kubernetes", "Prioritized: Go"],
      "bullets": [
        {
          "original": "Built features",
          "updated": "Built 15+ features serving 1M+ users"
        }
      ]
    }
  }
}
```

**Error Codes:**
| Code | Status | Description |
|------|--------|-------------|
| `RESUME_NOT_FOUND` | 404 | Resume doesn't exist |
| `JOB_NOT_FOUND` | 404 | Job doesn't exist |
| `AI_NOT_CONFIGURED` | 500 | AI provider not configured |
| `TAILORING_ERROR` | 500 | AI tailoring failed |

---

## Job Endpoints

### List Jobs

```http
GET /api/jobs
```

Returns all saved jobs.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Maximum jobs to return |
| `offset` | number | 0 | Number of jobs to skip |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job-123",
      "platform": "linkedin",
      "externalId": "3456789",
      "title": "Senior Software Engineer",
      "companyId": "company-456",
      "companyName": "Google",
      "location": "Mountain View, CA",
      "description": "We're looking for...",
      "requirements": ["5+ years experience", "CS degree"],
      "skills": ["Python", "Kubernetes", "GCP"],
      "salary": "$180k - $250k",
      "postedAt": "2024-01-10T00:00:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Create Job

```http
POST /api/jobs
```

Saves a new job posting.

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "companyName": "Google",
  "location": "Mountain View, CA",
  "description": "We're looking for a senior engineer to join...",
  "requirements": ["5+ years experience", "Strong Python skills"],
  "skills": ["Python", "Kubernetes", "GCP"],
  "salary": "$180k - $250k",
  "platform": "linkedin",
  "externalId": "3456789",
  "postedAt": "2024-01-10T00:00:00Z"
}
```

**Response:** `201 Created`

---

### Get Job

```http
GET /api/jobs/:id
```

Returns a specific job by ID.

---

### Delete Job

```http
DELETE /api/jobs/:id
```

Deletes a saved job.

---

## Application Endpoints

### List Applications

```http
GET /api/applications
```

Returns all job applications.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (saved, applied, interviewing, offered, rejected) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app-123",
      "userId": "user-456",
      "jobId": "job-789",
      "resumeId": "resume-012",
      "status": "interviewing",
      "appliedAt": "2024-01-15T10:30:00Z",
      "notes": "Phone screen scheduled for Monday",
      "job": { ... },
      "resume": { ... }
    }
  ]
}
```

---

### Create Application

```http
POST /api/applications
```

Creates a new job application.

**Request Body:**
```json
{
  "jobId": "job-123",
  "resumeId": "resume-456",
  "status": "saved",
  "appliedAt": "2024-01-15T10:30:00Z",
  "notes": "Great opportunity"
}
```

---

### Update Application

```http
PATCH /api/applications/:id
```

Updates application status or details.

**Request Body:**
```json
{
  "status": "interviewing",
  "notes": "Phone screen completed, moving to onsite"
}
```

**Status Values:**
- `saved` - Job saved, not yet applied
- `applied` - Application submitted
- `interviewing` - In interview process
- `offered` - Received offer
- `rejected` - Application rejected

---

### Delete Application

```http
DELETE /api/applications/:id
```

Deletes an application.

---

## User Endpoints

### Get Current User

```http
GET /api/users/me
```

Returns the current user. Creates a new user if one doesn't exist.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update Current User

```http
PATCH /api/users/me
```

Updates the current user's profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

---

### Get User Settings

```http
GET /api/users/settings
```

Returns user settings. Creates default settings if none exist.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "settings-123",
    "userId": "user-456",
    "settings": {
      "appearance": {
        "theme": "dark",
        "reducedMotion": false,
        "compactMode": false
      },
      "ai": {
        "provider": "anthropic",
        "model": "claude-sonnet-4-5-20250929",
        "temperature": 0.7,
        "maxTokens": 4000,
        "enableTailoring": true,
        "enableSummaryGeneration": true,
        "enableSkillExtraction": true,
        "enableBulletOptimization": true
      },
      "resume": {
        "exportFormat": "pdf",
        "includeContactInfo": true,
        "atsOptimization": true
      },
      "notifications": {
        "emailNotifications": true,
        "applicationUpdates": true,
        "weeklyDigest": false
      }
    },
    "createdAt": 1705312200,
    "updatedAt": 1705312200
  }
}
```

---

### Update User Settings

```http
PUT /api/users/settings
```

Updates user settings. Supports partial updates.

**Request Body:**
```json
{
  "appearance": {
    "theme": "light"
  },
  "ai": {
    "temperature": 0.5
  }
}
```

**Error Codes:**
| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid settings values |

---

## AI Module Endpoints

### Company Research

```http
POST /api/modules/company
```

Researches company culture and provides interview insights.

**Request Body:**
```json
{
  "companyName": "Google"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": {
      "companyName": "Google",
      "cultureSignals": [
        "Innovation-focused",
        "Data-driven decision making",
        "Flat hierarchy"
      ],
      "values": ["Innovation", "User focus", "Openness"],
      "interviewTips": [
        "Prepare for behavioral questions using STAR method",
        "Demonstrate problem-solving skills"
      ],
      "benefits": ["Excellent healthcare", "Free meals", "20% time"],
      "hiringProcess": ["Recruiter screen", "Technical phone", "Onsite", "Team matching"]
    },
    "cached": false
  }
}
```

**Note:** Results are cached for 7 days.

**Error Codes:**
| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Company name missing or invalid |
| `AI_NOT_CONFIGURED` | 500 | AI provider not configured |
| `RESEARCH_ERROR` | 500 | AI research failed |

---

### Soft Skills Assessment - Start

```http
POST /api/modules/soft-skills/start
```

Starts an interactive soft skills assessment conversation.

**Request Body:**
```json
{
  "skillName": "leadership"
}
```

**Available Skills:**
- `leadership`
- `communication`
- `problem-solving`
- `teamwork`
- `adaptability`
- `time-management`
- `creativity`
- `conflict-resolution`

**Response:**
```json
{
  "success": true,
  "data": {
    "skillId": "skill-123",
    "message": "Let's explore your leadership experience. Can you tell me about a time when you led a team through a challenging project?",
    "questionNumber": 1
  }
}
```

---

### Soft Skills Assessment - Chat

```http
POST /api/modules/soft-skills/chat
```

Continues the soft skills assessment conversation.

**Request Body:**
```json
{
  "skillId": "skill-123",
  "message": "I led a team of 5 engineers to deliver a critical project..."
}
```

**Response (In Progress):**
```json
{
  "success": true,
  "data": {
    "message": "That's a great example. What specific challenges did you face, and how did you help your team overcome them?",
    "isComplete": false,
    "questionNumber": 2
  }
}
```

**Response (Complete):**
```json
{
  "success": true,
  "data": {
    "message": "Thank you for sharing. Based on our conversation, here's your leadership statement.",
    "isComplete": true,
    "questionNumber": 5,
    "evidenceScore": 4,
    "statement": "Led cross-functional team of 5 engineers through 6-month critical infrastructure project, navigating resource constraints and shifting requirements while maintaining team morale and delivering 2 weeks ahead of schedule."
  }
}
```

---

### Impact Quantification

```http
POST /api/modules/impact
```

Analyzes resume bullets and suggests quantified improvements.

**Request Body:**
```json
{
  "resumeId": "resume-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "original": "Improved system performance",
        "improved": "Improved system performance by 40%, reducing average response time from 500ms to 300ms",
        "impactScore": 8,
        "metrics": ["percentage", "time"]
      },
      {
        "original": "Led team on important project",
        "improved": "Led team of 5 engineers on $2M infrastructure project, delivering 2 weeks ahead of schedule",
        "impactScore": 9,
        "metrics": ["team size", "budget", "time"]
      }
    ],
    "overallScore": 6.5,
    "improvementPotential": 35
  }
}
```

**Error Codes:**
| Code | Status | Description |
|------|--------|-------------|
| `RESUME_NOT_FOUND` | 404 | Resume doesn't exist |
| `INVALID_RESUME` | 400 | Resume has no experience bullets |
| `AI_NOT_CONFIGURED` | 500 | AI provider not configured |

---

### Context Alignment

```http
POST /api/modules/context
```

Analyzes alignment between resume and job description.

**Request Body:**
```json
{
  "resumeId": "resume-123",
  "jobId": "job-456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matchScore": 78,
    "alignedSkills": [
      { "skill": "Python", "strength": "strong" },
      { "skill": "Kubernetes", "strength": "moderate" }
    ],
    "missingSkills": [
      { "skill": "Terraform", "importance": "high" },
      { "skill": "Go", "importance": "medium" }
    ],
    "recommendations": [
      "Highlight your Python experience more prominently",
      "Consider adding any infrastructure-as-code experience"
    ],
    "keywordMatches": {
      "matched": ["distributed systems", "microservices", "CI/CD"],
      "missing": ["observability", "SRE"]
    }
  }
}
```

---

### Uniqueness Extraction

```http
POST /api/modules/uniqueness
```

Identifies unique differentiators in the resume.

**Request Body:**
```json
{
  "resumeId": "resume-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uniqueFactors": [
      {
        "factor": "Patent holder in distributed computing",
        "rarity": "very rare",
        "impact": "high"
      },
      {
        "factor": "Experience with Fortune 10 scale systems",
        "rarity": "rare",
        "impact": "high"
      }
    ],
    "rareSkills": [
      { "skill": "Quantum computing", "percentile": 99 },
      { "skill": "FPGA programming", "percentile": 95 }
    ],
    "standoutAchievements": [
      "Scaled system to handle 1B+ daily requests",
      "Reduced infrastructure costs by $5M annually"
    ]
  }
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `AUTH_ERROR` | 401 | Authentication failed |
| `NOT_FOUND` | 404 | Resource not found |
| `RESUME_NOT_FOUND` | 404 | Resume doesn't exist |
| `JOB_NOT_FOUND` | 404 | Job doesn't exist |
| `AI_NOT_CONFIGURED` | 500 | AI provider not configured |
| `GENERATION_ERROR` | 500 | PDF generation failed |
| `TAILORING_ERROR` | 500 | AI tailoring failed |
| `RESEARCH_ERROR` | 500 | AI research failed |
| `FETCH_ERROR` | 500 | Database fetch failed |
| `UPDATE_ERROR` | 500 | Database update failed |
| `CREATE_ERROR` | 500 | Database insert failed |
