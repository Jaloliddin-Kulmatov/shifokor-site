/* Local default: no server, so the site runs in demo mode (everything saved in the browser).
   On Vercel this file is rewritten at build time: when DATABASE_URL is set, api becomes "/api/app".
   No secrets belong here; the connection string stays on the server. */
window.SHIFOKOR_CONFIG = { api: "" };
