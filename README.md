# The Forest Lounge

A responsive restaurant website and staff dashboard with a Fidalgo-inspired viridian and copper theme, an original botanical line pattern, Jost typography, Cormorant wordmarks, handwritten decorative details, and full-width photography. Built with HTML/CSS/JavaScript and a Cloudflare Worker API backed by D1. Node.js 22.13+ is required for local development. No third-party runtime packages are needed.

## Features

- `/about/`: standalone Forest Lounge story page, sharing the Fidalgo-inspired visual system with readable Jost type, alternating photography sections, a photo strip, and working reservation/menu dialogs. Its story, buffet, events and contact information use the same CMS content as the home page.

- Fixed full-width navigation; mobile menu; restaurant story, buffet, events, offers, scroll-snap photo gallery, FAQs and contact sections.
- Original restaurant photography, logo and 23-page menu sourced from the supplied official website.
- Reservation requests saved server-side, with references and a staff-managed lifecycle. Requests are not automatically confirmed. No email/SMS integrations or notifications are configured.
- `/admin`: approved ChatGPT staff identity required in production. Edit headings, copy, photos, contact details, hours, gallery, menu pages, dishes, occasions and scheduled offers. Edits publish immediately without rebuilding. Concurrent edits are protected with content revisions.
- Analytics for visits, menu views, reservation form opens, completed requests, phone links and directions. 7/30/90-day charts, referral sources and device breakdown. Starts empty, no fabricated figures. One event per tab/session per day; no IP addresses, user-agent strings or full referring URLs are stored. Honors DNT and GPC.
- Reservation status filters/search and CSV export. Export respects the current filter and returns up to the most recent 1,000 requests.

## Local development

```sh
npm run dev
```

Open the server's URL. For **local staff testing only**:

```sh
DEV_ADMIN=1 npm run dev
```

Local staff mode is only implemented by `scripts/dev.mjs`; it is absent from the production Worker. Local SQLite data is stored in ignored `.local/forest.sqlite`. Local data never seeds production.

```sh
npm test
npm run build
```

## Production hosting

`.openai/hosting.json` retains the Sites project ID and D1 binding. Set `ADMIN_EMAILS` as a secret containing the comma-separated approved staff ChatGPT email addresses. Every admin API request checks both dispatch identity and the allowlist. Admin sessions use Sites' platform-managed sign-in; no passwords or login tokens are stored in the client. Keep the Site private until approved for public launch. Visitor and staff access are separate concerns; public visitors must never be added to `ADMIN_EMAILS`.

`npm run package` creates the deployment archive with the manifest, build output, and root-level Drizzle migration journal.

`npm run build` embeds the website and local assets in `dist/server/index.js` and packages SQL migrations. Deploy with Sites using its source/version/deployment workflow. The old Vercel static build configuration is not applicable to this full-stack Worker application.

`drizzle/0000_forest.sql` creates the content, reservations and aggregated activity schema. Production migrations are applied by Sites; no schema changes run during requests. Back up production records before future schema or hosting changes. The API applies basic repeated-request protection, but the application is not a payment or live table-availability system. Staff must contact guests directly. Reservation export should be handled as personal customer data.

## Content sources

Official source, retrieved 11 November 2026:

- https://theforestlounge.com/en — restaurant identity, story, address, hours, phones and original photography.
- https://theforestlounge.com/en/page/a-la-carte — printed menu images.
- https://theforestlounge.com/en/contact-us — contact information.

Test products and test prices from the official site were deliberately excluded. No active discounts, invented reviews, capacity claims or buffet prices are asserted. The published menu may change; guests are asked to confirm current prices and availability. All initial copy is editable through the dashboard. Editorial design copy and the original leaf favicon are part of this implementation.

## Current reference rebuild

The public front end was rebuilt from the supplied Fidalgo Meet the Chef reference's observed composition: inset banner, split desktop header with centered wordmark, fine vertical guides, portrait and overlapping food detail, narrow text column, translucent character reveals, curved second feature image, cursive booking prompt, and three-column footer. The native pointer is retained, matching the supplied page (it does not enable Fidalgo's gallery-only custom cursor). Motion is reimplemented in authored JavaScript/CSS, without the commercial theme runtime. Reduced motion remains supported.

