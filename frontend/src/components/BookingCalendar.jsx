import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const BookingCalendar = ({ bookings, onDateClick }) => {
  // Map bookings to dates for highlighting
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().slice(0, 10);
      const hasBooking = bookings.some(b => {
        const startDate = b.bookingDetails?.startDate ? new Date(b.bookingDetails.startDate).toISOString().slice(0, 10) : '';
        return startDate === dateStr;
      });
      if (hasBooking) {
        return <span style={{ color: 'green', fontWeight: 'bold' }}>●</span>;
      }
    }
    return null;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 my-6">
      <h3 className="text-xl font-abeze font-bold text-white mb-4">Booking Calendar</h3>
      <Calendar
        tileContent={tileContent}
        onClickDay={onDateClick}
      />
    </div>
  );
};

export default BookingCalendar;
