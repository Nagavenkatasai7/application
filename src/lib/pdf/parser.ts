// pdf-parse v2 is configured as serverExternalPackages in next.config.ts
// This allows it to run as a native Node.js module
// v2 uses a class-based API with PDFParse class

import { PDFParse } from "pdf-parse";

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
 * @param buffer - PDF file as Buffer
 * @returns Parsed PDF data including text and metadata
 */
export async function parsePdf(buffer: Buffer): Promise<ParsedPdf> {
  let parser: PDFParse | null = null;

  try {
    console.log(`[PDF] Starting extraction, buffer size: ${buffer.length} bytes`);

    // pdf-parse v2 uses class-based API with data option for buffers
    parser = new PDFParse({ data: buffer });

    // Extract text content
    const textResult = await parser.getText();

    // Extract metadata
    const infoResult = await parser.getInfo();

    const result = {
      text: textResult.text?.trim() || "",
      numPages: textResult.total || 0,
      info: {
        title: infoResult.info?.Title as string | undefined,
        author: infoResult.info?.Author as string | undefined,
        creator: infoResult.info?.Creator as string | undefined,
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
  } finally {
    // Always destroy the parser to free resources
    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.error("[PDF] Error destroying parser:", destroyError);
      }
    }
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
