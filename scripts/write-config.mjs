// Vercel build step: writes site/config.js from environment variables.
// Only the public project URL and the public (publishable or anon) key reach the browser.
// The database connection string, service_role key and JWT secret are never read.
import { writeFileSync } from "node:fs";

const env = process.env;
const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const key = (env.SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

function fail(msg) {
  console.error("write-config: " + msg);
  process.exit(1);
}

if (/^postgres(ql)?:\/\//i.test(url) || /^postgres(ql)?:\/\//i.test(key)) {
  fail("that is the database connection string. Use the project URL (https://<project>.supabase.co) and the publishable or anon key instead.");
}
if (url && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
  fail("SUPABASE_URL must look like https://<project>.supabase.co");
}
if (key.startsWith("sb_secret_")) {
  fail("that is a secret key. Use the publishable key (sb_publishable_...) or the anon key.");
}
if (key.split(".").length === 3) {
  let role = "";
  try {
    role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8")).role;
  } catch (e) {
    fail("the Supabase key is not a valid key.");
  }
  if (role !== "anon") fail("this key has the role '" + role + "'. Use the anon or publishable key, never service_role.");
}
if (Boolean(url) !== Boolean(key)) {
  fail("set both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY), or neither.");
}

writeFileSync(
  "site/config.js",
  "/* Written at build time by scripts/write-config.mjs. Public values only. */\n" +
    "window.SHIFOKOR_CONFIG = " + JSON.stringify({ supabaseUrl: url, supabaseKey: key }) + ";\n"
);
console.log(url ? "write-config: Supabase connected (" + url + ")" : "write-config: no Supabase variables, the site runs in demo mode");
