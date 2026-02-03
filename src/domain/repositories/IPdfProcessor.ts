export interface IPdfProcessor {
  extractText(file: Buffer): Promise<string>;
  validatePdf(file: Buffer): Promise<boolean>;
}
