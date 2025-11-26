# Resume Tailoring Application - Master Plan

## The Microsoft Recruiter's 5 Insights (Our Core Principles)

Every feature we build MUST address one or more of these insights:

| # | Recruiter Insight | What It Means | Our Solution |
|---|-------------------|---------------|--------------|
| 1 | **"Resumes look identical"** | Same templates, same buzzwords, same projects | **Uniqueness Engine** - Extract & highlight what makes each candidate different |
| 2 | **"You list duties, not impact"** | "Worked on ML model" vs "Built ML model reducing latency 40%" | **Impact Transformer** - Convert every bullet to Action + Result + Scale |
| 3 | **"Experience doesn't translate"** | Unknown companies without context | **Context Translator** - Add scale/context for non-US companies |
| 4 | **"Not showing cultural fit"** | Only technical skills, no soft skills | **Soft Skill Extractor** - Surface collaboration, communication evidence |
| 5 | **"Desperate, not strategic"** | Generic mass applications | **Company Customizer** - Tailor each resume to specific company/role |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
│                         (Next.js 15 + React 19)                             │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Upload    │  │   Paste     │  │   Enter     │  │  Uniqueness │        │
│  │   Resume    │  │   Job Desc  │  │   Company   │  │  Questions  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    Real-time Preview & Editor                    │       │
│  └─────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTOMATION LAYER                                   │
│                    (No AI - Fast, Deterministic, Free)                      │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  PDF Parser     │  │  JD Keyword     │  │  ATS Score      │             │
│  │  (PyMuPDF)      │  │  Extractor      │  │  Calculator     │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Section        │  │  Date/Format    │  │  One-Page       │             │
│  │  Detector       │  │  Standardizer   │  │  Fitter         │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI LAYER                                        │
│            (Strategic Use - Claude API with Structured Outputs)             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  INSIGHT #1: UNIQUENESS ENGINE                                         │ │
│  │  - Analyze resume to find standout elements                           │ │
│  │  - Identify unusual skill combinations                                │ │
│  │  - Generate personalized summary (not generic)                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  INSIGHT #2: IMPACT TRANSFORMER                                        │ │
│  │  - Detect duty-only bullets                                           │ │
│  │  - Transform: "Managed database" →                                    │ │
│  │    "Optimized PostgreSQL queries, reducing response time 60%"         │ │
│  │  - Infer/estimate metrics when missing                                │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  INSIGHT #3: CONTEXT TRANSLATOR                                        │ │
│  │  - Detect non-US/unknown companies                                    │ │
│  │  - Add parenthetical context: "Flipkart (India's Amazon, 200M users)" │ │
│  │  - Map foreign job titles to US equivalents                           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  INSIGHT #4: SOFT SKILL EXTRACTOR                                      │ │
│  │  - Parse descriptions for collaboration indicators                    │ │
│  │  - Surface leadership, teamwork, communication evidence               │ │
│  │  - Generate "soft skills" section or weave into summary               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  INSIGHT #5: COMPANY CUSTOMIZER                                        │ │
│  │  - Research company (products, values, culture, recent news)          │ │
│  │  - Inject relevant references into summary                            │ │
│  │  - Reorder experiences by relevance to THIS role                      │ │
│  │  - Mirror company's language/tone                                     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RENDERING LAYER                                    │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Template       │  │  Content        │  │  PDF Generator  │             │
│  │  Engine         │  │  Assembler      │  │  (Puppeteer)    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack (2025 Latest)

### Frontend
| Component | Technology | Why |
|-----------|------------|-----|
| Framework | **Next.js 15** (App Router) | Industry standard, 52.9% adoption among React devs, best DX |
| React | **React 19** | Latest with Server Components, concurrent features |
| Styling | **Tailwind CSS 4** | Utility-first, fast development, consistent design |
| UI Components | **shadcn/ui** | Modern, accessible, customizable components |
| State Management | **Zustand** | Lightweight, simple, no boilerplate |
| Forms | **React Hook Form + Zod** | Type-safe validation, great performance |

