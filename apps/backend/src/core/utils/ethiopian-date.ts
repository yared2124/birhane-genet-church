/**
 * Ethiopian Calendar utilities.
 * Converts between Ethiopian and Gregorian dates.
 * Used for reports, member birth dates, and church events.
 */
export class EthiopianDate {
  /**
   * Convert Ethiopian date to Gregorian Date object
   * @param ethiopianYear - Ethiopian year (e.g., 2016)
   * @param ethiopianMonth - Ethiopian month (1-13)
   * @param ethiopianDay - Ethiopian day (1-30)
   * @returns JavaScript Date object
   */
  static toGregorian(
    ethiopianYear: number,
    ethiopianMonth: number,
    ethiopianDay: number,
  ): Date {
    // Ethiopian calendar offset: 7 years, 8 months difference
    // Using known reference point: 2016-09-11 Ethiopian = 2024-05-19 Gregorian
    const gregorianYear = ethiopianYear + 7;
    const gregorianMonth = ethiopianMonth + 7;
    // This is a simplified conversion - for production, use a proper library
    // like 'ethiopian-calendar' or 'moment-ethiopian'
    return new Date(gregorianYear, gregorianMonth - 1, ethiopianDay + 8);
  }

  /**
   * Convert Gregorian Date to Ethiopian date
   * @param date - JavaScript Date object
   * @returns { year: number, month: number, day: number }
   */
  static toEthiopian(date: Date): { year: number; month: number; day: number } {
    // Simplified conversion
    const ethiopianYear = date.getFullYear() - 7;
    const ethiopianMonth = date.getMonth() - 6;
    return {
      year: ethiopianYear,
      month: ethiopianMonth > 0 ? ethiopianMonth : ethiopianMonth + 13,
      day: date.getDate() - 8,
    };
  }

  /**
   * Format Ethiopian date as string
   * @param date - Date object
   * @param format - 'full' or 'short'
   * @returns Formatted date string (e.g., "2016/05/12")
   */
  static format(date: Date, format: "full" | "short" = "short"): string {
    const eth = EthiopianDate.toEthiopian(date);
    if (format === "short") {
      return `${eth.year}/${String(eth.month).padStart(2, "0")}/${String(eth.day).padStart(2, "0")}`;
    }
    return `${eth.year} ዓ.ም. ${eth.month} ${eth.day}`;
  }
}
