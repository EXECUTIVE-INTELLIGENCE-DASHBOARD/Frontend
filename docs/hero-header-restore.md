# Restoring the original Hero (header) design

**Date:** 2026-10-22
**Branch:** `Dev`
**Files changed:** `src/components/Hero.css`, `src/components/Hero.tsx`, `src/components/Hero.test.tsx`

---

## 1. The request

> "hiber had designed the hereos section but i think sheila changed it can we put it back to hibers code instead"

The belief was that Sheila had redesigned the header. Before reverting anything, the
history was inspected to find out who actually changed it.

---

## 2. Investigation

### Step 1 — Who touched the hero files?

```bash
git log --format="%h | %an | %ad | %s" --date=short -- src/components/Hero.css
git log --format="%h | %an | %ad | %s" --date=short -- src/components/Hero.tsx
```

Result for `Hero.css`:

| Commit | Author | Date | Message |
| --- | --- | --- | --- |
| `6031bc6` | Sheila | 2026-10-21 | Apply brand colours (navy #203468, gold #F1BA1B, sky #2AA4DD) |
| `97719b2` | eve250 | 2026-10-21 | feat(header): add notifications bell and profile details to Hero |
| `888760d` | Prinsley-kae | 2026-10-13 | Connect EID profile to GreenHill sign-in |
| `e142c8b` | **HIBERMAHI** | 2026-10-13 | style: edited hero section and page layouts |
| `91b45cb` | HIBERMAHI | 2026-10-12 | style: adjusted hero section layout |
| `4060b54` | HIBERMAHI | 2026-10-11 | feat: updated sidebar and hero sections with theme support |

### Step 2 — How big was Sheila's change?

```bash
git show 6031bc6 -- src/components/Hero.css
```

Sheila's commit was a **25-file brand-colour sweep**. In `Hero.css` it changed exactly
20 hex values, all inside the dark-theme block, and nothing else:

```diff
 [data-theme="dark"] .hero {
-  background: #263278;
-  border-bottom-color: #3f4b92;
+  background: #203468;
+  border-bottom-color: #3A528C;
 }
```

No layout, no spacing, no sizes. **Sheila did not change the design.**

### Step 3 — How big was the other change?

```bash
git show --stat 97719b2 -- src/components/Hero.css src/components/Hero.tsx
```

```
src/components/Hero.css      | 929 ++++++++++++++--------------------------
src/components/Hero.tsx      | 114 ++----
3 files changed, 372 insertions(+), 698 deletions(-)
```

`97719b2` (eve250) cut `Hero.css` from **738 → 493 lines**. That is the design change.

### Step 4 — What was actually lost?

Comparing the CSS selectors present before and after `97719b2`:

```bash
git show "888760d:src/components/Hero.css"
git show "97719b2:src/components/Hero.css"
```

Selectors **removed** by that commit included the entire responsive layer
(`@media (max-width: 1200px / 950px / 700px / 380px)`) plus hover and focus states
(`.hero__search:focus-within`, `.hero__search-mic:hover`, `.hero__theme-button:hover`,
`.hero__search-result:focus-visible`, `.hero__search-list li`, …).

Measured effect on the rendered header:

| Property | HIBERMAHI (`e142c8b`) | After `97719b2` |
| --- | --- | --- |
| Header height | `112px` | `60px` |
| Title size | `18px` | `14px` |
| Date size | `13px` | `9px` |
| Search width | flexible (`flex: 1 1 0`) | fixed `160px` |
| Search height | `44px` | `32px` |
| Search input text | `14px` | `9px` |
| Breakpoints | 4 | 4 (different, narrower set) |

### Step 5 — Two features were also silently dropped

Reading `Hero.tsx` against the earlier version revealed behavioural regressions:

1. **The dashboard date was hardcoded** to `"01 August, 2026"`. HIBERMAHI's version
   held the date in state, refreshed it every 60 seconds, and formatted it with
   `toLocaleDateString("en-GB", …)`.
2. **The microphone button was dead.** It rendered `<Mic />` with no `onClick` at all,
   so voice search did nothing. HIBERMAHI's version implemented it with the Web Speech
   API (`SpeechRecognition` / `webkitSpeechRecognition`, `lang = "en-UG"`).

---

## 3. Changes made

### `src/components/Hero.css`

1. **Restored the stylesheet** to HIBERMAHI's version:

   ```bash
   git checkout e142c8b -- src/components/Hero.css
   ```

   Yielding **719 lines** — the 112px header, 18px title, 44px wide search bar, 14px
   input text and all four responsive breakpoints.

2. **Re-added the notification bell styles**, because the bell is current markup and
   HIBERMAHI's stylesheet predates it. A class audit confirmed only two classes were
   missing:

   ```
   classes used in Hero.tsx but missing from HIBERMAHI's CSS:
   hero__notify
   hero__notify-badge
   ```

   Added `.hero__notify` (40px circle, white, shadow) and `.hero__notify-badge`
   (8px red dot, top-right).

3. **Removed the theme toggle's `margin-left: -26px`.** HIBERMAHI used it as a visual
   nudge; with the bell now sitting immediately to its left, that negative margin would
   have pulled the toggle over the bell.

4. **Kept Sheila's brand navy in dark mode** instead of reverting to HIBERMAHI's
   `#111b30`. HIBERMAHI's shade predates the current sidebar colour, so restoring it
   would have made the header clash with the sidebar. Applied consistently:

   | Token | Value |
   | --- | --- |
   | Header background | `#203468` |
   | Borders | `#3a528c` |
   | Dropdown panels (profile, search results) | `#283f7d` |
   | Hover rows | `#3a528c` |
   | Avatar | light `#f5f5f5` on navy text |

### `src/components/Hero.tsx`

1. **Restored the live date** — `useState(new Date())` plus a 60-second `setInterval`,
   formatted with `toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })`.
2. **Restored functional voice search** — `startVoiceSearch()` using the Web Speech API,
   with `isListening` state wired to `aria-label`, `aria-pressed`, `title` and `onClick`.
   Falls back to a clear message when the browser does not support it.
3. **Left the notification bell in place.** Its markup was not the problem; only the CSS
   had been removed.

### `src/components/Hero.test.tsx`

One test asserted the frozen string and would now fail:

```diff
-it("renders the current date", () => {
-  expect(screen.getByText("01 August, 2026")).toBeInTheDocument();
+it("renders today's date", () => {
+  const expected = new Date().toLocaleDateString("en-GB", {
+    day: "2-digit", month: "long", year: "numeric",
+  });
+  expect(screen.getByText(expected)).toBeInTheDocument();
```

The assertion now uses the same formatter as the component, so it stays valid tomorrow.

---

## 4. Verification

| Check | Command | Result |
| --- | --- | --- |
| Type check | `npm run typecheck` | clean |
| Unit tests | `npm run test` | **202 passed** (27 files) |
| Production build | `npm run build` | clean |

Browser check at 1600px wide, measured with `getComputedStyle`:

| Property | Measured | Expected (HIBERMAHI) |
| --- | --- | --- |
| Header height | `112px` | 112px ✅ |
| Title | `18px` | 18px ✅ |
| Date | `13px`, live `"22 October 2026"` | 13px ✅ |
| Search box | `676 × 44px`, radius `32px` | 44px tall ✅ |
| Search input | `14px` | 14px ✅ |
| Bell | `40 × 40px` | present ✅ |
| Dark header | `rgb(32, 52, 104)` | brand navy ✅ |

---

## 5. What was deliberately *not* changed

- The sidebar and navigation (`navigation.config.ts`, `Sidebar.tsx`) — left untouched.
- The notification bell markup — kept, since only its styles were missing.
- The brand-palette dark-mode colours — kept from Sheila's commit rather than reverting
  to the pre-brand `#111b30`.

---

## 6. Reproducing / reverting

Restore HIBERMAHI's stylesheet exactly:

```bash
git checkout e142c8b -- src/components/Hero.css
```

Restore the pre-restore (eve250) version instead:

```bash
git checkout 64cfdd2 -- src/components/Hero.css src/components/Hero.tsx src/components/Hero.test.tsx
```

Then re-run `npm run typecheck && npm run test && npm run build`.
