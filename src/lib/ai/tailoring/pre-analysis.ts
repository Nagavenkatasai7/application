/**
 * Pre-Analysis Pipeline
 *
 * Orchestrates parallel execution of all analysis modules to gather
 * structured data before applying transformation rules.
 *
 * This is the first step in the hybrid tailoring pipeline:
 * Resume + Job → Pre-Analysis → Rule Engine → Guided AI Rewriting
 */

import { analyzeImpact } from "../impact";
import { analyzeUniqueness } from "../uniqueness";
import { analyzeContext, type JobData as ContextJobData } from "../context";
import type { ResumeContent } from "@/lib/validations/resume";
import type { ImpactResult } from "@/lib/validations/impact";
import type { UniquenessResult } from "@/lib/validations/uniqueness";
import type { ContextResult } from "@/lib/validations/context";
import type {
  PreAnalysisResult,
  CompanyResearchResult,
  SoftSkillAssessment,
  JobData,
} from "./types";

// =============================================================================
// COMPANY RESEARCH
// =============================================================================

/**
 * Well-known companies that don't need context explanation
 */
const WELL_KNOWN_COMPANIES = new Set([
  // Tech Giants
  "google", "apple", "microsoft", "amazon", "meta", "facebook", "netflix",
  "tesla", "nvidia", "intel", "ibm", "oracle", "salesforce", "adobe",
  "uber", "lyft", "airbnb", "spotify", "twitter", "x", "linkedin", "github",
  "stripe", "square", "paypal", "shopify", "twilio", "atlassian", "zoom",
  "slack", "dropbox", "snap", "pinterest", "reddit", "discord",

  // Finance
  "goldman sachs", "morgan stanley", "jp morgan", "jpmorgan", "citibank",
  "bank of america", "wells fargo", "blackrock", "fidelity", "vanguard",

  // Consulting
  "mckinsey", "bain", "bcg", "boston consulting", "deloitte", "accenture",
  "pwc", "kpmg", "ey", "ernst & young",

  // Other Major Corps
  "walmart", "target", "costco", "nike", "coca-cola", "pepsi",
  "procter & gamble", "johnson & johnson", "pfizer", "moderna",
]);

/**
 * Research a company to provide U.S. context
 * This is a lightweight analysis that doesn't require AI calls
 */
export function researchCompany(companyName: string): CompanyResearchResult {
  const normalizedName = companyName.toLowerCase().trim();

  // Check if well-known
  const isWellKnown = WELL_KNOWN_COMPANIES.has(normalizedName);

  if (isWellKnown) {
    return {
      companyName,
      isWellKnown: true,
      industry: null,
      size: "enterprise",
      fundingStage: null,
      comparable: null,
      context: "", // No context needed
    };
  }

  // For unknown companies, we'll generate a placeholder context
  // In a full implementation, this could call an API or database
  return {
    companyName,
    isWellKnown: false,
    industry: null,
    size: "unknown",
    fundingStage: null,
    comparable: null,
    context: `${companyName}`, // Will be enhanced by rules
  };
}

// =============================================================================
// SOFT SKILLS EXTRACTION
// =============================================================================

/**
 * Common soft skill keywords to detect in bullet points
 */
const SOFT_SKILL_PATTERNS: Record<string, RegExp[]> = {
  leadership: [
    /\b(led|leading|lead|managed|mentored|coached|directed|headed|oversaw)\b/i,
    /\b(team of|cross-functional|coordinated|facilitated)\b/i,
  ],
  communication: [
    /\b(presented|communicated|collaborated|partnered|liaised|reported)\b/i,
    /\b(stakeholder|executive|client-facing|articulated|conveyed)\b/i,
  ],
  problem_solving: [
    /\b(solved|resolved|troubleshot|debugged|diagnosed|identified|analyzed)\b/i,
    /\b(optimized|improved|enhanced|streamlined|automated)\b/i,
  ],
  adaptability: [
    /\b(adapted|pivoted|learned|transitioned|transformed|migrated)\b/i,
    /\b(agile|flexible|cross-trained|multi-disciplinary)\b/i,
  ],
  collaboration: [
    /\b(collaborated|partnered|worked with|teamed|joined forces)\b/i,
    /\b(cross-team|interdepartmental|cross-functional)\b/i,
  ],
  initiative: [
    /\b(initiated|launched|pioneered|spearheaded|proposed|introduced)\b/i,
    /\b(drove|championed|advocated|established)\b/i,
  ],
};