### Backend
| Component | Technology | Why |
|-----------|------------|-----|
| API Routes | **Next.js API Routes** (Edge + Node) | Seamless integration, serverless |
| Database | **Supabase (PostgreSQL)** | Modern BaaS, real-time, auth included, generous free tier |
| File Storage | **Supabase Storage** | Integrated with DB, handles resume PDFs |
| Authentication | **Clerk** | 30-min setup, pre-built components, 10K free MAU |
| Caching | **Upstash Redis** | Serverless Redis, cache company data & embeddings |

### PDF Processing
| Component | Technology | Why |
|-----------|------------|-----|
| PDF Parsing | **PyMuPDF (pymupdf4llm)** | Best balance of speed (0.12s) and quality |
| Fallback Parser | **Unstructured.io** | Handles complex layouts, RAG-optimized |
| PDF Generation | **Puppeteer** | Chrome-based, pixel-perfect HTML→PDF |
| Templates | **React + Tailwind** | Design in React, render with Puppeteer |

### NLP & Matching
| Component | Technology | Why |
|-----------|------------|-----|
| NER | **spaCy 3.8 + Transformers** | State-of-the-art, resume-specific models available |
| Embeddings | **all-MiniLM-L6-v2** | Fast, 384-dim vectors, great for similarity |
| Similarity | **Cosine Similarity** | Standard for resume-JD matching |
| Keyword Extraction | **TF-IDF + Custom Rules** | Proven technique for JD parsing |

### AI Integration
| Component | Technology | Why |
|-----------|------------|-----|
| LLM | **Claude Sonnet 4.5** | Best reasoning, structured outputs support |
| Structured Output | **Anthropic Structured Outputs** (Beta) | Guaranteed JSON schema compliance |
| Schema Validation | **Zod** | TypeScript-first, works with Anthropic SDK |

### Deployment
| Component | Technology | Why |
|-----------|------------|-----|
| Hosting | **Vercel** | Native Next.js support, edge functions, great DX |
| Python Services | **Modal** or **Railway** | Serverless Python for NLP tasks |
| Monitoring | **Vercel Analytics + Sentry** | Performance & error tracking |

---

## Data Schema

### Resume Schema (Parsed)
```typescript
interface ParsedResume {
  contact: {
    name: string;
    email: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    location?: string;
  };

  summary?: string;

  experiences: Array<{
    id: string;
    company: string;
    companyContext?: string; // Added by Context Translator
    title: string;
    location?: string;
    startDate: string;
    endDate?: string; // null = "Present"
    bullets: Array<{
      id: string;
      original: string;
      transformed?: string; // After Impact Transformer
      hasMetrics: boolean;
      relevanceScore?: number; // 0-100, for JD matching
    }>;
  }>;

  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
    relevantCoursework?: string[];
  }>;

  skills: {
    technical: string[];
    soft: string[]; // Extracted by Soft Skill Extractor
    languages?: string[];
    certifications?: string[];
  };

  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    impact?: string;
    link?: string;
  }>;
}
```

### Job Description Schema (Parsed)
```typescript
interface ParsedJobDescription {
  title: string;
  company: string;

  requirements: {
    mustHave: string[]; // Required skills/experience
    niceToHave: string[]; // Preferred qualifications
    yearsExperience?: number;
  };

  keywords: {
    technical: string[];
    soft: string[];
    tools: string[];
    domain: string[];
  };

  responsibilities: string[];

  culture: {
    values: string[]; // Extracted company values
    tone: 'formal' | 'casual' | 'startup' | 'corporate';
  };
}
```

### Company Profile Schema
```typescript
interface CompanyProfile {
  name: string;
  description: string;
  industry: string;
  size: string; // "Startup", "Mid-size", "Enterprise"

  products: string[]; // Key products/services
  values: string[]; // Company values from website
  culture: string; // Culture description
  recentNews?: string[]; // Recent announcements

  competitors?: string[]; // For context

  tone: 'formal' | 'casual' | 'startup' | 'corporate';
}
```

---

