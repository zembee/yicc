---
name: yfti-design-system
description: Design system and UI architecture guide for Young FTI ELITE 11 (YICC) Member Portal. Use whenever creating, redesigning, or updating any page, modal, header, card, or loading state so all screens stay visually consistent with the LINE Member Portal and Home page template.
---

# Young FTI ELITE 11 (YICC) Design System & UI Architecture

This design system defines the **Member-First Luxury Layered Wallet App** aesthetic for the Young FTI ELITE 11 (YICC) Member Portal. All pages, modals, headers, cards, and loading states must strictly adhere to these standards.

---

## 1. Core Color Palette & Materials

| Token | Hex / CSS Class | Usage |
|---|---|---|
| **Canvas Background** | `#F6F4EF` (Warm Alabaster Ivory) | Default page background across all screens |
| **Editorial Limestone** | `#F4F1EA` | Secondary editorial canvas (e.g. `/events/[id]`) |
| **Obsidian Stage** | `#090D18` → `#101728` → `#0B111E` (`.luxury-stage`) | Primary dark executive surface for headers & member cards |
| **Satin Champagne Gold** | `#C5A059` / `#DFC27D` / `#ECD28E` / `#F5E6BE` | VIP accents, badges, points, icons, button highlights |
| **Card Surface** | `#FFFFFF` (`.luxury-card`) | Borderless cards with soft atmospheric shadows |
| **Gold Metallic Badge** | `.badge-gold-metallic` | Translucent frosted gold badge with top highlight |
| **Gold Action Button** | `.luxury-gold-btn` | Gradient `#D5B36A` → `#BA9243` → `#9F7A30` with inner bevel |

> [!IMPORTANT]
> **No harsh outer borders (`border-slate-200`) or legacy coral bars (`#FB7170`)**. All card surfaces must be borderless with soft shadows (`shadow-[0_8px_26px_rgba(13,19,33,0.05)]`).

---

## 2. 3D Asset Library

All key features and navigational triggers must use the high-resolution custom 3D WebP assets located in `/public/images/`:

### A. 3D Planet House Emblems (`/public/images/planets/*.webp?v=2`)
Each of the 9 houses has a signature 3D horology planet emblem and accent color:

| House | Filename | Signature Color |
|---|---|---|
| **The Sun** | `the_sun.webp` | `#F59E0B` (Amber) |
| **Mercury** | `mercury.webp` | `#94A3B8` (Slate) |
| **Venus** | `venus.webp` | `#EC4899` (Rose) |
| **Earth** | `earth.webp` | `#10B981` (Emerald) |
| **Mars** | `the_mars.webp` | `#EF4444` (Crimson) |
| **Jupiter** | `jupiter.webp` | `#F97316` (Orange) |
| **Saturn** | `saturn.webp` | `#EAB308` (Gold) |
| **Uranus** | `uranus.webp` | `#06B6D4` (Cyan) |
| **Neptune** | `neptune.webp` | `#3B82F6` (Blue) |

### B. 3D Obsidian & Satin Gold Feature Icons (`/public/images/icons/*.webp?v=2`)
- **Core Navigation**: `privileges.webp`, `business.webp`, `events.webp`, `points.webp`, `courses.webp`, `profile.webp`, `missions.webp`, `house.webp`
- **Industry Groups**: `tech.webp`, `services.webp`, `industrial.webp`, `construction.webp`, `finance.webp`, `agriculture.webp`, `consumer.webp`, `resources.webp`

---

## 3. Header Architecture & Sticky Behavior

The application utilizes two distinct header patterns depending on route type:

### A. Secondary Pages (`/profile`, `/directory`, `/privileges`, `/events`, `/notifications`, `/yfti_participants/[id]`)
- **Fixed in Front**: `sticky top-0 md:top-24 z-30 luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)] overflow-hidden`
- **Content Sheet**: Placed behind the header (`relative z-10 pt-5`), so content slides underneath when scrolling down.
- **Header Elements**:
  - Split-weight title: `<span className="font-extrabold">YOUNG FTI</span> <span className="font-light text-[#ECD28E]">ELITE 11</span>`
  - Action pills, search inputs, and category filter pills embedded directly within the dark header.

### B. Home Page (`/`)
- **Natural Relative Flow**: `relative overflow-hidden luxury-stage text-white pt-4 pb-16 px-4 sm:px-6 border-b border-[#C5A059]/30`
- Does **not** stick, allowing the single 3D Member Card, Points Strip, and Quick Menu to scroll naturally with the rest of the super-app sections.

---

## 4. Digital Member Pass & Card Gimmicks

