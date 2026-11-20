# Young FTI ELITE 11 (YICC) Design System & UI Architecture

This document serves as the master design reference for the **Young FTI ELITE 11 (YICC)** Member Portal.

---

## 🎨 1. Core Color Palette & Materials

| Token | Hex / CSS Class | Usage |
|---|---|---|
| **Canvas Background** | `#F6F4EF` (Warm Alabaster Ivory) | Default page background across all screens |
| **Editorial Limestone** | `#F4F1EA` | Secondary editorial canvas (e.g. `/events/[id]`) |
| **Obsidian Stage** | `#090D18` → `#101728` → `#0B111E` (`.luxury-stage`) | Primary dark executive surface for headers & member cards |
| **Satin Champagne Gold** | `#C5A059` / `#DFC27D` / `#ECD28E` / `#F5E6BE` | VIP accents, badges, points, icons, button highlights |
| **Card Surface** | `#FFFFFF` (`.luxury-card`) | Borderless cards with soft atmospheric shadows |
| **Gold Metallic Badge** | `.badge-gold-metallic` | Translucent frosted gold badge with top highlight |
| **Gold Action Button** | `.luxury-gold-btn` | Gradient `#D5B36A` → `#BA9243` → `#9F7A30` with inner bevel |

> **Rule:** No harsh outer borders (`border-slate-200`) or legacy coral bars (`#FB7170`). All card surfaces are borderless with soft shadows (`shadow-[0_8px_26px_rgba(13,19,33,0.05)]`).

---

## 🪐 2. 3D Asset Library

All key features and navigational triggers use custom 3D WebP assets located in `/public/images/`:

### A. 3D Planet House Emblems (`/public/images/planets/*.webp?v=2`)
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

### B. 3D Obsidian & Satin Gold Icons (`/public/images/icons/*.webp?v=2`)
- **Navigation & Features**: `privileges.webp`, `business.webp`, `events.webp`, `points.webp`, `courses.webp`, `profile.webp`, `missions.webp`, `house.webp`
- **Industry Sectors**: `tech.webp`, `services.webp`, `industrial.webp`, `construction.webp`, `finance.webp`, `agriculture.webp`, `consumer.webp`, `resources.webp`

---

## 🏛️ 3. Header Architecture & Sticky Behavior

### A. Secondary Pages (`/profile`, `/directory`, `/privileges`, `/events`, `/notifications`, `/yfti_participants/[id]`)
- **Fixed in Front**: `sticky top-0 md:top-24 z-30 luxury-stage text-white pt-4 pb-5 px-4 sm:px-6 rounded-b-[28px] shadow-[0_14px_34px_rgba(9,13,24,0.28)] overflow-hidden`
- **Content Sheet**: Positioned behind the header (`relative z-10 pt-5`), sliding smoothly underneath during scroll.

### B. Home Page (`/`)
- **Natural Relative Flow**: `relative overflow-hidden luxury-stage text-white pt-4 pb-16 px-4 sm:px-6 border-b border-[#C5A059]/30`
- Does **not** stick, allowing the single 3D Member Card, Points Strip, and Quick Menu to scroll naturally with the super-app sections.

---

## 💳 4. Digital Member Pass & Card Gimmicks

### A. Home Member Card (`src/components/profile/MemberCard.tsx`)
- Rendered **only once** across the entire application (on Home `/`, never on `/profile`).
- Slim horizontal pass (`h-[180px] sm:h-[196px] rounded-[22px]`).
- Right-side full-height portrait blended via CSS `maskImage` alpha fade (`zero seam`).
- Faint 3D planet house watermark (`opacity-[0.17]`) and ambient glow in background.
- Continuous 1px satin gold inset hairline border (`inset 0 0 0 1px rgba(223,194,125,0.32)`).
- Flip side reveals dynamic 60s rolling QR verification pass.

### B. Directory Member Cards (`src/app/directory/page.tsx`)
- Sleek horizontal proportion (`h-[170px] sm:h-[180px] rounded-[20px]`).
- Right-side masked portrait fade matching the Home Card.
- Unmistakable House Identity:
  - Faint 3D planet watermark (`opacity-[0.18]`)
  - Ambient radial glow tinted with house color
  - House pill with mini 3D planet icon (`w-4 h-4`)
- Compact quick actions (`โทร`, `LINE`, `โปรไฟล์`).

### C. Profile & Detail Views (`src/app/profile/page.tsx`, `ParticipantDetailView.tsx`)
- Do not duplicate the member card.
- Circular executive avatar with `PhotoLightbox` zoom, compact stat boxes, and editorial `InfoCard` key-value rows.

---

## 🧩 5. Reusable UI Components

### A. Editorial Info Cards (`src/components/ui/InfoCard.tsx`)
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
High-resolution image zoom modal with touch and backdrop-dismissal.

### C. Slide-Up Quick QR Hub Sheet (`src/components/layout/QuickQrHubSheet.tsx`)
Native CSS sliding sheet with rolling dynamic QR pass and quick links.

---

## ⏳ 6. Loading States & Skeletons

- **Top Navigation Progress Bar (`RouteProgressBar.tsx`)**: Satin Champagne Gold gradient (`from-[#B18A3B] via-[#ECD28E] to-[#DFC27D]`).
- **Shimmer Tokens (`globals.css`)**:
  - `.skeleton-shimmer`: Warm Ivory / Limestone tone (`rgba(235, 229, 217, 0.72)`)
  - `.skeleton-shimmer-dark`: Champagne Gold shimmer on Obsidian (`rgba(236, 210, 142, 0.20)`)
- **Page Skeletons (`PageSkeletons.tsx`)**:
  - Sticky headers mirror actual page headers (`sticky top-0 md:top-24 z-30 rounded-b-[28px]`).

---

## 📏 7. Spacing & Rhythm Constraints

- Main page containers use `pb-4`. The `Footer` component provides the necessary `pb-24` clearance for the mobile bottom navigation bar.
- On mobile carousels, use `-mr-4 pr-4 sm:mr-0 sm:pr-0` with `snap-x` to prevent left-edge clipping.
- Use borderless soft-shadow cards instead of harsh borders or loud neon accents.