## Feature Modules (Mapped to Recruiter Insights)

### Module 1: Uniqueness Engine (Insight #1)

**Problem**: "Nothing tells me who YOU are"

**Solution**:

1. **User Questionnaire** (Automation)
   ```
   - "What's the most impressive project you've worked on?"
   - "What makes you different from other candidates?"
   - "Why specifically this company?"
   - "What's an unconventional skill or experience you have?"
   ```

2. **Standout Detector** (AI)
   - Analyze resume for unusual patterns:
     - Rare skill combinations (e.g., "ML + Finance")
     - Impressive scale (e.g., "10M users")
     - Unique trajectory (e.g., "Career switch from X to Y")
     - Recognition (awards, publications, patents)

3. **Personalized Summary Generator** (AI)
   - Input: User answers + detected standouts + JD requirements
   - Output: 2-3 sentence summary that:
     - Opens with what makes them unique
     - Connects their background to this specific role
     - Uses confident, specific language (not generic)

**Example Transformation**:
```
BEFORE (Generic):
"Experienced software engineer seeking challenging opportunities
to leverage my skills in a dynamic environment."

AFTER (Unique):
"Full-stack engineer who built real-time trading systems at India's
largest brokerage (5M daily transactions), now bringing distributed
systems expertise to Microsoft's Azure team—where I've been a power
user for 3 years."
```

---

### Module 2: Impact Transformer (Insight #2)

**Problem**: "You list duties, not impact"

**Solution**:

1. **Duty Detector** (Automation)
   - Pattern matching for weak bullets:
     - Starts with "Responsible for..."
     - Contains "Worked on...", "Helped with...", "Assisted in..."
     - No numbers or metrics
     - No outcome/result mentioned

2. **Metric Inference Engine** (AI)
   - For bullets without metrics, AI suggests reasonable estimates
   - Prompts user to confirm/adjust numbers
   - Categories:
     - **Scale**: Users, transactions, records, requests
     - **Speed**: Time saved, latency reduced, faster delivery
     - **Money**: Revenue generated, costs saved
     - **Quality**: Error reduction, accuracy improvement
     - **Scope**: Team size, project complexity

3. **Bullet Transformer** (AI)
   - Formula: `[Strong Action Verb] + [What] + [Quantified Result] + [Context]`

**Transformation Pipeline**:
```
Input:  "Worked on machine learning model for recommendations"

Step 1 - Detect: No metrics, passive voice, no outcome
Step 2 - Probe: What type? What scale? What improvement?
Step 3 - Transform:

Output: "Engineered recommendation ML model that increased
        user engagement 32% across 500K daily active users"
```

**Action Verb Bank** (by impact type):
```
Building:    Architected, Engineered, Developed, Created, Designed
Improving:   Optimized, Enhanced, Streamlined, Accelerated, Reduced
Leading:     Spearheaded, Led, Directed, Orchestrated, Drove
Delivering:  Shipped, Launched, Deployed, Released, Delivered
```

---

### Module 3: Context Translator (Insight #3)

**Problem**: "Help me understand the scale and impact"

**Solution**:

1. **Unknown Company Detector** (Automation + AI)
   - Maintain database of well-known companies (Fortune 500, FAANG, etc.)
   - Flag companies not in database
   - Use AI to research unknown companies

2. **Context Generator** (AI)
   - For each unknown company, generate:
     - US-equivalent comparison (e.g., "India's Amazon")
     - Scale indicators (users, revenue, employees)
     - Industry context

3. **Title Normalizer** (Automation + AI)
   - Map non-US titles to US equivalents:
     - "Associate Software Engineer" → "Software Engineer I"
     - "Senior Analyst" → "Senior Software Engineer" (if applicable)

**Example**:
```
BEFORE:
"Software Engineer at Flipkart"

AFTER:
"Software Engineer at Flipkart (India's largest e-commerce platform,
200M+ users, Walmart-owned)"

BEFORE:
"Backend Developer at Zerodha"

AFTER:
"Backend Developer at Zerodha (India's #1 stock broker,
10M+ active traders, processes $15B+ daily transactions)"
```

