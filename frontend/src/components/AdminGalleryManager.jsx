import React, { useEffect, useState } from 'react';
// Simple modal for image preview
const ImageModal = ({ imageUrl, title, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
    <div className="bg-gray-900 rounded-lg p-4 relative max-w-lg w-full flex flex-col items-center">
      <img src={imageUrl} alt={title} className="max-h-[70vh] max-w-full rounded" />
      <div className="text-white mt-2 font-bold">{title}</div>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >Close</button>
    </div>
  </div>
);

const API_URL = 'http://localhost:5000/api/gallery';

const AdminGalleryManager = () => {
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [commissionEdits, setCommissionEdits] = useState({});

  const token = localStorage.getItem('auth_token');

  // Fetch all gallery images
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/admin/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setImages(data.images);
        } else {
          setError(data.message || 'Failed to load images');
        }
      } catch (err) {
        setError('Error loading images');
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [token, actionMessage]);

  // Approve image
  const handleApprove = async (id, commission = 0) => {
    setActionMessage('');
    try {
      const res = await fetch(`${API_URL}/admin/approve/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commission }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Image approved!');
      } else {
        setActionMessage(data.message || 'Failed to approve');
      }
    } catch {
      setActionMessage('Error approving image');
    }
  };

  // Reject image
  const handleReject = async (id) => {
    setActionMessage('');
    try {
      const res = await fetch(`${API_URL}/admin/reject/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Image rejected!');
      } else {
        setActionMessage(data.message || 'Failed to reject');
      }
    } catch {
      setActionMessage('Error rejecting image');
    }
  };

  // Delete image
  const handleDelete = async (id) => {
    setActionMessage('');
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Image deleted!');
      } else {
        setActionMessage(data.message || 'Failed to delete');
      }
    } catch {
      setActionMessage('Error deleting image');
    }
  };

  // Group images by status
  const grouped = {
    pending: images.filter(img => img.status === 'pending'),
    approved: images.filter(img => img.status === 'approved'),
    rejected: images.filter(img => img.status === 'rejected'),
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-white/20">
      {/* Tabs for status */}
      <div className="flex space-x-2 mb-6">
        {['pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-bold capitalize transition-colors duration-150 ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-slate-300 hover:bg-gray-700'
            }`}
          >
            {tab}
            {grouped[tab].length > 0 ? ` (${grouped[tab].length})` : ''}
          </button>
        ))}
      </div>
      {loading && <div className="text-slate-300">Loading images...</div>}
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {actionMessage && <div className="text-green-400 mb-4">{actionMessage}</div>}
      <div className="space-y-6">
        {grouped[activeTab].length === 0 && !loading && <div className="text-slate-400">No images found in this section.</div>}
        {grouped[activeTab].map((img) => (
          <div key={img._id} className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between border border-gray-700/40">
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                   onClick={() => img.imageUrl && setModalImage(img)}>
                {img.imageUrl ? (
                  <img
                    src={img.imageUrl}
                    alt={img.title || 'Gallery Image'}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-slate-400">No image</span>
                )}
              </div>
              <div>
                <div className="font-bold text-white">{img.title || 'Untitled'}</div>
                <div className="text-slate-300">Price: ${img.price}</div>
                <div className="text-slate-400">Status: {img.status}</div>
                <div className="text-slate-400">
                  Commission: {img.commission || 0}%
                </div>
                <div className="text-slate-400">User: {img.user?.email || img.user}</div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
              {/* Pending: Approve, Reject, Delete */}
              {img.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(img._id, img.commission || 0)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-abeze"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(img._id)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded font-abeze"
                  >
                    Reject
                  </button>
                </>
              )}
              {/* Approved: Reject, Delete */}
              {img.status === 'approved' && (
                <button
                  onClick={() => handleReject(img._id)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded font-abeze"
                >
                  Reject
                </button>
              )}
              {/* Rejected: Approve, Delete */}
              {img.status === 'rejected' && (
                <button
                  onClick={() => handleApprove(img._id, img.commission || 0)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-abeze"
                >
                  Approve
                </button>
              )}
              {/* Delete always shown */}
              <button
                onClick={() => handleDelete(img._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-abeze"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {modalImage && (
        <ImageModal
          imageUrl={modalImage.imageUrl}
          title={modalImage.title || 'Gallery Image'}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
};

export default AdminGalleryManager;
