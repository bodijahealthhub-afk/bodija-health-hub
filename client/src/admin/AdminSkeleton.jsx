export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SkeletonBlock className="h-32 mb-8 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <SkeletonBlock className="h-64 lg:col-span-2" />
          <SkeletonBlock className="h-64" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6">
      <div className="flex items-center gap-4 mb-4">
        <SkeletonBlock className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonBlock className="h-20" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-10" />
      <SkeletonBlock className="h-10" />
      <SkeletonBlock className="h-24" />
      <SkeletonBlock className="h-10 w-1/3" />
    </div>
  );
}
