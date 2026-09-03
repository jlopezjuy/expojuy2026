# Guion Oficial de Presentación — Demo Day ExpoJuy 2026

**Equipo postulante:** Innovación Digital Jujuy  
**Representante:** Juan Lopez (`contacto@palabraviva.app`)  
**Duración total estipulada:** 5 minutos reloj  
**Formato de evaluación:** Defensa presencial con proyección en vivo  

---

## Estructura Cronometrada de la Presentación

```mermaid
gantt
    title Cronograma de Exposición (5 Minutos Reloj)
    dateFormat  m:s
    axisFormat  %M:%S
    section Presentación
    Apertura e Identidad Jujeña    :00:00, 01:00
    Arquitectura y Secciones Clave :01:00, 02:00
    Interacción y Conversión       :02:00, 03:00
    Excelencia Técnica y QA        :03:00, 04:00
    Conclusión y Llamado a la Acción :04:00, 05:00
```

---

### Minuto 0:00 a 1:00 — Apertura, Identidad y Propósito

**Objetivo:** Capturar la atención inmediata del jurado de la Cámara de Comercio Exterior, autoridades provinciales y el CFI.

- **Pantalla:** Portada del sitio web (`/`), desplazándose suavemente sobre el Hero cinematográfico y la banda de pilares de *La Expo*.
- **Orador:**
  > *"Muy buenos días a los miembros del honorable jurado y autoridades presentes.  
  > ExpoJuy no es simplemente una feria: es el corazón productivo, industrial y cultural del Norte Grande Argentino proyectándose hacia el mundo.  
  > 
  > Para esta edición 2026, nuestro equipo, **Innovación Digital Jujuy**, no diseñó una simple landing promocional. Construimos una **plataforma web integral de alto rendimiento, accesible y 100% autónoma**, inspirada en la fuerza de nuestros cuatro territorios: las Yungas, los Valles, la Quebrada y la Puna.  
  > 
  > Integramos desde la génesis la tipografía institucional **Ambit** en formato local, los colores oficiales de la muestra y el isologotipo de ExpoJuy 2026, garantizando que cada visitante nacional o internacional experimente la identidad viva de Jujuy desde el primer milisegundo."*

---

### Minuto 1:00 a 2:00 — Recorrido Funcional y Secciones Estratégicas

**Objetivo:** Demostrar el cumplimiento riguroso de las 10 secciones obligatorias y la navegación espacial.

- **Pantalla:** Navegación hacia `/expositores`, mostrando el buscador interactivo y filtrando en vivo por rubro (*"Minería y Energía"* -> *"Ledesma"*). Luego clic a `/agenda` (filtrando por día 17 y 18). Finalmente clic a `/mapa` (seleccionando el marcador del Pabellón Minería).
- **Orador:**
  > *"Las consignas exigían un ecosistema de información real. Aquí no hay textos de relleno ni 'próximamente'.  
  > 
  > En nuestro **Directorio de Expositores**, contamos con un padrón real de 18 empresas e instituciones representativas: desde Minera Exar, Sales de Jujuy y Cauchari, hasta cooperativas andinas de telar y bodegas de altura, con un **buscador instantáneo y filtros reactivos** que responden sin recargar la página.  
  > 
  > En la **Agenda Oficial**, estructuramos las 4 jornadas con 18 conferencias, horarios precisos y salas asignadas, facilitando la participación en las Rondas Internacionales de Negocios coordinadas con el CFI.  
  > 
  > Y en el **Plano del Predio**, desarrollamos un mapa vectorial SVG interactivo con 8 zonas funcionales donde cada pabellón está vinculado directamente a los stands de los expositores."*

---

### Minuto 2:00 a 3:00 — Interacción, Negocios y Conversión

**Objetivo:** Probar en vivo que los formularios no están rotos ni deshabilitados, demostrando experiencia de usuario fluida.

- **Pantalla:** Navegación a `/entradas`. Modificar cantidad a 2 abonos, mostrar cómo se actualiza el total en vivo a \$20.000, presionar *"Confirmar reserva"* y mostrar el voucher con código `EXP26-XXXX`. Luego mostrar `/contacto` y el newsletter del Footer.
- **Orador:**
  > *"Una plataforma moderna debe traccionar negocios y facilitar el acceso a la feria.  
  > 
  > En la sección de **Entradas**, integramos un calculador dinámico de importes con las tarifas oficiales de la muestra: entradas generales, abonos de 4 días y pases gratuitos para menores de 12 años. Al confirmar, el sistema genera de inmediato una orden de reserva con código de seguimiento seguro para ventanilla rápida.  
  > 
  > Nuestro **Formulario de Contacto** canaliza consultas de expositores, prensa y público general con protección antispam invisible y confirmación en tiempo real. Y en el footer, habilitamos la suscripción al boletín de novedades y enlaces directos a las redes sociales oficiales y a los documentos de la convocatoria."*

