# Agency review results

Produced by the agency run on the As Built landing page. The lead-engineer fix pass
started (commit 8db87c9 fixed the AS BUILT screenshot loading and lens performance;
the WIP commit after it holds partial fixes) and then died on a network error.
**Every issue below that is not yet fixed is still open.**

## QA and performance tester: 8/10

### Verdict

The landing page is solid and nearly meets the brief. I give it 8/10. It fails four acceptance points. CLS is close to 0 but not exactly 0. The ReplyAI screenshot does not load until the first hover. The AS BUILT lens misses the 60fps budget under 4x CPU throttle. Throttled-mobile LCP with network throttling is over target, but that was measured on the dev server, so it needs a production check. None of these is a blocker, and each fix is small. I changed no code. Screenshots are in C:/Users/sahil125/AppData/Local/Temp/claude/c--Users-sahil125-Desktop-project-my-portfolio/633d95b5-c800-4690-b3ff-972aa1786aa1/scratchpad/agency/qa/.

What passed:
- **Overflow:** scrollWidth minus clientWidth is 0 at 320, 375, 390, 430, 640, 768, 1024, 1280, 1366, 1440 and 1920, in Day and Night.
- **Page height:** 5881px at 1440x900 and 7286px at 390x800 (targets 6200 and 7600).
- **First screen:** at 1440x900 and 375x667 the name, Frontend Lead Engineer, Clyra, Mumbai, the email and Selected work are all on screen at full opacity after 1.6s. Selected work ends at 656px on the 667px screen. At 320x640 it ends at 683px, just below the fold (the brief only sets the target at 375).
- **Work rule above the fold:** 820px at 1440x900 and 726px at 375x667.
- **Lens with mouse:** it opens centred on the pointer on the first frame (--x/--y match the pointer exactly), follows it, and closes on leave. Plates II and III have no lens and no button.
- **Keyboard toggle:** Tab reaches As built. Enter and Space flood the plate (r=492px, aria-pressed true, label Drawing, width stays 82px). Esc and pressing again close it. The focus ring is visible.
- **Touch at 320 and 390:** the 32px tab toggles the lens without navigating.
- **Clicks:** clicking the plate opens /work/replyai. There is no a-inside-a and no button-inside-a. The Lab section has 0 anchors.
- **L glass:** pressing L opens the glass. Over Plate I it shows dashed rects with 'rect 258 x 124' labels and 'svg 774 x 581'. Clicking empty space opens the blueprint and Esc closes it. Opening the glass closes a flooded AS BUILT. 'Press L' in the title block opens the glass.
- **Plates:** all three are fully drawn 1.3s after scrolling into view. With reduced motion they show their final state, the flood is at full size on the first frame, and hover snaps open.
- **Callouts:** CAP, MEASURE and VIEWPORT show numbers. VIEWPORT and MEASURE update live on resize. Below 640px only VIEWPORT shows. None of them covers the name from 640 to 1920.
- **Title block:** in Chromium it shows LCP 0.42 to 1.13 S, CLS 0.000 and TRANSFER 1061 KB (dev bundle).
- **No dashes:** 0 U+2014 and 0 U+2013 in the rendered HTML of /, the three /work/* pages and the 404. The 404 returns status 404 and renders.
- **Copy and order:** section order is intro, work, experience, about, lab, contact. 'since January' appears once. "Let's talk" is gone. Both Clyra case pages show 'in preparation' and none of the 'Describe the result' text. The proof line and the Live site and Source links (target _blank) are right. Each stack line has at most 4 items.
- **Console:** no errors or warnings on any page except the 404 page's own expected 404.
- **No JavaScript:** the email, proof line, Clyra and Contact are visible, the plates show their final drawing, and the As built button is hidden.
- **Night contrast:** 5.5:1 or better.
- **Smoothness without throttling:** lens frame time averages 6.94ms (p95 7.1ms).
- **/work/replyai:** renders well and its screenshot loads lazily.

Measured numbers:
- **LCP:**
  - Desktop: 0.59 to 0.92s.
  - 390 with 4x CPU: 1.06 to 1.13s.
  - 390 with 4x CPU plus 150ms RTT and 1.6Mbps: 1.93s.
- **Frame time with 4x CPU:**
  - Lens moving: 14.3 to 15.7ms average, p95 27.8ms.
  - Flood: 16.8 to 18.2ms average.
  - The L glass under the same throttle: 10.45ms average.
- **CLS over load, glass demo, full scroll, hover, flood, six resizes and Press L:** 0.000005. All of it comes from the glass HUD's fps number.

### Issues

