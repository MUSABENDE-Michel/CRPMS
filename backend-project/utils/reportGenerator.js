import PDFDocument from 'pdfkit';
import ExcelJS from 'xlsx';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

// Generate Service Bill PDF
export const generateServiceBillPDF = async (records, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(path.join(__dirname, 'temp', filename));

      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Service Bill Report', { align: 'center' });
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Table headers
      const headers = ['Plate', 'Service', 'Service Date', 'Price', 'Paid', 'Status', 'Paid Date', 'Done By'];
      let y = doc.y;
      const colWidths = [60, 80, 80, 60, 60, 70, 80, 80];
      let x = 50;

      headers.forEach((header, i) => {
        doc.fontSize(9).font('Helvetica-Bold').text(header, x, y, { width: colWidths[i] });
        x += colWidths[i];
      });

      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
      y += 25;

      // Data rows
      records.forEach((record) => {
        if (y > 750) {
          doc.addPage();
          y = 50;
        }

        x = 50;
        doc.fontSize(8).font('Helvetica');
        
        const rowData = [
          record.carPlate || 'N/A',
          record.serviceName || 'N/A',
          new Date(record.serviceDate).toLocaleDateString(),
          record.servicePrice || '0',
          record.amountPaid || '0',
          record.paymentStatus || 'N/A',
          new Date(record.paymentDate).toLocaleDateString(),
          record.doneBy || 'N/A',
        ];

        rowData.forEach((data, i) => {
          doc.text(String(data), x, y, { width: colWidths[i] });
          x += colWidths[i];
        });

        y += 20;
      });

      doc.end();

      stream.on('finish', () => {
        resolve(filename);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Generate Payment Report PDF
export const generatePaymentReportPDF = async (records, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(path.join(__dirname, 'temp', filename));

      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Daily Payment Report', { align: 'center' });
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Table headers
      const headers = ['Plate', 'Service', 'Service Date', 'Amount', 'Received By'];
      let y = doc.y;
      const colWidths = [80, 100, 100, 100, 130];
      let x = 50;

      headers.forEach((header, i) => {
        doc.fontSize(9).font('Helvetica-Bold').text(header, x, y, { width: colWidths[i] });
        x += colWidths[i];
      });

      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
      y += 25;

      // Data rows
      let totalAmount = 0;
      records.forEach((record) => {
        if (y > 750) {
          doc.addPage();
          y = 50;
        }

        x = 50;
        doc.fontSize(8).font('Helvetica');
        
        totalAmount += record.amountPaid || 0;
        const rowData = [
          record.carPlate || 'N/A',
          record.serviceName || 'N/A',
          new Date(record.serviceDate).toLocaleDateString(),
          String(record.amountPaid || '0'),
          record.receivedBy || 'N/A',
        ];

        rowData.forEach((data, i) => {
          doc.text(String(data), x, y, { width: colWidths[i] });
          x += colWidths[i];
        });

        y += 20;
      });

      // Total
      doc.moveTo(50, y).lineTo(550, y).stroke();
      doc.fontSize(10).font('Helvetica-Bold').text(`Total: ${totalAmount}`, 350, y + 10);

      doc.end();

      stream.on('finish', () => {
        resolve(filename);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Generate Excel file
export const generateExcelReport = async (records, filename, columns) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Add headers
    const headers = Object.keys(columns);
    worksheet.addRow(headers);

    // Add data
    records.forEach((record) => {
      const row = headers.map(header => record[columns[header]] || '');
      worksheet.addRow(row);
    });

    // Format header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    worksheet.getRow(1).font.color = { argb: 'FFFFFFFF' };

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    const filepath = path.join(__dirname, 'temp', filename);
    await workbook.xlsx.writeFile(filepath);
    return filename;
  } catch (error) {
    throw error;
  }
};

// Generate CSV file
export const generateCSVReport = async (records, filename, columns) => {
  try {
    const headers = Object.keys(columns);
    let csv = headers.join(',') + '\n';

    records.forEach((record) => {
      const row = headers.map(header => `"${record[columns[header]] || ''}"`).join(',');
      csv += row + '\n';
    });

    const filepath = path.join(__dirname, 'temp', filename);
    fs.writeFileSync(filepath, csv);
    return filename;
  } catch (error) {
    throw error;
  }
};
