// unpdf is specifically designed for serverless/edge environments
// It handles PDF.js worker configuration automatically
import { extractText, getDocumentProxy } from "unpdf";

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
 * Uses unpdf which is optimized for serverless environments
 * @param buffer - PDF file as Buffer
 * @returns Parsed PDF data including text and metadata
 */
export async function parsePdf(buffer: Buffer): Promise<ParsedPdf> {
  console.log(`[PDF] Starting extraction, buffer size: ${buffer.length} bytes`);

  try {
    // Convert Buffer to Uint8Array for unpdf
    const uint8Array = new Uint8Array(buffer);

    // Extract text using unpdf (serverless-compatible)
    const { text, totalPages } = await extractText(uint8Array, {
      mergePages: true,
    });

    // Try to get metadata
    let info: ParsedPdf["info"] = {};
    try {
      const pdf = await getDocumentProxy(uint8Array);
      const metadata = await pdf.getMetadata();
      if (metadata?.info) {
        const pdfInfo = metadata.info as Record<string, unknown>;
        info = {
          title: pdfInfo.Title as string | undefined,
          author: pdfInfo.Author as string | undefined,
          creator: pdfInfo.Creator as string | undefined,
        };
      }
    } catch (metadataError) {
      console.warn("[PDF] Could not extract metadata:", metadataError);
      // Continue without metadata - text extraction is more important
    }

    // When mergePages is true, text is a string; otherwise it's an array
    const extractedText = Array.isArray(text) ? text.join("\n") : String(text);

    const result = {
      text: extractedText.trim(),
      numPages: totalPages || 0,
      info,
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