---

### Module 4: Soft Skill Extractor (Insight #4)

**Problem**: "I'm also looking for: Can they communicate? Do they collaborate?"

**Solution**:

1. **Collaboration Indicator Detector** (Automation)
   - Pattern matching for team-related phrases:
     - "Led team of X"
     - "Collaborated with..."
     - "Cross-functional..."
     - "Mentored..."
     - "Presented to..."

2. **Soft Skill Inference** (AI)
   - Analyze experiences to infer soft skills
   - Categories:
     - **Leadership**: Led, managed, mentored, directed
     - **Communication**: Presented, documented, explained, trained
     - **Collaboration**: Cross-functional, partnered, coordinated
     - **Problem-solving**: Debugged, resolved, optimized, troubleshot
     - **Initiative**: Proposed, initiated, pioneered, introduced

3. **Soft Skill Integration** (AI)
   - Either:
     - Add "Leadership & Communication" section
     - Weave into summary
     - Enhance existing bullets to highlight soft skills

**Example**:
```
DETECTED INDICATORS:
- "Led team of 5 engineers" → Leadership
- "Presented weekly demos to stakeholders" → Communication
- "Collaborated with product and design" → Cross-functional

OUTPUT (Summary addition):
"...known for bridging technical and business teams, having
presented to C-suite stakeholders and mentored 5 junior engineers."
```

---

### Module 5: Company Customizer (Insight #5)

**Problem**: "They mentioned our products, referenced our values, showed they actually cared"

**Solution**:

1. **Company Research Engine** (Automation + AI)
   - Sources:
     - Company website (About, Values, Products pages)
     - Recent press releases
     - Glassdoor reviews (culture insights)
     - LinkedIn company page
   - Extract:
     - Key products/services
     - Stated values
     - Culture indicators
     - Recent news/launches

2. **Language Mirroring** (AI)
   - Analyze tone of JD and company materials
   - Adjust resume language to match:
     - Startup: "shipped fast", "wore many hats", "scrappy"
     - Enterprise: "scaled systems", "cross-org collaboration"

3. **Strategic Ordering** (Automation + AI)
   - Reorder experiences by relevance to THIS role
   - Most relevant experience first (even if not most recent)
   - Relevant projects promoted, irrelevant demoted

4. **Company Reference Injection** (AI)
   - Add specific references in summary:
     - "Excited to bring my Azure expertise to [Company]'s cloud team"
     - "Drawn to [Company]'s commitment to [value]"
     - "Experienced with [Company's product] as a power user"

**Example**:
```
Target: Microsoft Azure Team

COMPANY RESEARCH:
- Products: Azure, VS Code, GitHub
- Values: "Growth mindset", "Customer-obsessed", "Diverse & inclusive"
- Recent: Azure AI announcements

CUSTOMIZED SUMMARY:
"Cloud infrastructure engineer who's been building on Azure since 2020,
contributing to open-source projects integrated with GitHub Actions.
Brings a growth mindset to distributed systems challenges, having
scaled services from 10K to 10M users."

(Notice: "Azure", "GitHub", "growth mindset" - all company-specific)
```

---

## One-Page Fitting Algorithm

### Priority Scoring Formula
```
Score = (Relevance × 0.4) + (Recency × 0.3) + (Impact × 0.2) + (Uniqueness × 0.1)

Where:
- Relevance: Keyword match with JD (0-100)
- Recency: Years since experience (100 - years×10)
- Impact: Has metrics/quantification (0 or 50) + metric magnitude bonus
- Uniqueness: Flagged as standout by Uniqueness Engine (0 or 50)
```

