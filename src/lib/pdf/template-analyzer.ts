/**
 * Template Analyzer for PDF Resume Templates
 *
 * Analyzes uploaded PDF resumes to extract visual design properties
 * that can be used to recreate similar styling in generated PDFs.
 */

import Anthropic from "@anthropic-ai/sdk";
import { getAIConfig, isAIConfigured } from "@/lib/ai/config";
import { withRetry } from "@/lib/ai/retry";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Layout analysis of the resume template
 */
export interface LayoutAnalysis {
  columns: 1 | 2;
  headerStyle: "centered" | "left" | "right";
  sectionSeparator: "line" | "space" | "none";
  hasPhoto: boolean;
  hasSidebar: boolean;
}

/**
 * Font style definition
 */
export interface FontStyle {
  family: string;
  size: number;
  weight: "normal" | "bold" | "light";
  color: string;
}

/**
 * Font analysis for different text types
 */
export interface FontAnalysis {
  heading: FontStyle;
  subheading: FontStyle;
  body: FontStyle;
  accent: FontStyle;
}

/**
 * Color palette extracted from template
 */
export interface ColorAnalysis {
  primary: string;      // Main heading color (name, section titles)
  secondary: string;    // Subheadings, dates
  accent: string;       // Links, highlights, decorative elements
  text: string;         // Body text
  background: string;   // Page background
  lineColor: string;    // Separator lines
}

/**
 * Spacing measurements
 */
export interface SpacingAnalysis {
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  sectionGap: number;
  itemGap: number;
  lineHeight: number;
}

/**
 * Section order and presence
 */
export interface SectionsAnalysis {
  order: string[];
  hasIcon: boolean;
  bulletStyle: "disc" | "circle" | "square" | "dash" | "none";
}

/**
 * Complete template analysis result
 */
export interface TemplateAnalysis {
  layout: LayoutAnalysis;
  fonts: FontAnalysis;
  colors: ColorAnalysis;
  spacing: SpacingAnalysis;
  sections: SectionsAnalysis;
  confidence: number; // 0-1 score of how confident the analysis is
  analyzedAt: string; // ISO timestamp
}

// =============================================================================
// DEFAULT TEMPLATE
// =============================================================================

/**
 * Default professional template style
 * Used when analysis fails or is not available
 */
export const DEFAULT_TEMPLATE: TemplateAnalysis = {
  layout: {
    columns: 1,
    headerStyle: "left",
    sectionSeparator: "line",
    hasPhoto: false,
    hasSidebar: false,
  },
  fonts: {
    heading: {
      family: "Helvetica",
      size: 24,
      weight: "bold",
      color: "#1a1a1a",
    },
    subheading: {
      family: "Helvetica",
      size: 14,
      weight: "bold",
      color: "#333333",
    },
    body: {
      family: "Helvetica",
      size: 11,
      weight: "normal",
      color: "#444444",
    },
    accent: {
      family: "Helvetica",
      size: 10,
      weight: "normal",
      color: "#666666",
    },
  },
  colors: {
    primary: "#1a1a1a",
    secondary: "#333333",
    accent: "#0066cc",
    text: "#444444",
    background: "#ffffff",
    lineColor: "#cccccc",
  },
  spacing: {
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    sectionGap: 20,
    itemGap: 10,
    lineHeight: 1.4,
  },
  sections: {
    order: ["header", "summary", "experience", "education", "skills"],
    hasIcon: false,
    bulletStyle: "disc",
  },
  confidence: 0.5,
  analyzedAt: new Date().toISOString(),
};

// =============================================================================
// TEMPLATE ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Error thrown when template analysis fails
 */
export class TemplateAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "TemplateAnalysisError";
  }
}

/**
 * Create Anthropic client with current configuration
 */
function createClient(): Anthropic {
  const config = getAIConfig();
  return new Anthropic({
    apiKey: config.apiKey,
    timeout: config.timeout,
  });
}

/**
 * Analyze resume template using Claude Vision API
 *
 * @param pdfImageBase64 - Base64 encoded image of the PDF first page
 * @returns Template analysis with extracted design properties
 */
