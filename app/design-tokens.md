# JiyaWorld Design Tokens - Material You Inspired

This document defines the refined design system adhering to Material You principles while maintaining a minimalist aesthetic.

---

## 1. Spacing Scale (4px base)

```css
/* Spacing Tokens */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Usage Guidelines
| Use Case | Token |
|----------|-------|
| Icon gap | `--space-2` |
| Button padding (inline) | `--space-6` |
| Button padding (block) | `--space-3` to `--space-4` |
| Card padding | `--space-6` to `--space-8` |
| Section gap | `--space-12` to `--space-16` |
| Page margins | `--space-4` to `--space-8` |

---

## 2. Typography Scale

Based on Material Design 3 type scale with compact variant for minimalism.

```css
/* Font Families */
--font-sans: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px - Labels, captions */
--text-sm: 0.875rem;    /* 14px - Secondary text */
--text-base: 1rem;      /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Lead paragraphs */
--text-xl: 1.25rem;     /* 20px - Title small */
--text-2xl: 1.5rem;     /* 24px - Title medium */
--text-3xl: 1.875rem;   /* 30px - Headline small */
--text-4xl: 2.25rem;    /* 36px - Headline medium */
--text-5xl: 3rem;       /* 48px - Display small */
--text-6xl: 3.75rem;    /* 60px - Display medium */

/* Font Weights */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.1;   /* Headlines */
--leading-snug: 1.25;   /* Titles */
--leading-normal: 1.5;  /* Body */
--leading-relaxed: 1.75; /* Long-form reading */

/* Letter Spacing */
--tracking-tight: -0.025em;  /* Headlines */
--tracking-normal: 0;
--tracking-wide: 0.02em;     /* Body */
--tracking-wider: 0.15em;    /* Labels, uppercase */
```

### Typography Tokens (Applied)
```css
/* Display */
--display-large: var(--font-bold) clamp(3rem, 6vw, 3.75rem)/var(--leading-tight);
--display-small: var(--font-bold) 2.75rem/var(--leading-tight);

/* Headline */
--headline-large: var(--font-semibold) 2rem/var(--leading-snug);
--headline-small: var(--font-semibold) 1.5rem/var(--leading-snug);

/* Title */
--title-large: var(--font-semibold) 1.25rem/var(--leading-normal);
--title-medium: var(--font-medium) 1rem/var(--leading-normal);

/* Body */
--body-large: var(--font-regular) 1rem/var(--leading-relaxed);
--body-medium: var(--font-regular) 0.875rem/var(--leading-normal);

/* Label */
--label-large: var(--font-medium) 0.875rem/1;
--label-medium: var(--font-medium) 0.75rem/1;
```

---

## 3. Color System (Material 3 Tonal)

### Core Semantic Colors
```css
:root {
  --hue: 206; /* Primary hue - can be adjusted dynamically */

  /* Primary Palette */
  --primary: hsl(var(--hue), 100%, 81%);
  --primary-container: hsla(var(--hue), 91%, 69%, 0.15);
  --on-primary: hsl(var(--hue), 48%, 15%);
  --on-primary-container: hsl(var(--hue), 100%, 94%);

  /* Secondary Palette */
  --secondary: hsl(calc(var(--hue) + 2), 75%, 82%);
  --secondary-container: hsl(calc(var(--hue) + 4), 14%, 17%);
  --on-secondary: hsl(calc(var(--hue) + 20), 48%, 18%);
  --on-secondary-container: hsl(calc(var(--hue) + 2), 30%, 75%);

  /* Surface Palette (5 levels only) */
  --surface: hsl(calc(var(--hue) + 46), 10%, 11%);
  --surface-dim: hsl(calc(var(--hue) + 34), 9%, 10%);
  --surface-bright: hsl(calc(var(--hue) + 24), 10%, 15%);
  --surface-container: hsl(calc(var(--hue) + 24), 9%, 13%);
  --surface-container-high: hsl(calc(var(--hue) + 4), 14%, 17%);
  --surface-container-highest: hsl(calc(var(--hue) + 6), 19%, 19%);

  /* Text Colors (simplified to 3) */
  --on-surface: hsl(var(--hue), 100%, 94%);
  --on-surface-variant: hsl(calc(var(--hue) + 2), 30%, 75%);
  --on-surface-muted: hsl(calc(var(--hue) + 2), 20%, 50%);

  /* Border/Outline */
  --outline: hsl(calc(var(--hue) + 15), 17%, 26%);
  --outline-variant: hsl(calc(var(--hue) + 15), 12%, 20%);

  /* Error */
  --error: hsl(357, 74%, 60%);
  --error-container: hsl(357, 74%, 20%);
}
```

### Light Theme Override
```css
[data-theme="light"] {
  --primary: hsl(var(--hue), 80%, 45%);
  --primary-container: hsla(var(--hue), 80%, 90%, 0.5);
  --on-primary: hsl(var(--hue), 20%, 98%);
  --on-primary-container: hsl(var(--hue), 80%, 25%);

  --surface: hsl(calc(var(--hue) + 10), 20%, 98%);
  --surface-dim: hsl(calc(var(--hue) + 10), 15%, 92%);
  --surface-bright: hsl(calc(var(--hue) + 10), 25%, 100%);
  --surface-container: hsl(calc(var(--hue) + 10), 20%, 95%);
  --surface-container-high: hsl(calc(var(--hue) + 10), 20%, 90%);
  --surface-container-highest: hsl(calc(var(--hue) + 10), 20%, 85%);

  --on-surface: hsl(calc(var(--hue) + 20), 48%, 18%);
  --on-surface-variant: hsl(calc(var(--hue) + 2), 10%, 40%);
  --on-surface-muted: hsl(calc(var(--hue) + 2), 10%, 55%);

  --outline: hsl(calc(var(--hue) + 15), 10%, 80%);
  --outline-variant: hsl(calc(var(--hue) + 15), 10%, 88%);
}
```

---

## 4. Border Radius Scale

Material You uses an expressive radius scale:

```css
--radius-xs: 4px;    /* Small chips */
--radius-sm: 8px;    /* Buttons, inputs */
--radius-md: 12px;   /* Cards, dialogs */
--radius-lg: 16px;   /* Large cards */
--radius-xl: 24px;   /* Sheets, containers */
--radius-full: 9999px; /* Pills, FABs */
```

---

## 5. Elevation (Shadow Levels)

```css
/* Level 1 - Subtle hover states */
--elevation-1: 
  0 1px 2px rgba(0, 0, 0, 0.3),
  0 1px 3px 1px rgba(0, 0, 0, 0.15);

