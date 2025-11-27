# User Guide

Welcome to Resume Tailor! This guide will help you get the most out of the platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Managing Resumes](#managing-resumes)
3. [Tracking Jobs](#tracking-jobs)
4. [Application Tracking](#application-tracking)
5. [AI Analysis Modules](#ai-analysis-modules)
6. [Settings](#settings)
7. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First-Time Setup

1. **Open the application** at `http://localhost:3000`
2. **Configure AI settings** in Settings > AI Configuration
   - Select your preferred AI provider (Anthropic or OpenAI)
   - Enter your API key
   - Choose your preferred model
3. **Upload your master resume** to get started

### Dashboard Overview

The dashboard provides quick access to:

- **Resume count** - Total resumes you've created
- **Jobs saved** - Job postings you're tracking
- **Applications** - Active job applications
- **Quick actions** - Upload resume, import job, tailor resume

---

## Managing Resumes

### Uploading a Resume

1. Navigate to **Resumes** or click **Upload Resume** on dashboard
2. Click **Upload PDF** button
3. Select your PDF resume file (max 10MB)
4. The system will:
   - Extract text from your PDF
   - Parse sections (experience, education, skills)
   - Create a structured resume

### Creating a Resume Manually

1. Go to **Resumes** > **New Resume**
2. Fill in sections:
   - **Personal Info**: Name, email, phone, location, LinkedIn, website
   - **Summary**: Professional summary (2-3 sentences)
   - **Experience**: Work history with bullet points
   - **Education**: Degrees and certifications
   - **Skills**: Technical and soft skills

### Editing a Resume

1. Click on any resume to view details
2. Click **Edit** to modify content
3. Changes are saved automatically
4. Use the **Preview** to see how it will look

### Setting a Master Resume

Your master resume is your comprehensive base resume containing all experiences and skills.

1. Open the resume you want as master
2. Enable **Set as Master** toggle
3. Tailored resumes will be created from this base

### Exporting to PDF

1. Open the resume you want to export
2. Click **Download PDF**
3. The PDF will be generated with professional formatting

---

## Tracking Jobs

### Adding a Job Manually

1. Navigate to **Jobs** > **Add Job**
2. Fill in job details:
   - **Title**: Job title
   - **Company**: Company name
   - **Location**: Job location
   - **Description**: Full job description
   - **Requirements**: Key requirements
   - **Skills**: Required skills
   - **Salary**: Salary range (optional)
3. Click **Save Job**

### Viewing Job Details

1. Click on any job card to see full details
2. View extracted requirements and skills
3. Check how your resume matches

### Deleting Jobs

1. Hover over a job card
2. Click the **trash icon**
3. Confirm deletion

---

## Application Tracking

### Creating an Application

1. From a job listing, click **Apply**
2. Or go to **Applications** > **New Application**
3. Select the job and optionally attach a resume
4. Set initial status (usually "Saved" or "Applied")

### Application Statuses

Track your applications through these stages:

| Status | Description |
|--------|-------------|
| **Saved** | Interested but not yet applied |
| **Applied** | Application submitted |
| **Interviewing** | In interview process |
| **Offered** | Received job offer |
| **Rejected** | Application declined |

### Updating Application Status

1. Click on an application
2. Use the status dropdown to update
3. Add notes about interviews, feedback, etc.

### Application Notes

Keep track of important information:
- Interview dates and times
- Interviewer names
- Questions asked
- Feedback received
- Next steps

---

## AI Analysis Modules

### Resume Tailoring

Automatically customize your resume for a specific job.

1. Open your master resume
2. Click **Tailor for Job**
3. Select the target job
4. Review the AI-generated changes:
   - Summary adjustments
   - Skill prioritization
   - Bullet point optimization
5. Save or modify the tailored version

**What gets tailored:**
- Professional summary aligned to job
- Skills reordered by relevance
- Bullet points enhanced with keywords
- Experience highlights matching requirements

### Soft Skills Assessment

Discover and articulate your soft skills through AI conversation.

1. Go to **Modules** > **Soft Skills**
2. Select a skill to assess (e.g., Leadership)
3. Answer the AI's questions about your experiences
4. After ~5 questions, receive:
   - Evidence score (1-5)
   - Professional statement for your resume
5. Copy the statement to use in applications

**Available soft skills:**
- Leadership
- Communication
- Problem-Solving
- Teamwork
- Adaptability
- Time Management
- Creativity
- Conflict Resolution

### Company Research

Get AI-powered insights about company culture before interviews.

1. Go to **Modules** > **Company Research**
2. Enter the company name
3. Receive insights on:
   - Culture signals and values
   - Interview tips
   - Benefits and perks
   - Typical hiring process

**Note:** Results are cached for 7 days for faster access.

### Impact Quantification

Transform vague bullet points into measurable achievements.

1. Go to **Modules** > **Impact**
2. Select a resume to analyze
3. Review suggestions for each bullet point:
   - Original text
   - Improved version with metrics
   - Impact score
   - Suggested metrics types

**Examples:**
- "Improved system performance" becomes "Improved system performance by 40%, reducing latency from 500ms to 300ms"
- "Led team project" becomes "Led team of 5 engineers on $2M infrastructure project, delivering 2 weeks ahead of schedule"

### Context Alignment

Analyze how well your resume matches a job description.

1. Go to **Modules** > **Context**
2. Select your resume and target job
3. Review the analysis:
   - **Match Score**: Overall alignment percentage
   - **Aligned Skills**: Skills that match
   - **Missing Skills**: Skills to add or highlight
   - **Keyword Matches**: Important terms found
   - **Recommendations**: Specific improvement suggestions

### Uniqueness Extraction

Identify what makes you stand out from other candidates.

1. Go to **Modules** > **Uniqueness**
2. Select a resume to analyze
3. Discover:
   - **Unique Factors**: What differentiates you
   - **Rare Skills**: Uncommon technical skills
   - **Standout Achievements**: Most impressive accomplishments

---

## Settings

### Appearance

Customize the look and feel:

- **Theme**: Light, Dark, or System (follows OS setting)
- **Reduced Motion**: Minimize animations for accessibility
- **Compact Mode**: Denser UI layout

### AI Configuration

Configure AI behavior:

- **Provider**: Anthropic (Claude) or OpenAI (GPT)
- **API Key**: Your provider API key
- **Model**: Which AI model to use
- **Temperature**: Creativity level (0.0-2.0)
  - Lower (0.3-0.5): More consistent, focused
  - Higher (0.7-1.0): More creative, varied
- **Max Tokens**: Response length limit

**Feature Toggles:**
- Enable/disable specific AI features
- Tailoring, summary generation, skill extraction, etc.

### Resume Preferences

Default settings for resumes:

- **Export Format**: PDF or DOCX
- **Include Contact Info**: Show contact details
- **ATS Optimization**: Format for applicant tracking systems

### Notifications

Control notification preferences:

- **Email Notifications**: General email updates
- **Application Updates**: Status change alerts
- **Weekly Digest**: Weekly summary of activity

---

## Tips & Best Practices

### Resume Tips

1. **Keep your master resume comprehensive**
   - Include all experiences, even older ones
   - List all skills and certifications
   - The AI will select relevant items when tailoring

2. **Use action verbs**
   - Start bullets with: Led, Built, Developed, Achieved
   - Avoid passive voice

3. **Quantify achievements**
   - Include numbers: percentages, dollar amounts, team sizes
   - Use the Impact module to help

4. **Match keywords**
   - Use Context Alignment to find missing keywords
   - Mirror language from job descriptions

### Job Application Tips

1. **Tailor for each application**
   - Never send the same resume twice
   - Use AI tailoring for customization

2. **Research the company**
   - Use Company Research module before interviews
   - Understand culture and values

3. **Track everything**
   - Log all applications
   - Add notes after each interaction
   - Set follow-up reminders

4. **Prepare for soft skill questions**
   - Use Soft Skills module to practice
   - Have specific examples ready

### AI Usage Tips

1. **Review AI suggestions**
   - Don't blindly accept all changes
   - Ensure accuracy and authenticity

2. **Provide good input**
   - More detail = better AI output
   - Answer soft skills questions thoroughly

3. **Iterate and refine**
   - Run modules multiple times
   - Compare different versions

4. **Keep API costs in mind**
   - Each AI call uses API credits
   - Company research is cached to reduce calls

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate between elements |
| `Enter` | Activate buttons/links |
| `Escape` | Close modals/dropdowns |
| `Space` | Toggle checkboxes |

---

## Troubleshooting

### Common Issues

**AI features not working**
- Check that API key is configured in Settings
- Verify API key is valid and has credits
- Check the AI provider status page

**PDF upload fails**
- Ensure file is under 10MB
- File must be a valid PDF
- Try a different PDF if text extraction fails

**Resume not saving**
- Check browser console for errors
- Verify database connection
- Try refreshing the page

**Slow performance**
- Clear browser cache
- Check network connection
- AI operations may take 10-30 seconds

### Getting Help

If you encounter issues:
1. Check this guide for solutions
2. Review the [API documentation](./API.md)
3. Open an issue on GitHub
