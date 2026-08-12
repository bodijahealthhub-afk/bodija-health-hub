import { useState, useEffect } from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const TYPE_LABELS = {
  appointment: 'Healthcare',
  partner_appointment: 'Partner',
  programme: 'Programme',
  event: 'Event',
  training: 'Training',
  external: 'External',
};

const AppointmentDetail = ({ appointment, isOpen, onClose, onStatusChange }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
    }
  }, [appointment]);

  if (!appointment) return null;

  const actionable = ['requested', 'pending'].includes(appointment.status);

  const handleSaveNotes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/appointments/${appointment.id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });
    } catch {
      // Update locally
    }
    onClose();
  };

  const DetailRow = ({ label, value }) => (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <p className="text-gray-900">{value || '—'}</p>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="lg">
      <div className="space-y-6">
        {/* Status and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={appointment.status} />
            {appointment.bookingReference && (
              <span className="font-mono text-xs text-gray-500">{appointment.bookingReference}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actionable && (
              <button
                onClick={() => onStatusChange(appointment.id, 'confirmed')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Confirm
              </button>
            )}
            {actionable && (
              <button
                onClick={() => onStatusChange(appointment.id, 'declined')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Decline
              </button>
            )}
            {appointment.status === 'confirmed' && (
              <button
                onClick={() => onStatusChange(appointment.id, 'completed')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Complete
              </button>
            )}
            {!['cancelled', 'completed', 'declined', 'expired', 'archived'].includes(appointment.status) && (
              <button
                onClick={() => onStatusChange(appointment.id, 'cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Booking Info */}
        <div className="grid grid-cols-2 gap-6">
          <DetailRow label="Type" value={TYPE_LABELS[appointment.bookingType] || appointment.bookingType} />
          <DetailRow label="Category" value={appointment.category} />
          <DetailRow label="Name" value={appointment.patientName} />
          <DetailRow label="Email" value={appointment.email} />
          <DetailRow label="Phone" value={appointment.phone} />
          <DetailRow label="Provider" value={appointment.providerName || 'Bodija Health Hub'} />
          <DetailRow label="Service" value={appointment.service} />
          <DetailRow label="Preferred Date & Time" value={`${appointment.preferredDate || appointment.date || 'Flexible'}${appointment.preferredTime || appointment.time ? ` at ${appointment.preferredTime || appointment.time}` : ''}`} />
          <DetailRow label="Booking Method" value={appointment.bookingMethod} />
        </div>

        {appointment.externalBookingUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">External Booking Link</label>
            <a
              href={appointment.externalBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:underline text-sm break-all"
            >
              {appointment.externalBookingUrl}
            </a>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="Add notes about this booking..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            Close
          </button>
          <button
            onClick={handleSaveNotes}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
          >
            Save Notes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentDetail;
