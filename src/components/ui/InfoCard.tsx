import React from 'react';

interface InfoCardProps {
  eyebrow: string;
  title: string;
  iconSrc?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** Borderless editorial card: icon + eyebrow/title header, content below. */
export const InfoCard: React.FC<InfoCardProps> = ({ eyebrow, title, iconSrc, action, children }) => (
  <section className="bg-white rounded-[24px] px-5 sm:px-7 pt-5 pb-3 sm:pt-6 shadow-[0_6px_22px_rgba(13,19,33,0.055)]">
    <div className="flex items-center justify-between gap-3 mb-1">
      <div className="flex items-center gap-3 min-w-0">
        {iconSrc && (
          <img src={iconSrc} alt="" aria-hidden="true" className="w-10 h-10 object-contain shrink-0" />
        )}
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A742B] block">
            {eyebrow}
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-[#161C2C] leading-tight truncate">
            {title}
          </h2>
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  accent?: boolean;
  wide?: boolean;
}

/** Hairline-separated key/value row. Use inside <InfoGrid>. */
export const InfoRow: React.FC<InfoRowProps> = ({ label, children, mono, accent, wide }) => (
  <div
    className={`py-3 border-b border-[#F1ECE2] flex items-baseline justify-between gap-4 ${
      wide ? 'sm:col-span-2' : ''
    }`}
  >
    <span className="text-[11px] font-semibold text-slate-400 shrink-0">{label}</span>
    <span
      className={`text-sm font-semibold text-right min-w-0 break-words ${
        accent ? 'text-[#9A742B]' : 'text-[#161C2C]'
      } ${mono ? 'font-mono tabular-nums' : ''}`}
    >
      {children}
    </span>
  </div>
);

export const InfoGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-10 [&>div:last-child]:border-b-0 sm:[&>div:nth-last-child(2):nth-child(odd)]:border-b-0">
    {children}
  </div>
);
