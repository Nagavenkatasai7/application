/**
 * Shared JSON utilities for handling AI responses
 *
 * AI responses may contain:
 * - Unquoted property names: {key: "value"}
 * - Single quotes: {'key': 'value'}
 * - Trailing commas: {a: 1,}
 * - JavaScript comments (line and block style)
 * - Unescaped newlines in strings (rare, but possible)
 * - Truncated JSON (unclosed brackets/braces)
 */

/**
 * Remove JavaScript-style comments from the string.
 * Handles both // line comments and /* block comments
 * Uses state tracking to avoid removing "comments" inside strings.
 */
function removeJsComments(str: string): string {
  let result = "";
  let i = 0;
  let inString = false;
  let escapeNext = false;

  while (i < str.length) {
    const char = str[i];
    const nextChar = str[i + 1];

    if (escapeNext) {
      result += char;
      escapeNext = false;
      i++;
      continue;
    }

    if (char === "\\") {
      result += char;
      escapeNext = true;
      i++;
      continue;
    }

    // Track string state (double quotes only at this point)
    if (char === '"') {
      inString = !inString;
      result += char;
      i++;
      continue;
    }

    // Handle comments only outside strings
    if (!inString) {
      // Line comment
      if (char === "/" && nextChar === "/") {
        // Skip until end of line
        while (i < str.length && str[i] !== "\n") {
          i++;
        }
        continue;
      }

      // Block comment
      if (char === "/" && nextChar === "*") {
        i += 2; // Skip /*
        while (i < str.length - 1) {
          if (str[i] === "*" && str[i + 1] === "/") {
            i += 2; // Skip */
            break;
          }
          i++;
        }
        continue;
      }
    }

    result += char;
    i++;
  }

  return result;
}

/**
 * Fix single quotes to double quotes for JSON string delimiters.
 * Uses state tracking to avoid breaking apostrophes inside double-quoted strings.
 */
function fixSingleQuotes(str: string): string {
  let result = "";
  let i = 0;
  let inDoubleString = false;
  let inSingleString = false;
  let escapeNext = false;

  while (i < str.length) {
    const char = str[i];

    if (escapeNext) {
      result += char;
      escapeNext = false;
      i++;
      continue;
    }

    if (char === "\\") {
      result += char;
      escapeNext = true;
      i++;
      continue;
    }

    // Track double-quoted strings
    if (char === '"' && !inSingleString) {
      inDoubleString = !inDoubleString;
      result += char;
      i++;
      continue;
    }

    // Handle single quotes - convert to double quotes if used as string delimiter
    if (char === "'" && !inDoubleString) {
      inSingleString = !inSingleString;
      result += '"'; // Convert to double quote
      i++;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

/**
 * Escape control characters (newlines, tabs, etc.) that appear inside JSON strings.
 * Uses proper state tracking to ONLY modify content INSIDE strings.
 *
 * This fixes the critical bug where the old regex-based approach was matching
 * content BETWEEN strings and corrupting the JSON structure.
 */
function escapeControlCharsInStrings(str: string): string {
  let result = "";
  let i = 0;
  let inString = false;
  let escapeNext = false;

  while (i < str.length) {
    const char = str[i];

    if (escapeNext) {
      result += char;
      escapeNext = false;
      i++;
      continue;
    }

    if (char === "\\") {
      result += char;
      escapeNext = true;
      i++;
      continue;
    }

    // Track string boundaries
    if (char === '"') {
      inString = !inString;
      result += char;
      i++;
      continue;
    }

    // Escape control characters ONLY inside strings
    if (inString) {
      if (char === "\n") {
        result += "\\n";
        i++;
        continue;
      }
      if (char === "\r") {
        result += "\\r";
        i++;
        continue;
      }
      if (char === "\t") {
        result += "\\t";
        i++;
        continue;
      }
    }

    result += char;
    i++;
  }

  return result;
}

/**
 * Close unclosed brackets and braces for truncated JSON responses.
 * Uses state tracking to correctly count brackets/braces outside of strings.
 */
function closeUnclosedBrackets(str: string): string {
  let repaired = str;

  // Count brackets and braces (accounting for strings)
  let openBraces = 0;
  let closeBraces = 0;
  let openBrackets = 0;
  let closeBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") openBraces++;
      if (char === "}") closeBraces++;
      if (char === "[") openBrackets++;
      if (char === "]") closeBrackets++;
    }
  }

  // Add missing closing brackets/braces
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    repaired += "]";
  }
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += "}";
  }

  return repaired;
}

/**
 * Attempt to repair common JSON issues in AI responses.
 *
 * Order of operations is critical:
 * 1. Remove JavaScript comments (must be first, before any string manipulation)
 * 2. Fix unquoted property names (regex safe - operates outside strings)
 * 3. Fix single quotes to double quotes (uses state tracking)
 * 4. Remove trailing commas (regex safe - operates outside strings)
 * 5. Escape control characters in strings (NEW - state-machine approach)
 * 6. Close unclosed brackets/braces (for truncated responses)
 */
