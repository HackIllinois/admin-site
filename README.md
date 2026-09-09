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

The header and footer PNGs in `public/email/` were exported at 2760 × 690 from the
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

## Email image library

Select a banner in **Email images**, then choose **Copy image URL**. Replace the
value of the existing image's `src` attribute with that full URL. Alternatively,
place the cursor in the body and choose **Insert image** to add a complete image
tag. This inserts at the cursor or replaces selected HTML.

The speedrun Alpha banner is served from:

```html
<img src="https://admin.hackillinois.org/email/speedrun_alpha_graphic.png" alt="speedrun Alpha" width="760" style="display:block;width:100%;max-width:760px;height:auto;border:0;margin:0 0 24px 0;">
```

The picker uses the same origin (or `NEXT_PUBLIC_EMAIL_ASSET_BASE_URL` override)
as the automatic header/footer. Always use the full public URL in sent emails;
`speedrun_alpha_graphic.png` alone is not a usable email image URL.

To add another image:

1. Add the PNG, JPEG, or GIF to `public/email/` with a unique filename.
2. Add its public path, display label, and alt text to `EMAIL_IMAGES` in
   `util/email-images.ts`. Public paths start with `/email/`, not `/public/`.
3. Commit and deploy the site. The image and picker entry deploy together.

Use a new filename when revising artwork. Keep existing images available so
previously sent emails continue to display them. This library uses site assets;
it requires no GitHub token, upload endpoint, or separate storage service.
