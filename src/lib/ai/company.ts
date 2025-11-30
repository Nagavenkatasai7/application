import Anthropic from "@anthropic-ai/sdk";
import {
  getAIConfig,
  isAIConfigured,
  getModelConfig,
} from "./config";
import { parseAIJsonResponse, JSON_OUTPUT_INSTRUCTIONS } from "./json-utils";
import type {
  CompanyResearchResult,
  CultureDimension,
  InterviewTip,
  Competitor,
} from "@/lib/validations/company";

/**
 * System prompt for company research
 */
export const COMPANY_RESEARCH_SYSTEM_PROMPT = `You are an expert career research analyst with comprehensive knowledge of companies, industries, and hiring practices. Your specialty is providing actionable company intelligence that helps job seekers prepare for interviews and understand company culture.

Your task is to provide a comprehensive company research report that helps candidates prepare for job applications and interviews at the specified company.

## Research Framework

### 1. Company Overview
Provide essential company information:
- Industry and market position
- Company history and founding
- Size and geographic presence
- Mission and vision
- Recent news or developments

### 2. Culture Analysis
Evaluate the company culture across key dimensions (1-5 scale):
- Work-Life Balance: Flexibility, hours, remote work policies
- Innovation: R&D investment, new product development, creative freedom
- Collaboration: Team dynamics, cross-functional work, communication
- Career Growth: Promotion paths, learning opportunities, mentorship
- Diversity & Inclusion: DEI initiatives, representation, inclusive policies
- Compensation & Benefits: Pay competitiveness, perks, equity
- Management Quality: Leadership style, transparency, employee trust
- Job Security: Company stability, layoff history, growth trajectory

### 3. Glassdoor-Style Insights
Synthesize employee sentiment:
- Overall satisfaction rating (1-5)
- Common pros mentioned by employees
- Common cons or challenges
- CEO approval sentiment
- Recommendation to friends

### 4. Funding & Business Status
For startups/growth companies:
- Funding stage and total raised
- Notable investors
- Estimated valuation
- Business model stability

### 5. Competitive Landscape
Identify key competitors and market position:
- Direct competitors
- Competitive advantages
- Market challenges

### 6. Interview Preparation
Provide actionable interview guidance:
- Common interview topics and focus areas
- Technical preparation tips
- Behavioral question themes
- Cultural fit indicators
- Questions candidates should ask

### 7. Values Alignment
Help candidates demonstrate fit:
- Core company values
- How to demonstrate alignment in interviews
- Red flags to avoid

## Output Format

Return a JSON object with this structure:
{
  "companyName": "Official company name",
  "industry": "Primary industry",
  "summary": "2-3 sentence company overview",
  "founded": "Year or approximate",
  "headquarters": "City, Country",
  "employeeCount": "Approximate range",
  "website": "URL if known",

  "cultureDimensions": [
    {
      "dimension": "Work-Life Balance",
      "score": 3.5,
      "description": "Brief explanation of this rating"
    }
  ],
  "cultureOverview": "Summary of company culture",

  "glassdoorData": {
    "overallRating": 3.8,
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2"],
    "recommendToFriend": "75%",
    "ceoApproval": "80%"
  },

  "fundingData": {
    "stage": "Series B",
    "totalRaised": "$50 million",
    "valuation": "$200 million",
    "lastRound": {
      "round": "Series B",
      "amount": "$30 million",
      "date": "2023",
      "investors": ["Investor 1", "Investor 2"]
    },
    "notableInvestors": ["Investor 1", "Investor 2"]
  },

  "competitors": [
    {
      "name": "Competitor name",
      "relationship": "Direct competitor in X"
    }
  ],

  "interviewTips": [
    {
      "category": "preparation",
      "tip": "Specific actionable tip",
      "priority": "high"
    }
  ],
  "commonInterviewTopics": ["Topic 1", "Topic 2", "Topic 3"],

  "coreValues": ["Value 1", "Value 2", "Value 3"],
  "valuesAlignment": [
    {
      "value": "Company value",
      "howToDemo": "How to demonstrate this in an interview"
    }
  ],

  "keyTakeaways": ["Key insight 1", "Key insight 2", "Key insight 3"]
}

IMPORTANT: Valid values for "category": "preparation", "technical", "behavioral", "cultural_fit", "questions_to_ask"
Valid values for "priority": "high", "medium", "low"
Score values must be numbers between 1 and 5.

Be specific and actionable. Provide honest assessments based on publicly available information. If certain information is not available or uncertain, indicate that rather than fabricating details.` + JSON_OUTPUT_INSTRUCTIONS;

