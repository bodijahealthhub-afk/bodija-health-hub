function Pulse({ className = '' }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
}

export function ServiceSkeleton() {
  return (
    <div className="bg-warm-white rounded-2xl p-6 border border-gray-100">
      <Pulse className="w-12 h-12 rounded-xl mb-4" />
      <Pulse className="h-4 w-3/4 mb-3" />
      <Pulse className="h-3 w-full mb-1" />
      <Pulse className="h-3 w-2/3" />
    </div>
  )
}

export function ServicesSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <ServiceSkeleton key={i} />)}
    </div>
  )
}

export function EventSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
      <Pulse className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1">
        <Pulse className="h-4 w-3/4 mb-2" />
        <Pulse className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function EventsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <EventSkeleton key={i} />)}
    </div>
  )
}

export function BlogSkeleton() {
  return (
    <div className="bg-warm-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
      <div className="p-6">
        <Pulse className="h-3 w-16 mb-3" />
        <Pulse className="h-4 w-5/6 mb-2" />
        <Pulse className="h-3 w-full mb-1" />
        <Pulse className="h-3 w-3/4" />
      </div>
    </div>
  )
}

export function BlogSkeletons() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => <BlogSkeleton key={i} />)}
    </div>
  )
}

export function TestimonialSkeleton() {
  return (
    <div className="bg-warm-white rounded-2xl p-8 border border-gray-100">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, j) => <Pulse key={j} className="w-4 h-4 rounded" />)}
      </div>
      <Pulse className="h-3 w-full mb-2" />
      <Pulse className="h-3 w-full mb-2" />
      <Pulse className="h-3 w-2/3 mb-6" />
      <div className="pt-4 border-t border-gray-200">
        <Pulse className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export function TestimonialsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => <TestimonialSkeleton key={i} />)}
    </div>
  )
}

export function PartnerSkeleton() {
  return (
    <div className="bg-warm-white rounded-3xl p-8 border border-gray-100">
      <div className="flex items-start gap-4 mb-6">
        <Pulse className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1">
          <Pulse className="h-5 w-2/3 mb-2" />
        </div>
      </div>
      <Pulse className="h-3 w-full mb-2" />
      <Pulse className="h-3 w-3/4 mb-4" />
      <div className="flex gap-2">
        <Pulse className="h-6 w-16 rounded-full" />
        <Pulse className="h-6 w-20 rounded-full" />
        <Pulse className="h-6 w-14 rounded-full" />
      </div>
    </div>
  )
}

export function PartnersSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {[...Array(4)].map((_, i) => <PartnerSkeleton key={i} />)}
    </div>
  )
}
