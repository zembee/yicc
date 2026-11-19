---
name: yfti-design-system
description: Design system and UI architecture guide for Young FTI ELITE 11 (YICC) Member Portal. Use whenever creating, redesigning, or updating any page, modal, header, card, or loading state so all screens stay visually consistent with the LINE Member Portal and Home page template.
---

# Young FTI ELITE 11 (YICC) Design System

Follow this design system for all pages and components in the YICC Member Portal so the transition from LINE Rich Menu / Flex Cards into the web app feels unified and premium.

## 1. Core Color Palette
- **Executive Navy (Primary Dark)**: `#141A2C` → `#1E2538` → `#252E46`
- **Signature Coral Red (Brand Accent)**: `#FB7170` (3px bottom bar on all dark navy headers, subtitles, active indicators, coral chevrons)
- **Champagne Gold (VIP / Reward Accent)**: `#C59B38` / `#E5C158` — for gold badges, point pills, and gold CTAs, use `.badge-gold-metallic` (matte satin champagne gold `#B08832 → #CEAA56 → #A67F2A` with crisp white text and subtle top bevel so it harmonizes with Executive Navy without glowing loudly).
- **Page Canvas Background**: `#F4F6FA` (cool light gray)
- **Card Surface**: `#FFFFFF` with `border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)]`
- **Inner Attribute / Row Surface**: `#F8FAFC` with `border border-slate-200/70`

## 2. Signature Page Hero Banner Pattern
Every top-level page (`Home`, `Directory`, `Activities & Courses`, `Privileges`, `Notifications`, `About`, `Contact`, `News`, `My Tickets`, `Calendar`, `Profile Events`) uses the **Executive Navy Stage Hero**:
- Background: `bg-[#141A2C]` with blended cohort/stage photo (`opacity-25`, `https://ygtiouphuajowaistiru.supabase.co/storage/v1/object/public/participants-assets/events/25680523-Y11-YoungFTI_1683-scaled.webp`) covered by a directional navy gradient (`linear-gradient(115deg, rgba(16,22,38,0.96) 28%, rgba(24,31,52,0.88) 58%, rgba(30,37,56,0.65) 100%)`).
- Bottom Accent: Always include `border-b-[3px] border-[#FB7170]`.
- Typography:
  - Optional eyebrow: `text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300`
  - Split-weight heading: **`<span className="font-extrabold">Primary</span> <span className="font-light text-white/95">Secondary</span>`**
  - Subtitle: `text-xs font-medium text-[#FB7170]` (or `text-slate-300` for secondary info)
- Corner Radius: `rounded-2xl sm:rounded-3xl` (or `rounded-b-[28px]` for full-bleed heroes like Home).

## 3. Split-Tone Section Cards
For featured multi-item cards (e.g. `House Leaderboard`, `ภารกิจที่ต้องเก็บ`, `กิจกรรม/คลาสที่ใกล้มาถึง`):
- **Top Header**: `bg-gradient-to-r from-[#181E30] to-[#1E2538] text-white px-5 py-4 border-b-[3px] border-[#FB7170]` with a custom WebP icon (`w-10 h-10 rounded-xl ring-1 ring-white/15`) and a white capsule CTA pill (`bg-white text-[#1E2538]` + coral `ChevronRight`).
- **Bottom Body**: Crisp white surface (`bg-white p-3.5 sm:p-4`) with `#F8FAFC` item rows (`rounded-2xl border border-slate-200/70`).

## 4. Custom WebP Icon Library (Prefer Over Font Icons for Key Visuals)
- **UI & Industry Icons** (`public/images/icons/*.webp`, 256×256 transparent WebP):
  - Shortcuts: `privileges.webp`, `courses.webp`, `events.webp`, `business.webp`
  - Industries: `tech.webp`, `services.webp`, `consumer.webp`, `industrial.webp`, `agriculture.webp`, `construction.webp`, `resources.webp`, `finance.webp`
  - Core Features: `points.webp`, `profile.webp`, `missions.webp`, `house.webp`
- **Planet House Emblems** (`public/images/planets/*.webp`, 256×256 transparent WebP):
  - `the_sun.webp`, `mercury.webp`, `venus.webp`, `earth.webp`, `the_mars.webp`, `jupiter.webp`, `saturn.webp`, `uranus.webp`, `neptune.webp`

## 5. Controls, Buttons & Corners
- **Inputs, Search Bars, QR Buttons, Filter Tabs & Action Buttons**: Use `rounded-xl` (not `rounded-full`) for clean architectural consistency.
- **Section "View All" Links**:
  - On light canvas: `px-3 py-1 rounded-full bg-[#1E2538] text-white text-[11px] font-bold` with coral chevron (`text-[#FB7170]`).
  - On dark navy header: `px-3 py-1 rounded-full bg-white text-[#1E2538] text-[11px] font-bold` with coral chevron (`text-[#FB7170]`).
- **Mobile Pagination**: Keep single-row (`flex-nowrap`), hide `ChevronsLeft`/`ChevronsRight` on mobile (`hidden sm:inline-flex`).

## 6. Loading States
- **App Splash (`LoginGate`)**: Dark Navy `#1E2538` card with `border-b-[3px] border-[#FB7170]`, Y11 logo on white `rounded-2xl` frame, split-weight brand title, and smooth indeterminate `loading-bar-slide` progress bar.
- **Page Skeletons (`PageSkeletons.tsx`)**: Mirror actual page headers (including `border-b-[3px] border-[#FB7170]`) and `rounded-xl` controls.

## 7. Anti-Slop Restraint Rules
- Avoid generic rainbow progress bars on light cards or cluttered nested borders.
- Avoid excessive uppercase tracked eyebrows on every single card.
- Avoid floating beige/cream status pills (`bg-[#FBF6EC] border-[#EFE2C2] rounded-full`) for non-interactive status readouts; prefer clean inline key-value strips with a subtle 3px left accent border.
- Keep layouts scannable on mobile (`375px` width) with zero horizontal overflow or awkward single-item button wrapping.
