import React, { useRef } from 'react';
import { Modal } from './UI';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Printer, X, Download, Mail, Phone, MapPin, Globe } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, record }) => {
  const invoiceRef = useRef(null);

  if (!record) return null;

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>INVOICE - ${record.plateNumber?.plateNumber || 'N/A'}</title>
        <style>
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none;
            }
            .invoice-wrapper {
              box-shadow: none;
              margin: 0;
              padding: 0;
            }
            .invoice-header {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
          }
          
          .invoice-wrapper {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
          }
          
          /* Header Section */
          .invoice-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            padding: 40px;
            position: relative;
          }
          
          .invoice-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.1"><path fill="white" d="M10,10 L90,10 L90,90 L10,90 Z"/></svg>');
            background-size: 60px;
          }
          
          .company-brand {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
          }
          
          .logo-area {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .logo-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          
          .company-tagline {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 5px;
          }
          
          .invoice-badge {
            text-align: right;
          }
          
          .invoice-badge h2 {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 2px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .invoice-number {
            font-size: 14px;
            opacity: 0.7;
            margin-top: 5px;
          }
          
          /* Company Info */
          .company-info {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            position: relative;
            z-index: 1;
          }
          
          .info-block {
            font-size: 12px;
            opacity: 0.8;
          }
          
          .info-block p {
            margin: 5px 0;
          }
          
          /* Body Section */
          .invoice-body {
            padding: 40px;
          }
          
          /* Bill To Section */
          .bill-section {
            background: #f8fafc;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #3b82f6;
            margin-bottom: 15px;
          }
          
          .bill-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          
          .detail-item {
            font-size: 14px;
          }
          
          .detail-label {
            color: #64748b;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .detail-value {
            font-weight: 600;
            color: #1e293b;
          }
          
          /* Service Table */
          .service-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
          }
          
          .service-table th {
            background: #f1f5f9;
            padding: 15px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .service-table td {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }
          
          .service-name {
            font-weight: 600;
            color: #1e293b;
          }
          
          .amount-cell {
            text-align: right;
            font-weight: 600;
            color: #10b981;
          }
          
          /* Totals Section */
          .totals-section {
            margin-top: 30px;
            border-top: 2px solid #e2e8f0;
            padding-top: 20px;
          }
          
          .totals-table {
            width: 350px;
            margin-left: auto;
          }
          
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          
          .totals-label {
            color: #64748b;
            font-size: 14px;
          }
          
          .totals-value {
            font-weight: 600;
            color: #1e293b;
          }
          
          .grand-total-row {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #e2e8f0;
            font-weight: 800;
            font-size: 18px;
          }
          
          .grand-total-row .totals-value {
            color: #10b981;
            font-size: 22px;
          }
          
          /* Payment Status Badge */
          .payment-status {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-paid {
            background: #d1fae5;
            color: #065f46;
          }
          
          .status-partial {
            background: #fed7aa;
            color: #9a3412;
          }
          
          .status-unpaid {
            background: #fee2e2;
            color: #991b1b;
          }
          
          /* Notes Section */
          .notes-section {
            background: #fef3c7;
            border-radius: 12px;
            padding: 15px 20px;
            margin-top: 30px;
          }
          
          .notes-title {
            font-size: 12px;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 8px;
          }
          
          .notes-text {
            font-size: 12px;
            color: #92400e;
            line-height: 1.5;
          }
          
          /* Footer */
          .invoice-footer {
            background: #f8fafc;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-text {
            font-size: 12px;
            color: #64748b;
            margin: 5px 0;
          }
          
          .signature-line {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
          }
          
          .signature-item {
            font-size: 11px;
            color: #94a3b8;
          }
          
          /* Buttons */
          .action-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-bottom: 20px;
          }
          
          .btn-action {
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            border: none;
          }
          
          .btn-print {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
          }
          
          .btn-print:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -10px #3b82f6;
          }
          
          .btn-close {
            background: #f1f5f9;
            color: #475569;
          }
          
          .btn-close:hover {
            background: #e2e8f0;
          }
          
          .btn-download {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Paid': return 'status-paid';
      case 'Partial': return 'status-partial';
      default: return 'status-unpaid';
    }
  };

  const servicePrice = record.serviceCode?.servicePrice || 0;
  const amountPaid = record.amountPaid || 0;
  const remainingBalance = servicePrice - amountPaid;
  const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(record._id).slice(-6)}`;
  const tax = servicePrice * 0.18; // 18% VAT for Rwanda
  const totalWithTax = servicePrice + tax;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" title="Service Invoice">
      {/* Action Buttons */}
      <div className="action-buttons no-print">
        <button onClick={handlePrint} className="btn-action btn-print">
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
        <button className="btn-action btn-download">
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button onClick={onClose} className="btn-action btn-close">
          <X className="w-4 h-4" />
          Close
        </button>
      </div>

      {/* Invoice Content */}
      <div ref={invoiceRef} className="invoice-wrapper">
        {/* Header */}
        <div className="invoice-header">
          <div className="company-brand">
            <div className="logo-area">
              <div className="logo-icon">🔧</div>
              <div>
                <div className="company-name">SmartPark</div>
                <div className="company-tagline">Car Repair & Maintenance</div>
              </div>
            </div>
            <div className="invoice-badge">
              <h2>INVOICE</h2>
              <div className="invoice-number">#{invoiceNumber}</div>
            </div>
          </div>
          
          <div className="company-info">
            <div className="info-block">
              <p>📍 Rubavu District, Western Province</p>
              <p>🇷🇼 Rwanda</p>
            </div>
            <div className="info-block">
              <p>📞 +250 788 123 456</p>
              <p>✉️ smartpark@crpms.rw</p>
            </div>
            <div className="info-block">
              <p>🕐 Mon-Sat: 8:00 AM - 6:00 PM</p>
              <p>⭐ Trusted since 2020</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="invoice-body">
          {/* Bill To Section */}
          <div className="bill-section">
            <div className="section-title">📋 BILL TO</div>
            <div className="bill-details">
              <div className="detail-item">
                <div className="detail-label">Vehicle Information</div>
                <div className="detail-value">
                  {record.plateNumber?.plateNumber} - {record.plateNumber?.model}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Vehicle Type</div>
                <div className="detail-value">{record.plateNumber?.type}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Year of Manufacture</div>
                <div className="detail-value">{record.plateNumber?.manufacturingYear}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Driver Phone</div>
                <div className="detail-value">{record.plateNumber?.driverPhone}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Mechanic Assigned</div>
                <div className="detail-value">{record.doneBy}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Service Date</div>
                <div className="detail-value">{formatDate(record.serviceDate)}</div>
              </div>
            </div>
          </div>

          {/* Service Details Table */}
          <div className="section-title">🔧 SERVICE DETAILS</div>
          <table className="service-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Service Code</th>
                <th>Service Description</th>
                <th>Service Date</th>
                <th>Amount (RWF)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01</td>
                <td><span className="service-code">{record.serviceCode?.serviceCode}</span></td>
                <td><span className="service-name">{record.serviceCode?.serviceName}</span></td>
                <td>{formatDate(record.serviceDate)}</td>
                <td className="amount-cell">{formatCurrency(servicePrice)}</td>
              </tr>
            </tbody>
          </table>

          {/* Additional Notes if any */}
          {record.serviceCode?.serviceDescription && (
            <div style={{ marginTop: '-15px', marginBottom: '20px', fontSize: '12px', color: '#64748b' }}>
              📝 Note: {record.serviceCode.serviceDescription}
            </div>
          )}

          {/* Totals Section */}
          <div className="totals-section">
            <table className="totals-table">
              <tbody>
                <tr className="totals-row">
                  <td className="totals-label">Subtotal:</td>
                  <td className="totals-value">{formatCurrency(servicePrice)}</td>
                </tr>
                <tr className="totals-row">
                  <td className="totals-label">VAT (18%):</td>
                  <td className="totals-value">{formatCurrency(tax)}</td>
                </tr>
                <tr className="totals-row">
                  <td className="totals-label">Total Amount:</td>
                  <td className="totals-value">{formatCurrency(totalWithTax)}</td>
                </tr>
                <tr className="totals-row">
                  <td className="totals-label">Amount Paid:</td>
                  <td className="totals-value" style={{ color: '#10b981' }}>- {formatCurrency(amountPaid)}</td>
                </tr>
                <tr className="totals-row grand-total-row">
                  <td className="totals-label">BALANCE DUE:</td>
                  <td className="totals-value">{formatCurrency(remainingBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Status */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span className={`payment-status ${getStatusClass(record.paymentStatus)}`}>
              {record.paymentStatus === 'Paid' ? '✅ FULLY PAID' : 
               record.paymentStatus === 'Partial' ? '⚠️ PARTIALLY PAID' : '❌ UNPAID'}
            </span>
          </div>

          {/* Payment Terms */}
          <div className="notes-section">
            <div className="notes-title">📌 PAYMENT TERMS</div>
            <div className="notes-text">
              Payment is due within 7 days from the invoice date. Late payments may incur additional charges.
              For any inquiries, please contact our billing department at billing@smartpark.rw or call +250 788 123 456.
            </div>
          </div>

          {/* Additional Notes */}
          <div className="notes-section" style={{ marginTop: '15px', background: '#e0f2fe' }}>
            <div className="notes-title" style={{ color: '#0369a1' }}>💡 THANK YOU</div>
            <div className="notes-text" style={{ color: '#0369a1' }}>
              Thank you for choosing SmartPark! We appreciate your business and look forward to serving you again.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="signature-line">
            <div className="signature-item">
              <div>_____________________</div>
              <div>Customer Signature</div>
            </div>
            <div className="signature-item">
              <div>_____________________</div>
              <div>Authorized Signature</div>
            </div>
            <div className="signature-item">
              <div>_____________________</div>
              <div>SmartPark Stamp</div>
            </div>
          </div>
          <div className="footer-text" style={{ marginTop: '20px' }}>
            This is a computer-generated invoice. No signature required for digital payments.
          </div>
          <div className="footer-text">
            © 2024 SmartPark Workshop | Rubavu District, Western Province, Rwanda
          </div>
          <div className="footer-text" style={{ fontSize: '10px', marginTop: '10px' }}>
            VAT Registration: RW123456789 | TIN: 1234567890
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
