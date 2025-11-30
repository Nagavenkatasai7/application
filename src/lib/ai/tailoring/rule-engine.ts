/**
 * Rule Engine
 *
 * Evaluates transformation rules based on pre-analysis results
 * and generates instructions for the AI rewriter.
 *
 * The rule engine is 100% deterministic - no AI calls.
 * This ensures consistent, debuggable decision-making.
 */

import type { ResumeContent } from "@/lib/validations/resume";
import type {
  PreAnalysisResult,
  TransformationRule,
  RuleCondition,
  RuleEvaluationResult,
  TransformationInstructions,
  BulletTransformInstruction,
  SummaryTransformInstruction,
  WhyFitInstruction,
  SkillsReorderInstruction,
  ExperienceReorderInstruction,
  StrategicTone,
  JobData,
} from "./types";

// =============================================================================
// CONDITION EVALUATOR
// =============================================================================

/**
 * Get a nested value from an object using dot notation
 * e.g., getNestedValue(obj, "impact.score") => obj.impact.score
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Evaluate a single rule condition
 */
export function evaluateCondition(
  condition: RuleCondition,
  preAnalysis: PreAnalysisResult
): boolean {
  switch (condition.type) {
    case "AND": {
      if (!condition.conditions || condition.conditions.length === 0) {
        return true;
      }
      return condition.conditions.every((c) => evaluateCondition(c, preAnalysis));
    }

    case "OR": {
      if (!condition.conditions || condition.conditions.length === 0) {
        return true;
      }
      return condition.conditions.some((c) => evaluateCondition(c, preAnalysis));
    }

    case "NOT": {
      if (!condition.conditions || condition.conditions.length === 0) {
        return true;
      }
      return !evaluateCondition(condition.conditions[0], preAnalysis);
    }

    case "THRESHOLD": {
      if (!condition.field || condition.operator === undefined || condition.value === undefined) {
        return false;
      }
      const fieldValue = getNestedValue(preAnalysis, condition.field);
      if (typeof fieldValue !== "number" || typeof condition.value !== "number") {
        return false;
      }

      switch (condition.operator) {
        case "<": return fieldValue < condition.value;
        case "<=": return fieldValue <= condition.value;
        case "=": return fieldValue === condition.value;
        case ">=": return fieldValue >= condition.value;
        case ">": return fieldValue > condition.value;
        default: return false;
      }
    }

    case "MATCH": {
      if (!condition.field || condition.value === undefined) {
        return false;
      }
      const fieldValue = getNestedValue(preAnalysis, condition.field);

      if (condition.operator === "in") {
        if (Array.isArray(condition.value)) {
          return condition.value.includes(fieldValue as string);
        }
        return false;
      }

      if (condition.operator === "contains") {
        if (typeof fieldValue === "string" && typeof condition.value === "string") {
          return fieldValue.toLowerCase().includes(condition.value.toLowerCase());
        }
        if (Array.isArray(fieldValue) && typeof condition.value === "string") {
          return fieldValue.some((v) =>
            String(v).toLowerCase().includes(condition.value!.toString().toLowerCase())
          );
        }
        return false;
      }

      return fieldValue === condition.value;
    }

    case "EXISTS": {
      if (!condition.field) {
        return false;
      }
      const fieldValue = getNestedValue(preAnalysis, condition.field);
      const exists = fieldValue !== undefined && fieldValue !== null;

      if (Array.isArray(fieldValue)) {
        return fieldValue.length > 0;
      }
      if (typeof fieldValue === "string") {
        return fieldValue.length > 0;
      }
      return exists;
    }

    default:
      return false;
  }
}

// =============================================================================
// RULE EVALUATOR
// =============================================================================

/**
 * Evaluate a single rule against pre-analysis results
 */
