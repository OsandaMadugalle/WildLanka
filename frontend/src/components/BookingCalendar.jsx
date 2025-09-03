import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const BookingCalendar = ({ bookings, onDateClick }) => {
  // Map bookings to dates for highlighting
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().slice(0, 10);
      const bookingForDate = bookings.find(b => {
        const startDate = b.bookingDetails?.startDate ? new Date(b.bookingDetails.startDate).toISOString().slice(0, 10) : '';
        return startDate === dateStr;
      });
      if (bookingForDate) {
        let color = 'green';
        if (bookingForDate.status === 'Pending') color = 'orange';
        else if (bookingForDate.status === 'Completed') color = 'blue';
        // Add more status colors if needed
        return <span style={{ color, fontWeight: 'bold' }}>●</span>;
      }
    }
    return null;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 my-6 flex flex-col items-center justify-center">
      <h3 className="text-xl font-abeze font-bold text-white mb-4 text-center">Booking Calendar</h3>
      <div className="flex items-center justify-center w-full">
        <Calendar
          tileContent={tileContent}
          onClickDay={onDateClick}
        />
      </div>
    </div>
  );
};

export default BookingCalendar;
