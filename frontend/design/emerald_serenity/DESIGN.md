# Design System Document: The Editorial Sanctuary

## 1. Overview & Creative North Star
**Creative North Star: "The Modern Manuscript"**

This design system is not a utility; it is a digital sanctuary. We are moving away from the "app-as-a-tool" aesthetic toward "app-as-a-curated-experience." By blending the intellectual weight of high-end Turkish editorial design with the serenity of Islamic architectural geometry, we create a space that feels both timeless and technologically advanced.

To break the "template" look, we embrace **Intentional Asymmetry**. We do not center everything; we use whitespace as a structural element, allowing the Noto Serif headlines to breathe like calligraphy on a vellum page. We favor overlapping elements—such as a card slightly breaking the bounds of a container—to create a sense of tactile depth.

---

## 2. Colors & Tonal Depth
Our palette is rooted in the "Deep Emerald" of tradition, elevated by a "Soft Cream" that avoids the sterile coldness of pure white.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders are prohibited for sectioning. 
Structure must be defined through **Background Color Shifts**. For example, a `surface-container-low` card sitting on a `surface` background provides all the separation the eye needs. Borders are a crutch; tonal transitions are a signature.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of premium paper.
*   **Base:** `surface` (#fbf9f5) for global backgrounds.
*   **Low Importance:** `surface-container-low` (#f5f3ef) for subtle grouping.
*   **Active/Elevated:** `surface-container-lowest` (#ffffff) for primary cards to create a "lifted" feel.

### The "Glass & Gradient" Rule
To add soul to the "Deep Emerald" (`primary`), do not use it as a flat block. Apply a subtle linear gradient from `primary` (#003527) to `primary-container` (#064e3b) at a 135-degree angle. For floating navigation or modals, use **Glassmorphism**: apply the surface color at 80% opacity with a `24px` backdrop-blur to allow content to bleed through softly.

---

## 3. Typography
We use a high-contrast pairing to distinguish between "Content" (The Divine/The Literary) and "Interface" (The Functional).

*   **Display & Headlines (Noto Serif):** Used for Ayahs, Turkish poetry, or section titles. This font carries the emotional weight. Use `headline-lg` (2rem) for primary entry points to create an editorial "magazine" feel.
*   **Body & UI (Inter):** Used for navigation, labels, and long-form Turkish descriptions. Inter provides the modern, Swiss-inspired precision that keeps the app feeling "Premium Tech."
*   **Hierarchy Tip:** Always use a 200% line-height for Arabic script in `body-lg` to respect the ascenders and descenders unique to the script.

---

## 4. Elevation & Depth
We reject the heavy, "muddy" shadows of early Material Design.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card (Pure White) on a `surface-container` background. The slight delta in hex value creates "Natural Elevation."
*   **Ambient Shadows:** Use only when an element is "Floating" (e.g., a Bottom Sheet). 
    *   *Spec:* `0px 12px 32px rgba(31, 41, 55, 0.05)`. Note the 5% opacity; it should feel like a whisper, not a shout.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline-variant` at 15% opacity. It should be nearly invisible, providing just enough "bite" for the eye.

---

## 5. Components

### Cards & Lists
*   **The Card:** Use `lg` (1rem/16px) corners. Never use dividers between list items. Instead, use 16px of vertical whitespace or a 2-step shift in `surface-container` tiers.
*   **Content Focus:** For Turkish text, use `title-md` for headers within cards to ensure the diacritics (ç, ğ, ı, ö, ş, ü) have ample vertical clearance.

### Buttons
*   **Primary:** A gradient of `primary` to `primary-container`. `9999px` (Full) roundedness for a pill shape that feels organic.
*   **Secondary:** No fill. Use `on-surface` text with a "Ghost Border" (10% opacity `outline`).
*   **Tertiary:** Purely text-based using `primary` color, reserved for low-emphasis actions like "Vazgeç" (Cancel).

### Input Fields
*   **Style:** Minimalist. No bottom line. Use a `surface-container-high` background with `md` (0.75rem) corners. The label should sit in `label-md` (Inter) above the field, never inside as placeholder text.

### Specialized Components
*   **The Qibla Compass / Prayer Timer:** Use `surface-tint` to create glowing, ethereal focal points. These should be the only elements using high-saturation effects.
*   **Progress Indicators:** Use the `tertiary` (Gold/Ochre) tokens for "Tasbih" counters or reading progress to signify "Value" and "Achievement."

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace "The Void":** Use more whitespace than you think you need. Premium design is defined by what you leave out.
*   **Asymmetric Headers:** Push a headline to the far left and let the Turkish subtext sit 40px below it, slightly indented.
*   **Tonal Overlays:** Use `secondary-container` for "Soft" alerts instead of harsh reds or yellows.

### Don’t:
*   **Don’t use 100% Black:** Always use `on-surface` (#1b1c1a) or `on-background` for text. Pure black kills the "Sanctuary" vibe.
*   **Don’t use Dividers:** If you feel the need to draw a line, try adding 8px of padding instead.
*   **Don’t Crowd the Script:** Arabic and Turkish scripts are visually dense. If the UI feels "busy," increase the `surface-container` padding.

---

## Token Reference Summary
*   **Primary Action:** `primary` (#003527)
*   **Main Canvas:** `surface` (#fbf9f5)
*   **Key Card:** `surface-container-lowest` (#ffffff)
*   **Corner Radius:** `xl` (1.5rem) for major containers; `lg` (1rem) for cards.
*   **Typography:** Noto Serif (Display/Headline) + Inter (Body/Label)