/**
 * Build the user prompt for company research
 */
export function buildCompanyResearchPrompt(companyName: string): string {
  return `Research the following company and provide a comprehensive intelligence report:

**Company:** ${companyName}

Please provide:
1. Company overview and basic information
2. Culture analysis across 8 key dimensions (1-5 ratings)
3. Glassdoor-style employee insights (pros, cons, ratings)
4. Funding and business status
5. Competitive landscape
6. Interview preparation tips (prioritized by importance)
7. Core values and how to demonstrate alignment
8. Key takeaways for job seekers

Return your analysis as a JSON object matching the specified schema.`;
}

/**
 * Error thrown when company research fails
 */
export class CompanyResearchError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "CompanyResearchError";
  }
}

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
 * Validate interview tip category
 */
function validateInterviewCategory(category?: string): InterviewTip["category"] {
  const validCategories = ["preparation", "technical", "behavioral", "cultural_fit", "questions_to_ask"] as const;
  if (category && validCategories.includes(category as typeof validCategories[number])) {
    return category as InterviewTip["category"];
  }
  return "preparation";
}

/**
 * Validate priority level
 */
function validatePriority(priority?: string): "high" | "medium" | "low" {
  const validPriorities = ["high", "medium", "low"] as const;
  if (priority && validPriorities.includes(priority as typeof validPriorities[number])) {
    return priority as typeof validPriorities[number];
  }
  return "medium";
}

/**
 * Research a company and generate comprehensive intelligence
 */
