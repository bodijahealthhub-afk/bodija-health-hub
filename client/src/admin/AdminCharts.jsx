// Lightweight dependency-free SVG charts used across the admin dashboard.

export function BarChart({ data, color = '#0D9488', height = 160, format = null }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-400 py-8 text-center">No data in this period</div>;
  }
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group">
          <div
            className="w-full rounded-t-sm transition-all group-hover:opacity-80"
            style={{
              height: `${Math.max((Number(d.value) / max) * 100, 2)}%`,
              backgroundColor: color,
              minWidth: '2px',
            }}
            title={d.label ? `${d.label}: ${format ? format(d.value) : d.value}` : undefined}
          />
          {d.label && <span className="text-[10px] text-gray-400 mt-1 truncate w-full text-center">{d.label}</span>}
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, color = '#0D9488', height = 160, format = null }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-400 py-8 text-center">No data in this period</div>;
  }
  const values = data.map((d) => Number(d.value) || 0);
  const max = Math.max(...values, 1);
  const width = 100;
  const pad = 4;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = values.length > 1 ? pad + i * step : width / 2;
    const y = height - pad - (v / max) * (height - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const [x, y] = p.split(',').map(Number);
        return (
          <circle key={i} cx={x} cy={y} r="1.6" fill={color}>
            <title>{data[i]?.label ? `${data[i].label}: ${format ? format(values[i]) : values[i]}` : undefined}</title>
          </circle>
        );
      })}
    </svg>
  );
}

export function Donut({ segments = [], size = 140 }) {
  const total = segments.reduce((s, seg) => s + (Number(seg.value) || 0), 0);
  if (!total) {
    return <div className="text-sm text-gray-400 py-6 text-center">No data</div>;
  }
  const radius = size / 2;
  const stroke = 14;
  const c = 2 * Math.PI * (radius - stroke / 2);
  let offset = 0;

  return (
    <div className="flex items-center justify-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={radius} cy={radius} r={radius - stroke / 2} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const len = (Number(seg.value) / total) * c;
          const el = (
            <circle
              key={i}
              cx={radius}
              cy={radius}
              r={radius - stroke / 2}
              fill="none"
              stroke={seg.color || '#0D9488'}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${radius} ${radius})`}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="space-y-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center text-sm">
            <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: seg.color || '#0D9488' }} />
            <span className="text-gray-700 capitalize">{seg.label}</span>
            <span className="ml-auto pl-3 font-medium text-gray-900">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
