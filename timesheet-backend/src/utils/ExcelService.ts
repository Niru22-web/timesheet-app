import * as XLSX from 'xlsx';
import { Response } from 'express';

export class ExcelService {
  /**
   * Parse Excel buffer to JSON
   */
  static parseExcel(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  /**
   * Export JSON data to Excel and send as response
   */
  static exportToExcel(res: Response, data: any[], fileName: string, sheetName: string = 'Sheet1') {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns (rough implementation)
    const objectMaxLength: number[] = [];
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      keys.forEach((key, i) => {
        let maxLen = key.length;
        data.forEach(row => {
          const val = row[key] ? String(row[key]) : '';
          if (val.length > maxLen) maxLen = val.length;
        });
        objectMaxLength[i] = maxLen + 2;
      });
      
      const wscols = objectMaxLength.map(w => ({ width: w }));
      worksheet['!cols'] = wscols;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

  /**
   * Generate Excel template for download
   */
  static generateTemplate(res: Response, columns: string[], fileName: string) {
    const templateData = [
      columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {})
    ];
    this.exportToExcel(res, templateData, fileName, 'Template');
  }
}
