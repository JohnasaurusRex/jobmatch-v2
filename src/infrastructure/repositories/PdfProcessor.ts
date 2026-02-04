// src/infrastructure/repositories/PdfProcessor.ts
import { IPdfProcessor } from '../../domain/repositories/IPdfProcessor';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export class PdfProcessor implements IPdfProcessor {
  
  /**
   * Extracts text from a PDF buffer directly in memory.
   * optimized for Vercel serverless environment (no file writing).
   */
  async extractText(file: Buffer): Promise<string> {
    try {
      console.log('Starting PDF text extraction (in-memory)');
      console.log('File size:', file.length, 'bytes');

      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(file);

      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      const text = pdfData.text.trim();
      
      console.log('PDF processed successfully:');
      console.log('- Pages:', pdfData.numpages);
      console.log('- Text length:', text.length);

      return text;
    } catch (error) {
      console.error('Text extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${this.getErrorMessage(error)}`);
    }
  }

  async validatePdf(file: Buffer): Promise<boolean> {
    try {
      console.log('Validating PDF file');

      if (!this.isValidBuffer(file)) {
        console.log('Validation failed: Invalid buffer');
        return false;
      }

      if (!this.hasValidPdfHeader(file)) {
        console.log('Validation failed: Invalid PDF header');
        return false;
      }

      // Try parsing slightly to confirm validity
      const pdfParse = (await import('pdf-parse')).default;
      await pdfParse(file);
      
      return true;
    } catch (error) {
      console.warn('PDF validation failed:', error);
      return false;
    }
  }

  // Legacy cleanup method - kept for interface compatibility but does nothing now
  async cleanupOldFiles(): Promise<void> {
    // No-op since we don't save files anymore
    return Promise.resolve();
  }

  private isValidBuffer(file: Buffer): boolean {
    return Buffer.isBuffer(file) && file.length > 0;
  }

  private hasValidPdfHeader(file: Buffer): boolean {
    const header = file.subarray(0, 8).toString('ascii');
    // More robust check for PDF header which can be anywhere in first 1024 bytes technically,
    // but usually at 0. strict check at 0 is fine for most generated PDFs.
    return header.startsWith('%PDF');
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}