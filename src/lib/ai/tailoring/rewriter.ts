/**
 * Guided AI Rewriter
 *
 * This module uses minimal AI calls to rewrite resume content
 * based on pre-computed transformation instructions.
 *
 * Key principles:
 * - AI does NOT make decisions (rules do that)
 * - AI ONLY rewrites natural language with specific instructions
 * - Batch multiple rewrites in single API call for efficiency
 */

import Anthropic from "@anthropic-ai/sdk";
import { getAIConfig, isAIConfigured, getModelConfig } from "../config";
import { parseAIJsonResponse, JSON_OUTPUT_INSTRUCTIONS } from "../json-utils";
import { withRetry } from "../retry";
import type { ResumeContent } from "@/lib/validations/resume";
import type {
  TransformationInstructions,
  BulletTransformInstruction,
  SummaryTransformInstruction,
  WhyFitInstruction,
  TailoringChanges,
} from "./types";

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

const BULLET_REWRITE_PROMPT = `You are a precise resume editor. Follow instructions exactly.

For each bullet, you receive:
1. Original text
2. Specific modification instructions
3. Tone guidance

Rules:
- Preserve the CORE MEANING of the original
- Apply ONLY the requested modifications
- Keep bullets to 1-2 lines
- Start with strong action verbs
- Include quantified metrics when specified
- Do NOT add information not implied by the original
- Do NOT over-exaggerate

Return JSON with rewritten bullets.` + JSON_OUTPUT_INSTRUCTIONS;

const SUMMARY_REWRITE_PROMPT = `You are a precise resume editor. Follow instructions exactly.

You will rewrite a professional summary based on specific instructions.

Rules:
- Keep to 2-4 sentences maximum
- Lead with the candidate's unique value
- Align with the target role and company
- Match the specified tone (confident/measured/humble)
- Include only information provided in instructions
- Do NOT fabricate achievements or skills

Return JSON with the rewritten summary.` + JSON_OUTPUT_INSTRUCTIONS;

const WHY_FIT_PROMPT = `You are a resume strategist crafting a "Why I'm the Right Fit" section.

For each bullet, you receive:
1. A label (bold prefix)
2. Supporting evidence/text

Rules:
- Make each bullet compelling and specific
- Keep each bullet to 1-2 sentences
- Start evidence with proof, not claims
- Be confident but not arrogant
- Use active voice

Return JSON with polished bullets.` + JSON_OUTPUT_INSTRUCTIONS;

// =============================================================================
// REWRITER FUNCTIONS
// =============================================================================

/**
 * Create Anthropic client
 */
function createClient(): Anthropic {
  const config = getAIConfig();
  return new Anthropic({
    apiKey: config.apiKey,
    timeout: config.timeout,
  });
}

/**
 * Rewrite bullets in batch (single API call for efficiency)
 */
export async function rewriteBullets(
  instructions: BulletTransformInstruction[]
): Promise<Map<string, string>> {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured");
  }

  // Filter to only bullets that need rewriting
  const toRewrite = instructions.filter(
    (i) =>
      i.addMetrics ||
      i.addKeywords ||
      i.addContext ||
      i.addSoftSkills ||
      i.improvementLevel !== "none"
  );

  if (toRewrite.length === 0) {
    // Return original texts
    const result = new Map<string, string>();
    for (const i of instructions) {
      result.set(i.bulletId, i.originalText);
    }
    return result;
  }

  // Build the prompt with all bullets to rewrite
  const bulletsForPrompt = toRewrite.map((i, idx) => ({
    id: i.bulletId,
    index: idx + 1,
    original: i.originalText,
    instruction: i.rewriteInstruction,
    tone: i.tone,
  }));

  const userPrompt = `Rewrite these resume bullets according to their instructions:

${JSON.stringify(bulletsForPrompt, null, 2)}

Return a JSON object with this structure:
{
  "bullets": [
    { "id": "bullet-id", "rewritten": "The rewritten bullet text" }
  ]
}`;

  const modelConfig = getModelConfig("jobMatchAnalysis");
  const client = createClient();

  const response = await withRetry(
    () =>
      client.messages.create({
        model: modelConfig.model,
        max_tokens: 4000,
        temperature: 0.3, // Low temperature for consistency
        system: BULLET_REWRITE_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    { timeBudgetMs: 60000 }
  );

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No response from AI");
  }

  const parsed = parseAIJsonResponse<{
    bullets: Array<{ id: string; rewritten: string }>;
  }>(textContent.text, "BulletRewrite");

  // Build result map
  const result = new Map<string, string>();

  // First, add all original texts
  for (const i of instructions) {
    result.set(i.bulletId, i.originalText);
  }

  // Then override with rewritten texts
  for (const bullet of parsed.bullets || []) {
    if (bullet.id && bullet.rewritten) {
      result.set(bullet.id, bullet.rewritten);
    }
  }

  return result;
}

/**
 * Rewrite the professional summary
 */
