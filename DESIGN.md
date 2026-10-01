# GerakGamify

An active-learning application for students, teachers and school administrators.
The existing routes, forms, permissions and data contracts remain authoritative.

## Visual direction

Use the clarity of a school athletics programme: direct typography, open neutral
surfaces, a single vermilion action color and a running-track motif. This replaces
the earlier cobalt/apricot palette and floating illustration cards. Auth is a
task surface; the poster supports the brand without delaying access to the form.
The light default suits classroom and outdoor use; retain dark and system modes.

- Colors live in `app/globals.css`; roles and measured pairs are in `docs/theme.md`.
- Neutral canvas `#F8F8F6`, ink `#242625`, primary `#C43D25`.
- Use Geist for UI and headings; preserve the existing logo's Plus Jakarta Sans.
- Reserve saturated color for actions, selections and the track illustration.
- Keep status colors distinct and accompany them with text or icons.
- Use 8px form controls and 12-16px content surfaces. Avoid nesting decorative cards.
- The desktop auth poster uses large type and a compact, labeled learning journey. Mobile
  shows the form directly. Form controls must be visible without a reveal sequence.
- Motion: 9s sequential step highlight and illustration lift with a pause control, 180ms control feedback, reduced-motion support.

Review desktop/mobile and both themes in the browser. Treat component fixtures as
visual evidence only, never as proof of authenticated workflows or backend behavior.