1. **high**: The ReplyAI screenshot is never fetched when Plate I scrolls into view. The IntersectionObserver mounts the img, but it keeps an empty currentSrc and complete=false, and no request goes out. With loading="lazy" inside a wrapper clipped to circle(0px), Chrome does not treat the image as visible. The request (/_next/image?url=%2Fwork%2Freplyai.png&w=828) only starts about 22ms after the first hover or toggle. On localhost it arrives in time. On a real network, the first hover, the signature moment, opens a lens with only the drawing inside it until the PNG downloads. This fails the brief's intent that the image is loaded once the plate is near the viewport.
   - Fix: In AsBuilt.tsx, the component already delays mounting until the plate is in view after load, so once near is true, render the next/image with loading="eager" (optionally fetchPriority="low") instead of loading="lazy". Then check in the Network panel that the request starts when the plate enters the viewport, not on hover.
2. **medium**: CLS is not exactly 0. The glass HUD's `{hud.fps} fps` span (Loupe.tsx, about line 966) has no fixed width. When the fps changes between 2 and 3 digits (for example 99 to 122), the next span ('Click empty space to flood...') moves 7px. That produced layout shifts of 0.0000027 to 0.00002 in every run during the automatic glass demo (about 5.9 to 8.8s after load at 1440 and 375) and whenever the glass is open. The brief requires CLS 0 including the demo. The title block still prints 0.000 because it rounds.
   - Fix: Give the fps number a fixed tabular slot, for example `<span className="inline-block min-w-[3ch] text-right tabular-nums">{hud.fps}</span> fps`, and add tabular-nums to the HUD container.
3. **medium**: Late web fonts cause a layout shift. With the .woff2 files delayed 2s, the font swap gave CLS 0.0188 at 1440x900 (sources: the hero bottom grid, the 'Portfolio · updated' line, the contact list and the header nav) and 0.00017 at 390x844. An unexplained 0.0193 shift at 1440 on the very first cold load had the same sources. The cause: plexMono is a localFont with display swap and no adjustFontFallback, so next/font builds its metric fallback from Arial, a proportional font. Mono lines then wrap and size differently until IBM Plex Mono arrives.
   - Fix: In src/app/layout.tsx, for plexMono either set display: "optional" (it is small and preloaded), or set adjustFontFallback: false and declare a mono fallback with matching metrics (Courier New or Menlo with size-adjust or ascent-override). Rerun the delayed-font test until CLS is 0.0000. Check that Newsreader's italic metrics also match the Times New Roman fallback.
4. **medium**: The AS BUILT lens misses the brief's budget of 60fps on a 4x CPU-throttled laptop. Under 4x throttle, moving the lens for 3s averaged 14.3 to 15.7ms per frame with p95 27.8ms and 2 to 7 frames over 33ms. The flood averaged 16.8 to 18.2ms, above 16.7. The global L glass under the same throttle averaged 10.45ms, so the lens is the costly path. Each frame changes clip-path through custom properties on a full-plate image layer, which forces a repaint, and the ring has a conic-gradient tick mask. The acceptance test without throttling passes at 6.94ms.
   - Fix: Make the lens compositor-only. One option: a circular overflow-hidden, border-radius 50% window moved with transform, with the image moved the opposite way by transform inside it. Another: animate the radius by scaling a precomputed clip instead of rewriting circle(). Add will-change: transform on the ring and window, and measure again with the ring ticks turned off to see their cost.
5. **medium**: The throttled-mobile LCP target (1.6s or less) is not met with network throttling. At 390 with 4x CPU plus 150ms RTT and 1.6Mbps down, LCP (the hero statement paragraph) was 1.93s. With 4x CPU only it was 1.06 to 1.13s. All runs used the dev server (1061 KB transfer, unminified JS), and the rules forbid starting a production server, so this is an upper bound and is not verified on a production build.
   - Fix: Measure LCP on a production build or Vercel preview with Lighthouse mobile. If it is still over 1.6s, look at the font swap first (the LCP element is text in Newsreader), then at the hydration cost before the hero text paints.
6. **low**: Acceptance says 'Header nav and Ruler labels read Work 02, Experience 03, About 04, Lab 05, Contact 06'. The desktop header nav renders only WORK, EXPERIENCE, ABOUT, LAB, CONTACT (Header.tsx defines n but renders only n.label). The numbers appear only in the mobile Menu sheet and on the Ruler.
   - Fix: Either show `{n.n}` as a quiet t-meta suffix in the desktop nav (text-ink-3, with a fixed width so nothing shifts), or record in DECISIONS.md that the desktop nav leaves the numbers out on purpose.
