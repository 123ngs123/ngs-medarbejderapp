const CACHE_NAME = "ngs-arbejdsseddel-v9";
const FILES = [
  "manifest.webmanifest",
  "team-collage.jpg",
  "ngs-logo.png",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];

function updateAppText(html) {
  return html
    .replaceAll("Flyt, timer og materialer", "Kunde, timer, dørtrin og fejelister")
    .replaceAll("Praca, godziny i materiały", "Klient, godziny, progi i listwy")
    .replaceAll(
      "Registrér alle brugte materialer og mængder.",
      "Registrér kun antal dørtrin og fejelister i stk. Øvrige materialer skal ikke registreres."
    )
    .replaceAll(
      "Zarejestruj wszystkie zużyte materiały i ilości.",
      "Zarejestruj tylko liczbę progów i listew w sztukach. Innych materiałów nie należy rejestrować."
    )
    .replaceAll(
      "Skriv antal dørtrin og fejelister samt eventuelle ekstra udgifter eller problemer.",
      "Skriv eventuelle ekstra udgifter eller problemer."
    )
    .replaceAll(
      "Wpisz liczbę progów i listew oraz dodatkowe koszty lub problemy.",
      "Wpisz ewentualne dodatkowe koszty lub problemy."
    )
    .replaceAll(
      "Skriv dørtrin, fejelister og eventuelle problemer.",
      "Skriv eventuelle ekstra udgifter eller problemer."
    )
    .replaceAll("Materialer, dørtrin og fejelister", "Dørtrin og fejelister i stk.")
    .replaceAll("Materiały, progi i listwy", "Progi i listwy w sztukach");
}

async function fetchUpdatedApp(request) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    const html = updateAppText(await response.text());
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "no-cache");
    const updatedResponse = new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
    const cache = await caches.open(CACHE_NAME);
    await cache.put("./", updatedResponse.clone());
    return updatedResponse;
  } catch (_) {
    const cached = await caches.match("./");
    if (cached) return cached;
    throw _;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isAppPage =
    event.request.mode === "navigate" ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/ngs-medarbejderapp/");

  if (isAppPage) {
    event.respondWith(fetchUpdatedApp(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
    )
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(data.title || "NGS Arbejdsregistrering", {
      body: data.body || "Husk at udfylde dagens arbejdsseddel.",
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: data.tag || "ngs-daily-reminder",
      data: { url: data.url || "./" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "./";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => "focus" in client);
      return existing ? existing.focus().then(() => existing.navigate(target)) : clients.openWindow(target);
    })
  );
});