export async function researchCompany(
  companyName: string
): Promise<CompanyResearchResult> {
  // Check if AI is configured
  if (!isAIConfigured()) {
    throw new CompanyResearchError(
      "AI is not configured. Please set your API key.",
      "AI_NOT_CONFIGURED"
    );
  }

  // Validate company name
  if (!companyName || companyName.trim().length === 0) {
    throw new CompanyResearchError(
      "Company name is required.",
      "INVALID_INPUT"
    );
  }

  const modelConfig = getModelConfig("companyResearch");
  const userPrompt = buildCompanyResearchPrompt(companyName.trim());

  try {
    const client = createClient();

    const response = await client.messages.create({
      model: modelConfig.model,
      max_tokens: 4000,
      temperature: 0.5, // Balanced for creativity and consistency
      system: COMPANY_RESEARCH_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new CompanyResearchError(
        "No response received from AI",
        "EMPTY_RESPONSE"
      );
    }

    // Parse JSON response using shared utility with state-machine repair
    let rawResult: {
      companyName?: string;
      industry?: string;
      summary?: string;
      founded?: string;
      headquarters?: string;
      employeeCount?: string;
      website?: string;
      cultureDimensions?: Array<{
        dimension?: string;
        score?: number;
        description?: string;
      }>;
      cultureOverview?: string;
      glassdoorData?: {
        overallRating?: number;
        pros?: string[];
        cons?: string[];
        recommendToFriend?: string;
        ceoApproval?: string;
      };
      fundingData?: {
        stage?: string;
        totalRaised?: string;
        valuation?: string;
        lastRound?: {
          round?: string;
          amount?: string;
          date?: string;
          investors?: string[];
        };
        notableInvestors?: string[];
      };
      competitors?: Array<{
        name?: string;
        relationship?: string;
      }>;
      interviewTips?: Array<{
        category?: string;
        tip?: string;
        priority?: string;
      }>;
      commonInterviewTopics?: string[];
      coreValues?: string[];
      valuesAlignment?: Array<{
        value?: string;
        howToDemo?: string;
      }>;
      keyTakeaways?: string[];
    };

    try {
      rawResult = parseAIJsonResponse<typeof rawResult>(textContent.text, "Company");
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : "Unknown parse error";
      throw new CompanyResearchError(
        `Failed to parse AI response: ${errorMessage}`,
        "PARSE_ERROR",
        parseError
      );
    }

    // Transform culture dimensions
    const cultureDimensions: CultureDimension[] = (rawResult.cultureDimensions || []).map((d) => ({
      dimension: d.dimension || "Unknown",
      score: Math.max(1, Math.min(5, d.score || 3)),
      description: d.description || "",
    }));

    // Transform competitors
    const competitors: Competitor[] = (rawResult.competitors || []).map((c) => ({
      name: c.name || "Unknown",
      relationship: c.relationship || "Competitor",
    }));

    // Transform interview tips
    const interviewTips: InterviewTip[] = (rawResult.interviewTips || []).map((t) => ({
      category: validateInterviewCategory(t.category),
      tip: t.tip || "",
      priority: validatePriority(t.priority),
    }));

    // Transform values alignment
    const valuesAlignment = (rawResult.valuesAlignment || []).map((v) => ({
      value: v.value || "",
      howToDemo: v.howToDemo || "",
    }));

    const result: CompanyResearchResult = {
      companyName: rawResult.companyName || companyName,
      industry: rawResult.industry || "Unknown",
      summary: rawResult.summary || "Company research complete.",
      founded: rawResult.founded || null,
      headquarters: rawResult.headquarters || null,
      employeeCount: rawResult.employeeCount || null,
      website: rawResult.website || null,

      cultureDimensions,
      cultureOverview: rawResult.cultureOverview || "",

      glassdoorData: {
        overallRating: rawResult.glassdoorData?.overallRating
          ? Math.max(1, Math.min(5, rawResult.glassdoorData.overallRating))
          : null,
        pros: rawResult.glassdoorData?.pros || [],
        cons: rawResult.glassdoorData?.cons || [],
        recommendToFriend: rawResult.glassdoorData?.recommendToFriend || null,
        ceoApproval: rawResult.glassdoorData?.ceoApproval || null,
      },

      fundingData: {
        stage: rawResult.fundingData?.stage || null,
        totalRaised: rawResult.fundingData?.totalRaised || null,
        valuation: rawResult.fundingData?.valuation || null,
        lastRound: rawResult.fundingData?.lastRound ? {
          round: rawResult.fundingData.lastRound.round || "",
          amount: rawResult.fundingData.lastRound.amount,
          date: rawResult.fundingData.lastRound.date,
          investors: rawResult.fundingData.lastRound.investors,
        } : null,
        notableInvestors: rawResult.fundingData?.notableInvestors || [],
      },

      competitors,
      interviewTips,
      commonInterviewTopics: rawResult.commonInterviewTopics || [],
      coreValues: rawResult.coreValues || [],
      valuesAlignment,
      keyTakeaways: rawResult.keyTakeaways || [],
    };

    return result;
  } catch (error) {
    // Re-throw CompanyResearchError as-is
    if (error instanceof CompanyResearchError) {
      throw error;
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new CompanyResearchError(
          "Invalid API key",
          "AUTH_ERROR",
          error
        );
      }
      if (error.status === 429) {
        throw new CompanyResearchError(
          "Rate limit exceeded. Please try again.",
          "RATE_LIMIT",
          error
        );
      }
      throw new CompanyResearchError(
        `AI API error: ${error.message}`,
        "API_ERROR",
        error
      );
    }

    // Generic error
    throw new CompanyResearchError(
      "Failed to research company",
      "UNKNOWN_ERROR",
      error
    );
  }
}
