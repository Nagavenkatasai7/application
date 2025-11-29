// pdf-parse is dynamically imported to avoid serverless bundling issues
// This ensures the route loads successfully even if pdf-parse fails to initialize

export interface ParsedPdf {
  text: string;
  numPages: number;
  info: {
    title?: string;
    author?: string;
    creator?: string;
  };
}

/**
 * Parse a PDF buffer and extract text content
 * Uses dynamic import to avoid bundling issues on Vercel serverless
 * @param buffer - PDF file as Buffer
 * @returns Parsed PDF data including text and metadata
 */
export async function parsePdf(buffer: Buffer): Promise<ParsedPdf> {
  console.log(`[PDF] Starting extraction, buffer size: ${buffer.length} bytes`);

  try {
    // Dynamic import to avoid bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");

    // pdf-parse v1 style API (default export is a function)
    const data = await pdfParse(buffer);

    const result = {
      text: data.text?.trim() || "",
      numPages: data.numpages || 0,
      info: {
        title: data.info?.Title as string | undefined,
        author: data.info?.Author as string | undefined,
        creator: data.info?.Creator as string | undefined,
      },
    };

    console.log(
      `[PDF] Extraction successful, text length: ${result.text.length}, pages: ${result.numPages}`
    );

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[PDF] Extraction failed: ${errorMessage}`);

    // Throw with more context for debugging
    throw new Error(`PDF extraction failed: ${errorMessage}`);
  }
}

/**
 * Extract text from a PDF file
 * @param buffer - PDF file as Buffer
 * @returns Extracted text content
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parsed = await parsePdf(buffer);
  return parsed.text;
}