export async function rewriteSummary(
  instruction: SummaryTransformInstruction
): Promise<string> {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured");
  }

  // If no original summary and no content, return empty
  if (!instruction.originalSummary && instruction.uniqueDifferentiators.length === 0) {
    return "";
  }

  const userPrompt = `Rewrite this professional summary:

Original: "${instruction.originalSummary || "(No existing summary)"}"

Target Role: ${instruction.targetRole}
Target Company: ${instruction.targetCompany}

Unique Differentiators to Highlight:
${instruction.uniqueDifferentiators.map((d) => `- ${d}`).join("\n")}

Relevant Skills:
${instruction.matchedSkills.map((s) => `- ${s}`).join("\n")}

${instruction.companyAlignment ? `Company Alignment: ${instruction.companyAlignment}` : ""}

Tone: ${instruction.tone}

Instructions: ${instruction.rewriteInstruction}

Return a JSON object with this structure:
{
  "summary": "The rewritten professional summary (2-4 sentences)"
}`;

  const modelConfig = getModelConfig("jobMatchAnalysis");
  const client = createClient();

  const response = await withRetry(
    () =>
      client.messages.create({
        model: modelConfig.model,
        max_tokens: 1000,
        temperature: 0.4,
        system: SUMMARY_REWRITE_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    { timeBudgetMs: 30000 }
  );

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No response from AI");
  }

  const parsed = parseAIJsonResponse<{ summary: string }>(textContent.text, "SummaryRewrite");

  return parsed.summary || instruction.originalSummary || "";
}

/**
 * Polish the "Why I'm the Right Fit" section bullets
 */
export async function polishWhyFitBullets(
  instruction: WhyFitInstruction
): Promise<Array<{ label: string; text: string }>> {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured");
  }

  if (instruction.bullets.length === 0) {
    return [];
  }

  const userPrompt = `Polish these "Why I'm the Right Fit" bullets:

${instruction.bullets.map((b, i) => `${i + 1}. Label: "${b.label}" | Text: "${b.text}"`).join("\n")}

Return a JSON object with this structure:
{
  "bullets": [
    { "label": "Bold Label:", "text": "Polished evidence text" }
  ]
}`;

  const modelConfig = getModelConfig("jobMatchAnalysis");
  const client = createClient();

  const response = await withRetry(
    () =>
      client.messages.create({
        model: modelConfig.model,
        max_tokens: 1000,
        temperature: 0.4,
        system: WHY_FIT_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    { timeBudgetMs: 30000 }
  );

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No response from AI");
  }

  const parsed = parseAIJsonResponse<{
    bullets: Array<{ label: string; text: string }>;
  }>(textContent.text, "WhyFitPolish");

  return parsed.bullets || instruction.bullets.map((b) => ({ label: b.label, text: b.text }));
}

// =============================================================================
// APPLY TRANSFORMATIONS
// =============================================================================

/**
 * Apply all transformations to create the tailored resume
 */
export async function applyTransformations(
  originalResume: ResumeContent,
  instructions: TransformationInstructions
): Promise<{ tailoredResume: ResumeContent; changes: TailoringChanges }> {
  const startTime = Date.now();

  // 1. Rewrite bullets
  const rewrittenBullets = await rewriteBullets(instructions.bullets);

  // 2. Rewrite summary
  const rewrittenSummary = await rewriteSummary(instructions.summary);

  // 3. Polish "Why I'm the Right Fit" bullets
  const polishedWhyFit = await polishWhyFitBullets(instructions.whyFit);

  // 4. Create tailored resume
  const tailoredResume: ResumeContent = {
    ...originalResume,
    summary: rewrittenSummary,
    experiences: originalResume.experiences.map((exp) => ({
      ...exp,
      bullets: exp.bullets.map((bullet) => ({
        ...bullet,
        text: rewrittenBullets.get(bullet.id) || bullet.text,
        isModified: rewrittenBullets.has(bullet.id) &&
          rewrittenBullets.get(bullet.id) !== bullet.text,
      })),
    })),
    skills: {
      ...originalResume.skills,
      technical: instructions.skills.technical.reordered,
      soft: instructions.skills.soft.reordered,
    },
  };

  // 5. Calculate changes
  const bulletDiffs: TailoringChanges["bulletDiffs"] = [];
  let experienceBulletsModified = 0;

  for (const exp of originalResume.experiences) {
    for (const bullet of exp.bullets) {
      const rewritten = rewrittenBullets.get(bullet.id);
      if (rewritten && rewritten !== bullet.text) {
        experienceBulletsModified++;
        const instr = instructions.bullets.find((i) => i.bulletId === bullet.id);

        let changeType: TailoringChanges["bulletDiffs"][0]["changeType"] = "combined";
        if (instr?.addMetrics && !instr.addKeywords && !instr.addSoftSkills && !instr.addContext) {
          changeType = "metrics";
        } else if (instr?.addKeywords && !instr.addMetrics && !instr.addSoftSkills && !instr.addContext) {
          changeType = "keywords";
        } else if (instr?.addContext && !instr.addMetrics && !instr.addKeywords && !instr.addSoftSkills) {
          changeType = "context";
        } else if (instr?.addSoftSkills && !instr.addMetrics && !instr.addKeywords && !instr.addContext) {
          changeType = "soft_skills";
        }

        bulletDiffs.push({
          bulletId: bullet.id,
          experienceId: exp.id,
          before: bullet.text,
          after: rewritten,
          changeType,
        });
      }
    }
  }

  const changes: TailoringChanges = {
    summaryModified: rewrittenSummary !== originalResume.summary,
    summaryDiff: rewrittenSummary !== originalResume.summary
      ? { before: originalResume.summary, after: rewrittenSummary }
      : null,
    experienceBulletsModified,
    bulletDiffs,
    skillsReordered:
      JSON.stringify(instructions.skills.technical.original) !==
      JSON.stringify(instructions.skills.technical.reordered),
    skillsAdded: instructions.skills.technical.toAdd,
    experiencesReordered: false, // Keep original order for now
    whyFitSectionAdded: polishedWhyFit.length > 0,
    whyFitBulletCount: polishedWhyFit.length,
    competenciesGenerated: false, // Will be added later
  };

  console.log(`Transformations applied in ${Date.now() - startTime}ms`);

  return { tailoredResume, changes };
}
