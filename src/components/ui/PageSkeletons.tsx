import React from 'react';

export const GenericPageSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 pb-24 fade-in-soft">
    <div className="bg-[#1E2538] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-3">
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
  <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-7 space-y-5 pb-28 fade-in-soft">
    {/* Digital Member Card Skeleton */}
    <div className="rounded-3xl bg-[#1E2538] p-6 h-56 sm:h-60 flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl skeleton-shimmer-dark" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded-md skeleton-shimmer-dark" />
            <div className="h-3 w-24 rounded-md skeleton-shimmer-dark" />
          </div>
        </div>
        <div className="h-7 w-20 rounded-full skeleton-shimmer-dark" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-48 rounded-md skeleton-shimmer-dark" />
        <div className="h-3.5 w-32 rounded-md skeleton-shimmer-dark" />
      </div>
    </div>

    {/* Quick Action Buttons Skeleton */}
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-12 rounded-2xl bg-white border border-slate-200/70 skeleton-shimmer" />
      ))}
    </div>

    {/* Progress / Stats Card Skeleton */}
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded-md skeleton-shimmer" />
        <div className="h-4 w-20 rounded-md skeleton-shimmer" />
      </div>
      <div className="h-3 w-full rounded-full skeleton-shimmer" />
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="h-20 rounded-xl skeleton-shimmer" />
        <div className="h-20 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  </div>
);

export const EventsPageSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-24 fade-in-soft">
    <div className="bg-[#1E2538] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="space-y-2">
        <div className="h-6 w-32 rounded-lg skeleton-shimmer-dark" />
        <div className="h-3.5 w-60 max-w-full rounded-md skeleton-shimmer-dark" />
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="h-10 rounded-full skeleton-shimmer-dark" />
        <div className="h-10 rounded-full skeleton-shimmer-dark" />
      </div>
    </div>

    <div className="flex items-center gap-2 overflow-hidden py-1">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-9 w-24 shrink-0 rounded-full skeleton-shimmer" />
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
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 pb-24 fade-in-soft">
    <div className="h-48 sm:h-60 w-full rounded-3xl bg-[#1E2538] p-6 flex flex-col justify-end space-y-3">
      <div className="h-5 w-48 rounded-lg skeleton-shimmer-dark" />
      <div className="h-3.5 w-72 max-w-full rounded-md skeleton-shimmer-dark" />
    </div>
    <div className="h-11 w-full rounded-2xl skeleton-shimmer" />
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
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 pb-24 fade-in-soft">
    <div className="bg-[#1E2538] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-3">
      <div className="h-6 w-52 rounded-lg skeleton-shimmer-dark" />
      <div className="h-3.5 w-72 max-w-full rounded-md skeleton-shimmer-dark" />
      <div className="h-11 w-full rounded-xl skeleton-shimmer-dark mt-2" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-10 rounded-xl skeleton-shimmer" />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/70 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl shrink-0 skeleton-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
            <div className="h-3 w-2/3 rounded-md skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