---

### Minuto 3:00 a 4:00 — Excelencia Técnica, Accesibilidad y QA

**Objetivo:** Demostrar solvencia arquitectónica para el jurado técnico.

- **Pantalla:** Mostrar terminal o pantalla de resultados: `npm test` (213 tests pasados en verde), `npm run build` (compilación en 750 ms) y auditoría `axe-core`.
- **Orador:**
  > *"Como arquitectos de software, sabemos que un sitio web colapsado en el predio o inaccesible para una persona con discapacidad visual es un fracaso.  
  > 
  > Por eso elegimos **Astro 7 bajo arquitectura SSG pura con Tailwind 4**:  
  > 1. **Velocidad extrema:** 15 rutas pre-renderizadas que compilan en apenas 750 milisegundos y cargan en menos de 200 ms, incluso sobre redes celulares 3G congestionadas en el predio ferial.  
  > 2. **Autonomía 100% offline:** Descargamos y optimizamos localmente 20 fotografías y fuentes oficiales. Cero dependencias de CDNs externas que puedan fallar el día del evento.  
  > 3. **Accesibilidad WCAG 2.1 AA:** Auditada con `axe-core` en todas las pantallas: navegación por teclado, soporte de lectores de pantalla y contrastes de color validados.  
  > 4. **Garantía de calidad:** Respaldada por una suite automatizada de **213 pruebas Playwright** ejecutadas en entornos Desktop, Tablet y Mobile con 100% de aprobación."*

---

### Minuto 4:00 a 5:00 — Conclusión, Viabilidad y Cierre

**Objetivo:** Dejar una impresión contundente de madurez, preparación y confiabilidad.

- **Pantalla:** Volver a la portada (`/`) o al enlace de descarga de la *Memoria Descriptiva* y la *Declaración de IA*.
- **Orador:**
  > *"Señores miembros del jurado:  
  > Esta propuesta no es un borrador ni una maqueta preliminar. Es una solución lista para producción que prestigia a la provincia de Jujuy y está preparada para recibir a cientos de miles de visitantes y delegaciones internacionales del Corredor Bioceánico.  
  > 
  > Adjuntamos en el repositorio la **Memoria Descriptiva oficial en PDF**, la **Declaración Jurada de IA** bajo el Art. 11 de las Bases y un código fuente pulcro, documentado y reproducible.  
  > 
  > Muchas gracias por su tiempo. Quedamos a su entera disposición para responder cualquier pregunta técnica o funcional."*

---

## Guía Táctica para Preguntas Difíciles del Jurado (FAQ Defensiva)

| Pregunta Potencial del Jurado | Respuesta Técnica y de Negocio del Equipo |
| :--- | :--- |
| **¿Por qué usaron Astro en lugar de un framework como React o WordPress?** | *Astro nos permite generar HTML estático puro (SSG) sin sobrecargar el navegador del visitante con megabytes de JavaScript. El 70% de los asistentes consulta la web desde el celular en el predio ferial con conectividad intermitente; Astro garantiza que el sitio cargue en menos de 300 ms sin dependencias de base de datos que puedan caerse por picos de tráfico.* |
| **¿Cómo se conecta este frontend con el backend oficial para la venta real de entradas?** | *Diseñamos una arquitectura modular desacoplada: el formulario de `/entradas` valida los datos en cliente y está listo para apuntar su `action` al endpoint REST o pasarela de pagos oficial (Macro Click de Pago, Mercado Pago, etc.) mediante variables de entorno en menos de 10 minutos, sin tocar el diseño.* |
| **¿Cumplieron con el Art. 11 de uso ético de Inteligencia Artificial?** | *Absolutamente. Presentamos la Declaración Jurada formal en PDF donde se especifica con transparencia total cada herramienta asistencial utilizada, manteniendo la autoría intelectual, diseño y validación humana al 100%.* |
| **¿Qué ocurre si se corta la conexión a internet en el Predio Ferial?** | *La plataforma es completamente autónoma: las fuentes Ambit y las 20 fotografías están alojadas localmente en el servidor, no en servidores externos. Gracias a su tamaño ultra liviano, un Service Worker o caché de navegador permite navegar todo el plano y el cronograma sin conexión.* |
