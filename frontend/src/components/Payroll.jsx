import React, { useState, useEffect } from 'react';
import { payrollApi, staffApi } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Payroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [formData, setFormData] = useState({
    staffId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 0,
    totalWorkingDays: 0,
    totalWorkingHours: 0,
    deductions: 0,
    bonuses: 0,
    allowances: 0,
    notes: ''
  });

  useEffect(() => {
    loadPayroll();
    loadStaff();
    loadStats();
  }, [selectedMonth, selectedYear]);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getPayrollByMonth(selectedMonth, selectedYear);
      setPayroll(data);
    } catch (error) {
      console.error('Error loading payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const data = await staffApi.getAllStaff();
      setStaff(data.filter(s => s.isActive));
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setStaffLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await payrollApi.getPayrollStats(selectedYear);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      await payrollApi.generatePayroll(selectedMonth, selectedYear);
      setShowGenerateModal(false);
      loadPayroll();
      loadStats();
      alert(`Payroll generated successfully for ${getMonthName(selectedMonth)} ${selectedYear}`);
    } catch (error) {
      console.error('Error generating payroll:', error);
      alert('Error generating payroll. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.staffId || !formData.basicSalary || !formData.totalWorkingDays || !formData.totalWorkingHours) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate working hours
    const maxPossibleHours = formData.totalWorkingDays * 24; // Maximum possible hours in a day
    if (formData.totalWorkingHours > maxPossibleHours) {
      alert(`Working hours (${formData.totalWorkingHours}) cannot exceed ${maxPossibleHours} hours for ${formData.totalWorkingDays} days`);
      return;
    }

    // Validate working days
    if (formData.totalWorkingDays > 31) {
      alert('Working days cannot exceed 31 days in a month');
      return;
    }

    // Calculate expected values for verification
    const standardHoursPerDay = 8;
    const regularHours = Math.min(formData.totalWorkingHours, formData.totalWorkingDays * standardHoursPerDay);
    const overtimeHours = Math.max(0, formData.totalWorkingHours - (formData.totalWorkingDays * standardHoursPerDay));
    
    const regularPay = (regularHours / (formData.totalWorkingDays * standardHoursPerDay)) * formData.basicSalary;
    const overtimePay = overtimeHours * 1000;
    const grossPay = regularPay + overtimePay + (formData.bonuses || 0) + (formData.allowances || 0);
    const expectedNetPay = grossPay - (formData.deductions || 0);

    console.log('=== FRONTEND FORM SUBMISSION DEBUG ===');
    console.log('Form Data:', formData);
    console.log('Calculated Values:');
    console.log('- Regular Hours:', regularHours);
    console.log('- Overtime Hours:', overtimeHours);
    console.log('- Regular Pay:', regularPay);
    console.log('- Overtime Pay:', overtimePay);
    console.log('- Gross Pay:', grossPay);
    console.log('- Expected Net Pay:', expectedNetPay);
    console.log('=====================================');
    
    try {
      // Show confirmation with calculated values
      const confirmMessage = `Please confirm payroll details:\n\n` +
        `Staff: ${staff.find(s => s._id === formData.staffId)?.firstName} ${staff.find(s => s._id === formData.staffId)?.lastName}\n` +
        `Month: ${getMonthName(formData.month)} ${formData.year}\n` +
        `Working Days: ${formData.totalWorkingDays}\n` +
        `Total Hours: ${formData.totalWorkingHours}\n` +
        `Basic Salary: LKR ${formData.basicSalary?.toLocaleString()}\n` +
        `Regular Pay: LKR ${regularPay.toFixed(2)}\n` +
        `Overtime Pay: LKR ${overtimePay.toFixed(2)}\n` +
        `Bonuses: LKR ${formData.bonuses?.toLocaleString() || '0'}\n` +
        `Allowances: LKR ${formData.allowances?.toLocaleString() || '0'}\n` +
        `Gross Pay: LKR ${grossPay.toFixed(2)}\n` +
        `Deductions: LKR ${formData.deductions?.toLocaleString() || '0'}\n` +
        `Expected Net Pay: LKR ${expectedNetPay.toFixed(2)}\n\n` +
        `Do you want to proceed?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }

      await payrollApi.createOrUpdatePayroll(formData);
      
      // Verify the saved payroll matches our calculation
      const savedPayroll = await payrollApi.getPayrollByMonth(formData.month, formData.year);
      const currentRecord = savedPayroll.find(p => p.staffId._id === formData.staffId);
      
      if (currentRecord) {
        console.log('=== PAYROLL VERIFICATION ===');
        console.log('Frontend Expected Values:');
        console.log('- Regular Pay:', regularPay.toFixed(2));
        console.log('- Overtime Pay:', overtimePay.toFixed(2));
        console.log('- Gross Pay:', grossPay.toFixed(2));
        console.log('- Net Pay:', expectedNetPay.toFixed(2));
        console.log('Backend Saved Values:');
        console.log('- Regular Pay:', currentRecord.regularPay?.toFixed(2) || 'N/A');
        console.log('- Overtime Pay:', currentRecord.overtimePay?.toFixed(2) || 'N/A');
        console.log('- Gross Pay:', currentRecord.grossPay?.toFixed(2) || 'N/A');
        console.log('- Net Pay:', currentRecord.netPay?.toFixed(2) || 'N/A');
        
        // Check for discrepancies
        const regularPayDiff = Math.abs(regularPay - (currentRecord.regularPay || 0));
        const overtimePayDiff = Math.abs(overtimePay - (currentRecord.overtimePay || 0));
        const grossPayDiff = Math.abs(grossPay - (currentRecord.grossPay || 0));
        const netPayDiff = Math.abs(expectedNetPay - (currentRecord.netPay || 0));
        
        if (regularPayDiff > 0.01 || overtimePayDiff > 0.01 || grossPayDiff > 0.01 || netPayDiff > 0.01) {
          console.warn('⚠️ CALCULATION DISCREPANCY DETECTED!');
          console.warn('Regular Pay Diff:', regularPayDiff);
          console.warn('Overtime Pay Diff:', overtimePayDiff);
          console.warn('Gross Pay Diff:', grossPayDiff);
          console.warn('Net Pay Diff:', netPayDiff);
          alert(`⚠️ Calculation discrepancy detected!\n\nFrontend Net Pay: LKR ${expectedNetPay.toFixed(2)}\nBackend Net Pay: LKR ${currentRecord.netPay?.toFixed(2) || 'N/A'}\n\nCheck console for details.`);
        } else {
          console.log('✅ All calculations match perfectly!');
        }
        console.log('=============================');
      }
      
      setShowEditModal(false);
      resetForm();
      loadPayroll();
      loadStats();
      alert('Payroll saved successfully!');
    } catch (error) {
      console.error('Error creating/updating payroll:', error);
      alert('Error saving payroll. Please try again.');
    }
  };

  const handleEdit = (payrollRecord) => {
    setSelectedPayroll(payrollRecord);
    
    // Get the current staff member's basic salary
    const currentStaff = staff.find(s => s._id === payrollRecord.staffId._id);
    const currentBasicSalary = currentStaff?.basicSalary || payrollRecord.basicSalary || 0;
    
    setFormData({
      staffId: payrollRecord.staffId._id,
      month: payrollRecord.month,
      year: payrollRecord.year,
      basicSalary: currentBasicSalary,
      totalWorkingDays: payrollRecord.totalWorkingDays,
      totalWorkingHours: payrollRecord.totalWorkingHours,
      deductions: payrollRecord.deductions,
      bonuses: payrollRecord.bonuses,
      allowances: payrollRecord.allowances,
      notes: payrollRecord.notes
    });
    setShowEditModal(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await payrollApi.updatePayrollStatus(id, newStatus);
      loadPayroll();
      loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const handleRecalculate = async (id) => {
    try {
      await payrollApi.recalculatePayroll(id);
      loadPayroll();
      loadStats();
      alert('Payroll recalculated successfully');
    } catch (error) {
      console.error('Error recalculating payroll:', error);
      alert('Error recalculating payroll. Please try again.');
    }
  };

  const handleRefreshMonth = async () => {
    try {
      await payrollApi.refreshPayrollForMonth(selectedMonth, selectedYear);
      loadPayroll();
      loadStats();
      alert('All payroll records for this month have been refreshed with attendance data');
    } catch (error) {
      console.error('No payroll records found for this month:', error);
      alert('No payroll records found for this month. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (payroll.length === 0) {
        alert('No payroll data available to download. Please generate or add payroll records first.');
        return;
      }

      // Check if jsPDF is available
      if (typeof jsPDF === 'undefined') {
        alert('jsPDF library is not available. Please install it with: npm install jspdf');
        return;
      }

      // Check if autoTable plugin is available
      if (typeof autoTable === 'undefined') {
        alert('jspdf-autotable plugin is not available. Please install it with: npm install jspdf-autotable');
        return;
      }

      // Show loading message
      alert('Generating PDF... Please wait.');

      // Create new PDF document
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: `Payroll Report - ${getMonthName(selectedMonth)} ${selectedYear}`,
        subject: 'Monthly Payroll Summary',
        author: 'Wildlife Safari Management System',
        creator: 'Payroll System'
      });

      // --- Modern Header ---
      doc.setFillColor(34, 197, 94); // Green accent
      doc.rect(0, 0, 210, 36, 'F');
      doc.setFillColor(31, 41, 55); // Dark gray
      doc.rect(0, 36, 210, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYROLL REPORT', 12, 24);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      doc.text(`${getMonthName(selectedMonth)} ${selectedYear}`, 12, 32);
      doc.setFontSize(10);
      doc.text('Wildlife Safari Management System', 198, 24, { align: 'right' });
      doc.setTextColor(180, 255, 210);
      doc.text('Automated Payroll Summary', 198, 32, { align: 'right' });

      // --- Info Section ---
      doc.setFillColor(243, 244, 246); // Light gray
      doc.rect(10, 50, 190, 18, 'F');
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Generated:', 14, 58);
      doc.setFont('helvetica', 'normal');
      doc.text(`${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 38, 58);
      doc.setFont('helvetica', 'bold');
      doc.text('Period:', 14, 66);
      doc.setFont('helvetica', 'normal');
      doc.text(`${getMonthName(selectedMonth)} 1 - ${getMonthName(selectedMonth)} ${new Date(selectedYear, selectedMonth, 0).getDate()}, ${selectedYear}`, 32, 66);

      // --- Modern Summary Cards ---
      const totalStaff = payroll.length;
      const totalWorkingHours = payroll.reduce((sum, record) => sum + (record.totalWorkingHours || 0), 0);
      const totalNetPay = payroll.reduce((sum, record) => sum + (record.netPay || 0), 0);
      const totalOvertimeHours = payroll.reduce((sum, record) => sum + Math.max(0, record.totalWorkingHours - (record.totalWorkingDays * 8)), 0);
      const summaryBoxes = [
        { label: 'Total Staff', value: totalStaff.toString(), color: [34, 197, 94] },
        { label: 'Working Hours', value: `${totalWorkingHours.toFixed(1)} hrs`, color: [59, 130, 246] },
        { label: 'Overtime Hours', value: `${totalOvertimeHours.toFixed(1)} hrs`, color: [245, 158, 11] },
        { label: 'Total Net Pay', value: `LKR ${totalNetPay.toLocaleString()}`, color: [168, 85, 247] }
      ];
      let boxX = 15;
      summaryBoxes.forEach((box, idx) => {
        doc.setFillColor(...box.color);
        doc.roundedRect(boxX, 75, 45, 18, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(box.label, boxX + 22.5, 83, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(box.value, boxX + 22.5, 92, { align: 'center' });
        boxX += 48;
      });
      
      // --- Modern Table ---
      const tableColumn = [
        "Staff", "Working Days", "Total Hours", "Overtime Hours",
        "Basic Salary", "Overtime Pay", "Bonuses", "Allowances",
        "Deductions", "Gross Pay", "Net Pay"
      ];
      const tableRows = payroll.map(record => {
        const overtimeHours = Math.max(0, record.totalWorkingHours - (record.totalWorkingDays * 8));
        const overtimePay = overtimeHours * 1000;
        const grossPay = (record.regularPay || 0) + overtimePay + (record.bonuses || 0) + (record.allowances || 0);
        return [
          `${record.staffId.firstName} ${record.staffId.lastName}`,
          record.totalWorkingDays,
          `${record.totalWorkingHours.toFixed(1)} hrs`,
          `${overtimeHours.toFixed(1)} hrs`,
          `LKR ${(record.basicSalary || 0).toLocaleString()}`,
          `LKR ${overtimePay.toLocaleString()}`,
          `LKR ${(record.bonuses || 0).toLocaleString()}`,
          `LKR ${(record.allowances || 0).toLocaleString()}`,
          `LKR ${(record.deductions || 0).toLocaleString()}`,
          `LKR ${grossPay.toLocaleString()}`,
          `LKR ${(record.netPay || 0).toLocaleString()}`
        ];
      });

      try {
        if (typeof autoTable === 'function') {
          autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 100,
            styles: {
              fontSize: 9,
              cellPadding: 3,
              lineColor: [209, 213, 219],
              lineWidth: 0.1,
              valign: 'middle',
            },
            headStyles: {
              fillColor: [31, 41, 55],
              textColor: 255,
              fontSize: 10,
              fontStyle: 'bold',
              halign: 'center',
              lineWidth: 0.2,
              lineColor: [34, 197, 94],
            },
            bodyStyles: {
              textColor: 55,
              fontSize: 8,
              halign: 'center',
            },
            alternateRowStyles: {
              fillColor: [243, 244, 246],
            },
            columnStyles: {
              0: { cellWidth: 28, fontStyle: 'bold', halign: 'left' },
              1: { cellWidth: 14 },
              2: { cellWidth: 16 },
              3: { cellWidth: 16 },
              4: { cellWidth: 18, halign: 'right' },
              5: { cellWidth: 18, halign: 'right' },
              6: { cellWidth: 14, halign: 'right' },
              7: { cellWidth: 14, halign: 'right' },
              8: { cellWidth: 14, halign: 'right' },
              9: { cellWidth: 18, halign: 'right' },
              10: { cellWidth: 18, halign: 'right' },
            },
            margin: { top: 10, right: 10, bottom: 20, left: 10 },
            didDrawPage: function (data) {
              // --- Enhanced Professional Footer ---
              const pageHeight = doc.internal.pageSize.height;
              // Divider line
              doc.setDrawColor(34, 197, 94);
              doc.setLineWidth(0.7);
              doc.line(10, pageHeight - 16, 200, pageHeight - 16);
              // Footer background
              doc.setFillColor(31, 41, 55);
              doc.rect(0, pageHeight - 15, 210, 15, 'F');
              // --- Simple & Professional Footer ---
              doc.setFillColor(31, 41, 55);
              doc.rect(0, pageHeight - 15, 210, 15, 'F');
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(8);
              doc.setFont('helvetica', 'bold');
              doc.text('WildLanka', 14, pageHeight - 7.5);
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8);
              doc.setTextColor(180, 255, 210);
              doc.text('Payroll Report', 14, pageHeight - 3.5);
              doc.setTextColor(200, 200, 200);
              doc.setFontSize(7);
              doc.text('Contact: hr@wildlanka.com | +94 77 123 4567', 105, pageHeight - 4, { align: 'center' });
              doc.setTextColor(180, 255, 210);
              doc.setFontSize(8);
              doc.text('Page ' + doc.internal.getCurrentPageInfo().pageNumber, 198, pageHeight - 4, { align: 'right' });
            },
          });
        } else {
          // Fallback: simple table
          let yPosition = 100;
          let xPosition = 10;
          doc.setFillColor(31, 41, 55);
          doc.rect(xPosition, yPosition, 190, 10, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          const columnWidths = [28, 14, 16, 16, 18, 18, 14, 14, 14, 18, 18];
          tableColumn.forEach((header, index) => {
            const cellWidth = columnWidths[index];
            doc.text(header, xPosition + cellWidth/2, yPosition + 7, { align: 'center' });
            xPosition += cellWidth;
          });
          yPosition += 12;
          tableRows.forEach((row, rowIndex) => {
            xPosition = 10;
            // Zebra striping
            if (rowIndex % 2 === 0) {
              doc.setFillColor(243, 244, 246);
            } else {
              doc.setFillColor(255, 255, 255);
            }
            doc.rect(10, yPosition - 2, 190, 10, 'F');
            row.forEach((cell, index) => {
              const cellWidth = columnWidths[index];
              doc.setDrawColor(209, 213, 219);
              doc.rect(xPosition, yPosition - 2, cellWidth, 10, 'S');
              doc.setTextColor(55, 65, 81);
              doc.setFontSize(8);
              doc.setFont('helvetica', 'normal');
              if (index === 0) {
                doc.text(cell, xPosition + 2, yPosition + 4);
              } else {
                doc.text(cell, xPosition + cellWidth - 2, yPosition + 4, { align: 'right' });
              }
              xPosition += cellWidth;
            });
            yPosition += 12;
          });
          // Footer
          const pageHeight = doc.internal.pageSize.height;
          doc.setFillColor(31, 41, 55);
          doc.rect(0, pageHeight - 18, 210, 18, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text('Wildlife Safari Management System - Payroll Report', 12, pageHeight - 8);
          doc.text('For questions, contact HR | Page ' + 1, 198, pageHeight - 8, { align: 'right' });
        }
      } catch (tableError) {
        console.warn('AutoTable plugin not available, using fallback table:', tableError);
      }

      // Save PDF
      doc.save(`payroll_${getMonthName(selectedMonth)}_${selectedYear}.pdf`);
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      try {
        await payrollApi.deletePayroll(id);
        loadPayroll();
        loadStats();
        alert('Payroll record deleted successfully');
      } catch (error) {
        console.error('Error deleting payroll:', error);
        alert('Error deleting payroll. Please try again.');
      }
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      pending: 'bg-yellow-500',
      approved: 'bg-blue-500',
      paid: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle staff member selection and auto-populate basic salary
  const handleStaffSelection = (staffId) => {
    const selectedStaff = staff.find(s => s._id === staffId);
    if (selectedStaff) {
      setFormData({
        ...formData,
        staffId: staffId,
        basicSalary: selectedStaff.basicSalary || 0
      });
    } else {
      setFormData({
        ...formData,
        staffId: staffId,
        basicSalary: 0
      });
    }
  };

  // Reset form when modal is closed
  const resetForm = () => {
    setFormData({
      staffId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basicSalary: 0,
      totalWorkingDays: 0,
      totalWorkingHours: 0,
      deductions: 0,
      bonuses: 0,
      allowances: 0,
      notes: ''
    });
    setSelectedPayroll(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-abeze font-bold text-white">Payroll Management</h2>
          <p className="text-gray-400 font-abeze">Manage staff salaries and payroll records</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
          >
            Generate Payroll
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
          >
            Add/Edit Payroll
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF</span>
          </button>
          <button
            onClick={handleRefreshMonth}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
          >
            Refresh Month
          </button>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div>
            <label className="block text-gray-300 font-abeze text-sm mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 font-abeze text-sm mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 font-abeze text-sm">Total Payroll</p>
                <p className="text-3xl font-abeze font-bold">{stats.totalPayroll}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 font-abeze text-sm">Total Amount</p>
                <p className="text-3xl font-abeze font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 font-abeze text-sm">Average Salary</p>
                <p className="text-3xl font-abeze font-bold">{formatCurrency(stats.averageSalary)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 font-abeze text-sm">Total Working Hours</p>
                <p className="text-3xl font-abeze font-bold">
                  {payroll.reduce((sum, record) => sum + (record.totalWorkingHours || 0), 0).toFixed(1)}
                </p>
                <p className="text-orange-200 font-abeze text-xs mt-1">hours this month</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-abeze font-semibold text-white">
              Payroll Records - {getMonthName(selectedMonth)} {selectedYear}
            </h3>
            <div className="text-xs text-gray-400 bg-gray-700 px-3 py-2 rounded-lg">
              <span className="text-blue-400 font-medium">Overtime Rule:</span> LKR 1,000 per hour for hours worked over 8 hours per day
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-white">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading payroll records...
            </div>
          </div>
        ) : payroll.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm">No payroll records found for {getMonthName(selectedMonth)} {selectedYear}</p>
            <p className="text-xs">Click "Generate Payroll" to create records for this month</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Staff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Working Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Overtime Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Basic Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Overtime Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Bonuses</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Allowances</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Deductions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gross Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Net Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {payroll.map((record) => (
                  <tr key={record._id} className="hover:bg-green-900/30 hover:ring-2 hover:ring-green-400/40 transition-all duration-200 group cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center shadow-md">
                            <span className="text-sm font-medium text-white">
                              {record.staffId.firstName.charAt(0)}{record.staffId.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {record.staffId.firstName} {record.staffId.lastName}
                          </div>
                          <div className="text-sm text-gray-400">{record.staffId.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {record.totalWorkingDays}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {record.totalWorkingHours.toFixed(1)} hrs
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {Math.max(0, record.totalWorkingHours - (record.totalWorkingDays * 8)).toFixed(1)} hrs
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      LKR {record.basicSalary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {formatCurrency(Math.max(0, record.totalWorkingHours - (record.totalWorkingDays * 8)) * 1000)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {formatCurrency(record.bonuses || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {formatCurrency(record.allowances || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {formatCurrency(record.deductions || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {formatCurrency(
                        (record.regularPay || 0) + 
                        (Math.max(0, record.totalWorkingHours - (record.totalWorkingDays * 8)) * 1000) + 
                        (record.bonuses || 0) + 
                        (record.allowances || 0)
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-medium">
                      {formatCurrency(record.netPay)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-400 hover:text-blue-300 transition-colors rounded-lg p-1"
                          title="Edit Payroll Record"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-400 hover:text-red-300 transition-colors rounded-lg p-1"
                          title="Delete Payroll Record"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-abeze font-bold text-white">Generate Payroll</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-300 font-abeze text-sm mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-abeze text-sm mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-300 text-sm">
                    This will generate payroll records for all active staff members based on their attendance data.
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex space-x-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePayroll}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
              >
                Generate Payroll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Payroll Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700 max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="p-6 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-xl font-abeze font-bold text-white">
                {selectedPayroll ? 'Edit Payroll Record' : 'Add Payroll Record'}
              </h3>
            </div>
            
            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-gray-300 font-abeze text-sm mb-2">Staff Member</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => handleStaffSelection(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staff.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.firstName} {member.lastName} - {member.role} (Basic: LKR {member.basicSalary?.toLocaleString() || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-abeze text-sm mb-2">Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-abeze text-sm mb-2">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                    required
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-abeze text-sm mb-2">Basic Salary (LKR)</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                  placeholder="75000"
                  step="0.01"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Auto-populated from staff member's basic salary in LKR. You can modify if needed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-abeze text-sm mb-2">Working Days</label>
                  <input
                    type="number"
                    value={formData.totalWorkingDays}
                    onChange={(e) => setFormData({ ...formData, totalWorkingDays: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                    placeholder="22"
                    min="0"
                    max="31"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Number of days worked this month
                  </p>
                </div>
                <div>
                  <label className="block text-gray-300 font-abeze text-sm mb-2">Total Working Hours</label>
                  <input
                    type="number"
                    value={formData.totalWorkingHours}
                    onChange={(e) => setFormData({ ...formData, totalWorkingHours: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                    placeholder="176"
                    step="0.1"
                    min="0"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Total hours worked this month (8 hours/day = regular, over 8 = overtime)
                  </p>
                </div>
              </div>

              {/* Overtime Calculation Display */}
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                <h4 className="text-blue-300 font-abeze font-medium mb-3">Overtime Calculation</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Regular Hours:</p>
                    <p className="text-white font-medium">
                      {Math.min(formData.totalWorkingHours, formData.totalWorkingDays * 8).toFixed(1)} hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Overtime Hours:</p>
                    <p className="text-white font-medium">
                      {Math.max(0, formData.totalWorkingHours - (formData.totalWorkingDays * 8)).toFixed(1)} hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Overtime Pay:</p>
                    <p className="text-white font-medium">
                      LKR {Math.max(0, formData.totalWorkingHours - (formData.totalWorkingDays * 8)) * 1000}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-blue-300 mt-2">
                  Overtime rate: LKR 1,000 per hour (for hours worked over 8 hours per day)
                </p>
              </div>

              {/* Net Pay Calculation Display */}
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                <h4 className="text-green-300 font-abeze font-medium mb-3">Net Pay Calculation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Basic Salary:</span>
                    <span className="text-white font-medium">LKR {formData.basicSalary?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Regular Pay (pro-rated):</span>
                    <span className="text-white font-medium">
                      LKR {((Math.min(formData.totalWorkingHours, formData.totalWorkingDays * 8) / (formData.totalWorkingDays * 8)) * formData.basicSalary).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Overtime Pay:</span>
                    <span className="text-white font-medium">
                      LKR {Math.max(0, formData.totalWorkingHours - (formData.totalWorkingDays * 8)) * 1000}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bonuses:</span>
                    <span className="text-white font-medium">LKR {formData.bonuses?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Allowances:</span>
                    <span className="text-white font-medium">LKR {formData.allowances?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="border-t border-green-500/30 pt-2">
                    <div className="flex justify-between">
                      <span className="text-green-300 font-medium">Gross Pay:</span>
                      <span className="text-green-300 font-medium">
                        LKR {(
                          ((Math.min(formData.totalWorkingHours, formData.totalWorkingDays * 8) / (formData.totalWorkingDays * 8)) * formData.basicSalary) +
                          (Math.max(0, formData.totalWorkingHours - (formData.totalWorkingDays * 8)) * 1000) +
                          formData.bonuses +
                          formData.allowances
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Deductions:</span>
                    <span className="text-red-400">-LKR {formData.deductions?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="border-t border-green-500/30 pt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-bold text-lg">Net Pay:</span>
                      <span className="text-white font-bold text-lg">
                        LKR {(
                          ((Math.min(formData.totalWorkingHours, formData.totalWorkingDays * 8) / (formData.totalWorkingDays * 8)) * formData.basicSalary) +
                          (Math.max(0, formData.totalWorkingHours - (formData.totalWorkingDays * 8)) * 1000) +
                          formData.bonuses +
                          formData.allowances -
                          formData.deductions
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-green-300 mt-2">
                  Net Pay = Basic Salary (pro-rated) + Overtime Pay + Bonuses + Allowances - Deductions
                </p>
                
                {/* Test Calculation Button */}
                <button
                  type="button"
                  onClick={() => {
                    const standardHoursPerDay = 8;
                    const regularHours = Math.min(formData.totalWorkingHours, formData.totalWorkingDays * standardHoursPerDay);
                    const overtimeHours = Math.max(0, formData.totalWorkingHours - (formData.totalWorkingDays * standardHoursPerDay));
                    
                    const regularPay = (regularHours / (formData.totalWorkingDays * standardHoursPerDay)) * formData.basicSalary;
                    const overtimePay = overtimeHours * 1000;
                    const grossPay = regularPay + overtimePay + (formData.bonuses || 0) + (formData.allowances || 0);
                    const netPay = grossPay - (formData.deductions || 0);
                    
                    const testMessage = `🧮 CALCULATION TEST RESULTS:\n\n` +
                      `Input Values:\n` +
                      `- Working Days: ${formData.totalWorkingDays}\n` +
                      `- Total Hours: ${formData.totalWorkingHours}\n` +
                      `- Basic Salary: LKR ${formData.basicSalary?.toLocaleString()}\n` +
                      `- Bonuses: LKR ${formData.bonuses?.toLocaleString() || '0'}\n` +
                      `- Allowances: LKR ${formData.allowances?.toLocaleString() || '0'}\n` +
                      `- Deductions: LKR ${formData.deductions?.toLocaleString() || '0'}\n\n` +
                      `Calculations:\n` +
                      `- Regular Hours: ${regularHours.toFixed(1)} hrs\n` +
                      `- Overtime Hours: ${overtimeHours.toFixed(1)} hrs\n` +
                      `- Regular Pay: LKR ${regularPay.toFixed(2)}\n` +
                      `- Overtime Pay: LKR ${overtimePay.toFixed(2)}\n` +
                      `- Gross Pay: LKR ${grossPay.toFixed(2)}\n` +
                      `- Net Pay: LKR ${netPay.toFixed(2)}\n\n` +
                      `Check console for detailed calculation steps.`;
                    
                    console.log('=== FRONTEND CALCULATION TEST ===');
                    console.log('Input Values:', formData);
                    console.log('Calculation Steps:');
                    console.log('1. Regular Hours:', `${Math.min(formData.totalWorkingHours, formData.totalWorkingDays * 8)} hrs`);
                    console.log('2. Overtime Hours:', `${Math.max(0, formData.totalWorkingHours - (formData.totalWorkingDays * 8))} hrs`);
                    console.log('3. Regular Pay:', `(${regularHours} / ${formData.totalWorkingDays * 8}) × ${formData.basicSalary} = LKR ${regularPay.toFixed(2)}`);
                    console.log('4. Overtime Pay:', `${overtimeHours} × 1000 = LKR ${overtimePay.toFixed(2)}`);
                    console.log('5. Gross Pay:', `${regularPay.toFixed(2)} + ${overtimePay.toFixed(2)} + ${formData.bonuses || 0} + ${formData.allowances || 0} = LKR ${grossPay.toFixed(2)}`);
                    console.log('6. Net Pay:', `${grossPay.toFixed(2)} - ${formData.deductions || 0} = LKR ${netPay.toFixed(2)}`);
                    console.log('==================================');
                    
                    alert(testMessage);
                  }}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
                >
                  🧮 Test Calculation (Debug)
                </button>
                
                {/* Debug Information - Show backend vs frontend calculations */}
                {selectedPayroll && (
                  <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-600">
                    <p className="text-xs text-gray-400 mb-2">Debug Info (Backend vs Frontend):</p>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Backend Regular Pay:</span>
                        <span>LKR {selectedPayroll.regularPay?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Backend Overtime Pay:</span>
                        <span>LKR {selectedPayroll.overtimePay?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Backend Gross Pay:</span>
                        <span>LKR {selectedPayroll.grossPay?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Backend Net Pay:</span>
                        <span>LKR {selectedPayroll.netPay?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-abeze text-sm mb-2">Deductions (LKR)</label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-abeze text-sm mb-2">Bonuses (LKR)</label>
                  <input
                    type="number"
                    value={formData.bonuses}
                    onChange={(e) => setFormData({ ...formData, bonuses: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-abeze text-sm mb-2">Allowances (LKR)</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-abeze text-sm mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-abeze focus:outline-none focus:border-blue-500"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
            </form>
            
            {/* Fixed Footer */}
            <div className="p-6 border-t border-gray-700 flex space-x-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
              >
                {selectedPayroll ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
