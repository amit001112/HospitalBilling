import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { BillWithItems } from "@shared/schema";

interface BillViewProps {
  bill: BillWithItems;
  onClose: () => void;
}

export default function BillView({ bill, onClose }: BillViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: string) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <>
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={handlePrint} className="bg-medical-green hover:bg-green-700">
          <Printer className="mr-2 w-4 h-4" />
          Print
        </Button>
      </div>
      
      <div className="p-8 print-section">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 print-bill-title">Lifeline Emergency Care</h1>
          <p className="text-gray-600 print-text-regular">Hope Hospital Mor, Linebazar, Purnea, Bihar 854301</p>
          <p className="text-gray-600 print-text-regular">Phone: +91 6299253497, +91 7367039852 | Email: lifelineemergencycare@gmail.com</p>
        </div>

        {/* Patient Details Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 print-header-sub">Patient Details:</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-gray-600 print-text-regular space-y-1">
              <p className="font-medium text-gray-900 print-text-regular">
                {bill.patient.firstName} {bill.patient.lastName}
              </p>
              <p className="print-text-regular">Patient ID: P{bill.patient.id.toString().padStart(6, '0')}</p>
              {bill.patient.fatherHusbandName && (
                <p className="print-text-regular">Father/Husband: {bill.patient.fatherHusbandName}</p>
              )}
              <p className="print-text-regular">Age: {bill.patient.age} years | Gender: {bill.patient.gender.charAt(0).toUpperCase() + bill.patient.gender.slice(1)}</p>
              <p className="print-text-regular">Phone: {bill.patient.phone}</p>
              {bill.patient.email && <p className="print-text-regular">Email: {bill.patient.email}</p>}
              {bill.patient.address && <p className="print-text-regular">Address: {bill.patient.address}</p>}
            </div>
            <div className="text-gray-600 print-text-regular space-y-1">
              {bill.patient.emergencyContact && (
                <p className="print-text-regular">Emergency Contact: {bill.patient.emergencyContact}</p>
              )}
              {bill.patient.bloodGroup && (
                <p className="print-text-regular">Blood Group: {bill.patient.bloodGroup}</p>
              )}
              {bill.patient.admissionDateTime && (
                <p className="print-text-regular">
                  Admission: {new Date(bill.patient.admissionDateTime).toLocaleString()}
                </p>
              )}
              {bill.patient.dischargeDateTime && (
                <p className="print-text-regular">
                  Discharge: {new Date(bill.patient.dischargeDateTime).toLocaleString()}
                </p>
              )}
              {bill.patient.medicalHistory && (
                <div className="mt-2">
                  <p className="font-medium print-text-regular">Medical History:</p>
                  <p className="print-text-regular text-sm">{bill.patient.medicalHistory}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bill Details Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 print-header-sub">Bill Details:</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-gray-600 print-text-regular space-y-1">
              <p className="print-text-regular"><span className="font-medium">Bill ID:</span> {bill.billNumber}</p>
              <p className="print-text-regular"><span className="font-medium">Date:</span> {new Date(bill.billDate).toLocaleDateString()}</p>
              <p className="print-text-regular"><span className="font-medium">Time:</span> {new Date(bill.billDate).toLocaleTimeString()}</p>
            </div>
            <div className="text-gray-600 print-text-regular space-y-1">
              <p className="print-text-regular"><span className="font-medium">Status:</span> 
                <span className={`ml-1 capitalize ${
                  bill.status === 'paid' ? 'text-green-600' : 
                  bill.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {bill.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left print-header-sub">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-center print-header-sub">Qty</th>
                <th className="border border-gray-300 px-4 py-2 text-right print-header-sub">Rate (₹)</th>
                <th className="border border-gray-300 px-4 py-2 text-right print-header-sub">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-4 py-2 print-table-entry">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center print-table-entry">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right print-table-entry">
                    {parseFloat(item.rate).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right print-table-entry">
                    {parseFloat(item.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-80">
            <table className="w-full">
              <tr>
                <td className="px-4 py-2 text-right font-medium print-text-regular">Subtotal:</td>
                <td className="px-4 py-2 text-right print-text-regular">{formatCurrency(bill.subtotal)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-right font-medium print-text-regular">Discount:</td>
                <td className="px-4 py-2 text-right print-text-regular">{formatCurrency(bill.discount)}</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td className="px-4 py-2 text-right font-bold text-lg print-total-amount">Total Amount:</td>
                <td className="px-4 py-2 text-right font-bold text-lg text-medical-blue print-total-amount">
                  {formatCurrency(bill.total)}
                </td>
              </tr>
            </table>
          </div>
        </div>

        {bill.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 print-header-sub">Notes:</h4>
            <p className="text-gray-600 print-text-regular">{bill.notes}</p>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
          <p className="print-text-regular">Thank you for choosing Lifeline Emergency Care</p>
          <p className="mt-2 print-text-regular">This is a computer-generated bill and requires no signature.</p>
        </div>
      </div>
    </>
  );
}
