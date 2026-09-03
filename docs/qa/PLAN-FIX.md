# Plan de corrección priorizado

Derivado de `docs/qa/AUDITORIA-6-SPRINTS.md`. **Nada de esto está implementado todavía** — es la lista priorizada para ejecutar después. Prioriza cambios quirúrgicos sobre reescrituras; ningún componente necesita regenerarse completo.

Leyenda de prioridad: **P0** bloqueante (impide usar una funcionalidad fundamental) · **P1** importante (bug funcional o requisito de sprint incumplido) · **P2** UX/UI/responsive · **P3** polish.

---

## P0 — Bloqueantes

### P0-1 — Header: CTA "Quiero participar" invisible/inaccesible en 1280-1536px + "LA EXPO" partido en dos líneas

- **Problema:** BUG-001 + BUG-002 de la auditoría. El nav de 11 ítems no entra en el ancho disponible del header en el rango de laptop más común (1280-1536px); el motor de flexbox resuelve el déficit de dos formas silenciosas: partiendo "LA EXPO" en dos líneas (siempre, en cualquier ancho ≥1280px) y, cuando eso no alcanza, empujando el botón CTA + el toggle de menú fuera del viewport (1280-~1536px). El CTA principal del sitio queda inutilizable justo en las resoluciones más comunes.
- **Archivos afectados:** `src/components/navigation/Header.astro` (causa directa), `src/components/layout/Container.astro` (contribuye: `max-w-[96rem]` limita el ancho disponible).
- **Solución propuesta (elegir una, de menor a mayor esfuerzo):**
  1. **Más quirúrgica:** agregar `whitespace-nowrap` a los `<a>` del nav (evita que "LA EXPO" se parta) + reducir `gap-8` a algo como `gap-5`/`gap-6` en el rango `xl` (antes de `2xl`) + achicar levemente `text-[0.68rem]`→`text-[0.62rem]` y el `tracking` en ese mismo rango. Esto libera espacio sin tocar la lista de ítems ni el breakpoint de activación.
  2. **Si (1) no alcanza en 1280-1366px:** subir el breakpoint en el que el nav desktop reemplaza al hamburger, de `xl` (1280px) a un breakpoint custom (ej. `1600px` vía `min-[1600px]:block` / `min-[1600px]:hidden`), de forma que laptops de 1280-1536px sigan usando el menú mobile (que ya funciona perfectamente) en vez de un nav desktop que no entra.
  3. **Más robusta a futuro (si el nav vuelve a crecer):** agrupar los ítems menos frecuentes (EXPOSITOR, EXPOSITORES, NOTICIAS, PREGUNTAS) bajo un ítem "Más" con dropdown, dejando 6-7 ítems primarios siempre visibles. Mayor esfuerzo, no es necesario si (1)+(2) resuelven el ancho.
- **Dependencia:** ninguna — independiente de cualquier otra tarea.
- **Riesgo:** bajo. Es CSS/breakpoints puros, sin lógica nueva. Verificar que el toggle mobile siga aaccesible por teclado si se cambia el breakpoint (opción 2).
- **Criterio de aceptación:** en 1280px, 1366px, 1440px, 1536px y 1920px, `"Quiero participar"` visible y clicable al 100% (`getBoundingClientRect().right <= innerWidth`), y "LA EXPO" renderiza en una sola línea con la misma altura que el resto de los ítems del nav. Repetir la medición automatizada usada en esta auditoría (`getBoundingClientRect` sobre el grupo derecho del header) como regresión.

---

## P1 — Importantes (requisitos de sprint incumplidos / bugs funcionales)

### P1-1 — Emprendimientos: párrafo placeholder visible (Sprint 2.5)

- **Problema:** BUG-003. El texto `[Párrafo pendiente — ilegible en la referencia]` sigue en producción pese a que el Sprint 2 lo listaba explícitamente como tarea.
- **Archivos afectados:** `src/components/sections/Emprendimientos.astro:23-29`.
- **Solución propuesta:** no es una tarea de código — requiere que alguien del equipo redacte (o confirme) el copy real de esa sección y lo pegue en el componente, reemplazando el bloque `{/* TODO */}` + `<p>`. Es un cambio de una línea de texto una vez exista el copy aprobado.
- **Dependencia:** copy real aprobado por quien gestiona el contenido (no depende de otra tarea técnica).
- **Riesgo:** ninguno.
- **Criterio de aceptación:** el texto entre corchetes ya no aparece en ningún build; el párrafo tiene contenido real y con el mismo largo aproximado (`max-w-[34ch]`) que el diseño reserva.

### P1-2 — FeatureTrio: 2 CTAs muertos ("Descubrir", "Conocer historias")