export function evaluateRule(
  rule: TransformationRule,
  preAnalysis: PreAnalysisResult,
  resume: ResumeContent
): RuleEvaluationResult {
  const matched = rule.enabled && evaluateCondition(rule.condition, preAnalysis);

  // Identify which targets (bullets, experiences) are affected
  const matchedTargets: string[] = [];

  if (matched) {
    // For bullet-targeting rules, identify affected bullets
    for (const action of rule.actions) {
      if (action.target === "bullet" || action.target === "experience") {
        // Add all experience IDs
        for (const exp of resume.experiences) {
          matchedTargets.push(exp.id);
          for (const bullet of exp.bullets) {
            matchedTargets.push(bullet.id);
          }
        }
      }
    }
  }

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    matched,
    recruiterIssue: rule.recruiterIssue,
    matchedTargets,
    actions: matched ? rule.actions : [],
    strategicTone: rule.strategicTone,
  };
}

/**
 * Evaluate all rules and return sorted results
 */
export function evaluateRules(
  rules: TransformationRule[],
  preAnalysis: PreAnalysisResult,
  resume: ResumeContent
): RuleEvaluationResult[] {
  // Sort by priority (lower = higher priority)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  // Evaluate each rule
  const results = sortedRules.map((rule) => evaluateRule(rule, preAnalysis, resume));

  // Return only matched rules
  return results.filter((r) => r.matched);
}

// =============================================================================
// STRATEGIC TONE CALCULATOR
// =============================================================================

/**
 * Determine overall strategic tone based on context score
 */
export function calculateStrategicTone(preAnalysis: PreAnalysisResult): StrategicTone {
  const contextScore = preAnalysis.context.score;

  if (contextScore >= 75) {
    return "confident";
  } else if (contextScore >= 50) {
    return "measured";
  } else {
    return "humble";
  }
}

// =============================================================================
// TRANSFORMATION INSTRUCTION GENERATOR
// =============================================================================

/**
 * Generate bullet transformation instructions from pre-analysis and rules
 */
export function generateBulletInstructions(
  resume: ResumeContent,
  preAnalysis: PreAnalysisResult,
  appliedRules: RuleEvaluationResult[],
  tone: StrategicTone
): BulletTransformInstruction[] {
  const instructions: BulletTransformInstruction[] = [];

  // Create a map of impact bullets for quick lookup
  const impactBulletMap = new Map(
    preAnalysis.impact.bullets.map((b) => [`${b.experienceId}-${b.original}`, b])
  );

  // Get missing keywords from context
  const missingKeywords = preAnalysis.context.keywordCoverage.keywords
    .filter((k) => !k.found)
    .map((k) => k.keyword);

  // Get soft skills to weave in
  const strongSoftSkills = preAnalysis.softSkills
    .filter((s) => s.strength === "strong")
    .map((s) => s.skill);

  for (const exp of resume.experiences) {
    for (const bullet of exp.bullets) {
      // Find matching impact analysis
      const impactBullet = impactBulletMap.get(`${exp.id}-${bullet.text}`);

      const instruction: BulletTransformInstruction = {
        bulletId: bullet.id,
        experienceId: exp.id,
        originalText: bullet.text,

        // Determine what to add
        addMetrics: impactBullet?.improvement !== "none" && impactBullet?.improvement !== undefined,
        suggestedMetrics: impactBullet?.metrics || [],

        addKeywords: missingKeywords.length > 0,
        keywordsToAdd: missingKeywords.slice(0, 3), // Limit to avoid keyword stuffing

        addContext: preAnalysis.company !== null && !preAnalysis.company.isWellKnown,
        contextToAdd: preAnalysis.company?.context || "",

        addSoftSkills: strongSoftSkills.length > 0,
        softSkillsToWeave: strongSoftSkills.slice(0, 2),

        templateId: null, // Will be set by template matching
        tone,
        improvementLevel: impactBullet?.improvement || "none",

        rewriteInstruction: "", // Generated below
      };

      // Generate rewrite instruction based on what needs to change
      instruction.rewriteInstruction = generateBulletRewriteInstruction(instruction, impactBullet?.improved);

      instructions.push(instruction);
    }
  }

  return instructions;
}

/**
 * Generate the actual rewrite instruction for a bullet
 */
