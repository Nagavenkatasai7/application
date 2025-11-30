/**
 * Hybrid Tailor - Main Orchestrator
 *
 * This is the main entry point for the recruiter-optimized resume tailoring system.
 * It orchestrates the complete pipeline:
 *
 * 1. Pre-Analysis (parallel module calls)
 * 2. Rule Engine (deterministic decisions)
 * 3. Guided AI Rewriting (minimal AI)
 * 4. Quality Scoring
 */

import type { ResumeContent } from "@/lib/validations/resume";
import type {
  JobData,
  PreAnalysisResult,
  HybridTailorResult,
} from "./types";

import { runPreAnalysis } from "./pre-analysis";
import { generateTransformationInstructions } from "./rule-engine";
import { getAllEnabledRules } from "./rules";
import { applyTransformations } from "./rewriter";
import { calculateRecruiterReadiness } from "@/lib/scoring/recruiter-readiness";

/**
 * Error thrown when hybrid tailoring fails
 */
export class HybridTailorError extends Error {
  constructor(
    message: string,
    public code: string,
    public phase: "pre-analysis" | "rules" | "rewriting" | "scoring",
    public cause?: unknown
  ) {
    super(message);
    this.name = "HybridTailorError";
  }
}

/**
 * Main hybrid tailoring function
 *
 * @param resume The resume to tailor
 * @param job The target job
 * @param resumeId The resume ID for tracking
 * @returns Complete hybrid tailor result
 */
export async function hybridTailor(
  resume: ResumeContent,
  job: JobData,
  resumeId: string
): Promise<HybridTailorResult> {
  const startTime = Date.now();
  let preAnalysisTokens = 0;
  let rewritingTokens = 0;

  try {
    // =======================================================================
    // PHASE 1: PRE-ANALYSIS
    // =======================================================================
    console.log("[HybridTailor] Starting pre-analysis...");
    const preAnalysisStart = Date.now();

    let preAnalysis: PreAnalysisResult;
    try {
      preAnalysis = await runPreAnalysis(resume, job);
      preAnalysis.resumeId = resumeId;
    } catch (error) {
      throw new HybridTailorError(
        "Pre-analysis failed",
        "PRE_ANALYSIS_FAILED",
        "pre-analysis",
        error
      );
    }

    const preAnalysisTime = Date.now() - preAnalysisStart;
    console.log(`[HybridTailor] Pre-analysis completed in ${preAnalysisTime}ms`);

    // Estimate tokens used in pre-analysis (rough estimate)
    preAnalysisTokens = 3 * 2000; // ~2k tokens per analysis module

    // =======================================================================
    // PHASE 2: RULE ENGINE
    // =======================================================================
    console.log("[HybridTailor] Evaluating rules...");
    const rulesStart = Date.now();

    const rules = getAllEnabledRules();
    const transformationInstructions = generateTransformationInstructions(
      resume,
      preAnalysis,
      job,
      rules
    );

    const rulesTime = Date.now() - rulesStart;
    console.log(
      `[HybridTailor] Rules evaluated in ${rulesTime}ms. Applied: ${transformationInstructions.appliedRules.length}`
    );

    // =======================================================================
    // PHASE 3: GUIDED AI REWRITING
    // =======================================================================
    console.log("[HybridTailor] Applying transformations...");
    const rewritingStart = Date.now();

    let tailoredResume: ResumeContent;
    let changes: HybridTailorResult["changes"];

    try {
      const result = await applyTransformations(resume, transformationInstructions);
      tailoredResume = result.tailoredResume;
      changes = result.changes;
    } catch (error) {
      throw new HybridTailorError(
        "Rewriting failed",
        "REWRITING_FAILED",
        "rewriting",
        error
      );
    }

    const rewritingTime = Date.now() - rewritingStart;
    console.log(`[HybridTailor] Rewriting completed in ${rewritingTime}ms`);

    // Estimate tokens used in rewriting
    const bulletsToRewrite = transformationInstructions.bullets.filter(
      (b) => b.improvementLevel !== "none" || b.addMetrics || b.addKeywords
    ).length;
    rewritingTokens = Math.max(500, bulletsToRewrite * 200); // ~200 tokens per bullet

    // =======================================================================
    // PHASE 4: QUALITY SCORING
    // =======================================================================
    console.log("[HybridTailor] Calculating quality score...");
    const scoringStart = Date.now();

    let qualityScore: HybridTailorResult["qualityScore"];
    try {
      qualityScore = calculateRecruiterReadiness(preAnalysis);
    } catch (error) {
      throw new HybridTailorError(
        "Scoring failed",
        "SCORING_FAILED",
        "scoring",
        error
      );
    }

    const scoringTime = Date.now() - scoringStart;
    console.log(`[HybridTailor] Scoring completed in ${scoringTime}ms. Score: ${qualityScore.composite}`);

    // =======================================================================
    // BUILD RESULT
    // =======================================================================
    const totalTime = Date.now() - startTime;
    const totalTokens = preAnalysisTokens + rewritingTokens;
    const estimatedPureAITokens = 10000; // Pure AI approach uses ~10k tokens

    const result: HybridTailorResult = {
      tailoredResume,
      preAnalysis,
      appliedRules: transformationInstructions.appliedRules,
      changes,
      qualityScore,
      tokenUsage: {
        preAnalysis: preAnalysisTokens,
        rewriting: rewritingTokens,
        total: totalTokens,
        savedVsPureAI: Math.max(0, estimatedPureAITokens - totalTokens),
      },
      tailoredAt: new Date(),
      processingTimeMs: totalTime,
    };

    console.log(`[HybridTailor] Complete! Total time: ${totalTime}ms, Tokens: ${totalTokens}`);

    return result;
  } catch (error) {
    if (error instanceof HybridTailorError) {
      throw error;
    }
    throw new HybridTailorError(
      "Unexpected error during tailoring",
      "UNKNOWN_ERROR",
      "pre-analysis",
      error
    );
  }
}

/**
 * Quick analysis without rewriting (for previews)
 */
export async function analyzeForTailoring(
  resume: ResumeContent,
  job: JobData,
  resumeId: string
): Promise<{
  preAnalysis: PreAnalysisResult;
  qualityScore: HybridTailorResult["qualityScore"];
  estimatedChanges: {
    bulletsToImprove: number;
    uniqueDifferentiators: number;
    missingKeywords: number;
    softSkillsDetected: number;
  };
}> {
  const preAnalysis = await runPreAnalysis(resume, job);
  preAnalysis.resumeId = resumeId;

  const qualityScore = calculateRecruiterReadiness(preAnalysis);

  const estimatedChanges = {
    bulletsToImprove: preAnalysis.impact.bulletsImproved,
    uniqueDifferentiators: preAnalysis.uniqueness.differentiators.length,
    missingKeywords: preAnalysis.context.keywordCoverage.keywords.filter((k) => !k.found).length,
    softSkillsDetected: preAnalysis.softSkills.length,
  };

  return { preAnalysis, qualityScore, estimatedChanges };
}
