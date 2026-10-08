// pdf-parse ships no types. Importing the inner module skips the package's
// index.js, which runs a debug self-test that reads a sample file at import
// time and crashes in a serverless bundle.
declare module "pdf-parse/lib/pdf-parse" {
  interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  }

  export default function pdf(
    data: Buffer,
    options?: Record<string, unknown>,
  ): Promise<PdfParseResult>;
}
