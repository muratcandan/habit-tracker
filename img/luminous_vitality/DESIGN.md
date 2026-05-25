---
name: Luminous Vitality
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3e4946'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6e7a75'
  outline-variant: '#bdc9c4'
  surface-tint: '#006b5a'
  primary: '#006b5a'
  on-primary: '#ffffff'
  primary-container: '#7ed9c3'
  on-primary-container: '#005f50'
  inverse-primary: '#7cd7c1'
  secondary: '#9e4037'
  on-secondary: '#ffffff'
  secondary-container: '#fe8a7c'
  on-secondary-container: '#75221b'
  tertiary: '#67558c'
  on-tertiary: '#ffffff'
  tertiary-container: '#d4befd'
  on-tertiary-container: '#5c4a81'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#98f4dd'
  primary-fixed-dim: '#7cd7c1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005144'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4aa'
  on-secondary-fixed: '#410001'
  on-secondary-fixed-variant: '#7f2922'
  tertiary-fixed: '#ebddff'
  tertiary-fixed-dim: '#d2bcfb'
  on-tertiary-fixed: '#220f44'
  on-tertiary-fixed-variant: '#4f3d73'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-md:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
  container-padding: 24px
  gutter: 16px
---

## Brand & Style
The design system is centered on an aesthetic of "Sleek Playfulness." It aims to transform the often-tedious task of habit tracking into a delightful, rewarding ritual. The brand personality is encouraging, optimistic, and effortlessly organized.

We employ a **Minimalist** foundation with **Soft UI** accents. This means a heavy reliance on whitespace to reduce cognitive load, paired with tactile, friendly elements that invite interaction. The emotional response should be one of "calm momentum"—the feeling of making progress without the stress of a rigid, corporate interface.

## Colors
The palette is a vibrant but harmonious collection of "Functional Pastels." Each hue is selected to evoke a specific category of life without overwhelming the eye:
- **Soft Mint (Primary):** Used for completion states, health-related habits, and primary calls to action. It represents growth and freshness.
- **Coral (Secondary):** Used for high-energy habits, fitness, or urgent reminders. It adds a pulse of excitement.
- **Lavender (Tertiary):** Used for mindfulness, sleep, and journaling. It evokes calm and reflection.
- **Sunny Yellow (Quaternary):** Used for focus, learning, and creative streaks. It acts as a highlight for achievements.

The background is a very light gray (`#F8F9FA`) to provide a softer contrast than pure white, reducing eye strain during early morning or late-night tracking.

## Typography
This design system utilizes **Quicksand** exclusively to maintain a cohesive, friendly, and modern feel. Its rounded terminals mirror the "soft" geometry of the UI components.

Headlines use a tighter letter-spacing and heavier weights to feel "huggy" and approachable. Body text maintains a medium weight (`500`) even for standard paragraphs to ensure readability against the colorful accents. Label styles are used for navigation and metadata, often employing slightly more tracking (letter-spacing) to ensure clarity at small sizes.

## Layout & Spacing
The layout follows a **Fluid Grid** model with an emphasis on "Airy Density." 

- **Mobile:** A single-column flow with 24px side margins. Cards span the full width minus margins.
- **Tablet/Desktop:** A multi-column staggered layout (Masonry-lite) for habit cards to visualize multiple categories at once.
- **Rhythm:** We use a base-8 spacing scale, but deviate to "odd" numbers like 20px or 12px when necessary to create a more organic, less rigid feel. 

Whitespace is treated as a functional element—use it to group habits by time of day or category without needing heavy dividers.

## Elevation & Depth
Depth is created through **Ambient Shadows** and tonal layering. We avoid high-contrast shadows.

- **Surface Level 0:** The neutral background (`#F8F9FA`).
- **Surface Level 1 (Cards/Inputs):** Pure white background with a very soft, diffused shadow. Shadow color should be a low-opacity version of the text color (e.g., `rgba(45, 52, 54, 0.05)`) with a high blur radius (15-20px).
- **Active State:** When a habit is "pressed" or held, the shadow should shrink (lowering the elevation) to simulate a physical button being pushed into a soft surface.
- **Backdrop Blurs:** Use subtle blurs (10px) on navigation bars to maintain a sense of context and flow as the user scrolls.

## Shapes
The shape language is defined by **Generous Radii**. There are no sharp corners in this design system.

- **Small Components (Chips, Badges):** Fully pill-shaped (999px).
- **Medium Components (Buttons, Input Fields):** 16px (`rounded-lg`) to 20px.
- **Large Components (Cards, Modals):** 24px (`rounded-xl`).

This consistency in curvature reinforces the friendly, approachable brand personality and makes the UI feel "touchable."

## Components
- **Habit Cards:** The core component. Features a large, rounded checkbox on the right. The card background remains white, but a thick (4px) left-border or a subtle tinted glow indicates the category color.
- **Progress Visualization:** Use "Circular Rings" for daily goals and "Smooth Waves" for weekly trends. Avoid jagged line charts; use curved splines to maintain the sleek aesthetic.
- **Buttons:** Primary buttons use a solid gradient or flat fill of the Primary color with white text. They should have a "squishy" feel—slight scale-down (0.98x) on active tap.
- **Chips:** Used for habit tags (e.g., "Morning", "10 mins"). These should have a light tinted background (10% opacity of the category color) with a darker version of the same color for the text.
- **Input Fields:** Search and journaling inputs should have no visible border, only a white background and the standard soft shadow. The focus state is indicated by a 2px Soft Mint outer glow.
- **Empty States:** Use playful, minimalist illustrations with the secondary and tertiary colors to encourage the user to add their first habit.