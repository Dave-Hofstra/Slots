// Slots — Minimal Service Worker
// Required for PWA install prompt (beforeinstallprompt event)
// No caching: slot machine images are served fresh
// Version: 2026-07-19-v3 — card multiplier + jackpot rebalance

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

// Respond to skip-waiting message from the page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
