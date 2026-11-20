import React from 'react';

/**
 * 1. Home Page Skeleton (also exported as GenericPageSkeleton for root loading.tsx)
 * Matches:
 * - Obsidian stage (`luxury-stage`) with slim Member Card (`h-[180px] sm:h-[196px]`), Points Bar, and 4 Quick Menu tiles
 * - Overlapping Warm Ivory sheet (`rounded-t-[32px] -mt-7`) with Privilege Full-Bleed Cards & Circular Industry Medallions
 */
export const HomePageSkeleton: React.FC = () => (
  <div className="w-full bg-[#F6F4EF] pb-4 fade-in-soft">
    {/* 1. Obsidian Stage */}
    <section className="relative overflow-hidden luxury-stage text-white pt-4 pb-16 px-4 sm:px-6 border-b border-[#C5A059]/30">
      <div className="relative z-10 max-w-4xl mx-auto space-y-4">
        {/* Slim Member Card Skeleton */}
        <div className="max-w-xl mx-auto space-y-3">
          <div
            className="w-full h-[180px] sm:h-[196px] rounded-[22px] px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col justify-between bg-[#090D18]/85 shadow-[0_18px_40px_rgba(4,8,18,0.45)]"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(223,194,125,0.28)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg skeleton-shimmer-dark" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 rounded-md skeleton-shimmer-dark" />
                  <div className="h-2.5 w-24 rounded-md skeleton-shimmer-dark" />
                </div>
              </div>
              <div className="h-5 w-20 rounded-full skeleton-shimmer-dark" />
            </div>

            <div className="space-y-1.5 max-w-[60%]">
              <div className="h-5 w-44 max-w-full rounded-md skeleton-shimmer-dark" />
              <div className="h-3 w-32 rounded-md skeleton-shimmer-dark" />
              <div className="h-3 w-28 rounded-md skeleton-shimmer-dark" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <div className="h-3.5 w-24 rounded-md skeleton-shimmer-dark" />
              <div className="w-7 h-7 rounded-lg skeleton-shimmer-dark" />
            </div>
          </div>

          <div className="flex justify-center pt-1">
            <div className="h-9 w-40 rounded-xl skeleton-shimmer" />
          </div>
        </div>

        {/* Layered Points Strip Skeleton */}
        <div className="rounded-2xl bg-[#141C2F]/80 border border-[#C5A059]/25 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl skeleton-shimmer-dark" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 rounded skeleton-shimmer-dark" />
              <div className="h-4 w-28 rounded skeleton-shimmer-dark" />
            </div>
          </div>
          <div className="h-7 w-24 rounded-full skeleton-shimmer-dark" />
        </div>

        {/* 4 Quick Menu Tiles */}
        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#161F35]/75 border border-white/10 py-3 px-2 flex flex-col items-center gap-2"
            >
              <div className="w-11 h-11 rounded-2xl skeleton-shimmer-dark" />
              <div className="h-3 w-14 rounded skeleton-shimmer-dark" />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 2. Overlapping Warm Ivory Sheet */}
    <div className="relative z-20 -mt-7 rounded-t-[32px] luxury-sheet pt-6 pb-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-7">
        {/* Section 1: Privileges Horizontal Full-Bleed Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-2.5 w-24 rounded skeleton-shimmer" />
              <div className="h-5 w-44 rounded-md skeleton-shimmer" />
            </div>
            <div className="h-4 w-16 rounded skeleton-shimmer" />
          </div>
          <div className="flex gap-3.5 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[248px] sm:w-[272px] h-[296px] shrink-0 rounded-[24px] skeleton-shimmer"
              />
            ))}
          </div>
        </div>

        {/* Section 2: Circular Industry Medallions */}
        <div className="space-y-3">
          <div className="h-5 w-48 rounded-md skeleton-shimmer" />
          <div className="flex gap-4 overflow-hidden">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-[76px]">
                <div className="w-16 h-16 rounded-full skeleton-shimmer" />
                <div className="h-2.5 w-14 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const GenericPageSkeleton = HomePageSkeleton;

/**
 * 2. Directory Page Skeleton
 * Matches:
 * - Curved Obsidian Stage Header with Search + Filter buttons + Industry pills
 * - Overlapping Warm Ivory sheet (`rounded-t-[32px] -mt-7`)
 * - 2-column grid of Slim Obsidian Member Cards (`h-[170px] sm:h-[180px] rounded-[20px]`)
 */
