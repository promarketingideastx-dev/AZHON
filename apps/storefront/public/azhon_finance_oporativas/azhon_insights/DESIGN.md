---
name: AZHON Insights
colors:
  surface: '#faf9fb'
  surface-dim: '#dbd9dc'
  surface-bright: '#faf9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f6'
  surface-container: '#efedf0'
  surface-container-high: '#e9e8ea'
  surface-container-highest: '#e3e2e5'
  on-surface: '#1b1c1e'
  on-surface-variant: '#43474d'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f2f0f3'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#49607e'
  primary: '#000f22'
  on-primary: '#ffffff'
  primary-container: '#0a2540'
  on-primary-container: '#768dad'
  inverse-primary: '#b0c8eb'
  secondary: '#944b00'
  on-secondary: '#ffffff'
  secondary-container: '#fe9744'
  on-secondary-container: '#6b3500'
  tertiary: '#001110'
  on-tertiary: '#ffffff'
  tertiary-container: '#002927'
  on-tertiary-container: '#009b94'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#b0c8eb'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#314865'
  secondary-fixed: '#ffdcc5'
  secondary-fixed-dim: '#ffb783'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#713700'
  tertiary-fixed: '#79f6ed'
  tertiary-fixed-dim: '#59dad1'
  on-tertiary-fixed: '#00201e'
  on-tertiary-fixed-variant: '#00504c'
  background: '#faf9fb'
  on-background: '#1b1c1e'
  surface-variant: '#e3e2e5'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin: 24px
---

## Brand & Style

The design system embodies an **Analytical and Predictive** persona, tailored for high-stakes intelligence and strategic decision-making. The visual style is **Corporate / Modern** with a focus on data density and precision. 

The aesthetic is characterized by:
- **Depth and Logic:** Utilizing a dark, sophisticated primary environment to evoke "Deep Intelligence."
- **Clarity under Pressure:** High-density information layouts that remain legible through rigorous grid discipline.
- **Strategic Highlighting:** A conservative use of high-energy accents to guide the user toward critical data shifts and predictive signals.
- **Technical Sophistication:** Subtle micro-textures and premium shadows that distinguish the platform as a professional-grade intelligence tool rather than a general-purpose dashboard.

## Colors

This design system utilizes a "Deep Intelligence" foundation. 

- **Primary (#0A2540):** Used for structural elements like sidebars, global headers, and high-level navigational backgrounds. It establishes the "Intelligence" environment.
- **Secondary/Accent (#F08C3A):** Reserved strictly for action-oriented elements, critical alerts, and the most significant data points in a visualization.
- **Support Tones:** Tech Teal (#20B2AA) and Soft Cyan (#E0F7FA) are utilized for positive trends, secondary data series, and successful status indicators.
- **Neutral Palette:** Surfaces use a premium light gray (#F8FAFC) to maintain readability in the content area, contrasted against cool gray borders that provide structure without visual noise.

## Typography

The typography system relies on **Plus Jakarta Sans** for its balance of modern approachability and geometric precision. 

- **Headlines:** Use tighter letter spacing and heavier weights to anchor pages. 
- **Data Display:** For numerical values in dashboards, use the `data-mono` style which leverages the font's clean numerals for better vertical alignment in tables.
- **Labels:** Uppercase labels are used for category headers and small metadata to provide clear hierarchy in high-density views.

## Layout & Spacing

This design system employs a **Fixed Grid** system for internal dashboard layouts to ensure consistency in data visualization sizing.

- **Grid:** A 12-column grid with 20px gutters.
- **Rhythm:** An 8px base unit (softened to 4px for tight UI components) governs all padding and margins. 
- **Density:** High-density spacing is prioritized; vertical margins between cards are kept to 24px (lg) to maximize the "above the fold" information display.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Background):** The base layer is #F8FAFC.
- **Level 1 (Cards):** White surfaces (#FFFFFF) with a very soft, diffused shadow (0px 4px 20px rgba(10, 37, 64, 0.05)).
- **Level 2 (Active/Hover):** Enhanced shadow (0px 8px 30px rgba(10, 37, 64, 0.08)) to indicate interactivity.
- **Structural Depth:** Sidebars and Global Headers do not use shadows; they use flat fills of Deep Intelligence Blue (#0A2540) to act as an anchor for the floating light-mode content cards.

## Shapes

The shape language follows the **ROUND_EIGHT** principle, providing a "Soft" but professional appearance.

- **Standard Elements:** Buttons, Input fields, and small Chips use a 0.5rem (8px) radius.
- **Containers:** Large data cards and modal windows use 1rem (16px) for the `rounded-lg` token.
- **Icons:** Use a consistent 2px stroke weight with slightly rounded terminals to match the typography.

## Components

- **Buttons:** Primary buttons use AZHON Orange with white text. Secondary buttons use a Deep Intelligence Blue outline. Actionable icons on dark backgrounds should use Soft Cyan.
- **Cards:** The core of the design. White background, 16px radius, subtle border (#E2E8F0), and an 8px top-accent bar in Primary Blue or Secondary Orange for categorization.
- **Data Visualization:** Charts should use Tech Teal and Soft Cyan as primary series. Use cool grays for grid lines and Deep Intelligence Blue for axis labels.
- **Chips/Signals:** Use for status. "Predictive" signals should use a pulsing animation of AZHON Orange.
- **Inputs:** Clean, white fills with a 1px border. Focus states transition the border to Tech Teal with a Soft Cyan outer glow.
- **Intelligence Feed:** A specialized list component with high vertical density, utilizing "data-mono" for timestamps and "label-caps" for event categories.