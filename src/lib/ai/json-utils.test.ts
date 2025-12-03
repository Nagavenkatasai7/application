import { describe, it, expect } from "vitest";
import { repairJson, extractJsonFromResponse, parseAIJsonResponse } from "./json-utils";

describe("repairJson", () => {
  describe("unquoted property names", () => {
    it("should fix simple unquoted property names", () => {
      const input = '{score: 75, summary: "test"}';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ score: 75, summary: "test" });
    });

    it("should handle nested unquoted property names", () => {
      const input = '{outer: {inner: "value"}}';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ outer: { inner: "value" } });
    });

    it("should handle arrays with unquoted property names in objects", () => {
      const input = '{items: [{name: "a"}, {name: "b"}]}';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ items: [{ name: "a" }, { name: "b" }] });
    });
  });

  describe("single quotes", () => {
    it("should convert single quotes to double quotes", () => {
      const input = "{'key': 'value'}";
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ key: "value" });
    });

    it("should not break apostrophes in double-quoted strings", () => {
      const input = '{"message": "it\'s working"}';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ message: "it's working" });
    });

    it("should handle mixed quotes", () => {
      const input = "{'name': \"John's\"}";
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ name: "John's" });
    });
  });

  describe("trailing commas", () => {
    it("should remove trailing commas in objects", () => {
      const input = '{"a": 1, "b": 2,}';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ a: 1, b: 2 });
    });

    it("should remove trailing commas in arrays", () => {
      const input = '{"arr": [1, 2, 3,]}';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ arr: [1, 2, 3] });
    });

    it("should handle trailing commas with whitespace", () => {
      const input = `{
        "a": 1,
        "b": 2,
      }`;
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ a: 1, b: 2 });
    });
  });

  describe("newlines in strings - THE CRITICAL FIX", () => {
    it("should NOT corrupt JSON structure with newlines between properties", () => {
      // This is the exact case that was breaking
      const input = `{"score": 75,
"summary": "test"}`;
      const result = repairJson(input);
      const parsed = JSON.parse(result);
      expect(parsed.score).toBe(75);
      expect(parsed.summary).toBe("test");
    });

    it("should handle multiline JSON correctly", () => {
      const input = `{
  "score": 75,
  "summary": "This is a summary",
  "bullets": [
    {
      "original": "Did something",
      "improved": "Did something better"
    }
  ]
}`;
      const result = repairJson(input);
      const parsed = JSON.parse(result);
      expect(parsed.score).toBe(75);
      expect(parsed.bullets).toHaveLength(1);
    });

    it("should escape actual newlines INSIDE string values", () => {
      // This is valid: a string containing a literal newline character
      const input = '{"message": "line1\nline2"}';
      const result = repairJson(input);
      const parsed = JSON.parse(result);
      expect(parsed.message).toBe("line1\nline2");
    });

    it("should escape carriage returns INSIDE string values", () => {
      const input = '{"message": "line1\rline2"}';
      const result = repairJson(input);
      const parsed = JSON.parse(result);
      expect(parsed.message).toBe("line1\rline2");
    });

    it("should escape tabs INSIDE string values", () => {
      const input = '{"message": "col1\tcol2"}';
      const result = repairJson(input);
      const parsed = JSON.parse(result);
      expect(parsed.message).toBe("col1\tcol2");
    });

    it("should handle escaped backslashes in single-quoted strings", () => {
      const input = "{'path': 'C:\\\\Users'}";
      const result = repairJson(input);
      const parsed = JSON.parse(result);
      expect(parsed.path).toBe("C:\\Users");
    });

    it("should handle the exact bug scenario from production", () => {
      // This simulates the AI response that was failing
      const input = `{
  score: 75,
  summary: "Good resume",
  bullets: [
    {
      original: "Managed team",
      improved: "Led team of 5 engineers"
    }
  ]
}`;
      const result = repairJson(input);
      const parsed = JSON.parse(result);
      expect(parsed.score).toBe(75);
      expect(parsed.summary).toBe("Good resume");
      expect(parsed.bullets[0].original).toBe("Managed team");
    });
  });

  describe("JavaScript comments", () => {
    it("should remove line comments", () => {
      const input = `{
  "key": "value" // this is a comment
}`;
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ key: "value" });
    });

    it("should remove block comments", () => {
      const input = `{
  /* comment */
  "key": "value"
}`;
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ key: "value" });
    });

    it("should not remove comment-like text inside strings", () => {
      const input = '{"url": "http://example.com // path"}';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ url: "http://example.com // path" });
    });
  });

  describe("unclosed brackets", () => {
    it("should close unclosed braces", () => {
      const input = '{"key": "value"';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ key: "value" });
    });

    it("should close unclosed brackets in arrays", () => {
      // Realistic truncation - both ] and } are missing
      const input = '{"arr": [1, 2, 3';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ arr: [1, 2, 3] });
    });

    it("should close multiple unclosed brackets", () => {
      const input = '{"nested": {"arr": [1, 2';
      const result = repairJson(input);
      expect(JSON.parse(result)).toEqual({ nested: { arr: [1, 2] } });
    });
  });

  describe("complex real-world cases", () => {
    it("should handle typical Impact module response", () => {
      const input = `{
  score: 75,
  summary: "Good resume with some areas to improve",
  bullets: [
    {
      experienceId: "exp-1",
      experienceTitle: "Software Engineer",
      companyName: "Acme Corp",
      original: "Managed team",
      improved: "Led team of 5 engineers to deliver project 2 weeks early",
      metrics: ["5 engineers", "2 weeks early"],
      improvement: "major",
      explanation: "Added specific numbers and outcomes"
    },
  ],
  metricCategories: {
    percentage: 2,
    monetary: 1,
    time: 3,
    scale: 2,
    other: 0
  },
  suggestions: [
    {
      area: "Revenue metrics",
      recommendation: "Add dollar amounts for projects with business impact"
    },
  ]
}`;
      const result = repairJson(input);
      const parsed = JSON.parse(result);
      expect(parsed.score).toBe(75);
      expect(parsed.bullets).toHaveLength(1);
      expect(parsed.bullets[0].improvement).toBe("major");
      expect(parsed.metricCategories.percentage).toBe(2);
    });

    it("should handle typical Uniqueness module response", () => {
      const input = `{
  score: 82,
  factors: [
    {
      type: "skill_combination",
      title: "Technical + Business Skills",
      description: "Rare combination of engineering and MBA",
      rarity: "rare",
      evidence: ["MBA from top school", "10 years engineering"],
      suggestion: "Highlight this in cover letters"
    }
  ],
  summary: "Strong unique profile",
  differentiators: ["Technical depth", "Business acumen"],
  suggestions: []
}`;
      const result = repairJson(input);
      const parsed = JSON.parse(result);
      expect(parsed.score).toBe(82);
      expect(parsed.factors[0].rarity).toBe("rare");
    });
  });
});

