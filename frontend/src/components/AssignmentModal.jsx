import React, { useState, useEffect } from 'react';
import { staffApi, bookingApi } from '../services/api';

const AssignmentModal = ({ isOpen, onClose, booking, onAssignmentComplete }) => {
  const [drivers, setDrivers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedGuide, setSelectedGuide] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStaff();
      loadBookings();
    }
  }, [isOpen]);

  const loadBookings = async () => {
    try {
      const bookingsData = await bookingApi.getAllBookings();
      setAllBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setAllBookings([]);
    }
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      const staffData = await staffApi.getAllStaff();
      
      // Filter drivers and guides
      const driversList = staffData.filter(staff => staff.role === 'driver' && staff.isActive);
      const guidesList = staffData.filter(staff => staff.role === 'tour_guide' && staff.isActive);
      
      setDrivers(driversList);
      setGuides(guidesList);
      
      // Set current assignments if they exist
      if (booking.driverId) {
        setSelectedDriver(booking.driverId._id || booking.driverId);
      }
      if (booking.guideId) {
        setSelectedGuide(booking.guideId._id || booking.guideId);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      setError('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      setError('Please select a driver');
      return;
    }

    try {
      setAssigning(true);
      setError('');
      
      await bookingApi.assignDriverToBooking(booking._id, selectedDriver);
      
      // Update the booking object
      const updatedBooking = {
        ...booking,
        driverId: drivers.find(d => d._id === selectedDriver),
        status: 'Driver Assigned'
      };
      
      onAssignmentComplete(updatedBooking);
      onClose();
    } catch (error) {
      console.error('Error assigning driver:', error);
      setError(error.response?.data?.message || 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignGuide = async () => {
    if (!selectedGuide) {
      setError('Please select a tour guide');
      return;
    }

    try {
      setAssigning(true);
      setError('');
      
      await bookingApi.assignGuideToBooking(booking._id, selectedGuide);
      
      // Update the booking object
      const updatedBooking = {
        ...booking,
        guideId: guides.find(g => g._id === selectedGuide),
        status: 'Guide Assigned'
      };
      
      onAssignmentComplete(updatedBooking);
      onClose();
    } catch (error) {
      console.error('Error assigning guide:', error);
      setError(error.response?.data?.message || 'Failed to assign guide');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignStaff = async () => {
    const currentDriverId = booking.driverId && (booking.driverId._id || booking.driverId);
    const currentGuideId = booking.guideId && (booking.guideId._id || booking.guideId);

    const needsAssignDriver = !!selectedDriver && selectedDriver !== currentDriverId;
    const needsAssignGuide = !!selectedGuide && selectedGuide !== currentGuideId;

    if (!needsAssignDriver && !needsAssignGuide) {
      setError('Please select at least one staff member to assign or change.');
      return;
    }

    setShowConfirm(true);
  };

  const confirmAssignStaff = async () => {
    const currentDriverId = booking.driverId && (booking.driverId._id || booking.driverId);
    const currentGuideId = booking.guideId && (booking.guideId._id || booking.guideId);
    const needsAssignDriver = !!selectedDriver && selectedDriver !== currentDriverId;
    const needsAssignGuide = !!selectedGuide && selectedGuide !== currentGuideId;
    try {
      setAssigning(true);
      setError('');
      setSuccess('');
      const actions = [];
      if (needsAssignDriver) {
        actions.push(bookingApi.assignDriverToBooking(booking._id, selectedDriver));
      }
      if (needsAssignGuide) {
        actions.push(bookingApi.assignGuideToBooking(booking._id, selectedGuide));
      }
      await Promise.all(actions);
      const updatedBooking = {
        ...booking,
        driverId: needsAssignDriver
          ? drivers.find(d => d._id === selectedDriver)
          : booking.driverId,
        guideId: needsAssignGuide
          ? guides.find(g => g._id === selectedGuide)
          : booking.guideId,
        status: needsAssignGuide
          ? 'Guide Assigned'
          : 'Driver Assigned'
      };
      setSuccess('Staff assigned successfully!');
      onAssignmentComplete(updatedBooking);
      setShowConfirm(false);
      setTimeout(() => { setSuccess(''); onClose(); }, 1500);
    } catch (error) {
      console.error('Error assigning staff:', error);
      setError(error.response?.data?.message || 'Failed to assign staff');
      setShowConfirm(false);
    } finally {
      setAssigning(false);
    }
  };

  const handleCompleteBooking = async () => {
    try {
      setAssigning(true);
      setError('');
      
      await bookingApi.completeBookingByAdmin(booking._id);
      
      // Update the booking object
      const updatedBooking = {
        ...booking,
        status: 'Confirmed'
      };
      
      onAssignmentComplete(updatedBooking);
      onClose();
    } catch (error) {
      console.error('Error completing booking:', error);
      setError(error.response?.data?.message || 'Failed to complete booking');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-abeze font-bold text-white">Assign Staff to Booking</h2>
                <p className="text-gray-400 font-abeze">Booking ID: {booking._id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Booking Information */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-abeze font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Booking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 font-abeze text-sm">Customer</label>
                <p className="text-white font-abeze">
                  {booking.userId?.firstName} {booking.userId?.lastName}
                </p>
              </div>
              <div>
                <label className="text-gray-400 font-abeze text-sm">Package</label>
                <p className="text-white font-abeze">{booking.packageDetails?.title}</p>
              </div>
              <div>
                <label className="text-gray-400 font-abeze text-sm">Start Date</label>
                <p className="text-white font-abeze">
                  {new Date(booking.bookingDetails?.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-gray-400 font-abeze text-sm">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-abeze ${
                  booking.status === 'Payment Confirmed' ? 'bg-green-500/20 text-green-400' :
                  booking.status === 'Driver Assigned' ? 'bg-blue-500/20 text-blue-400' :
                  booking.status === 'Guide Assigned' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Error/Success Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 font-abeze">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-abeze">{success}</p>
            </div>
          )}

          {/* Driver Assignment */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-abeze font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Driver Assignment
            </h3>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="text-gray-300 font-abeze">Loading drivers...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 font-abeze text-sm mb-2 block">Select Driver</label>
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 font-abeze focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Choose a driver...</option>
                    {drivers.map((driver) => {
                      // Check availability
                      const isBusy = allBookings.some(b =>
                        b.driverId && (b.driverId._id || b.driverId) === driver._id &&
                        b._id !== booking._id &&
                        b.bookingDetails?.startDate === booking.bookingDetails?.startDate
                      );
                      return (
                        <option key={driver._id} value={driver._id} disabled={isBusy}>
                          {driver.firstName} {driver.lastName} - {driver.specialization || 'Driver'}
                          {isBusy ? ' (Unavailable)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {/* Assignment history for driver */}
                  {selectedDriver && (
                    <div className="mt-2 text-xs text-gray-300 font-abeze">
                      <span className="font-bold">Recent assignments:</span>
                      <ul className="list-disc ml-4">
                        {allBookings.filter(b => b.driverId && (b.driverId._id || b.driverId) === selectedDriver)
                          .slice(-3)
                          .map(b => (
                            <li key={b._id}>
                              {new Date(b.bookingDetails?.startDate).toLocaleDateString()} - {b.status}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {booking.driverId && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-300 font-abeze text-sm">
                      Currently assigned: {booking.driverId.firstName} {booking.driverId.lastName}
                    </p>
                    {booking.driverAccepted && (
                      <p className="text-green-400 font-abeze text-xs mt-1">
                        ✓ Driver has accepted this assignment
                      </p>
                    )}
                  </div>
                )}
                
                {/* Assignment handled by single button in footer */}
              </div>
            )}
          </div>

          {/* Guide Assignment */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-abeze font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Tour Guide Assignment
            </h3>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="text-gray-300 font-abeze">Loading guides...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 font-abeze text-sm mb-2 block">Select Tour Guide</label>
                  <select
                    value={selectedGuide}
                    onChange={(e) => setSelectedGuide(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 font-abeze focus:outline-none focus:border-green-500"
                  >
                    <option value="">Choose a tour guide...</option>
                    {guides.map((guide) => {
                      // Check availability
                      const isBusy = allBookings.some(b =>
                        b.guideId && (b.guideId._id || b.guideId) === guide._id &&
                        b._id !== booking._id &&
                        b.bookingDetails?.startDate === booking.bookingDetails?.startDate
                      );
                      return (
                        <option key={guide._id} value={guide._id} disabled={isBusy}>
                          {guide.firstName} {guide.lastName} - {guide.specialization || 'Tour Guide'}
                          {isBusy ? ' (Unavailable)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {/* Assignment history for guide */}
                  {selectedGuide && (
                    <div className="mt-2 text-xs text-gray-300 font-abeze">
                      <span className="font-bold">Recent assignments:</span>
                      <ul className="list-disc ml-4">
                        {allBookings.filter(b => b.guideId && (b.guideId._id || b.guideId) === selectedGuide)
                          .slice(-3)
                          .map(b => (
                            <li key={b._id}>
                              {new Date(b.bookingDetails?.startDate).toLocaleDateString()} - {b.status}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {booking.guideId && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-green-300 font-abeze text-sm">
                      Currently assigned: {booking.guideId.firstName} {booking.guideId.lastName}
                    </p>
                    {booking.guideAccepted && (
                      <p className="text-green-400 font-abeze text-xs mt-1">
                        ✓ Guide has accepted this assignment
                      </p>
                    )}
                  </div>
                )}
                
                {/* Assignment handled by single button in footer */}
              </div>
            )}
          </div>

          {/* Complete Booking */}
          {booking.driverAccepted && booking.guideAccepted && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-abeze font-bold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Complete Booking
              </h3>
              <p className="text-gray-300 font-abeze text-sm mb-4">
                Both driver and tour guide have accepted their assignments. You can now complete this booking.
              </p>
              <button
                onClick={handleCompleteBooking}
                disabled={assigning}
                className={`w-full px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${
                  assigning
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {assigning ? 'Completing...' : 'Complete Booking'}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-abeze font-medium transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignStaff}
            disabled={assigning || (!selectedDriver && !selectedGuide)}
            className={`px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300 ${
              assigning || (!selectedDriver && !selectedGuide)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {assigning ? 'Assigning...' : 'Assign Staff'}
          </button>
        </div>
        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-700 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">Confirm Assignment</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to assign the selected staff to this booking?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAssignStaff}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentModal;
