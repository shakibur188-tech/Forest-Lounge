# The Forest Lounge

A responsive restaurant website and staff dashboard with a full-width photographic layout, a muted forest-green palette, oversized Inter typography, and an editorial composition inspired by the supplied design reference. Built with HTML/CSS/JavaScript and a Cloudflare Worker API backed by D1. Node.js 22.13+ is required for local development. No third-party runtime packages are needed.

## Features

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