/**
 * Extract soft skills evidence from resume bullet points
 */
export function extractSoftSkills(resume: ResumeContent): SoftSkillAssessment[] {
  const skillMap = new Map<string, { evidence: string[]; bulletIds: string[] }>();

  // Analyze each experience bullet
  for (const exp of resume.experiences) {
    for (const bullet of exp.bullets) {
      for (const [skill, patterns] of Object.entries(SOFT_SKILL_PATTERNS)) {
        for (const pattern of patterns) {
          if (pattern.test(bullet.text)) {
            if (!skillMap.has(skill)) {
              skillMap.set(skill, { evidence: [], bulletIds: [] });
            }
            const data = skillMap.get(skill)!;

            // Extract the matching phrase as evidence
            const match = bullet.text.match(pattern);
            if (match && !data.evidence.includes(match[0])) {
              data.evidence.push(match[0]);
            }
            if (!data.bulletIds.includes(bullet.id)) {
              data.bulletIds.push(bullet.id);
            }
            break; // Only count once per pattern group per bullet
          }
        }
      }
    }
  }

  // Convert to assessments with strength calculation
  const assessments: SoftSkillAssessment[] = [];

  for (const [skill, data] of skillMap) {
    const evidenceCount = data.evidence.length;
    let strength: SoftSkillAssessment["strength"];

    if (evidenceCount >= 4) {
      strength = "strong";
    } else if (evidenceCount >= 2) {
      strength = "moderate";
    } else {
      strength = "weak";
    }

    assessments.push({
      skill: skill.replace(/_/g, " "),
      evidence: data.evidence,
      strength,
      bulletIds: data.bulletIds,
    });
  }

  // Sort by strength (strong first)
  assessments.sort((a, b) => {
    const order = { strong: 0, moderate: 1, weak: 2 };
    return order[a.strength] - order[b.strength];
  });

  return assessments;
}

// =============================================================================
// PRE-ANALYSIS ORCHESTRATOR
// =============================================================================

/**
 * Error thrown when pre-analysis fails
 */
export class PreAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public partialResults?: Partial<PreAnalysisResult>,
    public cause?: unknown
  ) {
    super(message);
    this.name = "PreAnalysisError";
  }
}

/**
 * Run the complete pre-analysis pipeline
 *
 * Executes all analysis modules in parallel for efficiency:
 * - Impact analysis (Issue #2)
 * - Uniqueness analysis (Issue #1)
 * - Context analysis (Issue #5)
 * - Company research (Issue #3)
 * - Soft skills extraction (Issue #4)
 *
 * @param resume The resume to analyze
 * @param job The target job for context analysis
 * @returns Complete pre-analysis results
 */