- **Problema:** BUG-004. `ctaHref="#"` en dos de las tres tarjetas de "Ejes destacados", indistinguibles visualmente de la tarjeta que sí funciona.
- **Archivos afectados:** `src/components/sections/FeatureTrio.astro:14,23`.
- **Solución propuesta (dos caminos, no excluyentes):**
  1. Si existe o se puede armar rápido una página/sección de destino real (ej. una futura `/gastronomia` o un ancla a una sección de historias dentro de Emprendimientos), apuntar `ctaHref` ahí.
  2. Si no hay destino real todavía, quitar el CTA de esas dos tarjetas (dejarlas solo como imagen + texto editorial, sin botón) hasta que exista — mismo criterio que ya se usó para retirar los íconos sociales y los links de footer sin destino (Sprint 2.2/2.3).
- **Dependencia:** decisión de contenido (¿existe destino real o se retira el botón?). No depende de otra tarea técnica.
- **Riesgo:** bajo. Cambio acotado a 2 props de un componente ya parametrizado.
- **Criterio de aceptación:** cero `href="#"` en `FeatureTrio.astro`, salvo que se documente explícitamente por qué (mismo estándar que pide el DoD del Sprint 2).

### P1-3 — Footer: formulario de newsletter sin backend ni estado deshabilitado

- **Problema:** BUG-005. `action="#"` sin manejo, sin feedback de error/éxito, dato del usuario se pierde silenciosamente al enviar.
- **Archivos afectados:** `src/components/navigation/Footer.astro:53-74`.
- **Solución propuesta:** aplicar el mismo patrón ya usado y probado en `ContactSection.astro`/`EntradasSection.astro` — una constante `NEWSLETTER_ENDPOINT = ''`, `disabled={!ready}` en el botón de submit, y una nota breve visible cuando no está listo ("Muy pronto vas a poder suscribirte"). Si se prioriza tenerlo funcional antes, conectar a un proveedor real (Mailchimp/Buttondown/Formspree) es la única vía sin backend propio — evaluar con quien gestione el dominio de email antes de elegir proveedor (no agregar la dependencia sin decisión explícita, según reglas del proyecto).
- **Dependencia:** ninguna para la opción "deshabilitar" (se puede hacer ya); la opción "conectar proveedor real" depende de una decisión de negocio.
- **Riesgo:** bajo.
- **Criterio de aceptación:** el formulario o bien envía realmente a un endpoint válido, o bien queda deshabilitado con feedback visible — nunca un `action="#"` mudo.

### P1-4 — Sponsors: usar el logo real ya disponible en el repo

- **Problema:** de los 8 sponsors listados, el logo de la Cámara de Comercio Exterior de Jujuy **ya existe** en `recursos/EXPOJUY_Logo2026/logo_camcomext.png` y no se usa; los 8 se muestran como texto plano.
- **Archivos afectados:** `src/components/sections/Sponsors.astro`, `src/data/site.ts` (estructura de `sponsors` — hoy es `string[]`, necesitaría poder llevar un logo opcional), `src/assets/` (copiar el PNG ahí para poder usar `astro:assets`).
- **Solución propuesta:** cambiar `sponsors` de `readonly string[]` a un array de `{ name: string; logo?: ImageMetadata }`, renderizando `<Image>` cuando hay logo y el wordmark de texto actual como fallback cuando no. Migrar solo el logo de Cámara de Comercio Exterior; los otros 7 quedan como texto hasta que la organización los confirme (Sprint 5.2 sigue parcialmente bloqueado, pero ya no al 100%).
- **Dependencia:** ninguna — el asset ya está en el repo.
- **Riesgo:** bajo. Cambio de tipo + un componente, sin tocar otros consumidores de `sponsors`.
- **Criterio de aceptación:** el logo de Cámara de Comercio Exterior se renderiza como imagen real en la franja de sponsors; los 7 restantes no cambian de comportamiento.

---

## P2 — UX/UI/Responsive

### P2-1 — Página 404 sin marca

- **Problema:** BUG-006. 404 por defecto de Astro, sin header/footer/navegación de vuelta.
- **Archivos afectados:** nuevo `src/pages/404.astro`.
- **Solución propuesta:** página simple reutilizando `BaseLayout` + `Header` + `Footer`, con un mensaje corto en español y un `ButtonLink` de vuelta a `/`. No requiere lógica nueva, es composición de componentes ya existentes.
- **Dependencia:** ninguna.
- **Riesgo:** ninguno.
- **Criterio de aceptación:** `/ruta-inexistente` muestra header, footer y un CTA de vuelta a home, manteniendo el status code 404.

