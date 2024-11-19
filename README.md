# admin-site

HackIllinois' admin site

# Deploying

Since this is a private repo, we use manual deployment to netlify.

**Note: Make sure you build without the .env locally, or the token will be included in the build.**
You can verify you haven't made this mistake by ensuring the app prompts a login on start.

To do so:
1. Run `npm build`
2. Copy the `netlify.toml` into the `build/` folder (`cp netlify.toml build/`)
3. Upload the `build/` folder to netlify
