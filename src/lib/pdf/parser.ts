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
    parser = new PDFParse({ data: buffer });

    // Get text content
    const textResult = await parser.getText();

    // Get info/metadata
    const infoResult = await parser.getInfo();

    return {
      text: textResult.text.trim(),
      numPages: infoResult.total,
      info: {
        title: infoResult.info?.Title,
        author: infoResult.info?.Author,
        creator: infoResult.info?.Creator,
      },
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  } finally {
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
