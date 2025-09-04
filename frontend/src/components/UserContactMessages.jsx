import React, { useState, useEffect } from 'react';
import { contactMessageApi } from '../services/api';

const UserContactMessages = ({ userEmail }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });

  useEffect(() => {
    if (userEmail) {
      loadMessages();
    }
  }, [userEmail, pagination.page]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await contactMessageApi.getUserContactMessages(userEmail, params);
      setMessages(response.data.docs || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalDocs || 0,
        totalPages: response.data.totalPages || 0
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMessageModal = async (messageId) => {
    try {
      const response = await contactMessageApi.getContactMessageById(messageId);
      setSelectedMessage(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading message details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'read': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'replied': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getSubjectLabel = (subject) => {
    switch (subject) {
      case 'safari-booking': return 'Safari Booking';
      case 'custom-package': return 'Custom Package';
      case 'general-inquiry': return 'General Inquiry';
      case 'group-booking': return 'Group Booking';
      case 'support': return 'Customer Support';
      default: return subject;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="ml-3 text-white font-abeze">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-xl font-abeze font-bold text-white mb-2">No Messages Yet</h3>
          <p className="text-green-200 font-abeze">You haven't sent any contact messages yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-abeze font-bold text-white">
            My Contact Messages
          </h3>
          <span className="text-green-200 font-abeze text-sm">
            {pagination.total} message{pagination.total !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => openMessageModal(message._id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-abeze font-semibold mb-1">
                    {getSubjectLabel(message.subject)}
                  </h4>
                  <p className="text-green-200 font-abeze text-sm mb-2">
                    {message.message.length > 100 
                      ? `${message.message.substring(0, 100)}...` 
                      : message.message
                    }
                  </p>
                  
                  {/* Admin Reply Preview */}
                  {message.adminNotes && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span className="text-green-300 font-abeze text-sm font-medium">Admin Response</span>
                      </div>
                      <p className="text-green-200 font-abeze text-sm">
                        {message.adminNotes.length > 150 
                          ? `${message.adminNotes.substring(0, 150)}...` 
                          : message.adminNotes
                        }
                      </p>
                      {message.repliedAt && (
                        <p className="text-green-300 font-abeze text-xs mt-2">
                          Replied on {formatDate(message.repliedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    {message.adminNotes && (
                      <div className="flex items-center text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-abeze ml-1">Replied</span>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-abeze ${getStatusColor(message.status)}`}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                  </div>
                  <span className="text-gray-300 text-xs font-abeze">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white font-abeze disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Previous
            </button>
            <span className="text-white font-abeze text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white font-abeze disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-abeze font-bold text-white">
                  Message Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-green-200 font-abeze font-medium mb-2">Subject</label>
                  <div className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze">
                    {getSubjectLabel(selectedMessage.subject)}
                  </div>
                </div>

                <div>
                  <label className="block text-green-200 font-abeze font-medium mb-2">Message</label>
                  <div className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 py-4 text-white font-abeze whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-green-200 font-abeze font-medium mb-2">Status</label>
                    <span className={`inline-block px-3 py-2 rounded-lg text-sm font-abeze ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-green-200 font-abeze font-medium mb-2">Sent On</label>
                    <div className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze">
                      {formatDate(selectedMessage.createdAt)}
                    </div>
                  </div>
                </div>

                {selectedMessage.adminNotes && (
                  <div>
                    <label className="block text-green-200 font-abeze font-medium mb-2">Admin Response</label>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-200 font-abeze">
                      {selectedMessage.adminNotes}
                    </div>
                  </div>
                )}

                {selectedMessage.repliedAt && (
                  <div>
                    <label className="block text-green-200 font-abeze font-medium mb-2">Replied On</label>
                    <div className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze">
                      {formatDate(selectedMessage.repliedAt)}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-abeze font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { UserContactMessages };