export async function runPreAnalysis(
  resume: ResumeContent,
  job: JobData
): Promise<PreAnalysisResult> {
  const startTime = Date.now();

  // Prepare job data for context analysis
  const contextJob: ContextJobData = {
    title: job.title,
    companyName: job.companyName,
    description: job.description,
    requirements: job.requirements,
    skills: job.skills,
  };

  // Run all analyses in parallel
  const [impactResult, uniquenessResult, contextResult] = await Promise.allSettled([
    analyzeImpact(resume),
    analyzeUniqueness(resume),
    analyzeContext(resume, contextJob),
  ]);

  // Research company (synchronous, no AI call)
  const companyResult = job.companyName
    ? researchCompany(job.companyName)
    : null;

  // Extract soft skills (synchronous, no AI call)
  const softSkillsResult = extractSoftSkills(resume);

  // Handle results
  const errors: string[] = [];
  let impact: ImpactResult | null = null;
  let uniqueness: UniquenessResult | null = null;
  let context: ContextResult | null = null;

  if (impactResult.status === "fulfilled") {
    impact = impactResult.value;
  } else {
    errors.push(`Impact analysis failed: ${impactResult.reason?.message || "Unknown error"}`);
  }

  if (uniquenessResult.status === "fulfilled") {
    uniqueness = uniquenessResult.value;
  } else {
    errors.push(`Uniqueness analysis failed: ${uniquenessResult.reason?.message || "Unknown error"}`);
  }

  if (contextResult.status === "fulfilled") {
    context = contextResult.value;
  } else {
    errors.push(`Context analysis failed: ${contextResult.reason?.message || "Unknown error"}`);
  }

  // If all AI analyses failed, throw error
  if (!impact && !uniqueness && !context) {
    throw new PreAnalysisError(
      `All analyses failed: ${errors.join("; ")}`,
      "ALL_ANALYSES_FAILED",
      undefined,
      errors
    );
  }

  // Create default results for any that failed
  const defaultImpact: ImpactResult = {
    score: 50,
    scoreLabel: "moderate",
    summary: "Impact analysis unavailable",
    totalBullets: resume.experiences.reduce((sum, exp) => sum + exp.bullets.length, 0),
    bulletsImproved: 0,
    bullets: [],
    metricCategories: { percentage: 0, monetary: 0, time: 0, scale: 0, other: 0 },
    suggestions: [],
  };

  const defaultUniqueness: UniquenessResult = {
    score: 50,
    scoreLabel: "moderate",
    factors: [],
    summary: "Uniqueness analysis unavailable",
    differentiators: [],
    suggestions: [],
  };

  const defaultContext: ContextResult = {
    score: 50,
    scoreLabel: "moderate",
    summary: "Context analysis unavailable",
    matchedSkills: [],
    missingRequirements: [],
    experienceAlignments: [],
    keywordCoverage: { matched: 0, total: 0, percentage: 0, keywords: [] },
    suggestions: [],
    fitAssessment: { strengths: [], gaps: [], overallFit: "Unable to assess" },
  };

  const result: PreAnalysisResult = {
    impact: impact || defaultImpact,
    uniqueness: uniqueness || defaultUniqueness,
    context: context || defaultContext,
    company: companyResult,
    softSkills: softSkillsResult,
    analyzedAt: new Date(),
    resumeId: "", // Will be set by caller
    jobId: job.id,
  };

  // Log any partial failures (in production, use proper logging)
  if (errors.length > 0) {
    console.warn("Pre-analysis completed with partial failures:", errors);
  }

  const processingTime = Date.now() - startTime;
  console.log(`Pre-analysis completed in ${processingTime}ms`);

  return result;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a summary of the pre-analysis results
 */
export function summarizePreAnalysis(result: PreAnalysisResult): {
  overallScore: number;
  issueScores: Record<string, number>;
  topStrengths: string[];
  topGaps: string[];
} {
  // Calculate overall score (weighted average)
  const weights = {
    impact: 0.30,
    uniqueness: 0.20,
    context: 0.25,
    softSkills: 0.10,
    company: 0.15,
  };

  // Calculate soft skills score
  const softSkillsScore = result.softSkills.length > 0
    ? Math.min(100, result.softSkills.reduce((sum, s) => {
        const points = s.strength === "strong" ? 30 : s.strength === "moderate" ? 20 : 10;
        return sum + points;
      }, 0))
    : 50;

  // Company context score
  const companyScore = result.company
    ? (result.company.isWellKnown ? 100 : 60)
    : 50;

  const overallScore = Math.round(
    result.impact.score * weights.impact +
    result.uniqueness.score * weights.uniqueness +
    result.context.score * weights.context +
    softSkillsScore * weights.softSkills +
    companyScore * weights.company
  );

  // Collect top strengths
  const topStrengths: string[] = [];
  if (result.uniqueness.differentiators.length > 0) {
    topStrengths.push(...result.uniqueness.differentiators.slice(0, 2));
  }
  if (result.context.fitAssessment.strengths.length > 0) {
    topStrengths.push(...result.context.fitAssessment.strengths.slice(0, 2));
  }

  // Collect top gaps
  const topGaps: string[] = [];
  if (result.context.missingRequirements.length > 0) {
    topGaps.push(
      ...result.context.missingRequirements
        .filter((r) => r.importance === "critical")
        .map((r) => r.requirement)
        .slice(0, 2)
    );
  }
  if (result.context.fitAssessment.gaps.length > 0) {
    topGaps.push(...result.context.fitAssessment.gaps.slice(0, 2));
  }

  return {
    overallScore,
    issueScores: {
      uniqueness: result.uniqueness.score,
      impact: result.impact.score,
      context: companyScore,
      culturalFit: softSkillsScore,
      customization: result.context.score,
    },
    topStrengths: topStrengths.slice(0, 3),
    topGaps: topGaps.slice(0, 3),
  };
}
