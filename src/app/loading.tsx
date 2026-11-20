import { GenericPageSkeleton } from '@/components/ui/PageSkeletons';

export default function Loading() {
  return (
    <div className="relative w-full">
      {/* Floating Celestial Loading Pill */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[70] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1321]/90 backdrop-blur-md border border-[#DFC27D]/40 text-[#ECD28E] shadow-[0_8px_24px_rgba(9,13,24,0.3)] text-xs font-semibold">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-[#ECD28E] animate-star-twinkle" aria-hidden="true">
            <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6Z" />
          </svg>
          <span className="tracking-wide text-[11px] font-bold">YOUNG FTI 11</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ECD28E] animate-ping" />
        </div>
      </div>

      <GenericPageSkeleton />
    </div>
  );
}
