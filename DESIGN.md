# GerakGamify

An active-learning application for students, teachers and school administrators.
The existing routes, forms, permissions and data contracts remain authoritative.

## Visual direction

Use the clarity of a school athletics programme: direct typography, warm paper
surfaces, deep teal actions and restrained gold achievement accents, following
the production landing page at https://gerak-gamify.com/. Auth is a
task surface; the poster supports the brand without delaying access to the form.
The light default suits classroom and outdoor use; retain dark and system modes.

- Colors live in `app/globals.css`; roles and measured pairs are in `docs/theme.md`.
- Warm canvas `#F7F5F0`, ink and primary `#173F3D`, reward gold `#F5A623`.
- Use Geist for UI, Plus Jakarta Sans for display headings and the wordmark.
- Reserve saturated color for actions, selections and the track illustration.
- Keep status colors distinct and accompany them with text or icons.
- Use 8px form controls and 12-16px content surfaces. Avoid nesting decorative cards.
- The desktop auth poster uses large type and a compact, labeled learning journey. Mobile
  shows the form directly. Form controls must be visible without a reveal sequence.
- Motion: 9s sequential step highlight and illustration lift with a pause control, 180ms control feedback, reduced-motion support.

Review desktop/mobile and both themes in the browser. Treat component fixtures as
visual evidence only, never as proof of authenticated workflows or backend behavior.
