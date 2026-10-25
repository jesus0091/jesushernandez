# Portfolio de Jesús Hernández

Portfolio personal de Product Engineering, diseño de producto y desarrollo front-end. Incluye proyectos, casos de estudio, servicios y un blog en inglés y español.

## Desarrollo

Usar Node.js 22.12+ de la rama 22, o Node.js 24 LTS, y npm. Vitest 5 requiere estas versiones aunque Next.js admita versiones anteriores.

```bash
npm ci
npm run dev
```

El servidor de desarrollo está disponible en http://localhost:3000.

```bash
npm run lint        # ESLint
npm run type-check  # TypeScript
npm test           # Vitest
npm test -- --watch
npm run build      # Compilación de producción
npm start          # Servir el build
npm run test:routes # Comprobar URLs y redirects con el servidor iniciado
```

## Tecnologías y estructura

- Next.js 15, App Router y React 19.
- TypeScript estricto y Tailwind CSS 4.
- GSAP para animaciones y Lenis para scroll.
- next-intl para traducciones y navegación.
- Markdown con gray-matter, marked y sugar-high para el blog.
- Phosphor Icons y Embla Carousel.
- Vitest para pruebas de contenido, traducciones, URLs y SEO.

```text
content/blog/{en,es}/  Artículos Markdown por idioma
messages/{en,es}.json  Traducciones
public/               Imágenes y vídeos
src/app/[locale]/     Home, about, services, works, blog y lab
src/components/       Componentes y animaciones
src/data/             Proyectos, casos de estudio y servicios
src/i18n/             Navegación, slugs, registro de páginas y SEO
src/lib/              Blog, contacto, sonido y utilidades de animación
```

## Idiomas y contenido

El inglés se sirve en `/`; el español, en `/es`. El idioma se elige explícitamente, sin redirección según el navegador. Las URLs traducidas se declaran en `src/i18n/slugs.ts` y sus redirects y rewrites se configuran en `next.config.ts`.

`src/i18n/pages.ts` centraliza los idiomas disponibles, la indexación y las fechas de actualización. De allí se derivan canonical, hreflang y sitemap. Al agregar una página o traducción, actualizar ese registro y los mensajes correspondientes.

Los artículos viven en `content/blog/<idioma>/*.md`. Revisar un artículo existente como referencia para sus metadatos. Las traducciones comparten la clave del slug inglés mediante `alternateSlug`. Los artículos con `draft: true` se excluyen en producción. El Markdown admite HTML y debe provenir de autores de confianza; antes de aceptar contenido externo hay que incorporar sanitización.

## Configuración

El sitio funciona sin variables de entorno. Para habilitar Google Analytics 4, definir en `.env.local` o en el entorno del despliegue:

```dotenv
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Las variables `NEXT_PUBLIC_*` son públicas y se incorporan durante el build. No guardar secretos en ellas.

- Estilos y tokens: `src/app/globals.css`.
- Fuentes y layout por idioma: `src/app/[locale]/layout.tsx`.
- Dominio y utilidades SEO: `src/i18n/seo.ts`.
- Correo de contacto: `src/lib/contact.ts`.

## Verificación y despliegue

Antes de publicar, ejecutar lint, tipos, tests y build. Las páginas se pregeneran; middleware, redirects, rewrites y headers requieren un hosting compatible con Next.js. No es un export HTML estático.

El proyecto incorpora enlace para saltar al contenido, controles de sonido y movimiento, y tratamiento de `prefers-reduced-motion`. Estas medidas no sustituyen una auditoría de accesibilidad. Verificar también navegación por teclado, móvil, cambio de idioma, enlaces con anclas y páginas 404 en un navegador.

`test:routes` comprueba estados HTTP, idioma del documento, enlaces de accesibilidad, headers y redirects. Usa `BASE_URL=http://localhost:3100 npm run test:routes` para otro puerto. Requiere un servidor local ya iniciado; no ejecuta interacciones de navegador.

Los logos de Skills se sirven desde un sprite SVG. Después de editar `src/components/AboutMe/skillLogoPaths.ts`, ejecutar `node scripts/generate-skill-logos.mjs` y versionar el SVG y los nombres generados. Los efectos de texto y el túnel se preparan al acercarse a la pantalla; el contenido y la altura de las secciones siguen presentes desde el servidor.

Las mediciones y las próximas prioridades están en [el informe de performance del 25 de octubre](reports/Performance%202026-10-25.md).

El build informa el JavaScript inicial por ruta. Para evaluar la experiencia real, medir además carga y scroll en dispositivos móviles; el tamaño del bundle por sí solo no determina el rendimiento.

## Autor y licencia

Jesús Hernández · [Portfolio](https://jesushernandez.site) · [GitHub](https://github.com/jesus0091)

Código privado, propiedad de Jesús Hernández.