7. **low**: The Experience heading is not de-templated. The H2 'Experience' computes to 64px, the same as Work's 'Selected work' (64px), and the company 'Clyra' is also 64px right under it. The brief wanted Work to keep the big title and Experience to step down to t-title. Experience reads as a copy of the Work header, and two 64px serif lines stack close together, worse on mobile.
   - Fix: Set the Experience SectionHead title one step smaller than Work's (for example clamp(1.8rem,3vw,2.6rem), like Lab), or drop the word 'Experience' to a t-meta label and let 'Clyra' be the display line.
8. **low**: The hero callout text sits inside the h1. document.querySelector('h1').textContent is 'SahilCap ··· pxShityalkar' in the server HTML and 'Sahil Cap 126 px Shityalkar' after JS runs. aria-hidden keeps it out of screen readers, but crawlers, reader mode and copy-paste of the name still pick it up.
   - Fix: Render the CAP callout as a sibling outside the h1, positioned against a wrapper, or draw the label with a CSS pseudo-element (content: attr(data-cap)) so it is not text inside the heading.
9. **low**: From 768 to 1023 wide the hero keeps min-h 100svh with justify-end. At 768x900 there is a blank band of about 250px above the eyebrow (which starts at 317px), and the Work rule does not peek above the fold.
   - Fix: Apply the mobile top padding with no min-height up to lg, or use the calc(100svh-5rem) rule from md upward.
10. **low**: Below 1600px the Ruler's active name runs down the ruler instead of sitting beside its number, which differs from layout item 6. Inactive items show only their number, which is acceptable. The layout builder already reported this.
   - Fix: Accept it and record the reason in DECISIONS.md, or show the active name horizontally only at 1600px and wider and hide it below that.
11. **low**: Phone details on Plate I:
- At 320, the bottom of the As built tab (y=326) overlaps the top border of the REPLY 1 card (about y=323) by about 3px.
- The flooded readout cuts the URL to 'complaint-reply-generator.ver…'.
- The plate's SVG labels (COMPLAINT, REPLY 1) are about 5px on screen and cannot be read at 320.
   - Fix: Nudge the REPLY cards down or make the tab 30px tall only below 360px. Below 400px, let the readout wrap to two lines or show only 'As built'.
12. **low**: The title block's fallback text does not fit its slots. In browsers without LCP or layout-shift entries (Safari, Firefox), 'not reported here' (17 characters) replaces slots sized 5ch to 6ch, so the 'This visit' row reflows after load. Without JS the middle-dot placeholders ('LCP ···· S CLS ·····') stay up for good.
   - Fix: Use a short fallback that fits the slot (for example 'n/a') and keep the long wording in a title attribute, or size the slots for the longest string. Hide the 'This visit' cell when the html element lacks the .js class.
13. **low**: Small layout issues in Contact and the footer:
- At 320 the Contact row 'linkedin.com/in/sahilshityal' / 'kar' breaks in the middle of the handle.
- At 1440 the footer title block sits flush on the last pixel of the page, with no bottom padding.
- The Copy email and Open mail app controls are fully rounded pills, while the As built toggle and the title block use square 2px corners.
   - Fix: Use overflow-wrap:anywhere with a wbr before 'in/', or a smaller size for the link rows below 360px. Add pb-8 to sm:pb-12 under the footer. Make the CopyEmail full variant rounded-[2px] to match the drafting style.
14. **low**: The glass HUD (fixed bottom-left, no background) prints over page content: over the 'Selected work' heading and '02' at 1440x900 with the glass open, and over the 'Clyra student' heading while over the plates. It is hard to read there. This predates this pass.
   - Fix: Give the HUD a paper background with px-1.5, or a backdrop strip with a hairline top, as the AS BUILT readout already has.

## Hiring panel (recruiter, engineering manager, design lead): 7/10

### Verdict

HIRING PANEL REVIEW of http://localhost:3000. I spent about 60 seconds per persona at 1440x900 and 390x844, plus a first visit in a fresh context, the As Built toggle and lens, the Loupe (L), Night mode, keyboard focus, /work/replyai and /work/clyra-student-app. No code was edited. Screenshots are in C:/Users/sahil125/AppData/Local/Temp/claude/c--Users-sahil125-Desktop-project-my-portfolio/633d95b5-c800-4690-b3ff-972aa1786aa1/scratchpad/agency/panel/ (d-*.png desktop, m-*.png phone, c-*.png case pages).

