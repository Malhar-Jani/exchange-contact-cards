# Exchange

A small, self-hostable contact QR generator for meeting people at events.

Enter the details you want to share, save an event preset, and show or download your QR. The QR embeds a vCard 3.0 directly: recipients do not need this site, an account, or an internet connection. Their phone controls preview and save confirmation; QR recognition and contact import steps vary by scanner. This is one-way sharing, not automatic two-way contact exchange.

## Features

- Live QR from first/last name, phone, email, organisation, role, website, and note.
- Named local event presets, with explicit saving and deletion.
- Event label stays private; contact note is included in the vCard.
- Large presentation view, 1200px PNG download, and `.vcf` download.
- The offline generator uses no server or tracking and keeps entered details in your browser.
- Optional share-back QR creation through eSummit Contacts: recipients save your card and can submit their own details without an account. You sign in to the tracker as the collector.

Presets stay in localStorage in the current browser and origin. They do not sync or constitute a backup. Clearing browser data deletes them. Downloaded QR images and vCards contain the selected personal details; anyone with them can read those details. Editing a preset does not change previously exported QR codes.

**Create a share-back QR** opens the tracker's `/exchange` page with your draft in a URL fragment. That option shares your selected details and event name with the tracker when you create the web QR. Its replies are stored by the tracker under your collector identity and event. Share-back codes need internet and expire; the offline vCard QR remains available independently. The tracker must deploy the matching exchange endpoints and configure persistent storage/signing before the web flow is available.

For a local integration trial, set `VITE_TRACKER_URL` to the isolated tracker origin before starting Vite. `node tests/tracker-integration.mjs` checks the tracker APIs and browser flow against an isolated local server at port 3187 (or `TRACKER_QA_URL`); it refuses non-local targets to avoid creating production test contacts.

## Development

Requires Node 22+.

```sh
npm ci
npm run dev
npm test
npm run test:browser
npm run build
```

On Windows PowerShell use `npm.cmd` if execution policy blocks `npm.ps1`.

Browser checks use an installed Google Chrome and start a local dev server automatically. They decode the actual rendered QR at desktop and mobile sizes, check preset persistence and switching, and exercise both downloads.

## Hosting

The GitHub Actions workflow tests, builds, and publishes `dist/` to GitHub Pages. Enable Pages with **GitHub Actions** as its source. Vite uses relative asset paths, so the build also works on a project path or a custom subdomain. For Cloudflare Pages use `npm run build` and output directory `dist`. No credentials or backend required.
