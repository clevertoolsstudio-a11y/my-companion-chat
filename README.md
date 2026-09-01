# My Companion Chat — publish-ready starter

A bilingual English/Spanish AI companion web app for Clevertools Studio.

## What works immediately
- Responsive chat UI
- Gio + all 9 character configurations
- English/Spanish UI switcher
- English `en-GB` and Spanish `es-ES` speech recognition where supported
- Browser-native text-to-speech with dynamic voice selection
- Local demo mode when Supabase is not configured
- No Anthropic secret in browser code

## Production architecture
Browser -> Supabase Edge Function -> Anthropic API
Browser -> Supabase Auth/Database

## Local setup
1. Install Node.js LTS.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add the public Supabase URL and anon key.
5. Run `npm run dev`.

## Supabase
Run `supabase/schema.sql` in the Supabase SQL Editor.
Deploy `supabase/functions/chat/index.ts` as an Edge Function named `chat`.
Set these server secrets in Supabase:
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (set to a currently supported Anthropic model available to your account)

Never put `ANTHROPIC_API_KEY` in `.env.local`, Vite code, GitHub, or the browser.

## Hosting
This is a Vite app. Run `npm run build`; publish the generated `dist` folder on a static host such as Netlify or Vercel. Add the same VITE_ variables in the host's environment-variable settings.

## Before public launch
- Replace demo affiliate cards with approved affiliate URLs.
- Add Privacy Policy, Terms, Cookie/consent notice where required.
- Verify merchant affiliate programme approval and disclosure requirements.
- Test voice support on target browsers/devices.
- Configure Supabase Auth redirect URLs for the final domain.
- Add a custom domain.
- Run a security review and abuse/rate-limit controls before significant traffic.