function generateBulletRewriteInstruction(
  instruction: BulletTransformInstruction,
  improvedVersion?: string
): string {
  const parts: string[] = [];

  // If we have an improved version from impact analysis, use it as base
  if (improvedVersion && instruction.improvementLevel !== "none") {
    parts.push(`Start with: "${improvedVersion}"`);
  } else {
    parts.push(`Original: "${instruction.originalText}"`);
  }

  // Add specific modification instructions
  if (instruction.addMetrics && instruction.suggestedMetrics.length > 0) {
    parts.push(`Add metrics: ${instruction.suggestedMetrics.join(", ")}`);
  }

  if (instruction.addKeywords && instruction.keywordsToAdd.length > 0) {
    parts.push(`Naturally incorporate: ${instruction.keywordsToAdd.join(", ")}`);
  }

  if (instruction.addSoftSkills && instruction.softSkillsToWeave.length > 0) {
    parts.push(`Show evidence of: ${instruction.softSkillsToWeave.join(", ")}`);
  }

  // Tone guidance
  const toneGuidance: Record<StrategicTone, string> = {
    confident: "Use strong action verbs and assertive language",
    measured: "Balance confidence with precision",
    humble: "Focus on learning and growth while highlighting contribution",
  };
  parts.push(toneGuidance[instruction.tone]);

  return parts.join(". ");
}

/**
 * Generate summary transformation instructions
 */
export function generateSummaryInstruction(
  resume: ResumeContent,
  preAnalysis: PreAnalysisResult,
  job: JobData,
  tone: StrategicTone
): SummaryTransformInstruction {
  // Get top differentiators from uniqueness analysis
  const uniqueDifferentiators = preAnalysis.uniqueness.differentiators.slice(0, 3);

  // Get matched skills from context
  const matchedSkills = preAnalysis.context.matchedSkills
    .filter((s) => s.strength === "exact")
    .map((s) => s.skill)
    .slice(0, 5);

  // Get company alignment if researched
  const companyAlignment = preAnalysis.company && !preAnalysis.company.isWellKnown
    ? `aligned with ${job.companyName}'s mission`
    : null;

  const instruction: SummaryTransformInstruction = {
    originalSummary: resume.summary,
    targetRole: job.title,
    targetCompany: job.companyName || "the company",

    uniqueDifferentiators,
    matchedSkills,
    companyAlignment,

    tone,
    rewriteInstruction: "", // Generated below
  };

  // Generate rewrite instruction
  const parts: string[] = [];

  parts.push(`Target role: ${job.title}${job.companyName ? ` at ${job.companyName}` : ""}`);

  if (uniqueDifferentiators.length > 0) {
    parts.push(`Lead with unique value: ${uniqueDifferentiators.join(", ")}`);
  }

  if (matchedSkills.length > 0) {
    parts.push(`Highlight relevant skills: ${matchedSkills.join(", ")}`);
  }

  if (companyAlignment) {
    parts.push(`Show alignment: ${companyAlignment}`);
  }

  const toneGuidance: Record<StrategicTone, string> = {
    confident: "Position as the ideal candidate with proven track record",
    measured: "Show strong fit while acknowledging growth areas",
    humble: "Emphasize eagerness to contribute and learn",
  };
  parts.push(toneGuidance[tone]);

  instruction.rewriteInstruction = parts.join(". ");

  return instruction;
}

/**
 * Generate "Why I'm the Right Fit" section instructions
 */
export function generateWhyFitInstruction(
  preAnalysis: PreAnalysisResult
): WhyFitInstruction {
  const bullets: WhyFitInstruction["bullets"] = [];

  // Add very rare uniqueness factors
  for (const factor of preAnalysis.uniqueness.factors) {
    if (factor.rarity === "very_rare" || factor.rarity === "rare") {
      let label: string;
      switch (factor.type) {
        case "skill_combination":
          label = "Unique skill set:";
          break;
        case "career_transition":
          label = "Diverse perspective:";
          break;
        case "achievement":
          label = "Proven track record:";
          break;
        case "domain_expertise":
          label = "Deep expertise:";
          break;
        default:
          label = "Distinctive background:";
      }

      bullets.push({
        label,
        text: factor.description,
        source: "uniqueness",
        rarity: factor.rarity,
      });

      if (bullets.length >= 3) break; // Max 3 why-fit bullets
    }
  }

  // If we don't have enough from uniqueness, add from top matched experiences
  if (bullets.length < 2) {
    const highRelevanceExps = preAnalysis.context.experienceAlignments
      .filter((e) => e.relevance === "high")
      .slice(0, 2 - bullets.length);

    for (const exp of highRelevanceExps) {
      bullets.push({
        label: "Directly relevant:",
        text: `${exp.experienceTitle} experience - ${exp.explanation}`,
        source: "experience",
        rarity: "uncommon",
      });
    }
  }

  return { bullets };
}

