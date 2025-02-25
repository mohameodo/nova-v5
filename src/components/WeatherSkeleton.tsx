import { motion } from 'framer-motion';

export const WeatherSkeleton = () => {
  return (
    <div className="max-w-lg bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden animate-pulse">
      <div className="p-4">
        {/* Location and temp skeleton */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-700/50 rounded" />
            <div className="h-4 w-24 bg-gray-700/50 rounded" />
          </div>
          <div className="h-8 w-16 bg-gray-700/50 rounded" />
        </div>

        {/* Current weather skeleton */}
        <div className="mt-4 flex gap-3">
          <div className="w-12 h-12 bg-gray-700/50 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-700/50 rounded" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-16 bg-gray-700/50 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forecast skeleton */}
      <div className="border-t border-gray-700/50 p-3">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-2 bg-gray-800/30 rounded-lg space-y-2">
              <div className="h-3 w-12 bg-gray-700/50 rounded mx-auto" />
              <div className="h-6 w-6 bg-gray-700/50 rounded mx-auto" />
              <div className="h-3 w-16 bg-gray-700/50 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
