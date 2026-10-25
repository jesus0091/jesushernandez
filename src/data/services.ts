/**
 * The services, in the order they're listed. Each id is the English URL
 * (/services/<id>), the key of its copy in messages (services.items.<id>) and
 * the name of its sketch. Spanish URLs live in src/i18n/slugs.ts.
 */
export const SERVICES = [
  "product-design",
  "web-development",
  "ai-features",
  "ai-prototype-to-production",
] as const;

export type ServiceId = (typeof SERVICES)[number];

export const isServiceId = (id: string): id is ServiceId => (SERVICES as readonly string[]).includes(id);