(1) TECHNICAL RECRUITER, screening 50 today: YES, I would reach out. What convinced me: the name, role, company, city, email with a Copy button, LinkedIn and GitHub are all on the first screen with no interaction needed, on desktop and phone. The page loads instantly and the copy is plain English. What almost lost me: (a) there is no resume link anywhere, because links.resume is null, so I cannot forward a PDF to the hiring manager; (b) "FRONTEND LEAD ENGINEER AT CLYRA" is about 11px grey mono in the bottom-left corner while the name fills about 55% of the screen, so I had to hunt for the job title; (c) availability ("open to senior frontend and frontend lead roles") only appears in Contact, about 5000px down; (d) years of experience are never stated (profile.experience "2 years" is not rendered), so I had to work it out from "Jan 2025 to present".

(2) ENGINEERING MANAGER hiring a frontend lead: MAYBE, leaning yes. I would take a call because of ReplyAI. What convinced me: the ReplyAI case is the best thing on the site. It has real proof (3 replies in under 5 s, 22 of 22 tests, live link plus source), and the outcome tells an honest story: testing the running app caught a silent missing-migration bug that a green build had missed. The site itself is evidence of craft: the footer measures LCP 0.52 s and CLS 0.000 live, there are no animation libraries, the Loupe measures 220 DOM nodes at 92 to 126 fps, the skip link and focus rings are visible, and tab order is logical. What almost lost me: the Clyra job, the one that proves "lead", is the thinnest part. All three Experience bullets and almost all of the Clyra II and III copy are demo text. Both Clyra case pages print "Outcome to be published once results can be shared publicly" and "Reflection in preparation". There is no leadership signal anywhere (team size, people mentored, a standard set, a hire made), and "Lead" with under 2 years in the role makes me skeptical without scope. The Lab section shows 3 cards that link nowhere ("separate site, in progress"), which reads as vapor.

(3) DESIGN LEAD judging craft: YES. What convinced me: the editorial serif and mono pairing is restrained and confident. The drafting concept (cap-height and measure callouts, printed section rules, a ruler with the active section, a title-block footer) is coherent rather than decorative. The As Built lens on Plate I, where the drawing turns into the real product under the glass with a tick ring and an "AS BUILT · url" readout, is a real signature moment. Night mode is well made (warm amber marks, not inverted grey). There is none of the generic AI look. What almost lost me: the hierarchy of the hero meta text, inconsistent section heads (Work, Experience and Lab use a number plus a big serif title; About and Contact use a small mono label, and Contact has no 06), the Loupe status line printing over the "Selected work" heading with nothing behind it, Plates II and III being grey abstract diagrams with no As Built payoff, and on phone a dead band under the hero, a "VIEWPORT 390 x 844 · DPR 2" readout that means nothing to visitors, and "INSPECT: PRESS L" in the footer on a touch device.

COMBINED: 7/10. The craft and concept are already better than most portfolios at this level, and ReplyAI carries the engineering case. What holds it back from "hire on sight" is recruiter logistics (resume, title hierarchy, availability) and unverified Clyra and leadership evidence. Fixes 1 to 3 below would likely move it to 8 or 9. Some of them need real facts from the owner (resume PDF, Clyra details). Until those arrive, the right move is to hide placeholders rather than invent anything.

### Issues

1. **high**: Recruiter: there is no resume anywhere on the page (links.resume is null in src/content/profile.ts), so a recruiter cannot forward a PDF to the hiring manager, which is the most common next step.
   - Fix: The owner adds public/resume.pdf and sets links.resume to '/resume.pdf'. Show a 'Resume (PDF)' link right after the email/Copy pair in the hero contact cluster and again in Contact. Flag this to the owner as the top pending item in PLACEHOLDERS.md.
2. **high**: Recruiter: the first-screen recruiter line exists but has weak hierarchy. 'Frontend Lead Engineer at Clyra / Mumbai' is about 11px grey uppercase mono in the bottom-left while the name takes about 55% of the 1440x900 fold. Availability only appears in Contact (about y=4500), and years of experience are never shown (profile.experience is not rendered).
   - Fix: In Hero.tsx, set the role line ('Frontend Lead Engineer at Clyra') in ink at body-serif size, about 18 to 20px, and keep location and focus in mono beneath it. Add one short availability line to the hero meta from profile.availability (first sentence only), e.g. 'Open to senior frontend and frontend lead roles'. Optionally render profile.experience next to the role. Do not shrink the name; take the space from the empty band below the statement.