### Content Selection Rules
```
1. ALWAYS INCLUDE:
   - Contact info (minimal: name, email, LinkedIn)
   - Top 2-3 experiences (by priority score)
   - Skills section (matched to JD)
   - Education (if recent grad, 1 entry max)

2. CONDITIONALLY INCLUDE:
   - Summary (if meaningfully customized)
   - Projects (if relevant to JD and space permits)
   - Certifications (if JD mentions them)

3. SPACE ALLOCATION:
   - Experience: 60% of page
   - Skills: 15% of page
   - Education: 10% of page
   - Summary: 10% of page
   - Contact: 5% of page

4. TRUNCATION RULES:
   - Max 3-4 bullets per recent role
   - Max 2 bullets for older roles
   - Single line for roles >5 years old
   - Remove irrelevant projects entirely
```

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: UPLOAD & INPUT                                          │
│                                                                 │
│ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│ │  Upload Resume  │  │  Paste Job      │  │  Company Name   │  │
│ │  (PDF/DOCX)     │  │  Description    │  │  (Auto-fetch)   │  │
│ └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: UNIQUENESS QUESTIONS                                    │
│                                                                 │
│ "What's your most impressive project?"                         │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │                                                         │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ "What makes you different from other candidates?"              │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │                                                         │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ "Why this specific company/role?"                              │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │                                                         │    │
│ └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: ANALYSIS DASHBOARD                                      │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │  ATS Match Score: 78%  ████████████████████░░░░░░       │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│ │ Missing      │  │ Weak Bullets │  │ Unknown      │          │
│ │ Keywords: 5  │  │ Found: 8     │  │ Companies: 2 │          │
│ └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│ Company Research: Microsoft Azure                              │
│ - Values: Growth mindset, Customer-obsessed                    │
│ - Products: Azure, GitHub, VS Code                             │
│ - Culture: Innovation-driven, Collaborative                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: TRANSFORMATION REVIEW                                   │
│                                                                 │
│ BULLET TRANSFORMATIONS                               [Accept All]│
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ BEFORE: "Worked on backend services"                    │    │
│ │ AFTER:  "Architected microservices handling 50K RPS,   │    │
│ │          reducing latency 40%"                          │    │
│ │                                    [Accept] [Edit] [Skip]│    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ BEFORE: "Managed team projects"                         │    │
│ │ AFTER:  "Led cross-functional team of 6 engineers,     │    │
│ │          delivering $2M feature on schedule"           │    │
│ │                                    [Accept] [Edit] [Skip]│    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ COMPANY CONTEXT                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Razorpay → "Razorpay (India's leading payment gateway, │    │
│ │             processes $60B annually)"                   │    │
│ │                                    [Accept] [Edit] [Skip]│    │
│ └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: LIVE PREVIEW                                            │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │                                                         │    │
│ │  ┌─────────────────────────────────────────────────┐   │    │
│ │  │              [Resume Preview]                    │   │    │
│ │  │                                                 │   │    │
│ │  │  JOHN DOE                                       │   │    │
│ │  │  john@email.com | linkedin.com/in/john          │   │    │
│ │  │                                                 │   │    │
│ │  │  Cloud infrastructure engineer who's been...    │   │    │
│ │  │                                                 │   │    │
│ │  │  EXPERIENCE                                     │   │    │
│ │  │  ...                                            │   │    │
│ │  │                                                 │   │    │
│ │  └─────────────────────────────────────────────────┘   │    │
│ │                                                         │    │
│ │  Page: 1 of 1    [Edit] [Change Template] [Download]   │    │
│ └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (Next.js 15, Tailwind, shadcn/ui)
- [ ] Database schema (Supabase)
- [ ] Authentication (Clerk)
- [ ] File upload (resume PDF)
- [ ] Basic UI layout

### Phase 2: Automation Layer (Week 3-4)
- [ ] PDF parsing service (PyMuPDF)
- [ ] Resume → Structured JSON extraction
- [ ] Job description parser
- [ ] Keyword extraction (TF-IDF)
- [ ] ATS score calculator
- [ ] Basic matching algorithm

### Phase 3: AI Integration (Week 5-6)
- [ ] Claude API integration with structured outputs
- [ ] Impact Transformer module
- [ ] Context Translator module
- [ ] Uniqueness Engine module
- [ ] Soft Skill Extractor module

