import React from 'react';

function Shimmer({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg bg-[length:200%_100%] ${className}`} />
  );
}

export default function SkeletonCard() {
  return (
    <div className="bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-md border border-white/80 dark:border-slate-700/80 p-6 flex flex-col gap-4">
      {/* Driver info */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Shimmer className="h-5 w-32 mb-2" />
          <Shimmer className="h-3.5 w-24" />
        </div>
        <Shimmer className="h-7 w-16 rounded-full" />
      </div>

      {/* Route */}
      <div className="flex gap-3 my-1">
        <div className="flex flex-col items-center gap-1 mt-1">
          <Shimmer className="w-2 h-2 rounded-full" />
          <Shimmer className="w-0.5 h-8" />
          <Shimmer className="w-2 h-2 rounded-full" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <Shimmer className="h-3 w-10 mb-1" />
            <Shimmer className="h-4 w-36" />
          </div>
          <div>
            <Shimmer className="h-3 w-10 mb-1" />
            <Shimmer className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Departure Time */}
      <Shimmer className="h-9 w-full rounded-lg" />

      {/* Button */}
      <Shimmer className="h-10 w-full rounded-xl mt-auto" />
    </div>
  );
}