### P2-2 — Affordance de scroll horizontal en rails (agenda, productos, sponsors)

- **Problema:** los filtros/carruseles con `overflow-x:auto` no tienen ninguna pista visual (fade, sombra, flecha) de que hay más contenido a la derecha; en mobile, por ejemplo, el filtro "20" de la agenda por día queda fuera de la primera vista.
- **Archivos afectados:** `src/styles/global.css` (`@utility rail`), posiblemente `Emprendimientos.astro`/`AgendaSection.astro`/`Sponsors.astro` si se opta por un indicador con JS en vez de solo CSS.
- **Solución propuesta:** agregar un degradado (`mask-image` o pseudo-elemento con `linear-gradient`) en el borde derecho de cada rail que se desvanezca cuando el scroll llega al final — solución CSS pura, sin JS ni dependencias nuevas.
- **Dependencia:** ninguna.
- **Riesgo:** bajo, es un efecto puramente visual.
- **Criterio de aceptación:** en mobile, es visualmente evidente que hay más opciones de filtro fuera de la primera pantalla.

### P2-3 — axe-core en páginas interiores

- **Problema:** el barrido automatizado de accesibilidad (axe-core) solo corre sobre `/`; las 8 páginas restantes no tienen ese chequeo automatizado (sí tienen heading/alt/consola).
- **Archivos afectados:** `tests/pages.spec.ts`.
- **Solución propuesta:** extender el test parametrizado existente (ya itera las 9 rutas para heading/alt/consola) para correr también `AxeBuilder` en cada una, siguiendo el mismo patrón que ya usa `tests/homepage.spec.ts:124`.
- **Dependencia:** ninguna.
- **Riesgo:** ninguno, es agregar cobertura de test.
- **Criterio de aceptación:** las 9 rutas × 3 proyectos corren axe-core sin violaciones, igual que hoy corre para home.

---

## P3 — Polish

### P3-1 — Revisión visual manual real antes de cerrar sprint (proceso, no código)

- **Problema:** el DoD de Sprint 2.7 y 6.4 declaraba "revisión visual manual" / "QA end-to-end" como hecho, pero un bug tan visible como BUG-001 (CTA cortado en la resolución de laptop más común) no fue detectado antes de esta auditoría.
- **Archivos afectados:** ninguno — es un ajuste de proceso.
- **Solución propuesta:** al cerrar cada sprint que toque `Header.astro`/`Footer.astro`/layout global, agregar una revisión manual explícita en 3-4 anchos de escritorio intermedios (1280, 1366, 1440, 1536), no solo los presets mobile/tablet/desktop de Playwright. Podría automatizarse parcialmente con el mismo tipo de aserción usada en esta auditoría (`getBoundingClientRect` del grupo del CTA vs `innerWidth`) como test de regresión permanente.
- **Dependencia:** depende de P0-1 (una vez arreglado el header, agregar el test de regresión que lo cubra).
- **Riesgo:** ninguno.
- **Criterio de aceptación:** existe un test Playwright que falla si el CTA del header vuelve a quedar fuera del viewport en 1280-1536px.

### P3-2 — Estado "Próximamente" de Expositores/Contacto/Entradas más visual

- **Problema:** mejora opcional, no incumplimiento — los estados de espera son honestos y funcionales pero visualmente austeros (un solo bloque de texto).
- **Archivos afectados:** `src/components/sections/Expositores.astro`, `ContactSection.astro`, `EntradasSection.astro`.
- **Solución propuesta:** una vez resuelto el contenido real (fuera del alcance de este plan), no aplica. Si se quiere mejorar mientras tanto, se puede sumar un ícono/ilustración simple sin nuevas dependencias.
- **Dependencia:** ninguna, es puramente estético.
- **Riesgo:** ninguno.
- **Criterio de aceptación:** N/A — queda a criterio de diseño, no es bloqueante.

---

## Orden de ejecución sugerido

1. **P0-1** primero y solo: es el único bug que afecta a un flujo core (conversión) en el uso normal del sitio.
2. **P1-1 a P1-4** en paralelo entre sí (no se tocan los mismos archivos, salvo P1-3/P1-4 que comparten `Footer.astro`/`Sponsors.astro`-adyacentes pero no el mismo bloque — verificar diff antes de mergear ambos).
3. **P2-1 a P2-3** después, sin bloquear nada de lo anterior.
4. **P3-1/P3-2** al final, como cierre de proceso y pulido.

Ninguna tarea de este plan requiere una dependencia nueva en `package.json` ni una reescritura de componente completo — todas son cambios quirúrgicos sobre archivos existentes, consistente con la regla del proyecto de evitar refactors innecesarios.
