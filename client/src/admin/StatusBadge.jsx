import { useState } from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    active: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
    published: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    unread: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    read: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      {status}
    </span>
  );
};

export default StatusBadge;