/**
 * Generate skills reordering instructions
 */
export function generateSkillsReorderInstruction(
  resume: ResumeContent,
  preAnalysis: PreAnalysisResult
): SkillsReorderInstruction {
  const matchedSkillsSet = new Set(
    preAnalysis.context.matchedSkills
      .filter((s) => s.strength === "exact")
      .map((s) => s.skill.toLowerCase())
  );

  // Reorder technical skills - matched ones first
  const technicalOriginal = resume.skills.technical || [];
  const technicalMatched = technicalOriginal.filter((s) =>
    matchedSkillsSet.has(s.toLowerCase())
  );
  const technicalOther = technicalOriginal.filter(
    (s) => !matchedSkillsSet.has(s.toLowerCase())
  );
  const technicalReordered = [...technicalMatched, ...technicalOther];

  // Find skills to add from missing requirements
  const skillsToAdd = preAnalysis.context.missingRequirements
    .filter((r) => r.importance === "nice_to_have" || r.importance === "important")
    .map((r) => r.requirement)
    .filter((r) => r.split(" ").length <= 3) // Only short skill names
    .slice(0, 3);

  // Reorder soft skills - emphasized based on soft skill analysis
  const softOriginal = resume.skills.soft || [];
  const emphasized = preAnalysis.softSkills
    .filter((s) => s.strength === "strong")
    .map((s) => s.skill);

  return {
    technical: {
      original: technicalOriginal,
      reordered: technicalReordered,
      matchedFirst: technicalMatched,
      toAdd: skillsToAdd,
    },
    soft: {
      original: softOriginal,
      reordered: softOriginal, // Keep original order for now
      emphasized,
    },
  };
}

/**
 * Generate experience reordering instructions
 */
export function generateExperienceReorderInstruction(
  resume: ResumeContent,
  preAnalysis: PreAnalysisResult
): ExperienceReorderInstruction {
  // Calculate relevance scores from context analysis
  const relevanceScores: Record<string, number> = {};

  for (const exp of resume.experiences) {
    const alignment = preAnalysis.context.experienceAlignments.find(
      (a) => a.experienceId === exp.id || a.experienceTitle === exp.title
    );

    if (alignment) {
      relevanceScores[exp.id] = alignment.relevance === "high" ? 100 :
        alignment.relevance === "medium" ? 60 : 30;
    } else {
      relevanceScores[exp.id] = 50; // Default if not analyzed
    }
  }

  // Sort by relevance (but also consider recency)
  // We typically keep chronological order unless relevance difference is significant
  const experienceIds = resume.experiences.map((e) => e.id);

  return {
    experienceIds,
    relevanceScores,
    newOrder: experienceIds, // Keep original order (most recent first is standard)
  };
}

/**
 * Generate complete transformation instructions
 */
export function generateTransformationInstructions(
  resume: ResumeContent,
  preAnalysis: PreAnalysisResult,
  job: JobData,
  rules: TransformationRule[]
): TransformationInstructions {
  // Evaluate all rules
  const appliedRules = evaluateRules(rules, preAnalysis, resume);

  // Calculate strategic tone
  const overallTone = calculateStrategicTone(preAnalysis);

  // Generate all instructions
  const bullets = generateBulletInstructions(resume, preAnalysis, appliedRules, overallTone);
  const summary = generateSummaryInstruction(resume, preAnalysis, job, overallTone);
  const whyFit = generateWhyFitInstruction(preAnalysis);
  const skills = generateSkillsReorderInstruction(resume, preAnalysis);
  const experienceOrder = generateExperienceReorderInstruction(resume, preAnalysis);

  return {
    bullets,
    summary,
    whyFit,
    skills,
    experienceOrder,
    appliedRules,
    overallTone,
  };
}
