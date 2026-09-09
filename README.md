# admin-site

HackIllinois' admin site

# Setup

Install dependencies with:

```sh
npm install
```

# Developing

To run locally, run:

```sh
npm run dev
```

# Email artwork

The email tab uses `util/email-template.ts` for both its preview and the HTML
submitted by Send to Self and Send to All Attendees. Enter only the message body;
the header and footer are added automatically.

The PNGs in `public/email/` were exported at 2760 × 690 from the
`header_hackillinois` and `footer_hackillinois` frames on the Hype Site + Email Header
page in [HackIllinois 2027: Registration](https://www.figma.com/design/j8zBEXzk8Yvd1OD3HvuJWR/HackIllinois-2027--Registration?node-id=4209-453).

Email images use absolute URLs on the admin site's origin by default. Deploy the
artwork with the site before sending emails. To send from a local development
server, set `NEXT_PUBLIC_EMAIL_ASSET_BASE_URL` to the public origin hosting these
files; recipients cannot load images from localhost. The `/email/` image paths must
be publicly accessible without signing in.

The mail API receives a complete header/body/footer HTML fragment in its `body`
field. Its hosted `generic` mail template should insert that HTML without adding
another branded header or footer.