export async function analyzeTemplateFromImage(
  pdfImageBase64: string
): Promise<TemplateAnalysis> {
  if (!isAIConfigured()) {
    console.warn("AI not configured, using default template");
    return DEFAULT_TEMPLATE;
  }

  const client = createClient();

  const systemPrompt = `You are an expert at analyzing resume document layouts and extracting visual design properties.
Your task is to analyze the provided resume image and extract its design characteristics.
Return ONLY valid JSON without any markdown formatting or code blocks.`;

  const userPrompt = `Analyze this resume image and extract its visual design properties.

Return a JSON object with the following structure:
{
  "layout": {
    "columns": 1 or 2,
    "headerStyle": "centered" | "left" | "right",
    "sectionSeparator": "line" | "space" | "none",
    "hasPhoto": true | false,
    "hasSidebar": true | false
  },
  "fonts": {
    "heading": { "family": "font name", "size": number (in pt), "weight": "normal" | "bold" | "light", "color": "#hex" },
    "subheading": { "family": "font name", "size": number, "weight": "normal" | "bold" | "light", "color": "#hex" },
    "body": { "family": "font name", "size": number, "weight": "normal" | "bold" | "light", "color": "#hex" },
    "accent": { "family": "font name", "size": number, "weight": "normal" | "bold" | "light", "color": "#hex" }
  },
  "colors": {
    "primary": "#hex (main heading color)",
    "secondary": "#hex (subheadings)",
    "accent": "#hex (links, highlights)",
    "text": "#hex (body text)",
    "background": "#hex (page background)",
    "lineColor": "#hex (separator lines)"
  },
  "spacing": {
    "margins": { "top": number, "right": number, "bottom": number, "left": number },
    "sectionGap": number,
    "itemGap": number,
    "lineHeight": number (1.0-2.0)
  },
  "sections": {
    "order": ["header", "summary", "experience", "education", "skills", etc.],
    "hasIcon": true | false,
    "bulletStyle": "disc" | "circle" | "square" | "dash" | "none"
  },
  "confidence": 0.0-1.0 (how confident you are in this analysis)
}

Focus on:
- Identifying the exact colors used (sample from the image)
- Detecting font sizes and weights
- Understanding the layout structure
- Noting any decorative elements

Return ONLY the JSON object, no explanation.`;

  try {
    const response = await withRetry(
      () =>
        client.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 2000,
          temperature: 0.2, // Low temperature for consistent analysis
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/png",
                    data: pdfImageBase64,
                  },
                },
                {
                  type: "text",
                  text: userPrompt,
                },
              ],
            },
          ],
        }),
      { timeBudgetMs: 30000 } // 30s budget for template analysis
    );

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new TemplateAnalysisError(
        "No response received from AI",
        "EMPTY_RESPONSE"
      );
    }

    // Parse JSON response
    const jsonText = textContent.text.trim();
    const analysis = JSON.parse(jsonText) as Partial<TemplateAnalysis>;

    // Merge with defaults for any missing fields
    return {
      layout: { ...DEFAULT_TEMPLATE.layout, ...analysis.layout },
      fonts: {
        heading: { ...DEFAULT_TEMPLATE.fonts.heading, ...analysis.fonts?.heading },
        subheading: { ...DEFAULT_TEMPLATE.fonts.subheading, ...analysis.fonts?.subheading },
        body: { ...DEFAULT_TEMPLATE.fonts.body, ...analysis.fonts?.body },
        accent: { ...DEFAULT_TEMPLATE.fonts.accent, ...analysis.fonts?.accent },
      },
      colors: { ...DEFAULT_TEMPLATE.colors, ...analysis.colors },
      spacing: {
        margins: { ...DEFAULT_TEMPLATE.spacing.margins, ...analysis.spacing?.margins },
        sectionGap: analysis.spacing?.sectionGap ?? DEFAULT_TEMPLATE.spacing.sectionGap,
        itemGap: analysis.spacing?.itemGap ?? DEFAULT_TEMPLATE.spacing.itemGap,
        lineHeight: analysis.spacing?.lineHeight ?? DEFAULT_TEMPLATE.spacing.lineHeight,
      },
      sections: { ...DEFAULT_TEMPLATE.sections, ...analysis.sections },
      confidence: analysis.confidence ?? 0.8,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Template analysis failed:", error);

    if (error instanceof TemplateAnalysisError) {
      throw error;
    }

    // Return default template on failure
    return {
      ...DEFAULT_TEMPLATE,
      confidence: 0.3,
      analyzedAt: new Date().toISOString(),
    };
  }
}

/**
 * Analyze template from extracted text structure
 *
 * This is a fallback method when image analysis is not available.
 * It infers template structure from the text content.
 *
 * @param extractedText - Raw text extracted from PDF
 * @returns Template analysis with inferred design properties
 */
export function analyzeTemplateFromText(extractedText: string): TemplateAnalysis {
  // Detect sections present in the text
  const textLower = extractedText.toLowerCase();
  const detectedSections: string[] = ["header"];

  if (textLower.includes("summary") || textLower.includes("objective") || textLower.includes("profile")) {
    detectedSections.push("summary");
  }
  if (textLower.includes("experience") || textLower.includes("employment") || textLower.includes("work history")) {
    detectedSections.push("experience");
  }
  if (textLower.includes("education") || textLower.includes("academic")) {
    detectedSections.push("education");
  }
  if (textLower.includes("skills") || textLower.includes("expertise") || textLower.includes("competencies")) {
    detectedSections.push("skills");
  }
  if (textLower.includes("project") || textLower.includes("portfolio")) {
    detectedSections.push("projects");
  }
  if (textLower.includes("certification") || textLower.includes("license")) {
    detectedSections.push("certifications");
  }
  if (textLower.includes("award") || textLower.includes("achievement") || textLower.includes("honor")) {
    detectedSections.push("awards");
  }

  // Check for bullet points to infer style
  const hasDashes = extractedText.includes(" - ") || extractedText.includes("\n-");
  const hasBullets = extractedText.includes("•") || extractedText.includes("●");
  const bulletStyle: "disc" | "dash" | "none" = hasBullets ? "disc" : hasDashes ? "dash" : "none";

  // Check for potential multi-column layout (text with lots of horizontal spacing)
  const lines = extractedText.split("\n");
  const longGapLines = lines.filter(line => line.includes("   ") && line.trim().length > 50);
  const hasSidebar = longGapLines.length > 5;

  return {
    layout: {
      columns: hasSidebar ? 2 : 1,
      headerStyle: "left",
      sectionSeparator: "line",
      hasPhoto: false,
      hasSidebar,
    },
    fonts: DEFAULT_TEMPLATE.fonts,
    colors: DEFAULT_TEMPLATE.colors,
    spacing: DEFAULT_TEMPLATE.spacing,
    sections: {
      order: detectedSections,
      hasIcon: false,
      bulletStyle,
    },
    confidence: 0.4, // Lower confidence for text-only analysis
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Validate a template analysis object
 */
export function isValidTemplateAnalysis(analysis: unknown): analysis is TemplateAnalysis {
  if (!analysis || typeof analysis !== "object") return false;

  const a = analysis as Partial<TemplateAnalysis>;

  return !!(
    a.layout &&
    a.fonts &&
    a.colors &&
    a.spacing &&
    a.sections &&
    typeof a.confidence === "number" &&
    typeof a.analyzedAt === "string"
  );
}
