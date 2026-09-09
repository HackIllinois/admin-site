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

## Uploading email images

Place the cursor in the HTML body, optionally enter image alt text, and choose
**Upload & insert image**. PNG, JPEG, and GIF files up to 5 MB are supported.
The uploader adds responsive image HTML at the selection, updates the preview,
and provides a public URL to copy. Uploading publishes the image publicly.

Uploads use the existing public `HackIllinois/adonix-metadata` asset repository,
under `email/uploads/`. Each image gets a unique filename and a raw GitHub URL
pinned to its commit, so future uploads cannot replace artwork in sent emails.
The automatic header/footer continue to use the bundled `public/email/` assets.

Before deploying, configure these **server-only** environment variables:

- `EMAIL_IMAGES_GITHUB_TOKEN`: a GitHub credential with Contents write permission
  on the asset repository. Use a fine-grained token scoped to that repository;
  do not put it in a `NEXT_PUBLIC_` variable or commit it.
- `EMAIL_IMAGES_GITHUB_REPOSITORY`: optional, defaults to `HackIllinois/adonix-metadata`.
- `EMAIL_IMAGES_GITHUB_BRANCH`: optional, defaults to `main`. The credential must
  be allowed to create commits on this branch.

For local Next.js development, set them in `.env.local`. On Cloudflare, store the
token as a Worker secret (`npx wrangler secret put EMAIL_IMAGES_GITHUB_TOKEN`) and
configure the optional values as runtime variables. Redeploy the updated app.
The upload route verifies the user's ADMIN role with Adonix on each request,
checks size and image signatures, and rejects private asset repositories.
Missing configuration is reported in the editor without changing the draft.
