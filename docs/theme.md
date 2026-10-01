# GerakGamify color system

`app/globals.css` is the source for runtime colors in both light and dark modes.
Auth and logo CSS modules reference these tokens instead of owning a palette.

| Role | Utility / token | Use |
| --- | --- | --- |
| Page | `bg-background` | Reading canvas and page background |
| Surface | `bg-surface`, `bg-surface-secondary` | Cards and nested surfaces |
| Text | `text-foreground`, `text-muted` | Main and supporting text |
| Action | `bg-primary text-primary-foreground` | Main buttons and active navigation |
| Soft action | `bg-primary-soft text-primary-soft-foreground` | Selected items and small icon backgrounds |
| Reward | `bg-reward text-reward-foreground` | Badges and achievement highlights |
| Soft reward | `bg-reward-soft text-reward-text` | Supporting achievement surfaces |
| Status | HeroUI `success`, `warning`, `danger` | State feedback, accompanied by text or icons |
| Field | HeroUI `--field-*` | Inputs, focus, border, placeholder and autofill |

HeroUI's `accent` is an alias of the primary action. Do not use `accent` to mean
the decorative reward. The `brand-*` and `ink-*` tonal scales support illustrations and existing
utility-based compositions; prefer semantic roles for new components. Avoid
large multicolor gradients. Vermilion is the action color; achievements use quiet
neutral surfaces with readable labels and icons. Do not use the brand scale for
body copy or tint the entire application with the action color.

Charts use `--chart-*`. The shared `EChart` component resolves CSS variables to
actual colors before passing them to canvas and reapplies them when the actual
`data-theme` attribute changes. Keep data and formatting callbacks unchanged
when styling charts.

The default remains light. Existing `next-themes` handling continues to control
`data-theme`, including system preference when the system theme is selected.

Favicon/PWA images and `public/brand/gerakgamify-mark.svg` are exported assets.
When changing the brand palette, regenerate those exports and update the static
theme colors in `app/layout.tsx` and `public/manifest.json` as well.

Reference pairs: white on vermilion `#C43D25` has 5.20:1 contrast; muted
`#626863` on `#F8F8F6` has 5.37:1; dark action text `#271E19` on `#F39479`
has 7.25:1. These are token-pair measurements, not a full accessibility audit.

Geist carries application text and display headings. The existing Plus Jakarta
Sans wordmark remains a brand asset. Auth inputs/buttons use an 8px radius,
the story panel uses 16px. Avoid floating card illustrations, sparkle ornaments,
multiple headline underlines, or animation on non-interactive statistics.
The learning journey is an ordered list with separate book, sneaker and medal
illustrations. A 9s sequence lifts one illustration and highlights its numbered
step at a time. The pause checkbox and reduced-motion preference stop the cycle. Mobile auth omits the poster to prioritize the form.