### A. Home Member Card (`src/components/profile/MemberCard.tsx`)
- **Position**: Only rendered **once** across the application (on Home `/`, never duplicated on `/profile`).
- **Proportion**: Slim horizontal pass (`h-[180px] sm:h-[196px] rounded-[22px]`).
- **Seamless Portrait Blend**: Right ~56% width with true alpha mask fade (`maskImage: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.22) 22%, rgba(0,0,0,0.85) 55%, black 80%)`).
- **House Watermark**: Faint 3D planet image (`opacity-[0.17]`) positioned in background with ambient radial glow.
- **Framing**: Continuous inset satin gold hairline (`inset 0 0 0 1px rgba(223,194,125,0.32)`).
- **Flip Side**: Dynamic 60s rolling QR verification pass with member details and points/XP tally.

### B. Directory Member Cards (`src/app/directory/page.tsx`)
- **Proportion**: Sleek horizontal proportion (`h-[170px] sm:h-[180px] rounded-[20px]`).
- **Visual Gimmick**: Matches the Home Member Card with right-side `maskImage` faded portrait.
- **House Identity at a Glance**:
  - Background 3D Planet Watermark (`w-36 h-36 opacity-[0.18]`)
  - Radial ambient glow tinted with the house's signature color
  - House pill with crisp mini 3D planet icon (`w-4 h-4`)
- **Quick Actions**: Triple pill buttons (`โทร`, `LINE`, `โปรไฟล์`).

### C. Profile & Detail Views (`src/app/profile/page.tsx`, `ParticipantDetailView.tsx`)
- Do **not** duplicate the member card.
- Use executive circular avatar with full-screen zoom (`PhotoLightbox.tsx`), followed by `InfoCard` key-value rows.

---

## 5. Reusable UI Components

### A. Editorial Info Cards (`src/components/ui/InfoCard.tsx`)
Shared borderless card with soft shadow for structured data:
```tsx
import { InfoCard, InfoGrid, InfoRow } from '@/components/ui/InfoCard';

<InfoCard eyebrow="MEMBER DETAILS" title="ข้อมูลสมาชิก" iconSrc="/images/icons/profile.webp?v=2">
  <InfoGrid>
    <InfoRow label="เบอร์โทรศัพท์" mono accent>{profile.phone_number}</InfoRow>
    <InfoRow label="อีเมล">{profile.email}</InfoRow>
    <InfoRow label="ตำแหน่ง">{profile.position}</InfoRow>
    <InfoRow label="บริษัท">{profile.company_name}</InfoRow>
    <InfoRow label="กลุ่มอุตสาหกรรม" wide>{profile.industry}</InfoRow>
  </InfoGrid>
</InfoCard>
```

### B. Full-Screen Photo Zoom (`src/components/ui/PhotoLightbox.tsx`)
Modal lightbox with zoom controls, backdrop blur, and touch dismissal for viewing profile avatars and media at full resolution.

### C. Slide-Up Quick QR Hub Sheet (`src/components/layout/QuickQrHubSheet.tsx`)
Slide-up drawer accessible via the floating gold `QR บัตร` center tab on mobile or the desktop header button, displaying dynamic check-in QR and quick shortcuts without route changes.

---

## 6. Loading & Skeleton Guidelines

- **Top Navigation Progress Bar (`RouteProgressBar.tsx`)**: Satin Champagne Gold gradient (`from-[#B18A3B] via-[#ECD28E] to-[#DFC27D]`).
- **Shimmer Colors (`globals.css`)**:
  - `.skeleton-shimmer` (Light Canvas): Warm Ivory / Limestone tone (`rgba(235, 229, 217, 0.72)`)
  - `.skeleton-shimmer-dark` (Obsidian Canvas): Champagne Gold shimmer (`rgba(236, 210, 142, 0.20)`)
- **Page Skeletons (`PageSkeletons.tsx`)**:
  - Header must mirror the exact sticky height and `rounded-b-[28px]` radius of the actual page.
  - Skeletons must reflect true component dimensions (e.g., slim member cards, circular medallions, borderless tiles).

---

## 7. Spacing & Rhythm Constraints

- **Page Container Bottom Padding**: Always use `pb-4` on main page containers. The `Footer` component provides the necessary `pb-24` clearance for the mobile bottom navigation bar. Do **not** stack `pb-24` on `<main>` or page wrappers.
- **Carousel Margins**: On mobile horizontal carousels, use `-mr-4 pr-4 sm:mr-0 sm:pr-0` with `snap-x` to prevent left-edge clipping.
- **Button Styling**: Prefer rounded pills (`rounded-full`) or soft luxury rounded rectangles (`rounded-xl` / `rounded-2xl`). Avoid sharp `rounded-none` or dated boxed outlines.
