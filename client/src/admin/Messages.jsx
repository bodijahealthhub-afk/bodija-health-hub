import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import Modal from './Modal';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/messages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(Array.isArray(data) ? data : data.messages || []);
        }
      } catch {
        // Mock data
        setMessages([
          { id: 1, name: 'Adebayo Oladipo', email: 'adebayo@email.com', subject: 'Appointment Inquiry', message: 'I would like to schedule a general checkup for next week. Please let me know available slots.', date: '2026-07-14', read: false },
          { id: 2, name: 'Chioma Nwosu', email: 'chioma@email.com', subject: 'Dental Service Question', message: 'Do you offer teeth whitening services? If so, what are the costs and how long does the procedure take?', date: '2026-07-13', read: true },
          { id: 3, name: 'Fatima Abubakar', email: 'fatima@email.com', subject: 'Insurance Verification', message: 'I need to verify if my health insurance is accepted at your facility. My provider is Leadway Health.', date: '2026-07-12', read: false },
          { id: 4, name: 'Emeka Okonkwo', email: 'emeka@email.com', subject: 'Feedback', message: 'The service at your clinic was excellent. Dr. Adewale was very professional and attentive.', date: '2026-07-11', read: true },
          { id: 5, name: 'Aisha Bello', email: 'aisha@email.com', subject: 'Prenatal Package', message: 'I am interested in your prenatal care package. Could you provide details on what is included?', date: '2026-07-10', read: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredMessages(
        messages.filter(
          (msg) =>
            msg.name.toLowerCase().includes(q) ||
            msg.email.toLowerCase().includes(q) ||
            msg.subject.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredMessages(messages);
    }
  }, [messages, searchQuery]);

  const unreadCount = messages.filter((msg) => !msg.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/messages/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    );
    if (selectedMessage?.id === id) {
      setSelectedMessage((prev) => ({ ...prev, read: true }));
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    setDeleteConfirm(null);
    if (selectedMessage?.id === id) {
      setShowDetail(false);
      setSelectedMessage(null);
    }
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);
    setShowDetail(true);
    if (!msg.is_read) {
      handleMarkAsRead(msg.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
              : 'All messages read'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar
          placeholder="Search messages..."
          onSearch={setSearchQuery}
          className="w-full md:w-96"
        />
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">No messages found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !msg.is_read ? 'bg-teal-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      !msg.is_read ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="font-medium text-sm">
                        {msg.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm ${!msg.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {msg.name}
                        </h3>
                        {!msg.is_read && (
                          <span className="w-2 h-2 bg-teal-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{msg.email}</p>
                      <p className={`text-sm mt-1 ${!msg.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-1">{msg.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : "N/A"}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(msg);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedMessage(null);
        }}
        title={selectedMessage?.subject || 'Message'}
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="font-medium text-teal-600">
                    {selectedMessage.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedMessage.name}</h3>
                  <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{selectedMessage?.created_at ? new Date(selectedMessage.created_at).toLocaleDateString() : "N/A"}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => {
                  setDeleteConfirm(selectedMessage);
                  setShowDetail(false);
                }}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Message"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this message from "{deleteConfirm?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm?.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Messages;
