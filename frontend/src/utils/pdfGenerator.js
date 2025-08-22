import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateBookingPDF = (booking, user) => {
  try {
    const doc = new jsPDF();
  
  // Add logo/header
  doc.setFontSize(24);
  doc.setTextColor(34, 139, 34); // Green color
  doc.text('Wildlife Safari Management', 105, 20, { align: 'center' });
  
  // Add subtitle
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('Booking Confirmation', 105, 30, { align: 'center' });
  
  // Add line separator
  doc.setDrawColor(34, 139, 34);
  doc.line(20, 35, 190, 35);
  
  // Customer Information
  doc.setFontSize(16);
  doc.setTextColor(34, 139, 34);
  doc.text('Customer Information', 20, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${user?.firstName || ''} ${user?.lastName || ''}`, 20, 60);
  doc.text(`Email: ${user?.email || ''}`, 20, 67);
  doc.text(`Phone: ${user?.phone || 'Not provided'}`, 20, 74);
  doc.text(`Country: ${user?.country || 'Not provided'}`, 20, 81);
  
  // Booking Information
  doc.setFontSize(16);
  doc.setTextColor(34, 139, 34);
  doc.text('Booking Details', 20, 100);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Booking ID: ${booking._id}`, 20, 110);
  doc.text(`Package: ${booking.packageDetails?.title || 'Safari Package'}`, 20, 117);
  doc.text(`Location: ${booking.packageDetails?.location || 'N/A'}`, 20, 124);
  doc.text(`Duration: ${booking.packageDetails?.duration || 'N/A'}`, 20, 131);
  doc.text(`Number of People: ${booking.bookingDetails?.numberOfPeople || 'N/A'}`, 20, 138);
  
  // Dates
  doc.text(`Start Date: ${booking.bookingDetails?.startDate ? new Date(booking.bookingDetails.startDate).toLocaleDateString() : 'N/A'}`, 20, 145);
  doc.text(`End Date: ${booking.bookingDetails?.endDate ? new Date(booking.bookingDetails.endDate).toLocaleDateString() : 'N/A'}`, 20, 152);
  
  // Status and Payment
  doc.text(`Status: ${booking.status || 'N/A'}`, 20, 159);
  doc.text(`Payment Status: ${booking.payment ? 'Paid' : 'Pending'}`, 20, 166);
  
  // Price Information
  doc.setFontSize(16);
  doc.setTextColor(34, 139, 34);
  doc.text('Price Information', 20, 185);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Price: LKR ${booking.totalPrice?.toLocaleString() || 'N/A'}`, 20, 195);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Generated on: ' + new Date().toLocaleString(), 20, 280);
  doc.text('Thank you for choosing Wildlife Safari Management!', 105, 280, { align: 'center' });
  
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