3. **high**: Engineering manager: the Clyra lead role is the least evidenced part of the page. All three Experience bullets and almost all of the copy for cases II and III are demo(). Both Clyra case pages print visible placeholders ('Outcome to be published once results can be shared publicly', 'Reflection in preparation'). There is no leadership or scope signal (team size, reviews, mentoring, standards set).
   - Fix: Do not invent anything. (a) On /work/clyra-* hide sections whose body is draft() instead of printing placeholder sentences. (b) Ask the owner for 2 or 3 verifiable Clyra facts: team size, what he owned, anything public on heyclyra.com. Put them in experience.ts and in a proof line on cards II and III like the one Plate I has (e.g. 'live at heyclyra.com'). (c) Keep the PLACEHOLDERS.md list current so these are replaced before launch.
4. **medium**: Lab section: three experiment cards with no links at all (the #lab section contains 0 anchors) under a 'Separate site, in progress' label. To an engineering manager this reads as vaporware and takes about 900px of the page.
   - Fix: Make the Blueprint card do something now: it describes the Loupe, so its CTA can be 'Try it on this page: press L / tap' and open the Inspect mode. Until lab.sahilshityalkar.com is live, either shrink Lab to a single row or label each card 'coming to lab.sahilshityalkar.com' with no fake affordance.
5. **medium**: Loupe (L) status line ('GLASS · 220 MEASURED NODES · 126 FPS · CLICK EMPTY SPACE TO FLOOD · ESC TO CLOSE') is drawn at the bottom of the viewport with no background, so it collides with page text (it printed across the 'Selected work' heading at 1440x900).
   - Fix: Give the status line a paper background (bg-paper) with a top hairline rule and padding, or reserve a fixed bottom strip while Inspect is on, so the text never overlaps content. Check at 390 and 1440 in Day and Night.
6. **medium**: Touch devices are told to press a key: the footer title block shows 'INSPECT: PRESS L' at 390x844 (the hero hint already correctly says 'Tap to look under the glass').
   - Fix: In TitleBlock.tsx, use the same (hover: none) / (pointer: coarse) swap as the hero hint: 'Tap the lens' plus the search icon on touch, 'Press L' on fine pointers.
7. **medium**: Design lead: the section head system is inconsistent. 02 Selected work, 03 Experience and 05 Lab use a number plus a large serif title. 04 About uses a small mono '04 ABOUT' label. Contact uses a mono 'CONTACT' label with no 06, even though the ruler shows 06 CONTACT.
   - Fix: Pick one system. Either give About and Contact the same SectionHead (number plus serif title; Contact can keep the giant email as its display line under a normal head), or deliberately demote all of them. Make sure Contact shows 06 so it matches the Ruler.
8. **medium**: Design lead: only Plate I pays off the As Built concept. Plates II and III (mastery graph, cohort heatmap) are grey abstract diagrams with no reveal. On phone the heatmap's 'STUDENTS' axis and the 'NEEDS HELP' card sit cramped against the plate edges.
   - Fix: When the owner can share real Clyra screenshots, give Plates II and III the same AsBuilt lens. Until then, keep them as drawings but tighten them: give the 'needs help' row the mark colour so the heatmap tells one story at a glance, and check the plate padding at 390 so the axis label and card are not clipped.
9. **low**: Phone fold (390x844): about 180px of empty space under the hero, plus a 'VIEWPORT 390 x 844 · DPR 2' readout that means nothing to a visitor. No part of the work section peeks above the fold. Section gaps further down (Education to About, Toolkit to Lab) are about 250px, which helps make the page 7242px tall.
   - Fix: Hide the viewport readout below 640px. Reduce the hero bottom padding and the section spacing on small screens so the Plate I top edge or the Work rule peeks above the fold at 390x844, and cut the mobile section gaps by about 30 to 40%.
10. **low**: Accessibility: the As Built toggle swaps its visible text ('As built' to 'Drawing') while also flipping aria-pressed. A screen reader therefore hears 'Drawing, toggle button, pressed' when the product screenshot is showing, which is the opposite meaning. The plate caption also still says 'Plate I: the drawing...' while the screenshot is showing.
   - Fix: Give the button a constant accessible name (e.g. aria-label='Show the shipped product') and keep aria-pressed, with the visible label swap marked aria-hidden. Or keep the label swap and drop aria-pressed. Update the figcaption text (or an aria-live line) when the state changes.
11. **low**: About 'What I bring': the first proof line is just 'PROOF CLYRA', which links nowhere and carries no evidence, next to two concrete proofs (footer metrics, ReplyAI tests).
   - Fix: Make it a link to #experience or to heyclyra.com, or replace it with a verifiable artifact once the owner supplies one. Don't leave a bare company name labelled as proof.

