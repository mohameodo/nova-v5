export const NewsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-gray-800/50 rounded-xl overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-700/50" />
        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <div className="w-24 h-4 bg-gray-700/50 rounded" />
            <div className="w-20 h-4 bg-gray-700/50 rounded" />
          </div>
          <div className="h-6 bg-gray-700/50 rounded w-full" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-700/50 rounded w-full" />
            <div className="h-4 bg-gray-700/50 rounded w-3/4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
