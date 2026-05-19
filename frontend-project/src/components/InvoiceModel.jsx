import React, { useRef } from 'react';
import { Modal } from './UI';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Printer, Download, X, Truck, Wrench, Calendar, DollarSign, User, Hash, CreditCard } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, record }) => {
  const invoiceRef = useRef(null);

  if (!record) return null;

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    const originalContents = document.body.innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${record.plateNumber?.plateNumber || 'N/A'}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
            .invoice-container { box-shadow: none; border: 1px solid #ddd; }
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            background: #f0f0f0;
            padding: 20px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .invoice-header {
            background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .invoice-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .invoice-subtitle {
            font-size: 14px;
            opacity: 0.9;
          }
          .invoice-body {
            padding: 30px;
          }
          .company-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          .company-details h3 {
            color: #0ea5e9;
            margin-bottom: 5px;
          }
          .company-details p {
            font-size: 12px;
            color: #6b7280;
            margin: 3px 0;
          }
          .invoice-info {
            text-align: right;
          }
          .invoice-number {
            font-size: 18px;
            font-weight: bold;
            color: #0ea5e9;
          }
          .customer-section {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .customer-title {
            font-size: 14px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
          }
          .customer-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .customer-detail {
            font-size: 13px;
          }
          .customer-detail span:first-child {
            font-weight: 600;
            color: #6b7280;
          }
          .service-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .service-table th {
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
          }
          .service-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          .totals-section {
            margin-top: 20px;
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: flex-end;
            gap: 30px;
            margin: 10px 0;
            padding: 10px;
          }
          .total-label {
            font-weight: 600;
            color: #6b7280;
          }
          .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: #10b981;
          }
          .grand-total {
            background: #f0fdf4;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
          }
          .payment-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-partial { background: #fed7aa; color: #9a3412; }
          .status-unpaid { background: #fee2e2; color: #991b1b; }
          .invoice-footer {
            background: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
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
  const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(record._id).slice(-6)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" title="Service Invoice">
      {/* Print Button */}
      <div className="flex justify-end gap-2 mb-4 no-print">
        <button onClick={handlePrint} className="flex items-center gap-2 btn btn-primary">
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
        <button onClick={onClose} className="flex items-center gap-2 btn btn-outline">
          <X className="w-4 h-4" />
          Close
        </button>
      </div>

      {/* Invoice Content */}
      <div ref={invoiceRef} className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-title">SERVICE INVOICE</div>
          <div className="invoice-subtitle">Car Repair & Maintenance</div>
        </div>

        {/* Body */}
        <div className="invoice-body">
          {/* Company Info */}
          <div className="company-info">
            <div className="company-details">
              <h3>SmartPark Workshop</h3>
              <p>Rubavu District, Western Province</p>
              <p>Rwanda</p>
              <p>Tel: +250 788 123 456</p>
              <p>Email: smartpark@crpms.rw</p>
            </div>
            <div className="invoice-info">
              <div className="invoice-number">INVOICE #{invoiceNumber}</div>
              <p>Date: {formatDate(record.serviceDate)}</p>
              <p>Due Date: {formatDate(record.paymentDate)}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="customer-section">
            <div className="customer-title">CUSTOMER INFORMATION</div>
            <div className="customer-details">
              <div className="customer-detail">
                <span>Vehicle Plate:</span> {record.plateNumber?.plateNumber}
              </div>
              <div className="customer-detail">
                <span>Vehicle Model:</span> {record.plateNumber?.model}
              </div>
              <div className="customer-detail">
                <span>Vehicle Type:</span> {record.plateNumber?.type}
              </div>
              <div className="customer-detail">
                <span>Manufacturing Year:</span> {record.plateNumber?.manufacturingYear}
              </div>
              <div className="customer-detail">
                <span>Driver Phone:</span> {record.plateNumber?.driverPhone}
              </div>
              <div className="customer-detail">
                <span>Mechanic:</span> {record.doneBy}
              </div>
            </div>
          </div>

          {/* Service Details Table */}
          <table className="service-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Service Description</th>
                <th>Service Code</th>
                <th>Service Date</th>
                <th>Amount (RWF)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>{record.serviceCode?.serviceName}</td>
                <td>{record.serviceCode?.serviceCode}</td>
                <td>{formatDate(record.serviceDate)}</td>
                <td>{formatCurrency(servicePrice)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals-section">
            <div className="total-row">
              <span className="total-label">Subtotal:</span>
              <span>{formatCurrency(servicePrice)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Amount Paid:</span>
              <span className="text-green-600">{formatCurrency(amountPaid)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Remaining Balance:</span>
              <span className={remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                {formatCurrency(remainingBalance)}
              </span>
            </div>
            <div className="grand-total">
              <div className="total-row" style={{ justifyContent: 'space-between' }}>
                <span className="total-label">TOTAL DUE:</span>
                <span className="total-amount">{formatCurrency(remainingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span className={`payment-status ${getStatusClass(record.paymentStatus)}`}>
              Payment Status: {record.paymentStatus}
            </span>
          </div>

          {/* Notes */}
          <div style={{ marginTop: '30px', padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#92400e' }}>
              <strong>Note:</strong> Thank you for choosing SmartPark. For any inquiries, please contact our support team.
              Payment is due within 7 days of invoice date. Late payments may incur additional charges.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>Thank you for trusting SmartPark with your vehicle!</p>
          <p style={{ marginTop: '5px' }}>This is a computer-generated invoice. No signature required.</p>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;