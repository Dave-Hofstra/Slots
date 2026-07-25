// Herons Glen Slots — Minimal Service Worker
// Required for PWA install prompt (beforeinstallprompt event)
// No caching: slot machine images are served fresh
// Version: 2026-07-09-v2 — force re-fetch after grid sizing fix

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
