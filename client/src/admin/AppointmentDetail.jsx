import { useState, useEffect } from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const AppointmentDetail = ({ appointment, isOpen, onClose, onStatusChange }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
    }
  }, [appointment]);

  if (!appointment) return null;

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details" size="lg">
      <div className="space-y-6">
        {/* Status and Actions */}
        <div className="flex items-center justify-between">
          <StatusBadge status={appointment.status} />
          <div className="flex items-center gap-2">
            {appointment.status === 'pending' && (
              <button
                onClick={() => onStatusChange(appointment.id, 'confirmed')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Confirm
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
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <button
                onClick={() => onStatusChange(appointment.id, 'cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Appointment Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Patient</label>
            <p className="text-gray-900">{appointment.patientName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-gray-900">{appointment.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
            <p className="text-gray-900">{appointment.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Doctor</label>
            <p className="text-gray-900">{appointment.doctor}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Service</label>
            <p className="text-gray-900">{appointment.service}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Date & Time</label>
            <p className="text-gray-900">{appointment.date} at {appointment.time}</p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="Add notes about this appointment..."
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