/* Level 2 - Cards, elevated surfaces */
--elevation-2:
  0 1px 2px rgba(0, 0, 0, 0.3),
  0 2px 6px 2px rgba(0, 0, 0, 0.15);

/* Level 3 - Dialogs, modals */
--elevation-3:
  0 4px 8px 3px rgba(0, 0, 0, 0.15),
  0 1px 3px rgba(0, 0, 0, 0.3);

/* Level 4 - Navigation drawers */
--elevation-4:
  0 6px 10px 4px rgba(0, 0, 0, 0.15),
  0 2px 3px rgba(0, 0, 0, 0.3);

/* Level 5 - Floating action buttons */
--elevation-5:
  0 8px 12px 6px rgba(0, 0, 0, 0.15),
  0 4px 4px rgba(0, 0, 0, 0.3);

/* Light mode shadows */
[data-theme="light"] {
  --elevation-1: 
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 3px 1px rgba(0, 0, 0, 0.05);
  /* ... etc */
}
```

---

## 6. Motion/Transitions

Material You emphasizes expressive, physics-based motion:

```css
/* Durations */
--duration-short: 150ms;
--duration-medium: 250ms;
--duration-long: 400ms;
--duration-extended: 600ms;

/* Easing - Material 3 uses these specific curves */
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
--ease-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
--ease-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);

/* Default transition */
--transition-base: var(--duration-medium) var(--ease-standard);
```

---

## 7. Accessibility Requirements

### Touch/Click Targets
- **Minimum size**: 44×44px (mobile), 24×24px (desktop with larger clickable area)
- All interactive elements must meet this

### Focus States
```css
/* Focus ring for all interactive elements */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Contrast Minimums
- **Normal text**: 4.5:1 (WCAG AA)
- **Large text (18px+ or 14px+ bold)**: 3:1
- **UI components**: 3:1

### Font Size Minimums
- **Body text**: 16px minimum
- **Secondary/labels**: 12px minimum (use sparingly)

---

## 8. Component Tokens

### Button (Primary - Filled)
```css
.btn-primary {
  background: var(--primary);
  color: var(--on-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  font: var(--label-large);
  letter-spacing: var(--tracking-wide);
  box-shadow: none; /* Filled buttons don't cast shadow */
  transition: var(--transition-base);
}
.btn-primary:hover {
  background: color-mix(in srgb, var(--primary), var(--on-primary) 8%);
}
.btn-primary:active {
  background: color-mix(in srgb, var(--primary), var(--on-primary) 12%);
}
```

### Button (Outline)
```css
.btn-outline {
  background: transparent;
  color: var(--on-surface);
  border: 1px solid var(--outline);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
}
.btn-outline:hover {
  background: var(--surface-container);
  border-color: var(--on-surface-variant);
}
```

### Card
```css
.card {
  background: var(--surface-container);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  /* No border - use tonal elevation instead */
  box-shadow: var(--elevation-1);
  transition: var(--transition-base);
}
.card:hover {
  box-shadow: var(--elevation-2);
}
```

### Input
```css
.input {
  background: transparent;
  border: 1px solid var(--outline);
  border-radius: var(--radius-sm);
  padding: var(--space-4);
  color: var(--on-surface);
  font: var(--body-large);
}
.input:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 2px var(--primary-container);
}
```

### Navigation
```css
nav {
  height: 4rem; /* 64px */
  padding: 0 var(--space-6);
  background: var(--surface-container);
  border-bottom: 1px solid var(--outline-variant);
  backdrop-filter: blur(12px);
}
```

---

## Migration Checklist

- [ ] Replace all arbitrary spacing values with tokens
- [ ] Consolidate 9 surface colors to 6
- [ ] Rename text colors to semantic names
- [ ] Add 5 elevation levels
- [ ] Update all border-radius to use scale
- [ ] Add focus-visible states to all buttons
- [ ] Increase all small tap targets to 44px
- [ ] Verify contrast ratios meet WCAG AA