describe("extractJsonFromResponse", () => {
  it("should extract JSON from markdown code block", () => {
    const input = `Here is the analysis:

\`\`\`json
{"score": 75, "summary": "Good"}
\`\`\``;
    const result = extractJsonFromResponse(input);
    expect(JSON.parse(result)).toEqual({ score: 75, summary: "Good" });
  });

  it("should extract JSON from code block without json tag", () => {
    const input = `Analysis:

\`\`\`
{"score": 75}
\`\`\``;
    const result = extractJsonFromResponse(input);
    expect(JSON.parse(result)).toEqual({ score: 75 });
  });

  it("should extract JSON without code block", () => {
    const input = 'Some text before {"score": 75} and after';
    const result = extractJsonFromResponse(input);
    expect(JSON.parse(result)).toEqual({ score: 75 });
  });

  it("should handle nested braces correctly", () => {
    const input = 'Text {"outer": {"inner": "value"}} more text';
    const result = extractJsonFromResponse(input);
    expect(JSON.parse(result)).toEqual({ outer: { inner: "value" } });
  });

  it("should handle braces inside strings", () => {
    const input = '{"message": "Use {name} as placeholder"}';
    const result = extractJsonFromResponse(input);
    expect(JSON.parse(result)).toEqual({ message: "Use {name} as placeholder" });
  });

  it("should remove BOM character", () => {
    const input = '\uFEFF{"key": "value"}';
    const result = extractJsonFromResponse(input);
    expect(JSON.parse(result)).toEqual({ key: "value" });
  });

  it("should handle escaped characters in strings during brace matching", () => {
    const input = 'Text {"message": "value with \\"escaped\\" quotes"} more';
    const result = extractJsonFromResponse(input);
    expect(JSON.parse(result)).toEqual({ message: 'value with "escaped" quotes' });
  });

  it("should handle escaped backslashes in strings", () => {
    const input = '{"path": "C:\\\\Users\\\\name"}';
    const result = extractJsonFromResponse(input);
    expect(JSON.parse(result)).toEqual({ path: "C:\\Users\\name" });
  });

  it("should fallback to first-to-last brace when balanced matching fails", () => {
    // Create a scenario where balanced matching might fail but first-to-last works
    const input = 'prefix {"key": "value"} suffix {"another": "object"}';
    const result = extractJsonFromResponse(input);
    // Should get the first complete JSON object
    expect(JSON.parse(result)).toEqual({ key: "value" });
  });

  it("should return original text when no JSON found", () => {
    const input = "No JSON here at all";
    const result = extractJsonFromResponse(input);
    expect(result).toBe("No JSON here at all");
  });
});

describe("parseAIJsonResponse", () => {
  it("should parse valid JSON", () => {
    const input = '{"score": 75}';
    const result = parseAIJsonResponse<{ score: number }>(input, "Test");
    expect(result.score).toBe(75);
  });

  it("should extract and repair JSON in one call", () => {
    const input = `Here's the result:
\`\`\`json
{
  score: 75,
  summary: "Good",
}
\`\`\``;
    const result = parseAIJsonResponse<{ score: number; summary: string }>(input, "Test");
    expect(result.score).toBe(75);
    expect(result.summary).toBe("Good");
  });

  it("should throw error with context for invalid JSON", () => {
    const input = "This is not JSON at all";
    expect(() => parseAIJsonResponse(input, "Test")).toThrow();
  });
});
