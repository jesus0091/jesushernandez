import assert from "node:assert/strict";

// Run against a local production server: BASE_URL=http://localhost:3100 npm run test:routes
const base = new URL(process.env.BASE_URL ?? "http://localhost:3000");
const routes = [
  ["/", "en", 200],
  ["/es", "es", 200],
  ["/about", "en", 200],
  ["/es/sobre-mi", "es", 200],
  ["/services", "en", 200],
  ["/es/servicios", "es", 200],
  ["/es/servicios/desarrollo-web", "es", 200],
  ["/blog", "en", 200],
  ["/works/unknown-project", "en", 404],
  ["/es/services/unknown-service", "es", 404],
  ["/missing-page", "en", 404],
  ["/es/pagina-inexistente", "es", 404],
];

for (const [path, locale, status] of routes) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, status, `${path}: HTTP status`);
  const html = await response.text();
  assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`), `${path}: document language`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff", `${path}: security header`);
  if (status === 200) {
    const skip = locale === "es" ? "Saltar al contenido" : "Skip to content";
    assert.match(html, new RegExp(`class="skip-link">${skip}</a>`), `${path}: translated skip link`);
    assert.match(html, /id="main-content"/, `${path}: skip link target`);
  }
  console.log(`PASS ${status} ${path} (${locale})`);
}

for (const [path, destination] of [
  ["/es/about", "/es/sobre-mi"],
  ["/es/services", "/es/servicios"],
  ["/es/services/web-development", "/es/servicios/desarrollo-web"],
  ["/projects", "/works"],
]) {
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 308, `${path}: permanent redirect`);
  assert.equal(new URL(response.headers.get("location"), base).pathname, destination, `${path}: redirect target`);
  console.log(`PASS redirect ${path} → ${destination}`);
}