### Phase 4: Company Customization (Week 7-8)
- [ ] Company research engine
- [ ] Company profile scraping/API
- [ ] Language mirroring
- [ ] Strategic content ordering
- [ ] Company reference injection

### Phase 5: Rendering & Polish (Week 9-10)
- [ ] Resume templates (3-4 ATS-friendly designs)
- [ ] One-page fitting algorithm
- [ ] PDF generation (Puppeteer)
- [ ] Live preview editor
- [ ] Transformation review UI

### Phase 6: Testing & Launch (Week 11-12)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] User testing with real resumes
- [ ] Bug fixes
- [ ] Production deployment

---

## API Endpoints

```typescript
// Resume Processing
POST   /api/resume/upload          // Upload resume PDF
GET    /api/resume/:id             // Get parsed resume
PUT    /api/resume/:id             // Update resume data

// Job Description
POST   /api/job/parse              // Parse job description
GET    /api/job/:id                // Get parsed JD

// Company Research
GET    /api/company/:name          // Get company profile
POST   /api/company/research       // Trigger company research

// AI Transformations
POST   /api/transform/bullets      // Transform bullets (Impact Transformer)
POST   /api/transform/context      // Add company context
POST   /api/transform/summary      // Generate personalized summary
POST   /api/transform/soft-skills  // Extract soft skills

// Matching & Scoring
POST   /api/match/score            // Calculate ATS match score
POST   /api/match/keywords         // Get missing keywords

// Generation
POST   /api/generate/pdf           // Generate final PDF
GET    /api/templates              // Get available templates
```

---

## Cost Estimation

| Service | Free Tier | Estimated Monthly (1K users) |
|---------|-----------|------------------------------|
| Vercel | 100GB bandwidth | $20/mo (Pro) |
| Supabase | 500MB DB, 1GB storage | $25/mo |
| Clerk | 10K MAU | $0 (free tier) |
| Claude API | - | ~$50-100/mo (est. 500K tokens) |
| Upstash Redis | 10K commands/day | $0 (free tier) |
| Modal (Python) | $30 free credits | ~$20/mo |

**Total Estimated: ~$115-165/month** at 1K users

---

## Success Metrics (Aligned with Recruiter Insights)

| Metric | Target | Measures |
|--------|--------|----------|
| **Uniqueness Score** | 80%+ summaries rated "unique" | Insight #1 |
| **Impact Conversion** | 90%+ bullets have metrics after transform | Insight #2 |
| **Context Coverage** | 100% unknown companies get context | Insight #3 |
| **Soft Skill Extraction** | 3+ soft skills surfaced per resume | Insight #4 |
| **Customization Rate** | 100% resumes have company-specific elements | Insight #5 |
| **ATS Score Improvement** | Average 25%+ improvement | Overall |
| **One-Page Fit** | 100% resumes fit one page | Constraint |

---

## Sources & References

### PDF Parsing
- [PyMuPDF Benchmarks 2025](https://onlyoneaman.medium.com/i-tested-7-python-pdf-extractors-so-you-dont-have-to-2025-edition-c88013922257)
- [Unstructured.io](https://blog.futuresmart.ai/popular-pdf-parsing-tools-for-efficient-document-extraction)

### NLP & Matching
- [spaCy 3.8 Transformers](https://spacy.io/)
- [Resume2Vec Research](https://www.mdpi.com/2079-9292/14/4/794)
- [Smart-Hiring Pipeline](https://arxiv.org/html/2511.02537)

### AI Integration
- [Claude Structured Outputs](https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs)
- [Anthropic Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Frontend
- [Next.js 15 Docs](https://nextjs.org/)
- [Complete Auth Guide for Next.js 2025](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router)

### Resume Best Practices
- [MIT ATS Guidelines](https://capd.mit.edu/resources/make-your-resume-ats-friendly/)
- [Teal Resume Tailoring](https://www.tealhq.com/post/how-to-tailor-your-resume-to-a-job)
- [Indeed Quantification Guide](https://www.indeed.com/career-advice/resumes-cover-letters/how-to-quantify-resume)