The navigation now exposes `/menu/`, `/events/`, and `/offers/` as distinct pages; legacy root hash links are forwarded. `/about/` and `/meet-the-chef/` use the same reference composition as the home page. Restaurant information and bookings still use the existing CMS and D1 database.

`assets/dining-banner.jpg` is illustrative food photography from Unsplash: https://images.unsplash.com/photo-1544025162-d76694265947 (https://unsplash.com/license). Other restaurant and kitchen images remain sourced from the supplied Forest Lounge website. The banner is not a representation of a specific menu item.

## Complete homepage sequence

The home page now includes a muted looping background video, chef and cuisine sections, an infinite image-backed dining carousel, a second kitchen film with native playback controls, current/upcoming scheduled offers, attributed guestbook excerpts, and Contact Now / Book a Table calls to action. Videos stop off-screen and when the page is hidden. Reduced-motion and data-saving visitors get a poster until they choose playback. The dining carousel supports drag/swipe, arrow keys, pagination, pause/play and fine-pointer drag feedback. It pauses autoplay on hover, focus and reduced motion.

Homepage video URLs/posters, section headings and guestbook entries are editable in Website Content. Existing stored content is merged with new defaults without replacing restaurant edits. Scheduled offers appear on the home page as soon as staff publishes them; future start dates are labelled as upcoming. No promotions are fabricated. Quotes are brief excerpts from the restaurant's published guestbook at https://theforestlounge.com/en, with source links.

Video footage (illustrative, not filmed at Forest Lounge): Kampus Production on Pexels, https://www.pexels.com/video/a-chef-cooking-food-in-the-kitchen-8626269/ and https://www.pexels.com/video/chef-cooking-in-the-kitchen-8626675/. These free-use clips are edited to lightweight, silent H.264 loops under the Pexels licence (https://www.pexels.com/license/). Assets are served locally with correct MP4 MIME types and HTTP byte-range support for playback and seeking.

## Events and split guestbook section

Upcoming events now use a portrait-image horizontal carousel with left/right controls, pointer dragging, touch swipe, keyboard navigation and scroll snapping. Published events can be added under Offers & Events; expired dates are excluded. If no scheduled events or promotions exist, the carousel explicitly shows gathering options by enquiry rather than fabricated event dates.

Reviews use the supplied screenshot's two-panel composition: dining photograph and overlapping script caption on the left, an original faint leaf illustration, translucent THEY SAY label, guest quote, linked attribution and diamond pagination on the right. Reviews rotate only while visible, pause on hover/focus and support reduced motion. The photograph and script caption are editable under Website Content. The guest photograph is illustrative Unsplash footage: https://images.unsplash.com/photo-1528605248644-14dd04022da1 (https://unsplash.com/license).

## Visit Us replacement and event artwork

The homepage testimonial block has been replaced by the supplied Visit Us reference's navy split layout: a Google Maps embed for the Forest Lounge address, an editable side photograph, actual restaurant contacts/hours and a View Map link. Google frame origins are explicitly allowed in the Worker CSP. Previous review content is retained in the CMS rather than deleted.

Event posters are displayed at 1080:1350 (4:5), with the expected upload dimensions labelled in admin. Uploaded originals are cropped in the browser to preserve the layout; their source files are not resampled. The carousel supports mouse wheel / trackpad input, pointer dragging, touch swipe, keyboard arrows and visible left/right controls with a scroll cue. Wheel input is released back to page scrolling at either end.

## Fixed header, Fine Dine and supplied branding

The public header now remains fixed and visible in both scroll directions; all pages reserve space for it and anchor offsets account for its height. Fine Dine is the navigation and page name, with `/fine-dine/` as the linked URL; `/menu/` remains compatible. Public sections and dynamically rendered event cards use subtle reveal effects and hover feedback with reduced-motion support.

The supplied Forest Lounge logo is used in the header/footer and admin interface; its black backdrop was removed to prepare a transparent website asset. The redundant three-column footer contact block was removed. Visit Us now uses forest greens derived from the supplied mark and a muted looping mocktail video, with pause control and a poster fallback. Its video URL/poster are editable in Website Content.

Mocktail clip: Peggy Anke, Pexels, https://www.pexels.com/video/top-view-of-a-mocktail-drink-5348512/ (https://www.pexels.com/license/), illustrative lemon-lime soda over ice. The local silent H.264 clip is served with HTTP range support.
