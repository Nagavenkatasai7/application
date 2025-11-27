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
    // pdf-parse v2 uses class-based API with data option for buffers
    parser = new PDFParse({ data: buffer });

    // Extract text content
    const textResult = await parser.getText();

    // Extract metadata
    const infoResult = await parser.getInfo();

    return {
      text: textResult.text?.trim() || "",
      numPages: textResult.total || 0,
      info: {
        title: infoResult.info?.Title as string | undefined,
        author: infoResult.info?.Author as string | undefined,
        creator: infoResult.info?.Creator as string | undefined,
      },
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  } finally {
    // Always destroy the parser to free resources
    if (parser) {
      await parser.destroy();
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
