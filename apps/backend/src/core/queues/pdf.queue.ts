/**
 * BullMQ Queue for PDF generation jobs.
 * Generates certificates asynchronously.
 */
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { env } from "../../config/environment.js";
import {
  CertificateGenerator,
  type CertificateData,
} from "../utils/pdf-generator.js";
import path from "path";

const connection = new Redis(env.REDIS_URL);
export const PDF_QUEUE_NAME = "pdf-queue";

export const pdfQueue = new Queue(PDF_QUEUE_NAME, { connection });

interface PDFJobData {
  certificateData: CertificateData;
  outputPath?: string;
  requestId: string;
}

export const createPDFWorker = () => {
  const worker = new Worker(
    PDF_QUEUE_NAME,
    async (job) => {
      const { certificateData, outputPath, requestId } = job.data as PDFJobData;

      console.log(`Generating PDF for request ${requestId}`);

      try {
        if (outputPath) {
          await CertificateGenerator.saveToFile(certificateData, outputPath);
          return { success: true, path: outputPath, requestId };
        } else {
          const pdfBytes = await CertificateGenerator.generate(certificateData);
          return { success: true, pdfBytes, requestId };
        }
      } catch (error) {
        console.error(`PDF generation failed for request ${requestId}:`, error);
        throw error;
      }
    },
    { connection },
  );

  return worker;
};
