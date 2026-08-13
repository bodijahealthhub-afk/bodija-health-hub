import { useState, useEffect, useCallback } from 'react';

function StatusPill({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
      {label}
    </span>
  );
}

function HealthCard({ title, icon, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
          {title}
        </h2>
        {action}
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between py-2 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900 text-right">{children}</span>
  </div>
);

const I = {
  server: 'M9 17g-6 0a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2m-6-4l3 3m0 0l-3 3m3-3H3',
  database: 'M20 13c0 2.21-3.582 4-8 4s-8-1.79-8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4v10c0 2.21-3.582 4-8 4s-8-1.79-8-4V7z',
  storage: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  backups: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  payments: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  env: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
};

const fmtUptime = (s) => {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
};

const fmtDate = (str) => str ? new Date(str).toLocaleString() : '—';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/system-health', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHealth(await res.json());
      } else {
        setError('Failed to load system health');
      }
    } catch {
      setError('Could not reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-red-600 mb-4">{error || 'No health data available'}</p>
        <button onClick={fetchHealth} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
          Retry
        </button>
      </div>
    );
  }

  const counts = health.tableCounts || {};
  const tableNames = Object.keys(counts);
  const allTablesOk = tableNames.every((t) => counts[t] !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500 mt-1">Operational status of the server, database, storage, and integrations.</p>
        </div>
        <button
          onClick={fetchHealth}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Database</p>
          <div className="mt-1"><StatusPill ok={health.database.status === 'ok'} label={health.database.status === 'ok' ? 'Connected' : 'Error'} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Storage</p>
          <div className="mt-1"><StatusPill ok={health.storage.writable} label={health.storage.writable ? 'Writable' : 'Unavailable'} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Email</p>
          <div className="mt-1"><StatusPill ok={health.email.configured} label={health.email.configured ? 'Configured' : 'Not configured'} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Payments</p>
          <div className="mt-1"><StatusPill ok={!health.payments.mock} label={health.payments.mock ? 'Test mode' : 'Live'} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthCard title="Server" icon={I.server}>
          <Row label="Status"><StatusPill ok={health.server.status === 'ok'} label="Online" /></Row>
          <Row label="Uptime">{fmtUptime(health.server.uptime)}</Row>
          <Row label="Node version">{health.server.node}</Row>
          <Row label="Platform">{health.server.platform} ({health.server.hostname})</Row>
          <Row label="Memory">RSS {health.server.memory.rssMb} MB · Heap {health.server.memory.heapMb} MB</Row>
        </HealthCard>

        <HealthCard title="Database" icon={I.database}>
          <Row label="Driver">{health.database.driver}</Row>
          <Row label="Connection"><StatusPill ok={health.database.status === 'ok'} label={health.database.status === 'ok' ? 'Connected' : 'Error'} /></Row>
          {health.database.error && <p className="text-xs text-red-600 mt-2">{health.database.error}</p>}
          <Row label="Tables">{allTablesOk ? `${tableNames.length} reachable` : 'Some tables unreachable'}</Row>
        </HealthCard>

        <HealthCard title="Storage" icon={I.storage}>
          <Row label="Uploads directory">{health.storage.uploadsDir}</Row>
          <Row label="Exists"><StatusPill ok={health.storage.exists} label={health.storage.exists ? 'Yes' : 'No'} /></Row>
          <Row label="Writable"><StatusPill ok={health.storage.writable} label={health.storage.writable ? 'Yes' : 'No'} /></Row>
          {health.storage.freeGb !== undefined && <Row label="Free space">{health.storage.freeGb} GB</Row>}
        </HealthCard>

        <HealthCard title="Backups" icon={I.backups}>
          <Row label="Backup records">{health.backups.count}</Row>
          <Row label="Latest backup">{fmtDate(health.backups.latest)}</Row>
        </HealthCard>

        <HealthCard title="Email" icon={I.email}>
          <Row label="Configured"><StatusPill ok={health.email.configured} label={health.email.configured ? 'Yes' : 'No'} /></Row>
          {health.email.host && <Row label="SMTP host">{health.email.host}</Row>}
          {health.email.from && <Row label="From">{health.email.from}</Row>}
          {!health.email.configured && <p className="text-xs text-gray-400 mt-2">Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in the server environment to enable transactional email.</p>}
        </HealthCard>

        <HealthCard title="Payments" icon={I.payments}>
          <Row label="Gateway"><StatusPill ok={health.payments.gatewayConfigured} label={health.payments.gatewayConfigured ? 'Paystack configured' : 'None configured'} /></Row>
          <Row label="Mode"><StatusPill ok={!health.payments.mock} label={health.payments.mock ? 'Test mode' : 'Live'} /></Row>
          <Row label="Feature flag">{health.payments.flagEnabled ? 'Enabled' : 'Disabled'}</Row>
          {health.payments.mock && <p className="text-xs text-amber-600 mt-2">No Paystack secret key is set — payments run in test mode and are not processed against a real gateway.</p>}
        </HealthCard>

        <HealthCard title="Table row counts" icon={I.database}>
          <div className="grid grid-cols-2 gap-x-6">
            {tableNames.map((t) => (
              <Row key={t} label={t}>{counts[t] === null ? '—' : counts[t]}</Row>
            ))}
          </div>
        </HealthCard>

        <HealthCard title="Environment" icon={I.env}>
          <Row label="DB_PATH">{health.env.DB_PATH ? 'Set' : 'Not set'}</Row>
          <Row label="DATABASE_URL">{health.env.DATABASE_URL ? 'Set' : 'Not set'}</Row>
          <Row label="DB_BACKEND">{health.env.DB_BACKEND || 'sqlite'}</Row>
          <Row label="SMTP_HOST">{health.env.SMTP_HOST ? 'Set' : 'Not set'}</Row>
          <Row label="PAYSTACK_SECRET_KEY">{health.env.PAYSTACK_SECRET_KEY ? 'Set' : 'Not set'}</Row>
          <Row label="PAYSTACK_MOCK">{health.env.PAYSTACK_MOCK || 'Not set'}</Row>
          <Row label="SENTRY_DSN">{health.env.SENTRY_DSN ? 'Set' : 'Not set'}</Row>
        </HealthCard>
      </div>
    </div>
  );
}
