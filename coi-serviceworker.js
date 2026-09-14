/*! coi-serviceworker v0.1.7 - MIT License */
let coepCredentialless = false;
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
  self.addEventListener("fetch", (event) => {
    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.status === 0) return response;
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }).catch(() => fetch(event.request))
    );
  });
} else {
  (() => {
    const reloadedBySelf = window.sessionStorage.getItem("coiReloadedBySelf");
    window.sessionStorage.removeItem("coiReloadedBySelf");
    const coepDegrading = reloadedBySelf == "coepdegrade";
    if (window.crossOriginIsolated || window.location.protocol === "file:") return;
    const n = navigator;
    if (n.serviceWorker) {
      n.serviceWorker.register(window.document.currentScript.src).then((registration) => {
        registration.addEventListener("updatefound", () => window.location.reload());
        if (registration.active && !n.serviceWorker.controller) window.location.reload();
      });
    }
  })();
}