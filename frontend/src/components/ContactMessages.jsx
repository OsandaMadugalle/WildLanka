import React, { useState, useEffect } from 'react';
import { contactMessageApi } from '../services/api';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [pagination.page, filters]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await contactMessageApi.getAllContactMessages(params);
      setMessages(response.data.docs || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.totalDocs || 0
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await contactMessageApi.getContactMessageStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await contactMessageApi.updateContactMessage(messageId, { status: newStatus });
      loadMessages();
      loadStats();
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const handlePriorityChange = async (messageId, newPriority) => {
    try {
      await contactMessageApi.updateContactMessage(messageId, { priority: newPriority });
      loadMessages();
    } catch (error) {
      console.error('Error updating message priority:', error);
    }
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await contactMessageApi.deleteContactMessage(messageId);
        loadMessages();
        loadStats();
      } catch (error) {
        console.error('Error deleting message:', error);
      }
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

  const openReplyModal = (message) => {
    setSelectedMessage(message);
    setReplyMessage('');
    setShowReplyModal(true);
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      setReplying(true);
      await contactMessageApi.replyToContactMessage(selectedMessage._id, replyMessage);
      setShowReplyModal(false);
      setReplyMessage('');
      loadMessages();
      loadStats();
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setReplying(false);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'urgent': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 font-abeze text-sm">Total Messages</p>
              <p className="text-3xl font-abeze font-bold text-white">{stats.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 font-abeze text-sm">New Messages</p>
              <p className="text-3xl font-abeze font-bold text-white">{stats.new || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 font-abeze text-sm">Today's Messages</p>
              <p className="text-3xl font-abeze font-bold text-white">{stats.today || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 font-abeze text-sm">Replied</p>
              <p className="text-3xl font-abeze font-bold text-white">{stats.byStatus?.replied || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-green-200 font-abeze font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-green-200 font-abeze font-medium mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-green-200 font-abeze font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-abeze placeholder-gray-400 focus:border-green-400 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', priority: '', search: '' })}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-abeze font-medium transition-colors duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/20">
          <h2 className="text-xl font-abeze font-bold text-white">Contact Messages</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
            <p className="text-gray-300 font-abeze mt-2">Loading messages...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">Sender</th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">Subject</th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">Status</th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">Priority</th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">Date</th>
                  <th className="text-left py-4 px-6 text-green-200 font-abeze">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-white font-abeze">
                      <div>
                        <div className="font-medium">{message.firstName} {message.lastName}</div>
                        <div className="text-gray-300 text-sm">{message.email}</div>
                        {message.phone && (
                          <div className="text-gray-300 text-sm">{message.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-abeze">{message.subject}</div>
                      <div className="text-gray-300 text-sm truncate max-w-xs">
                        {message.message}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={message.status}
                        onChange={(e) => handleStatusChange(message._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-abeze ${getStatusColor(message.status)}`}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={message.priority}
                        onChange={(e) => handlePriorityChange(message._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-abeze ${getPriorityColor(message.priority)}`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-white font-abeze text-sm">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openMessageModal(message._id)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs font-abeze transition-colors"
                        >
                          View
                        </button>
                        {message.status !== 'replied' && (
                          <button
                            onClick={() => openReplyModal(message)}
                            className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-xs font-abeze transition-colors"
                          >
                            Reply
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(message._id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-abeze transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="px-6 py-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-300 font-abeze">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm text-white font-abeze disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm text-white font-abeze disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-abeze font-bold text-white">Message Details</h3>
                    <p className="text-gray-400 font-abeze">ID: {selectedMessage._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <h4 className="font-medium text-green-200 font-abeze mb-2">Sender Information</h4>
                  <p className="text-white font-abeze">
                    {selectedMessage.firstName} {selectedMessage.lastName}
                  </p>
                  <p className="text-gray-300 font-abeze">{selectedMessage.email}</p>
                  {selectedMessage.phone && (
                    <p className="text-gray-300 font-abeze">{selectedMessage.phone}</p>
                  )}
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <h4 className="font-medium text-green-200 font-abeze mb-2">Subject</h4>
                  <p className="text-white font-abeze">{selectedMessage.subject}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <h4 className="font-medium text-green-200 font-abeze mb-2">Message</h4>
                  <p className="text-white font-abeze whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <h4 className="font-medium text-green-200 font-abeze mb-2">Date Sent</h4>
                  <p className="text-white font-abeze">{formatDate(selectedMessage.createdAt)}</p>
                </div>
                
                {selectedMessage.adminNotes && (
                  <div className="bg-green-500/10 backdrop-blur-md rounded-xl p-4 border border-green-500/20">
                    <h4 className="font-medium text-green-200 font-abeze mb-2">Admin Response</h4>
                    <p className="text-green-200 font-abeze whitespace-pre-wrap">{selectedMessage.adminNotes}</p>
                    {selectedMessage.repliedBy && (
                      <p className="text-green-300 font-abeze text-sm mt-2">
                        Replied by: {selectedMessage.repliedBy.firstName} {selectedMessage.repliedBy.lastName}
                      </p>
                    )}
                  </div>
                )}
                
                {selectedMessage.repliedAt && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <h4 className="font-medium text-green-200 font-abeze mb-2">Replied At</h4>
                    <p className="text-white font-abeze">{formatDate(selectedMessage.repliedAt)}</p>
                  </div>
                )}

                {/* Reply Button */}
                {!selectedMessage.adminNotes && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        openReplyModal(selectedMessage);
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-abeze font-medium transition-colors"
                    >
                      Reply to Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-abeze font-bold text-white">Reply to Message</h3>
                    <p className="text-gray-400 font-abeze">From: {selectedMessage.firstName} {selectedMessage.lastName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Original Message */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <h4 className="font-medium text-green-200 font-abeze mb-2">Original Message</h4>
                  <p className="text-white font-abeze whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {/* Reply Form */}
                <div>
                  <label className="block text-green-200 font-abeze font-medium mb-2">
                    Your Reply *
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:border-green-400 focus:outline-none transition-colors resize-none"
                    rows={6}
                    maxLength={500}
                  />
                  <div className="text-right mt-2">
                    <span className="text-gray-400 text-sm font-abeze">
                      {replyMessage.length}/500 characters
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-abeze font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={replying || !replyMessage.trim()}
                  className={`px-6 py-2 rounded-lg font-abeze font-medium transition-colors ${
                    replying || !replyMessage.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {replying ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