export const DirectoryPageSkeleton: React.FC = () => (
  <div className="w-full bg-[#F6F4EF] pb-4 fade-in-soft">
    {/* 1. Obsidian Stage Header */}
    <section className="sticky top-0 md:top-24 z-30 luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)] overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="h-6 w-48 rounded-lg skeleton-shimmer-dark" />
            <div className="h-3 w-36 rounded-md skeleton-shimmer-dark" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 rounded-xl skeleton-shimmer-dark" />
            <div className="h-9 w-24 rounded-xl skeleton-shimmer-dark" />
          </div>
        </div>

        {/* Search Input */}
        <div className="h-11 w-full rounded-2xl skeleton-shimmer-dark" />

        {/* Industry Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-hidden pt-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-28 shrink-0 rounded-full skeleton-shimmer-dark" />
          ))}
        </div>
      </div>
    </section>

    {/* 2. Warm Ivory Content Sheet */}
    <div className="relative z-10 pt-5 pb-4 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 rounded-md skeleton-shimmer" />
          <div className="h-8 w-36 rounded-xl skeleton-shimmer" />
        </div>

        {/* Slim Obsidian Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="relative h-[170px] sm:h-[180px] rounded-[20px] px-4 py-3 sm:px-4.5 sm:py-3.5 flex flex-col justify-between bg-[#0D1321] overflow-hidden shadow-[0_10px_26px_rgba(9,13,24,0.16)]"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(223,194,125,0.22)' }}
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 rounded-full skeleton-shimmer-dark" />
                <div className="w-7 h-7 rounded-full skeleton-shimmer-dark" />
              </div>

              <div className="space-y-1.5 max-w-[55%]">
                <div className="h-4 w-40 max-w-full rounded-md skeleton-shimmer-dark" />
                <div className="h-3 w-32 rounded-md skeleton-shimmer-dark" />
                <div className="h-2.5 w-24 rounded-md skeleton-shimmer-dark" />
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/[0.08]">
                <div className="h-6 rounded-full skeleton-shimmer-dark" />
                <div className="h-6 rounded-full skeleton-shimmer-dark" />
                <div className="h-6 rounded-full skeleton-shimmer-dark" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * 3. Privileges Page Skeleton
 * Matches:
 * - Curved Obsidian Header with Title, Points Pill, Search Bar & 5 Circular Icon Category Buttons
 * - Overlapping Warm Ivory Sheet (`rounded-t-[32px] -mt-7`) with Spotlight Banner + 3-col Borderless Cards
 */
export const PrivilegesPageSkeleton: React.FC = () => (
  <div className="w-full bg-[#F6F4EF] pb-4 fade-in-soft">
    <section className="sticky top-0 md:top-24 z-30 luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)] overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1.5">
            <div className="h-6 w-48 rounded-lg skeleton-shimmer-dark" />
            <div className="h-3 w-40 rounded-md skeleton-shimmer-dark" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 rounded-full skeleton-shimmer-dark" />
            <div className="h-8 w-24 rounded-full skeleton-shimmer-dark" />
          </div>
        </div>

        {/* Search Input */}
        <div className="h-11 w-full rounded-2xl skeleton-shimmer-dark" />

        {/* Icon Category Bar */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl py-2.5 px-1.5 bg-white/[0.06] flex flex-col items-center gap-1.5"
            >
              <div className="w-9 h-9 rounded-xl skeleton-shimmer-dark" />
              <div className="h-2.5 w-12 rounded skeleton-shimmer-dark" />
            </div>
          ))}
        </div>
      </div>
    </section>

    <div className="relative z-10 pt-5 pb-4 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Featured Spotlight Banner */}
        <div className="h-44 sm:h-52 w-full rounded-[24px] skeleton-shimmer" />

        {/* Borderless Privilege Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_24px_rgba(13,19,33,0.055)]"
            >
              <div className="h-44 w-full skeleton-shimmer" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
                <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
                <div className="h-9 w-full rounded-xl skeleton-shimmer mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * 4. Events Page Skeleton
 * Matches:
 * - Curved Obsidian Stage Header with Title + Calendar/My Tickets pills + Search + Filter Pills
 * - Overlapping Warm Ivory Sheet (`rounded-t-[32px] -mt-7`) with 3-col Full-Bleed Dark Event Cards (`h-[340px] rounded-[24px]`)
 */
export const EventsPageSkeleton: React.FC = () => (
  <div className="w-full bg-[#F6F4EF] pb-4 fade-in-soft">
    <section className="sticky top-0 md:top-24 z-30 luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)] overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1.5">
            <div className="h-6 w-48 rounded-lg skeleton-shimmer-dark" />
            <div className="h-3 w-52 max-w-full rounded-md skeleton-shimmer-dark" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded-xl skeleton-shimmer-dark" />
            <div className="h-9 w-24 rounded-xl skeleton-shimmer-dark" />
          </div>
        </div>

        {/* Search Input */}
        <div className="h-11 w-full rounded-2xl skeleton-shimmer-dark" />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-hidden pt-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-24 shrink-0 rounded-full skeleton-shimmer-dark" />
          ))}
        </div>
      </div>
    </section>

    <div className="relative z-10 pt-5 pb-4 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[340px] sm:h-[360px] rounded-[24px] p-5 flex flex-col justify-between bg-[#0D1321] shadow-[0_14px_34px_rgba(9,13,24,0.16)]"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-28 rounded-full skeleton-shimmer-dark" />
                <div className="h-6 w-20 rounded-full skeleton-shimmer-dark" />
              </div>
              <div className="space-y-2.5">
                <div className="h-3 w-32 rounded skeleton-shimmer-dark" />
                <div className="h-5 w-4/5 rounded-md skeleton-shimmer-dark" />
                <div className="h-3.5 w-3/5 rounded-md skeleton-shimmer-dark" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="h-9 rounded-full skeleton-shimmer-dark" />
                  <div className="h-9 rounded-full skeleton-shimmer-dark" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * 5. Profile Page Skeleton (No MemberCard — matches actual /profile page!)
 * Matches:
 * - Obsidian Luxury Profile Header with Round Avatar, Name, Badges, Edit button, and 3 Stat boxes
 * - Overlapping Warm Ivory Sheet (`rounded-t-[32px] -mt-7`) with Editorial InfoCards
 */
