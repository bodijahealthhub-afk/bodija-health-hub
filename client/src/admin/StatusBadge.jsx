const statusConfig = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  requested: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  new: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  reviewed: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  contacted: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  rescheduled: { bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-500' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  declined: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  no_show: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  active: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  coming_soon: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
  published: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  unread: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  read: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      {status}
    </span>
  );
};

export default StatusBadge;
