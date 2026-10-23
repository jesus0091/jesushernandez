---
title: "¿Sirve el vibe coding para producción? Lo que aprendí con Ristario"
slug: vibe-coding-en-produccion
description: "El vibe coding sirve para producción si las decisiones no las toma la IA. Qué hizo bien, qué reescribí y qué aprendí llevando Ristario a producción."
date: 2026-10-22
updated: 2026-10-22
keywords:
  - vibe coding en producción
  - límites del vibe coding
  - vibe coding
  - app hecha con IA a producción
  - programar con IA
  - next.js
pillar: ai-to-production
relatedWork: ristario
alternateSlug: is-vibe-coding-bad
---

# ¿Sirve el vibe coding para producción? Lo que aprendí con Ristario

**Respuesta corta: sí, pero solo si las decisiones no las toma la IA.** El vibe coding acelera mucho el trabajo cuando ya está claro qué hay que construir. Cuando se usa para reemplazar esas decisiones, el problema no aparece en la demo: aparece en producción. Lo que define si un producto aguanta no suele ser el código, sino lo que se decidió antes: qué páginas existen, quién las lee, en qué dispositivo, cómo son los datos y qué significa "terminado".

Lo aprendí llevando a producción [Ristario](/es/works/ristario), un menú QR gratis para restaurantes en Venezuela. Allá los precios cambian todos los días y en dos monedas, así que el producto muestra los precios en bolívares y en dólares a tasa BCV, recibe pedidos por WhatsApp y permite editar todo desde el celular. Diseñé la marca, el sistema de UI y todos los recursos visuales, después lo desarrollé en Next.js y lo lancé. Una sola persona, sin traspasos, y sin dedicación completa: lo construí en los ratos que tenía libres.

Primero los datos, después la opinión:

| Qué | Dato |
|---|---|
| Páginas en producción | 41, todas generadas de antemano con un mismo set de componentes |
| Páginas por ciudad | 18, de Caracas y Maracaibo a Mérida y Los Teques |
| Páginas por tipo de negocio | 12 (areperas, panaderías, food trucks, pizzerías, cafés y más) |
| Lighthouse en la home en vivo (octubre de 2026) | 95 en rendimiento, 100 en SEO |
| Herramientas de IA, en orden | Cursor, después ChatGPT, después Claude |
| Dónde más falló la IA | El diseño de la UI y la capa de datos |

## ¿Qué es exactamente el vibe coding?

Uso el término como lo usa casi todo el mundo hoy: describes en lenguaje natural lo que quieres, un modelo de IA escribe el código y juzgas el resultado sobre todo ejecutándolo y mirándolo, no leyendo cada línea. Para prototipar está muy bien. En poco tiempo sabes si una idea funciona en pantalla.

El problema empieza cuando ese mismo ciclo se usa para lo que no se puede juzgar mirando la pantalla: una página que Google no puede indexar, un layout que salta mientras carga, una base de datos a la que le crece en silencio una segunda tabla para lo mismo. Nada de eso aparece en una demo. Todo eso aparece en producción.

Por eso, cuando me preguntan si el vibe coding sirve para producción, escucho otra pregunta: *¿es seguro dejar que la IA tome las decisiones?* Para producción, mi respuesta es no.

## ¿Cuáles son los límites del vibe coding?

