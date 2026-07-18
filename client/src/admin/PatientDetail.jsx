import Modal from './Modal';
import StatusBadge from './StatusBadge';

const PatientDetail = ({ patient, isOpen, onClose }) => {
  if (!patient) return null;

  const mockVisits = [
    { id: 1, date: '2026-07-10', doctor: 'Dr. Adewale', service: 'General Checkup', status: 'completed', notes: 'All vitals normal' },
    { id: 2, date: '2026-06-15', doctor: 'Dr. Olumide', service: 'Blood Test', status: 'completed', notes: 'Results within range' },
    { id: 3, date: '2026-05-20', doctor: 'Dr. Amina', service: 'Consultation', status: 'completed', notes: 'Prescribed vitamins' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Profile" size="xl">
      <div className="space-y-6">
        {/* Patient Info Header */}
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-teal-700">{patient.name?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
            <p className="text-gray-500">{patient.email}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span>{patient.phone}</span>
              <span>{patient.age} years</span>
              <span>{patient.gender}</span>
              {patient.bloodGroup && <span>Blood: {patient.bloodGroup}</span>}
            </div>
          </div>
        </div>

        {/* Address */}
        {patient.address && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
            <p className="text-gray-900">{patient.address}</p>
          </div>
        )}

        {/* Medical History */}
        {patient.medicalHistory && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Medical History</label>
            <p className="text-gray-900">{patient.medicalHistory}</p>
          </div>
        )}

        {/* Visit History */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Visit History</h4>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{visit.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{visit.doctor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{visit.service}</td>
                    <td className="px-4 py-3"><StatusBadge status={visit.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{visit.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PatientDetail;