export function repairJson(jsonStr: string): string {
  let repaired = jsonStr;

  // Step 1: Remove JavaScript comments (// and /* */)
  // Must be done BEFORE any other processing
  repaired = removeJsComments(repaired);

  // Step 2: Fix unquoted property names
  // Pattern: { or , followed by whitespace/newlines, then unquoted identifier, then :
  // Multiple passes to catch nested objects
  for (let i = 0; i < 3; i++) {
    repaired = repaired.replace(
      /([{,][\s\n\r]*)([a-zA-Z_][a-zA-Z0-9_]*)([\s\n\r]*:)/gm,
      '$1"$2"$3'
    );
  }

  // Step 3: Fix single quotes to double quotes
  // This needs careful handling to not break existing double-quoted strings
  repaired = fixSingleQuotes(repaired);

  // Step 4: Remove trailing commas before ] or }
  repaired = repaired.replace(/,[\s\n\r]*]/g, "]");
  repaired = repaired.replace(/,[\s\n\r]*}/g, "}");

  // Step 5: Fix unescaped control characters in strings
  // This uses a proper state-machine approach (THE CRITICAL FIX)
  repaired = escapeControlCharsInStrings(repaired);

  // Step 6: Close unclosed brackets/braces (for truncated responses)
  repaired = closeUnclosedBrackets(repaired);

  return repaired;
}

/**
 * Extract JSON from AI response - handles various formats Claude might return.
 *
 * Strategies:
 * 1. Extract from markdown code blocks (```json ... ```)
 * 2. Extract raw JSON with balanced brace matching
 * 3. Last resort: first to last brace
 */
export function extractJsonFromResponse(text: string): string {
  // Clean the text first - remove any BOM or control characters
  const cleanText = text.replace(/^\uFEFF/, "").trim();

  // Strategy 1: Try to extract JSON from markdown code block (end-anchored)
  const jsonBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)```\s*$/);
  if (jsonBlockMatch) {
    const extracted = jsonBlockMatch[1].trim();
    if (extracted.startsWith("{") && extracted.endsWith("}")) {
      return extracted;
    }
  }

  // Strategy 2: Try non-anchored match for code block
  const jsonBlockMatch2 = cleanText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonBlockMatch2) {
    const extracted = jsonBlockMatch2[1].trim();
    if (extracted.startsWith("{") && extracted.endsWith("}")) {
      return extracted;
    }
  }

  // Strategy 3: Find JSON object with balanced brace matching
  const startIndex = cleanText.indexOf("{");
  if (startIndex !== -1) {
    let braceCount = 0;
    let endIndex = -1;
    let inString = false;
    let escapeNext = false;

    for (let i = startIndex; i < cleanText.length; i++) {
      const char = cleanText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") braceCount++;
        if (char === "}") braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex !== -1) {
      return cleanText.substring(startIndex, endIndex + 1);
    }
  }

  // Strategy 4: Last resort - try to find any valid JSON structure
  const lastBrace = cleanText.lastIndexOf("}");
  const firstBrace = cleanText.indexOf("{");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleanText.substring(firstBrace, lastBrace + 1);
  }

  return cleanText;
}

/**
 * Parse JSON from AI response with automatic extraction and repair.
 * Returns the parsed object or throws an error with detailed context.
 */
export function parseAIJsonResponse<T>(
  text: string,
  moduleName: string
): T {
  const rawJsonStr = extractJsonFromResponse(text);
  const jsonStr = repairJson(rawJsonStr);

  console.log(`[${moduleName}] Extracted JSON length:`, rawJsonStr.length);
  console.log(`[${moduleName}] Repaired JSON (first 200 chars):`, jsonStr.substring(0, 200));

  try {
    return JSON.parse(jsonStr) as T;
  } catch (parseError) {
    console.error(`[${moduleName}] JSON parse error:`, parseError);
    console.error(`[${moduleName}] Raw JSON (first 500 chars):`, rawJsonStr.substring(0, 500));
    console.error(`[${moduleName}] Repaired JSON (first 500 chars):`, jsonStr.substring(0, 500));
    throw parseError;
  }
}

/**
 * Standard JSON output instructions to append to system prompts.
 * This helps Claude return properly formatted JSON.
 */
export const JSON_OUTPUT_INSTRUCTIONS = `

## JSON Output Requirements

CRITICAL: Your response must be valid JSON that can be parsed by JSON.parse().

Rules:
1. ALL property names MUST be double-quoted: "score" not score
2. ALL string values MUST be double-quoted: "high" not high
3. NO trailing commas after the last item in arrays or objects
4. NO comments (// or /* */) anywhere in the JSON
5. Numbers and booleans are NOT quoted: 75 not "75", true not "true"
6. null values are written as: null (not "null")

Return ONLY the JSON object. No markdown code blocks. No text before or after the JSON.`;
