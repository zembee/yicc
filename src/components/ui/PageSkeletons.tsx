import React from 'react';

export const GenericPageSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 pb-24 fade-in-soft">
    <div className="bg-[#1E2538] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-b-[3px] border-[#FB7170] space-y-3 shadow-sm">
      <div className="h-6 w-44 rounded-lg skeleton-shimmer-dark" />
      <div className="h-3.5 w-64 max-w-full rounded-md skeleton-shimmer-dark" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/70 p-4 space-y-3.5 shadow-sm"
        >
          <div className="h-40 w-full rounded-xl skeleton-shimmer" />
          <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
          <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
        </div>
      ))}
    </div>
  </div>
);

export const ProfilePageSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-5 pb-28 fade-in-soft">
    {/* Digital Member Card Skeleton */}
    <div className="max-w-xl mx-auto space-y-3">
      <div className="rounded-3xl bg-[#1E2538] p-6 h-56 sm:h-64 flex flex-col justify-between shadow-lg border-b-[3px] border-[#FB7170]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl skeleton-shimmer-dark" />
            <div className="space-y-2">
              <div className="h-4 w-36 rounded-md skeleton-shimmer-dark" />
              <div className="h-3 w-24 rounded-md skeleton-shimmer-dark" />
            </div>
          </div>
          <div className="h-6 w-16 rounded-full skeleton-shimmer-dark" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl skeleton-shimmer-dark shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 max-w-full rounded-md skeleton-shimmer-dark" />
            <div className="h-3.5 w-32 rounded-md skeleton-shimmer-dark" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <div className="h-4 w-24 rounded-md skeleton-shimmer-dark" />
          <div className="w-8 h-8 rounded-lg skeleton-shimmer-dark" />
        </div>
      </div>

      {/* Centered Flip Button Skeleton */}
      <div className="flex justify-center pt-1">
        <div className="h-10 w-44 rounded-xl bg-white border border-slate-200/70 skeleton-shimmer" />
      </div>
    </div>

    {/* Personal Info Card Skeleton */}
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="space-y-2">
        <div className="h-5 w-48 rounded-md skeleton-shimmer" />
        <div className="h-3.5 w-36 rounded-md skeleton-shimmer" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-24 rounded-full skeleton-shimmer" />
          <div className="h-6 w-24 rounded-full skeleton-shimmer" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-11 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>

    {/* Progress / Stats Card Skeleton */}
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded-md skeleton-shimmer" />
        <div className="h-6 w-24 rounded-full skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  </div>
);

export const EventsPageSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-24 fade-in-soft">
    <div className="bg-[#1E2538] rounded-2xl p-5 sm:p-6 border-b-[3px] border-[#FB7170] space-y-4 shadow-sm">
      <div className="space-y-2">
        <div className="h-6 w-48 rounded-lg skeleton-shimmer-dark" />
        <div className="h-3.5 w-60 max-w-full rounded-md skeleton-shimmer-dark" />
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="h-10 rounded-xl skeleton-shimmer-dark" />
        <div className="h-10 rounded-xl skeleton-shimmer-dark" />
      </div>
    </div>

    <div className="flex items-center gap-2 overflow-hidden py-1">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-9 w-24 shrink-0 rounded-xl skeleton-shimmer" />
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">
          <div className="h-44 w-full skeleton-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-4/5 rounded-md skeleton-shimmer" />
            <div className="h-3 w-3/5 rounded-md skeleton-shimmer" />
            <div className="h-9 w-full rounded-xl skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PrivilegesPageSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 space-y-5 pb-24 fade-in-soft">
    <div className="bg-[#1E2538] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-b-[3px] border-[#FB7170] space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 rounded-lg skeleton-shimmer-dark" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-full skeleton-shimmer-dark" />
          <div className="h-8 w-20 rounded-full skeleton-shimmer-dark" />
        </div>
      </div>
      <div className="h-10 w-full rounded-full skeleton-shimmer-dark" />
    </div>
    <div className="h-44 sm:h-56 w-full rounded-2xl skeleton-shimmer" />
    <div className="flex gap-2 overflow-hidden">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-9 w-24 shrink-0 rounded-full skeleton-shimmer" />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">
          <div className="h-40 w-full skeleton-shimmer" />
          <div className="p-4 space-y-2.5">
            <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const DirectoryPageSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 pb-24 fade-in-soft">
    <div className="bg-[#1E2538] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-b-[3px] border-[#FB7170] space-y-4 shadow-sm">
      <div className="space-y-1.5">
        <div className="h-6 w-56 rounded-lg skeleton-shimmer-dark" />
        <div className="h-3.5 w-28 rounded-md skeleton-shimmer-dark" />
      </div>
      <div className="flex gap-2.5">
        <div className="h-11 flex-1 rounded-xl skeleton-shimmer-dark" />
        <div className="h-11 w-11 rounded-xl skeleton-shimmer-dark shrink-0" />
      </div>
    </div>
    <div className="flex gap-2 overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-8 w-32 shrink-0 rounded-full skeleton-shimmer" />
      ))}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">
          <div className="aspect-[4/4.5] w-full skeleton-shimmer" />
          <div className="p-3 sm:p-4 space-y-2">
            <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
