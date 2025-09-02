// Generate a single PDF with all bookings in a table


export const generateAllBookingsPDF = (bookings) => {
  try {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(34, 139, 34);
    doc.text('Wildlife Safari Management', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('All Bookings Report', 105, 30, { align: 'center' });
    doc.setDrawColor(34, 139, 34);
    doc.line(20, 35, 190, 35);

    // Table headers
    const headers = [
      'Booking ID', 'Customer Name', 'Email', 'Package', 'Location', 'Start Date', 'End Date', 'People', 'Status', 'Payment', 'Total Price'
    ];
    // Table rows
    const rows = bookings.map(b => [
      b._id,
      `${b.userId?.firstName || ''} ${b.userId?.lastName || ''}`,
      b.userId?.email || '',
      b.packageDetails?.title || '',
      b.packageDetails?.location || '',
      b.bookingDetails?.startDate ? new Date(b.bookingDetails.startDate).toLocaleDateString() : '',
      b.bookingDetails?.endDate ? new Date(b.bookingDetails.endDate).toLocaleDateString() : '',
      b.bookingDetails?.numberOfPeople || '',
      b.status,
      b.payment ? 'Paid' : 'Pending',
      b.totalPrice || ''
    ]);
    doc.autoTable({
      startY: 45,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [34, 139, 34], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 }, 3: { cellWidth: 30 }, 4: { cellWidth: 30 }, 5: { cellWidth: 25 }, 6: { cellWidth: 25 }, 7: { cellWidth: 15 }, 8: { cellWidth: 20 }, 9: { cellWidth: 20 }, 10: { cellWidth: 25 } }
    });
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated on: ' + new Date().toLocaleString(), 20, doc.lastAutoTable.finalY + 10);
    doc.text('Thank you for choosing Wildlife Safari Management!', 105, doc.lastAutoTable.finalY + 16, { align: 'center' });
    doc.save(`bookings_report_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating all bookings PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateBookingPDF = (booking, user) => {
  try {
    const doc = new jsPDF();

    // Header with logo and organization info
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(1.5);
    doc.line(20, 20, 190, 20);
    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34);
    doc.text('Wildlife Safari Management', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('www.wildlanka.com | info@wildlanka.com | +94 77 123 4567', 105, 37, { align: 'center' });
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 42, 190, 42);

    // Document Title
    doc.setFontSize(16);
    doc.setTextColor(34, 139, 34);
    doc.text('Booking Confirmation', 105, 50, { align: 'center' });

    // Customer Information Section
    doc.setFontSize(13);
    doc.setTextColor(34, 139, 34);
    doc.text('Customer Information', 20, 60);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${user?.firstName || ''} ${user?.lastName || ''}`, 20, 67);
    doc.text(`Email: ${user?.email || ''}`, 20, 74);
    doc.text(`Phone: ${user?.phone || 'Not provided'}`, 20, 81);
    doc.text(`Country: ${user?.country || 'Not provided'}`, 20, 88);

    // Booking Details Table
    doc.setFontSize(13);
    doc.setTextColor(34, 139, 34);
    doc.text('Booking Details', 20, 100);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const bookingTable = [
      ['Booking ID', booking._id],
      ['Package', booking.packageDetails?.title || 'Safari Package'],
      ['Location', booking.packageDetails?.location || 'N/A'],
      ['Duration', booking.packageDetails?.duration || 'N/A'],
      ['Number of People', booking.bookingDetails?.numberOfPeople || 'N/A'],
      ['Guide', booking.guideId ? `${booking.guideId.name || booking.guideId.firstName || ''} (${booking.guideId.phone || 'Not provided'})` : 'Not assigned'],
      ['Driver', booking.driverId ? `${booking.driverId.name || booking.driverId.firstName || ''} (${booking.driverId.phone || 'Not provided'})` : 'Not assigned'],
      ['Start Date', booking.bookingDetails?.startDate ? new Date(booking.bookingDetails.startDate).toLocaleDateString() : 'N/A'],
      ['End Date', booking.bookingDetails?.endDate ? new Date(booking.bookingDetails.endDate).toLocaleDateString() : 'N/A'],
      ['Status', booking.status || 'N/A'],
      ['Payment Status', booking.payment ? 'Paid' : 'Pending'],
      ['Total Price', `LKR ${booking.totalPrice?.toLocaleString() || 'N/A'}`]
    ];
    doc.autoTable({
      startY: 105,
      head: [['Field', 'Value']],
      body: bookingTable,
      theme: 'grid',
      headStyles: { fillColor: [34, 139, 34], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 120 } }
    });

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 270, 190, 270);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const footerY = 276;
  doc.text('Generated on: ' + new Date().toLocaleString(), 20, footerY);
  doc.text('Thank you for choosing Wildlife Safari Management!', 105, footerY + 6, { align: 'center' });
  doc.text('For support, contact info@wildlanka.com', 190, footerY + 12, { align: 'right' });

    // Save the PDF
    const fileName = `booking_${booking._id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};

export const generateDonationPDF = (donationData) => {
  try {
    const doc = new jsPDF();
  
    // Add logo/header
    doc.setFontSize(24);
    doc.setTextColor(34, 139, 34); // Green color
    doc.text('Wildlife Safari Management', 105, 20, { align: 'center' });
  
    // Add subtitle
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Donation Receipt', 105, 30, { align: 'center' });
  
    // Add line separator
    doc.setDrawColor(34, 139, 34);
    doc.line(20, 35, 190, 35);
  
    // Donor Information
    doc.setFontSize(16);
    doc.setTextColor(34, 139, 34);
    doc.text('Donor Information', 20, 50);
  
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Handle anonymous donations
    if (donationData.isAnonymous) {
      doc.text('Name: Anonymous Donor', 20, 60);
    } else {
      doc.text(`Name: ${donationData.firstName || ''} ${donationData.lastName || ''}`, 20, 60);
    }
    
    doc.text(`Email: ${donationData.email || ''}`, 20, 67);
    doc.text(`Phone: ${donationData.phone || 'Not provided'}`, 20, 74);
    doc.text(`Address: ${donationData.address || 'Not provided'}`, 20, 81);
    doc.text(`Country: ${donationData.country || 'Not provided'}`, 20, 88);
    doc.text(`Postal Code: ${donationData.postalCode || 'Not provided'}`, 20, 95);
  
    // Donation Information
    doc.setFontSize(16);
    doc.setTextColor(34, 139, 34);
    doc.text('Donation Details', 20, 115);
  
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Donation ID: ${donationData._id || 'N/A'}`, 20, 125);
    doc.text(`Amount: ${donationData.currency || 'USD'} ${(donationData.amount || 0).toFixed(2)}`, 20, 132);
    doc.text(`Payment Status: ${donationData.paymentStatus === 'completed' ? 'Completed' : 'Pending'}`, 20, 139);
    doc.text(`Anonymous: ${donationData.isAnonymous ? 'Yes' : 'No'}`, 20, 146);
    doc.text(`Receive Updates: ${donationData.receiveUpdates ? 'Yes' : 'No'}`, 20, 153);
  
    // Payment Information
    doc.setFontSize(16);
    doc.setTextColor(34, 139, 34);
    doc.text('Payment Information', 20, 170);
  
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Payment Method: Stripe`, 20, 180);
    if (donationData.stripePaymentIntentId) {
      doc.text(`Payment Intent ID: ${donationData.stripePaymentIntentId}`, 20, 187);
    }
    doc.text(`Transaction Date: ${new Date().toLocaleDateString()}`, 20, 194);
  
    // Impact Information
    doc.setFontSize(16);
    doc.setTextColor(34, 139, 34);
    doc.text('Your Impact', 20, 210);
  
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Your generous donation supports:', 20, 220);
    doc.text('• Wildlife conservation and habitat protection', 25, 227);
    doc.text('• Anti-poaching initiatives and patrols', 25, 234);
    doc.text('• Community education and awareness programs', 25, 241);
    doc.text('• Research and monitoring of endangered species', 25, 248);
    doc.text('• Sustainable tourism development', 25, 255);
  
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated on: ' + new Date().toLocaleString(), 20, 280);
    doc.text('Thank you for supporting wildlife conservation!', 105, 280, { align: 'center' });
  
    // Save the PDF
    const fileName = `donation_${donationData._id || 'receipt'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating donation PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};
