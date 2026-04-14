export function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Progress indicator skeleton */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Form header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>

      {/* Form fields skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className="mt-8">
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
    </div>
  );
}
