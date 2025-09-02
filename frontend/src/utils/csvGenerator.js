// Utility to generate and download CSV files for bookings
export const downloadBookingsCSV = (bookings) => {
  const headers = [
    'Booking ID', 'Customer Name', 'Email', 'Package', 'Location', 'Start Date', 'End Date', 'People', 'Status', 'Payment', 'Total Price'
  ];
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
  let csvContent = '';
  csvContent += headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
