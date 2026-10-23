---
title: "GSAP ScrollTrigger con Next.js App Router: guía en español con ejemplos reales"
slug: gsap-scrolltrigger-nextjs
description: "Cómo uso GSAP ScrollTrigger, SplitText y Lenis en Next.js App Router: limpieza, useGSAP, pins, móviles y movimiento reducido, con código real."
date: 2026-10-22
updated: 2026-10-22
keywords:
  - gsap scrolltrigger next.js
  - animaciones gsap react
  - gsap next.js en español
  - useGSAP react
  - splittext gsap
  - lenis scrolltrigger
pillar: motion-frontend
alternateSlug: gsap-scrolltrigger-nextjs-app-router
---

Casi todo lo que se mueve en jesushernandez.site está hecho con GSAP 3.13, en un proyecto Next.js 15 con App Router, next-intl (inglés y español) y Lenis. Muchos tutoriales en español se saltan lo que más duele en producción: la limpieza entre rutas, los pins en móviles y el texto que tiene que existir antes de animarse. Esta guía no es un curso de GSAP: son los patrones con los que terminé, con código de los componentes reales del sitio.

## Lo más importante, en corto

- **Lo que usa GSAP es Client Component; la página que lo contiene sigue siendo Server Component.** El texto viaja en el HTML del servidor y GSAP solo aplica el estado inicial en el navegador, antes del primer pintado.
- **Todo depende de la limpieza.** Cada animación vive dentro de un `gsap.context()` (o de una instancia de `SplitText`) y se revierte cuando el componente se desmonta. [`useGSAP`](https://gsap.com/resources/React/) hace exactamente eso. Mis componentes lo hacen a mano con `useLayoutEffect`, y si empezara hoy usaría el hook.
- **Los plugins se registran una sola vez, en un solo módulo.** Una función `setupGsap()` registra ScrollTrigger, SplitText y los easings de la marca, y activa `ignoreMobileResize`.
- **Lenis y ScrollTrigger comparten el mismo reloj.** Lenis corre sobre `gsap.ticker` y cada scroll de Lenis llama a `ScrollTrigger.update`.
- **Las distancias se miden con funciones, no con números fijos.** Los pins usan `end: () => ...` con `invalidateOnRefresh: true`, y `refreshPriority` cuando se crean en otro orden que el de la página.
- **Con movimiento reducido no corre ni una línea de animación.** Los componentes salen antes de crear nada y el contenido simplemente está ahí.
- **Desde abril de 2025 todo esto es gratis**, SplitText incluido, también para uso comercial ([anuncio de Webflow](https://webflow.com/blog/gsap-becomes-free)).

[[DEMO: grabación corta del scroll de la home: el hero se aleja, el carrusel de proyectos se fija y avanza de lado, transición de pincel hacia la sección de la cita]]

## ¿Por qué GSAP necesita cuidados especiales en el App Router de Next.js?

El App Router cambia tres cosas que afectan directamente al código de animación.

La primera: los componentes son Server Components por defecto. GSAP necesita `window`, el DOM y medidas de layout, así que todo lo que lo llame debe llevar `"use client"`. Eso no obliga a que la página entera sea cliente. En este sitio, `app/[locale]/page.tsx` es un Server Component que importa secciones cliente como `HomePage`, `LatestsProjects` o `WSMAQuote`. Los componentes cliente igual se renderizan en el servidor, así que su texto queda en el HTML.

La segunda: los layouts persisten entre navegaciones y las páginas no. Lo que tiene que vivir durante toda la visita (Lenis, la capa de transición entre páginas) va en `app/[locale]/layout.tsx`. Lo que pertenece a una página (sus ScrollTriggers) se crea al montar y se destruye al desmontar. Si no, la página siguiente hereda triggers que apuntan a nodos que ya no existen.

La tercera: en desarrollo, el Strict Mode de React ejecuta los efectos dos veces. Si tu efecto crea un ScrollTrigger y no lo limpia, terminas con dos y los pins acumulan espacio.

## ¿Dónde se registran los plugins de GSAP en Next.js?

En un único módulo cliente, protegido para que corra una sola vez. Esta es una versión recortada de `src/lib/motion.ts`:

```tsx
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

let registered = false;

/** Registra plugins y easings de la marca una sola vez. Se puede llamar desde cualquier componente cliente. */
export function setupGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // La barra de direcciones del móvil cambia el alto del viewport al
  // aparecer y desaparecer: eso no debe recalcular todos los triggers.
  ScrollTrigger.config({ ignoreMobileResize: true });
  CustomEase.create("brand", "0.625, 0.05, 0, 1");
  registered = true;
  return gsap;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
```

Cada componente arranca su efecto con `const gsap = setupGsap()`: es idempotente y nunca corre en el servidor. La línea de `ignoreMobileResize` pesa más de lo que parece: en el celular, la barra de direcciones cambia el alto de la ventana cada vez que entra o sale, y sin esa opción ScrollTrigger recalcularía todos los triggers en cada cambio ([documentación de ScrollTrigger.config](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config())).

## ¿Cómo se limpian las animaciones de ScrollTrigger en React?

Creando todo dentro de un `gsap.context()` y llamando a `ctx.revert()` en la limpieza del efecto. Este es el hook que hace que el hero se aleje mientras bajas (`src/components/motion/useRecede.ts`):

```tsx
export function useRecede(
  section: RefObject<HTMLElement | null>,
  content: RefObject<HTMLElement | null>
) {
  useLayoutEffect(() => {
    const trigger = section.current;
    const target = content.current;
    if (!trigger || !target || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const ctx = gsap.context(() => {
      const tl = gsap
        .timeline({
          scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true },
        })
        .to(target, { scale: 0.86, yPercent: 16, opacity: 0, ease: "none", duration: 1 }, 0);

      // En pantallas táctiles no: desenfocar una sección entera en cada frame se traba.
      if (!isTouchScreen())
        tl.fromTo(target, { filter: "blur(0px)" }, { filter: "blur(10px)", ease: "power2.in", duration: 0.65 }, 0.35);
    }, trigger);

    return () => ctx.revert();
  }, [section, content]);
}
```

`ctx.revert()` mata el timeline y su ScrollTrigger, quita el espaciado de los pins y devuelve los estilos inline a como estaban antes de que GSAP los tocara. El segundo argumento (`trigger`) limita los selectores a ese elemento: un `".card"` dentro del contexto solo encuentra las tarjetas de esa sección ([documentación de gsap.context](https://gsap.com/docs/v3/GSAP/gsap.context())).

¿Por qué `useLayoutEffect` y no `useEffect`? Porque el estado inicial (`opacity: 0`, una línea escondida debajo de su máscara) tiene que aplicarse antes de que el navegador pinte. Con `useEffect` a veces ves un frame del estado final y después un salto al inicial. Ese parpadeo es la queja más típica de "GSAP en React se ve raro".

## ¿Qué hace useGSAP y conviene usarlo?

[`useGSAP`](https://gsap.com/resources/React/), del paquete `@gsap/react`, es el hook oficial para este mismo patrón. Según la documentación de GSAP, reemplaza a `useEffect`/`useLayoutEffect`, envuelve tu código en un `gsap.context()` y lo revierte solo al desmontar. En el navegador usa un layout effect y en el servidor cae a `useEffect`, así que te ahorras los chequeos de `typeof window`. Acepta un `scope` (igual que el segundo argumento del contexto), `dependencies` y `revertOnUpdate`, y te da `contextSafe()` para animaciones que se crean después, dentro de event handlers.

Mis componentes son anteriores a ese cambio y hacen el trabajo del contexto a mano. Este es el `SectionHeading` real (la entrada línea por línea de los títulos de `/about` y `/services`), recortado:

```tsx
"use client";

export default function SectionHeading({ children, as: Tag = "h2", className = "" }) {
  const rootRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const split = SplitText.create(root, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 130,
          duration: 0.9,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        }),
    });

    return () => split.revert();
  }, []);

  return <Tag ref={rootRef} className={className}>{children}</Tag>;
}
```

Y así queda con `useGSAP`, que es lo que pondría en un proyecto nuevo:

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export default function SectionHeading({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      SplitText.create(root.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 130,
            duration: 0.9,
            stagger: 0.1,
            ease: "power4.out",
            scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
          }),
      });
    },
    { scope: root }
  );

  return <h2 ref={root}>{children}</h2>;
}
```

La lógica es la misma. Lo que desaparece es la contabilidad: la función de limpieza, la variable `split` que tienes que acordarte de revertir y el chequeo de `window`. La idea clave es que `useGSAP` no tiene nada de magia. Es `gsap.context()` más el efecto correcto, y si lo entiendes así puedes leer cualquiera de las dos versiones sin perderte.

## ¿Cómo animar texto con SplitText sin perjudicar el SEO?

Deja el texto como hijo normal de un título o párrafo de verdad, y que SplitText lo divida solo en el navegador.

Fíjate en el `SectionHeading` de arriba. En el servidor se renderiza un `<h2>` común con el texto completo, sin nada escondido. La división en líneas, las máscaras y el `yPercent: 130` inicial pasan del lado del cliente, dentro del layout effect. Eso importa para dos públicos:

- **Quien navega con movimiento reducido o sin JavaScript** ve un título normal y legible.
- **Los crawlers que no ejecutan JavaScript.** Según [el análisis de Vercel sobre crawlers de IA](https://vercel.com/blog/the-rise-of-the-ai-crawler), ninguno de los grandes (GPTBot, ClaudeBot, PerplexityBot) ejecuta JavaScript; Googlebot sí. Si tu texto aparece recién cuando corre la animación, esos bots nunca lo leen.

Para comprobarlo en tu propio sitio: abre el código fuente con JavaScript desactivado y busca una frase del bloque animado.

Tres opciones de la reescritura de SplitText en la 3.13 hacen casi todo el trabajo ([documentación de SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)):

- `autoSplit: true` vuelve a dividir cuando terminan de cargar las fuentes o cambia el ancho del elemento. Así las líneas no quedan cortadas en lugares raros después de que entra la fuente web o se redimensiona la ventana.
- Si devuelves la animación desde `onSplit`, SplitText la revierte y la vuelve a crear en cada nueva división, y el ScrollTrigger no queda apuntando a líneas viejas.
- `mask: "lines"` envuelve cada línea en un elemento que recorta, sin que tengas que agregar markup para el efecto.

Hubo algo que tuve que resolver a mano, y en un sitio bilingüe es inevitable: las máscaras recortan al alto de la línea y, con interlineado ajustado, se comen los descendentes (g, y, p) y los acentos. En títulos en español, con sus á, é y ñ, se nota enseguida. El componente real agrega padding a las máscaras y lo compensa con márgenes negativos para que el layout no se mueva:

```tsx
onSplit: (self) => {
  const last = self.masks.length - 1;
  gsap.set(self.masks, {
    paddingTop: "0.1em",
    paddingBottom: "0.2em",
    marginTop: (i: number) => (i === 0 ? "-0.1em" : "0em"),
    // Los márgenes entre dos líneas colapsan: el de abajo carga con ambos.
    marginBottom: (i: number) => (i === last ? "-0.2em" : "-0.3em"),
  });
  return gsap.from(self.lines, { yPercent: 130, /* ... */ });
},
```

En los párrafos, `ScrubWords` usa `aria: "none"`. Por defecto SplitText le pone al elemento un `aria-label` con el texto completo, pero en un `<p>` ese atributo se ignora igual, y las palabras sueltas se leen bien por sí solas.

[[DEMO: comparación de un SectionHeading de /about en inglés y en español, mostrando que las máscaras no cortan los acentos]]

## ¿Cómo hacer que Lenis y ScrollTrigger funcionen juntos en Next.js?

Montando Lenis una sola vez en el layout del idioma, moviéndolo con el ticker de GSAP y avisándole a ScrollTrigger cada vez que Lenis hace scroll. Este es `SmoothScroll.tsx`, sin la parte de rutas que veremos después:

```tsx
"use client";

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const gsap = setupGsap();

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1, anchors: true });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // En pantallas táctiles el scroll es nativo (Lenis solo suaviza la rueda).
    // Ahí el scroll pasa al hilo de JS para que los pins sigan al dedo.
    const touch = isTouchScreen();
    if (touch) ScrollTrigger.normalizeScroll(true);

    return () => {
      if (touch) ScrollTrigger.normalizeScroll(false);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
```

Las decisiones que hay ahí adentro:

- **Un solo reloj.** Lenis corre sobre `gsap.ticker` y no en su propio `requestAnimationFrame`, así scroll y timelines con `scrub` se actualizan en el mismo frame. El ticker da segundos y Lenis espera milisegundos (`time * 1000`). `lagSmoothing(0)` evita que GSAP "se ponga al día" tras un frame lento y haga saltar el scroll.
- **Una instancia a nivel de módulo.** `setLenis`/`getLenis` en `lib/motion.ts` dejan que el navbar o la transición entre páginas lleguen a Lenis sin un context de React.
- **En táctil es otra historia.** Lenis solo suaviza la rueda, así que en celulares activo [`ScrollTrigger.normalizeScroll`](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()), que mueve el scroll al hilo de JavaScript. En mis pruebas con Safari en iOS, eso hizo que los pins dejaran de despegarse del dedo y que la barra de direcciones no cambiara el alto de la ventana en medio de un pin.
- **Con movimiento reducido, nada de Lenis.** El scroll nativo es el más accesible que hay.

## ¿Qué pasa con ScrollTrigger y Lenis al cambiar de ruta?

Apenas navegas entre páginas aparecen dos problemas.

El primero es la posición del scroll. Tanto el navegador como ScrollTrigger recuerdan dónde estabas, y una navegación del lado del cliente puede abrir la página nueva a mitad de camino, debajo de un pin que todavía no se midió. `SmoothScroll` reinicia todo cuando cambia la ruta:

```tsx
const pathname = usePathname();

useEffect(() => {
  history.scrollRestoration = "manual";
}, []);

useLayoutEffect(() => {
  if (location.hash) return; // un link a /#about conserva su destino
  setupGsap(); // ScrollTrigger tiene que estar registrado antes de borrar su memoria
  ScrollTrigger.clearScrollMemory("manual");
  window.scrollTo(0, 0);
  getLenis()?.scrollTo(0, { immediate: true, force: true });
}, [pathname]);
```

El segundo es la transición en sí. `PageTransition` intercepta los clics en links internos, llama a `getLenis()?.stop()`, pinta un pincel sobre la pantalla y ejecuta `router.push(url, { scroll: false })`. Cuando el nuevo `pathname` termina de renderizarse debajo, sube al inicio, llama a `lenis.start()` y levanta el pincel. Durante ese intervalo los componentes de la página anterior se desmontan, y como cada uno revierte su contexto, la página nueva arranca solo con sus propios triggers. Además hay un timeout de seguridad: si la navegación falla, la pantalla no queda tapada.

La entrada de la home se crea en `paused` y arranca cuando la intro avisa que terminó, con un respaldo de 6 segundos por si la señal se pierde.

[[DEMO: grabación de una transición de / a /works: el pincel cubre, cambia la ruta y se revela la página nueva desde arriba]]

## ¿Cómo fijar secciones con pin que se midan bien en cualquier pantalla?

Usa funciones para todo lo que dependa del layout y deja que ScrollTrigger las vuelva a llamar en cada refresh. El carrusel de proyectos de la home es una sección fijada que avanza de lado (`LatestsProjects.tsx`):

```tsx
useLayoutEffect(() => {
  const viewport = viewportRef.current;
  const track = trackRef.current;
  if (!scrollDriven || !viewport || !track) return;

  // Independiente del transform: se mide con offsets, no con bounding rects.
  const distance = () => {
    const first = track.firstElementChild as HTMLElement;
    const last = track.lastElementChild as HTMLElement;
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const end = last.offsetLeft - first.offsetLeft + last.offsetWidth + pad * 2;
    return Math.max(0, end - viewport.clientWidth);
  };

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: viewport,
        start: "center center",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: true,
        // Se crea después que los triggers de secciones posteriores;
        // se mide primero para que sus posiciones incluyan este pin.
        refreshPriority: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.to(track, { x: () => -distance(), ease: "none" }, 0);
  }, viewport);

  return () => ctx.revert();
}, [scrollDriven, trackOffset]);
```

Qué evita cada parte:

- **`end: () => ...` y `x: () => -distance()`** se recalculan en cada refresh. Un número fijo deja de servir apenas cambia la ventana, la fuente o el contenido.
- **`invalidateOnRefresh: true`** hace que el tween descarte los valores que tenía guardados, así la `x` basada en una función se vuelve a leer de verdad.
- **Medir con `offsetLeft` y no con `getBoundingClientRect()`**, porque la pista ya se está moviendo con la animación y los bounding rects incluyen ese transform.
- **`refreshPriority`** es el que casi todos pasan por alto. ScrollTrigger calcula las posiciones en el orden en que se crearon los triggers, y en React un componente hijo puede crear los suyos en otro orden que el que tiene en la página. La sección de la cita, más abajo, usa `refreshPriority: 2` y el carrusel usa `1`, así los pins se miden de arriba hacia abajo y cada uno incluye el espacio de los anteriores ([documentación de ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)).

Refrescar también cuesta. El footer ajusta un nombre grande al ancho de su contenedor, lo que cambia el alto de la página, y solo llama a `ScrollTrigger.refresh()` si el tamaño de fuente cambió de verdad: refrescar todos los triggers es de lo más caro de la carga. [[TODO: métrica — tiempo de main thread de ScrollTrigger.refresh() en la home, medido con un trace de Performance]]

En el celular, las distancias basadas en `window.innerHeight` saltan con la barra de direcciones. Por eso los pins usan `largeViewportHeight()` (en `lib/motion.ts`), que mide `100lvh` y solo vuelve a medir cuando cambia el ancho.

## ¿Cómo respetar prefers-reduced-motion con GSAP?

Revisándolo primero y saliendo antes de crear nada. Todos los efectos del sitio empiezan así:

```tsx
if (!root || prefersReducedMotion()) return;
```

No se esconde, divide ni fija nada, así que lo que queda es el HTML que vino del servidor. Del lado del CSS, `scroll-behavior: smooth` solo se aplica dentro de `@media (prefers-reduced-motion: no-preference)`.

Cuando la condición puede cambiar en el tiempo o combina varias media queries, uso [`gsap.matchMedia()`](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()), que revierte todo lo que se creó adentro cuando la query deja de cumplirse. El efecto de puntero del muro de proyectos en `/works` solo corre con un mouse real y con movimiento permitido:

```tsx
const mm = gsap.matchMedia();
mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
  const rows = gsap.utils.toArray<HTMLElement>("[data-wall-shift]", root);
  const moveRow = rows.map((el) => gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }));
  // ...listeners del puntero, que se quitan en la limpieza que devuelve esta función
});
return () => mm.revert();
```

El efecto de telón del footer usa `gsap.matchMedia().add("(min-width: 768px)", ...)` de la misma forma, así en celulares el footer queda más simple, sin el contra-scroll.

## ¿Cuáles son los errores más comunes con GSAP en Next.js?

| Error | Qué ves | Cómo lo resolví en este sitio |
|---|---|---|
| Llamar a GSAP en un Server Component o en el nivel superior del módulo | `window is not defined` al hacer el build | `"use client"` en el componente animado; registrar plugins dentro de un `setupGsap()` protegido |
| Crear ScrollTriggers en `useEffect` sin limpiarlos | Triggers duplicados en desarrollo (Strict Mode), pins con espacio acumulado, triggers que se disparan en la página siguiente | `gsap.context()` + `ctx.revert()`, o `useGSAP` |
| Aplicar el estado inicial en `useEffect` | Un frame del estado final antes de que empiece la animación | `useLayoutEffect` (o `useGSAP`, que usa layout effect en el navegador) |
| Mostrar el texto recién cuando corre la animación | Texto ausente para crawlers sin JS y para quien usa movimiento reducido | Texto como hijo normal en el HTML del servidor; SplitText lo divide en el cliente |
| Dejar que Lenis use su propio loop de rAF | Los timelines con `scrub` van un frame atrás del scroll | `gsap.ticker.add(t => lenis.raf(t * 1000))`, `lenis.on("scroll", ScrollTrigger.update)`, `lagSmoothing(0)` |
| Distancias de pin con números fijos | Pins que terminan antes o después de tiempo tras un resize o un cambio de fuente | `end: () => ...` + `invalidateOnRefresh: true` |
| Pins creados en otro orden que el de la página | Las secciones debajo de un pin arrancan en la posición equivocada | `refreshPriority` para medir de arriba hacia abajo |
| Dejar que la barra del móvil dispare refreshes | Saltos y recálculos en medio del scroll en iOS | `ScrollTrigger.config({ ignoreMobileResize: true })`, `normalizeScroll` en táctil, distancias en lvh |
| Animar `filter: blur()` en dispositivos táctiles | Scroll trabado en Safari de iOS | Omitir el blur cuando se cumple `(pointer: coarse)` |
| Ignorar la memoria de scroll al navegar | La página nueva abre a mitad de camino | `history.scrollRestoration = "manual"`, `ScrollTrigger.clearScrollMemory("manual")`, scroll a 0 al cambiar `pathname` |

## Preguntas frecuentes

### ¿Necesito useGSAP para usar GSAP con Next.js?

No. `useGSAP` es una comodidad: envuelve `gsap.context()` y elige el efecto correcto por ti. Todos los componentes de este sitio usan `useLayoutEffect` con un `ctx.revert()` manual, que es lo mismo hecho a mano. Para código nuevo usaría `useGSAP`, sobre todo por `contextSafe()` en los event handlers y por no tener que escribir la limpieza.

### ¿GSAP es gratis para proyectos comerciales?

Sí. Desde abril de 2025 todo GSAP es gratuito, incluidos SplitText, ScrollTrigger y los plugins que antes eran pagos, con uso comercial permitido ([Webflow](https://webflow.com/blog/gsap-becomes-free)). Este sitio usa SplitText, DrawSVG, ScrambleText y CustomEase desde el paquete `gsap` normal de npm.

### ¿Las animaciones con GSAP afectan el SEO en Next.js?

No, si el texto está en el HTML del servidor. GSAP no renderiza contenido. El riesgo viene de patrones como cargar la sección animada con `ssr: false` o insertar el texto desde JavaScript. Deja el contenido como hijos renderizados en el servidor y que GSAP solo cambie estilos en el navegador.

### ¿Conviene usar Lenis con ScrollTrigger?

No es obligatorio: ScrollTrigger funciona perfecto con scroll nativo. Yo lo uso por cómo se siente la rueda en escritorio y lo apago con movimiento reducido. Si lo agregas, sincronízalo con `gsap.ticker` y `ScrollTrigger.update`.

### ¿Por qué se rompen las posiciones de ScrollTrigger al cambiar de página?

Casi siempre es una de tres cosas: los triggers de la página anterior no se revirtieron, el scroll se restauró antes de medir los pins de la página nueva, o los pins se crearon desordenados. Revierte al desmontar, reinicia la memoria de scroll cuando cambia el `pathname` y usa `refreshPriority` en los pins.

---

Si estás armando algo con este tipo de movimiento y quieres otra mirada sobre la arquitectura del scroll, en la [página de servicios](/es/services) cuento cómo trabajo. El carrusel fijado y la transición hacia la cita que describo aquí están funcionando en la [home](/es).
