/* Tryout Apoteker UNPAD Web Push service worker */
self.addEventListener("install", event => { self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(self.clients.claim()); });
self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : "" }; }
  event.waitUntil(self.registration.showNotification(data.title || "Pengingat Tryout Apoteker UNPAD", {
    body: data.body || "Waktunya kembali ke tujuanmu.",
    icon: "./icon.png",
    badge: "./icon.png",
    tag: data.tag || "unpad-reminder",
    renotify: false,
    data: { url: data.url || "/" }
  }));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  // GitHub Pages project sites live under /<repository-name>/, not the domain root.
  const scopeUrl = self.registration.scope;
  let targetUrl = new URL(event.notification.data?.url || scopeUrl, scopeUrl);
  if (targetUrl.origin === self.location.origin && targetUrl.pathname === "/") {
    targetUrl = new URL(scopeUrl);
  }
  const target = targetUrl.href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.focus();
        if ("navigate" in client && client.url !== target) await client.navigate(target);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