El límite no está en el código, está en quién decide. La desconfianza existe: en la encuesta de Stack Overflow de 2025, **el 46% de los developers dijo desconfiar de la precisión de las herramientas de IA, frente a un 33% que confía** ([Stack Overflow 2025](https://survey.stackoverflow.co/2025/ai)). Me parece una desconfianza sana, pero apunta al lugar equivocado. Importa menos si una función está bien escrita que si alguien decidió para qué sirve esa función.

En Ristario, las decisiones que hicieron funcionar el producto no fueron decisiones de código:

- **Una página para cada búsqueda.** El dueño de un restaurante busca un menú QR en su ciudad o para su tipo de negocio. Por eso el sitio tiene una página por ciudad y una por tipo de negocio, cada una escrita para esa búsqueda y generada a partir de datos, no copiada a mano.
- **Primero el celular.** El menú se lee en el celular, en la mesa, y el dueño también lo edita desde el celular. Cada pantalla se diseñó desde el celular hacia afuera, y en tablet y escritorio el contenido se reordena en lugar de achicarse.
- **Dos monedas, una tasa.** Mostrar precios en bolívares y dólares a tasa BCV es la razón de ser del producto. Es una regla de negocio, no algo que un modelo pueda adivinar.
- **Un solo naranja.** Papel cálido, tinta y un único naranja que marca cada acción. Un sistema de diseño con pocas opciones es más fácil de mantener coherente, lo escriba quien lo escriba.

Un modelo de IA puede escribir rápido el código de 41 páginas. Lo que no puede decirte es que necesitas 41 páginas y no 4, ni por qué tiene que existir cada una. Eso es trabajo de producto, y es la parte que nunca delegaría.

## ¿Qué herramientas de IA usé y sirvió cambiar?

Empecé con Cursor, pasé a ChatGPT y terminé con Claude. Ninguna fue "la correcta" por sí sola; cada una me sirvió para el problema que tenía en ese momento.

Lo que me enseñó cambiar de herramienta es que **el contexto es tuyo, no de la herramienta.** Cada vez que cambiaba, la nueva no sabía nada de las decisiones dentro de las que trabajaba la anterior: el sistema de diseño, los nombres, cómo estaban armados los datos. Si esas decisiones solo viven en conversaciones viejas, cada sesión nueva empieza adivinándolas otra vez. Cuanto más del plan tenía escrito, menos importaba qué modelo lo leía.

## ¿Dónde falló la IA en Ristario?

En dos lugares, y son los dos sobre los que advertiría a cualquiera.

### La UI: genérica y fácil de reconocer

La UI generada por IA sigue pareciendo generada por IA. Recurre a las mismas tarjetas redondeadas, los mismos degradados, los mismos espaciados y los mismos layouts seguros, y cualquiera que haya visto algunos de estos productos se da cuenta de dónde salió la pantalla. Para un producto que promete "esto se ve como *tu* restaurante, no como una plantilla", eso es un problema serio.

Por eso la UI es lo que más reescribí. Diseñé la marca y el sistema de UI en Figma antes de programar (una sola familia tipográfica, Inter, de Regular a ExtraBold; un color de acento; pocas superficies) y lo usé como referencia contra la que tenía que coincidir cada componente. La IA me sirvió para armar un componente cuando yo ya sabía exactamente cómo tenía que verse. No me sirvió para decidir cómo tenía que verse.

### Los datos: tablas y consultas que ya existían

La segunda falla fue más silenciosa y más peligrosa. Cuando le pedía una funcionalidad nueva que tocaba la base de datos, muchas veces la IA no sabía, o no revisaba, lo que ya había. Creaba una tabla que duplicaba otra que yo ya tenía, o escribía una consulta nueva para datos que una consulta existente ya devolvía.

En una demo eso no se ve: la funcionalidad anda. En producción significa dos fuentes de verdad para lo mismo, datos que se desfasan entre sí y un esquema cada semana más difícil de cambiar. Terminé tratando cada cambio en la base de datos como algo para revisar línea por línea, nunca como algo para aceptar porque la pantalla se veía bien.

| Área | Qué hizo bien la IA | Qué tuve que reescribir o decidir yo |
|---|---|---|
| UI | Convertir en código un componente ya diseñado | El diseño en sí. Reemplacé los layouts genéricos de la IA por el sistema de Figma: una tipografía, un naranja, pocas superficies |
| Capa de datos | Escribir consultas y código repetitivo rápido | Tablas duplicadas y consultas repetidas. Cada cambio de esquema había que compararlo con lo que ya existía |
| Estructura del sitio | Completar páginas una vez que el patrón existía | La estrategia: una página por ciudad y por tipo de negocio, generadas desde datos |
| Reglas de negocio | Implementar una regla una vez explicada | Las reglas en sí, como las dos monedas a tasa BCV |

El patrón: **la IA fue fuerte donde la respuesta ya estaba decidida, y débil donde tenía que decidir.** El diseño y la estructura de datos son decisiones, y ahí es donde falló.

## ¿Por qué lo que la IA no hace es lo que más pesa?

Porque en producción el costo de una mala decisión se acumula. Una función mal escrita te cuesta una tarde. Una estructura mal pensada te cuesta cada página, y cada fila, que construyes encima.

Piensa en la estructura de Ristario. La estrategia de búsqueda se apoya en 18 páginas de ciudades y 12 de tipos de negocio. Si fueran 30 archivos sueltos, cada cambio de layout serían 30 ediciones, y tarde o temprano alguna quedaría desfasada. Generarlas con un mismo set de componentes y una lista de ciudades y negocios hace que una corrección llegue a todas a la vez. Esa es una decisión sobre los datos, y se toma antes de escribir código. Una vez tomada, la IA es buena completándola. Las tablas duplicadas son la misma lección vista del otro lado: cuando nadie es dueño de la forma de los datos, la IA inventa una nueva cada vez.

Mi regla: **que la IA escriba el código, no el plan.** Cuanto más concreto es el plan, mejor sale el código generado, y más fácil es detectar cuándo está mal.

## ¿Qué se rompe cuando una app hecha con IA llega a producción?

En Ristario, los huecos casi nunca estuvieron en lo que muestra una demo. Estuvieron en lo que nadie mira en una demo. Antes del lanzamiento, cada página pasó por los mismos controles:

- **Celular, tablet y escritorio.** Todas las páginas, no solo la home.
- **Contraste y tamaños de lectura.** El menú se lee en una mesa, muchas veces con mala luz.
- **Rendimiento y layout shift.** Nadie espera en la mesa a que cargue una página lenta, y Google favorece a los sitios que abren rápido.
- **Los datos.** Sin tablas duplicadas ni una segunda consulta para datos que ya tienen una.
- **SEO.** Un `sitemap.xml` generado con las 41 páginas y referenciado desde `robots.txt`; JSON-LD para la organización, el sitio y la app; tarjetas de Open Graph y Twitter con imagen generada y el idioma en `es-VE`.
- **Analítica desde el primer día,** para que el lanzamiento sea el comienzo de la medición y no el final del proyecto.

Ninguno de estos puntos es difícil. Simplemente no se ven desde una ventana de chat.

Si tienes una app hecha con Lovable, v0, Bolt o Cursor que funciona en la demo pero todavía no en producción, esa lista es por donde yo empezaría. También es buena parte de lo que hago cuando [me hago cargo de una app hecha con IA](/es/services).

## ¿Qué haría distinto?

**Escribir el sistema de diseño antes del primer prompt.** Seguiría diseñando primero en Figma, pero además pondría las reglas (tipografía, color, espaciados, qué componentes existen) en un archivo que la IA lea al empezar cada sesión. La UI genérica es lo que sale cuando el modelo no tiene nada concreto con qué coincidir.

**Darle a la IA el esquema de la base de datos y revisar cada cambio.** La mayoría de las tablas duplicadas salieron de que el modelo no veía lo que ya existía. Ponerle delante el esquema actual, y leer cada migración antes de aceptarla, las habría frenado antes.

**Guardar el contexto del proyecto fuera de la herramienta.** Pasar de Cursor a ChatGPT y después a Claude me obligó a explicar el proyecto de nuevo cada vez. Un resumen corto, por escrito, de las decisiones ya tomadas habría hecho cada cambio mucho más barato.

## Entonces, ¿conviene usar vibe coding en tu próximo producto?

Para un prototipo, sí. Es la forma más rápida que conozco de saber si una idea funciona en pantalla. Para producción, usa la IA para escribir código dentro de decisiones que alguien ya tomó: la estructura, el sistema de diseño, el modelo de datos, los controles. Y que esas decisiones queden en manos de una persona que responda por el resultado.

Así trabajo hoy. El caso completo de Ristario, con la marca, las pantallas y el stack, está [aquí](/es/works/ristario).

## Preguntas frecuentes

### ¿Sirve el vibe coding para producción?

Sí, si una persona toma las decisiones de producto (estructura, sistema de diseño, modelo de datos, controles de calidad) y la IA escribe el código dentro de ese marco. Si la IA decide qué construir, los problemas aparecen recién en producción.

### ¿Cuáles son los límites del vibe coding?

Lo que no se ve en pantalla: el diseño propio frente al genérico, la estructura de la base de datos, metadatos y SEO, rendimiento y layout shift, casos borde del responsive y, en apps con usuarios, la autenticación. La IA rara vez falla en lo que muestra la demo; falla en lo que la demo no muestra.

### ¿Qué hace mal más seguido el código generado por IA?

En mi experiencia, dos cosas. La UI sale genérica y se nota que la hizo una IA, y la capa de datos se desordena: la IA crea tablas que ya existen o repite consultas que ya escribió. Las dos pasan porque la IA está decidiendo algo que nadie decidió por ella.

### ¿El código escrito con IA es más lento?

No tiene por qué. La home en vivo de Ristario tiene 95 en rendimiento y 100 en SEO en Lighthouse. La velocidad depende más de las decisiones detrás del código (páginas estáticas, manejo de imágenes, evitar layout shift) que de quién lo escribió.

### ¿Qué herramienta de IA es mejor para hacer vibe coding?

Usé Cursor, ChatGPT y Claude en el mismo proyecto, y la herramienta importó menos que el contexto que le daba. Un sistema de diseño escrito y un esquema de base de datos actualizado mejoran el resultado de cualquiera de las tres.
