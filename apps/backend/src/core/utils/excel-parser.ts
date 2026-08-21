/**
 * Excel Parser for bulk imports.
 * Reads XLSX files and validates data against schemas.
 * Used by the Registrar for bulk member imports.
 */
import * as XLSX from "xlsx";
import { z } from "zod";

// Schema for member import
const ImportMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  christianName: z.string().optional(),
  gender: z.enum(["Male", "Female"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  job: z.string().optional(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "WIDOWED", "DIVORCED"])
    .optional(),
  isHeadOfHousehold: z.boolean().default(false),
  familyCode: z.string().optional(),
  confessorPriestName: z.string().optional(),
});

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{ row: number; field: string; message: string }>;
  data: any[];
}

export class ExcelParser {
  /**
   * Parse an Excel file and validate its contents
   * @param fileBuffer - Buffer of the Excel file
   * @param schema - Zod schema for validation
   * @returns ImportResult
   */
  static parseAndValidate<T>(
    fileBuffer: Buffer,
    schema: z.ZodSchema<T>,
  ): ImportResult {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: [],
      data: [],
    };

    rawData.forEach((row: any, index: number) => {
      try {
        const validated = schema.parse(row);
        result.data.push(validated);
        result.imported++;
      } catch (err) {
        result.success = false;
        if (err instanceof z.ZodError) {
          err.errors.forEach((e) => {
            result.errors.push({
              row: index + 2, // +2 because Excel rows start at 1 and header is row 1
              field: String(e.path[0]),
              message: e.message,
            });
          });
        }
      }
    });

    return result;
  }

  /**
   * Generate an error report Excel file
   * @param errors - Array of errors
   * @param originalData - Original imported data
   * @returns Buffer of the error report
   */
  static generateErrorReport(
    errors: Array<{ row: number; field: string; message: string }>,
  ): Buffer {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Row", "Field", "Error"],
      ...errors.map((e) => [e.row, e.field, e.message]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }

  /**
   * Download the Excel template for member import
   * @returns Buffer of the template file
   */
  static getMemberImportTemplate(): Buffer {
    const wb = XLSX.utils.book_new();
    const wsData = [
      [
        "firstName",
        "lastName",
        "christianName",
        "gender",
        "phone",
        "address",
        "job",
        "maritalStatus",
        "isHeadOfHousehold",
        "familyCode",
        "confessorPriestName",
      ],
      [
        "John",
        "Doe",
        "Yohannes",
        "Male",
        "0912345678",
        "Addis Ababa",
        "Teacher",
        "MARRIED",
        "TRUE",
        "FAM-001",
        "Abune Tekle",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }
}
