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

const APPOINTMENT_STATUSES = ['requested', 'new', 'under_review', 'reviewed', 'contacted', 'confirmed', 'rescheduled', 'in_progress', 'completed', 'cancelled', 'declined', 'expired', 'no_show', 'archived'];

const AppointmentDetail = ({ appointment, isOpen, onClose, onStatusChange }) => {
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
      setInternalNotes(appointment.internalNotes || '');
      setAssignedTo(appointment.assignedTo || '');
    }
  }, [appointment]);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('adminToken');
      fetch('/api/auth/users', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setUsers(Array.isArray(data) ? data : data?.users || []))
        .catch(() => setUsers([]));
    }
  }, [isOpen]);

  if (!appointment) return null;

  const actionable = ['requested', 'new', 'pending'].includes(appointment.status);

  const handleSaveNotes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/appointments/${appointment.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes, internal_notes: internalNotes }),
      });
    } catch { /* Update locally */ }
    onClose();
  };

  const handleAssign = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/appointments/${appointment.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assigned_to: assignedTo || null }),
      });
    } catch { /* Update locally */ }
    onClose();
  };

  const DetailRow = ({ label, value }) => (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <p className="text-gray-900">{value || '\u2014'}</p>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Service Request Details" size="lg">
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
              <button onClick={() => onStatusChange(appointment.id, 'under_review')} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">Review</button>
            )}
            {actionable && (
              <button onClick={() => onStatusChange(appointment.id, 'confirmed')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Confirm</button>
            )}
            {actionable && (
              <button onClick={() => onStatusChange(appointment.id, 'declined')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Decline</button>
            )}
            {appointment.status === 'confirmed' && (
              <button onClick={() => onStatusChange(appointment.id, 'completed')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Complete</button>
            )}
            {!['cancelled', 'completed', 'declined', 'expired', 'archived'].includes(appointment.status) && (
              <button onClick={() => onStatusChange(appointment.id, 'cancelled')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Cancel</button>
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
          <DetailRow label="Preferred Date &amp; Time" value={`${appointment.preferredDate || appointment.date || 'Flexible'}${appointment.preferredTime || appointment.time ? ` at ${appointment.preferredTime || appointment.time}` : ''}`} />
          <DetailRow label="Booking Method" value={appointment.bookingMethod} />
          <DetailRow label="Source" value={appointment.source || 'website'} />
          <DetailRow label="Location Preference" value={appointment.locationPreference} />
          <DetailRow label="Assigned To" value={appointment.assignedToName || 'Unassigned'} />
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

        {/* Assign to team member */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Team Member</label>
          <div className="flex gap-2">
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
            <button onClick={handleAssign} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">Assign</button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="Add notes about this booking..."
          />
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes (admin only)</label>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-gray-50"
            placeholder="Internal notes (not visible to patients)..."
          />
        </div>

        {/* Timestamps */}
        {(appointment.reviewedAt || appointment.confirmedAt || appointment.completedAt || appointment.cancelledAt) && (
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            {appointment.reviewedAt && <div>Reviewed: {new Date(appointment.reviewedAt).toLocaleString()}</div>}
            {appointment.confirmedAt && <div>Confirmed: {new Date(appointment.confirmedAt).toLocaleString()}</div>}
            {appointment.completedAt && <div>Completed: {new Date(appointment.completedAt).toLocaleString()}</div>}
            {appointment.cancelledAt && <div>Cancelled: {new Date(appointment.cancelledAt).toLocaleString()}</div>}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">Close</button>
          <button onClick={handleSaveNotes} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">Save Notes</button>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentDetail;
