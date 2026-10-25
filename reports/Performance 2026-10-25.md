# Rendimiento del portfolio · 25 de octubre de 2026

La versión publicada dio **76 en móvil** en una ejecución. En el build local anterior a esta optimización la mediana fue **81**; después de los cambios, **83**. Son entornos distintos: el 76 publicado no debe compararse directamente con el 83 local como una ganancia de siete puntos.

## Comparación del mismo entorno

Home inglesa, build de producción, misma máquina y Chrome, tres ejecuciones independientes por versión. Lighthouse 12.6.0, Chrome 156 headless, emulación móvil, red simulada de 1.638,4 kbit/s y RTT de 150 ms, CPU ×4. Sin modificar preferencias de movimiento ni detectar Lighthouse en el código.

| Métrica móvil (mediana) | Antes | Después |
| --- | --- | --- |
| Performance | 81 | 83 |
| First Contentful Paint | 1.36 s | 1.21 s |
| Largest Contentful Paint | 4.22 s | 4.11 s |
| Total Blocking Time | 226 ms | 211 ms |
| Speed Index | 1.85 s | 1.79 s |
| CLS | 0 | 0 |
| Trabajo del hilo principal | 2607 ms | 2434 ms |
| Transferencia total durante la prueba | 763 KiB | 708 KiB |

Puntajes individuales: antes **79, 82, 81**; después **85, 82, 83**. Los rangos se solapan: la mejora del puntaje es moderada y no garantiza 90 en PageSpeed Insights. Escritorio pasó de **99 a 99**, una ejecución por versión, con CPU ×1, red de 10.240 kbit/s y RTT de 40 ms.

## Cambios que quedan aplicados

| Antes | Después | Motivo |
| --- | --- | --- |
| 258 kB de JavaScript inicial en la home | 240 kB según Next.js | El código del shader se descarga cerca del CTA; los trazados de los logos salen del bundle. |
| 168 imágenes en el mosaico del hero | 84 | Un solo conjunto de cada pool basta para repetir el patrón. Se ajustó la duración para conservar la velocidad visual. |
| Logos SVG repetidos como trazados inline | Sprite SVG compartido y cacheable | Reduce HTML y JavaScript; conserva los mismos vectores. |
| Inter con eje óptico adicional, 73.016 bytes | Inter sin ese eje, 48.432 bytes | Mantiene la familia y los pesos; elimina 24.584 bytes. La forma óptica de los títulos puede variar ligeramente. |
| Skills, encabezados, párrafos y WebGL se preparaban al hidratar | Se preparan al acercarse a la pantalla | Evita montar efectos que todavía no pueden verse. El contenido y la geometría siguen en el HTML. |
| La imagen identificada como LCP competía con las demás | Preload responsive y prioridad alta solo para Banner-10 | Adelanta el recurso que las ejecuciones identificaron como principal. |

La intro conserva su duración y aspecto anteriores. Se probaron una intro más corta y carga lazy del mosaico animado, pero no mejoraron de forma consistente el resultado; se descartaron. La imagen LCP puede cambiar según el viewport: la prioridad actual se basa en las mediciones móviles descritas.

## Qué sigue limitando el puntaje

El LCP permanece en torno a **4,1 s**. Este es el problema principal pendiente; el objetivo recomendado por Google es **2,5 s o menos**. [Guía para optimizar LCP](https://web.dev/articles/optimize-lcp/).

Para conseguir un salto mayor, las siguientes pruebas deberían enfocarse en:

1. **El mosaico del hero:** comparar las catorce fuentes independientes con un atlas optimizado que mantenga el patrón y el movimiento. Requiere validar calidad y composición en móvil y escritorio.
2. **Las animaciones globales:** separar también la preparación del footer y los timelines fijados de WSMA y Projects. Los pins agregan espacio al documento; diferirlos exige reservar y recalcular esa geometría para evitar saltos.
3. **El código de la primera pantalla:** GSAP y sus plugins siguen presentes en la carga inicial por la intro, el scroll y otros componentes compartidos. Reducir ese bloque requiere separar su carga de las interacciones y de las secciones inferiores.
4. **Validación publicada:** ejecutar PageSpeed Insights sobre la misma URL y dispositivo después de desplegar. Las condiciones locales no incluyen el mismo servidor, red y ubicación del visitante.

La ponderación del puntaje explica por qué bajar bytes o JavaScript no garantiza un salto proporcional si el LCP sigue alto. [Cómo puntúa Lighthouse](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).

## Reproducción

Con un build de producción iniciado en localhost:3000:

```bash
npx --yes lighthouse@12.6.0 http://localhost:3000/ --only-categories=performance --output=json --output=html --output-path=/tmp/portfolio-performance --chrome-flags="--headless"
```

Repetir tres veces sin compilar ni ejecutar otras pruebas a la vez. Comparar medianas y conservar las condiciones de CPU, red y navegador. Para el perfil de escritorio estándar, agregar `--preset=desktop`.

Los resultados resumidos por ejecución y las condiciones exactas están en [performance-2026-10-25.json](./performance-2026-10-25.json). Los informes completos de esta sesión se guardaron temporalmente en `/tmp/portfolio-before-*.json`, `/tmp/portfolio-measured-*.json` y `/tmp/portfolio-live-1.json`.

## Verificación

- Build de producción: correcto, sin avisos de compilación.
- TypeScript, ESLint y 31 tests de Vitest: correctos.
- 16 comprobaciones HTTP: correctas.
- Chrome: navegación, idioma, anclas, teclado, movimiento reducido y scroll completo en móvil y escritorio; comprobación de que WebGL se inicializa cerca del CTA y de que el sprite muestra los logos.

Los cambios están en el workspace; no se publicaron.
