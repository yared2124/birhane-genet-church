/**
 * PDF Generator using pdf-lib.
 * Generates church certificates (Baptism, Marriage) with letterhead.
 * Saves to memory or disk for download.
 */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CertificateData {
  title: string;
  recipientName: string;
  recipientChristianName?: string;
  date: Date;
  churchName: string;
  priestName: string;
  certificateType: "BAPTISM" | "MARRIAGE";
  additionalInfo?: Record<string, string>;
}

export class CertificateGenerator {
  /**
   * Generate a certificate PDF
   * @param data - Certificate data
   * @returns PDF buffer
   */
  static async generate(data: CertificateData): Promise<Uint8Array> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page (A4 size)
    const page = pdfDoc.addPage([595.28, 841.89]); // A4: 595.28 x 841.89 points

    const { width, height } = page.getSize();

    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Draw border (decorative)
    page.drawRectangle({
      x: 40,
      y: 40,
      width: width - 80,
      height: height - 80,
      borderColor: rgb(0.4, 0.2, 0.6),
      borderWidth: 2,
    });

    // Draw inner border
    page.drawRectangle({
      x: 50,
      y: 50,
      width: width - 100,
      height: height - 100,
      borderColor: rgb(0.6, 0.3, 0.8),
      borderWidth: 1,
    });

    // Title
    const titleSize = 28;
    const titleText = data.title || `${data.certificateType} CERTIFICATE`;
    const titleWidth = boldFont.widthOfTextAtSize(titleText, titleSize);
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 120,
      size: titleSize,
      font: boldFont,
      color: rgb(0.4, 0.2, 0.6),
    });

    // Church name
    const churchSize = 16;
    const churchText = data.churchName || "Birhane Genet St. Mary Church";
    const churchWidth = boldFont.widthOfTextAtSize(churchText, churchSize);
    page.drawText(churchText, {
      x: (width - churchWidth) / 2,
      y: height - 160,
      size: churchSize,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Recipient name
    const nameSize = 22;
    const nameText = data.recipientName;
    const nameWidth = boldFont.widthOfTextAtSize(nameText, nameSize);
    page.drawText(nameText, {
      x: (width - nameWidth) / 2,
      y: height - 250,
      size: nameSize,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.3),
    });

    // Christian name (if provided)
    if (data.recipientChristianName) {
      const christianText = `(Christian Name: ${data.recipientChristianName})`;
      const christianSize = 14;
      const christianWidth = font.widthOfTextAtSize(
        christianText,
        christianSize,
      );
      page.drawText(christianText, {
        x: (width - christianWidth) / 2,
        y: height - 280,
        size: christianSize,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Additional info
    let yPos = height - 340;
    if (data.additionalInfo) {
      for (const [key, value] of Object.entries(data.additionalInfo)) {
        const infoText = `${key}: ${value}`;
        const infoWidth = font.widthOfTextAtSize(infoText, 12);
        page.drawText(infoText, {
          x: (width - infoWidth) / 2,
          y: yPos,
          size: 12,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPos -= 25;
      }
    }

    // Date
    const dateText = `Issued on: ${data.date.toLocaleDateString()}`;
    const dateWidth = font.widthOfTextAtSize(dateText, 12);
    page.drawText(dateText, {
      x: (width - dateWidth) / 2,
      y: yPos - 20,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Priest signature
    const signatureText = `Priest: ${data.priestName}`;
    const signatureWidth = font.widthOfTextAtSize(signatureText, 14);
    page.drawText(signatureText, {
      x: (width - signatureWidth) / 2,
      y: 120,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Seal/Stamp placeholder
    page.drawEllipse({
      x: width / 2,
      y: 160,
      width: 60,
      height: 60,
      borderColor: rgb(0.4, 0.2, 0.6),
      borderWidth: 2,
      color: rgb(0.95, 0.95, 0.95),
    });

    // Footer
    const footerText = "May God bless you and keep you.";
    const footerWidth = font.widthOfTextAtSize(footerText, 10);
    page.drawText(footerText, {
      x: (width - footerWidth) / 2,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    return await pdfDoc.save();
  }

  /**
   * Save PDF to file
   * @param data - Certificate data
   * @param filePath - Output file path
   */
  static async saveToFile(
    data: CertificateData,
    filePath: string,
  ): Promise<void> {
    const pdfBytes = await CertificateGenerator.generate(data);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, pdfBytes);
  }

  /**
   * Generate PDF and return as base64 string
   * @param data - Certificate data
   * @returns Base64 encoded PDF
   */
  static async toBase64(data: CertificateData): Promise<string> {
    const pdfBytes = await CertificateGenerator.generate(data);
    return Buffer.from(pdfBytes).toString("base64");
  }
}