export const ProfilePageSkeleton: React.FC = () => (
  <div className="w-full bg-[#F6F4EF] pb-4 fade-in-soft">
    <section className="sticky top-0 md:top-24 z-30 luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)] overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full skeleton-shimmer-dark shrink-0" />
            <div className="space-y-2">
              <div className="h-5 w-44 rounded-md skeleton-shimmer-dark" />
              <div className="h-3.5 w-32 rounded-md skeleton-shimmer-dark" />
              <div className="flex gap-1.5 pt-0.5">
                <div className="h-5 w-20 rounded-full skeleton-shimmer-dark" />
                <div className="h-5 w-20 rounded-full skeleton-shimmer-dark" />
              </div>
            </div>
          </div>
          <div className="h-9 w-24 rounded-full skeleton-shimmer-dark shrink-0" />
        </div>

        {/* 3 Summary Stat Boxes */}
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/[0.06] border border-white/10 p-3 space-y-1.5"
            >
              <div className="h-2.5 w-16 rounded skeleton-shimmer-dark" />
              <div className="h-5 w-20 rounded skeleton-shimmer-dark" />
            </div>
          ))}
        </div>
      </div>
    </section>

    <div className="relative z-10 pt-5 pb-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {[0, 1, 2].map((cardIdx) => (
          <div
            key={cardIdx}
            className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-[#EFECE4]">
              <div className="w-9 h-9 rounded-xl skeleton-shimmer" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-24 rounded skeleton-shimmer" />
                <div className="h-4 w-36 rounded skeleton-shimmer" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((rowIdx) => (
                <div key={rowIdx} className="space-y-1.5">
                  <div className="h-2.5 w-20 rounded skeleton-shimmer" />
                  <div className="h-4 w-4/5 rounded skeleton-shimmer" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * 6. Participant Detail Page Skeleton (`/yfti_participants/[id]`)
 * Matches:
 * - Obsidian Hero Stage with right-faded portrait area, left name/company/badges, and 4 quick action pills
 * - Overlapping Warm Ivory Sheet (`rounded-t-[32px] -mt-7`) with Editorial InfoCards
 */
export const ParticipantDetailSkeleton: React.FC = () => (
  <div className="w-full bg-[#F6F4EF] pb-4 fade-in-soft">
    <section className="relative luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)] overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-8 w-36 rounded-full skeleton-shimmer-dark" />
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-full skeleton-shimmer-dark" />
            <div className="h-8 w-8 rounded-full skeleton-shimmer-dark" />
          </div>
        </div>

        <div className="space-y-2.5 max-w-[65%] py-2">
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full skeleton-shimmer-dark" />
            <div className="h-5 w-20 rounded-full skeleton-shimmer-dark" />
          </div>
          <div className="h-7 w-56 max-w-full rounded-lg skeleton-shimmer-dark" />
          <div className="h-4 w-44 max-w-full rounded-md skeleton-shimmer-dark" />
          <div className="h-3.5 w-36 max-w-full rounded-md skeleton-shimmer-dark" />
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-9 rounded-full skeleton-shimmer-dark" />
          ))}
        </div>
      </div>
    </section>

    <div className="relative z-10 pt-5 pb-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {[0, 1].map((cardIdx) => (
          <div
            key={cardIdx}
            className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_8px_26px_rgba(13,19,33,0.05)] space-y-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-[#EFECE4]">
              <div className="w-9 h-9 rounded-xl skeleton-shimmer" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-24 rounded skeleton-shimmer" />
                <div className="h-4 w-36 rounded skeleton-shimmer" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((rowIdx) => (
                <div key={rowIdx} className="space-y-1.5">
                  <div className="h-2.5 w-20 rounded skeleton-shimmer" />
                  <div className="h-4 w-4/5 rounded skeleton-shimmer" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
