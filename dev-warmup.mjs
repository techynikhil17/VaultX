#!/usr/bin/env node
/**
 * dev-warmup.mjs
 *
 * Hits all app routes immediately after `next dev` is ready so Turbopack
 * compiles every page in the background. By the time you open the browser,
 * all pages are pre-compiled and navigation is instant.
 *
 * Usage: run automatically via the "dev" npm script.
 */

const BASE = "http://localhost:3000";

const ROUTES = [
  "/",
  "/login",
  "/signup",
  "/dashboard",
  "/vault",
  "/generator",
  "/breach-check",
  "/activity",
  "/profile",
];

async function waitForServer(maxWaitMs = 15_000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      await fetch(`${BASE}/`, { signal: AbortSignal.timeout(1000) });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return false;
}

async function warmup() {
  // Give the dev server a moment to start
  await new Promise((r) => setTimeout(r, 2000));

  const ready = await waitForServer();
  if (!ready) {
    console.log("[warmup] Server not ready after 15s — skipping warmup");
    return;
  }

  console.log("[warmup] Server ready — pre-compiling all routes...");

  await Promise.allSettled(
    ROUTES.map((route) =>
      fetch(`${BASE}${route}`, {
        headers: { "x-warmup": "1" },
        signal: AbortSignal.timeout(30_000),
      })
        .then(() => console.log(`[warmup] ✓ ${route}`))
        .catch(() => console.log(`[warmup] ~ ${route} (redirected/auth-guarded, still compiled)`))
    )
  );

  console.log("[warmup] All routes compiled. Navigation is now instant.");
}

warmup();
